import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Canvas, useLoader, useThree } from '@react-three/fiber'
import { Line, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { ENCLOSURE_SLOT_BY_ID, ENCLOSURE_SLOTS, TOP_HOUSING_STL_URL } from '../../data/enclosure'
import { connectorWorldPosition } from '../../utils/enclosure'
import type { CableConnectionState, EnclosureCameraPreset, EnclosurePartId, EnclosurePlacement } from '../../types'

interface EnclosureViewportProps {
  placements: EnclosurePlacement[]
  connections: CableConnectionState[]
  selectedPartId: EnclosurePartId | null
  selectedSlotId: string | null
  cameraPreset: EnclosureCameraPreset
  showTargets: boolean
  showCables: boolean
  transparentHousing: boolean
  wireframeHousing: boolean
  isolateSelected: boolean
  guidance: 'beginner' | 'standard' | 'expert'
  onSelectPart: (partId: EnclosurePartId) => void
  onSelectSlot: (slotId: string) => void
  onDropPart: (partId: EnclosurePartId, positionMm: readonly [number, number, number]) => void
  onLoadError: (error: Error) => void
  onLoaded: () => void
}

interface BoundaryProps { assetUrl: string; onLoadError: (error: Error) => void; children: ReactNode }
interface BoundaryState { failed: boolean }
class StlBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error: Error) { this.props.onLoadError(error) }
  componentDidUpdate(previous: BoundaryProps) { if (previous.assetUrl !== this.props.assetUrl && this.state.failed) this.setState({ failed: false }) }
  render() { return this.state.failed ? null : this.props.children }
}

function CameraDirector({ preset }: { preset: EnclosureCameraPreset }) {
  const { camera } = useThree()
  useEffect(() => {
    const positions: Record<EnclosureCameraPreset, [number, number, number]> = {
      fit: [2.4, 2.9, 4.25], top: [0, 4.8, 0.01], 'build-three': [2.1, 3.4, 3.7], front: [0, 0.15, 4.9], back: [0, 0.15, -4.9], left: [-4.9, 0.15, 0.01], right: [4.9, 0.15, 0.01], interior: [1.1, 2.1, 2.5],
    }
    const [x, y, z] = positions[preset]
    camera.position.set(x, y, z)
    camera.up.set(0, 1, 0)
    camera.lookAt(0, 0, 0)
  }, [camera, preset])
  return null
}

function Housing({ transparent, wireframe, onLoaded }: { transparent: boolean; wireframe: boolean; onLoaded: () => void }) {
  const source = useLoader(STLLoader, TOP_HOUSING_STL_URL) as THREE.BufferGeometry
  const geometry = useMemo(() => {
    const copy = source.clone(); copy.computeVertexNormals(); copy.computeBoundingBox()
    const centre = copy.boundingBox?.getCenter(new THREE.Vector3()) ?? new THREE.Vector3()
    copy.translate(-centre.x, -centre.y, -centre.z)
    return copy
  }, [source])
  useEffect(() => { onLoaded(); return () => geometry.dispose() }, [geometry, onLoaded])
  return <mesh geometry={geometry} scale={0.01} castShadow receiveShadow>
    <meshStandardMaterial color="#166992" roughness={0.5} metalness={0.08} transparent={transparent} opacity={transparent ? 0.23 : 0.92} depthWrite={!transparent} wireframe={wireframe} side={THREE.DoubleSide} />
  </mesh>
}

const proxySpec: Record<EnclosurePartId, { size: [number, number, number]; color: string; accent: string }> = {
  'triad-spectral-sensor': { size: [31, 34, 4], color: '#bc3137', accent: '#f7cfb6' },
  'pcf8523-clock': { size: [24, 18, 4], color: '#202936', accent: '#b49e76' },
  'oled-display': { size: [28, 20, 4], color: '#1e5e86', accent: '#07131d' },
  'thing-plus-rp2040': { size: [37, 27, 4], color: '#ba2f35', accent: '#e3e6ea' },
  'i2c-button': { size: [27, 22, 4], color: '#c33539', accent: '#e95853' },
  'power-switch': { size: [28, 12, 8], color: '#111722', accent: '#4b5563' },
  'battery-400': { size: [29, 25, 7], color: '#dce1e4', accent: '#f4c743' },
  'micro-sd-card': { size: [12, 10, 1.2], color: '#131519', accent: '#c4c7cc' },
}

