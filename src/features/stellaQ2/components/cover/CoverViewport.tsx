import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { TOP_HOUSING_STL_URL } from '../../data/enclosure'
import { BOTTOM_COVER_TARGET, COVER_LATCHES } from '../../data/coverInstallation'
import { ROUTING_REGIONS } from '../../data/routing'
import type { BottomCoverState, CableConnectionState, CableRouteState, CoverCameraPreset, CoverLatchId, CoverLatchInstallation, EnclosurePlacement, RetainerInstallation } from '../../types'
import { Components, InstalledRetainers, RouteLines, SourceMesh } from '../routing/RoutingViewport'

function CameraDirector({ preset, resetCount }: { preset: CoverCameraPreset; resetCount: number }) {
  const { camera } = useThree()
  useEffect(() => {
    const positions: Record<CoverCameraPreset, [number, number, number]> = {
      fit: [2.8, 3.2, 4.8], cover: [3.1, .4, 3.2], top: [0, 5.2, .01], bottom: [0, -5.2, .01],
      front: [0, .2, 5.2], rear: [0, .2, -5.2], left: [-5.2, .2, .01], right: [5.2, .2, .01],
      'front-latches': [2.4, -2.7, 2.1], 'rear-latches': [-2.4, 2.7, 2.1], interior: [1.7, 2.8, 3.1],
    }
    camera.position.set(...positions[preset])
    camera.up.set(0, 1, 0)
    camera.lookAt(0, 0, 0)
  }, [camera, preset, resetCount])
  return null
}

function MatingPerimeter() {
  return <group position={[0, 0, .16]}>
    <mesh position={[-.305, 0, 0]}><boxGeometry args={[.02, 1.72, .018]} /><meshBasicMaterial color="#22d3ee" /></mesh>
    <mesh position={[.305, 0, 0]}><boxGeometry args={[.02, 1.72, .018]} /><meshBasicMaterial color="#22d3ee" /></mesh>
    <mesh position={[0, -.86, 0]}><boxGeometry args={[.63, .02, .018]} /><meshBasicMaterial color="#22d3ee" /></mesh>
    <mesh position={[0, .86, 0]}><boxGeometry args={[.63, .02, .018]} /><meshBasicMaterial color="#22d3ee" /></mesh>
  </group>
}

function LatchTargets({ latches, selected }: { latches: CoverLatchInstallation[]; selected: CoverLatchId | null }) {
  return <group>{COVER_LATCHES.map((definition) => {
    const state = latches.find((item) => item.latchId === definition.id)?.state ?? 'disengaged'
    const color = state === 'engaged' ? '#34d399' : state === 'aligned' ? '#fbbf24' : '#fb7185'
    return <group key={definition.id} position={[definition.positionMm[0] * .01, definition.positionMm[1] * .01, definition.positionMm[2] * .01]}>
      <mesh><boxGeometry args={[selected === definition.id ? .075 : .055, .17, .055]} /><meshBasicMaterial color={color} transparent opacity={selected === definition.id ? .9 : .55} wireframe /></mesh>
    </group>
  })}</group>
}

function ClearanceRegions() {
  const regions = ROUTING_REGIONS.filter((region) => region.type === 'cover-contact')
  return <group>
    {regions.map((region) => {
      const [x0,x1,y0,y1,z0,z1] = region.boundsMm
      return <mesh key={region.id} position={[(x0+x1)*.005,(y0+y1)*.005,(z0+z1)*.005]}><boxGeometry args={[(x1-x0)*.01,(y1-y0)*.01,(z1-z0)*.01]} /><meshBasicMaterial color="#fb7185" transparent opacity={.13} depthWrite={false} wireframe /></mesh>
    })}
    {COVER_LATCHES.map((definition) => {
      const [x0,x1,y0,y1,z0,z1] = definition.housingFeatureBoundsMm
      return <mesh key={definition.id} position={[(x0+x1)*.005,(y0+y1)*.005,(z0+z1)*.005]}><boxGeometry args={[(x1-x0)*.01,(y1-y0)*.01,(z1-z0)*.01]} /><meshBasicMaterial color="#f59e0b" transparent opacity={.22} depthWrite={false} wireframe /></mesh>
    })}
  </group>
}

