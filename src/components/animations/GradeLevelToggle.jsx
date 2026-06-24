import { GRADE_LEVELS } from '../../data/animationContent.js'

// Elementary / Middle / High pill group — styled like the Hero grade selector.
export default function GradeLevelToggle({ value, onChange }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-cream p-1">
      <span className="px-2 text-xs font-bold text-faint">Grade</span>
      {GRADE_LEVELS.map((g) => {
        const active = value === g.id
        return (
          <button
            key={g.id}
            onClick={() => onChange(g.id)}
            aria-pressed={active}
            className={`rounded-full px-3.5 py-2 text-xs font-bold transition-all ${
              active ? 'bg-ink text-app shadow-soft' : 'text-muted hover:text-ink'
            }`}
          >
            {g.label}
          </button>
        )
      })}
    </div>
  )
}
