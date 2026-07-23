// @ts-nocheck
import LessonCard from './LessonCard'

// Split, big-image lessons grid: one column on mobile, two on desktop
// (see .cm-vj-grid in index.css, breakpoint 750px like the reference).
export default function LessonCardGrid({ lessons, onOpenLesson }) {
  if (lessons.length === 0) {
    return (
      <div className="border border-dashed border-black/15 bg-white px-6 py-12 text-center">
        <p className="text-sm font-semibold text-neutral-600">No lessons match this filter yet.</p>
        <p className="mt-1 text-xs text-neutral-400">Try another category or grade level.</p>
      </div>
    )
  }

  return (
    <div className="cm-vj-grid">
      {lessons.map((lesson) => (
        <LessonCard key={lesson.id} lesson={lesson} onOpen={onOpenLesson} />
      ))}
    </div>
  )
}
