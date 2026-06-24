import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Icon from '../Icon.jsx'
import GradeLevelToggle from './GradeLevelToggle.jsx'
import BehaviorScene from './BehaviorScene.jsx'
import {
  WAVE_BEHAVIORS,
  BEHAVIOR_ORDER,
  getBehavior,
  SURFACES,
  SURFACE_ORDER,
  MATERIALS,
  MATERIAL_ORDER,
  MEDIA,
  MEDIUM_ORDER,
  PAIRS,
  PAIR_ORDER,
  ATMOSPHERES,
  ATMOSPHERE_ORDER,
  RS_HEADLINE,
  ADVANCED_NOTE,
} from '../../data/waveBehaviors.js'

const spring = { type: 'spring', stiffness: 260, damping: 28 }
const opts = (table, order) => order.map((id) => ({ id, label: table[id].label }))

const DEFAULTS = {
  surface: 'mirror', material: 'pavement', medium: 'air', pair: 'water',
  density: 5, scatterColor: 'blue', slitWidth: 40, waveLen: 5,
}

function metricsFor(behavior, s) {
  switch (behavior) {
    case 'reflection': {
      const x = SURFACES[s.surface]
      return [
        { label: 'Reflected', value: x.reflected, color: '#0ea5e9' },
        { label: 'Absorbed', value: x.absorbed, color: '#e0673d' },
        { label: 'Transmitted', value: x.transmitted, color: '#22b8a6' },
      ]
    }
    case 'absorption': {
      const x = MATERIALS[s.material]
      return [
        { label: 'Absorbed energy', value: x.absorbed, color: '#e0673d' },
        { label: 'Surface heating', value: x.heat, color: '#ef4444' },
        { label: 'Reflected light', value: x.reflected, color: '#0ea5e9' },
      ]
    }
    case 'transmission': {
      const x = MEDIA[s.medium]
      return [
        { label: 'Transmitted', value: x.transmitted, color: '#22b8a6' },
        { label: 'Blocked', value: x.blocked, color: '#e0673d' },
      ]
    }
    case 'refraction':
      return [{ label: 'Bend amount', value: PAIRS[s.pair].bend, color: '#7c3aed' }]
    case 'scattering': {
      const scattered = Math.min(10, Math.round(s.density * (s.scatterColor === 'blue' ? 1 : 0.6)))
      return [
        { label: 'Particle density', value: s.density, color: '#94a3b8' },
        { label: 'Scattered light', value: scattered, color: s.scatterColor === 'blue' ? '#3b82f6' : '#ef4444' },
        { label: 'Direct light', value: Math.max(0, 10 - scattered), color: '#f59e0b' },
      ]
    }
    case 'diffraction': {
      const slitRel = Math.round(((s.slitWidth - 16) / (90 - 16)) * 9 + 1)
      const spread = Math.min(10, Math.max(1, Math.round(s.waveLen * (90 / s.slitWidth))))
      return [
        { label: 'Slit width', value: slitRel, color: '#475569' },
        { label: 'Spread amount', value: spread, color: '#6366f1' },
      ]
    }
    default:
      return []
  }
}

