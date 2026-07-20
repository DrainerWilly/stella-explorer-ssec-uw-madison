// @ts-nocheck
import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { propagateAt, geodeticToVec3 } from '../../utils/orbitMath'
import { getSatelliteModel } from '../../data/satelliteModels'

// Visual (symbolic) size of the spacecraft in scene units. Satellites are not
// drawn to physical scale, the same way the marker dots aren't. Normalizing
// every craft to one size keeps a cubesat and the ISS equally visible.
const MODEL_TARGET_SIZE = 0.6
const ENV_INTENSITY = 1.6 // image-based lighting strength on the spacecraft
const LOOKAHEAD_S = 45

const WORLD_UP = new THREE.Vector3(0, 1, 0)
const _current = new THREE.Vector3()
const _ahead = new THREE.Vector3()
const _up = new THREE.Vector3()
const _east = new THREE.Vector3()
const _forward = new THREE.Vector3()
const _right = new THREE.Vector3()
const _basis = new THREE.Matrix4()

// Build a studio environment (PMREM) once per renderer and reuse it. This gives
// the metallic foil / solar panels real reflections + soft fill light. It is
// applied ONLY to the spacecraft materials (never scene.environment), so the
// Earth's day/night look is completely untouched.
const envCache = new WeakMap()
function useStudioEnvMap() {
  const gl = useThree((s) => s.gl)
  return useMemo(() => {
    if (envCache.has(gl)) return envCache.get(gl)
    const pmrem = new THREE.PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    pmrem.dispose()
    envCache.set(gl, env)
    return env
  }, [gl])
}

function applyEnvMap(root, envMap) {
  root.traverse((o) => {
    if (!o.isMesh || !o.material) return
    const mats = Array.isArray(o.material) ? o.material : [o.material]
    for (const m of mats) {
      if ('envMapIntensity' in m) {
        m.envMap = envMap
        m.envMapIntensity = ENV_INTENSITY
        m.needsUpdate = true
      }
    }
  })
}

// Loads a NASA GLB, lights it with the studio env map, then centers + scales it
// to MODEL_TARGET_SIZE.
function GltfBody({ url, envMap, targetSize = MODEL_TARGET_SIZE }) {
  const { scene } = useGLTF(url)
  return useMemo(() => {
    const s = scene.clone(true)
    applyEnvMap(s, envMap)
    const box = new THREE.Box3().setFromObject(s)
    const size = box.getSize(new THREE.Vector3()).length() || 1
    const center = box.getCenter(new THREE.Vector3())
    const scale = targetSize / size
    s.scale.setScalar(scale)
    s.position.copy(center).multiplyScalar(-scale)
    return <primitive object={s} />
  }, [scene, envMap, targetSize])
}

function setLocalOrbitalFrame(group, current, next) {
  _up.copy(current).normalize()
  _east.crossVectors(WORLD_UP, _up)
  if (_east.lengthSq() < 1e-6) _east.set(1, 0, 0)
  _east.normalize()

  _forward.subVectors(next, current)
  // Keep the visual attitude tangent to the local horizon instead of pointing
  // into/out of Earth as the object follows a curved orbit.
  _forward.addScaledVector(_up, -_forward.dot(_up))
  if (_forward.lengthSq() < 1e-8) _forward.copy(_east)
  _forward.normalize()

  _right.crossVectors(_forward, _up).normalize()
  _basis.makeBasis(_forward, _up, _right)
  group.quaternion.setFromRotationMatrix(_basis)
}

// ---- detailed stylized satellite (used when NASA has no published model) -----
// Higher-fidelity generic Earth-observing spacecraft: an MLI-foil octagonal bus
// with radiators and seam ribs, large multi-segment solar arrays with a fine
// cell grid on articulated booms, a high-gain dish, a nadir telescope with
// sunshade, antennas, star trackers and a thruster cluster. Clearly labeled as a
// representative model in the mission panel.

function mat(envMap, color, metalness, roughness) {
  return { color, metalness, roughness, envMap, envMapIntensity: ENV_INTENSITY }
}

