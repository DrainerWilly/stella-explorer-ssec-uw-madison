import Icon from '../Icon.jsx'
import { GAME_ACCENT } from '../../data/games.js'

// Consistent outer frame for every game: back button, title header, an optional
// score chip and progress bar, then the game content.
export default function GameShell({ game, onExit, scoreChip, progressPct, children }) {
  const accent = GAME_ACCENT[game.color] || '#CDEBFF'
  return (
    <main
      className="order-1 flex-1 overflow-x-hidden overflow-y-auto scroll-soft bg-app lg:order-2"
      style={{ '--accent': accent }}
    >
      <div className="mx-auto max-w-3xl px-5 py-6 sm:px-8 lg:py-8">
        <button
          onClick={onExit}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-ink/80 transition-colors hover:bg-white/10 hover:text-ink"
        >
          <Icon name="back" className="h-4 w-4" />
          All games
        </button>

        <div className="mt-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl ring-1 ring-white/10"
              style={{ backgroundColor: `${accent}22`, color: accent }}
            >
              <Icon name={game.icon} className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-ink">{game.title}</h1>
              <p className="text-[13px] text-muted">{game.tagline}</p>
            </div>
          </div>
          {scoreChip != null && (
            <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-sm font-bold text-ink">
              {scoreChip}
            </span>
          )}
        </div>

        {progressPct != null && (
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
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
