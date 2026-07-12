import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Icon from '../Icon.jsx'
import { GAME_ACCENT } from '../../data/games.js'
import { recordResult } from '../../utils/gameProgress.ts'

function medal(pct) {
  if (pct >= 0.9) return { label: 'Mission specialist!', stars: 3 }
  if (pct >= 0.6) return { label: 'Nicely done!', stars: 2 }
  if (pct >= 0.3) return { label: 'Getting there!', stars: 1 }
  return { label: 'Keep exploring!', stars: 0 }
}

const CONFETTI_COLORS = ['#ffd97a', '#ff9db1', '#8fd0ff', '#7fe3a8', '#c9b6ff']

// Falling confetti pieces (motion-safe, purely decorative).
function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        left: `${(i * 41 + 9) % 100}%`,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        delay: (i % 8) * 0.12,
        drift: ((i * 13) % 40) - 20,
        spin: ((i * 47) % 360) - 180,
        w: 6 + (i % 3) * 3,
      })),
    [],
  )
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute top-0 rounded-sm"
          style={{ left: p.left, width: p.w, height: p.w * 1.6, backgroundColor: p.color }}
          initial={{ y: -30, x: 0, rotate: 0, opacity: 1 }}
          animate={{ y: 480, x: p.drift, rotate: p.spin, opacity: [1, 1, 0.8, 0] }}
          transition={{ duration: 2.6, delay: p.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  )
}

// Shared end-of-game screen: saves the mission-patch progress, celebrates with
// confetti, and offers replay + exit.
export default function GameResults({ game, score, total, onReplay, onExit, detail }) {
  const reduce = useReducedMotion()
  const accent = GAME_ACCENT[game.color] || '#CDEBFF'
  const pct = total > 0 ? score / total : 0
  const { label, stars } = medal(pct)
  const [outcome, setOutcome] = useState(null)

  // Save once per results screen.
  useEffect(() => {
    setOutcome(recordResult(game.id, score, total))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-white/10 bg-white/[0.05] p-8 text-center backdrop-blur-sm">
      {!reduce && stars >= 2 && <Confetti />}

      <motion.span
        initial={{ scale: reduce ? 1 : 0.4, rotate: reduce ? 0 : -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 14 }}
        className="relative mx-auto grid h-20 w-20 place-items-center rounded-full border-2"
        style={{ backgroundColor: `${accent}22`, borderColor: `${accent}70`, color: accent }}
      >
        <Icon name="trophy" className="h-10 w-10" />
      </motion.span>

      <div className="relative mt-3 flex items-center justify-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            initial={{ scale: reduce ? 1 : 0, rotate: reduce ? 0 : -60 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.25 + i * 0.18, type: 'spring', stiffness: 300, damping: 12 }}
          >
            <Icon
              name="star"
              className="h-8 w-8"
              style={{ color: i < stars ? '#ffd97a' : 'rgb(255 255 255 / 0.15)' }}
            />
          </motion.span>
        ))}
      </div>

      <h2 className="relative mt-3 font-game text-3xl font-extrabold text-white">{label}</h2>
      <p className="relative mt-1 font-game text-5xl font-extrabold" style={{ color: accent }}>
        {score}
        <span className="text-2xl text-white/40"> / {total}</span>
      </p>

      {/* patch earned banner */}
      {outcome?.firstPatch && (
        <motion.p
          initial={{ opacity: 0, y: reduce ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative mx-auto mt-3 inline-flex items-center gap-2 rounded-full border-2 border-amber-300/50 bg-amber-300/15 px-4 py-1.5 font-game text-sm font-bold text-amber-200"
        >
          <Icon name={game.icon} className="h-4 w-4" />
          New mission patch earned!
        </motion.p>
      )}
      {outcome && !outcome.firstPatch && outcome.newBest && (
        <p className="relative mt-3 font-game text-sm font-bold text-emerald-300">New best score!</p>
      )}

      {detail && <p className="relative mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/60">{detail}</p>}

      <div className="relative mt-6 flex flex-wrap justify-center gap-3">
        <button
          onClick={onReplay}
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-game text-sm font-extrabold text-[#101426] transition-transform hover:scale-105"
          style={{ backgroundColor: accent }}
        >
          <Icon name="reset" className="h-4 w-4" />
          Play again
        </button>
        <button
          onClick={onExit}
          className="inline-flex items-center gap-2 rounded-full border-2 border-white/15 bg-white/5 px-6 py-3 font-game text-sm font-bold text-white transition-colors hover:bg-white/10"
        >
          <Icon name="games" className="h-4 w-4" />
          More games
        </button>
      </div>
    </div>
  )
}