// One articulated solar wing: three celled panel segments on a boom.
function SolarWing({ side, envMap }) {
  const cell = mat(envMap, '#0e1c46', 0.4, 0.4)
  const frame = mat(envMap, '#c2c7d2', 0.9, 0.26)
  const segW = 0.94
  const segH = 0.8
  const gap = 0.06
  const segs = [0, 1, 2]
  return (
    <group position={[side * 0.62, 0, 0]}>
      {/* boom + hinge */}
      <mesh position={[side * -0.16, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.026, 0.026, 0.34, 16]} />
        <meshStandardMaterial {...frame} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.05, 0.05, 0.1, 16]} />
        <meshStandardMaterial {...mat(envMap, '#8f96a6', 0.9, 0.3)} />
      </mesh>
      {segs.map((si) => {
        const px = side * (0.2 + si * (segW + gap))
        return (
          <group key={si} position={[px, 0, 0]}>
            {/* blue cell substrate */}
            <mesh>
              <boxGeometry args={[segW, 0.018, segH]} />
              <meshStandardMaterial {...cell} />
            </mesh>
            {/* outer frame */}
            <mesh position={[0, 0.002, 0]}>
              <boxGeometry args={[segW + 0.04, 0.024, segH + 0.04]} />
              <meshStandardMaterial {...frame} wireframe />
            </mesh>
            {/* fine cell grid: vertical + horizontal metallic ribs */}
            {[-0.36, -0.18, 0, 0.18, 0.36].map((f) => (
              <mesh key={`v${f}`} position={[f * segW, 0.011, 0]}>
                <boxGeometry args={[0.01, 0.006, segH]} />
                <meshStandardMaterial {...frame} />
              </mesh>
            ))}
            {[-0.3, -0.1, 0.1, 0.3].map((f) => (
              <mesh key={`h${f}`} position={[0, 0.011, f * segH]}>
                <boxGeometry args={[segW, 0.006, 0.01]} />
                <meshStandardMaterial {...frame} />
              </mesh>
            ))}
          </group>
        )
      })}
    </group>
  )
}