function ComponentProxy({ placement, selected, onSelect, onDrop }: { placement: EnclosurePlacement; selected: boolean; onSelect: () => void; onDrop: (position: readonly [number, number, number]) => void }) {
  const spec = proxySpec[placement.partId]
  const [dragging, setDragging] = useState(false)
  const dragPosition = useRef<readonly [number, number, number] | null>(null)
  const position: [number, number, number] = [placement.positionMm[0] * 0.01, placement.positionMm[1] * 0.01, placement.positionMm[2] * 0.01]
  const rotation: [number, number, number] = [placement.rotation[0] * Math.PI / 180, placement.rotation[1] * Math.PI / 180, placement.rotation[2] * Math.PI / 180]
  const [width, height, depth] = spec.size.map((value) => value * 0.01) as [number, number, number]
  return <group position={position} rotation={rotation} onClick={(event) => { event.stopPropagation(); onSelect() }} onPointerDown={(event) => { event.stopPropagation(); setDragging(true) }} onPointerMove={(event) => {
    if (!dragging) return
    event.stopPropagation()
    dragPosition.current = [event.point.x * 100, event.point.y * 100, Math.max(12, event.point.z * 100)]
  }} onPointerUp={(event) => {
    if (!dragging) return
    event.stopPropagation(); setDragging(false)
    if (dragPosition.current) onDrop(dragPosition.current)
    dragPosition.current = null
  }}>
    <mesh castShadow receiveShadow>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color={spec.color} roughness={0.58} metalness={placement.partId === 'battery-400' ? 0.16 : 0.05} emissive={selected ? '#164e63' : '#000000'} emissiveIntensity={selected ? 0.25 : 0} />
    </mesh>
    {placement.partId === 'triad-spectral-sensor' && <mesh position={[0, 0, depth / 2 + 0.002]}><cylinderGeometry args={[width * 0.23, width * 0.23, 0.012, 32]} /><meshStandardMaterial color={spec.accent} /></mesh>}
    {placement.partId === 'pcf8523-clock' && <mesh position={[0, 0, depth / 2 + 0.002]}><cylinderGeometry args={[width * 0.22, width * 0.22, 0.012, 32]} /><meshStandardMaterial color={spec.accent} /></mesh>}
    {placement.partId === 'oled-display' && <mesh position={[-width * 0.07, 0, depth / 2 + 0.003]}><planeGeometry args={[width * 0.65, height * 0.55]} /><meshBasicMaterial color={spec.accent} /></mesh>}
    {placement.partId === 'i2c-button' && <mesh position={[0, 0, depth / 2 + 0.006]}><cylinderGeometry args={[width * 0.18, width * 0.18, 0.014, 32]} /><meshStandardMaterial color={spec.accent} /></mesh>}
    {placement.partId === 'thing-plus-rp2040' && <mesh position={[-width * 0.24, height * 0.28, depth / 2 + 0.003]}><planeGeometry args={[width * 0.24, height * 0.15]} /><meshBasicMaterial color={spec.accent} /></mesh>}
    {placement.partId === 'battery-400' && <mesh position={[0, 0, depth / 2 + 0.003]}><planeGeometry args={[width * 0.75, height * 0.2]} /><meshBasicMaterial color="#4b5563" /></mesh>}
    {selected && <mesh position={[0, 0, -depth / 2 - 0.006]}><boxGeometry args={[width * 1.12, height * 1.12, 0.01]} /><meshBasicMaterial color="#67e8f9" transparent opacity={0.25} depthWrite={false} /></mesh>}
  </group>
}

function SlotTargets({ visible, selectedSlotId, guidance, onSelect }: { visible: boolean; selectedSlotId: string | null; guidance: 'beginner' | 'standard' | 'expert'; onSelect: (slotId: string) => void }) {
  if (!visible) return null
  return <group>{ENCLOSURE_SLOTS.map((slot) => {
    const selected = slot.id === selectedSlotId
    const [width, height] = slot.footprintMm
    const opacity = selected ? 0.45 : guidance === 'beginner' ? 0.23 : 0.12
    return <mesh key={slot.id} position={[slot.positionMm[0] * 0.01, slot.positionMm[1] * 0.01, slot.positionMm[2] * 0.01 - 0.018]} rotation={[0, 0, slot.rotation[2] * Math.PI / 180]} onClick={(event) => { event.stopPropagation(); onSelect(slot.id) }}>
      <boxGeometry args={[width * 0.01, height * 0.01, 0.012]} />
      <meshBasicMaterial color={selected ? '#fbbf24' : '#38bdf8'} transparent opacity={opacity} depthWrite={false} />
      <lineSegments><edgesGeometry args={[new THREE.BoxGeometry(width * 0.01, height * 0.01, 0.012)]} /><lineBasicMaterial color={selected ? '#fde68a' : '#67e8f9'} /></lineSegments>
    </mesh>
  })}</group>
}

