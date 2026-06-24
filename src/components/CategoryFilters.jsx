import Icon from './Icon.jsx'
import { CATEGORIES } from '../data/lessons.js'

export default function CategoryFilters({ active, onChange }) {
  return (
    <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1 scroll-soft">
      {CATEGORIES.map((cat) => {
        const isActive = active === cat.id
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={`group flex shrink-0 items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-sm font-semibold transition-all duration-200
              ${
                isActive
                  ? 'bg-ink text-app shadow-soft'
                  : 'bg-cream text-ink/80 hover:bg-surface hover:shadow-soft'
              }`}
          >
            <span
              className={`grid h-7 w-7 place-items-center rounded-full transition-colors ${
                isActive ? 'bg-app/20 text-app' : 'bg-surface text-ink/70'
              }`}
            >
              <Icon name={cat.icon} className="h-4 w-4" />
            </span>
            {cat.label}
          </button>
        )
      })}
    </div>
  )
}
