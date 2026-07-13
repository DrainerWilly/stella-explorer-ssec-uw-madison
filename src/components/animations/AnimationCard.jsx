import { motion, useReducedMotion } from 'framer-motion'
import Icon from '../Icon.jsx'

// Pastel accent hexes (mirror the tailwind theme tokens used in the data).
const ACCENT = {
  pink: '#F7BFC4',
  yellow: '#FFE2AC',
  lavender: '#D8D2FF',
  cardmint: '#BDEFD8',
  blue: '#CDEBFF',
  coral: '#F7A7A7',
}

// Light Lab experiment card: tilted sticker icon, accent glow, and a "tried"
// stamp once the visitor has opened the experiment.
export default function AnimationCard({ animation, index = 0, visited = false, onOpen }) {
  const reduce = useReducedMotion()
  const accent = ACCENT[animation.color] || '#CDEBFF'

  return (
    <motion.button
      initial={{ opacity: 0, y: reduce ? 0 : 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 * index, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduce ? undefined : { y: -6, rotate: index % 2 === 0 ? -1 : 1 }}
      onClick={() => onOpen(animation.id)}
      aria-label={`Open ${animation.title}`}
      style={{ '--accent': accent }}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border-2 border-white/10 bg-white/[0.05] p-5 text-left backdrop-blur-sm transition-colors hover:border-[color:var(--accent)]/60 hover:bg-white/[0.08]"
    >
      {/* corner glow */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-30 blur-3xl transition-opacity duration-300 group-hover:opacity-80"
        style={{ backgroundColor: accent }}
      />

      <div className="relative flex items-start justify-between">
        {/* sticker-style icon */}
        <span
          className="grid h-14 w-14 rotate-[-4deg] place-items-center rounded-2xl border-2 shadow-[0_6px_16px_-6px_var(--accent)] transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110"
          style={{ backgroundColor: `${accent}26`, borderColor: `${accent}66`, color: accent }}
        >
          <Icon name={animation.icon} className="h-7 w-7" />
        </span>

        <span className="flex flex-col items-end gap-1.5">
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-game text-[10px] font-bold uppercase tracking-wider text-white/60">
            {animation.label}
          </span>
          {visited && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-game text-[10px] font-extrabold uppercase tracking-wider text-[#101426]"
              style={{ backgroundColor: accent }}
            >
              <Icon name="star" className="h-3 w-3" />
              Tried!
            </span>
          )}
        </span>
      </div>

      <h3 className="relative mt-4 font-game text-2xl font-extrabold leading-tight tracking-tight text-white">
        {animation.title}
      </h3>
      <p className="relative mt-2 text-sm leading-relaxed text-white/60">{animation.description}</p>

      <div className="relative mt-5 flex items-center justify-between">
        <span
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-game text-sm font-extrabold text-[#101426] transition-transform group-hover:scale-105"
          style={{ backgroundColor: accent }}
        >
          <Icon name="play" className="h-4 w-4" />
          Start experiment
        </span>
        <span className="font-game text-[11px] font-bold uppercase tracking-wider text-white/35">
          {animation.badge}
        </span>
      </div>
    </motion.button>
  )
}
