import Icon from './Icon.jsx'
import SpectralCompare from './SpectralCompare.jsx'

export default function FeaturedActivityCard() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm sm:p-6">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-sky-500/20 blur-3xl"
      />
      <div className="relative mb-4 flex items-start justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-sky-200/90">
            <Icon name="data" className="h-3.5 w-3.5" />
            Featured activity
          </span>
          <h2 className="mt-2.5 text-2xl font-extrabold tracking-tight text-white">
            Field Data vs Satellite Data
          </h2>
          <p className="mt-1 max-w-md text-sm text-white/60">
            Select a STELLA sample and compare its spectral signature with how Landsat sees the same
            surface. Toggle between what your eyes see and what satellites see.
          </p>
        </div>
        <button className="hidden shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-white/20 sm:inline-flex">
          Open activity
          <Icon name="chevron" className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="relative">
        <SpectralCompare />
      </div>
    </section>
  )
}
