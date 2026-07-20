// @ts-nocheck
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from '../../Icon'
import { CITATION } from '../../../data/nasaEmsSources'
import { SCENARIOS, SCENARIO_OPTIONS } from '../../../data/emsLessonContent'

const CONNECTIONS = [
  'Reflected light reveals surface properties like color and brightness.',
  'Near-infrared responses help distinguish vegetation and other land cover.',
  'Microwaves observe through clouds and support weather, ice, and soil-moisture study.',
  'Thermal infrared reveals emitted heat from surfaces.',
  'Scattering helps study aerosols, clouds, smoke, dust, and volcanic ash.',
  'Spectral signatures help identify a material’s condition and composition.',
  'False-color imagery turns invisible measurements into visible patterns.',
]

export default function RemoteSensingConnections() {
  const [picks, setPicks] = useState({}) // scenarioId -> optionId

  return (
    <div>
      <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">How NASA uses the spectrum to study Earth</h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {CONNECTIONS.map((c) => (
          <li key={c} className="flex items-start gap-2 rounded-xl bg-cream p-3 text-sm leading-relaxed text-ink/80">
            <Icon name="satellite" className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
            {c}
          </li>
        ))}
      </ul>

      <h3 className="mt-6 text-lg font-extrabold tracking-tight text-ink">Choose the best wavelength</h3>
      <p className="mt-1 text-sm text-muted">For each goal, pick the part of the spectrum NASA would use.</p>

      <div className="mt-3 space-y-3">
        {SCENARIOS.map((s) => {
          const pick = picks[s.id]
          const correct = pick === s.answer
          return (
            <div key={s.id} className="rounded-panel bg-surface p-4 shadow-soft">
              <p className="text-sm font-bold text-ink">{s.prompt}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {SCENARIO_OPTIONS.map((o) => {
                  const chosen = pick === o.id
                  const showRight = pick != null && o.id === s.answer
                  return (
                    <button
                      key={o.id}
                      onClick={() => setPicks((p) => ({ ...p, [s.id]: o.id }))}
                      aria-pressed={chosen}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                        showRight ? 'bg-emerald-500/20 text-ink ring-1 ring-emerald-500/50'
                          : chosen ? 'bg-coral/20 text-ink ring-1 ring-coral/50'
                          : 'bg-cream text-ink/70 hover:text-ink'
                      }`}
                    >
                      {o.label}
                    </button>
                  )
                })}
              </div>
              <AnimatePresence>
                {pick != null && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <p className={`mt-2 rounded-xl p-3 text-sm leading-relaxed ${correct ? 'bg-emerald-500/10 text-ink/80' : 'bg-cream text-ink/80'}`}>
                      <span className="font-extrabold">{correct ? 'Great choice! ' : 'Good thinking: '}</span>{s.feedback}
                    </p>
                    <p className="mt-1 text-[11px] font-semibold text-faint">{CITATION.adapted(`${s.page}`)}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
