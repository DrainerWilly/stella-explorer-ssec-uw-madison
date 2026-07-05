import { useMemo, useState } from 'react'
import Icon from '../Icon.jsx'
import { MISSION_CATEGORIES, categoryIcon } from '../../data/missionCategories.js'
import { LABEL, ACCENT, ACCENT_INK } from './mcStyles.js'

function dataIndicator(item, cacheStatus) {
  if (!item || !item.valid) return { label: 'Unavailable', tone: 'bad' }
  if (cacheStatus === 'fresh') return { label: 'OK', tone: 'ok' }
  return { label: 'Stale', tone: 'warn' }
}

const toneDot = {
  ok: 'bg-emerald-400',
  warn: 'bg-amber-400',
  bad: 'bg-rose-400',
}

function MissionRow({ mission, item, cacheStatus, selected, onSelect }) {
  const ind = dataIndicator(item, cacheStatus)
  const color = mission.markerColor
  return (
    <button
      onClick={() => onSelect(mission.id)}
      aria-pressed={selected}
      className={`group flex w-full items-center gap-3 rounded-lg border-l-2 px-2.5 py-2 text-left transition-colors ${
        selected
          ? 'border-[#67d1ff] bg-white/10'
          : 'border-transparent hover:bg-white/5'
      }`}
    >
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full ring-1 ring-white/15"
        style={{ backgroundColor: `${color}26`, color }}
      >
        <Icon name={categoryIcon(mission.category)} className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-[13px] font-bold tracking-wide text-white">
            {mission.displayName}
          </span>
          {mission.featured && <Icon name="star" className="h-3 w-3 shrink-0 text-amber-300" />}
        </span>
        <span className="mt-0.5 block truncate text-[10px] font-semibold uppercase tracking-wider text-white/35">
          {mission.agency} · {mission.category}
        </span>
      </span>
      <span className="flex shrink-0 items-center" title={ind.label}>
        <span className={`h-1.5 w-1.5 rounded-full ${toneDot[ind.tone]}`} />
      </span>
    </button>
  )
}

export default function MissionCatalog({ missions, byId, cacheStatus, selectedId, onSelect }) {
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState('all') // all | featured
  const [category, setCategory] = useState('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return missions.filter((m) => {
      if (mode === 'featured' && !m.featured) return false
      if (category !== 'all' && m.category !== category) return false
      if (!q) return true
      const hay = [
        m.displayName,
        m.agency,
        m.category,
        m.orbitType,
        ...(m.observes || []),
        ...(m.instruments || []),
      ]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [missions, query, mode, category])

  return (
    <div className="flex h-full flex-col">
      {/* search */}
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search missions…"
        aria-label="Search missions"
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#67d1ff]/50"
      />

      {/* all / featured */}
      <div className="mt-2 flex gap-1">
        {[
          { id: 'all', label: 'All missions' },
          { id: 'featured', label: 'Featured' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setMode(t.id)}
            aria-pressed={mode === t.id}
            className={`flex-1 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
              mode === t.id
                ? 'text-[#062033]'
                : 'bg-white/5 text-white/50 hover:text-white'
            }`}
            style={mode === t.id ? { backgroundColor: ACCENT, color: ACCENT_INK } : undefined}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* category chips */}
      <div className="scroll-soft mt-2 flex gap-1 overflow-x-auto pb-1">
        <button
          onClick={() => setCategory('all')}
          aria-pressed={category === 'all'}
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors ${
            category === 'all' ? 'bg-white text-[#0b1a3d]' : 'bg-white/5 text-white/50 hover:text-white'
          }`}
        >
          All
        </button>
        {MISSION_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            aria-pressed={category === cat.id}
            title={cat.id}
            className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors ${
              category === cat.id ? 'text-[#04121f]' : 'bg-white/5 text-white/50 hover:text-white'
            }`}
            style={category === cat.id ? { backgroundColor: cat.color } : undefined}
          >
            <Icon name={cat.icon} className="h-3 w-3" />
            {cat.label}
          </button>
        ))}
      </div>

      <div className={`${LABEL} mt-2 px-1`}>
        {filtered.length} mission{filtered.length === 1 ? '' : 's'}
      </div>

      {/* list */}
      <div className="scroll-soft mt-1 min-h-0 flex-1 space-y-0.5 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <p className="px-2 py-6 text-center text-[13px] text-white/40">No missions match.</p>
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
    </div>
  )
}
