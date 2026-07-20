// @ts-nocheck
import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Icon from '../Icon'
import GradeLevelToggle from './GradeLevelToggle'
import InfraredScene from './InfraredScene'
import {
  visibleInfraredText,
  VIEW_MODES,
  MODE_ORDER,
  getMode,
  OBJECTS,
  getObject,
  RS_HEADLINE,
  TRY_THIS,
  ADVANCED,
  ADVANCED_NOTE,
} from '../../data/visibleInfrared'

const spring = { type: 'spring', stiffness: 260, damping: 28 }
const BARS = [
  { key: 'visible', label: 'Visible', color: '#f59e0b' },
  { key: 'nir', label: 'Near-infrared', color: '#a855f7' },
  { key: 'thermal', label: 'Thermal', color: '#e0533d' },
]

export default function VisibleInfraredToggle({ gradeLevel = 'middle', onGradeChange }) {
  const reduced = useReducedMotion()
  const [mode, setMode] = useState('visible')
  const [selectedId, setSelectedId] = useState('vegHealthy')
  const [split, setSplit] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(gradeLevel === 'high')

  const modeMeta = getMode(mode)
  const obj = getObject(selectedId)
  const explanation = visibleInfraredText[modeMeta.textKey][gradeLevel]

  const reset = () => {
    setMode('visible')
    setSelectedId('vegHealthy')
    setSplit(false)
  }

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Visible vs Infrared</h2>
          <p className="mt-1 text-sm text-muted sm:text-base">
            Compare what human eyes see with what satellite sensors can detect.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <GradeLevelToggle value={gradeLevel} onChange={onGradeChange ?? (() => {})} />
          <button
            onClick={reset}
            aria-label="Reset to defaults"
            className="inline-flex items-center gap-1.5 rounded-full bg-cream px-4 py-2 text-xs font-bold text-ink/70 transition-all hover:text-ink"
          >
            <Icon name="reset" className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* mode segmented control + toggles */}
      <div className="flex flex-wrap items-center gap-2">
        {MODE_ORDER.map((id) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            aria-pressed={mode === id}
            className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${
              mode === id ? 'bg-ink text-app shadow-soft' : 'bg-cream text-ink/70 hover:text-ink'
            }`}
          >
            {getMode(id).label}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <Toggle on={split} onClick={() => setSplit((s) => !s)}>Split view</Toggle>
          <Toggle on={showAdvanced} onClick={() => setShowAdvanced((s) => !s)}>Advanced</Toggle>
        </div>
      </div>

      {/* scene + right column */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <InfraredScene
            mode={mode}
            selectedId={selectedId}
            onSelect={setSelectedId}
            split={split}
            reduced={reduced}
            showLabels
          />
          {/* mode explanation */}
          <div className="mt-3 rounded-panel bg-cream p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-faint">{modeMeta.label}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink/80">{modeMeta.explanation}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{explanation}</p>
          </div>
        </div>

        {/* object inspector */}
        <div className="lg:col-span-2">
          <div className="rounded-panel bg-surface p-4 shadow-soft sm:p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-faint">Object inspector</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {OBJECTS.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setSelectedId(o.id)}
                  aria-pressed={selectedId === o.id}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-all ${
                    selectedId === o.id ? 'bg-ink text-app shadow-soft' : 'bg-cream text-ink/70 hover:text-ink'
                  }`}
                >
                  {o.name}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={obj.id + gradeLevel}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="mt-3"
              >
                <h3 className="text-lg font-extrabold tracking-tight text-ink">{obj.name}</h3>
                <dl className="mt-2 space-y-1 text-sm">
                  <Row k="To human eyes">{obj.visible}</Row>
                  <Row k="Near-infrared">{obj.nearInfrared}</Row>
                  <Row k="Thermal">{obj.thermal}</Row>
                </dl>

                <div className="mt-3 space-y-2">
                  {BARS.map((b) => (
                    <div key={b.key}>
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-muted">{b.label}</span>
                        <span className="text-ink">{obj.bars[b.key]}/10</span>
                      </div>
                      <div className="mt-0.5 h-2.5 w-full overflow-hidden rounded-full bg-ink/[0.06]">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: b.color }}
                          initial={false}
                          animate={{ width: `${(obj.bars[b.key] / 10) * 100}%` }}
                          transition={spring}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-3 rounded-xl bg-cream p-3 text-sm leading-relaxed text-ink/80">
                  {obj.explanation}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* legend */}
      <div className="rounded-panel bg-surface p-4 shadow-soft">
        <p className="text-xs font-bold uppercase tracking-wide text-faint">{modeMeta.label} legend</p>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
          {modeMeta.legend.map((l) => (
            <span key={l.label} className="flex items-center gap-2 text-xs font-semibold text-muted">
              <span className="h-3.5 w-5 rounded-full ring-1 ring-ink/10" style={{ background: l.swatch }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      {/* advanced */}
      <AnimatePresence initial={false}>
        {showAdvanced && (
          <motion.div key="adv" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="rounded-panel bg-cream p-5">
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-muted">Advanced details</h3>
              <ul className="mt-2 space-y-1 text-sm text-ink/80">
                {ADVANCED.map((a) => (
                  <li key={a} className="flex gap-2">
                    <span className="text-faint">•</span>
                    {a}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-faint">{ADVANCED_NOTE}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* remote sensing + try this */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-panel bg-blue/40 p-5">
          <h3 className="flex items-center gap-2 text-sm font-extrabold text-cink">
            <Icon name="satellite" className="h-4 w-4" />
            Why this matters for remote sensing
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-cink/75">{RS_HEADLINE}</p>
        </div>
        <div className="rounded-panel bg-cardmint/50 p-5">
          <h3 className="flex items-center gap-2 text-sm font-extrabold text-cink">
            <Icon name="star" className="h-4 w-4" />
            Try this
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-cink/75">{TRY_THIS[gradeLevel] ?? TRY_THIS.middle}</p>
        </div>
      </div>
    </div>
  )
}

function Row({ k, children }) {
  return (
    <div className="flex gap-3">
      <dt className="w-28 shrink-0 font-semibold text-faint">{k}</dt>
      <dd className="font-semibold text-ink/80">{children}</dd>
    </div>
  )
}

function Toggle({ on, onClick, children }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
        on ? 'bg-ink text-app shadow-soft' : 'bg-cream text-ink/70 hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}
