// @ts-nocheck
import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { EARTH_RADIUS_UNITS, surfaceVec3, DEG2RAD, sunDirectionUnitVec } from '../../utils/orbitMath'

// The visible surface uses NASA Goddard's Blue Marble 2015 VIIRS composite,
// converted from the official 10,800 × 5,400 master into this globe's six-face
// projection. Supporting terrain-normal, ocean-specular and night-light maps
// remain the aligned public assets from NASA Eyes on the Earth.
const BLUE_MARBLE_2015_ROOT = `${import.meta.env.BASE_URL}assets/earth/blue-marble-2015`
const NASA_EYES_EARTH_ROOT = 'https://eyes.nasa.gov/assets/static/maps/earth'
const FACE_IDS = [0, 1, 2, 3, 4, 5]

function faceTextureUrl(layer, size, face) {
  if (layer === 'color') return `${BLUE_MARBLE_2015_ROOT}/color_${size}_${face}.webp`
  return `${NASA_EYES_EARTH_ROOT}/${layer}_${size}_${face}.png`
}

// NASA Eyes face order:
//   0 Greenwich/Africa, 1 Asia, 2 Pacific, 3 Americas, 4 north, 5 south.
// Each face is projected from a cube onto the sphere. The mappings below keep
// the image edges continuous and use the same lon 0 → +Z convention as the
// orbit calculations in orbitMath.
function cubePoint(face, s, t) {
  switch (face) {
    case 0:
      return [s, t, 1]
    case 1:
      return [1, t, -s]
    case 2:
      return [-s, t, -1]
    case 3:
      return [-1, t, s]
    case 4:
      return [s, 1, -t]
    default:
      return [s, -1, t]
  }
}

