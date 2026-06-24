import Icon from './Icon.jsx'
import ProgressCard from './ProgressCard.jsx'
import CurrentLessons from './CurrentLessons.jsx'
import { PROFILE } from '../data/dashboard.js'

// Right-hand student/teacher panel. `gradeLabel` reflects the active grade
// selector so the panel stays in sync with the lesson filters.
export default function RightDashboard({ gradeLabel, lessonCount }) {
  return (
    <aside className="flex w-full flex-col gap-4 rounded-panel bg-cream p-4 sm:p-5 scroll-soft lg:h-full lg:w-[330px] lg:shrink-0 lg:overflow-y-auto xl:w-[348px]">
      {/* top bar */}
      <div className="flex items-center text-ink/70">
        <button aria-label="Notifications" className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-surface">
          <Icon name="bell" className="h-5 w-5" />
        </button>
      </div>

      {/* profile */}
      <div className="flex flex-col items-center text-center">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-blue via-lavender to-cardmint text-cink shadow-soft ring-4 ring-surface">
          <Icon name="globe" className="h-9 w-9" strokeWidth={1.6} />
        </span>
        <h2 className="mt-3 text-lg font-extrabold tracking-tight text-ink">{PROFILE.name}</h2>
        <span className="mt-1.5 rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted shadow-soft">
          {gradeLabel} • {lessonCount} {lessonCount === 1 ? 'activity' : 'activities'}
        </span>
      </div>

      {/* students row */}
      <div className="flex items-center justify-between rounded-2xl bg-surface px-3.5 py-2.5 shadow-soft">
        <span className="flex items-center gap-2 text-sm">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-cream text-ink/70">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="8" r="3.2" />
              <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
            </svg>
          </span>
          <span className="font-bold text-ink">{PROFILE.friends.count}</span>
          <span className="text-muted">{PROFILE.friends.label}</span>
        </span>
        <span className="flex -space-x-2">
          {['from-pink to-coral', 'from-yellow to-pink', 'from-lavender to-blue'].map((g, i) => (
            <span key={i} className={`h-6 w-6 rounded-full bg-gradient-to-br ${g} ring-2 ring-white`} />
          ))}
        </span>
      </div>

      <ProgressCard />

      <CurrentLessons />
    </aside>
  )
}
