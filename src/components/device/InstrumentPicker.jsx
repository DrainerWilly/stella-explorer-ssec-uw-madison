import { motion, useReducedMotion } from 'framer-motion'
import Icon from '../Icon.jsx'
import { INSTRUMENTS, COMING_SOON, buildSteps } from '../../data/stellaBuilds.js'

const GROUPS = [
  {
    id: 'platform',
    title: 'STELLA-1.2 modular platform',
    blurb: 'One base device, swappable magnetic sensor modules.',
  },
  {
    id: 'spectral',
    title: 'Spectral instruments',
    blurb: 'Self-contained spectrometers with a fixed configuration. Grab and go.',
  },
]

function InstrumentCard({ inst, index, onChoose, reduce }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: reduce ? 0 : 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.06 * index, ease: [0.22, 1, 0.36, 1] }}
      className="group flex flex-col overflow-hidden rounded-panel bg-cream shadow-soft ring-1 ring-ink/5 transition-shadow hover:shadow-lg"
    >
      {/* NASA photo on a clean plate */}
      <div className="relative m-3 grid h-44 place-items-center overflow-hidden rounded-card bg-white">
        <img
          src={`${import.meta.env.BASE_URL}${inst.photo}`}
          alt={inst.photoAlt}
          className="max-h-full max-w-full object-contain p-3 transition-transform duration-500 group-hover:scale-[1.05]"
        />
        <span
          className="absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
          style={{ backgroundColor: inst.accent }}
        >
          {buildSteps(inst).length} parts · {inst.buildTag}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4">
        <h3 className="text-lg font-extrabold tracking-tight text-ink">{inst.name}</h3>
        <p className="text-[11px] font-bold uppercase tracking-wider text-faint">{inst.fullName}</p>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">{inst.tagline}</p>

        <ul className="mt-3 flex flex-wrap gap-1.5">
          {inst.measures.map((m) => (
            <li
              key={m}
              className="rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{ backgroundColor: `${inst.accent}22`, color: inst.accent }}
            >
              {m}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <button
            onClick={() => onChoose(inst)}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-white transition-transform hover:scale-[1.03]"
            style={{ backgroundColor: inst.accent }}
          >
            Build it
            <Icon name="chevron" className="h-3.5 w-3.5" />
          </button>
          <a
            href={inst.sourceUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-muted hover:text-ink hover:underline"
          >
            NASA page
            <Icon name="share" className="h-3 w-3" />
          </a>
        </div>
      </div>
    </motion.article>
  )
}

// Stage 1: choose your instrument. Real NASA photos, real specs.
export default function InstrumentPicker({ onChoose }) {
  const reduce = useReducedMotion()

  return (
    <div className="space-y-7">
      {GROUPS.map((group) => {
        const members = INSTRUMENTS.filter((i) => i.group === group.id)
        return (
          <section key={group.id}>
            <div className="mb-3">
              <h2 className="text-lg font-extrabold tracking-tight text-ink">{group.title}</h2>
              <p className="text-[13px] text-muted">{group.blurb}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {members.map((inst, i) => (
                <InstrumentCard key={inst.id} inst={inst} index={i} onChoose={onChoose} reduce={reduce} />
              ))}

              {/* coming soon rides in the spectral group */}
              {group.id === 'spectral' && (
                <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-panel border border-dashed border-ink/15 bg-cream/50 p-5 text-center">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-ink/5 text-faint">
                    <Icon name="spectrum" className="h-5 w-5" />
                  </span>
                  <p className="text-sm font-bold text-ink/70">{COMING_SOON.name}</p>
                  <p className="text-xs text-faint">{COMING_SOON.tagline}</p>
                </div>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}
