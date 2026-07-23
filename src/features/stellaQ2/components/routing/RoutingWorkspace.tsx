import { Component, useMemo, useRef, type ReactNode } from 'react'
import { BUILD_PHOTOS } from '../../data/buildPhotos'
import { CONNECTOR_BY_ID } from '../../data/connectors'
import { ROUTING_CAMERA_PRESETS, ROUTING_CORRIDORS, ROUTE_TEMPLATE_BY_PAIR, pairKey } from '../../data/routing'
import { sourceAssetUrl } from '../../data/sourceReferences'
import { availableCableLengthMm, calculateRouteLengthMm, validateCableRoute, validateRoutingStep } from '../../utils/routing'
import type { CableRouteState, LabAction, LabState, RoutingComparisonMode } from '../../types'
import RoutingViewport from './RoutingViewport'

const BUILD_THREE = BUILD_PHOTOS.find((photo) => photo.id === 'build-three-enclosure')!
const BUILD_FOUR = BUILD_PHOTOS.find((photo) => photo.id === 'build-four-routing')!
const comparisonModes: Array<{ id: RoutingComparisonMode; label: string }> = [
  { id: 'workspace', label: '3D workspace' }, { id: 'build-three', label: 'Build 3 before' }, { id: 'build-four', label: 'Build 4 routed' }, { id: 'photos-side-by-side', label: 'Build 3 + 4' }, { id: 'workspace-build-four', label: '3D + Build 4' }, { id: 'build-four-large', label: 'Enlarged Build 4' }, { id: 'annotated', label: 'Annotated reference' },
]

function ReferencePhoto({ photo, annotated = false }: { photo: typeof BUILD_FOUR; annotated?: boolean }) {
  return <figure className="sq2-panel relative overflow-hidden rounded-sm p-3"><img src={sourceAssetUrl(photo.assetPath)} alt={photo.alt} className="max-h-[50rem] w-full object-contain" />{annotated && <div className="mt-3 grid gap-2 text-[10px] leading-5 text-slate-300 sm:grid-cols-3"><p><strong className="text-cyan-200">Upper channels:</strong> Qwiic leads remain beside TRIAD, CK, and DISP.</p><p><strong className="text-amber-200">Center:</strong> preserve microSD, processor, and button-retainer access.</p><p><strong className="text-rose-200">Lower channel:</strong> keep both power leads inside the cover perimeter.</p></div>}<figcaption className="mt-2 text-[10px] text-slate-500">{photo.caption}</figcaption></figure>
}

function routeLabel(route: CableRouteState) {
  return ROUTE_TEMPLATE_BY_PAIR.get(pairKey(route.endpointA, route.endpointB))?.label ?? route.cableId
}

class RoutingRenderBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="sq2-panel grid min-h-[34rem] place-items-center rounded-sm p-6 text-center">
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-rose-200">The supplied Step 9 3D source assets could not be rendered.</p>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Check the Q2 top housing, bottom cover, and retainer STL files, then retry.
            Your route state is preserved, and the accessible route builder below remains fully usable.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ failed: false })}
            className="sq2-focus mt-4 rounded-sm border border-white/15 px-3 py-2 text-xs text-white"
          >
            Retry 3D view
          </button>
        </div>
      </div>
    )
  }
}

