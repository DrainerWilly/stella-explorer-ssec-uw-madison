import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'
import EarthGlobe from './EarthGlobe.jsx'
import SatelliteLayer from './SatelliteLayer.jsx'
import SelectedSatelliteModel from './SelectedSatelliteModel.jsx'
import OrbitTrailLayer from './OrbitTrailLayer.jsx'
import GroundTrackLayer from './GroundTrackLayer.jsx'
import CityLabelsLayer from './CityLabelsLayer.jsx'
import { sunDirectionUnitVec, geodeticToVec3, propagateAt } from '../../utils/orbitMath.js'

function SceneContents({
  items,
  clock,
  settings,
  selectedId,
  onSelect,
  hoveredId,
  onHover,
  theme,
  reducedMotion,
  focusSignal,
  resetSignal,
}) {
  const sunRef = useRef()
  const controlsRef = useRef()
  const { camera } = useThree()

  // Camera focus animation state.
  const focus = useRef({ active: false, target: new THREE.Vector3(), t: 0 })

  // Reset camera to the default framing when requested.
  useEffect(() => {
    if (!resetSignal) return
    focus.current.active = false
    camera.position.set(0, 1.6, 6.4)
    controlsRef.current?.target.set(0, 0, 0)
    controlsRef.current?.update?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal])

  useEffect(() => {
    if (!focusSignal?.id) return
    const item = items.find((i) => i.id === focusSignal.id && i.valid)
    if (!item) return
    const s = propagateAt(item.satrec, clock.getDate())
    if (!s.ok) return
    const [x, y, z] = geodeticToVec3(s.latRad, s.lonRad, s.altKm, settings.exaggeration)
    const dir = new THREE.Vector3(x, y, z).normalize()
    // Frame the spacecraft close, so its 3D model reads large against Earth's
    // limb (NASA-Eyes style). Upper clamp still frames geostationary (TEMPO).
    const dist = THREE.MathUtils.clamp(new THREE.Vector3(x, y, z).length() + 1.6, 3.2, 55)
    const target = dir.multiplyScalar(dist)
    target.y += 0.4
    if (reducedMotion) {
      camera.position.copy(target)
      controlsRef.current?.update?.()
    } else {
      focus.current = { active: true, target, t: 0 }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusSignal])

  useFrame((_, delta) => {
    // advance the simulation clock (single driver for the whole scene)
    clock.advance(delta)

    // move the Sun (day/night terminator)
    if (sunRef.current) {
      const [sx, sy, sz] = sunDirectionUnitVec(clock.getDate())
      sunRef.current.position.set(sx * 12, sy * 12, sz * 12)
    }

    // camera focus lerp
    if (focus.current.active) {
      focus.current.t += delta
      camera.position.lerp(focus.current.target, Math.min(1, delta * 2.2))
      controlsRef.current?.update?.()
      if (focus.current.t > 1.1 || camera.position.distanceTo(focus.current.target) < 0.15) {
        focus.current.active = false
      }
    }
  })

  const starCount = settings.quality === 'high' ? 6000 : settings.quality === 'low' ? 1500 : 3500

  return (
    <>
      <ambientLight intensity={0.07} />
      <directionalLight ref={sunRef} intensity={2.1} color="#fff6e6" position={[10, 3, 6]} />
      {/* faint fill so the night side isn't pure black */}
      <hemisphereLight intensity={0.05} color="#88aaff" groundColor="#0a0a12" />

      {settings.stars && (
        <Stars
          radius={90}
          depth={50}
          count={starCount}
          factor={4}
          saturation={0}
          fade
          speed={reducedMotion ? 0 : 0.4}
        />
      )}

      <EarthGlobe
        quality={settings.quality}
        showGrid={settings.grid}
        clock={clock}
        reducedMotion={reducedMotion}
      />

      <OrbitTrailLayer
        items={items}
        clock={clock}
        exaggeration={settings.exaggeration}
        selectedId={selectedId}
        showFaintTrails={settings.trails}
        showSelectedTrail={settings.trails && Boolean(selectedId)}
      />

      <GroundTrackLayer
        selected={items.find((i) => i.id === selectedId) || null}
        clock={clock}
        show={settings.groundTrack && Boolean(selectedId)}
      />

      {/* the selected spacecraft's 3D model, floating at its orbital position */}
      {(() => {
        const sel = items.find((i) => i.id === selectedId)
        if (!sel?.valid) return null
        return (
          <Suspense fallback={null}>
            <SelectedSatelliteModel
              key={sel.id}
              item={sel}
              clock={clock}
              exaggeration={settings.exaggeration}
              reducedMotion={reducedMotion}
            />
          </Suspense>
        )
      })()}

      <CityLabelsLayer show={settings.cities} quality={settings.quality} />

      <SatelliteLayer
        items={items}
        clock={clock}
        exaggeration={settings.exaggeration}
        selectedId={selectedId}
        onSelect={onSelect}
        hoveredId={hoveredId}
        onHover={onHover}
        showAllLabels={settings.showAllLabels}
      />

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.5}
        minDistance={2.6}
        maxDistance={60}
        autoRotate={settings.earthRotation && !reducedMotion}
        autoRotateSpeed={0.35}
      />
    </>
  )
}

export default function OrbitScene(props) {
  // Mission Control is an always-dark cinematic space view.
  const bg = '#03071a'
  const maxDpr = props.maxDpr ?? 1.5
  return (
    <Canvas
      dpr={[1, maxDpr]}
      gl={{ antialias: props.settings.quality !== 'low', powerPreference: 'high-performance' }}
      camera={{ position: [0, 1.6, 6.4], fov: 42, near: 0.1, far: 600 }}
      frameloop="always"
    >
      <color attach="background" args={[bg]} />
      <SceneContents {...props} />
    </Canvas>
  )
}
