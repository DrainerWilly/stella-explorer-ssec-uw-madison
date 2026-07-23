import { useMemo, useState } from 'react'
import { BUILD_PHOTO_BY_ID } from '../../data/buildPhotos'
import {
  CAMERA_PRESETS,
  removableTargetsForEnclosurePart,
  SCAFFOLD_TARGET_BY_ID,
  SCAFFOLDING_MODEL_BY_ID,
  targetsForEnclosurePart,
} from '../../data/scaffolding'
import {
  missingScaffoldIds,
  scaffoldPartIsComplete,
  stlLoadFailureMessage,
} from '../../utils/scaffolding'
import type {
  LabAction,
  LabState,
  ScaffoldCameraPreset,
} from '../../types'
import ScaffoldPhotoComparison, { type ScaffoldComparisonMode } from './ScaffoldPhotoComparison'
import ScaffoldViewport from './ScaffoldViewport'

interface ScaffoldingWorkspaceProps {
  state: LabState
  dispatch: (action: LabAction) => void
}

const CAMERA_LABELS: Record<ScaffoldCameraPreset, string> = {
  fit: 'Reset / fit',
  front: 'Front',
  back: 'Back',
  top: 'Top',
  bottom: 'Bottom',
  left: 'Left',
  right: 'Right',
}

