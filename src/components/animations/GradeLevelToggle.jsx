import { GRADE_LEVELS } from '../../data/animationContent.js'

// Elementary / Middle / High pill group, Light Lab style. Uses theme tokens so
// it reads correctly both in the lab header and inside the standalone modules.
export default function GradeLevelToggle({ value, onChange }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border-2 border-white/10 bg-white/[0.05] p-1">
      <span className="px-2 font-game text-xs font-bold text-faint">Grade</span>
      {GRADE_LEVELS.map((g) => {
        const active = value === g.id
        return (
          <button
            key={g.id}
            onClick={() => onChange(g.id)}
            aria-pressed={active}
            className={`rounded-full px-3.5 py-1.5 font-game text-xs font-bold transition-all ${
              active
                ? 'bg-amber-300/90 text-[#1a1500] shadow-soft'
                : 'text-muted hover:text-ink'
            }`}
          >
            {g.label}
          </button>
        )
      })}
    </div>
  )
}
