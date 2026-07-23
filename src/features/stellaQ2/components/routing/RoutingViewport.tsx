import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useLoader, useThree } from '@react-three/fiber'
import { Line, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { TOP_HOUSING_STL_URL, ENCLOSURE_SLOT_BY_PART_ID } from '../../data/enclosure'
import { BOTTOM_COVER_STL_URL, ROUTING_CORRIDORS, ROUTING_REGIONS } from '../../data/routing'
import { RETAINERS } from '../../data/retainers'
import { connectorWorldPosition } from '../../utils/enclosure'
import { routeWorldPoints } from '../../utils/routing'
import type { CableConnectionState, CableRouteState, EnclosurePlacement, RetainerInstallation, RoutingCameraPreset } from '../../types'

const cableColors = ['#70d6ff', '#c084fc', '#f9a8d4', '#fde68a']
function centeredGeometry(source: THREE.BufferGeometry) { const copy = source.clone(); copy.computeVertexNormals(); copy.computeBoundingBox(); const center = copy.boundingBox?.getCenter(new THREE.Vector3()) ?? new THREE.Vector3(); copy.translate(-center.x, -center.y, -center.z); return copy }

export function SourceMesh({ url, color, opacity, wireframe = false, position = [0, 0, 0] }: { url: string; color: string; opacity: number; wireframe?: boolean; position?: [number, number, number] }) {
  const source = useLoader(STLLoader, url) as THREE.BufferGeometry
  const geometry = useMemo(() => centeredGeometry(source), [source])
  useEffect(() => () => geometry.dispose(), [geometry])
  return <mesh geometry={geometry} scale={.01} position={position} castShadow receiveShadow><meshStandardMaterial color={color} transparent={opacity < 1} opacity={opacity} depthWrite={opacity >= .5} wireframe={wireframe} side={THREE.DoubleSide} roughness={.52} metalness={.08} /></mesh>
}

function CameraDirector({ preset }: { preset: RoutingCameraPreset }) {
  const { camera } = useThree()
  useEffect(() => {
    const positions: Record<RoutingCameraPreset, [number, number, number]> = { fit: [2.4, 2.9, 4.35], top: [0, 4.9, .01], 'build-four': [1.8, 3.5, 3.9], front: [0, .2, 4.9], back: [0, .2, -4.9], left: [-4.9, .2, .01], right: [4.9, .2, .01], 'selected-cable': [1.2, 1.9, 2.6] }
    camera.position.set(...positions[preset]); camera.up.set(0, 1, 0); camera.lookAt(0, 0, 0)
  }, [camera, preset])
  return null
}

export function Components({ placements }: { placements: EnclosurePlacement[] }) {
  return <group>{placements.filter((item) => item.partId !== 'micro-sd-card').map((placement) => { const slot = ENCLOSURE_SLOT_BY_PART_ID.get(placement.partId); if (!slot) return null; const color = placement.partId === 'battery-400' ? '#d8dee4' : placement.partId === 'oled-display' ? '#245f89' : placement.partId === 'pcf8523-clock' ? '#222b34' : '#b8323b'; return <mesh key={placement.partId} position={[placement.positionMm[0] * .01, placement.positionMm[1] * .01, placement.positionMm[2] * .01]}><boxGeometry args={[slot.footprintMm[0] * .01, slot.footprintMm[1] * .01, slot.thicknessMm * .01]} /><meshStandardMaterial color={color} roughness={.58} /></mesh> })}</group>
}

export function InstalledRetainers({ installations }: { installations: RetainerInstallation[] }) {
  return <group>{RETAINERS.map((definition) => { const item = installations.find((candidate) => candidate.retainerId === definition.id); if (!item || item.installationState !== 'installed') return null; return <Suspense key={definition.id} fallback={null}><group position={[item.positionMm[0] * .01, item.positionMm[1] * .01, item.positionMm[2] * .01]}><SourceMesh url={definition.stlUrl} color="#a7b0ba" opacity={.92} /></group></Suspense> })}</group>
}

export function RouteLines({ routes, connections, placements, selectedId, isolate, showPoints, selectedPoint, onSelect, onSelectPoint, onMovePoint }: { routes: CableRouteState[]; connections: CableConnectionState[]; placements: EnclosurePlacement[]; selectedId: string | null; isolate: boolean; showPoints: boolean; selectedPoint: number | null; onSelect: (id: string) => void; onSelectPoint: (index: number) => void; onMovePoint: (id: string, index: number, point: readonly [number, number, number]) => void }) {
  return <group>{routes.map((route, routeIndex) => {
    if (isolate && route.cableId !== selectedId) return null
    const connection = connections.find((item) => item.cableId === route.cableId); if (!connection) return null
    const points = routeWorldPoints(route, connection, placements); if (points.length < 2) return null
    const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(point[0] * .01, point[1] * .01, point[2] * .01)), false, 'centripetal', .28)
    const rendered = curve.getPoints(42)
    const color = connection.kind === 'power' ? (route.cableId === 'power-battery-switch' ? '#ef4444' : '#f97316') : cableColors[routeIndex % cableColors.length]
    return <group key={route.cableId} onClick={(event) => { event.stopPropagation(); onSelect(route.cableId) }}><Line points={rendered} color={color} lineWidth={route.cableId === selectedId ? 4 : 2.2} transparent opacity={route.cableId === selectedId ? 1 : .82} />{showPoints && route.cableId === selectedId && route.controlPointsMm.map((point, index) => <RouteHandle key={index} point={point} active={selectedPoint === index} onSelect={() => onSelectPoint(index)} onMove={(next) => onMovePoint(route.cableId, index, next)} />)}</group>
  })}</group>
}

