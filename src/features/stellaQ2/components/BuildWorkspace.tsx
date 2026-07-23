import { lazy, Suspense, useMemo } from 'react'
import { BUILD_STEP_BY_ID, BUILD_STEPS } from '../data/buildSteps'
import { PART_BY_ID, PARTS_LIST } from '../data/parts'
import type { LabAction, LabState, WorkspaceView } from '../types'
import AssemblyDiagram from './AssemblyDiagram'
import BuildPhotoViewer from './BuildPhotoViewer'
import ComponentInspector from './ComponentInspector'
import GuidanceSelector from './GuidanceSelector'
import PartsInventory from './PartsInventory'
import SourceReferencePanel from './SourceReferencePanel'
import StepInstruction from './StepInstruction'
import StepNavigator from './StepNavigator'

const ScaffoldingWorkspace = lazy(() => import('./scaffolding/ScaffoldingWorkspace'))
const LayoutWorkspace = lazy(() => import('./layout/LayoutWorkspace'))
const ConnectionsWorkspace = lazy(() => import('./connections/ConnectionsWorkspace'))
const EnclosureWorkspace = lazy(() => import('./enclosure/EnclosureWorkspace'))

interface BuildWorkspaceProps {
  state: LabState
  dispatch: (action: LabAction) => void
}

const FUTURE_MODES = ['Program', 'Operate', 'Measure'] as const

