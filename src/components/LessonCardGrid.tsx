// @ts-nocheck
import LessonCard from './LessonCard'

export default function LessonCardGrid({ lessons, onOpenLesson }) {
  if (lessons.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-ink/10 bg-cream/50 px-6 py-12 text-center">
        <p className="text-sm font-semibold text-muted">
          No lessons match this filter yet.
        </p>
        <p className="mt-1 text-xs text-faint">Try another category or grade level.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {lessons.map((lesson) => (
        <LessonCard key={lesson.id} lesson={lesson} onOpen={onOpenLesson} />
      ))}
    </div>
  )
}
