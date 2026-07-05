import Icon from '../Icon.jsx'
import { GAME_ACCENT } from '../../data/games.js'

export default function GameCard({ game, onPlay }) {
  const accent = GAME_ACCENT[game.color] || '#CDEBFF'

  return (
    <button
      onClick={() => onPlay(game.id)}
      aria-label={`Play ${game.title}`}
      style={{ '--accent': accent }}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[color:var(--accent)]/40 hover:bg-white/[0.07] hover:shadow-[0_18px_50px_-20px_var(--accent)]"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-40 blur-3xl transition-opacity duration-300 group-hover:opacity-90"
        style={{ backgroundColor: accent }}
      />

      <div className="relative mb-6 flex items-start justify-between">
        <span
          className="grid h-12 w-12 place-items-center rounded-2xl ring-1 ring-white/10"
          style={{ backgroundColor: `${accent}22`, color: accent }}
        >
          <Icon name={game.icon} className="h-6 w-6" />
        </span>
        <span className="flex flex-col items-end gap-1.5">
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/60">
            {game.category}
          </span>
          <span className="text-[11px] font-semibold text-white/40">
            {game.difficulty} · {game.minutes} min
          </span>
        </span>
      </div>

      <h3 className="relative text-xl font-extrabold tracking-tight text-white">{game.title}</h3>
      <p className="relative mt-1 text-[13px] font-medium text-white/50">{game.tagline}</p>
      <p className="relative mt-3 text-sm leading-relaxed text-white/65">{game.description}</p>

      <div className="relative mt-5 flex items-center justify-between">
        <span
          className="inline-flex items-center gap-1.5 text-sm font-bold"
          style={{ color: accent }}
        >
          <Icon name="play" className="h-4 w-4" />
          Play now
        </span>
        <span
          className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-all group-hover:border-[color:var(--accent)]/50 group-hover:text-white"
        >
          <Icon name="chevron" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>
  )
}
