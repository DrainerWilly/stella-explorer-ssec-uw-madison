// @ts-nocheck
import { useMemo, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Icon from '../Icon'
import GameShell from './GameShell'
import GameResults from './GameResults'
import { GAME_ACCENT } from '../../data/games'

// Data-driven engine for round-based multiple-choice games. Each question:
//   { key, visual, prompt, options: [string], correct: index, explain }
export default function MultipleChoiceGame({ game, questions, onExit, resultDetail }) {
  const accent = GAME_ACCENT[game.color] || '#CDEBFF'
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const q = questions[index]
  const revealed = selected != null

  const restart = () => {
    setIndex(0)
    setSelected(null)
    setScore(0)
    setFinished(false)
  }

  const choose = (i) => {
    if (revealed) return
    setSelected(i)
    if (i === q.correct) setScore((s) => s + 1)
  }

  const next = () => {
    if (index + 1 >= questions.length) {
      setFinished(true)
    } else {
      setIndex((n) => n + 1)
      setSelected(null)
    }
  }

  if (finished) {
    return (
      <GameShell game={game} onExit={onExit}>
        <GameResults
          game={game}
          score={score}
          total={questions.length}
          onReplay={restart}
          onExit={onExit}
          detail={resultDetail}
        />
      </GameShell>
    )
  }

  return (
    <GameShell
      game={game}
      onExit={onExit}
      scoreChip={`Score ${score} / ${questions.length}`}
      progressPct={(index / questions.length) * 100}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={q.key ?? index}
          initial={{ opacity: 0, y: reduce ? 0 : 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduce ? 0 : -10 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
            Round {index + 1} of {questions.length}
          </div>

          {q.visual && (
            <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              {q.visual}
            </div>
          )}

          <h2 className="mt-4 text-lg font-bold leading-snug text-ink">{q.prompt}</h2>

          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {q.options.map((opt, i) => {
              const isCorrect = i === q.correct
              const isPicked = i === selected
              let cls = 'border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-ink'
              if (revealed && isCorrect) cls = 'border-emerald-400/50 bg-emerald-400/15 text-white'
              else if (revealed && isPicked) cls = 'border-rose-400/50 bg-rose-500/15 text-white'
              else if (revealed) cls = 'border-white/10 bg-white/[0.02] text-ink/50'
              return (
                <button
                  key={i}
                  onClick={() => choose(i)}
                  disabled={revealed}
                  className={`flex items-center justify-between gap-2 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors ${cls}`}
                >
                  {opt}
                  {revealed && isCorrect && <Icon name="star" className="h-4 w-4 text-emerald-300" />}
                  {revealed && isPicked && !isCorrect && (
                    <Icon name="plus" className="h-4 w-4 rotate-45 text-rose-300" />
                  )}
                </button>
              )
            })}
          </div>

          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: reduce ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-xl border p-4"
              style={{
                borderColor: `${accent}55`,
                backgroundColor: `${accent}14`,
              }}
            >
              <div className="flex items-center gap-2 text-sm font-bold text-ink">
                <Icon
                  name={selected === q.correct ? 'star' : 'rays'}
                  className="h-4 w-4"
                  style={{ color: accent }}
                />
                {selected === q.correct ? 'Correct!' : 'Not quite'}
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-ink/80">{q.explain}</p>
              <button
                onClick={next}
                className="mt-3 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-[#04122b] transition-transform hover:scale-[1.03]"
                style={{ backgroundColor: accent }}
              >
                {index + 1 >= questions.length ? 'See results' : 'Next round'}
                <Icon name="chevron" className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </GameShell>
  )
}
