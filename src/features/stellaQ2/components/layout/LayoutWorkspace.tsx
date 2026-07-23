import { useMemo, useRef, useState } from 'react'
import { BUILD_PHOTO_BY_ID } from '../../data/buildPhotos'
import {
  LAYOUT_TARGET_BY_ID,
  LAYOUT_TARGET_BY_PART_ID,
  LAYOUT_VISUAL_BY_PART_ID,
  LAYOUT_TARGETS,
  STEP_FIVE_PART_IDS,
} from '../../data/componentLayout'
import { PART_BY_ID } from '../../data/parts'
import { sourceAssetUrl } from '../../data/sourceReferences'
import { findLayoutSnapTarget, validateLayout } from '../../utils/componentLayout'
import type { ComponentPlacement, LabAction, LabState, LayoutPartId } from '../../types'
import TechnicalComponent from './TechnicalComponent'

interface LayoutWorkspaceProps {
  state: LabState
  dispatch: (action: LabAction) => void
}

const BUILD_ONE = BUILD_PHOTO_BY_ID.get('build-one-layout')!
const DIAGRAM_URL = '/assets/stella-q2/flat-assembly-diagram.webp'

const validationCopy = {
  idle: 'Place all eight loose electronics on their documented Step 5 positions. Cables stay locked until Step 6.',
  incomplete: 'Some parts still need to be placed on their documented outlines.',
  valid: 'Layout verified: all eight components are staged correctly, and the CR1220 remains loose with its positive face up.',
  'wrong-part': 'At least one part is staged over another component’s documented outline.',
  'wrong-orientation': 'At least one component needs to be rotated to match the reference.',
  'coin-face-down': 'Turn the loose CR1220 so the positive (+) face is visible.',
  'target-occupied': 'Only one component may occupy each documented target.',
  'cables-not-available': 'Qwiic cables are intentionally unavailable until Step 6.',
} as const

