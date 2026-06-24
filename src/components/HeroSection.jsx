import Icon from './Icon.jsx'
import { GRADES } from '../data/lessons.js'

export default function HeroSection({ grade, onGradeChange }) {
  return (
    <section>
      <h1 className="text-[40px] font-extrabold leading-[1.02] tracking-[-0.02em] text-ink sm:text-[52px] lg:text-[64px]">
        Explore Earth
        <br />
        with STELLA
      </h1>

      <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base">
        Collect field measurements, compare them with Landsat satellite imagery,
        and learn how scientists observe Earth from space.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-app transition-all hover:scale-[1.02] hover:opacity-90">
          <Icon name="play" className="h-4 w-4" />
          Start a lesson
        </button>
        <button className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-surface px-5 py-3 text-sm font-bold text-ink transition-all hover:-translate-y-0.5 hover:shadow-soft">
          <Icon name="device" className="h-4 w-4" />
          View STELLA demo
        </button>

        {/* grade-level selector */}
        <div className="ml-auto flex items-center gap-1 rounded-full bg-cream p-1">
          {GRADES.map((g) => {
            const active = grade === g.id
            return (
              <button
                key={g.id}
                onClick={() => onGradeChange(g.id)}
                className={`rounded-full px-3 py-2 text-xs font-bold transition-all ${
                  active ? 'bg-ink text-app shadow-soft' : 'text-muted hover:text-ink'
                }`}
              >
                {g.short}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
