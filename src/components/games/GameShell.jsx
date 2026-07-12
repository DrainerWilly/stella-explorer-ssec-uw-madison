import Icon from '../Icon.jsx'
import { Starfield } from './doodles.jsx'
import { GAME_ACCENT } from '../../data/games.js'

// Consistent arcade frame for every game: starry backdrop, back button, playful
// title header, an optional score chip and a chunky progress bar.
export default function GameShell({ game, onExit, scoreChip, progressPct, children }) {
  const accent = GAME_ACCENT[game.color] || '#CDEBFF'
  return (
    <main
      className="order-1 relative flex-1 overflow-x-hidden overflow-y-auto scroll-soft bg-[#070d24] lg:order-2"
      style={{ '--accent': accent }}
    >
      <Starfield count={22} />

      <div className="relative mx-auto max-w-3xl px-5 py-6 sm:px-8 lg:py-8">
        <button
          onClick={onExit}
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-white/10 bg-white/5 px-4 py-2 font-game text-sm font-bold text-white/80 transition-colors hover:border-white/25 hover:bg-white/10 hover:text-white"
        >
          <Icon name="back" className="h-4 w-4" />
          Arcade
        </button>

        <div className="mt-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="grid h-14 w-14 shrink-0 rotate-[-4deg] place-items-center rounded-2xl border-2"
              style={{ backgroundColor: `${accent}26`, borderColor: `${accent}66`, color: accent }}
            >
              <Icon name={game.icon} className="h-7 w-7" />
            </span>
            <div>
              <h1 className="font-game text-3xl font-extrabold tracking-tight text-white">{game.title}</h1>
              <p className="font-game text-[13px] font-semibold" style={{ color: accent }}>
                {game.tagline}
              </p>
            </div>
          </div>
          {scoreChip != null && (
            <span className="shrink-0 rounded-full border-2 border-white/10 bg-white/5 px-3.5 py-1.5 font-game text-sm font-bold text-white">
              {scoreChip}
            </span>
          )}
        </div>

        {progressPct != null && (
          <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full border border-white/10 bg-white/10">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%`, backgroundColor: accent }}
            />
          </div>
        )}

        <div className="mt-6">{children}</div>
      </div>
    </main>
  )
}
