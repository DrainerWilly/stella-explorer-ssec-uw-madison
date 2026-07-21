// @ts-nocheck
import { useEffect, useMemo, useRef } from 'react'
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
const MODEL_TARGET_SIZE = 0.78
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

function GltfBody({ url, envMap, targetSize = MODEL_TARGET_SIZE }) {
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

    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const longestSide = Math.max(size.x, size.y, size.z) || 1
    const scale = targetSize / longestSide
    model.scale.setScalar(scale)
    model.position.copy(center).multiplyScalar(-scale)
    return { model, materials }
  }, [scene, envMap, gl, targetSize])

  useEffect(
    () => () => {
      prepared.materials.forEach((material) => material.dispose())
    },
    [prepared],
  )

  return <primitive object={prepared.model} dispose={null} />
}

function setLocalOrbitalFrame(group, current, next) {
  _up.copy(current).normalize()
  _east.crossVectors(WORLD_UP, _up)
  if (_east.lengthSq() < 1e-6) _east.set(1, 0, 0)
  _east.normalize()

  _forward.subVectors(next, current)
  _forward.addScaledVector(_up, -_forward.dot(_up))
  if (_forward.lengthSq() < 1e-8) _forward.copy(_east)
  _forward.normalize()

  _right.crossVectors(_forward, _up).normalize()
  _basis.makeBasis(_forward, _up, _right)
  group.quaternion.setFromRotationMatrix(_basis)
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
}) {
  const posRef = useRef()
  const attitudeRef = useRef()
  const envMap = useStudioEnvMap()
  const model = getSatelliteModel(item.id)
  const url = model?.file || null
  const targetSize = model?.targetSize ?? MODEL_TARGET_SIZE

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
        setLocalOrbitalFrame(attitude, _current, _ahead)
      }
    }

  })

  if (!url) return null

  return (
    <group ref={posRef}>
      <group ref={attitudeRef} scale={modelScale}>
        <GltfBody url={url} envMap={envMap} targetSize={targetSize} />
      </group>
    </group>
  )
}
