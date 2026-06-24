import Icon from './Icon.jsx'

export default function LessonCard({ lesson, onOpen }) {
  return (
    <button
      onClick={() => onOpen?.(lesson)}
      aria-label={lesson.route ? `Open lesson: ${lesson.title}` : lesson.title}
      className={`group flex cursor-pointer flex-col rounded-card bg-${lesson.color} p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lift`}
    >
      {/* top row: label + badge */}
      <div className="mb-7 flex items-start justify-between">
        <span className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/70 text-cink">
            <Icon name={lesson.icon} className="h-[18px] w-[18px]" />
          </span>
          <span className="text-sm font-bold text-cink/70">{lesson.label}</span>
        </span>
        <span className="flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-bold text-cink/80">
          <Icon name="star" className="h-3 w-3 text-amber-500" />
          {lesson.badge}
        </span>
      </div>

      {/* title */}
      <h3 className="text-xl font-extrabold leading-snug tracking-tight text-cink">
        {lesson.title}
      </h3>

      {/* meta + avatars */}
      <div className="mt-3 flex items-end justify-between">
        <span className="text-[13px] font-medium text-cink/55">{lesson.meta}</span>
        <span className="flex -space-x-2">
          {['from-white to-white/60', 'from-white/80 to-white/40', 'from-white/70 to-white/30'].map(
            (g, i) => (
              <span
                key={i}
                className={`grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br ${g} text-cink/50 ring-2 ring-white/60`}
              >
                <span className="h-2.5 w-2.5 rounded-full bg-cink/15" />
              </span>
            ),
          )}
        </span>
      </div>
    </button>
  )
}
