import { CHAPTERS } from '../../../data/landsatLessonContent.js'

// Chapter navigation + progress. Vertical sticky list on desktop, horizontally
// scrollable pills (within its own container) on mobile.
export default function LandsatLessonStepper({ activeId, onJump }) {
  const activeIndex = Math.max(0, CHAPTERS.findIndex((c) => c.id === activeId))
  const progress = ((activeIndex + 1) / CHAPTERS.length) * 100

  return (
    <nav aria-label="Lesson chapters" className="rounded-panel bg-surface p-3 shadow-soft lg:p-4">
      <div className="mb-3 hidden items-center justify-between lg:flex">
        <span className="text-xs font-bold uppercase tracking-wide text-faint">Chapters</span>
        <span className="text-xs font-bold text-muted">{activeIndex + 1}/{CHAPTERS.length}</span>
      </div>
      {/* progress bar */}
      <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-ink/[0.06]">
        <div className="h-full rounded-full bg-ink transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scroll-soft lg:flex-col lg:overflow-visible">
        {CHAPTERS.map((c, i) => {
          const active = c.id === activeId
          return (
            <li key={c.id} className="shrink-0 lg:shrink">
              <button
                onClick={() => onJump(c.id)}
                aria-current={active ? 'true' : undefined}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold transition-all ${
                  active ? 'bg-ink text-app shadow-soft' : 'bg-cream text-ink/70 hover:text-ink'
                }`}
              >
                <span
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] ${
                    active ? 'bg-app/20 text-app' : 'bg-surface text-ink/60'
                  }`}
                >
                  {c.num}
                </span>
                <span className="whitespace-nowrap lg:whitespace-normal">{c.short}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
