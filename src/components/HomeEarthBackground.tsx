// @ts-nocheck
import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import EarthGlobe from './mission-control/EarthGlobe'
import { sunDirectionUnitVec } from '../utils/orbitMath'
import useReducedMotion from '../hooks/useReducedMotion'

// A real-time clock so EarthGlobe renders the current day/night terminator.
const realClock = { getDate: () => new Date() }

function SpinningEarth({ reducedMotion }) {
  const ref = useRef()
  useFrame((_, delta) => {
    if (ref.current && !reducedMotion) ref.current.rotation.y += delta * 0.028
  })
  // Offset + tilted so the planet sits large and low-right, cinematic-style.
  return (
    <group position={[1.15, -0.75, 0]} scale={1.4}>
      <group ref={ref} rotation={[0.38, 0, 0.12]}>
        <EarthGlobe quality="high" clock={realClock} />
      </group>
    </group>
  )
}

// Live 3D Earth for the home hero background: the same photoreal globe used in
// Mission Control (Blue Marble day and city lights at night), slowly rotating
// over a starfield. Non-interactive.
export default function HomeEarthBackground() {
  const reducedMotion = useReducedMotion()
  const sun = useMemo(() => sunDirectionUnitVec(new Date()), [])

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 6.2], fov: 40, near: 0.1, far: 100 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      style={{ pointerEvents: 'none' }}
    >
      <color attach="background" args={['#03071a']} />
      <ambientLight intensity={0.1} />
      <directionalLight
        position={[sun[0] * 10, sun[1] * 10 + 1.5, sun[2] * 10]}
        intensity={2.3}
        color="#fff4e0"
      />
      <hemisphereLight intensity={0.06} color="#5a7cff" groundColor="#050914" />

      <Stars radius={80} depth={40} count={4200} factor={4} saturation={0} fade speed={reducedMotion ? 0 : 0.25} />

      <Suspense fallback={null}>
        <SpinningEarth reducedMotion={reducedMotion} />
      </Suspense>
    </Canvas>
  )
}
