import type { BuildStep, GuidanceLevel } from '../types'

interface StepInstructionProps {
  step: BuildStep
  guidance: GuidanceLevel
}

export default function StepInstruction({ step, guidance }: StepInstructionProps) {
  return (
    <section aria-labelledby="active-step-title" className="sq2-panel mt-4 rounded-sm p-4">
      <div className="flex items-start gap-3">
        <span className="font-mono text-xs text-cyan-300">
          {step.number.toString().padStart(2, '0')}
        </span>
        <div>
          <h2 id="active-step-title" className="text-base font-semibold leading-5 text-white">
            {step.title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">{step.instruction}</p>
        </div>
      </div>

      <InstructionBlock label="Why it matters" text={step.why} compact={guidance === 'expert'} />
      <InstructionBlock label="Verify" text={step.verify} />
      <InstructionBlock label="Common mistake" text={step.commonMistake} tone="warning" compact={guidance === 'expert'} />
      {step.safety && (
        <InstructionBlock label="Safety" text={step.safety} tone="safety" />
      )}
    </section>
  )
}

function InstructionBlock({
  label,
  text,
  tone = 'default',
  compact = false,
}: {
  label: string
  text: string
  tone?: 'default' | 'warning' | 'safety'
  compact?: boolean
}) {
  const toneClass =
    tone === 'warning'
      ? 'border-amber-300/25 bg-amber-300/[0.04]'
      : tone === 'safety'
        ? 'border-rose-300/25 bg-rose-300/[0.04]'
        : 'border-white/8 bg-white/[0.025]'

  return (
    <div className={`mt-3 border-l-2 px-3 py-2 ${toneClass}`}>
      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className={`${compact ? 'mt-1 text-[11px] leading-4' : 'mt-1 text-xs leading-5'} text-slate-400`}>{text}</p>
    </div>
  )
}
