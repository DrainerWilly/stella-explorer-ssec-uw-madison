// @ts-nocheck
import LessonCardGrid from './LessonCardGrid'

// Lessons & activities: a split, big-image catalog inspired by visualjournal.it
// — just a two-column grid of large NASA/USGS images that fade in and dim on
// hover. No header or filter chrome, matching the reference's pure image grid.
// (An accessible, visually-hidden heading is kept for semantics/screen readers.)
export default function LessonsPage({ lessons, onOpenLesson }) {
  return (
    <main className="cm-lessons order-1 flex-1 overflow-y-auto overflow-x-hidden scroll-soft">
      <h1 className="sr-only">Lessons &amp; activities</h1>
      <div className="mx-auto w-full max-w-[1728px] px-3 pb-14 pt-0 sm:pb-20">
        <LessonCardGrid lessons={lessons} onOpenLesson={onOpenLesson} />
      </div>
    </main>
  )
}
