// @ts-nocheck
import { useState } from 'react'
import SpectralDetective from './SpectralDetective'
import OrbitArchitect from './OrbitArchitect'
import SignalSort from './SignalSort'
import NdviRanger from './NdviRanger'
import PixelDetective from './PixelDetective'
import FalseColorPainter from './FalseColorPainter'
import WindowWatchers from './WindowWatchers'
import SatelliteMatch from './SatelliteMatch'
import { GAMES, getGame } from '../../data/games'

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

const IOSEVKA =
  "'Iosevka', 'Iosevka Nerd Font', 'Iosevka Fixed', 'Roboto Mono', 'SFMono-Regular', Consolas, monospace"

// Per-game gallery imagery — public-domain NASA / USGS stills, matched to each
// game's remote-sensing topic.
const GAME_IMAGES = {
  'pixel-detective': {
    image: 'landsat/natural-color.jpg',
    alt: 'USGS/NASA Landsat natural-color satellite image of a coastal landscape',
  },
  'false-color-painter': {
    image: 'landsat/false-color.jpg',
    alt: 'USGS/NASA Landsat false-color infrared image with vegetation shown in red',
  },
  'window-watchers': {
    image: 'assets/animations/nasa/atmospheric-windows.png',
    alt: 'NASA Earth Observatory graph of atmospheric transmission windows by wavelength',
  },
  'satellite-match': {
    image: 'assets/animations/nasa/tdrs-fleet.jpg',
    alt: 'NASA Scientific Visualization Studio rendering of the Tracking and Data Relay Satellite fleet',
  },
  'spectral-detective': {
    image: 'assets/animations/nasa/spectral-signature.jpg',
    alt: 'NASA visualization pairing hyperspectral Earth imagery with measured spectral signatures',
  },
  'orbit-architect': {
    image: 'assets/animations/nasa/landsat-orbit.png',
    alt: 'NASA Scientific Visualization Studio rendering of the Landsat orbit and observation swath',
  },
  'signal-sort': {
    image: 'assets/animations/nasa/electromagnetic-spectrum.jpg',
    alt: 'NASA Goddard Conceptual Image Lab visualization of the electromagnetic spectrum',
  },
  'ndvi-ranger': {
    image: 'assets/home/nasa-crop-circles.jpg',
    alt: 'NASA Earth Observatory image of center-pivot irrigation crop fields',
  },
}

function GameGalleryCard({ card, index, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(card.id)}
      className="group relative min-h-[220px] overflow-hidden bg-black text-left outline-none sm:min-h-[260px] lg:min-h-[310px]"
      aria-label={`Play ${card.title}`}
    >
      <img
        src={card.image}
        alt={card.alt}
        loading={index < 3 ? 'eager' : 'lazy'}
        className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-[1.035] group-hover:opacity-100"
      />
      <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/25 transition duration-500 group-hover:from-black/65" />
      <span className="absolute inset-x-0 bottom-0 flex min-h-[86px] items-end p-5 sm:p-6">
        <span
          className="text-[1.35rem] font-medium leading-tight text-white drop-shadow-[0_2px_10px_rgb(0_0_0_/_0.8)] sm:text-[1.55rem]"
          style={{ fontFamily: IOSEVKA }}
        >
          {card.title}
        </span>
      </span>
    </button>
  )
}

export default function GamesPage() {
  const [selectedId, setSelectedId] = useState(null)

  const game = selectedId ? getGame(selectedId) : null
  const GameComponent = selectedId ? REGISTRY[selectedId] : null

  // Playing a game is a full-screen takeover (GameShell owns the layout).
  if (game && GameComponent) {
    return <GameComponent game={game} onExit={() => setSelectedId(null)} />
  }

  const cards = GAMES.map((g) => ({ id: g.id, title: g.title, ...GAME_IMAGES[g.id] }))

  return (
    <main className="cm-games order-1 relative flex-1 overflow-x-hidden overflow-y-auto scroll-soft bg-black lg:order-2">
      <div className="relative min-h-full bg-black">
        <header className="relative h-[35vh] min-h-[240px] max-h-[380px] overflow-hidden border-b border-black bg-black">
          <img
            src="assets/media/landsat-in-orbit.jpg"
            alt="Rendered view of a Landsat satellite in orbit above Earth"
            className="absolute inset-0 h-full w-full object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-black/55" />
          <div className="relative flex h-full items-center px-7 pt-4 sm:px-12 lg:px-24">
            <h1
              className="text-5xl font-semibold leading-none text-white sm:text-6xl lg:text-7xl"
              style={{ fontFamily: IOSEVKA }}
            >
              Remote Sensing Games
            </h1>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-2.5 bg-black px-2.5 pb-2.5 pt-1 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, i) => (
            <GameGalleryCard key={card.id} card={card} index={i} onOpen={setSelectedId} />
          ))}
        </div>
      </div>
    </main>
  )
}