export default function RoutingWorkspace({ state, dispatch }: { state: LabState; dispatch: (action: LabAction) => void }) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const stepValidation = validateRoutingStep({ layout: state.layoutPlacements, connections: state.step6Connections, coinInstalled: state.coinCellInstalled, placements: state.enclosurePlacements, microSdInstalled: state.microSdInstalled, retainers: state.retainerInstallations, blockedRetainers: state.cableBlockedRetainerIds, routes: state.cableRoutes })
  const selectedId = state.selectedRoutingCableId ?? state.cableRoutes[0]?.cableId ?? null
  const selectedRoute = state.cableRoutes.find((route) => route.cableId === selectedId)
  const selectedConnection = state.step6Connections.find((connection) => connection.cableId === selectedId)
  const selectedResult = selectedRoute ? validateCableRoute(selectedRoute, selectedConnection, state.enclosurePlacements, state.retainerInstallations, state.cableBlockedRetainerIds) : null
  const selectedPair = pairKey(selectedRoute?.endpointA ?? null, selectedRoute?.endpointB ?? null)
  const availableCorridors = ROUTING_CORRIDORS.filter((corridor) => corridor.acceptedPairKeys.includes(selectedPair))
  const prerequisiteReady = stepValidation.status !== 'retainers-incomplete'
  const showWorkspace = ['workspace', 'workspace-build-four'].includes(state.routingComparisonMode)
  const reference = useMemo(() => {
    if (state.routingComparisonMode === 'build-three') return <ReferencePhoto photo={BUILD_THREE} />
    if (state.routingComparisonMode === 'build-four' || state.routingComparisonMode === 'build-four-large') return <ReferencePhoto photo={BUILD_FOUR} />
    if (state.routingComparisonMode === 'photos-side-by-side') return <div className="grid gap-4 lg:grid-cols-2"><ReferencePhoto photo={BUILD_THREE} /><ReferencePhoto photo={BUILD_FOUR} /></div>
    if (state.routingComparisonMode === 'annotated') return <ReferencePhoto photo={BUILD_FOUR} annotated />
    return null
  }, [state.routingComparisonMode])

  const viewport = <div ref={viewportRef}><RoutingRenderBoundary><RoutingViewport routes={state.cableRoutes} connections={state.step6Connections} placements={state.enclosurePlacements} retainers={state.retainerInstallations} selectedCableId={selectedId} selectedPoint={state.selectedRoutePointIndex} cameraPreset={state.routingCameraPreset} transparentHousing={state.routingTransparentHousing} wireframeHousing={state.routingWireframeHousing} isolateSelected={state.routingIsolateSelectedCable} showPoints={state.routingControlPointsVisible} showCorridors={state.routingCorridorsVisible && state.guidance !== 'expert'} showCollisions={state.routingCollisionRegionsVisible} showBottomCover={state.bottomCoverGhostVisible} onSelectCable={(cableId) => dispatch({ type: 'SELECT_ROUTING_CABLE', cableId })} onSelectPoint={(index) => dispatch({ type: 'SELECT_ROUTE_POINT', index })} onMovePoint={(cableId,index,pointMm) => dispatch({ type: 'MOVE_ROUTE_POINT', cableId, index, pointMm })} /></RoutingRenderBoundary></div>

  return <section className="space-y-4" aria-label="Step 9 interactive final wire routing">
    <div className="sq2-panel rounded-sm p-4"><p className="text-[9px] font-semibold uppercase tracking-[.22em] text-cyan-300">Step 9 · final internal routing</p><h2 className="mt-2 text-xl font-semibold text-white">Guide six existing leads into safe Build 4 corridors</h2><p className="mt-2 max-w-4xl text-sm leading-6 text-slate-300">Endpoints remain fixed exactly as validated in Step 6. Build 4 is an approximate photographic target, so safe variations are accepted. The translucent cover is clearance evidence only and cannot be installed here.</p></div>
    {!prerequisiteReady ? <div className="rounded-sm border border-amber-300/30 bg-amber-300/[.06] p-4 text-sm text-amber-100">Step 9 is locked. {stepValidation.messages[0]} <button className="ml-2 underline" onClick={() => dispatch({ type: 'SELECT_BUILD_STEP', stepId: 'retainer-clips' })}>Return to Step 8</button></div> : <>
      <div className="sq2-panel flex flex-wrap gap-2 rounded-sm p-3" role="toolbar" aria-label="Reference comparison">{comparisonModes.map((mode) => <button key={mode.id} onClick={() => dispatch({ type: 'SET_ROUTING_COMPARISON_MODE', mode: mode.id })} aria-pressed={state.routingComparisonMode === mode.id} className={`sq2-focus rounded-sm border px-3 py-2 text-[10px] ${state.routingComparisonMode === mode.id ? 'border-cyan-300 text-cyan-200' : 'border-white/15 text-slate-400'}`}>{mode.label}</button>)}</div>
      {state.routingComparisonMode === 'workspace-build-four' ? <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_28rem]">{viewport}<ReferencePhoto photo={BUILD_FOUR} /></div> : showWorkspace ? viewport : reference}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]"><div className="sq2-panel rounded-sm p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[9px] uppercase tracking-[.2em] text-cyan-300">Accessible route builder</p><h3 className="mt-1 text-sm font-semibold text-white">Same route state, no dragging required</h3></div><div className="flex gap-2"><button onClick={() => dispatch({ type: 'UNDO_ROUTING' })} disabled={!state.routingUndoHistory.length} className="sq2-focus rounded-sm border border-white/15 px-3 py-2 text-[10px] disabled:opacity-30">Undo</button><button onClick={() => dispatch({ type: 'REDO_ROUTING' })} disabled={!state.routingRedoHistory.length} className="sq2-focus rounded-sm border border-white/15 px-3 py-2 text-[10px] disabled:opacity-30">Redo</button></div></div>
        <label className="mt-4 block text-[10px] font-semibold uppercase tracking-[.14em] text-slate-400">Cable or lead<select value={selectedId ?? ''} onChange={(event) => dispatch({ type: 'SELECT_ROUTING_CABLE', cableId: event.target.value })} className="mt-1 block w-full rounded-sm border border-white/15 bg-[#030916] px-3 py-2 text-xs normal-case tracking-normal text-white">{state.cableRoutes.map((route) => <option key={route.cableId} value={route.cableId}>{routeLabel(route)} · {route.status}</option>)}</select></label>
        {selectedRoute && <><div className="mt-3 grid gap-2 sm:grid-cols-2"><div className="rounded-sm border border-white/10 p-3 text-[10px] leading-5 text-slate-300"><span className="text-slate-500">Fixed endpoint A</span><br />{CONNECTOR_BY_ID.get(selectedRoute.endpointA ?? '')?.label ?? selectedRoute.endpointA}</div><div className="rounded-sm border border-white/10 p-3 text-[10px] leading-5 text-slate-300"><span className="text-slate-500">Fixed endpoint B</span><br />{CONNECTOR_BY_ID.get(selectedRoute.endpointB ?? '')?.label ?? selectedRoute.endpointB}</div></div><p className="mt-2 text-[10px] text-slate-500">Return to Step 6 to change electrical connections. Return to Step 7 or Step 8 to change component or retainer installation.</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]"><label className="text-[10px] text-slate-400">Source-supported routing region<select id="routing-region" className="mt-1 block w-full rounded-sm border border-white/15 bg-[#030916] px-3 py-2 text-xs text-white">{availableCorridors.map((corridor) => <option key={corridor.id} value={corridor.id}>{corridor.label}</option>)}</select></label><button onClick={() => { const select = document.getElementById('routing-region') as HTMLSelectElement | null; if (select?.value) dispatch({ type: 'ADD_ROUTE_POINT', cableId: selectedRoute.cableId, corridorId: select.value }) }} disabled={!availableCorridors.length} className="sq2-focus self-end rounded-sm bg-cyan-300 px-3 py-2 text-xs font-semibold text-[#03101c] disabled:opacity-30">Add region</button></div>
          <ol className="mt-3 space-y-2" aria-label="Route point sequence">{selectedRoute.controlPointsMm.map((point,index) => <li key={index} className="flex flex-wrap items-center gap-2 rounded-sm border border-white/10 px-3 py-2 text-[10px]"><button onClick={() => dispatch({ type: 'SELECT_ROUTE_POINT', index })} className="sq2-focus text-left text-slate-300">Point {index+1}: {Math.round(point[0])}, {Math.round(point[1])}, {Math.round(point[2])} mm</button><button onClick={() => dispatch({ type: 'MOVE_ROUTE_POINT', cableId: selectedRoute.cableId, index, pointMm: [point[0], point[1] + 4, point[2]] })} className="sq2-focus ml-auto border-l border-white/10 pl-2 text-cyan-200">Move earlier</button><button onClick={() => dispatch({ type: 'MOVE_ROUTE_POINT', cableId: selectedRoute.cableId, index, pointMm: [point[0], point[1] - 4, point[2]] })} className="sq2-focus text-cyan-200">Move later</button><button onClick={() => dispatch({ type: 'REMOVE_ROUTE_POINT', cableId: selectedRoute.cableId, index })} className="sq2-focus text-rose-200">Remove</button></li>)}</ol>
          <div className="mt-3 flex flex-wrap gap-2"><button onClick={() => dispatch({ type: 'APPLY_SUGGESTED_ROUTE', cableId: selectedRoute.cableId })} className="sq2-focus rounded-sm border border-cyan-300/30 px-3 py-2 text-[10px] text-cyan-200">Apply suggested path</button><button onClick={() => dispatch({ type: 'RESET_SELECTED_ROUTE', cableId: selectedRoute.cableId })} className="sq2-focus rounded-sm border border-white/15 px-3 py-2 text-[10px]">Reset selected</button><button onClick={() => dispatch({ type: 'MARK_ROUTE_READY', cableId: selectedRoute.cableId })} className="sq2-focus rounded-sm border border-emerald-300/30 px-3 py-2 text-[10px] text-emerald-200">Confirm route</button><button onClick={() => dispatch({ type: 'CHECK_SELECTED_ROUTE', cableId: selectedRoute.cableId })} className="sq2-focus rounded-sm bg-white px-3 py-2 text-[10px] font-semibold text-[#03101c]">Check selected</button></div>
          <div role="status" aria-live="polite" className="mt-3 rounded-sm border border-white/10 bg-black/20 p-3 text-[10px] leading-5 text-slate-300">Approximate route: {selectedConnection ? Math.round(calculateRouteLengthMm(selectedRoute, selectedConnection, state.enclosurePlacements)) : 0} mm · available: {availableCableLengthMm(selectedConnection)} mm · remaining slack: {selectedResult ? Math.round(selectedResult.availableMm - selectedResult.lengthMm) : 0} mm<br />Status: {selectedResult?.status ?? 'idle'}. {selectedRoute.validationIssues.join(' ')}</div></>}
      </div><aside className="sq2-panel rounded-sm p-4"><p className="text-[9px] uppercase tracking-[.2em] text-cyan-300">Routing checklist</p><table className="mt-3 w-full text-left text-[10px]"><thead className="text-slate-500"><tr><th className="pb-2">Route</th><th className="pb-2">State</th></tr></thead><tbody>{state.cableRoutes.map((route) => { const connection = state.step6Connections.find((item) => item.cableId === route.cableId); const result = validateCableRoute(route, connection, state.enclosurePlacements, state.retainerInstallations, state.cableBlockedRetainerIds); return <tr key={route.cableId} className="border-t border-white/10"><td className="py-2 pr-2 text-slate-300"><button onClick={() => dispatch({ type: 'SELECT_ROUTING_CABLE', cableId: route.cableId })} className="sq2-focus text-left">{routeLabel(route)}</button></td><td className={result.status === 'valid' ? 'text-emerald-300' : 'text-amber-200'}>{result.status === 'valid' ? '✓ valid' : `○ ${result.status}`}</td></tr> })}</tbody></table><button onClick={() => dispatch({ type: 'CHECK_ROUTING' })} className="sq2-focus mt-4 w-full rounded-sm bg-cyan-300 px-3 py-2 text-xs font-semibold text-[#03101c]">Check complete Step 9</button><p role="status" className="mt-3 text-[10px] leading-5 text-slate-400">{state.routingValidation === 'idle' ? 'Confirm and validate each of six existing routes.' : stepValidation.messages.join(' ')}</p></aside></div>

      <div className="sq2-panel rounded-sm p-4"><div className="flex flex-wrap gap-2">{ROUTING_CAMERA_PRESETS.map((preset) => <button key={preset} onClick={() => dispatch({ type: 'SET_ROUTING_CAMERA', preset })} aria-pressed={state.routingCameraPreset === preset} className={`sq2-focus rounded-sm border px-3 py-2 text-[10px] capitalize ${state.routingCameraPreset === preset ? 'border-cyan-300 text-cyan-200' : 'border-white/15 text-slate-400'}`}>{preset}</button>)}<button onClick={() => viewportRef.current?.requestFullscreen()} className="sq2-focus rounded-sm border border-white/15 px-3 py-2 text-[10px]">Fullscreen</button><button onClick={() => dispatch({ type: 'TOGGLE_ROUTING_CONTROL_POINTS' })} className="sq2-focus rounded-sm border border-white/15 px-3 py-2 text-[10px]">{state.routingControlPointsVisible ? 'Hide route points' : 'Show route points'}</button><button onClick={() => dispatch({ type: 'TOGGLE_ROUTING_CORRIDORS' })} className="sq2-focus rounded-sm border border-white/15 px-3 py-2 text-[10px]">{state.routingCorridorsVisible ? 'Hide corridors' : 'Show corridors'}</button><button onClick={() => dispatch({ type: 'TOGGLE_ROUTING_COLLISIONS' })} className="sq2-focus rounded-sm border border-white/15 px-3 py-2 text-[10px]">{state.routingCollisionRegionsVisible ? 'Hide collisions' : 'Show collisions'}</button><button onClick={() => dispatch({ type: 'TOGGLE_BOTTOM_COVER_GHOST' })} className="sq2-focus rounded-sm border border-violet-300/30 px-3 py-2 text-[10px] text-violet-200">{state.bottomCoverGhostVisible ? 'Hide cover ghost' : 'Show cover ghost'}</button><button onClick={() => dispatch({ type: 'TOGGLE_ROUTING_ISOLATION' })} className="sq2-focus rounded-sm border border-white/15 px-3 py-2 text-[10px]">{state.routingIsolateSelectedCable ? 'Show all cables' : 'Isolate selected'}</button><button onClick={() => dispatch({ type: 'TOGGLE_ROUTING_TRANSPARENCY' })} className="sq2-focus rounded-sm border border-white/15 px-3 py-2 text-[10px]">{state.routingTransparentHousing ? 'Opaque housing' : 'Transparent housing'}</button><button onClick={() => dispatch({ type: 'TOGGLE_ROUTING_WIREFRAME' })} className="sq2-focus rounded-sm border border-white/15 px-3 py-2 text-[10px]">{state.routingWireframeHousing ? 'Solid housing' : 'Wireframe housing'}</button><button onClick={() => dispatch({ type: 'TOGGLE_ROUTING_HINT' })} className="sq2-focus rounded-sm border border-white/15 px-3 py-2 text-[10px]">{state.routingHintVisible ? 'Hide hint' : 'Show hint'}</button><button onClick={() => dispatch({ type: 'RESET_ROUTING' })} className="sq2-focus rounded-sm border border-rose-300/30 px-3 py-2 text-[10px] text-rose-200">Reset Step 9</button></div>{state.routingHintVisible && <p className="mt-3 border-l-2 border-cyan-300 bg-cyan-300/[.06] px-3 py-2 text-xs leading-5 text-slate-300">Suggested simulator order based on Build 4: route the short internal Qwiic links first, then longer links, then the two power leads. This ordering is inferred, not an official instruction.</p>}</div>
    </>}
  </section>
}
