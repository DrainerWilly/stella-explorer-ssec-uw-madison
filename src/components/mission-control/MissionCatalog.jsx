import { useMemo, useState } from 'react'
import Icon from '../Icon.jsx'
import { MISSION_CATEGORIES } from '../../data/missionCategories.js'

// One slim row: a category-colored accent tick, the name, and a small status dot.
function MissionRow({ mission, item, cacheStatus, selected, onSelect }) {
  const color = mission.markerColor
  const available = item && item.valid
  const dot = !available ? 'bg-rose-400' : cacheStatus === 'fresh' ? 'bg-emerald-400' : 'bg-amber-400'
  return (
    <button
      onClick={() => onSelect(mission.id)}
      aria-pressed={selected}
      className={`group flex w-full items-center gap-2.5 rounded-lg py-1.5 pl-2 pr-2.5 text-left transition-colors ${
        selected ? 'bg-white/12' : 'hover:bg-white/6'
      }`}
    >
      <span className="h-6 w-1 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className={`truncate text-[13px] font-semibold ${selected ? 'text-white' : 'text-white/85'}`}>
            {mission.displayName}
          </span>
          {mission.featured && <Icon name="star" className="h-3 w-3 shrink-0 text-amber-300/80" />}
        </span>
        <span className="block truncate text-[10px] text-white/35">{mission.agency}</span>
      </span>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} title={available ? 'Tracking' : 'Unavailable'} />
    </button>
  )
}

// Slim satellite drawer (NASA-Eyes style): search, a compact category filter,
// then a tight scrollable list. Lives inside a floating panel in the page.
export default function MissionCatalog({ missions, byId, cacheStatus, selectedId, onSelect }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return missions.filter((m) => {
      if (category !== 'all' && m.category !== category) return false
      if (!q) return true
      const hay = [m.displayName, m.agency, m.category, m.orbitType, ...(m.observes || []), ...(m.instruments || [])]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [missions, query, category])

  return (
    <div className="flex h-full flex-col">
      {/* search */}
      <div className="relative">
        <Icon name="rays" className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search satellites…"
          aria-label="Search satellites"
          className="w-full rounded-full border border-white/10 bg-white/5 py-1.5 pl-8 pr-3 text-[12px] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#67d1ff]/50"
        />
      </div>

      {/* category filter */}
      <div className="scroll-soft -mx-0.5 mt-2 flex gap-1 overflow-x-auto px-0.5 pb-1">
        <button
          onClick={() => setCategory('all')}
          aria-pressed={category === 'all'}
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide transition-colors ${
            category === 'all' ? 'bg-white text-[#0b1a3d]' : 'bg-white/5 text-white/50 hover:text-white'
          }`}
        >
          All
        </button>
        {MISSION_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(category === cat.id ? 'all' : cat.id)}
            aria-pressed={category === cat.id}
            title={cat.id}
            className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide transition-colors ${
              category === cat.id ? 'text-[#04121f]' : 'bg-white/5 text-white/50 hover:text-white'
            }`}
            style={category === cat.id ? { backgroundColor: cat.color } : undefined}
          >
            <Icon name={cat.icon} className="h-3 w-3" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* list */}
      <div className="scroll-soft mt-1 min-h-0 flex-1 space-y-0.5 overflow-y-auto pr-0.5">
        {filtered.length === 0 ? (
          <p className="px-2 py-6 text-center text-[12px] text-white/40">No satellites match.</p>
        ) : (
          filtered.map((m) => (
            <MissionRow
              key={m.id}
              mission={m}
              item={byId[m.id]}
              cacheStatus={cacheStatus}
              selected={selectedId === m.id}
              onSelect={onSelect}
            />
          ))
        )}
      </div>

      <div className="mt-1.5 border-t border-white/8 pt-1.5 text-center text-[10px] text-white/30">
        {filtered.length} of {missions.length} satellites
      </div>
    </div>
  )
}
