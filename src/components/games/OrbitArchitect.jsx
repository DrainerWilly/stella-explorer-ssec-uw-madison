import { useMemo } from 'react'
import Icon from '../Icon.jsx'
import MultipleChoiceGame from './MultipleChoiceGame.jsx'
import { ORBIT_TYPES, ORBIT_QUESTIONS, GAME_ACCENT } from '../../data/games.js'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function BriefCard({ text, accent }) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 ring-white/10"
        style={{ backgroundColor: `${accent}22`, color: accent }}
      >
        <Icon name="satellite" className="h-5 w-5" />
      </span>
      <div>
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
          Mission brief
        </div>
        <p className="mt-1 text-[15px] font-semibold leading-snug text-ink">{text}</p>
      </div>
    </div>
  )
}

export default function OrbitArchitect({ game, onExit }) {
  const accent = GAME_ACCENT[game.color]
  const questions = useMemo(() => {
    return shuffle(ORBIT_QUESTIONS).map((q) => {
      const correctType = ORBIT_TYPES.find((t) => t.id === q.answer)
      const distractors = shuffle(ORBIT_TYPES.filter((t) => t.id !== q.answer)).slice(0, 3)
      const opts = shuffle([correctType, ...distractors])
      return {
        key: q.answer + q.brief.slice(0, 8),
        visual: <BriefCard text={q.brief} accent={accent} />,
        prompt: 'Which orbit gets this mission done?',
        options: opts.map((o) => o.short),
        correct: opts.findIndex((o) => o.id === q.answer),
        explain: q.explain,
      }
    })
  }, [accent])

  return (
    <MultipleChoiceGame
      game={game}
      questions={questions}
      onExit={onExit}
      resultDetail="Choosing the right orbit is one of the first decisions in designing a real Earth-observing mission — it shapes what the satellite can see and how often."
    />
  )
}
