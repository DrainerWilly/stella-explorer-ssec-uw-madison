// @ts-nocheck
import { motion, useReducedMotion } from 'framer-motion'
import Icon from '../Icon'
import { STELLA_SOURCE } from '../../data/stellaBuilds'

// Stage 3: the finished instrument, shown as a real device render.
//
// Each chassis has its own product image (the screen and controls are part of
// the render). Modules run on the STELLA-1.2 base, so they show the 1.2 device.

const DEVICE_RENDER = {
  q2: 'assets/stella/stella-q2.png',
  s11: 'assets/stella/stella-1-1.png',
  platform: 'assets/stella/stella-1-2.png',
}

// A short, per-instrument description of what the powered-on device is showing.
function describeDevice(instrument) {
  if (instrument.chassis === 'q2') {
    return 'Powered on and ready: the OLED reports battery voltage and charge, the green LED shows it is running, and the single MODE button toggles between continuous and burst recording.'
  }
  if (instrument.chassis === 's11') {
    return 'A live reading on the color screen: surface temperature up top, then every visible and near-infrared band (V450 through 860 nm) in µW/cm², all timestamped and logged to the SD card.'
  }
  if (instrument.id === 'stella12') {
    return 'The 3D-printed STELLA-1.2 on its boot screen. GPS stamps every reading, the rotary knob and touchscreen drive the menus, and the REC button starts a measurement batch.'
  }
  // RS / AA1 / Proto: the module rides the 1.2 base
  return `The STELLA-1.2 base that carries the ${instrument.name} module. GPS, the touchscreen, and SD logging come from the base; the ${instrument.name} module adds the sensors that do the science.`
}

export default function DeviceSimulator({ instrument, onRebuild, onChooseAnother, onNavigate }) {
  const reduce = useReducedMotion()
  const accent = instrument.accent
  const renderSrc = `${import.meta.env.BASE_URL}${DEVICE_RENDER[instrument.chassis] || DEVICE_RENDER.platform}`

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(300px,440px)_1fr]">
      {/* ---- device render ---- */}
      <div className="mx-auto w-full max-w-[440px]">
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-panel bg-gradient-to-b from-white to-[#eef0f3] p-4 shadow-soft ring-1 ring-ink/5"
        >
          {/* soft accent glow behind the device */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-6 h-40 w-40 -translate-x-1/2 rounded-full opacity-30 blur-3xl"
            style={{ backgroundColor: accent }}
          />
          <motion.img
            src={renderSrc}
            alt={instrument.photoAlt}
            className="relative mx-auto max-h-[560px] w-full object-contain"
            animate={reduce ? undefined : { y: [0, -6, 0] }}
            transition={reduce ? undefined : { duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        <p className="mt-3 text-center text-[11px] font-bold uppercase tracking-wider text-faint">
          {instrument.fullName}
        </p>
      </div>

      {/* ---- explainer column ---- */}
      <div className="flex min-w-0 flex-col gap-4">
        <div className="rounded-panel bg-cream p-5 shadow-soft">
          <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: accent }}>
            The finished instrument · {instrument.name}
          </p>
          <h3 className="mt-1 text-xl font-extrabold tracking-tight text-ink">
            Assembled and switched on
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{describeDevice(instrument)}</p>
        </div>

        <div className="rounded-panel bg-cream p-5 shadow-soft">
          <p className="text-[11px] font-bold uppercase tracking-wider text-faint">Spec sheet</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {instrument.specs.map((s) => (
              <li
                key={s}
                className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-ink/75 ring-1 ring-ink/10"
              >
                {s}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-relaxed text-faint">{instrument.science}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            <a
              href={instrument.sourceUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 text-xs font-bold hover:underline"
              style={{ color: accent }}
            >
              NASA build guide <Icon name="share" className="h-3 w-3" />
            </a>
            <a
              href={STELLA_SOURCE.buildVideoUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 text-xs font-bold hover:underline"
              style={{ color: accent }}
            >
              Build video <Icon name="play" className="h-3 w-3" />
            </a>
          </div>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate?.('data-viz')}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-bold text-app transition-opacity hover:opacity-90"
          >
            Explore real STELLA data
            <Icon name="chevron" className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onRebuild}
            className="rounded-full bg-cream px-4 py-2 text-xs font-bold text-ink/75 hover:text-ink"
          >
            Rebuild it
          </button>
          <button
            onClick={onChooseAnother}
            className="rounded-full bg-cream px-4 py-2 text-xs font-bold text-ink/75 hover:text-ink"
          >
            Choose another instrument
          </button>
        </div>
      </div>
    </div>
  )
}