function RouteHandle({ point, active, onSelect, onMove }: { point: readonly [number, number, number]; active: boolean; onSelect: () => void; onMove: (point: readonly [number, number, number]) => void }) {
  const [dragging, setDragging] = useState(false); const next = useRef<readonly [number, number, number] | null>(null)
  return <mesh position={[point[0] * .01, point[1] * .01, point[2] * .01]} onPointerDown={(event) => { event.stopPropagation(); setDragging(true); onSelect() }} onPointerMove={(event) => { if (!dragging) return; event.stopPropagation(); next.current = [event.point.x * 100, event.point.y * 100, Math.max(13, Math.min(28, event.point.z * 100))] }} onPointerUp={(event) => { if (!dragging) return; event.stopPropagation(); setDragging(false); if (next.current) onMove(next.current); next.current = null }}><sphereGeometry args={[active ? .035 : .027, 18, 18]} /><meshBasicMaterial color={active ? '#ffffff' : '#22d3ee'} depthTest={false} /></mesh>
}

function RegionOverlays({ corridors, collisions }: { corridors: boolean; collisions: boolean }) {
  return <group>{corridors && ROUTING_CORRIDORS.map((region) => { const [x0,x1,y0,y1,z0,z1] = region.regionMm; return <mesh key={region.id} position={[(x0+x1)*.005,(y0+y1)*.005,(z0+z1)*.005]}><boxGeometry args={[(x1-x0)*.01,(y1-y0)*.01,(z1-z0)*.01]} /><meshBasicMaterial color="#22d3ee" transparent opacity={.055} depthWrite={false} wireframe /></mesh> })}{collisions && ROUTING_REGIONS.filter((item) => item.severity === 'block').map((region) => { const [x0,x1,y0,y1,z0,z1] = region.boundsMm; return <mesh key={region.id} position={[(x0+x1)*.005,(y0+y1)*.005,(z0+z1)*.005]}><boxGeometry args={[(x1-x0)*.01,(y1-y0)*.01,(z1-z0)*.01]} /><meshBasicMaterial color="#fb7185" transparent opacity={.15} depthWrite={false} wireframe /></mesh> })}</group>
}

export default function RoutingViewport(props: { routes: CableRouteState[]; connections: CableConnectionState[]; placements: EnclosurePlacement[]; retainers: RetainerInstallation[]; selectedCableId: string | null; selectedPoint: number | null; cameraPreset: RoutingCameraPreset; transparentHousing: boolean; wireframeHousing: boolean; isolateSelected: boolean; showPoints: boolean; showCorridors: boolean; showCollisions: boolean; showBottomCover: boolean; onSelectCable: (id: string) => void; onSelectPoint: (index: number) => void; onMovePoint: (id: string, index: number, point: readonly [number, number, number]) => void }) {
  return <div role="img" aria-label="Interactive Step 9 wire-routing scene with fixed connector endpoints, editable cable handles, installed electronics and retainers, and an optional Step 10 bottom-cover clearance ghost." className="relative h-[31rem] overflow-hidden rounded-sm border border-cyan-300/15 bg-[#020713] sm:h-[43rem]">
    <Canvas dpr={[1,1.5]} camera={{ position: [2.4,2.9,4.35], fov: 42, near: .01, far: 100 }} gl={{ antialias: true, powerPreference: 'high-performance' }}><color attach="background" args={['#020713']} /><ambientLight intensity={1.05} /><directionalLight intensity={2.1} position={[3,5,5]} /><CameraDirector preset={props.cameraPreset} />
      <Suspense fallback={null}><SourceMesh url={TOP_HOUSING_STL_URL} color="#12658b" opacity={props.transparentHousing ? .24 : .8} wireframe={props.wireframeHousing} />{props.showBottomCover && <group position={[0,0,.26]}><SourceMesh url={BOTTOM_COVER_STL_URL} color="#a78bfa" opacity={.16} wireframe /></group>}</Suspense>
      <Components placements={props.placements} /><InstalledRetainers installations={props.retainers} /><RouteLines routes={props.routes} connections={props.connections} placements={props.placements} selectedId={props.selectedCableId} isolate={props.isolateSelected} showPoints={props.showPoints} selectedPoint={props.selectedPoint} onSelect={props.onSelectCable} onSelectPoint={props.onSelectPoint} onMovePoint={props.onMovePoint} /><RegionOverlays corridors={props.showCorridors} collisions={props.showCollisions} /><OrbitControls enablePan enableZoom enableRotate enableDamping minDistance={.65} maxDistance={8} />
    </Canvas>{props.showBottomCover && <div className="pointer-events-none absolute right-3 top-3 rounded-sm border border-violet-300/25 bg-[#070b18]/90 px-3 py-2 text-[9px] uppercase tracking-[.16em] text-violet-200">Bottom-cover ghost · installed in Step 10</div>}<div className="pointer-events-none absolute bottom-3 left-3 rounded-sm bg-[#030916]/85 px-3 py-2 font-mono text-[9px] uppercase tracking-[.14em] text-slate-300">fixed endpoints · editable serializable route nodes</div>
  </div>
}
