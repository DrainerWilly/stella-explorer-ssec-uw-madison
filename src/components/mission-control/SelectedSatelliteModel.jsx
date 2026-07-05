import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { propagateAt, geodeticToVec3 } from '../../utils/orbitMath.js'
import { getSatelliteModel } from '../../data/satelliteModels.js'

// Visual (symbolic) size of the spacecraft in scene units — satellites are not
// drawn to physical scale, the same way the marker dots aren't. Normalizing
// every craft to one size keeps a cubesat and the ISS equally visible.
const MODEL_TARGET_SIZE = 0.6
const SPIN_SPEED = 0.3 // rad/s, slow turntable feel
const ENV_INTENSITY = 1.35 // image-based lighting strength on the spacecraft

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
function GltfBody({ url, envMap }) {
  const { scene } = useGLTF(url)
  return useMemo(() => {
    const s = scene.clone(true)
    applyEnvMap(s, envMap)
    const box = new THREE.Box3().setFromObject(s)
    const size = box.getSize(new THREE.Vector3()).length() || 1
    const center = box.getCenter(new THREE.Vector3())
    const scale = MODEL_TARGET_SIZE / size
    s.scale.setScalar(scale)
    s.position.copy(center).multiplyScalar(-scale)
    return <primitive object={s} />
  }, [scene, envMap])
}

// ---- detailed stylized satellite (used when NASA has no published model) -----