export default function ScaffoldingWorkspace({ state, dispatch }: ScaffoldingWorkspaceProps) {
  const [wireframe, setWireframe] = useState(false)
  const [xray, setXray] = useState(false)
  const [comparisonMode, setComparisonMode] = useState<ScaffoldComparisonMode>('side-by-side')
  const [loadError, setLoadError] = useState<Error | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  const model = SCAFFOLDING_MODEL_BY_ID.get(state.selectedEnclosurePart)
    ?? SCAFFOLDING_MODEL_BY_ID.get('top-housing')!
  const allTargets = targetsForEnclosurePart(model.id)
  const removableTargets = removableTargetsForEnclosurePart(model.id)
  const selectedTarget = state.selectedScaffoldId
    ? SCAFFOLD_TARGET_BY_ID.get(state.selectedScaffoldId)
    : undefined
  const missing = missingScaffoldIds(model.id, state.removedScaffoldIds)
  const complete = scaffoldPartIsComplete(model.id, state.removedScaffoldIds)

  const feedback = useMemo(() => {
    const missingLabels = missing
      .map((id) => SCAFFOLD_TARGET_BY_ID.get(id)?.label)
      .filter((label): label is string => Boolean(label))

    switch (state.scaffoldValidation) {
      case 'permanent-protected':
        return 'This is permanent enclosure geometry and should not be removed.'
      case 'nothing-selected':
        return 'Select a documented scaffold target before removing material.'
      case 'already-removed':
        return 'That documented scaffold target has already been moved to the discarded-material tray.'
      case 'complete':
        return 'Both source-supported parts are clear. Step 4 is validated.'
      case 'top-complete':
        return 'Top housing complete; bottom cover still requires attention.'
      case 'bottom-complete':
        return 'Bottom cover complete; top housing still requires attention.'
      case 'top-incomplete':
        return `${missingLabels.length} scaffolding ${missingLabels.length === 1 ? 'piece remains' : 'pieces remain'} on the top housing.`
      case 'bottom-incomplete':
        return `${missingLabels.length} scaffolding ${missingLabels.length === 1 ? 'piece remains' : 'pieces remain'} on the bottom cover.`
      default:
        return state.guidance === 'beginner'
          ? 'Select a highlighted photo-supported target, confirm its label, then remove it.'
          : 'Use the official before-and-after photographs to identify the documented targets.'
    }
  }, [missing, state.guidance, state.scaffoldValidation])

  const selectEnclosure = (partId: 'top-housing' | 'bottom-cover') => {
    dispatch({ type: 'SELECT_SCAFFOLDING_PART', partId })
    dispatch({ type: 'SELECT_PART', partId })
    const nextModel = SCAFFOLDING_MODEL_BY_ID.get(partId)
    if (nextModel) dispatch({ type: 'SELECT_PHOTO', photoId: nextModel.beforePhotoId })
    setLoadError(null)
  }

  const selectTarget = (targetId: string) => {
    dispatch({ type: 'SELECT_SCAFFOLD', scaffoldId: targetId })
  }

  return (
    <section aria-labelledby="scaffolding-workspace-title" className="space-y-4">
      <p className="sr-only" role="status" aria-live="polite">
        {feedback}
      </p>

      <header className="sq2-panel rounded-sm p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Interactive Step 4
            </p>
            <h2 id="scaffolding-workspace-title" className="mt-1 text-lg font-semibold text-white">
              Remove identified printing scaffolding
            </h2>
            <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-400">
              Use the source STL to inspect each enclosure part, then use the official before-and-after photographs to identify only the marked temporary material. Permanent enclosure geometry is protected.
            </p>
          </div>
          <span className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold ${
            complete ? 'border-emerald-300/40 bg-emerald-300/10 text-emerald-200' : 'border-amber-300/30 bg-amber-300/10 text-amber-100'
          }`}>
            {complete ? '✓ This part checked' : `${missing.length} targets remaining`}
          </span>
        </div>

        <fieldset className="mt-4 flex flex-wrap gap-2" aria-label="Choose enclosure part">
          <legend className="sr-only">Choose enclosure part</legend>
          {(['top-housing', 'bottom-cover'] as const).map((partId) => {
            const partModel = SCAFFOLDING_MODEL_BY_ID.get(partId)!
            const selected = model.id === partId
            const partComplete = scaffoldPartIsComplete(partId, state.removedScaffoldIds)
            return (
              <button
                key={partId}
                type="button"
                onClick={() => selectEnclosure(partId)}
                aria-pressed={selected}
                className={`sq2-focus min-h-10 rounded-sm border px-4 text-xs font-semibold transition ${
                  selected
                    ? 'border-cyan-300 bg-cyan-300 text-[#03101c]'
                    : 'border-white/15 text-slate-300 hover:border-cyan-300/60 hover:text-white'
                }`}
              >
                {partComplete ? '✓ ' : ''}{partModel.label}
              </button>
            )
          })}
        </fieldset>
      </header>

      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_19rem]">
        <section className="min-w-0">
          <div className="sq2-panel flex flex-wrap items-center justify-between gap-3 rounded-sm p-3">
            <fieldset className="flex flex-wrap gap-1" aria-label="Three-dimensional view preset">
              <legend className="sr-only">Three-dimensional view preset</legend>
              {CAMERA_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => dispatch({ type: 'SET_SCAFFOLD_CAMERA', preset })}
                  aria-pressed={state.scaffoldCameraPreset === preset}
                  className={`sq2-focus rounded-sm px-2.5 py-2 text-[9px] font-semibold uppercase tracking-[0.08em] transition ${
                    state.scaffoldCameraPreset === preset
                      ? 'bg-white text-[#03101c]'
                      : 'text-slate-500 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {CAMERA_LABELS[preset]}
                </button>
              ))}
            </fieldset>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setWireframe((value) => !value)}
                aria-pressed={wireframe}
                className={`sq2-focus rounded-sm border px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.1em] transition ${wireframe ? 'border-cyan-300 bg-cyan-300/15 text-cyan-100' : 'border-white/15 text-slate-400 hover:text-white'}`}
              >
                Wireframe
              </button>
              <button
                type="button"
                onClick={() => setXray((value) => !value)}
                aria-pressed={xray}
                className={`sq2-focus rounded-sm border px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.1em] transition ${xray ? 'border-cyan-300 bg-cyan-300/15 text-cyan-100' : 'border-white/15 text-slate-400 hover:text-white'}`}
              >
                X-ray
              </button>
            </div>
          </div>

          <div className="mt-3">
            {loadError ? (
              <div role="alert" className="grid min-h-[25rem] place-items-center rounded-sm border border-rose-300/25 bg-rose-300/[0.05] p-6 text-center sm:min-h-[34rem]">
                <div>
                  <p className="text-sm font-semibold text-rose-100">{model.label} STL unavailable</p>
                  <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-400">
                    {stlLoadFailureMessage(model.label)}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setLoadError(null)
                      setRetryKey((value) => value + 1)
                    }}
                    className="sq2-focus mt-4 rounded-sm border border-white/20 px-4 py-2 text-xs font-semibold text-white hover:border-cyan-300 hover:text-cyan-200"
                  >
                    Try loading STL again
                  </button>
                </div>
              </div>
            ) : (
              <ScaffoldViewport
                key={`${model.id}-${retryKey}`}
                model={model}
                targets={state.guidance === 'expert' ? allTargets : allTargets.filter((target) => target.kind === 'removable' || state.selectedScaffoldId === target.id)}
                removedScaffoldIds={state.removedScaffoldIds}
                selectedScaffoldId={state.selectedScaffoldId}
                cameraPreset={state.scaffoldCameraPreset}
                wireframe={wireframe}
                xray={xray}
                onSelectTarget={selectTarget}
                onLoadError={(error) => setLoadError(error)}
                onLoaded={() => setLoadError(null)}
              />
            )}
          </div>
        </section>

        <aside className="sq2-panel rounded-sm p-4" aria-label="Scaffolding controls and status">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-300">Selected target</p>
          <h3 className="mt-1 text-sm font-semibold text-white">
            {selectedTarget?.label ?? 'Choose a documented region'}
          </h3>
          <p className="mt-2 text-[11px] leading-5 text-slate-400">
            {selectedTarget?.description ?? 'Use the canvas or the keyboard-accessible list below. The boxes are source-photo-supported teaching hitboxes over an unmodified source STL.'}
          </p>
          {selectedTarget && (
            <p className="mt-2 rounded-sm border border-white/10 bg-black/20 px-2 py-2 text-[9px] leading-4 text-slate-500">
              {selectedTarget.kind === 'permanent' ? 'Protected permanent feature' : `Photo reference: ${BUILD_PHOTO_BY_ID.get(selectedTarget.sourcePhotoId)?.filename ?? 'official Step 4 photo'}`}
            </p>
          )}

          <button
            type="button"
            onClick={() => dispatch({ type: 'REMOVE_SCAFFOLD' })}
            disabled={!selectedTarget}
            className="sq2-focus mt-4 min-h-11 w-full rounded-sm bg-cyan-300 px-4 text-xs font-semibold text-[#03101c] transition hover:bg-white disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-slate-600"
          >
            Remove scaffolding
          </button>
          <p className="mt-2 text-[9px] leading-4 text-slate-500">
            Permanent targets stay intact and return an explanation instead of being removed.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => dispatch({ type: 'UNDO_SCAFFOLD_REMOVAL' })}
              disabled={!state.scaffoldUndoHistory.length}
              className="sq2-focus min-h-9 rounded-sm border border-white/15 text-[10px] font-semibold text-slate-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              Undo
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: 'REDO_SCAFFOLD_REMOVAL' })}
              disabled={!state.scaffoldRedoHistory.length}
              className="sq2-focus min-h-9 rounded-sm border border-white/15 text-[10px] font-semibold text-slate-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              Redo
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: 'RESET_SCAFFOLDING_PART' })}
              className="sq2-focus min-h-9 rounded-sm border border-white/15 text-[10px] font-semibold text-slate-300 hover:text-white"
            >
              Reset part
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: 'TOGGLE_SCAFFOLD_HINT' })}
              aria-pressed={state.scaffoldHintVisible}
              className={`sq2-focus min-h-9 rounded-sm border text-[10px] font-semibold transition ${state.scaffoldHintVisible ? 'border-cyan-300 text-cyan-100' : 'border-white/15 text-slate-300 hover:text-white'}`}
            >
              {state.scaffoldHintVisible ? 'Hide hint' : 'Show hint'}
            </button>
          </div>

          {state.scaffoldHintVisible && (
            <div className="mt-4 border-l-2 border-cyan-300 bg-cyan-300/[0.06] px-3 py-3 text-[10px] leading-5 text-slate-300">
              Compare the arrows in the Before photograph with the cleared openings in After. Do not select the outer housing wall, latch, or the large bottom-cover collar.
            </div>
          )}

          <div className="mt-4 border-t border-white/10 pt-4">
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">Validation</p>
            <p className="mt-2 text-[11px] leading-5 text-slate-300">{feedback}</p>
            <button
              type="button"
              onClick={() => dispatch({ type: 'CHECK_SCAFFOLDING' })}
              className="sq2-focus mt-3 min-h-10 w-full rounded-sm border border-cyan-300/50 px-4 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300 hover:text-[#03101c]"
            >
              Check step
            </button>
          </div>
        </aside>
      </div>

      <section aria-labelledby="scaffold-list-title" className="sq2-panel rounded-sm p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-300">Keyboard-accessible task list</p>
            <h3 id="scaffold-list-title" className="mt-1 text-sm font-semibold text-white">Documented scaffolding targets</h3>
          </div>
          <span className="font-mono text-[10px] text-slate-500">{removableTargets.length - missing.length} / {removableTargets.length} removed</span>
        </div>
        <ul className="mt-3 space-y-2">
          {allTargets.map((target) => {
            const removed = state.removedScaffoldIds.includes(target.id)
            const selected = state.selectedScaffoldId === target.id
            const permanent = target.kind === 'permanent'
            return (
              <li key={target.id} className={`rounded-sm border p-3 ${selected ? 'border-cyan-300/60 bg-cyan-300/[0.07]' : 'border-white/10 bg-black/10'}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className={`text-[9px] font-semibold uppercase tracking-[0.14em] ${permanent ? 'text-amber-200' : removed ? 'text-emerald-200' : 'text-cyan-200'}`}>
                      {permanent ? 'Protected permanent geometry' : removed ? 'Removed · discarded tray' : 'Scaffold target'}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-white">{target.label}</p>
                    <p className="mt-1 max-w-3xl text-[10px] leading-4 text-slate-500">{target.location}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => selectTarget(target.id)}
                      className="sq2-focus min-h-8 rounded-sm border border-white/15 px-3 text-[10px] font-semibold text-slate-300 hover:text-white"
                    >
                      Select
                    </button>
                    {!permanent && (
                      <button
                        type="button"
                        onClick={() => dispatch({ type: 'REMOVE_SCAFFOLD', scaffoldId: target.id })}
                        disabled={removed}
                        className="sq2-focus min-h-8 rounded-sm border border-cyan-300/50 px-3 text-[10px] font-semibold text-cyan-100 hover:bg-cyan-300 hover:text-[#03101c] disabled:cursor-default disabled:opacity-40"
                      >
                        {removed ? 'Removed' : 'Remove'}
                      </button>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-labelledby="discarded-material-title" className="rounded-sm border border-white/10 bg-[#050b17] p-4">
        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500">Discarded-material tray</p>
        <h3 id="discarded-material-title" className="mt-1 text-sm font-semibold text-white">Removed source-supported targets</h3>
        {state.removedScaffoldIds.length ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {state.removedScaffoldIds.map((id) => (
              <li key={id} className="sq2-scaffold-discard rounded-sm border border-emerald-300/25 bg-emerald-300/[0.08] px-3 py-2 text-[10px] text-emerald-100">
                ✓ {SCAFFOLD_TARGET_BY_ID.get(id)?.label ?? id}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-[11px] text-slate-500">No documented support targets have been removed.</p>
        )}
      </section>

      <ScaffoldPhotoComparison model={model} mode={comparisonMode} onChangeMode={setComparisonMode} />

      <p className="rounded-sm border border-white/10 bg-black/20 px-4 py-3 text-[10px] leading-5 text-slate-500">
        Mesh evidence: {model.sourceNote} The source STL remains intact throughout this lesson; targets are explicitly identified from the official before-and-after photographs rather than fabricated triangle segmentation.
      </p>
    </section>
  )
}
