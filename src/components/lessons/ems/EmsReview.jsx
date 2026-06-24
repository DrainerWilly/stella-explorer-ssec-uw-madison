import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from '../../Icon.jsx'
import { REVIEW, WAVELENGTH_ORDER, REGIONS } from '../../../data/emsLessonContent.js'

const NAME = Object.fromEntries(REGIONS.map((r) => [r.id, r.name]))
const SCRAMBLED = ['visible', 'gamma', 'radio', 'xray', 'micro', 'uv', 'infrared'] // start order

export default function EmsReview() {
  const [order, setOrder] = useState(SCRAMBLED)
  const [checkedOrder, setCheckedOrder] = useState(false)
  const [answers, setAnswers] = useState({}) // matching: region -> use ; quiz: qid -> idx
  const [checkedMatch, setCheckedMatch] = useState(false)

  const move = (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= order.length) return
    const next = [...order]
    ;[next[i], next[j]] = [next[j], next[i]]
    setOrder(next)
    setCheckedOrder(false)
  }
  const orderCorrect = order.every((id, i) => id === WAVELENGTH_ORDER[i])
  const uses = REVIEW.matching.map((m) => m.use)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Review your understanding</h2>

      {/* matching */}
      <div className="rounded-panel bg-surface p-5 shadow-soft">
        <h3 className="text-sm font-extrabold text-ink">Match each region to a use</h3>
        <div className="mt-3 space-y-2">
          {REVIEW.matching.map((m) => {
            const val = answers[`m_${m.region}`] ?? ''
            const right = checkedMatch && val === m.use
            const wrong = checkedMatch && val && val !== m.use
            return (
              <div key={m.region} className="flex flex-wrap items-center gap-2">
                <span className="w-40 shrink-0 text-sm font-bold text-ink">{m.region}</span>
                <select
                  value={val}
                  onChange={(e) => setAnswers((a) => ({ ...a, [`m_${m.region}`]: e.target.value }))}
                  className={`flex-1 rounded-xl border-2 bg-cream px-3 py-2 text-sm font-semibold text-ink/80 outline-none ${right ? 'border-emerald-500/60' : wrong ? 'border-coral/60' : 'border-transparent'}`}
                >
                  <option value="">Choose a use…</option>
                  {uses.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            )
          })}
        </div>
        <button onClick={() => setCheckedMatch(true)} className="mt-3 rounded-full bg-ink px-4 py-2 text-xs font-bold text-app transition-all hover:opacity-90">Check matches</button>
        {checkedMatch && <p className="mt-2 text-sm font-semibold text-muted">Green means matched. Adjust any others and check again — every region pairs with one use.</p>}
      </div>

      {/* ordering */}
      <div className="rounded-panel bg-surface p-5 shadow-soft">
        <h3 className="text-sm font-extrabold text-ink">Order: longest → shortest wavelength</h3>
        <ol className="mt-3 space-y-2">
          {order.map((id, i) => {
            const ok = checkedOrder && id === WAVELENGTH_ORDER[i]
            const no = checkedOrder && id !== WAVELENGTH_ORDER[i]
            return (
              <li key={id} className={`flex items-center justify-between gap-2 rounded-xl border-2 bg-cream px-3 py-2 ${ok ? 'border-emerald-500/60' : no ? 'border-coral/60' : 'border-transparent'}`}>
                <span className="text-sm font-bold text-ink">{i + 1}. {NAME[id]}</span>
                <span className="flex gap-1">
                  <button onClick={() => move(i, -1)} aria-label={`Move ${NAME[id]} up`} className="grid h-7 w-7 place-items-center rounded-full bg-surface text-ink/70 hover:text-ink"><Icon name="chevron" className="h-3.5 w-3.5 -rotate-90" /></button>
                  <button onClick={() => move(i, 1)} aria-label={`Move ${NAME[id]} down`} className="grid h-7 w-7 place-items-center rounded-full bg-surface text-ink/70 hover:text-ink"><Icon name="chevron" className="h-3.5 w-3.5 rotate-90" /></button>
                </span>
              </li>
            )
          })}
        </ol>
        <button onClick={() => setCheckedOrder(true)} className="mt-3 rounded-full bg-ink px-4 py-2 text-xs font-bold text-app transition-all hover:opacity-90">Check order</button>
        {checkedOrder && <p className="mt-2 text-sm font-semibold text-muted">{orderCorrect ? 'Perfect — radio is longest, gamma is shortest. 🌈' : 'Almost! Radio waves are longest and gamma rays are shortest. Keep adjusting.'}</p>}
      </div>

      {/* quiz */}
      <div className="space-y-3">
        {REVIEW.quiz.map((q, qi) => {
          const chosen = answers[q.id]
          const answered = chosen != null
          const correct = chosen === q.answer
          return (
            <fieldset key={q.id} className="rounded-panel bg-surface p-5 shadow-soft">
              <legend className="text-sm font-extrabold text-ink">{qi + 1}. {q.question}</legend>
              <div className="mt-3 space-y-2">
                {q.options.map((opt, oi) => {
                  const isChosen = chosen === oi
                  const isAns = q.answer === oi
                  const show = answered && (isChosen || isAns)
                  return (
                    <label key={oi} className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-all ${show ? (isAns ? 'border-emerald-500/60 bg-emerald-500/10 text-ink' : 'border-coral/60 bg-coral/10 text-ink') : isChosen ? 'border-ink bg-cream text-ink' : 'border-transparent bg-cream/60 text-ink/80 hover:bg-cream'}`}>
                      <input type="radio" name={q.id} checked={isChosen} onChange={() => setAnswers((a) => ({ ...a, [q.id]: oi }))} className="h-4 w-4 accent-ink" />
                      <span className="flex-1">{opt}</span>
                    </label>
                  )
                })}
              </div>
              <AnimatePresence>
                {answered && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className={`mt-3 overflow-hidden rounded-xl p-3 text-sm leading-relaxed ${correct ? 'bg-emerald-500/10 text-ink/80' : 'bg-cream text-ink/80'}`}>
                    <span className="font-extrabold">{correct ? 'Correct! ' : 'Good try — '}</span>{q.feedback}
                    <span className="mt-1 block text-[11px] font-semibold text-faint">NASA, Tour of the Electromagnetic Spectrum, Third Edition, p. {q.page}.</span>
                  </motion.p>
                )}
              </AnimatePresence>
            </fieldset>
          )
        })}
      </div>

      {/* reflection */}
      <div className="rounded-panel bg-cardmint/50 p-5">
        <h3 className="flex items-center gap-2 text-sm font-extrabold text-cink"><Icon name="star" className="h-4 w-4" />Explain in your own words</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-cink/80">{REVIEW.reflection}</p>
        <textarea rows={4} aria-label="Your reflection" placeholder="Type your thinking here… (not graded)" className="mt-3 w-full rounded-xl border-2 border-transparent bg-white/70 p-3 text-sm text-cink outline-none focus-visible:border-ink/30" />
      </div>
    </div>
  )
}
