import { useMemo, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Icon from '../Icon.jsx'
import { SPECTRUM_REGIONS, gradeText, REGION_SYMBOL } from '../../data/electromagneticSpectrum.js'

const WEIGHTS = [1, 1, 1, 0.55, 1, 1, 1] // visible reads as a small slice
const SHORT = { radio: 'Radio', microwave: 'Micro', infrared: 'IR', visible: 'Visible', ultraviolet: 'UV', xray: 'X-ray', gamma: 'Gamma' }
const STROKE = { radio: '#7c97c4', microwave: '#22b8a6', infrared: '#e0673d', visible: '#3fae5e', ultraviolet: '#a855f7', xray: '#4f6fe0', gamma: '#7c3aed' }
const GRADE_LABEL = { elementary: 'Elementary', middle: 'Middle', high: 'High' }
const METER_LABELS = {
  elementary: { wl: 'Wavelength (size)', fr: 'Frequency (how often)', en: 'Energy (strength)' },
  middle: { wl: 'Wavelength', fr: 'Frequency', en: 'Energy' },
  high: { wl: 'Wavelength (λ)', fr: 'Frequency (ν)', en: 'Photon energy' },
}
const WAVE_CAPTION = {
  elementary: 'Move right: the waves get smaller and stronger.',
  middle: 'Moving right, the wavelength shrinks while frequency and energy rise.',
  high: 'Toward gamma rays, wavelength decreases as frequency and photon energy increase.',
}

const spring = { type: 'spring', stiffness: 280, damping: 30 }

export default function ElectromagneticSpectrumSlider({ gradeLevel = 'middle' }) {
  const reduced = useReducedMotion()
  const [selectedIndex, setSelectedIndex] = useState(3) // start on Visible
  const [isPlaying, setIsPlaying] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const region = SPECTRUM_REGIONS[selectedIndex]
  const motionOn = isPlaying && !reduced

  // weighted segment geometry (for the sliding highlight)
  const geo = useMemo(() => {
    const total = WEIGHTS.reduce((a, b) => a + b, 0)
    let acc = 0
    return WEIGHTS.map((w) => {
      const left = (acc / total) * 100
      const width = (w / total) * 100
      acc += w
      return { left, width }
    })
  }, [])
  const sel = geo[selectedIndex]

  return (
    <div className="rounded-panel bg-surface p-4 shadow-soft sm:p-6">
      {/* 1. header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
            Electromagnetic Spectrum Slider
          </h2>
          <p className="mt-1 text-sm text-muted">
            Move across the spectrum to see how wavelength, frequency, and energy change.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-cream px-3 py-1.5 text-xs font-bold text-muted">
            Grade: {GRADE_LABEL[gradeLevel] ?? 'Middle'}
          </span>
          <button
            onClick={() => setIsPlaying((p) => !p)}
            disabled={reduced}
            title={reduced ? 'Motion is reduced in your system settings' : undefined}
            aria-pressed={motionOn}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all disabled:opacity-40 ${
              motionOn ? 'bg-ink text-app shadow-soft' : 'bg-cream text-ink/70 hover:text-ink'
            }`}
          >
            <Icon name={motionOn ? 'pause' : 'play'} className="h-3.5 w-3.5" />
            {motionOn ? 'Pause wave' : 'Play wave'}
          </button>
          <button
            onClick={() => setShowAdvanced((s) => !s)}
            aria-pressed={showAdvanced}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
              showAdvanced ? 'bg-ink text-app shadow-soft' : 'bg-cream text-ink/70 hover:text-ink'
            }`}
          >
            Show advanced details
          </button>
        </div>
      </div>

      {/* 2. spectrum track */}
      <div className="mt-5">
        <div className="relative">
          <div className="flex h-12 overflow-hidden rounded-2xl">
            {SPECTRUM_REGIONS.map((r, i) => (
              <button
                key={r.id}
                onClick={() => setSelectedIndex(i)}
                style={{ flexGrow: WEIGHTS[i] }}
                aria-pressed={i === selectedIndex}
                aria-label={`${r.name}, ${r.approxRange}`}
                className={`relative grid place-items-center bg-gradient-to-r ${r.colorClass} text-[10px] font-bold text-slate-900/80 transition-opacity hover:opacity-100 sm:text-xs ${
                  i === selectedIndex ? 'opacity-100' : 'opacity-80'
                }`}
              >
                <span className="px-1 drop-shadow-sm">{SHORT[r.id]}</span>
              </button>
            ))}
          </div>
          {/* sliding highlight over the selected segment */}
          <motion.div
            className="pointer-events-none absolute inset-y-0 z-10 rounded-2xl ring-[3px] ring-ink"
            initial={false}
            animate={{ left: `${sel.left}%`, width: `${sel.width}%` }}
            transition={spring}
          />
        </div>
        <p className="mt-1.5 text-center text-[11px] font-semibold text-faint">
          The <span className="text-ink">visible</span> band is just a tiny slice — everything else is invisible to us.
        </p>

        {/* keyboard / drag control */}
        <input
          type="range"
          min={0}
          max={SPECTRUM_REGIONS.length - 1}
          step={1}
          value={selectedIndex}
          onChange={(e) => setSelectedIndex(Number(e.target.value))}
          aria-label="Electromagnetic spectrum position"
          aria-valuetext={region.name}
          className="mt-2 w-full accent-ink"
        />
        <div className="flex justify-between text-[10px] font-bold text-faint">
          <span>longer wavelength</span>
          <span>shorter wavelength</span>
        </div>
      </div>

      {/* 3 + 4. wave panel and region info side by side */}
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <AnimatedWave region={region} index={selectedIndex} motionOn={motionOn} gradeLevel={gradeLevel} />
        <RegionInfoCard region={region} gradeLevel={gradeLevel} />
      </div>

      {/* 5. meters */}
      <SpectrumMeters index={selectedIndex} gradeLevel={gradeLevel} />

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
            <div className="mt-4 rounded-2xl bg-cream p-4 text-sm">
              <div className="flex flex-wrap gap-x-8 gap-y-2 font-semibold text-ink">
                <span>Wavelength range: <span className="text-muted">{region.approxRange}</span></span>
                <span>Frequency rank: <span className="text-muted">{region.frequencyLevel} of 7</span></span>
                <span>Energy rank: <span className="text-muted">{region.energyLevel} of 7</span></span>
              </div>
              <p className="mt-2 text-xs text-faint">
                This is a simplified model. The real electromagnetic spectrum covers a much larger scale.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. remote sensing note */}
      <RemoteSensingNote />
    </div>
  )
}

