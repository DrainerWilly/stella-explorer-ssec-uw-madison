// @ts-nocheck
import Icon from './Icon'
import { CATEGORIES } from '../data/lessons'

export default function CategoryFilters({ active, onChange }) {
  return (
    <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1 scroll-soft">
      {CATEGORIES.map((cat) => {
        const isActive = active === cat.id
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={`group flex shrink-0 items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-4 text-sm font-semibold backdrop-blur transition-all duration-200
              ${
                isActive
                  ? 'border-white/20 bg-white text-[#04122b]'
                  : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
          >
            <span
              className={`grid h-7 w-7 place-items-center rounded-full transition-colors ${
                isActive ? 'bg-[#04122b]/10 text-[#04122b]' : 'bg-white/10 text-white/70'
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
