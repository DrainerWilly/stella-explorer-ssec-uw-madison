// @ts-nocheck
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'
import { propagateAt, geodeticToVec3 } from '../../utils/orbitMath'
import { getSatelliteModel, PRIORITY_MODEL_URLS } from '../../data/satelliteModels'

// Models are symbolic rather than physically scaled, matching NASA Eyes. Use
// the longest bounding-box dimension so wide solar arrays remain legible rather
// than being excessively reduced by a diagonal-length normalization.
// The official geometry is intentionally symbolic, but it should remain a
// modest foreground subject like NASA Eyes—not dominate the Earth viewport.
const MODEL_TARGET_SIZE = 0.045
const ENV_INTENSITY = 1.35
const LOOKAHEAD_S = 45
const BASIS_TRANSCODER_PATH = `${import.meta.env.BASE_URL}assets/basis/`

const WORLD_UP = new THREE.Vector3(0, 1, 0)
const _current = new THREE.Vector3()
const _ahead = new THREE.Vector3()
const _up = new THREE.Vector3()
const _east = new THREE.Vector3()
const _forward = new THREE.Vector3()
const _right = new THREE.Vector3()
const _basis = new THREE.Matrix4()
const _previousProjected = new THREE.Vector3()

let framingRevision = 0

export type SelectedSatelliteFraming = {
  id: string
  root: THREE.Object3D
  box: THREE.Box3
  sphere: THREE.Sphere
  corners: THREE.Vector3[]
  revision: number
}

const envCache = new WeakMap()
const ktx2LoaderCache = new WeakMap()

function getKtx2Loader(gl) {
  if (ktx2LoaderCache.has(gl)) return ktx2LoaderCache.get(gl)
  const loader = new KTX2Loader()
  loader.setTranscoderPath(BASIS_TRANSCODER_PATH)
  loader.detectSupport(gl)
  ktx2LoaderCache.set(gl, loader)
  return loader
}

function useStudioEnvMap() {
  const gl = useThree((state) => state.gl)
  return useMemo(() => {
    if (envCache.has(gl)) return envCache.get(gl)
    const pmrem = new THREE.PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    pmrem.dispose()
    envCache.set(gl, env)
    return env
  }, [gl])
}

function prepareNasaModel(root, envMap, maxAnisotropy) {
  const materialCache = new Map()
  const cloneMaterial = (source) => {
    if (materialCache.has(source)) return materialCache.get(source)
    const material = source.clone()
    if ('envMapIntensity' in material) {
      material.envMap = envMap
      material.envMapIntensity = ENV_INTENSITY
    }
    for (const key of [
      'map',
      'normalMap',
      'roughnessMap',
      'metalnessMap',
      'aoMap',
      'emissiveMap',
      'alphaMap',
    ]) {
      const texture = material[key]
      if (texture) texture.anisotropy = Math.min(16, maxAnisotropy)
    }
    material.needsUpdate = true
    materialCache.set(source, material)
    return material
  }

  root.traverse((object) => {
    if (!object.isMesh || !object.material) return
    object.castShadow = false
    object.receiveShadow = false

    const sourceMaterials = Array.isArray(object.material) ? object.material : [object.material]
    const materials = sourceMaterials.map(cloneMaterial)
    object.material = Array.isArray(object.material) ? materials : materials[0]
  })
  return [...materialCache.values()]
}

function hasVisibleHierarchy(object, root) {
  let current = object
  while (current) {
    if (!current.visible) return false
    if (current === root) break
    current = current.parent
  }
  return true
}

function hasVisibleMaterial(object) {
  if (!object.material) return false
  const materials = Array.isArray(object.material) ? object.material : [object.material]
  return materials.some(
    (material) =>
      material &&
      material.visible !== false &&
      !(material.transparent && material.opacity <= 0.001),
  )
}

