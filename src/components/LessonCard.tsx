// @ts-nocheck
import Icon from './Icon'

// Pastel accent hexes (mirror tailwind theme) used as glows/tints on the dark
// glass cards instead of full fills.
const ACCENT = {
  pink: '#F7BFC4',
  yellow: '#FFE2AC',
  lavender: '#D8D2FF',
  cardmint: '#BDEFD8',
  blue: '#CDEBFF',
  coral: '#F7A7A7',
}

export default function LessonCard({ lesson, onOpen }) {
  const accent = ACCENT[lesson.color] || '#CDEBFF'

  return (
    <button
      onClick={() => onOpen?.(lesson)}
      aria-label={lesson.route ? `Open lesson: ${lesson.title}` : lesson.title}
      style={{ '--accent': accent }}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[color:var(--accent)]/40 hover:bg-white/[0.07] hover:shadow-[0_18px_50px_-20px_var(--accent)]"
    >
      {/* accent glow that blooms on hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-40 blur-3xl transition-opacity duration-300 group-hover:opacity-80"
        style={{ backgroundColor: accent }}
      />

      {/* top row: icon + badge */}
      <div className="relative mb-8 flex items-start justify-between">
        <span className="flex items-center gap-2.5">
          <span
            className="grid h-10 w-10 place-items-center rounded-xl ring-1 ring-white/10"
            style={{ backgroundColor: `${accent}22`, color: accent }}
          >
            <Icon name={lesson.icon} className="h-[19px] w-[19px]" />
          </span>
          <span className="text-[13px] font-bold uppercase tracking-wider text-white/50">
            {lesson.label}
          </span>
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-white/70">
          <Icon name="star" className="h-3 w-3" style={{ color: accent }} />
          {lesson.badge}
        </span>
      </div>

      {/* title */}
      <h3 className="relative text-xl font-extrabold leading-snug tracking-tight text-white">
        {lesson.title}
      </h3>

      {/* meta + arrow */}
      <div className="relative mt-3 flex items-end justify-between">
        <span className="text-[13px] font-medium text-white/45">{lesson.meta}</span>
        <span
          className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-all group-hover:border-[color:var(--accent)]/50 group-hover:text-white"
          style={{ '--accent': accent }}
        >
          <Icon name="chevron" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>
  )
}
