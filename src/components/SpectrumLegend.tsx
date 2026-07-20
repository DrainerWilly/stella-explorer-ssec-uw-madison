// @ts-nocheck
import { SPECTRAL_REGIONS } from '../data/instruments'

// Color key for the spectral-region coloring used across the chart + table.
export default function SpectrumLegend({ className = '' }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 ${className}`}>
      {SPECTRAL_REGIONS.map((r) => (
        <span key={r.id} className="flex items-center gap-1.5 text-xs font-semibold text-muted">
          <span className="h-2.5 w-4 rounded-full" style={{ backgroundColor: r.color }} />
          {r.label}
        </span>
      ))}
    </div>
  )
}
