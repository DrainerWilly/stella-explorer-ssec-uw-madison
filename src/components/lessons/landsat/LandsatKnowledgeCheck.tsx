// @ts-nocheck
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from '../../Icon'
import { QUIZ } from '../../../data/landsatLessonContent'

export default function LandsatKnowledgeCheck() {
  const [answers, setAnswers] = useState({}) // qid -> chosen index
  const correctCount = QUIZ.filter((q) => answers[q.id] === q.answer).length
  const answeredAll = QUIZ.every((q) => answers[q.id] != null)

  return (
    <div className="space-y-4">
      {QUIZ.map((q, qi) => {
        const chosen = answers[q.id]
        const answered = chosen != null
        const correct = chosen === q.answer
        return (
          <fieldset key={q.id} className="rounded-panel bg-surface p-5 shadow-soft">
            <legend className="text-sm font-extrabold text-ink">
              {qi + 1}. {q.question}
            </legend>
            <div className="mt-3 space-y-2">
              {q.options.map((opt, oi) => {
                const isChosen = chosen === oi
                const isAnswer = q.answer === oi
                const showState = answered && (isChosen || isAnswer)
                return (
                  <label
                    key={oi}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-all ${
                      showState
                        ? isAnswer
                          ? 'border-emerald-500/60 bg-emerald-500/10 text-ink'
                          : 'border-coral/60 bg-coral/10 text-ink'
                        : isChosen
                          ? 'border-ink bg-cream text-ink'
                          : 'border-transparent bg-cream/60 text-ink/80 hover:bg-cream'
                    }`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      checked={isChosen}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                      className="h-4 w-4 accent-ink"
                    />
                    <span className="flex-1">{opt}</span>
                    {showState && isAnswer && <Icon name="star" className="h-4 w-4 text-emerald-500" />}
                  </label>
                )
              })}
            </div>
            <AnimatePresence>
              {answered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <p className={`mt-3 rounded-xl p-3 text-sm leading-relaxed ${correct ? 'bg-emerald-500/10 text-ink/80' : 'bg-cream text-ink/80'}`}>
                    <span className="font-extrabold">{correct ? 'Nice work! ' : 'Good try: '}</span>
                    {q.feedback}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </fieldset>
        )
      })}

      {answeredAll && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-panel bg-cardmint/50 p-4 text-center text-sm font-bold text-cink"
        >
          You answered {correctCount} of {QUIZ.length}. Every question helps you see how Landsat turns light into images. 🌍
        </motion.p>
      )}
    </div>
  )
}