function CableCurves({ placements, connections, show, isolate, selectedPartId }: { placements: EnclosurePlacement[]; connections: CableConnectionState[]; show: boolean; isolate: boolean; selectedPartId: EnclosurePartId | null }) {
  if (!show) return null
  return <group>{connections.map((connection) => {
    if (!connection.endpointA || !connection.endpointB) return null
    const connectorA = connectorWorldPosition(placements, connection.endpointA)
    const connectorB = connectorWorldPosition(placements, connection.endpointB)
    if (!connectorA || !connectorB) return null
    const partA = connection.endpointA ? undefined : undefined
    const connector = connection.endpointA ? undefined : undefined
    const start = new THREE.Vector3(connectorA[0] * 0.01, connectorA[1] * 0.01, connectorA[2] * 0.01)
    const end = new THREE.Vector3(connectorB[0] * 0.01, connectorB[1] * 0.01, connectorB[2] * 0.01)
    const midpoint = start.clone().add(end).multiplyScalar(0.5); midpoint.z += connection.kind === 'qwiic' ? 0.2 : 0.28
    const isSelected = selectedPartId && (connection.endpointA.includes(selectedPartId === 'micro-sd-card' ? '__none__' : selectedPartId) || connection.endpointB.includes(selectedPartId === 'micro-sd-card' ? '__none__' : selectedPartId))
    if (isolate && !isSelected) return null
    return <Line key={connection.cableId} points={[start, midpoint, end]} color={connection.kind === 'qwiic' ? (isSelected ? '#67e8f9' : '#1f2937') : '#ef4444'} lineWidth={isSelected ? 2.4 : 1.2} transparent opacity={isSelected ? 1 : 0.85} />
  })}</group>
}

function FallbackGeometry() { return <mesh><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#166992" wireframe /></mesh> }

export default function EnclosureViewport(props: EnclosureViewportProps) {
  return <div role="img" aria-label="Interactive Step 7 three-dimensional top-housing workspace. Connected electronics remain attached while you place them into their documented slots." className="relative h-[29rem] overflow-hidden rounded-sm border border-cyan-300/15 bg-[#020713] sm:h-[39rem]">
    <Canvas dpr={[1, 1.5]} camera={{ position: [2.4, 2.9, 4.25], fov: 42, near: 0.01, far: 100 }} gl={{ antialias: true, powerPreference: 'high-performance' }}>
      <color attach="background" args={['#020713']} />
      <ambientLight intensity={0.9} /><directionalLight intensity={2.2} position={[3, 5, 5]} color="#e0f6ff" /><directionalLight intensity={0.5} position={[-4, 1, -3]} color="#82b9dd" />
      <CameraDirector preset={props.cameraPreset} />
      <StlBoundary assetUrl={TOP_HOUSING_STL_URL} onLoadError={props.onLoadError}><Suspense fallback={<FallbackGeometry />}><Housing transparent={props.transparentHousing} wireframe={props.wireframeHousing} onLoaded={props.onLoaded} /></Suspense></StlBoundary>
      <SlotTargets visible={props.showTargets} selectedSlotId={props.selectedSlotId} guidance={props.guidance} onSelect={props.onSelectSlot} />
      {props.placements.map((placement) => <ComponentProxy key={placement.partId} placement={placement} selected={placement.partId === props.selectedPartId} onSelect={() => props.onSelectPart(placement.partId)} onDrop={(position) => props.onDropPart(placement.partId, position)} />)}
      <CableCurves placements={props.placements} connections={props.connections} show={props.showCables} isolate={props.isolateSelected} selectedPartId={props.selectedPartId} />
      <OrbitControls enablePan enableRotate enableZoom enableDamping dampingFactor={0.08} minDistance={0.65} maxDistance={8} />
    </Canvas>
    <div className="pointer-events-none absolute bottom-3 left-3 rounded-sm border border-white/10 bg-[#030916]/85 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-slate-300">Supplied top-housing STL · mm scale · loose Step 7 cable curves</div>
  </div>
}