function buildCubeSphereFace(face, segments) {
  const positions = []
  const normals = []
  const uvs = []
  const indices = []

  for (let y = 0; y <= segments; y += 1) {
    const imageV = y / segments
    const t = 1 - imageV * 2
    for (let x = 0; x <= segments; x += 1) {
      const u = x / segments
      const s = u * 2 - 1
      const [px, py, pz] = cubePoint(face, s, t)
      const invLength = 1 / Math.hypot(px, py, pz)
      const nx = px * invLength
      const ny = py * invLength
      const nz = pz * invLength
      positions.push(nx * EARTH_RADIUS_UNITS, ny * EARTH_RADIUS_UNITS, nz * EARTH_RADIUS_UNITS)
      normals.push(nx, ny, nz)
      // TextureLoader flips DOM images into WebGL's UV convention, so the top
      // image row maps to v=1.
      uvs.push(u, 1 - imageV)
    }
  }

  const row = segments + 1
  for (let y = 0; y < segments; y += 1) {
    for (let x = 0; x < segments; x += 1) {
      const a = y * row + x
      const b = a + 1
      const c = a + row
      const d = c + 1
      // Source images run top-to-bottom, which makes the default winding face
      // inward. Reverse it so normals and culling point away from Earth.
      indices.push(a, c, b, b, c, d)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeBoundingSphere()
  return geometry
}

// Build a single LineSegments buffer for the lat/lon grid (one draw call).
function buildGridSegments() {
  const pts = []
  const push = (a, b) => pts.push(a[0], a[1], a[2], b[0], b[1], b[2])
  const lift = 0.004
  for (const latDeg of [-60, -30, 0, 30, 60]) {
    const lat = latDeg * DEG2RAD
    for (let i = 0; i < 96; i++) {
      const lon0 = (i / 96) * 2 * Math.PI - Math.PI
      const lon1 = ((i + 1) / 96) * 2 * Math.PI - Math.PI
      push(surfaceVec3(lat, lon0, lift), surfaceVec3(lat, lon1, lift))
    }
  }
  for (let m = 0; m < 12; m++) {
    const lon = (m / 12) * 2 * Math.PI - Math.PI
    for (let i = 0; i < 96; i++) {
      const lat0 = (i / 96) * Math.PI - Math.PI / 2
      const lat1 = ((i + 1) / 96) * Math.PI - Math.PI / 2
      push(surfaceVec3(lat0, lon, lift), surfaceVec3(lat1, lon, lift))
    }
  }
  return new Float32Array(pts)
}

// `cloudDrift` slowly spins the cloud shell relative to the surface. It is a
// decorative flourish for the home-page hero (where the whole globe is already
// spinning). It is OFF by default: this globe is drawn in an Earth-FIXED frame,
// so the surface is deliberately static and a drifting cloud layer would look
// detached. It is also driven by render time, not the simulation clock, so it
// must never be used anywhere the sim clock can be paused or time-warped.
export default function EarthGlobe({
  quality = 'balanced',
  showGrid = false,
  clock,
  reducedMotion,
  cloudDrift = false,
}) {
  const { camera, gl } = useThree()
  const cloudRef = useRef()
  const [tex, setTex] = useState({ day: null, night: null, clouds: null, normal: null, specular: null })

  // Sun direction used to keep night lights behind the simulated terminator.
  const sunViewUniform = useRef({ value: new THREE.Vector3(1, 0, 0) })
  const _sunWorld = useRef(new THREE.Vector3()).current
  const _sunView = useRef(new THREE.Vector3()).current

  const withExtras = quality !== 'low'
  const colorTextureSize = quality === 'low' ? 512 : 2048
  const materialTextureSize = quality === 'high' ? 2048 : 512

  // Load the color faces first so the planet appears promptly. The aligned
  // normal, ocean-specular, night-light, and cloud faces follow independently;
  // a failed optional layer never prevents the globe itself from rendering.
  useEffect(() => {
    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')
    const maxAniso = gl.capabilities.getMaxAnisotropy?.() ?? 8
    const aniso = Math.min(16, maxAniso)
    let disposed = false
    const created = []
    const load = (url, color = false) =>
      new Promise((resolve) => {
        loader.load(
          url,
          (t) => {
            t.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace
            t.anisotropy = aniso
            t.wrapS = THREE.ClampToEdgeWrapping
            t.wrapT = THREE.ClampToEdgeWrapping
            created.push(t)
            resolve(t)
          },
          undefined,
          () => resolve(null),
        )
      })
    const loadSet = (layer, size, color = false) =>
      Promise.all(FACE_IDS.map((face) => load(faceTextureUrl(layer, size, face), color))).then(
        (faces) => (faces.every(Boolean) ? faces : null),
      )

    setTex({ day: null, night: null, clouds: null, normal: null, specular: null })
    // Show the optimized 512px Blue Marble set immediately, then swap to its
    // 2048px tier on balanced/high displays.
    loadSet('color', 512, true).then((day) => {
      if (!disposed && day) setTex((current) => (current.day ? current : { ...current, day }))
    })

    if (colorTextureSize > 512) {
      loadSet('color', colorTextureSize, true).then((day) => {
        if (!disposed && day) setTex((current) => ({ ...current, day }))
      })
    }

    if (withExtras) {
      loadSet('night', materialTextureSize, true).then((night) => {
        if (!disposed) setTex((current) => ({ ...current, night }))
      })
      // Blue Marble 2015 already contains the VIIRS cloud field captured on
      // October 14, 2015. Do not add the separate Eyes cloud shell on top.
      loadSet('normal', materialTextureSize).then((normal) => {
        if (!disposed) setTex((current) => ({ ...current, normal }))
      })
      loadSet('specular', materialTextureSize).then((specular) => {
        if (!disposed) setTex((current) => ({ ...current, specular }))
      })
    }

    return () => {
      disposed = true
      created.forEach((t) => t.dispose())
    }
  }, [colorTextureSize, materialTextureSize, withExtras, gl])

  // One PBR material per cube-sphere face. NASA's specular mask is bright over
  // water and dark over land, while Three's roughness convention is the inverse;
  // the shader patch performs that single channel inversion. Night lights are
  // then restricted to the physically dark side of the simulated terminator.
  const earthMaterials = useMemo(() => {
    if (!tex.day) return null
    return FACE_IDS.map((face) => {
      const mat = new THREE.MeshStandardMaterial({
        map: tex.day[face],
        normalMap: tex.normal?.[face] || null,
        normalScale: new THREE.Vector2(0.42, 0.42),
        roughness: 0.92,
        roughnessMap: tex.specular?.[face] || null,
        metalness: 0,
        emissive: tex.night ? new THREE.Color(0xffffff) : new THREE.Color(0x000000),
        emissiveMap: tex.night?.[face] || null,
        emissiveIntensity: tex.night ? 1.1 : 0,
      })
      mat.onBeforeCompile = (shader) => {
        shader.uniforms.uSunViewDir = sunViewUniform.current
        shader.fragmentShader =
          'uniform vec3 uSunViewDir;\n' +
          shader.fragmentShader
            .replace(
              '#include <roughnessmap_fragment>',
              `float roughnessFactor = roughness;
               #ifdef USE_ROUGHNESSMAP
                 vec4 texelRoughness = texture2D(roughnessMap, vRoughnessMapUv);
                 roughnessFactor *= clamp(1.0 - texelRoughness.g, 0.08, 1.0);
               #endif`,
            )
            .replace(
              '#include <emissivemap_fragment>',
              `#include <emissivemap_fragment>
               float _sun = dot(normalize(vNormal), normalize(uSunViewDir));
               float _night = smoothstep(0.06, -0.20, _sun);
               totalEmissiveRadiance *= _night * 1.18;`,
            )
      }
      mat.customProgramCacheKey = () => `nasa-eyes-earth-${Boolean(tex.specular)}-${Boolean(tex.night)}`
      return mat
    })
  }, [tex.day, tex.night, tex.normal, tex.specular])
  useEffect(() => () => earthMaterials?.forEach((material) => material.dispose()), [earthMaterials])

  const cloudMaterials = useMemo(() => {
    if (!tex.clouds) return null
    return FACE_IDS.map(
      (face) =>
        new THREE.MeshStandardMaterial({
          map: tex.clouds[face],
          color: 0xffffff,
          transparent: true,
          opacity: 0.82,
          alphaTest: 0.012,
          depthWrite: false,
          roughness: 1,
          metalness: 0,
        }),
    )
  }, [tex.clouds])
  useEffect(() => () => cloudMaterials?.forEach((material) => material.dispose()), [cloudMaterials])

  const gridGeometry = useMemo(() => {
    if (!showGrid) return null
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(buildGridSegments(), 3))
    return g
  }, [showGrid])
  useEffect(() => () => gridGeometry?.dispose(), [gridGeometry])

  const segments = quality === 'high' ? 128 : quality === 'low' ? 64 : 96
  const faceGeometries = useMemo(
    () => FACE_IDS.map((face) => buildCubeSphereFace(face, segments)),
    [segments],
  )
  useEffect(() => () => faceGeometries.forEach((geometry) => geometry.dispose()), [faceGeometries])

  // Drive the day/night terminator from the sim clock, and optionally drift the
  // decorative cloud shell (see the cloudDrift note above).
  useFrame((_, delta) => {
    if (clock) {
      const [sx, sy, sz] = sunDirectionUnitVec(clock.getDate())
      _sunWorld.set(sx, sy, sz)
      _sunView.copy(_sunWorld).transformDirection(camera.matrixWorldInverse)
      sunViewUniform.current.value.copy(_sunView)
    }
    if (cloudDrift && cloudRef.current && !reducedMotion) {
      cloudRef.current.rotation.y += delta * 0.005
    }
  })

  return (
    <group>
      {/* Blue Marble 2015 cube-sphere surface with aligned supporting relief,
          water-specular and night-light material maps. */}
      {earthMaterials ? (
        <group>
          {FACE_IDS.map((face) => (
            <mesh key={face} geometry={faceGeometries[face]} material={earthMaterials[face]} />
          ))}
        </group>
      ) : (
        // Clean procedural ocean-blue fallback (not satellite imagery).
        <mesh>
          <sphereGeometry args={[EARTH_RADIUS_UNITS, segments, segments]} />
          <meshStandardMaterial color="#102f55" roughness={0.78} metalness={0.02} />
        </mesh>
      )}

      {/* Optional cloud shell for callers supplying a cloud-free color layer.
          Blue Marble 2015 includes clouds, so this stays absent here. */}
      {cloudMaterials && (
        <group ref={cloudRef} scale={1.0085}>
          {FACE_IDS.map((face) => (
            <mesh key={face} geometry={faceGeometries[face]} material={cloudMaterials[face]} />
          ))}
        </group>
      )}

      {/* Optional lat/lon grid */}
      {gridGeometry && (
        <lineSegments geometry={gridGeometry}>
          <lineBasicMaterial color="#7fb4ff" transparent opacity={0.25} />
        </lineSegments>
      )}
    </group>
  )
}
