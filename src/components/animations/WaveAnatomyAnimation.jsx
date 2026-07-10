import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Icon from '../Icon.jsx'
import GradeLevelToggle from './GradeLevelToggle.jsx'
import WaveScene from './WaveScene.jsx'
import {
  waveConcepts,
  CONCEPT_RS,
  CONCEPT_ORDER,
  WAVE_LIMITS,
  WAVE_DEFAULTS,
  WAVE_PRESETS,
  PRESET_ORDER,
  TRY_THIS,
  frequencyNormalized,
} from '../../data/waveConcepts.js'

const { ampMin, ampMax, wlMin, wlMax } = WAVE_LIMITS
const spring = { type: 'spring', stiffness: 260, damping: 28 }
const rel = (v, min, max) => 1 + ((v - min) / (max - min)) * 9 // → 1..10

export default function WaveAnatomyAnimation({ gradeLevel = 'middle', onGradeChange }) {
  const reduced = useReducedMotion()
  const [amplitude, setAmplitude] = useState(WAVE_DEFAULTS.amplitude)
  const [wavelength, setWavelength] = useState(WAVE_DEFAULTS.wavelength)
  const [isPlaying, setIsPlaying] = useState(true)
  const [showLabels, setShowLabels] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(gradeLevel === 'high')
  const [selectedConcept, setSelectedConcept] = useState('wavelength')
  const [wavePreset, setWavePreset] = useState('balanced')

  // reduced motion → don't auto-play continuous motion
  useEffect(() => {
    if (reduced) setIsPlaying(false)
  }, [reduced])

  const freqNorm = frequencyNormalized(wavelength)
  const playing = isPlaying && !reduced

  const applyPreset = (id) => {
    const p = WAVE_PRESETS[id]
    setWavePreset(id)
    if (p.amplitude != null) setAmplitude(p.amplitude)
    if (p.wavelength != null) setWavelength(p.wavelength)
  }
  const onAmp = (v) => { setAmplitude(v); setWavePreset('custom') }
  const onWl = (v) => { setWavelength(v); setWavePreset('custom') }
  const reset = () => {
    setAmplitude(WAVE_DEFAULTS.amplitude)
    setWavelength(WAVE_DEFAULTS.wavelength)
    setWavePreset('balanced')
    setShowLabels(true)
    setSelectedConcept('wavelength')
  }

  const concept = waveConcepts[selectedConcept]
  const metrics = [
    { label: 'Amplitude', value: rel(amplitude, ampMin, ampMax), color: '#0ea5e9' },
    { label: 'Wavelength', value: rel(wavelength, wlMin, wlMax), color: '#7c3aed' },
    { label: 'Frequency', value: 1 + freqNorm * 9, color: '#22b8a6' },
    { label: 'Relative energy', value: 1 + freqNorm * 9, color: '#e0673d' },
  ]

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Wave Anatomy</h2>
          <p className="mt-1 text-sm text-muted sm:text-base">
            Explore how wavelength, frequency, and amplitude shape electromagnetic waves.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <GradeLevelToggle value={gradeLevel} onChange={onGradeChange ?? (() => {})} />
          <button
            onClick={() => setIsPlaying((p) => !p)}
            disabled={reduced}
            title={reduced ? 'Motion is reduced in your system settings' : undefined}
            aria-pressed={playing}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all disabled:opacity-40 ${
              playing ? 'bg-ink text-app shadow-soft' : 'bg-cream text-ink/70 hover:text-ink'
            }`}
          >
            <Icon name={playing ? 'pause' : 'play'} className="h-3.5 w-3.5" />
            {playing ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={reset}
            aria-label="Reset wave to defaults"
            className="inline-flex items-center gap-1.5 rounded-full bg-cream px-4 py-2 text-xs font-bold text-ink/70 transition-all hover:text-ink"
          >
            <Icon name="reset" className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* scene + concept panel */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <WaveScene
            amplitude={amplitude}
            wavelength={wavelength}
            isPlaying={playing}
            showLabels={showLabels}
            freqNorm={freqNorm}
            reduced={reduced}
          />
        </div>
        <div className="lg:col-span-2">
          <ConceptPanel
            selected={selectedConcept}
            onSelect={setSelectedConcept}
            concept={concept}
            gradeLevel={gradeLevel}
            rsNote={CONCEPT_RS[selectedConcept]}
          />
        </div>
      </div>

      {/* controls */}
      <div className="rounded-panel bg-surface p-4 shadow-soft sm:p-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <RangeControl
            label="Amplitude" helper="Wave height" min={ampMin} max={ampMax} value={amplitude}
            onChange={onAmp} minLabel="Short" maxLabel="Tall"
          />
          <RangeControl
            label="Wavelength" helper="Distance from crest to crest" min={wlMin} max={wlMax} value={wavelength}
            onChange={onWl} minLabel="Short" maxLabel="Long"
          />
        </div>

        {/* presets + toggles */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-faint">Presets</span>
          {PRESET_ORDER.map((id) => (
            <button
              key={id}
              onClick={() => (id === 'custom' ? setWavePreset('custom') : applyPreset(id))}
              aria-pressed={wavePreset === id}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                wavePreset === id ? 'bg-ink text-app shadow-soft' : 'bg-cream text-ink/70 hover:text-ink'
              }`}
            >
              {WAVE_PRESETS[id].label}
            </button>
          ))}
          <div className="ml-auto flex gap-2">
            <Toggle on={showLabels} onClick={() => setShowLabels((s) => !s)}>Labels</Toggle>
            <Toggle on={showAdvanced} onClick={() => setShowAdvanced((s) => !s)}>Advanced</Toggle>
          </div>
        </div>
      </div>

      {/* metrics */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-card bg-surface p-4 shadow-soft">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-muted">{m.label}</span>
              <span className="text-ink">{m.value.toFixed(1)}</span>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-ink/[0.06]">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: m.color }}
                initial={false}
                animate={{ width: `${(m.value / 10) * 100}%` }}
                transition={spring}
              />
            </div>
            <p className="mt-1 text-[10px] font-semibold text-faint">relative · out of 10</p>
          </div>
        ))}
      </div>

      {/* advanced */}
      <AnimatePresence initial={false}>
        {showAdvanced && (
          <motion.div
            key="adv"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="rounded-panel bg-cream p-5">
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-muted">
                Advanced wave relationship
              </h3>
              <p className="mt-2 rounded-xl bg-surface px-3 py-2 font-mono text-sm font-bold text-ink">
                wave speed = wavelength × frequency
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink/80">
                For electromagnetic waves in a vacuum, speed is constant, so wavelength and frequency
                are inversely related. Longer wavelength → lower frequency; shorter wavelength →
                higher frequency.
              </p>
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm font-semibold text-ink">
                <span>Amplitude: <span className="text-muted">{rel(amplitude, ampMin, ampMax).toFixed(1)}</span></span>
                <span>Wavelength: <span className="text-muted">{rel(wavelength, wlMin, wlMax).toFixed(1)}</span></span>
                <span>Frequency: <span className="text-muted">{(1 + freqNorm * 9).toFixed(1)}</span></span>
                <span>Energy: <span className="text-muted">{(1 + freqNorm * 9).toFixed(1)}</span></span>
              </div>
              <p className="mt-2 text-xs text-faint">
                This is a simplified classroom visualization. The real electromagnetic spectrum spans
                many orders of magnitude, so this wave is not drawn to scale.
              </p>
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
          <p className="mt-1.5 text-sm leading-relaxed text-cink/75">
            Remote sensing instruments detect electromagnetic waves. The wavelength of those waves
            determines what kind of information a sensor can collect. Visible wavelengths show colors,
            infrared wavelengths can reveal vegetation health and heat, and microwave wavelengths can
            help observe Earth through clouds.
          </p>
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

/* ---------------------------------------------------------- concept panel */
function ConceptPanel({ selected, onSelect, concept, gradeLevel, rsNote }) {
  return (
    <div className="flex h-full flex-col rounded-panel bg-surface p-4 shadow-soft sm:p-5">
      <div className="flex flex-wrap gap-2">
        {CONCEPT_ORDER.map((id) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            aria-pressed={id === selected}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
              id === selected ? 'bg-ink text-app shadow-soft' : 'bg-cream text-ink/70 hover:text-ink'
            }`}
          >
            {waveConcepts[id].label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selected}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="mt-4"
        >
          <h3 className="text-xl font-extrabold tracking-tight text-ink">{concept.label}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink/80">{concept[gradeLevel]}</p>

          <div className="mt-3 rounded-xl bg-cream p-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-faint">What to look at</p>
            <p className="mt-0.5 text-sm font-semibold text-ink/80">{concept.whatToLookAt}</p>
          </div>

          {rsNote && (
            <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-muted">
              <Icon name="satellite" className="mt-0.5 h-4 w-4 shrink-0" />
              {rsNote}
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ----------------------------------------------------------- sub-controls */
function RangeControl({ label, helper, min, max, value, onChange, minLabel, maxLabel }) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-bold text-ink">{label}</span>
        <span className="text-xs font-semibold text-faint">{helper}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={`${label}, ${helper}`}
        aria-valuetext={`${Math.round(((value - min) / (max - min)) * 100)} percent`}
        className="mt-2 w-full accent-ink"
      />
      <div className="flex justify-between text-[10px] font-bold text-faint">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </label>
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
