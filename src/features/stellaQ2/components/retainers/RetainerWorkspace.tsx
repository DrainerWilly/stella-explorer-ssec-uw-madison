import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Component, Suspense, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { BUILD_PHOTOS } from '../../data/buildPhotos'
import { RETAINERS, RETAINER_BY_ID } from '../../data/retainers'
import { sourceAssetUrl } from '../../data/sourceReferences'
import { retainerInstallationFor, validateRetainers } from '../../utils/retainers'
import { retainerStlLoadFailureMessage } from '../../utils/retainers'
import type { LabAction, LabState, RetainerId } from '../../types'

class RetainerBoundary extends Component<{ filename: string; onFailure: (message: string) => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onFailure(retainerStlLoadFailureMessage(this.props.filename)) }
  render() { return this.state.failed ? null : this.props.children }
}

function Clip({ id, installed, selected, isolate, onSelect }: { id: RetainerId; installed: boolean; selected: boolean; isolate: boolean; onSelect: () => void }) {
  const definition = RETAINER_BY_ID.get(id)!
  const source = useLoader(STLLoader, definition.stlUrl) as THREE.BufferGeometry
  const geometry = useMemo(() => { const copy = source.clone(); copy.computeVertexNormals(); copy.computeBoundingBox(); const center = copy.boundingBox?.getCenter(new THREE.Vector3()) ?? new THREE.Vector3(); copy.translate(-center.x, -center.y, -center.z); return copy }, [source])
  useEffect(() => () => geometry.dispose(), [geometry])
  if (isolate && !selected) return null
  const position = installed ? definition.installedPositionMm : definition.trayPositionMm
  return <mesh geometry={geometry} position={[position[0] * .01, position[1] * .01, position[2] * .01]} scale={.01} onClick={(event) => { event.stopPropagation(); onSelect() }} castShadow>
    <meshStandardMaterial color={selected ? '#facc15' : installed ? '#67e8f9' : '#94a3b8'} roughness={.46} metalness={.18} emissive={selected ? '#78350f' : '#000'} emissiveIntensity={selected ? .25 : 0} />
  </mesh>
}

function RetainerScene({ state, dispatch, onFailure }: { state: LabState; dispatch: (action: LabAction) => void; onFailure: (message: string) => void }) {
  return <Canvas dpr={[1, 1.5]} camera={{ position: [2.9, 2.7, 4.8], fov: 40 }} gl={{ antialias: true, powerPreference: 'high-performance' }}>
    <color attach="background" args={['#020713']} /><ambientLight intensity={1.15} /><directionalLight position={[3, 5, 4]} intensity={2.3} />
    <mesh rotation={[0, 0, 0]} position={[0, 0, 0]}><boxGeometry args={[.68, 1.88, .09]} /><meshStandardMaterial color="#0c5474" transparent opacity={state.retainerTransparentHousing ? .28 : .78} wireframe={state.retainerWireframeHousing} /></mesh>
    {RETAINERS.map((retainer) => { const installation = state.retainerInstallations.find((item) => item.retainerId === retainer.id)!; return <RetainerBoundary key={retainer.id} filename={retainer.filename} onFailure={onFailure}><Suspense fallback={null}><Clip id={retainer.id} installed={installation.installationState === 'installed'} selected={state.selectedRetainerId === retainer.id} isolate={state.retainerIsolateSelected} onSelect={() => dispatch({ type: 'SELECT_RETAINER', retainerId: retainer.id })} /></Suspense></RetainerBoundary> })}
    {state.retainerTargetsVisible && RETAINERS.map((retainer) => <mesh key={`${retainer.id}-target`} position={[retainer.installedPositionMm[0] * .01, retainer.installedPositionMm[1] * .01, retainer.installedPositionMm[2] * .01]} onClick={() => dispatch({ type: 'SELECT_RETAINER_TARGET', targetId: `${retainer.id}-target` })}><boxGeometry args={[.32,.18,.04]} /><meshBasicMaterial color={state.selectedRetainerTargetId === `${retainer.id}-target` ? '#facc15' : '#38bdf8'} transparent opacity={.2} depthWrite={false} /></mesh>)}
    <OrbitControls enableDamping minDistance={.7} maxDistance={8} />
  </Canvas>
}

