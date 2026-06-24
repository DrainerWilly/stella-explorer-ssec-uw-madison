import Icon from './Icon.jsx'
import SpectralCompare from './SpectralCompare.jsx'

export default function FeaturedActivityCard() {
  return (
    <section className="rounded-card border border-ink/5 bg-cream2 p-5 sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-[11px] font-bold text-ink/70 shadow-soft">
            <Icon name="data" className="h-3.5 w-3.5" />
            Featured activity
          </span>
          <h2 className="mt-2.5 text-2xl font-extrabold tracking-tight text-ink">
            Field Data vs Satellite Data
          </h2>
          <p className="mt-1 max-w-md text-sm text-muted">
            Select a STELLA sample and compare its spectral signature with how Landsat sees the same
            surface. Toggle between what your eyes see and what satellites see.
          </p>
        </div>
        <button className="hidden shrink-0 items-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-xs font-bold text-app transition-all hover:scale-[1.02] sm:inline-flex">
          Open activity
          <Icon name="chevron" className="h-3.5 w-3.5" />
        </button>
      </div>

      <SpectralCompare />
    </section>
  )
}