// Box3.setFromObject() also considers lines, points, helpers, and hidden
// authored nodes. Camera fitting must only describe geometry a visitor can
// actually see, otherwise a stray helper can make a spacecraft microscopic.
function getRenderableMeshBox(root) {
  root.updateMatrixWorld(true)
  const box = new THREE.Box3().makeEmpty()
  const meshBox = new THREE.Box3()

  root.traverse((object) => {
    if (!object.isMesh || !object.geometry) return
    if (!hasVisibleHierarchy(object, root) || !hasVisibleMaterial(object)) return
    if (object.geometry.drawRange?.count === 0) return

    if (!object.geometry.boundingBox) object.geometry.computeBoundingBox()
    if (!object.geometry.boundingBox || object.geometry.boundingBox.isEmpty()) return

    meshBox.copy(object.geometry.boundingBox).applyMatrix4(object.matrixWorld)
    box.union(meshBox)
  })

  return box
}

function getBoxAxis(index) {
  if (index === 0) return new THREE.Vector3(1, 0, 0)
  if (index === 1) return new THREE.Vector3(0, 1, 0)
  return new THREE.Vector3(0, 0, 1)
}

function getPresentationQuaternion(size) {
  const dimensions = [size.x, size.y, size.z]
  const rankedAxes = [0, 1, 2].sort((a, b) => dimensions[a] - dimensions[b])
  const sourceUp = getBoxAxis(rankedAxes[0])
  const sourceRight = getBoxAxis(rankedAxes[2])

  // local X/Y/Z represent flight-forward/radial-up/cross-track-right. The
  // cross product deliberately chooses the sign of the remaining authored
  // axis, producing a proper right-handed rotation rather than a reflection.
  const sourceForward = new THREE.Vector3().crossVectors(sourceUp, sourceRight).normalize()
  const sourceBasis = new THREE.Matrix4().makeBasis(sourceForward, sourceUp, sourceRight)
  const authoredToPresentation = sourceBasis.clone().invert()
  return new THREE.Quaternion().setFromRotationMatrix(authoredToPresentation)
}

function getBoxCorners(box) {
  const corners = []
  for (const x of [box.min.x, box.max.x]) {
    for (const y of [box.min.y, box.max.y]) {
      for (const z of [box.min.z, box.max.z]) corners.push(new THREE.Vector3(x, y, z))
    }
  }
  return corners
}

function GltfBody({ url, envMap, presentationYaw = 0, onPrepared }) {
  const gl = useThree((state) => state.gl)
  const ktx2Loader = useMemo(() => getKtx2Loader(gl), [gl])
  const configureLoader = useMemo(
    () => (loader) => loader.setKTX2Loader(ktx2Loader),
    [ktx2Loader],
  )
  const { scene } = useGLTF(url, true, true, configureLoader)

  const prepared = useMemo(() => {
    const model = scene.clone(true)
    const materials = prepareNasaModel(
      model,
      envMap,
      gl.capabilities.getMaxAnisotropy?.() ?? 8,
    )

    const box = getRenderableMeshBox(model)
    if (box.isEmpty()) {
      return {
        root: model,
        materials,
        frame: {
          box: new THREE.Box3(),
          sphere: new THREE.Sphere(),
          corners: [],
        },
      }
    }

    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const longestSide = Math.max(size.x, size.y, size.z) || 1
    const presentation = new THREE.Group()
    presentation.name = 'selected-spacecraft-presentation'

    model.position.sub(center)
    presentation.quaternion.copy(getPresentationQuaternion(size))
    if (presentationYaw) {
      presentation.quaternion.premultiply(
        new THREE.Quaternion().setFromAxisAngle(WORLD_UP, presentationYaw),
      )
    }
    presentation.scale.setScalar(MODEL_TARGET_SIZE / longestSide)
    presentation.add(model)
    presentation.updateMatrixWorld(true)

    const normalizedBox = getRenderableMeshBox(presentation)
    const normalizedSphere = normalizedBox.getBoundingSphere(new THREE.Sphere())
    const corners = getBoxCorners(normalizedBox)

    return {
      root: presentation,
      materials,
      frame: {
        box: normalizedBox.clone(),
        sphere: normalizedSphere.clone(),
        corners: corners.map((corner) => corner.clone()),
      },
    }
  }, [scene, envMap, gl, presentationYaw])

  useEffect(() => {
    onPrepared?.(prepared.frame)
  }, [onPrepared, prepared])

  useEffect(
    () => () => {
      prepared.materials.forEach((material) => material.dispose())
    },
    [prepared],
  )

  return <primitive object={prepared.root} dispose={null} />
}