export default function RetainerWorkspace({ state, dispatch }: { state: LabState; dispatch: (action: LabAction) => void }) {
  const [loadFailure, setLoadFailure] = useState('')
  const selectedId = state.selectedRetainerId ?? 'clock-retainer'
  const selected = RETAINER_BY_ID.get(selectedId)!
  const validation = validateRetainers(state.layoutPlacements, state.step6Connections, state.coinCellInstalled, state.enclosurePlacements, state.microSdInstalled, state.retainerInstallations, state.cableBlockedRetainerIds)
  const build3 = BUILD_PHOTOS.find((photo) => photo.id === 'build-three-enclosure')!
  const build4 = BUILD_PHOTOS.find((photo) => photo.id === 'build-four-routing')!
  const enclosureReady = validation.status !== 'enclosure-incomplete'
  return <section className="space-y-4" aria-label="Step 8 interactive retainer installation">
    <div className="sq2-panel rounded-sm p-4"><p className="text-[10px] font-semibold uppercase tracking-[.22em] text-cyan-300">Step 8 · retainer clips</p><h2 className="mt-2 text-xl font-semibold text-white">Seat the five supplied module retainers</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Each actual supplied STL is mapped to one documented Build 3/4 position: CK, DISP, MC, BN, and BAT. TRIAD has no supplied retainer STL and remains directly held by the top housing.</p></div>
    {!enclosureReady ? <div className="rounded-sm border border-amber-300/30 bg-amber-300/[.06] p-4 text-sm text-amber-100">Step 8 is locked because Step 7 is not valid. {validation.messages[0]} <button className="ml-2 underline" onClick={() => dispatch({ type: 'SELECT_BUILD_STEP', stepId: 'enclosure-placement' })}>Return to Step 7</button></div> : <>
      <div className="grid gap-4 xl:grid-cols-[1fr_22rem]"><div className="relative h-[32rem] overflow-hidden rounded-sm border border-cyan-300/15"><RetainerScene state={state} dispatch={dispatch} onFailure={setLoadFailure} /><div className="pointer-events-none absolute bottom-3 left-3 rounded-sm bg-[#030916]/85 px-3 py-2 font-mono text-[9px] uppercase tracking-[.14em] text-slate-300">five supplied source STLs · tray → rails → snap</div></div><aside className="sq2-panel rounded-sm p-4"><p className="text-[9px] font-semibold uppercase tracking-[.2em] text-cyan-300">Retainer tray</p><div className="mt-3 space-y-2">{RETAINERS.map((retainer) => { const installed = state.retainerInstallations.find((item) => item.retainerId === retainer.id)?.installationState === 'installed'; return <button key={retainer.id} onClick={() => dispatch({ type: 'SELECT_RETAINER', retainerId: retainer.id })} className={`sq2-focus flex w-full items-center justify-between rounded-sm border px-3 py-2 text-left text-xs ${selectedId === retainer.id ? 'border-cyan-300 bg-cyan-300/[.08]' : 'border-white/10'}`}><span>{retainer.label}</span><span className={installed ? 'text-emerald-300' : 'text-slate-400'}>{installed ? 'seated' : 'tray'}</span></button> })}</div><div className="mt-4 border-t border-white/10 pt-3 text-xs leading-5 text-slate-300"><strong>{selected.label}</strong><br />{selected.targetHousingFeatures}<br /><span className="text-amber-200">Clearance:</span> {selected.cableClearance}</div><button onClick={() => dispatch({ type: 'PLACE_RETAINER', installation: retainerInstallationFor(selectedId) })} className="sq2-focus mt-4 w-full rounded-sm bg-cyan-300 px-3 py-2 text-xs font-semibold text-[#03101c]">Align and snap selected clip</button><div className="mt-2 grid grid-cols-2 gap-2"><button onClick={() => dispatch({ type: 'ROTATE_RETAINER', retainerId: selectedId, delta: 90 })} className="sq2-focus rounded-sm border border-white/15 px-2 py-2 text-[10px]">Rotate +90°</button><button onClick={() => dispatch({ type: 'REMOVE_RETAINER', retainerId: selectedId })} className="sq2-focus rounded-sm border border-white/15 px-2 py-2 text-[10px]">Return to tray</button></div><button onClick={() => dispatch({ type: 'TOGGLE_RETAINER_CABLE_CLEARANCE', retainerId: selectedId })} className="sq2-focus mt-2 w-full rounded-sm border border-amber-200/30 px-2 py-2 text-[10px]">{state.cableBlockedRetainerIds.includes(selectedId) ? 'Clear cable path' : 'Test cable clearance'}</button><button onClick={() => dispatch({ type: 'CHECK_RETAINERS' })} className="sq2-focus mt-4 w-full rounded-sm bg-white px-3 py-2 text-xs font-semibold text-[#03101c]">Check Step 8</button><p role="status" className="mt-3 text-[11px] leading-5 text-slate-400">{state.retainerValidation === 'idle' ? 'Select a clip, align it with its matching rails, and snap it down.' : validation.messages.join(' ')}</p></aside></div>
      <div className="sq2-panel rounded-sm p-4"><div className="flex flex-wrap gap-2"><button onClick={() => dispatch({ type: 'UNDO_RETAINER' })} className="sq2-focus rounded-sm border border-white/15 px-3 py-2 text-[10px]">Undo</button><button onClick={() => dispatch({ type: 'REDO_RETAINER' })} className="sq2-focus rounded-sm border border-white/15 px-3 py-2 text-[10px]">Redo</button><button onClick={() => dispatch({ type: 'RESET_RETAINERS' })} className="sq2-focus rounded-sm border border-white/15 px-3 py-2 text-[10px]">Reset Step 8</button><button onClick={() => dispatch({ type: 'TOGGLE_RETAINER_TARGETS' })} className="sq2-focus rounded-sm border border-white/15 px-3 py-2 text-[10px]">{state.retainerTargetsVisible ? 'Hide rail targets' : 'Show rail targets'}</button><button onClick={() => dispatch({ type: 'TOGGLE_RETAINER_TRANSPARENCY' })} className="sq2-focus rounded-sm border border-white/15 px-3 py-2 text-[10px]">{state.retainerTransparentHousing ? 'Opaque housing' : 'Transparent housing'}</button><button onClick={() => dispatch({ type: 'TOGGLE_RETAINER_WIREFRAME' })} className="sq2-focus rounded-sm border border-white/15 px-3 py-2 text-[10px]">{state.retainerWireframeHousing ? 'Solid housing' : 'Wireframe housing'}</button><button onClick={() => dispatch({ type: 'TOGGLE_RETAINER_ISOLATION' })} className="sq2-focus rounded-sm border border-white/15 px-3 py-2 text-[10px]">{state.retainerIsolateSelected ? 'Show all clips' : 'Isolate selected'}</button></div>{loadFailure && <p className="mt-3 text-xs text-rose-200">{loadFailure}</p>}</div>
      <div className="grid gap-4 lg:grid-cols-2"><figure className="sq2-panel rounded-sm p-3"><p className="text-[9px] uppercase tracking-[.18em] text-cyan-300">Build 3 · placement source</p><img src={sourceAssetUrl(build3.assetPath)} alt={build3.alt} className="mt-3 max-h-[32rem] w-full object-contain" /></figure><figure className="sq2-panel rounded-sm p-3"><p className="text-[9px] uppercase tracking-[.18em] text-amber-200">Build 4 · next reference only</p><img src={sourceAssetUrl(build4.assetPath)} alt={build4.alt} className="mt-3 max-h-[32rem] w-full object-contain" /><figcaption className="mt-2 text-[10px] text-slate-500">Wire routing is deliberately not interactive until Step 9.</figcaption></figure></div>
    </>}
  </section>
}
