// @ts-nocheck
import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import EarthGlobe from './EarthGlobe'
import SatelliteLayer from './SatelliteLayer'
import SelectedSatelliteModel from './SelectedSatelliteModel'
import SatelliteViewControls from './SatelliteViewControls'
import OrbitTrailLayer from './OrbitTrailLayer'
import GroundTrackLayer from './GroundTrackLayer'
import CityLabelsLayer from './CityLabelsLayer'
import { sunDirectionUnitVec } from '../../utils/orbitMath'
import { ISS_HOST_PLATFORM_ID, isIssHostedMission } from '../../data/missionCatalog'

const NASA_EYES_AUTO_ROTATE_SPEED = 0.09

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
  follow,
  resetSignal,
  modelScale = 1,
}) {
  const sunRef = useRef()
  const controlsRef = useRef()
  const { camera } = useThree()

  const selected = items.find((i) => i.id === selectedId && i.valid) || null
  // Spacecraft view: camera rides with the selected satellite (NASA Eyes).
  const followView = Boolean(follow && selected)
  const showIssHostedOnGlobe = selectedId === ISS_HOST_PLATFORM_ID
  const globeItems = useMemo(
    () => items.filter((item) => !isIssHostedMission(item.mission) || showIssHostedOnGlobe),
    [items, showIssHostedOnGlobe],
  )

  // Reset camera to the default framing when requested.
  useEffect(() => {
    if (!resetSignal) return
    camera.up.set(0, 1, 0)
    camera.position.set(0, 1.6, 6.4)
    controlsRef.current?.target.set(0, 0, 0)
    controlsRef.current?.update?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal])

  useFrame((_, delta) => {
    // advance the simulation clock (single driver for the whole scene)
    clock.advance(delta)

    // move the Sun (day/night terminator)
    if (sunRef.current) {
      const [sx, sy, sz] = sunDirectionUnitVec(clock.getDate())
      sunRef.current.position.set(sx * 12, sy * 12, sz * 12)
    }
  })

  const starCount = settings.quality === 'high' ? 6000 : settings.quality === 'low' ? 1500 : 3500

  return (
    <>
      <ambientLight intensity={0.09} />
      <directionalLight ref={sunRef} intensity={2.4} color="#fff6e6" position={[10, 3, 6]} />
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
        items={globeItems}
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
      {selected && (
        <Suspense fallback={null}>
          <SelectedSatelliteModel
            key={selected.id}
            item={selected}
            clock={clock}
            exaggeration={settings.exaggeration}
            modelScale={modelScale}
            reducedMotion={reducedMotion}
          />
        </Suspense>
      )}

      <SatelliteViewControls
        item={selected}
        clock={clock}
        exaggeration={settings.exaggeration}
        reducedMotion={reducedMotion}
        active={followView}
      />

      <CityLabelsLayer show={settings.cities && !followView} quality={settings.quality} />

      <SatelliteLayer
        items={globeItems}
        clock={clock}
        exaggeration={settings.exaggeration}
        selectedId={selectedId}
        onSelect={onSelect}
        hoveredId={hoveredId}
        onHover={onHover}
      />

      <OrbitControls
        ref={controlsRef}
        // SatelliteViewControls owns the camera in the spacecraft view; these
        // Earth-centred controls take back over when follow is off.
        enabled={!followView}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.5}
        // While a satellite is selected, the wheel resizes its model instead of
        // dollying the camera, so the Earth's apparent size stays constant.
        enableZoom={!selectedId}
        minDistance={2.6}
        maxDistance={60}
        autoRotate={settings.earthRotation && !reducedMotion && !followView}
        autoRotateSpeed={NASA_EYES_AUTO_ROTATE_SPEED}
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
      onCreated={({ gl }) => {
        gl.toneMappingExposure = 1.12 // slightly brighter filmic exposure
      }}
    >
      <color attach="background" args={[bg]} />
      <SceneContents {...props} />
    </Canvas>
  )
}