export default function LayoutWorkspace({ state, dispatch }: LayoutWorkspaceProps) {
  const boardRef = useRef<HTMLDivElement>(null)
  const [diagramOpacity, setDiagramOpacity] = useState(0.92)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [accessRotation, setAccessRotation] = useState(0)
  const [accessCoinFace, setAccessCoinFace] = useState<ComponentPlacement['face']>('positive-up')
  const dragPartRef = useRef<LayoutPartId | null>(null)

  const selectedPart = state.selectedLayoutPartId
  const selectedPlacement = selectedPart
    ? state.layoutPlacements.find((placement) => placement.partId === selectedPart)
    : undefined
  const selectedTarget = state.selectedLayoutTargetId
    ? LAYOUT_TARGET_BY_ID.get(state.selectedLayoutTargetId)
    : undefined
  const validation = useMemo(() => validateLayout(state.layoutPlacements), [state.layoutPlacements])
  const placedPartIds = new Set(state.layoutPlacements.map((placement) => placement.partId))
  const sourcePhotoUrl = sourceAssetUrl(BUILD_ONE.assetPath)

  const clientToBoardPoint = (clientX: number, clientY: number) => {
    const element = boardRef.current
    if (!element) return null
    const rect = element.getBoundingClientRect()
    return {
      x: Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (clientY - rect.top) / rect.height)),
    }
  }

  const placeAt = (
    partId: LayoutPartId,
    x: number,
    y: number,
    rotation = 0,
    targetId?: string | null,
    face = partId === 'cr1220' ? (accessCoinFace ?? 'negative-up') : null,
  ) => {
    const current = state.layoutPlacements.filter((placement) => placement.partId !== partId)
    const snappedTarget = targetId ? LAYOUT_TARGET_BY_ID.get(targetId) : findLayoutSnapTarget(partId, x, y, rotation, current)
    const correctTarget = LAYOUT_TARGET_BY_PART_ID.get(partId)
    const finalTarget = snappedTarget ?? null
    const placement: ComponentPlacement = {
      partId,
      targetId: finalTarget?.id ?? null,
      x: finalTarget?.x ?? x,
      y: finalTarget?.y ?? y,
      rotation,
      face,
      snapped: Boolean(finalTarget),
    }
    // If keyboard placement selects a target that belongs to another part, retain
    // that target intentionally so validation can explain the mismatch.
    if (targetId && snappedTarget && targetId !== correctTarget?.id) {
      placement.targetId = targetId
      placement.snapped = true
    }
    dispatch({ type: 'PLACE_LAYOUT_PART', placement })
  }

  const onBoardClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedPart || (event.target as HTMLElement).closest('[data-layout-component]')) return
    const point = clientToBoardPoint(event.clientX, event.clientY)
    if (point) placeAt(selectedPart, point.x, point.y, selectedPlacement?.rotation ?? 0, undefined, selectedPlacement?.face)
  }

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const partId = (event.dataTransfer.getData('application/x-stella-layout-part') || dragPartRef.current) as LayoutPartId | null
    const point = clientToBoardPoint(event.clientX, event.clientY)
    if (partId && STEP_FIVE_PART_IDS.includes(partId) && point) {
      dispatch({ type: 'SELECT_LAYOUT_PART', partId })
      const existingPlacement = state.layoutPlacements.find((placement) => placement.partId === partId)
      placeAt(partId, point.x, point.y, existingPlacement?.rotation ?? 0, undefined, existingPlacement?.face)
    }
    dragPartRef.current = null
  }

  const layoutBoard = (
    <div
      ref={boardRef}
      className="relative aspect-[1980/1536] w-full overflow-hidden rounded-sm bg-[#edf0ed] shadow-inner"
      onClick={onBoardClick}
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
      aria-label="Interactive flat assembly diagram. Select a component, then click its documented location to place it."
      style={{
        transform: `translate(${state.layoutPan[0]}px, ${state.layoutPan[1]}px) scale(${state.layoutZoom})`,
        transformOrigin: 'center center',
      }}
    >
      <img
        src={DIAGRAM_URL}
        alt="Original STELLA-Q2 flat assembly diagram used as the Step 5 placement surface."
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full object-contain"
        style={{ opacity: diagramOpacity }}
      />
      {state.layoutTargetOutlinesVisible && LAYOUT_TARGETS.map((target) => {
        const occupied = state.layoutPlacements.some((placement) => placement.targetId === target.id)
        const active = selectedTarget?.id === target.id || selectedPart === target.partId
        return (
          <button
            key={target.id}
            type="button"
            aria-label={`Select ${target.label} target`}
            title={target.label}
            onClick={(event) => {
              event.stopPropagation()
              dispatch({ type: 'SELECT_LAYOUT_TARGET', targetId: target.id })
              if (selectedPart) {
                placeAt(selectedPart, target.x, target.y, selectedPlacement?.rotation ?? 0, target.id, selectedPlacement?.face)
              }
            }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-sm border transition ${
              occupied
                ? 'border-emerald-500/65 bg-emerald-400/10'
                : active
                  ? 'border-cyan-500 bg-cyan-300/15'
                  : 'border-cyan-600/45 bg-cyan-300/[0.035] hover:border-cyan-400'
            }`}
            style={{ left: `${target.x * 100}%`, top: `${target.y * 100}%`, width: `${target.width * 100}%`, height: `${target.height * 100}%` }}
          >
            <span className="sr-only">{target.label}</span>
          </button>
        )
      })}
      {state.layoutPlacements.map((placement) => {
        const target = LAYOUT_TARGET_BY_PART_ID.get(placement.partId)!
        const selected = placement.partId === selectedPart
        return (
          <button
            key={placement.partId}
            data-layout-component
            type="button"
            draggable
            onDragStart={(event) => {
              dragPartRef.current = placement.partId
              event.dataTransfer.setData('application/x-stella-layout-part', placement.partId)
              event.dataTransfer.effectAllowed = 'move'
            }}
            onClick={(event) => {
              event.stopPropagation()
              dispatch({ type: 'SELECT_LAYOUT_PART', partId: placement.partId })
              dispatch({ type: 'SELECT_LAYOUT_TARGET', targetId: placement.targetId })
            }}
            className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-sm p-0 transition focus:outline-none ${selected ? 'ring-2 ring-cyan-300 ring-offset-2 ring-offset-[#edf0ed]' : ''}`}
            style={{ left: `${placement.x * 100}%`, top: `${placement.y * 100}%`, width: `${target.width * 100}%`, height: `${target.height * 100}%`, transform: `translate(-50%, -50%) rotate(${placement.rotation}deg)` }}
          >
            <TechnicalComponent partId={placement.partId} face={placement.face} compact />
            <span className="sr-only">Placed {LAYOUT_VISUAL_BY_PART_ID.get(placement.partId)?.label}</span>
          </button>
        )
      })}
    </div>
  )

  return (
    <section aria-labelledby="layout-workspace-title" className="space-y-4">
      <p className="sr-only" role="status" aria-live="polite">
        {validationCopy[state.layoutValidation]}
      </p>

      <header className="sq2-panel rounded-sm p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-300">Interactive Step 5</p>
            <h2 id="layout-workspace-title" className="mt-1 text-lg font-semibold text-white">Lay out loose components</h2>
            <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-400">
              Stage the eight documented electronics on the original flat assembly diagram. This is a loose, unconnected layout only—cable routing begins in Step 6.
            </p>
          </div>
          <span className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold ${validation.status === 'valid' ? 'border-emerald-300/40 bg-emerald-300/10 text-emerald-200' : 'border-amber-300/30 bg-amber-300/10 text-amber-100'}`}>
            {validation.correctPartIds.length} / {STEP_FIVE_PART_IDS.length} placed correctly
          </span>
        </div>
        <p className="mt-3 rounded-sm border border-amber-300/25 bg-amber-300/[0.06] px-3 py-2 text-[10px] leading-4 text-amber-100">
          The printed diagram is a 1:1 reference only at 100% print scale. Browser display is responsive and is not physical scale.
        </p>
      </header>

      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_20rem]">
        <section className={`${isFullscreen ? 'fixed inset-4 z-50 overflow-auto bg-[#030916] p-4 shadow-2xl' : ''} min-w-0`}>
          <div className="sq2-panel flex flex-wrap items-center justify-between gap-3 rounded-sm p-3">
            <fieldset className="flex flex-wrap gap-1" aria-label="Reference comparison mode">
              <legend className="sr-only">Reference comparison mode</legend>
              {(['diagram', 'build-one', 'side-by-side', 'overlay'] as const).map((mode) => (
                <button key={mode} type="button" onClick={() => dispatch({ type: 'SET_LAYOUT_COMPARISON_MODE', mode })} aria-pressed={state.layoutComparisonMode === mode} className={`sq2-focus rounded-sm px-2.5 py-2 text-[9px] font-semibold uppercase tracking-[0.08em] ${state.layoutComparisonMode === mode ? 'bg-white text-[#03101c]' : 'text-slate-500 hover:bg-white/10 hover:text-white'}`}>
                  {mode === 'build-one' ? 'Build 1' : mode.replace('-', ' ')}
                </button>
              ))}
            </fieldset>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => dispatch({ type: 'SET_LAYOUT_VIEW', zoom: state.layoutZoom - 0.15, pan: state.layoutPan })} className="sq2-focus rounded-sm border border-white/15 px-2.5 py-2 text-[9px] font-semibold text-slate-400 hover:text-white" aria-label="Zoom out">−</button>
              <button type="button" onClick={() => dispatch({ type: 'SET_LAYOUT_VIEW', zoom: 1, pan: [0, 0] })} className="sq2-focus rounded-sm border border-white/15 px-2.5 py-2 text-[9px] font-semibold text-slate-400 hover:text-white">Fit</button>
              <button type="button" onClick={() => dispatch({ type: 'SET_LAYOUT_VIEW', zoom: state.layoutZoom + 0.15, pan: state.layoutPan })} className="sq2-focus rounded-sm border border-white/15 px-2.5 py-2 text-[9px] font-semibold text-slate-400 hover:text-white" aria-label="Zoom in">+</button>
              <button type="button" onClick={() => dispatch({ type: 'SET_LAYOUT_VIEW', zoom: state.layoutZoom, pan: [state.layoutPan[0] - 28, state.layoutPan[1]] })} className="sq2-focus rounded-sm border border-white/15 px-2 py-2 text-[9px] font-semibold text-slate-400 hover:text-white" aria-label="Pan diagram left">←</button>
              <button type="button" onClick={() => dispatch({ type: 'SET_LAYOUT_VIEW', zoom: state.layoutZoom, pan: [state.layoutPan[0] + 28, state.layoutPan[1]] })} className="sq2-focus rounded-sm border border-white/15 px-2 py-2 text-[9px] font-semibold text-slate-400 hover:text-white" aria-label="Pan diagram right">→</button>
              <label className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                Diagram
                <input aria-label="Diagram opacity" type="range" min="0.35" max="1" step="0.05" value={diagramOpacity} onChange={(event) => setDiagramOpacity(Number(event.target.value))} className="accent-cyan-300" />
              </label>
              <button type="button" onClick={() => dispatch({ type: 'TOGGLE_LAYOUT_TARGET_OUTLINES' })} aria-pressed={state.layoutTargetOutlinesVisible} className={`sq2-focus rounded-sm border px-2.5 py-2 text-[9px] font-semibold ${state.layoutTargetOutlinesVisible ? 'border-cyan-300/55 text-cyan-100' : 'border-white/15 text-slate-500'}`}>Outlines</button>
              <button type="button" onClick={() => dispatch({ type: 'TOGGLE_LAYOUT_HINT' })} aria-pressed={state.layoutHintVisible} className={`sq2-focus rounded-sm border px-2.5 py-2 text-[9px] font-semibold ${state.layoutHintVisible ? 'border-cyan-300/55 text-cyan-100' : 'border-white/15 text-slate-500'}`}>Hint</button>
              <button type="button" onClick={() => setIsFullscreen((value) => !value)} className="sq2-focus rounded-sm border border-white/15 px-2.5 py-2 text-[9px] font-semibold text-slate-400 hover:text-white">{isFullscreen ? 'Close view' : 'Focus view'}</button>
            </div>
          </div>

          <div className="mt-3 overflow-auto rounded-sm border border-white/10 bg-[#111828] p-3 sq2-scrollbar">
            {state.layoutComparisonMode === 'build-one' ? (
              <figure className="grid min-h-[28rem] place-items-center bg-black/25"><img src={sourcePhotoUrl} alt={BUILD_ONE.alt} className="max-h-[48rem] w-full object-contain" /><figcaption className="sr-only">{BUILD_ONE.caption}</figcaption></figure>
            ) : state.layoutComparisonMode === 'side-by-side' ? (
              <div className="grid gap-3 lg:grid-cols-2"><div>{layoutBoard}</div><figure className="grid place-items-center bg-black/20"><img src={sourcePhotoUrl} alt={BUILD_ONE.alt} className="h-full max-h-[42rem] w-full object-contain" /></figure></div>
            ) : state.layoutComparisonMode === 'overlay' ? (
              <div className="relative"><div className="opacity-100">{layoutBoard}</div><img src={sourcePhotoUrl} alt="Official Build 1 photograph overlaid for visual comparison." className="pointer-events-none absolute inset-0 h-full w-full object-contain opacity-35 mix-blend-screen" /></div>
            ) : layoutBoard}
          </div>
          {state.layoutHintVisible && <p className="mt-3 border-l-2 border-cyan-300 bg-cyan-300/[0.06] px-3 py-2 text-[10px] leading-5 text-slate-300">Begin with the red Thing Plus board at lower left, then compare each silhouette against Build 1. Keep the CR1220 loose: do not place it into the clock holder in this step.</p>}
          <p className="mt-2 text-[10px] leading-4 text-slate-500">Source comparison: {BUILD_ONE.filename}. The official photo is evidence; the placement targets are read from the original flat assembly diagram.</p>
        </section>

        <aside className="sq2-panel rounded-sm p-4" aria-label="Selected electronics component">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-300">Selected component</p>
          <h3 className="mt-1 text-sm font-semibold text-white">{selectedPart ? LAYOUT_VISUAL_BY_PART_ID.get(selectedPart)?.label : 'Choose a component'}</h3>
          <p className="mt-2 text-[11px] leading-5 text-slate-400">{selectedPart ? PART_BY_ID.get(selectedPart)?.purpose : 'Pick from the tray, drag it onto the diagram, or use the accessible placement controls.'}</p>
          {selectedPart && <div className="mt-4 flex aspect-[1.7/1] max-w-[12rem] items-center justify-center rounded-sm border border-white/10 bg-black/20 p-5"><TechnicalComponent partId={selectedPart} face={selectedPlacement?.face ?? accessCoinFace} /></div>}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => selectedPart && dispatch({ type: 'ROTATE_LAYOUT_PART', partId: selectedPart, delta: -90 })} disabled={!selectedPlacement} className="sq2-focus min-h-9 rounded-sm border border-white/15 text-[10px] font-semibold text-slate-300 disabled:opacity-30">↺ Rotate</button>
            <button type="button" onClick={() => selectedPart && dispatch({ type: 'ROTATE_LAYOUT_PART', partId: selectedPart, delta: 90 })} disabled={!selectedPlacement} className="sq2-focus min-h-9 rounded-sm border border-white/15 text-[10px] font-semibold text-slate-300 disabled:opacity-30">Rotate ↻</button>
            <button type="button" onClick={() => selectedPart && dispatch({ type: 'RETURN_LAYOUT_PART_TO_TRAY', partId: selectedPart })} disabled={!selectedPlacement} className="sq2-focus col-span-2 min-h-9 rounded-sm border border-white/15 text-[10px] font-semibold text-slate-300 disabled:opacity-30">Return to tray</button>
          </div>
          {selectedPart === 'cr1220' && selectedPlacement && <fieldset className="mt-4"><legend className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500">Coin-cell face</legend><div className="mt-2 flex gap-2">{(['positive-up', 'negative-up'] as const).map((face) => <button key={face} type="button" onClick={() => dispatch({ type: 'SET_COIN_CELL_FACE', face })} aria-pressed={selectedPlacement.face === face} className={`sq2-focus rounded-sm border px-3 py-2 text-[10px] font-semibold ${selectedPlacement.face === face ? 'border-cyan-300 text-cyan-100' : 'border-white/15 text-slate-400'}`}>{face === 'positive-up' ? '+ up' : '− up'}</button>)}</div></fieldset>}
          <div className="mt-4 border-t border-white/10 pt-4"><p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500">Validation</p><p className="mt-2 text-[11px] leading-5 text-slate-300">{validationCopy[state.layoutValidation]}</p><button type="button" onClick={() => dispatch({ type: 'CHECK_LAYOUT' })} className="sq2-focus mt-3 min-h-10 w-full rounded-sm border border-cyan-300/50 text-xs font-semibold text-cyan-100 hover:bg-cyan-300 hover:text-[#03101c]">Check layout</button></div>
        </aside>
      </div>

      <section className="sq2-panel rounded-sm p-4" aria-labelledby="component-tray-title">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-300">Component tray</p><h3 id="component-tray-title" className="mt-1 text-sm font-semibold text-white">Loose Step 5 electronics</h3></div><span className="font-mono text-[10px] text-slate-500">Drag or select + click a target</span></div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {STEP_FIVE_PART_IDS.map((partId) => {
            const visual = LAYOUT_VISUAL_BY_PART_ID.get(partId)!
            const placed = placedPartIds.has(partId)
            const active = selectedPart === partId
            return <button key={partId} type="button" draggable onDragStart={(event) => { dragPartRef.current = partId; event.dataTransfer.setData('application/x-stella-layout-part', partId); event.dataTransfer.effectAllowed = 'move' }} onClick={() => { dispatch({ type: 'SELECT_LAYOUT_PART', partId }); dispatch({ type: 'SELECT_LAYOUT_TARGET', targetId: LAYOUT_TARGET_BY_PART_ID.get(partId)?.id ?? null }); setAccessCoinFace(partId === 'cr1220' ? 'positive-up' : null) }} aria-pressed={active} className={`sq2-focus flex min-h-16 items-center gap-3 rounded-sm border p-2 text-left transition ${active ? 'border-cyan-300 bg-cyan-300/[0.08]' : 'border-white/10 bg-black/10 hover:border-white/30'} ${placed ? 'opacity-60' : ''}`}><span className="h-11 w-14 shrink-0"><TechnicalComponent partId={partId} face={partId === 'cr1220' ? 'positive-up' : null} compact /></span><span><span className="block text-[11px] font-semibold text-slate-200">{visual.label}</span><span className="mt-1 block text-[9px] text-slate-500">{placed ? 'Placed · select to adjust' : 'Loose · ready to stage'}</span></span></button>
          })}
        </div>
        <div className="mt-3 rounded-sm border border-white/10 bg-black/20 px-3 py-3 text-[10px] leading-5 text-slate-400"><strong className="text-slate-200">4 Qwiic cables</strong> are visible in the source photo but intentionally locked in Step 5. Connections and cable routing are introduced only in Step 6.</div>
      </section>

      <section className="sq2-panel rounded-sm p-4" aria-labelledby="accessible-placement-title">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-300">Keyboard-accessible placement</p><h3 id="accessible-placement-title" className="mt-1 text-sm font-semibold text-white">Stage by documented target</h3></div><div className="flex gap-2"><button type="button" onClick={() => dispatch({ type: 'UNDO_LAYOUT' })} disabled={!state.layoutUndoHistory.length} className="sq2-focus rounded-sm border border-white/15 px-3 py-2 text-[10px] font-semibold disabled:opacity-30">Undo</button><button type="button" onClick={() => dispatch({ type: 'REDO_LAYOUT' })} disabled={!state.layoutRedoHistory.length} className="sq2-focus rounded-sm border border-white/15 px-3 py-2 text-[10px] font-semibold disabled:opacity-30">Redo</button><button type="button" onClick={() => dispatch({ type: 'RESET_LAYOUT' })} className="sq2-focus rounded-sm border border-white/15 px-3 py-2 text-[10px] font-semibold">Reset</button></div></div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_8rem_8rem_auto]">
          <label className="text-[10px] font-semibold text-slate-400">Component<select value={selectedPart ?? ''} onChange={(event) => dispatch({ type: 'SELECT_LAYOUT_PART', partId: event.target.value as LayoutPartId || null })} className="mt-1 block w-full rounded-sm border border-white/15 bg-[#030916] px-2 py-2 text-xs text-white">{STEP_FIVE_PART_IDS.map((partId) => <option key={partId} value={partId}>{LAYOUT_VISUAL_BY_PART_ID.get(partId)?.label}</option>)}</select></label>
          <label className="text-[10px] font-semibold text-slate-400">Target<select value={state.selectedLayoutTargetId ?? ''} onChange={(event) => dispatch({ type: 'SELECT_LAYOUT_TARGET', targetId: event.target.value || null })} className="mt-1 block w-full rounded-sm border border-white/15 bg-[#030916] px-2 py-2 text-xs text-white">{LAYOUT_TARGETS.map((target) => <option key={target.id} value={target.id}>{target.label}</option>)}</select></label>
          <label className="text-[10px] font-semibold text-slate-400">Rotation<select value={accessRotation} onChange={(event) => setAccessRotation(Number(event.target.value))} className="mt-1 block w-full rounded-sm border border-white/15 bg-[#030916] px-2 py-2 text-xs text-white">{[0, 90, 180, 270].map((rotation) => <option key={rotation} value={rotation}>{rotation}°</option>)}</select></label>
          {selectedPart === 'cr1220' ? <label className="text-[10px] font-semibold text-slate-400">Coin face<select value={accessCoinFace ?? 'negative-up'} onChange={(event) => setAccessCoinFace(event.target.value as ComponentPlacement['face'])} className="mt-1 block w-full rounded-sm border border-white/15 bg-[#030916] px-2 py-2 text-xs text-white"><option value="positive-up">+ up</option><option value="negative-up">− up</option></select></label> : <div />}
          <button type="button" onClick={() => selectedPart && state.selectedLayoutTargetId && placeAt(selectedPart, 0.5, 0.5, accessRotation, state.selectedLayoutTargetId)} disabled={!selectedPart || !state.selectedLayoutTargetId} className="sq2-focus min-h-10 self-end rounded-sm bg-cyan-300 px-4 text-xs font-semibold text-[#03101c] disabled:opacity-30">Place</button>
        </div>
      </section>
    </section>
  )
}