function BottomCover({ cover, transparent, wireframe, exploded, onMove }: { cover: BottomCoverState; transparent: boolean; wireframe: boolean; exploded: boolean; onMove: (position: readonly [number, number, number]) => void }) {
  const dragging = useRef(false)
  const pending = useRef<readonly [number, number, number] | null>(null)
  const position: [number, number, number] = [cover.positionMm[0] * .01, cover.positionMm[1] * .01, cover.positionMm[2] * .01 + (exploded ? .35 : 0)]
  const rotation: [number, number, number] = cover.rotation.map((angle) => THREE.MathUtils.degToRad(angle)) as [number, number, number]
  return <group
    position={position}
    rotation={rotation}
    onPointerDown={(event) => { event.stopPropagation(); dragging.current = true }}
    onPointerMove={(event) => {
      if (!dragging.current || cover.state === 'latched') return
      event.stopPropagation()
      pending.current = [event.point.x * 100, event.point.y * 100, cover.positionMm[2]]
    }}
    onPointerUp={(event) => {
      if (!dragging.current) return
      event.stopPropagation()
      dragging.current = false
      if (pending.current) onMove(pending.current)
      pending.current = null
    }}
  >
    <SourceMesh url={BOTTOM_COVER_TARGET.stlUrl} color="#111827" opacity={transparent ? .25 : .92} wireframe={wireframe} />
  </group>
}

export default function CoverViewport(props: {
  cover: BottomCoverState
  latches: CoverLatchInstallation[]
  selectedLatch: CoverLatchId | null
  cameraPreset: CoverCameraPreset
  cameraResetCount: number
  routes: CableRouteState[]
  connections: CableConnectionState[]
  placements: EnclosurePlacement[]
  retainers: RetainerInstallation[]
  transparentCover: boolean
  wireframeCover: boolean
  transparentHousing: boolean
  showMatingPerimeter: boolean
  showLatchTargets: boolean
  showClearanceRegions: boolean
  isolateCover: boolean
  isolateCables: boolean
  exploded: boolean
  onMoveCover: (position: readonly [number, number, number]) => void
}) {
  const showAssembly = !props.isolateCover
  const showInterior = showAssembly && !props.isolateCables
  return <div role="img" aria-label={`Step 10 bottom-cover installation scene. Cover is ${props.cover.state} at ${Math.round(props.cover.seatingProgress * 100)} percent seating; ${props.latches.filter((item) => item.state === 'engaged').length} of four latches are engaged.`} className="relative h-[32rem] overflow-hidden rounded-sm border border-cyan-300/15 bg-[#020713] sm:h-[46rem]">
    <Canvas dpr={[1,1.5]} camera={{ position: [2.8,3.2,4.8], fov: 42, near: .01, far: 100 }} gl={{ antialias: true, powerPreference: 'high-performance' }}>
      <color attach="background" args={['#020713']} />
      <ambientLight intensity={1.05} /><directionalLight intensity={2.1} position={[3,5,5]} />
      <CameraDirector preset={props.cameraPreset} resetCount={props.cameraResetCount} />
      <Suspense fallback={null}>
        {showAssembly && <SourceMesh url={TOP_HOUSING_STL_URL} color="#12658b" opacity={props.transparentHousing ? .22 : .8} />}
        <BottomCover cover={props.cover} transparent={props.transparentCover} wireframe={props.wireframeCover} exploded={props.exploded} onMove={props.onMoveCover} />
        {showInterior && <><Components placements={props.placements} /><InstalledRetainers installations={props.retainers} /></>}
        {showAssembly && <RouteLines routes={props.routes} connections={props.connections} placements={props.placements} selectedId={null} isolate={false} showPoints={false} selectedPoint={null} onSelect={() => {}} onSelectPoint={() => {}} onMovePoint={() => {}} />}
      </Suspense>
      {props.showMatingPerimeter && <MatingPerimeter />}
      {props.showLatchTargets && <LatchTargets latches={props.latches} selected={props.selectedLatch} />}
      {props.showClearanceRegions && <ClearanceRegions />}
      <OrbitControls enablePan enableZoom enableRotate enableDamping minDistance={.65} maxDistance={9} />
    </Canvas>
    <div className="pointer-events-none absolute bottom-3 left-3 rounded-sm bg-[#030916]/88 px-3 py-2 font-mono text-[9px] uppercase tracking-[.14em] text-slate-300">
      {props.cover.state} · seating {Math.round(props.cover.seatingProgress * 100)}% · {props.latches.filter((item) => item.state === 'engaged').length}/4 latches
    </div>
  </div>
}
