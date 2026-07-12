import { useMemo, useState } from 'react'
import '@fontsource/baloo-2/600.css'
import '@fontsource/baloo-2/700.css'
import '@fontsource/baloo-2/800.css'
import Icon from '../Icon.jsx'
import GameCard from './GameCard.jsx'
import SpectralDetective from './SpectralDetective.jsx'
import OrbitArchitect from './OrbitArchitect.jsx'
import SignalSort from './SignalSort.jsx'
import NdviRanger from './NdviRanger.jsx'
import PixelDetective from './PixelDetective.jsx'
import FalseColorPainter from './FalseColorPainter.jsx'
import WindowWatchers from './WindowWatchers.jsx'
import SatelliteMatch from './SatelliteMatch.jsx'
import { Starfield, DoodlePlanet, DoodleTelescope, DoodleRocket, DoodleEarth } from './doodles.jsx'
import { GAMES, GAME_ACCENT, getGame } from '../../data/games.js'
import { loadProgress, patchCount } from '../../utils/gameProgress.ts'

// id → game component
const REGISTRY = {
  'pixel-detective': PixelDetective,
  'false-color-painter': FalseColorPainter,
  'window-watchers': WindowWatchers,
  'satellite-match': SatelliteMatch,
  'spectral-detective': SpectralDetective,
  'orbit-architect': OrbitArchitect,
  'signal-sort': SignalSort,
  'ndvi-ranger': NdviRanger,
}

const FILTERS = [
  { id: 'all', label: 'All games', icon: 'games' },
  { id: 'easy', label: 'Quick & easy', icon: 'star' },
  { id: 'brainy', label: 'Brainy', icon: 'rocket' },
]

// The collected-patches strip: one slot per game, filled once the player earns
// at least one star in it.
function StickerBook({ progress }) {
  const collected = patchCount(progress, GAMES.map((g) => g.id))
  return (
    <div className="relative rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.04] px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Icon name="trophy" className="h-5 w-5 text-amber-300" />
          <span className="font-game text-sm font-bold text-white">
            Mission patches: {collected} / {GAMES.length}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {GAMES.map((g) => {
            const stars = progress[g.id]?.stars ?? 0
            const accent = GAME_ACCENT[g.color]
            const earned = stars > 0
            return (
              <span
                key={g.id}
                title={earned ? `${g.title}: ${stars} star${stars > 1 ? 's' : ''}` : `${g.title}: not earned yet`}
                className={`relative grid h-9 w-9 place-items-center rounded-full border-2 transition-transform hover:scale-110 ${
                  earned ? 'border-transparent' : 'border-dashed border-white/20 opacity-50'
                }`}
                style={earned ? { backgroundColor: `${accent}30`, borderColor: `${accent}80` } : undefined}
              >
                <Icon name={g.icon} className="h-4 w-4" style={{ color: earned ? accent : 'rgb(255 255 255 / 0.35)' }} />
                {stars > 0 && (
                  <span
                    className="absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-full text-[8px] font-black text-[#1a1500]"
                    style={{ backgroundColor: '#ffd97a' }}
                  >
                    {stars}
                  </span>
                )}
              </span>
            )
          })}
        </div>
      </div>
      <p className="mt-1.5 text-[11px] text-white/40">
        Finish a game to earn its patch. Score 90% or better for all three stars!
      </p>
    </div>
  )
}

export default function GamesPage() {
  const [selectedId, setSelectedId] = useState(null)
  const [filter, setFilter] = useState('all')
  // Re-read progress whenever we return from a game (selectedId → null).
  const progress = useMemo(() => loadProgress(), [selectedId])

  const game = selectedId ? getGame(selectedId) : null
  const GameComponent = selectedId ? REGISTRY[selectedId] : null

  if (game && GameComponent) {
    return <GameComponent game={game} onExit={() => setSelectedId(null)} />
  }

  const shown = GAMES.filter((g) => {
    if (filter === 'easy') return g.difficulty === 'Easy'
    if (filter === 'brainy') return g.difficulty !== 'Easy'
    return true
  })

  return (
    <main className="order-1 relative flex-1 overflow-x-hidden overflow-y-auto scroll-soft bg-[#070d24] lg:order-2">
      <Starfield />

      {/* floating doodles around the header */}
      <div aria-hidden="true" className="pointer-events-none absolute left-[3%] top-24 hidden md:block" style={{ '--tilt': '-8deg' }}>
        <div className="g-float"><DoodlePlanet className="h-20 w-20" /></div>
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute right-[5%] top-14 hidden md:block" style={{ '--tilt': '6deg' }}>
        <div className="g-float" style={{ animationDelay: '1.2s' }}><DoodleRocket className="h-20 w-20" /></div>
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute right-[16%] top-52 hidden lg:block" style={{ '--tilt': '-4deg' }}>
        <div className="g-float" style={{ animationDelay: '2.4s' }}><DoodleTelescope className="h-16 w-16" /></div>
      </div>

      <div className="relative px-5 py-8 sm:px-8 lg:px-10">
        {/* ---------- header ---------- */}
        <header className="mx-auto max-w-3xl text-center">
          <div className="mx-auto flex items-center justify-center gap-3">
            <div className="g-wobble"><DoodleEarth className="h-14 w-14 sm:h-16 sm:w-16" /></div>
            <h1 className="font-game text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Space{' '}
              <span className="bg-gradient-to-r from-amber-300 via-rose-300 to-sky-300 bg-clip-text text-transparent">
                Arcade
              </span>
            </h1>
          </div>

          {/* crayon underline squiggle */}
          <svg viewBox="0 0 260 14" className="mx-auto mt-1 h-3.5 w-56" fill="none" aria-hidden="true">
            <path
              d="M6 9C40 3 80 11 120 7s80-6 134-1"
              stroke="#ffd97a"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>

          <p className="mx-auto mt-3 max-w-xl font-game text-[15px] leading-relaxed text-sky-100/80 sm:text-base">
            Play like a NASA scientist! Read light fingerprints, paint with invisible colors, and
            see Earth the way satellites do. Every game earns you a mission patch.
          </p>
        </header>

        {/* ---------- sticker book ---------- */}
        <div className="mx-auto mt-6 max-w-3xl">
          <StickerBook progress={progress} />
        </div>

        {/* ---------- filters ---------- */}
        <div className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={`inline-flex items-center gap-1.5 rounded-full border-2 px-4 py-2 font-game text-sm font-bold transition-all ${
                filter === f.id
                  ? 'border-amber-300/70 bg-amber-300/15 text-amber-200'
                  : 'border-white/10 bg-white/[0.04] text-white/60 hover:border-white/25 hover:text-white'
              }`}
            >
              <Icon name={f.icon} className="h-4 w-4" />
              {f.label}
            </button>
          ))}
        </div>

        {/* ---------- game cards ---------- */}
        <div className="mx-auto mt-7 grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((g, i) => (
            <GameCard key={g.id} game={g} index={i} record={progress[g.id]} onPlay={setSelectedId} />
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-xl text-center text-[11px] leading-relaxed text-white/30">
          Made for young explorers, inspired by NASA education projects like StarChild and Imagine
          the Universe. All the science here is real: it is the same remote sensing used by Landsat,
          GOES, and your STELLA instrument.
        </p>
      </div>
    </main>
  )
}