export default function BuildWorkspace({ state, dispatch }: BuildWorkspaceProps) {
  const activeStep = BUILD_STEP_BY_ID.get(state.activeBuildStepId) ?? BUILD_STEPS[0]
  const selectedPart = PART_BY_ID.get(state.selectedPartId) ?? PARTS_LIST[0]
  const activeIndex = BUILD_STEPS.findIndex((step) => step.id === activeStep.id)
  const isScaffoldingStep = activeStep.id === 'remove-scaffolding'
  const isLayoutStep = activeStep.id === 'parts-layout'
  const isConnectionsStep = activeStep.id === 'cable-connections'
  const isEnclosurePlacementStep = activeStep.id === 'enclosure-placement'
  const progressPercent = Math.round(
    (state.completedBuildStepIds.length / BUILD_STEPS.length) * 100,
  )

  const statusMessage = useMemo(
    () =>
      `Step ${activeStep.number} of ${BUILD_STEPS.length}: ${activeStep.title}. ${state.completedBuildStepIds.length} steps reviewed.`,
    [activeStep, state.completedBuildStepIds.length],
  )

  const selectStep = (stepId: string) => {
    dispatch({ type: 'SELECT_BUILD_STEP', stepId })
    const step = BUILD_STEP_BY_ID.get(stepId)
    if (step?.photoIds[0]) {
      dispatch({ type: 'SELECT_PHOTO', photoId: step.photoIds[0] })
    } else {
      dispatch({ type: 'SET_WORKSPACE_VIEW', view: 'diagram' })
    }
    if (step?.partIds[0]) {
      dispatch({ type: 'SELECT_PART', partId: step.partIds[0] })
    }
    if (step?.id === 'remove-scaffolding') {
      dispatch({ type: 'SELECT_SCAFFOLDING_PART', partId: 'top-housing' })
    }
    if (step?.id === 'parts-layout') {
      dispatch({ type: 'SELECT_LAYOUT_PART', partId: 'thing-plus-rp2040' })
      dispatch({ type: 'SELECT_LAYOUT_TARGET', targetId: 'microcontroller-outline' })
    }
    if (step?.id === 'enclosure-placement') {
      dispatch({ type: 'SELECT_ENCLOSURE_COMPONENT', partId: 'triad-spectral-sensor' })
      dispatch({ type: 'SELECT_ENCLOSURE_SLOT', slotId: 'triad-optical-bay' })
    }
  }

  const moveStep = (delta: -1 | 1) => {
    const nextIndex = Math.min(BUILD_STEPS.length - 1, Math.max(0, activeIndex + delta))
    selectStep(BUILD_STEPS[nextIndex].id)
  }

  const setView = (view: WorkspaceView) => {
    dispatch({ type: 'SET_WORKSPACE_VIEW', view })
  }

  const resetProgress = () => {
    if (window.confirm('Reset this browser session’s STELLA-Q2 build progress?')) {
      dispatch({ type: 'RESET_PROGRESS' })
    }
  }

  return (
    <main className="sq2-page order-1 flex min-h-full flex-1 flex-col overflow-y-auto bg-[#030916] text-slate-100">
      <p className="sr-only" role="status" aria-live="polite">
        {statusMessage}
      </p>

      <header className="border-b border-white/10 bg-[#030916]/95 px-4 pb-5 sm:px-7 lg:px-10">
        <div className="mx-auto flex w-full max-w-[1720px] flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <button
              type="button"
              onClick={() => dispatch({ type: 'RETURN_TO_INTRO' })}
              className="sq2-focus inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 transition hover:text-white"
            >
              <span aria-hidden="true">←</span> Lab overview
            </button>
            <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-300">
              STELLA-Q2 · interactive build workspace
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
              Physical build workspace
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Follow the official 12-step construction sequence. Step 4 provides a
              source-backed simulations and guided layout activities with official photo evidence.
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-5">
            <GuidanceSelector
              value={state.guidance}
              onChange={(guidance) => dispatch({ type: 'SET_GUIDANCE', guidance })}
            />
            <div className="min-w-44">
              <div className="flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                <span>Steps reviewed</span>
                <span className="font-mono text-cyan-300">{progressPercent}%</span>
              </div>
              <div
                className="mt-2 h-1 overflow-hidden rounded-full bg-white/10"
                role="progressbar"
                aria-label="Build steps reviewed"
                aria-valuemin={0}
                aria-valuemax={BUILD_STEPS.length}
                aria-valuenow={state.completedBuildStepIds.length}
              >
                <span
                  className="block h-full bg-cyan-300 transition-[width] duration-300 motion-reduce:transition-none"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={resetProgress}
              className="sq2-focus min-h-9 rounded-sm border border-white/10 px-3 text-[10px] font-semibold text-slate-500 transition hover:border-white/25 hover:text-white"
            >
              Reset progress
            </button>
          </div>
        </div>

        <nav className="mx-auto mt-6 flex w-full max-w-[1720px] items-center gap-2 overflow-x-auto pb-1 sq2-scrollbar" aria-label="Virtual lab modes">
          <span className="shrink-0 rounded-sm bg-cyan-300 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#03101c]">
            01 · Build
          </span>
          {FUTURE_MODES.map((mode, index) => (
            <span
              key={mode}
              aria-disabled="true"
              className="shrink-0 rounded-sm border border-white/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-700"
            >
              {String(index + 2).padStart(2, '0')} · {mode} · later phase
            </span>
          ))}
        </nav>
      </header>

      <div className="mx-auto grid w-full max-w-[1720px] flex-1 gap-4 px-4 py-4 sm:px-7 lg:grid-cols-[17.5rem_minmax(0,1fr)] lg:px-10 xl:grid-cols-[16rem_minmax(0,1fr)_19rem] 2xl:grid-cols-[17.5rem_minmax(0,1fr)_21rem]">
        <aside className="min-w-0" aria-label="Build navigation and step guidance">
          <StepNavigator
            steps={BUILD_STEPS}
            activeStepId={activeStep.id}
            completedStepIds={state.completedBuildStepIds}
            onSelect={selectStep}
          />
          <StepInstruction step={activeStep} guidance={state.guidance} />
        </aside>

        <section
          className="min-w-0"
          aria-label={isScaffoldingStep ? 'Interactive scaffolding workspace' : isLayoutStep ? 'Interactive components layout workspace' : isConnectionsStep ? 'Interactive cable connections workspace' : isEnclosurePlacementStep ? 'Interactive enclosure placement workspace' : undefined}
          aria-labelledby={isScaffoldingStep || isLayoutStep || isConnectionsStep || isEnclosurePlacementStep ? undefined : 'workspace-reference-title'}
        >
          {isScaffoldingStep ? (
            <Suspense
              fallback={
                <div className="sq2-panel min-h-[34rem] rounded-sm p-6 text-sm text-slate-400">
                  Loading the source-backed 3D workspace…
                </div>
              }
            >
              <ScaffoldingWorkspace state={state} dispatch={dispatch} />
            </Suspense>
          ) : isLayoutStep ? (
            <Suspense
              fallback={
                <div className="sq2-panel min-h-[34rem] rounded-sm p-6 text-sm text-slate-400">
                  Loading the Step 5 component layout…
                </div>
              }
            >
              <LayoutWorkspace state={state} dispatch={dispatch} />
            </Suspense>
          ) : isConnectionsStep ? (
            <Suspense fallback={<div className="sq2-panel min-h-[34rem] rounded-sm p-6 text-sm text-slate-400">Loading the Step 6 cable workspace…</div>}>
              <ConnectionsWorkspace state={state} dispatch={dispatch} />
            </Suspense>
          ) : isEnclosurePlacementStep ? (
            <Suspense fallback={<div className="sq2-panel min-h-[34rem] rounded-sm p-6 text-sm text-slate-400">Loading the Step 7 source-backed enclosure workspace…</div>}>
              <EnclosureWorkspace state={state} dispatch={dispatch} />
            </Suspense>
          ) : (
            <>
          <div className="sq2-panel flex flex-wrap items-center justify-between gap-3 rounded-sm p-3">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
                Build reference
              </p>
              <h2 id="workspace-reference-title" className="mt-1 text-sm font-semibold text-white">
                Diagram and official photo evidence
              </h2>
            </div>
            <fieldset className="inline-flex rounded-sm border border-white/10 bg-black/20 p-1">
              <legend className="sr-only">Build reference view</legend>
              {(['diagram', 'photos'] as const).map((view) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => setView(view)}
                  aria-pressed={state.workspaceView === view}
                  className={`sq2-focus rounded-sm px-3 py-2 text-[10px] font-semibold capitalize transition ${
                    state.workspaceView === view
                      ? 'bg-white text-[#03101c]'
                      : 'text-slate-500 hover:text-white'
                  }`}
                >
                  {view}
                </button>
              ))}
            </fieldset>
          </div>

          <div className="mt-4">
            {state.workspaceView === 'diagram' ? (
              <AssemblyDiagram />
            ) : (
              <BuildPhotoViewer
                selectedPhotoId={state.selectedPhotoId}
                onSelectPhoto={(photoId) => dispatch({ type: 'SELECT_PHOTO', photoId })}
              />
            )}
          </div>
            </>
          )}

          <div className="mt-4 flex flex-col gap-3 rounded-sm border border-white/10 bg-[#050b17] p-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => moveStep(-1)}
              disabled={activeIndex === 0}
              className="sq2-focus min-h-10 rounded-sm border border-white/15 px-4 text-xs font-semibold text-slate-300 transition hover:border-white/35 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              ← Previous step
            </button>
            <button
              type="button"
              onClick={() =>
                dispatch(
                  isScaffoldingStep
                    ? { type: 'CHECK_SCAFFOLDING' }
                    : isLayoutStep
                      ? { type: 'CHECK_LAYOUT' }
                    : isConnectionsStep
                        ? { type: 'CHECK_CONNECTIONS' }
                        : isEnclosurePlacementStep
                          ? { type: 'CHECK_ENCLOSURE' }
                    : { type: 'COMPLETE_BUILD_STEP', stepId: activeStep.id },
                )
              }
              disabled={state.completedBuildStepIds.includes(activeStep.id)}
              className="sq2-focus min-h-10 rounded-sm bg-cyan-300 px-5 text-xs font-semibold text-[#03101c] transition hover:bg-white disabled:cursor-default disabled:bg-emerald-300 disabled:text-emerald-950"
            >
              {state.completedBuildStepIds.includes(activeStep.id)
                ? isScaffoldingStep
                  ? '✓ Scaffolding validated'
                  : isLayoutStep
                    ? '✓ Layout validated'
                    : isConnectionsStep
                      ? '✓ Connections validated'
                      : isEnclosurePlacementStep
                        ? '✓ Placement validated'
                    : '✓ Marked reviewed'
                : isScaffoldingStep
                  ? 'Check scaffolding'
                  : isLayoutStep
                    ? 'Check layout'
                  : isConnectionsStep
                    ? 'Check connections'
                    : isEnclosurePlacementStep
                      ? 'Check enclosure placement'
                    : 'Mark step reviewed'}
            </button>
            <button
              type="button"
              onClick={() => moveStep(1)}
              disabled={activeIndex === BUILD_STEPS.length - 1}
              className="sq2-focus min-h-10 rounded-sm border border-white/15 px-4 text-xs font-semibold text-slate-300 transition hover:border-white/35 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              Next step →
            </button>
          </div>
        </section>

        <aside className="min-w-0 lg:col-span-2 xl:col-span-1" aria-label="Current build-step guidance">
          <PartsInventory
            selectedPartId={selectedPart.id}
            onSelect={(partId) => dispatch({ type: 'SELECT_PART', partId })}
          />
          <ComponentInspector selectedPartId={selectedPart.id} />
          <SourceReferencePanel step={activeStep} part={selectedPart} />
          <section className="mt-4 rounded-sm border border-rose-300/20 bg-rose-300/[0.04] p-4">
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-rose-200">
              Source-supported safety
            </p>
            <ul className="mt-2 space-y-2 text-[10px] leading-4 text-slate-400">
              <li>• Never use metal objects through the boot/reset access holes.</li>
              <li>• Never point the spectrometer directly at the Sun.</li>
            </ul>
          </section>
        </aside>
      </div>
    </main>
  )
}
