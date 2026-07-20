// @ts-nocheck
import SmallCourseCard from './SmallCourseCard'
import { CURRENT_LESSONS } from '../data/dashboard'

export default function CurrentLessons() {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-ink">My lessons</h3>
        <button className="text-xs font-semibold text-faint transition-colors hover:text-ink">
          See all
        </button>
      </div>
      <div className="flex flex-col gap-2.5">
        {CURRENT_LESSONS.map((course) => (
          <SmallCourseCard key={course.id} course={course} />
        ))}
      </div>
    </section>
  )
}