/* ---------------------------------------------------------------- wave */
const W = 400
const H = 90
const MID = H / 2
const AMP = 24

function wavePoints(period, fromX, toX) {
  let d = ''
  const step = Math.max(2, period / 24)
  for (let x = fromX; x <= toX; x += step) {
    const y = MID - AMP * Math.sin((2 * Math.PI * x) / period)
    d += `${d ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)} `
  }
  return d
}

function AnimatedWave({ region, index, motionOn, gradeLevel }) {
  const cycles = 1.2 + index * 1.4 // radio: long & wide → gamma: tight
  const period = W / cycles
  const color = STROKE[region.id]
  const path = wavePoints(period, 0, W + period)
  const dur = Math.max(1.4, 5 - index * 0.55)

  // photons riding the curve (scroll with the wave group)
  const particles = []
  for (let x = period * 0.5; x <= W + period; x += period) {
    particles.push({ x, y: MID - AMP * Math.sin((2 * Math.PI * x) / period) })
  }

  return (
    <div className="rounded-2xl bg-cream p-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${region.name} wave`}>
        <line x1="0" y1={MID} x2={W} y2={MID} stroke="#000" strokeOpacity="0.08" strokeDasharray="4 4" />
        <motion.g
          animate={motionOn ? { x: [0, -period] } : { x: 0 }}
          transition={motionOn ? { duration: dur, ease: 'linear', repeat: Infinity } : { duration: 0.3 }}
        >
          <path d={path} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
          {particles.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3.4" fill={color} />
          ))}
        </motion.g>
      </svg>
      <p className="mt-1 text-center text-xs font-semibold text-faint">{WAVE_CAPTION[gradeLevel]}</p>
    </div>
  )
}

/* ----------------------------------------------------------- region card */
function RegionInfoCard({ region, gradeLevel }) {
  return (
    <div className="rounded-2xl bg-cream p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={region.id}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.22 }}
        >
          <div className="flex items-center gap-3">
            <span className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-r ${region.colorClass} text-xl`}>
              {REGION_SYMBOL[region.id]}
            </span>
            <div>
              <h3 className="text-lg font-extrabold tracking-tight text-ink">{region.name}</h3>
              <p className="text-xs font-semibold text-muted">{region.wavelengthLabel}</p>
            </div>
          </div>

          <dl className="mt-3 space-y-2 text-sm">
            <Row k="Wavelength">{region.approxRange}</Row>
            <Row k="Everyday example">{region.example}</Row>
            <Row k="Remote sensing">{region.remoteSensingUse}</Row>
          </dl>

          <p className="mt-3 rounded-xl bg-surface p-3 text-sm leading-relaxed text-ink/80">
            {gradeText(region, gradeLevel)}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function Row({ k, children }) {
  return (
    <div className="flex gap-3">
      <dt className="w-32 shrink-0 font-semibold text-faint">{k}</dt>
      <dd className="font-semibold text-ink/80">{children}</dd>
    </div>
  )
}

/* -------------------------------------------------------------- meters */
function SpectrumMeters({ index, gradeLevel }) {
  const f = index / (SPECTRUM_REGIONS.length - 1) // 0..1
  const labels = METER_LABELS[gradeLevel] ?? METER_LABELS.middle
  const meters = [
    { label: labels.wl, pct: (1 - f) * 100, hint: 'long → short', color: '#4f6fe0' },
    { label: labels.fr, pct: f * 100, hint: 'low → high', color: '#22b8a6' },
    { label: labels.en, pct: f * 100, hint: 'low → high', color: '#e0673d' },
  ]
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-3">
      {meters.map((m) => (
        <div key={m.label} className="rounded-2xl bg-cream p-3">
          <div className="mb-1 flex items-center justify-between text-xs font-bold">
            <span className="text-ink">{m.label}</span>
            <span className="text-faint">{Math.round(m.pct)}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink/[0.06]">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: m.color }}
              initial={false}
              animate={{ width: `${m.pct}%` }}
              transition={spring}
            />
          </div>
          <p className="mt-1 text-[10px] font-semibold text-faint">{m.hint}</p>
        </div>
      ))}
    </div>
  )
}

/* --------------------------------------------------------- rs note */
function RemoteSensingNote() {
  return (
    <div className="mt-4 rounded-2xl bg-blue/40 p-4">
      <h3 className="flex items-center gap-2 text-sm font-extrabold text-cink">
        <Icon name="satellite" className="h-4 w-4" />
        Why is this important for remote sensing?
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-cink/75">
        Remote sensing instruments are designed to detect specific parts of the electromagnetic
        spectrum. Human eyes see visible light, but satellites can also measure infrared, microwave,
        and thermal energy to study vegetation, water, clouds, fires, cities, and Earth's surface.
      </p>
    </div>
  )
}
