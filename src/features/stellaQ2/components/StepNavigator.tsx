import type { BuildStep } from '../types'

interface StepNavigatorProps {
  steps: BuildStep[]
  activeStepId: string
  completedStepIds: string[]
  onSelect: (stepId: string) => void
}

export default function StepNavigator({
  steps,
  activeStepId,
  completedStepIds,
  onSelect,
}: StepNavigatorProps) {
  return (
    <nav aria-label="STELLA-Q2 build steps" className="sq2-panel overflow-hidden rounded-sm">
      <div className="border-b border-white/10 px-4 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300">
          Physical build
        </p>
        <p className="mt-1 text-xs text-slate-500">12 source-documented steps</p>
      </div>
      <ol className="max-h-[31rem] overflow-y-auto py-2 sq2-scrollbar lg:max-h-[calc(100vh-20rem)]">
        {steps.map((step) => {
          const active = step.id === activeStepId
          const completed = completedStepIds.includes(step.id)
          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => onSelect(step.id)}
                aria-current={active ? 'step' : undefined}
                className={`sq2-focus group grid w-full grid-cols-[2.25rem_1fr_auto] items-center gap-2 border-l-2 px-3 py-3 text-left transition ${
                  active
                    ? 'border-cyan-300 bg-cyan-300/[0.08] text-white'
                    : 'border-transparent text-slate-400 hover:bg-white/[0.035] hover:text-slate-200'
                }`}
              >
                <span
                  className={`grid h-7 w-7 place-items-center rounded-full border font-mono text-[10px] ${
                    completed
                      ? 'border-cyan-300 bg-cyan-300 text-[#03101c]'
                      : active
                        ? 'border-cyan-300/70 text-cyan-200'
                        : 'border-white/15 text-slate-500'
                  }`}
                >
                  {completed ? '✓' : step.number.toString().padStart(2, '0')}
                </span>
                <span className="text-xs font-medium leading-4">{step.shortTitle}</span>
                {step.photoIds.length > 0 && (
                  <span className="text-[9px] uppercase tracking-[0.12em] text-slate-600 group-hover:text-slate-400">
                    photo
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