export default function WaveBehaviorsAnimation({ gradeLevel = 'middle', onGradeChange }) {
  const reduced = useReducedMotion()
  const [behavior, setBehavior] = useState('reflection')
  const [isPlaying, setIsPlaying] = useState(true)
  const [showLabels, setShowLabels] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(gradeLevel === 'high')
  const [ctrl, setCtrl] = useState(DEFAULTS)

  useEffect(() => {
    if (reduced) setIsPlaying(false)
  }, [reduced])

  const playing = isPlaying && !reduced
  const b = getBehavior(behavior)
  const metrics = metricsFor(behavior, ctrl)
  const set = (patch) => setCtrl((c) => ({ ...c, ...patch }))
  const reset = () => {
    setCtrl(DEFAULTS)
    setShowLabels(true)
    if (!reduced) setIsPlaying(true)
  }

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Wave Behaviors</h2>
          <p className="mt-1 text-sm text-muted sm:text-base">
            See how electromagnetic waves change when they meet different materials.
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
            aria-label="Reset to defaults"
            className="inline-flex items-center gap-1.5 rounded-full bg-cream px-4 py-2 text-xs font-bold text-ink/70 transition-all hover:text-ink"
          >
            <Icon name="reset" className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* behavior tabs */}
      <div className="flex flex-wrap gap-2">
        {BEHAVIOR_ORDER.map((id) => (
          <button
            key={id}
            onClick={() => setBehavior(id)}
            aria-pressed={behavior === id}
            className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${
              behavior === id ? 'bg-ink text-app shadow-soft' : 'bg-cream text-ink/70 hover:text-ink'
            }`}
          >
            {getBehavior(id).name}
          </button>
        ))}
      </div>

      {/* scene + concept */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <BehaviorScene
            behavior={behavior}
            params={ctrl}
            playing={playing}
            showLabels={showLabels}
            advanced={showAdvanced}
            reduced={reduced}
          />
        </div>
        <div className="lg:col-span-2">
          <div className="flex h-full flex-col rounded-panel bg-surface p-4 shadow-soft sm:p-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={behavior + gradeLevel}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-xl font-extrabold tracking-tight text-ink">{b.name}</h3>
                <p className="mt-1 text-sm font-semibold text-muted">{b.short}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink/80">{b.def[gradeLevel]}</p>
                <div className="mt-3 rounded-xl bg-cream p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-faint">What to watch</p>
                  <p className="mt-0.5 text-sm font-semibold text-ink/80">{b.whatToWatch}</p>
                </div>
                <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-muted">
                  <Icon name="satellite" className="mt-0.5 h-4 w-4 shrink-0" />
                  {b.remoteSensing}
                </p>
                {showAdvanced && (
                  <p className="mt-3 rounded-xl bg-app p-3 text-xs leading-relaxed text-ink/70 ring-1 ring-ink/5">
                    {b.advanced}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* behavior-specific controls */}
      <div className="rounded-panel bg-surface p-4 shadow-soft sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex-1">
            {behavior === 'reflection' && (
              <PillRow label="Surface" options={opts(SURFACES, SURFACE_ORDER)} value={ctrl.surface} onChange={(v) => set({ surface: v })} />
            )}
            {behavior === 'absorption' && (
              <PillRow label="Material" options={opts(MATERIALS, MATERIAL_ORDER)} value={ctrl.material} onChange={(v) => set({ material: v })} />
            )}
            {behavior === 'transmission' && (
              <PillRow label="Material" options={opts(MEDIA, MEDIUM_ORDER)} value={ctrl.medium} onChange={(v) => set({ medium: v })} />
            )}
            {behavior === 'refraction' && (
              <PillRow label="Material pair" options={opts(PAIRS, PAIR_ORDER)} value={ctrl.pair} onChange={(v) => set({ pair: v })} />
            )}
            {behavior === 'scattering' && (
              <div className="space-y-3">
                <Slider label="Particle density" min={1} max={10} value={ctrl.density} onChange={(v) => set({ density: v })} minLabel="Few" maxLabel="Many" />
                <div className="flex flex-wrap items-center gap-2">
                  <PillRow
                    label="Wavelength"
                    options={[{ id: 'blue', label: 'Blue' }, { id: 'red', label: 'Red' }]}
                    value={ctrl.scatterColor}
                    onChange={(v) => set({ scatterColor: v })}
                  />
                </div>
                <PillRow
                  label="Atmosphere"
                  options={ATMOSPHERE_ORDER.map((id) => ({ id, label: ATMOSPHERES[id].label }))}
                  value={ATMOSPHERE_ORDER.find((id) => ATMOSPHERES[id].density === ctrl.density) ?? null}
                  onChange={(v) => set({ density: ATMOSPHERES[v].density })}
                />
              </div>
            )}
            {behavior === 'diffraction' && (
              <div className="space-y-3">
                <Slider label="Slit width" min={16} max={90} value={ctrl.slitWidth} onChange={(v) => set({ slitWidth: v })} minLabel="Narrow" maxLabel="Wide" />
                <Slider label="Wavelength" min={1} max={10} value={ctrl.waveLen} onChange={(v) => set({ waveLen: v })} minLabel="Short" maxLabel="Long" />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Toggle on={showLabels} onClick={() => setShowLabels((s) => !s)}>Labels</Toggle>
            <Toggle on={showAdvanced} onClick={() => setShowAdvanced((s) => !s)}>Advanced</Toggle>
          </div>
        </div>
      </div>

      {/* metrics */}
      <div className={`grid gap-3 ${metrics.length >= 3 ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-2'}`}>
        {metrics.map((m) => (
          <div key={m.label} className="rounded-card bg-surface p-4 shadow-soft">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-muted">{m.label}</span>
              <span className="text-ink">{m.value.toFixed(0)}</span>
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
          <motion.div key="adv" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="rounded-panel bg-cream p-5">
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-muted">Advanced details</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/80">{b.advanced}</p>
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
          <p className="mt-1.5 text-sm leading-relaxed text-cink/75">{b.tryThis[gradeLevel] ?? b.tryThis.middle}</p>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- controls */
function PillRow({ label, options, value, onChange }) {
  return (
    <div>
      {label && <span className="mb-1.5 block text-xs font-bold text-faint">{label}</span>}
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            aria-pressed={value === o.id}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
              value === o.id ? 'bg-ink text-app shadow-soft' : 'bg-cream text-ink/70 hover:text-ink'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function Slider({ label, min, max, value, onChange, minLabel, maxLabel }) {
  return (
    <label className="block max-w-sm">
      <span className="text-xs font-bold text-ink">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        aria-valuetext={`${Math.round(((value - min) / (max - min)) * 100)} percent`}
        className="mt-1 w-full accent-ink"
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
