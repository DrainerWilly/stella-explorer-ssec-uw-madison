import MiniBarChart from './MiniBarChart.jsx'
import { PROGRESS } from '../data/dashboard.js'

export default function ProgressCard() {
  return (
    <div className="rounded-panel bg-surface p-4 shadow-soft">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-semibold text-muted">{PROGRESS.title}</span>
        <span className="flex items-center gap-1 rounded-full bg-ink/[0.06] px-2.5 py-1 text-[11px] font-semibold text-muted">
          Week
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <span className="text-3xl font-extrabold tracking-tight text-ink">{PROGRESS.value}</span>
        <span className="rounded-full bg-cardmint px-2.5 py-1 text-[11px] font-bold text-cink/80">
          👍 {PROGRESS.badge}
        </span>
      </div>

      <MiniBarChart bars={PROGRESS.bars} />
    </div>
  )
}
