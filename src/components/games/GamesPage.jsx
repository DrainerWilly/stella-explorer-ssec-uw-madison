import { useState } from 'react'
import GameCard from './GameCard.jsx'
import SpectralDetective from './SpectralDetective.jsx'
import OrbitArchitect from './OrbitArchitect.jsx'
import SignalSort from './SignalSort.jsx'
import NdviRanger from './NdviRanger.jsx'
import { GAMES, getGame } from '../../data/games.js'

// id → game component
const REGISTRY = {
  'spectral-detective': SpectralDetective,
  'orbit-architect': OrbitArchitect,
  'signal-sort': SignalSort,
  'ndvi-ranger': NdviRanger,
}

export default function GamesPage() {
  const [selectedId, setSelectedId] = useState(null)
  const game = selectedId ? getGame(selectedId) : null
  const GameComponent = selectedId ? REGISTRY[selectedId] : null

  if (game && GameComponent) {
    return <GameComponent game={game} onExit={() => setSelectedId(null)} />
  }

  return (
    <main className="order-1 flex-1 overflow-x-hidden overflow-y-auto scroll-soft bg-app px-5 py-6 sm:px-8 lg:order-2 lg:px-10 lg:py-8">
      <header className="max-w-2xl">
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300/80">
          Play & learn
        </span>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Games</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
          Interactive challenges that turn real Earth-science ideas, spectral signatures, orbits,
          the electromagnetic spectrum, and vegetation health, into games you can play.
        </p>
      </header>

      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {GAMES.map((g) => (
          <GameCard key={g.id} game={g} onPlay={setSelectedId} />
        ))}
      </div>
    </main>
  )
}
