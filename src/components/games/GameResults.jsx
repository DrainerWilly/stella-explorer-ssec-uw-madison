import Icon from '../Icon.jsx'
import { GAME_ACCENT } from '../../data/games.js'

function medal(pct) {
  if (pct >= 0.9) return { label: 'Mission specialist!', stars: 3 }
  if (pct >= 0.6) return { label: 'Nicely done!', stars: 2 }
  if (pct >= 0.3) return { label: 'Getting there!', stars: 1 }
  return { label: 'Keep exploring!', stars: 0 }
}

// Shared end-of-game screen: score, rating, replay + exit.
export default function GameResults({ game, score, total, onReplay, onExit, detail }) {
  const accent = GAME_ACCENT[game.color] || '#CDEBFF'
  const pct = total > 0 ? score / total : 0
  const { label, stars } = medal(pct)

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-sm">
      <span
        className="mx-auto grid h-16 w-16 place-items-center rounded-full ring-1 ring-white/10"
        style={{ backgroundColor: `${accent}22`, color: accent }}
      >
        <Icon name="trophy" className="h-8 w-8" />
      </span>

      <div className="mt-3 flex items-center justify-center gap-1">
        {[0, 1, 2].map((i) => (
          <Icon
            key={i}
            name="star"
            className="h-6 w-6"
            style={{ color: i < stars ? accent : 'rgb(255 255 255 / 0.15)' }}
          />
        ))}
      </div>

      <h2 className="mt-3 text-2xl font-extrabold text-ink">{label}</h2>
      <p className="mt-1 text-4xl font-extrabold" style={{ color: accent }}>
        {score}
        <span className="text-xl text-muted"> / {total}</span>
      </p>
      {detail && <p className="mx-auto mt-3 max-w-md text-sm text-muted">{detail}</p>}

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          onClick={onReplay}
          className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-[#04122b] transition-transform hover:scale-[1.03]"
          style={{ backgroundColor: accent }}
        >
          <Icon name="reset" className="h-4 w-4" />
          Play again
        </button>
        <button
          onClick={onExit}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-ink transition-colors hover:bg-white/10"
        >
          <Icon name="games" className="h-4 w-4" />
          More games
        </button>
      </div>
    </div>
  )
}
