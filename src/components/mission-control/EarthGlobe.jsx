import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { EARTH_RADIUS_UNITS, surfaceVec3, DEG2RAD, sunDirectionUnitVec } from '../../utils/orbitMath.js'
import { BASE_EARTH_LAYER } from '../../data/earthLayers.js'

// Greenwich meridian is placed at +Z so the texture aligns with the same
// lon→+Z convention used for satellites and ground tracks.
const TEXTURE_ROTATION_Y = -Math.PI / 2

const BASE = import.meta.env.BASE_URL
const DAY_MAP = `${BASE}${BASE_EARTH_LAYER.file}`
const NIGHT_MAP = `${BASE}assets/nasa/earth-night.jpg`
const CLOUD_MAP = `${BASE}assets/nasa/earth-clouds.jpg`

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

export default function EarthGlobe({ quality = 'balanced', showGrid = false, clock, reducedMotion }) {
  const { camera } = useThree()
  const earthRef = useRef()
  const cloudRef = useRef()
  const [tex, setTex] = useState({ day: null, night: null, clouds: null })

  // Sun direction in view space, shared into the night-lights shader injection.
  const sunViewUniform = useRef({ value: new THREE.Vector3(1, 0, 0) })
  const _sunWorld = useRef(new THREE.Vector3()).current
  const _sunView = useRef(new THREE.Vector3()).current

  const withExtras = quality !== 'low' // night lights + clouds off on low quality

  // Load textures with the canonical TextureLoader (reliable JPEG decode).
  useEffect(() => {
    const loader = new THREE.TextureLoader()
    let disposed = false
    const created = []
    const load = (url) =>
      new Promise((resolve) => {
        loader.load(
          url,
          (t) => {
            t.colorSpace = THREE.SRGBColorSpace
            t.anisotropy = 4
            created.push(t)
            resolve(t)
          },
          undefined,
          () => resolve(null),
        )
      })

    Promise.all([load(DAY_MAP), withExtras ? load(NIGHT_MAP) : null, withExtras ? load(CLOUD_MAP) : null]).then(
      ([day, night, clouds]) => {
        if (disposed) {
          ;[day, night, clouds].forEach((t) => t && t.dispose())
          return
        }
        setTex({ day, night, clouds })
      },
    )
    return () => {
      disposed = true
      created.forEach((t) => t.dispose())
    }
  }, [withExtras])

  // Earth material: PBR day map + night-side city lights via a small injection.
  const earthMaterial = useMemo(() => {
    if (!tex.day) return null
    const mat = new THREE.MeshStandardMaterial({ map: tex.day, roughness: 0.72, metalness: 0.0 })
    if (tex.night) {
      mat.emissiveMap = tex.night
      mat.emissive = new THREE.Color(0xffffff)
      mat.emissiveIntensity = 1.0
      mat.onBeforeCompile = (shader) => {
        shader.uniforms.uSunViewDir = sunViewUniform.current
        // Show city lights only where the surface faces away from the Sun.
        shader.fragmentShader =
          'uniform vec3 uSunViewDir;\n' +
          shader.fragmentShader.replace(
            '#include <emissivemap_fragment>',
            `#include <emissivemap_fragment>
             float _sun = dot(normalize(vNormal), normalize(uSunViewDir));
             float _night = smoothstep(0.06, -0.20, _sun);
             totalEmissiveRadiance *= _night * 1.15;`,
          )
      }
    }
    return mat
  }, [tex])

  useEffect(() => () => earthMaterial?.dispose(), [earthMaterial])

  const cloudMaterial = useMemo(() => {
    if (!tex.clouds) return null
    return new THREE.MeshStandardMaterial({
      color: 0xffffff,
      alphaMap: tex.clouds,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      roughness: 1,
      metalness: 0,
    })
  }, [tex])
  useEffect(() => () => cloudMaterial?.dispose(), [cloudMaterial])

  // Atmosphere Fresnel rim glow (additive, back side).
  const atmosphereMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: { uColor: { value: new THREE.Color('#4aa3ff') } },
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          uniform vec3 uColor;
          void main() {
            float intensity = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.2);
            gl_FragColor = vec4(uColor, 1.0) * clamp(intensity, 0.0, 1.0);
          }
        `,
      }),
    [],
  )
  useEffect(() => () => atmosphereMaterial.dispose(), [atmosphereMaterial])

  const gridGeometry = useMemo(() => {
    if (!showGrid) return null
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(buildGridSegments(), 3))
    return g
  }, [showGrid])
  useEffect(() => () => gridGeometry?.dispose(), [gridGeometry])

  const segments = quality === 'high' ? 96 : quality === 'low' ? 48 : 72

  // Drive the day/night terminator + drift the clouds.
  useFrame((_, delta) => {
    if (clock) {
      const [sx, sy, sz] = sunDirectionUnitVec(clock.getDate())
      _sunWorld.set(sx, sy, sz)
      _sunView.copy(_sunWorld).transformDirection(camera.matrixWorldInverse)
      sunViewUniform.current.value.copy(_sunView)
    }
    if (cloudRef.current && !reducedMotion) cloudRef.current.rotation.y += delta * 0.005
  })

  return (
    <group>
      {/* Earth */}
      <mesh ref={earthRef} rotation={[0, TEXTURE_ROTATION_Y, 0]}>
        <sphereGeometry args={[EARTH_RADIUS_UNITS, segments, segments]} />
        {earthMaterial ? (
          <primitive object={earthMaterial} attach="material" />
        ) : (
          // Clean procedural ocean-blue fallback (NOT satellite imagery).
          <meshStandardMaterial color="#16324f" roughness={0.8} metalness={0.05} />
        )}
      </mesh>

      {/* Clouds */}
      {cloudMaterial && (
        <mesh ref={cloudRef} rotation={[0, TEXTURE_ROTATION_Y, 0]} scale={1.008}>
          <sphereGeometry args={[EARTH_RADIUS_UNITS, segments, segments]} />
          <primitive object={cloudMaterial} attach="material" />
        </mesh>
      )}

      {/* Atmosphere glow */}
      <mesh scale={1.02}>
        <sphereGeometry args={[EARTH_RADIUS_UNITS, segments, segments]} />
        <primitive object={atmosphereMaterial} attach="material" />
      </mesh>

      {/* Optional lat/lon grid */}
      {gridGeometry && (
        <lineSegments geometry={gridGeometry}>
          <lineBasicMaterial color="#7fb4ff" transparent opacity={0.25} />
        </lineSegments>
      )}
    </group>
  )
}