function RepresentativeBody({ envMap }) {
  const foil = mat(envMap, '#caa24a', 0.62, 0.3)
  const foilDark = mat(envMap, '#8f6f2a', 0.62, 0.4)
  const metal = mat(envMap, '#c6cad2', 0.9, 0.24)
  const white = mat(envMap, '#e9edf3', 0.2, 0.55)
  const dark = mat(envMap, '#242a3a', 0.55, 0.5)
  const glass = { color: '#0a1020', metalness: 0.95, roughness: 0.12, envMap, envMapIntensity: ENV_INTENSITY }

  return (
    <group scale={0.24}>
      {/* octagonal foil-wrapped bus */}
      <mesh>
        <cylinderGeometry args={[0.52, 0.52, 1.15, 8]} />
        <meshStandardMaterial {...foil} flatShading />
      </mesh>
      {/* top + bottom deck plates */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.56, 0.54, 0.1, 8]} />
        <meshStandardMaterial {...metal} flatShading />
      </mesh>
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.54, 0.5, 0.1, 8]} />
        <meshStandardMaterial {...foilDark} flatShading />
      </mesh>
      {/* vertical seam ribs around the bus */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.sin(a) * 0.5, 0, Math.cos(a) * 0.5]} rotation={[0, a, 0]}>
            <boxGeometry args={[0.02, 1.1, 0.06]} />
            <meshStandardMaterial {...metal} />
          </mesh>
        )
      })}
      {/* two white radiator panels */}
      {[1, -1].map((s) => (
        <mesh key={s} position={[0, 0.05, s * 0.53]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.66, 0.7, 0.02]} />
          <meshStandardMaterial {...white} />
        </mesh>
      ))}

      {/* solar wings */}
      <SolarWing side={-1} envMap={envMap} />
      <SolarWing side={1} envMap={envMap} />

      {/* high-gain dish on an articulated boom */}
      <group position={[0.26, 0.78, 0.16]} rotation={[-0.6, 0.35, 0]}>
        <mesh position={[0, -0.22, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 0.4, 16]} />
          <meshStandardMaterial {...metal} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.3, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2.4]} />
          <meshStandardMaterial {...metal} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.16, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.3, 12]} />
          <meshStandardMaterial {...metal} />
        </mesh>
        <mesh position={[0, 0.31, 0]}>
          <coneGeometry args={[0.05, 0.09, 16]} />
          <meshStandardMaterial {...metal} />
        </mesh>
      </group>

      {/* nadir telescope + sunshade + radiator */}
      <group position={[0, -0.7, 0.14]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.18, 0.5, 32]} />
          <meshStandardMaterial {...dark} />
        </mesh>
        {/* sunshade ring */}
        <mesh position={[0, -0.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.16, 0.16, 32, 1, true]} />
          <meshStandardMaterial {...metal} side={THREE.DoubleSide} />
        </mesh>
        {/* dark aperture / optics */}
        <mesh position={[0, -0.36, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.02, 32]} />
          <meshStandardMaterial {...glass} />
        </mesh>
      </group>

      {/* star trackers */}
      {[[-0.34, 0.34, 0.32, 0.5, 0.4], [0.32, 0.36, 0.3, 0.4, -0.5]].map(([x, y, z, rx, ry], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[rx, ry, 0]}>
          <cylinderGeometry args={[0.06, 0.08, 0.16, 16]} />
          <meshStandardMaterial {...dark} />
        </mesh>
      ))}

      {/* antenna whips + helical GPS antenna */}
      {[[0.36, 0.55, -0.28, 0.25], [-0.36, 0.55, -0.28, -0.25]].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0, 0, r]}>
          <cylinderGeometry args={[0.007, 0.004, 0.6, 8]} />
          <meshStandardMaterial {...metal} />
        </mesh>
      ))}
      <group position={[0, 0.7, 0.18]}>
        <mesh>
          <cylinderGeometry args={[0.05, 0.05, 0.14, 20]} />
          <meshStandardMaterial {...metal} />
        </mesh>
      </group>

      {/* thruster cluster at the base */}
      {Array.from({ length: 4 }).map((_, i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4
        return (
          <mesh key={i} position={[Math.sin(a) * 0.28, -0.68, Math.cos(a) * 0.28]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.05, 0.12, 16]} />
            <meshStandardMaterial {...metal} />
          </mesh>
        )
      })}
    </group>
  )
}

// The selected spacecraft, rendered as a 3D model floating at its modeled
// orbital position on the globe (à la NASA Eyes). Moves along the orbit as the
// simulation clock advances; it holds a steady attitude rather than spinning.
export default function SelectedSatelliteModel({ item, clock, exaggeration, modelScale = 1 }) {
  const posRef = useRef() // outer group: orbital position
  const attitudeRef = useRef() // inner group: local tangent/up attitude
  const envMap = useStudioEnvMap()
  const model = getSatelliteModel(item.id)
  const url = model.file ? `${import.meta.env.BASE_URL}${model.file}` : null
  const targetSize = model.targetSize ?? MODEL_TARGET_SIZE

  useFrame(() => {
    const g = posRef.current
    const attitude = attitudeRef.current
    if (!g) return
    const date = clock.getDate()
    const s = propagateAt(item.satrec, date)
    if (!s.ok) {
      g.visible = false
      return
    }
    g.visible = true
    const [x, y, z] = geodeticToVec3(s.latRad, s.lonRad, s.altKm, exaggeration)
    g.position.set(x, y, z)

    if (attitude) {
      _current.set(x, y, z)
      const next = propagateAt(item.satrec, new Date(date.getTime() + LOOKAHEAD_S * 1000))
      if (next.ok) {
        _ahead.set(...geodeticToVec3(next.latRad, next.lonRad, next.altKm, exaggeration))
        setLocalOrbitalFrame(attitude, _current, _ahead)
      }
    }
  })

  return (
    <group ref={posRef}>
      {/* scale is driven by the scroll wheel while this mission is selected */}
      <group ref={attitudeRef} scale={modelScale}>
        {url ? (
          <GltfBody url={url} envMap={envMap} targetSize={targetSize} />
        ) : (
          <RepresentativeBody envMap={envMap} />
        )}
      </group>
    </group>
  )
}
