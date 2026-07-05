import { useMemo, useState } from 'react'
import Icon from '../Icon.jsx'
import GameShell from './GameShell.jsx'
import GameResults from './GameResults.jsx'
import { EM_REGIONS, GAME_ACCENT } from '../../data/games.js'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function SignalSort({ game, onExit }) {
  const accent = GAME_ACCENT[game.color]
  const total = EM_REGIONS.length
  const byId = useMemo(() => Object.fromEntries(EM_REGIONS.map((r) => [r.id, r])), [])

  const [pool, setPool] = useState(() => shuffle(EM_REGIONS).map((r) => r.id))
  const [placed, setPlaced] = useState([])
  const [checked, setChecked] = useState(false)

  const correctOrder = EM_REGIONS.map((r) => r.id) // already longest → shortest
  const score = placed.filter((id, i) => id === correctOrder[i]).length

  const reset = () => {
    setPool(shuffle(EM_REGIONS).map((r) => r.id))
    setPlaced([])
    setChecked(false)
  }

  const place = (id) => {
    if (checked) return
    setPool((p) => p.filter((x) => x !== id))
    setPlaced((p) => [...p, id])
  }
  const unplace = (id) => {
    if (checked) return
    setPlaced((p) => p.filter((x) => x !== id))
    setPool((p) => [id, ...p])
  }

  return (
    <GameShell
      game={game}
      onExit={onExit}
      scoreChip={checked ? `${score} / ${total} correct` : null}
      progressPct={(placed.length / total) * 100}
    >
      <p className="text-sm text-muted">
        Click the bands of light in order, from the{' '}
        <strong className="text-ink">longest wavelength</strong> to the{' '}
        <strong className="text-ink">shortest</strong>.
      </p>

      {/* direction scale */}
      <div className="mt-3 flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted">
        <span>← Longer waves · lower energy</span>
        <span>Shorter · higher energy →</span>
      </div>

      {/* placed slots */}
      <div className="mt-4 space-y-2">
        {Array.from({ length: total }).map((_, i) => {
          const id = placed[i]
          const region = id ? byId[id] : null
          const ok = checked && id === correctOrder[i]
          const bad = checked && id && id !== correctOrder[i]
          return (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
                ok
                  ? 'border-emerald-400/50 bg-emerald-400/10'
                  : bad
                    ? 'border-rose-400/50 bg-rose-500/10'
                    : 'border-white/10 bg-white/[0.03]'
              }`}
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold text-ink">
                {i + 1}
              </span>
              {region ? (
                <button
                  onClick={() => unplace(id)}
                  disabled={checked}
                  className="flex-1 text-left text-sm font-bold text-ink disabled:cursor-default"
                >
                  {region.name}
                </button>
              ) : (
                <span className="flex-1 text-sm text-muted/60">Tap a band below…</span>
              )}
              {checked && id === correctOrder[i] && (
                <Icon name="star" className="h-4 w-4 text-emerald-300" />
              )}
              {checked && (
                <span className="text-[11px] font-semibold text-muted">
                  {byId[correctOrder[i]].name}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* pool */}
      {!checked && pool.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {pool.map((id) => (
            <button
              key={id}
              onClick={() => place(id)}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold text-ink transition-colors hover:bg-white/10"
              style={{ boxShadow: `inset 0 0 0 1px ${accent}22` }}
            >
              {byId[id].name}
            </button>
          ))}
        </div>
      )}

      {!checked && (
        <button
          onClick={() => setChecked(true)}
          disabled={placed.length !== total}
          className="mt-5 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-[#04122b] transition-transform enabled:hover:scale-[1.03] disabled:opacity-40"
          style={{ backgroundColor: accent }}
        >
          <Icon name="star" className="h-4 w-4" />
          Check my order
        </button>
      )}

      {/* reveal: facts + results */}
      {checked && (
        <>
          <div className="mt-5 space-y-2">
            {correctOrder.map((id) => (
              <div key={id} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5">
                <div className="text-sm font-bold text-ink">{byId[id].name}</div>
                <p className="mt-0.5 text-[13px] leading-relaxed text-muted">{byId[id].fact}</p>
              </div>
            ))}
          </div>
          <div className="mt-5">
            <GameResults
              game={game}
              score={score}
              total={total}
              onReplay={reset}
              onExit={onExit}
              detail="This is the electromagnetic spectrum — every Earth-observing instrument is tuned to one of these bands to reveal something different about the planet."
            />
          </div>
        </>
      )}
    </GameShell>
  )
}