function SolarWing({ side, envMap }) {
  const cellMat = { color: '#12224e', metalness: 0.35, roughness: 0.42, envMap, envMapIntensity: ENV_INTENSITY }
  const frameMat = { color: '#b8bdc7', metalness: 0.85, roughness: 0.3, envMap, envMapIntensity: ENV_INTENSITY }
  const panelW = 1.05
  const panelH = 0.66
  return (
    <group position={[side * 1.05, 0, 0]}>
      {/* yoke / boom to the bus */}
      <mesh position={[side * -0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.5, 10]} />
        <meshStandardMaterial {...frameMat} />
      </mesh>
      {/* two panel segments per wing, each a celled array */}
      {[-0.55, 0.55].map((px) => (
        <group key={px} position={[side * px, 0, 0]}>
          {/* dark blue cells */}
          <mesh>
            <boxGeometry args={[panelW, 0.02, panelH]} />
            <meshStandardMaterial {...cellMat} />
          </mesh>
          {/* frame edges */}
          <mesh>
            <boxGeometry args={[panelW + 0.03, 0.03, panelH + 0.03]} />
            <meshStandardMaterial {...frameMat} wireframe />
          </mesh>
          {/* cell grid lines (thin metallic bars) */}
          {[-0.34, 0, 0.34].map((gx) => (
            <mesh key={`v${gx}`} position={[gx * (panelW / 0.7), 0.012, 0]}>
              <boxGeometry args={[0.012, 0.005, panelH]} />
              <meshStandardMaterial {...frameMat} />
            </mesh>
          ))}
          {[-0.18, 0.18].map((gz) => (
            <mesh key={`h${gz}`} position={[0, 0.012, gz * (panelH / 0.44)]}>
              <boxGeometry args={[panelW, 0.005, 0.012]} />
              <meshStandardMaterial {...frameMat} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

// Stylized generic Earth-observing satellite: foil-wrapped bus, celled solar
// wings, high-gain dish, nadir instrument, antennas and thrusters. Clearly
// labeled as a representative model in the mission panel.
function RepresentativeBody({ envMap }) {
  const foil = { color: '#c9a24a', metalness: 0.6, roughness: 0.34, envMap, envMapIntensity: ENV_INTENSITY }
  const foilDark = { color: '#9c7a2e', metalness: 0.6, roughness: 0.4, envMap, envMapIntensity: ENV_INTENSITY }
  const metal = { color: '#c6cad2', metalness: 0.85, roughness: 0.28, envMap, envMapIntensity: ENV_INTENSITY }
  const dark = { color: '#2b3040', metalness: 0.5, roughness: 0.5, envMap, envMapIntensity: ENV_INTENSITY }

  return (
    <group scale={0.26}>
      {/* central bus — stacked foil-wrapped boxes */}
      <mesh>
        <boxGeometry args={[0.72, 0.9, 0.72]} />
        <meshStandardMaterial {...foil} />
      </mesh>
      <mesh position={[0, 0.54, 0]}>
        <boxGeometry args={[0.6, 0.22, 0.6]} />
        <meshStandardMaterial {...foilDark} />
      </mesh>
      <mesh position={[0, -0.52, 0]}>
        <boxGeometry args={[0.66, 0.16, 0.66]} />
        <meshStandardMaterial {...metal} />
      </mesh>
      {/* foil seam bands */}
      {[-0.2, 0.1].map((y) => (
        <mesh key={y} position={[0, y, 0.365]}>
          <boxGeometry args={[0.72, 0.04, 0.02]} />
          <meshStandardMaterial {...metal} />
        </mesh>
      ))}

      {/* solar wings */}
      <SolarWing side={-1} envMap={envMap} />
      <SolarWing side={1} envMap={envMap} />

      {/* high-gain dish on a boom (top) */}
      <group position={[0.28, 0.78, 0.1]} rotation={[-0.6, 0.3, 0]}>
        <mesh position={[0, -0.18, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.34, 8]} />
          <meshStandardMaterial {...metal} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.26, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2.5]} />
          <meshStandardMaterial {...metal} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.006, 0.006, 0.24, 6]} />
          <meshStandardMaterial {...metal} />
        </mesh>
      </group>

      {/* nadir-facing instrument package (bottom) */}
      <group position={[0, -0.66, 0.12]}>
        <mesh>
          <boxGeometry args={[0.34, 0.24, 0.28]} />
          <meshStandardMaterial {...dark} />
        </mesh>
        {/* lens / aperture */}
        <mesh position={[0, -0.14, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.11, 0.1, 20]} />
          <meshStandardMaterial color="#0b1220" metalness={0.9} roughness={0.15} envMap={envMap} envMapIntensity={ENV_INTENSITY} />
        </mesh>
      </group>

      {/* star tracker + small antenna whips */}
      <mesh position={[-0.28, 0.36, 0.3]} rotation={[0.5, 0.4, 0]}>
        <boxGeometry args={[0.12, 0.12, 0.16]} />
        <meshStandardMaterial {...dark} />
      </mesh>
      {[[0.34, 0.5, -0.3, 0.3], [-0.34, 0.5, -0.3, -0.3]].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0, 0, r]}>
          <cylinderGeometry args={[0.008, 0.008, 0.5, 6]} />
          <meshStandardMaterial {...metal} />
        </mesh>
      ))}

      {/* thrusters at the base */}
      {[[-0.22, -0.62, -0.22], [0.22, -0.62, -0.22], [0, -0.62, 0.24]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.05, 0.1, 12]} />
          <meshStandardMaterial {...metal} />
        </mesh>
      ))}
    </group>
  )
}

// The selected spacecraft, rendered as a 3D model floating at its modeled
// orbital position on the globe (à la NASA Eyes). Moves along the orbit as the
// simulation clock advances and gently rotates for legibility.
export default function SelectedSatelliteModel({ item, clock, exaggeration, reducedMotion }) {
  const posRef = useRef() // outer group: orbital position
  const spinRef = useRef() // inner group: rotation
  const envMap = useStudioEnvMap()
  const model = getSatelliteModel(item.id)
  const url = model.file ? `${import.meta.env.BASE_URL}${model.file}` : null

  useFrame((_, delta) => {
    const g = posRef.current
    if (!g) return
    const s = propagateAt(item.satrec, clock.getDate())
    if (!s.ok) {
      g.visible = false
      return
    }
    g.visible = true
    const [x, y, z] = geodeticToVec3(s.latRad, s.lonRad, s.altKm, exaggeration)
    g.position.set(x, y, z)
    if (spinRef.current && !reducedMotion) spinRef.current.rotation.y += delta * SPIN_SPEED
  })

  return (
    <group ref={posRef}>
      <group ref={spinRef}>
        {url ? <GltfBody url={url} envMap={envMap} /> : <RepresentativeBody envMap={envMap} />}
      </group>
    </group>
  )
}
