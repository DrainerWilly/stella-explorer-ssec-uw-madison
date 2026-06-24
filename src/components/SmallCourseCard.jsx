import Icon from './Icon.jsx'

// Compact lesson card used in the right-panel "My lessons" stack.
export default function SmallCourseCard({ course }) {
  return (
    <button
      className={`group flex w-full items-center gap-3 rounded-card bg-${course.color} p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card`}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/70 text-cink">
        <Icon name={course.icon} className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-semibold text-cink/60">{course.label}</span>
        <span className="block truncate text-sm font-bold text-cink">{course.title}</span>
      </span>
      <span className="shrink-0 rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-bold text-cink/80">
        {course.badge}
      </span>
    </button>
  )
}
