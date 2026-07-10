import CategoryFilters from './CategoryFilters.jsx'
import LessonCardGrid from './LessonCardGrid.jsx'
import { GRADES } from '../data/lessons.js'

// Lessons & activities: the full catalog, moved off the home page so home
// stays a short landing screen and this becomes the dedicated browse/filter view.
export default function LessonsPage({ category, onCategory, grade, onGrade, lessons, onOpenLesson }) {
  return (
    <main className="order-1 flex-1 overflow-y-auto overflow-x-hidden scroll-soft px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <header className="max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Lessons & activities
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
            Real field measurements, satellite comparisons, and guided activities for exploring how
            scientists observe Earth from space.
          </p>
        </header>

        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur">
          {GRADES.map((g) => {
            const active = grade === g.id
            return (
              <button
                key={g.id}
                onClick={() => onGrade(g.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                  active ? 'bg-white text-[#04122b]' : 'text-slate-300 hover:text-white'
                }`}
              >
                {g.short}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-5">
        <CategoryFilters active={category} onChange={onCategory} />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-400">
          {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}
        </span>
      </div>

      <div className="mt-4">
        <LessonCardGrid lessons={lessons} onOpenLesson={onOpenLesson} />
      </div>
    </main>
  )
}
