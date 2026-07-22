import type { GuidanceLevel } from '../types'

const LEVELS: Array<{ id: GuidanceLevel; label: string }> = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'standard', label: 'Standard' },
  { id: 'expert', label: 'Expert' },
]

interface GuidanceSelectorProps {
  value: GuidanceLevel
  onChange: (value: GuidanceLevel) => void
}

export default function GuidanceSelector({ value, onChange }: GuidanceSelectorProps) {
  return (
    <fieldset>
      <legend className="block text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500">
        Guidance
      </legend>
      <div className="mt-2 inline-flex rounded-sm border border-white/10 bg-black/20 p-1">
        {LEVELS.map((level) => (
          <button
            key={level.id}
            type="button"
            aria-pressed={value === level.id}
            onClick={() => onChange(level.id)}
            className={`sq2-focus rounded-sm px-2.5 py-1.5 text-[10px] font-semibold transition sm:px-3 ${
              value === level.id
                ? 'bg-cyan-300 text-[#03101c]'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {level.label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}
