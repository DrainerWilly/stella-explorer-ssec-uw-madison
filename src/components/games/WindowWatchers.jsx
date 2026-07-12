import { useMemo, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Icon from '../Icon.jsx'
import GameShell from './GameShell.jsx'
import GameResults from './GameResults.jsx'
import { GAME_ACCENT, WINDOW_CARDS } from '../../data/games.js'
import { DoodleTelescope, DoodleSatellite } from './doodles.jsx'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Sort each kind of light: does it reach the ground, or does the atmosphere
// block it so we need a space telescope? Teaches atmospheric windows.
export default function WindowWatchers({ game, onExit }) {
  const reduce = useReducedMotion()
  const accent = GAME_ACCENT[game.color]

  const cards = useMemo(() => shuffle(WINDOW_CARDS), [])
  const [index, setIndex] = useState(0)
  const [choice, setChoice] = useState(null) // true = "reaches", false = "blocked"
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const card = cards[index]
  const revealed = choice != null
  const correct = revealed && choice === card.reaches

  const pick = (reaches) => {
    if (revealed) return
    setChoice(reaches)
    if (reaches === card.reaches) setScore((s) => s + 1)
  }

  const next = () => {
    if (index + 1 >= cards.length) {
      setFinished(true)
    } else {
      setIndex((i) => i + 1)
      setChoice(null)
    }
  }

  const restart = () => {
    setIndex(0)
    setChoice(null)
    setScore(0)
    setFinished(false)
  }

  if (finished) {
    return (
      <GameShell game={game} onExit={onExit}>
        <GameResults
          game={game}
          score={score}
          total={cards.length}
          onReplay={restart}
          onExit={onExit}
          detail="The wavelengths that pass through are called atmospheric windows. Everything else is why NASA launches telescopes into space, above the air that blocks the view."
        />
      </GameShell>
    )
  }

  const binBase =
    'flex flex-1 flex-col items-center gap-2 rounded-3xl border-2 p-5 text-center transition-all disabled:cursor-default'

  return (
    <GameShell
      game={game}
      onExit={onExit}
      scoreChip={`Score ${score} / ${cards.length}`}
      progressPct={(index / cards.length) * 100}
    >
      <div className="text-center font-game text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">
        Wave {index + 1} of {cards.length}
      </div>

      {/* the incoming wave card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: reduce ? 0 : -18, rotate: reduce ? 0 : -2 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          exit={{ opacity: 0, y: reduce ? 0 : 14 }}
          transition={{ duration: 0.3 }}
          className="mx-auto mt-3 w-full max-w-sm rounded-3xl border-2 border-white/15 bg-white/[0.06] p-6 text-center"
        >
          <div className="text-5xl" aria-hidden="true">{card.emoji}</div>
          <h2 className="mt-2 font-game text-2xl font-extrabold text-white">{card.name}</h2>
          <p className="mt-0.5 text-sm text-white/50">…comes flying in from space. Where does its journey end?</p>
        </motion.div>
      </AnimatePresence>

      {/* the two bins */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => pick(true)}
          disabled={revealed}
          className={`${binBase} ${
            revealed && card.reaches
              ? 'border-emerald-400/70 bg-emerald-400/15'
              : revealed
                ? 'border-white/10 bg-white/[0.02] opacity-50'
                : 'border-sky-300/30 bg-sky-400/10 hover:border-sky-300/70 hover:bg-sky-400/20'
          }`}
        >
          <DoodleTelescope className="h-14 w-14" />
          <span className="font-game text-base font-extrabold text-white">Reaches the ground!</span>
          <span className="text-xs text-white/50">We can watch it with telescopes on Earth</span>
        </button>

        <button
          onClick={() => pick(false)}
          disabled={revealed}
          className={`${binBase} ${
            revealed && !card.reaches
              ? 'border-emerald-400/70 bg-emerald-400/15'
              : revealed
                ? 'border-white/10 bg-white/[0.02] opacity-50'
                : 'border-rose-300/30 bg-rose-400/10 hover:border-rose-300/70 hover:bg-rose-400/20'
          }`}
        >
          <DoodleSatellite className="h-14 w-14" />
          <span className="font-game text-base font-extrabold text-white">Blocked by the air!</span>
          <span className="text-xs text-white/50">We need a space telescope for this one</span>
        </button>
      </div>

      {/* feedback */}
      {revealed && (
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-2xl border-2 p-4"
          style={{ borderColor: `${accent}66`, backgroundColor: `${accent}12` }}
        >
          <div className="flex items-center gap-2 font-game text-base font-extrabold text-white">
            <Icon name={correct ? 'star' : 'rays'} className="h-5 w-5" style={{ color: accent }} />
            {correct ? 'Correct!' : 'Not quite!'}
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-white/80">{card.fact}</p>
          <button
            onClick={next}
            className="mt-3 inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-game text-sm font-extrabold text-[#101426] transition-transform hover:scale-105"
            style={{ backgroundColor: accent }}
          >
            {index + 1 >= cards.length ? 'See results' : 'Next wave'}
            <Icon name="chevron" className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </GameShell>
  )
}