function setLocalOrbitalFrame(group, current, next, previousForward, hasPreviousForward) {
  _up.copy(current).normalize()

  _forward.subVectors(next, current)
  _forward.addScaledVector(_up, -_forward.dot(_up))

  _previousProjected.copy(previousForward)
  _previousProjected.addScaledVector(_up, -_previousProjected.dot(_up))

  if (_forward.lengthSq() < 1e-8) {
    if (hasPreviousForward && _previousProjected.lengthSq() >= 1e-8) {
      _forward.copy(_previousProjected)
    } else {
      _east.crossVectors(WORLD_UP, _up)
      if (_east.lengthSq() < 1e-6) _east.set(1, 0, 0)
      _forward.copy(_east)
    }
  }
  _forward.normalize()

  // The propagated look-ahead direction can become numerically ambiguous at
  // a pole. Preserve sign continuity so the selected craft never flips 180°.
  if (
    hasPreviousForward &&
    _previousProjected.lengthSq() >= 1e-8 &&
    _forward.dot(_previousProjected) < 0
  ) {
    _forward.negate()
  }

  _right.crossVectors(_forward, _up).normalize()
  _basis.makeBasis(_forward, _up, _right)
  group.quaternion.setFromRotationMatrix(_basis)
  previousForward.copy(_forward)
  return true
}

// Begin the detailed ISS package after the scene has settled. The official
// NASA Eyes model is substantially richer than the former procedural stand-in;
// idle preloading keeps selection responsive without blocking the globe.
export function preloadPrioritySatelliteModels() {
  PRIORITY_MODEL_URLS.forEach((url) => useGLTF.preload(url))
}

export default function SelectedSatelliteModel({
  item,
  clock,
  exaggeration,
  modelScale = 1,
  framingRef = null,
}) {
  const posRef = useRef()
  const attitudeRef = useRef()
  const previousForwardRef = useRef(new THREE.Vector3())
  const hasPreviousForwardRef = useRef(false)
  const publishedRevisionRef = useRef(0)
  const envMap = useStudioEnvMap()
  const model = getSatelliteModel(item.id)
  const url = model?.file || null

  const publishFrame = useCallback(
    (frame) => {
      const root = attitudeRef.current
      if (!framingRef || !root || !frame || frame.box.isEmpty()) return

      const revision = ++framingRevision
      publishedRevisionRef.current = revision
      framingRef.current = {
        id: item.id,
        root,
        box: frame.box.clone(),
        sphere: frame.sphere.clone(),
        corners: frame.corners.map((corner) => corner.clone()),
        revision,
      }
    },
    [framingRef, item.id],
  )

  useEffect(
    () => () => {
      if (
        framingRef?.current?.id === item.id &&
        framingRef.current.revision === publishedRevisionRef.current
      ) {
        framingRef.current = null
      }
    },
    [framingRef, item.id],
  )

  useFrame(() => {
    const group = posRef.current
    const attitude = attitudeRef.current
    if (!group) return

    const date = clock.getDate()
    const position = propagateAt(item.satrec, date)
    if (!position.ok) {
      group.visible = false
      return
    }

    group.visible = true
    const [x, y, z] = geodeticToVec3(
      position.latRad,
      position.lonRad,
      position.altKm,
      exaggeration,
    )
    group.position.set(x, y, z)

    if (attitude) {
      _current.set(x, y, z)
      const next = propagateAt(item.satrec, new Date(date.getTime() + LOOKAHEAD_S * 1000))
      if (next.ok) {
        _ahead.set(...geodeticToVec3(next.latRad, next.lonRad, next.altKm, exaggeration))
        hasPreviousForwardRef.current = setLocalOrbitalFrame(
          attitude,
          _current,
          _ahead,
          previousForwardRef.current,
          hasPreviousForwardRef.current,
        )
      }
    }

  })

  if (!url) return null

  return (
    <group ref={posRef}>
      <group ref={attitudeRef} scale={modelScale}>
        <GltfBody
          url={url}
          envMap={envMap}
          presentationYaw={model?.presentationYaw}
          onPrepared={publishFrame}
        />
      </group>
    </group>
  )
}
