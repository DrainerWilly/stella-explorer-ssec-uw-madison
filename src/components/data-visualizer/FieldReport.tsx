// @ts-nocheck
import { useMemo } from 'react'
import Icon from '../Icon'
import { datasetReport, derivedCsv } from '../../utils/stellaData'
import { formatDayClock, formatVal } from './vizTheme'

// Research mode: session summary + per-field statistics + derived-CSV export.
export default function FieldReport({ dataset }) {
  const rows = useMemo(() => datasetReport(dataset), [dataset])

  const t0 = dataset.records[0]?.t
  const t1 = dataset.records[dataset.records.length - 1]?.t
  const batches = new Set(dataset.records.map((r) => r.batch)).size
  const durMin = t0 != null && t1 != null ? (t1 - t0) / 60000 : 0
  const cadence = dataset.records.length > 1 ? (t1 - t0) / (dataset.records.length - 1) / 1000 : 0

  const download = () => {
    const blob = new Blob([derivedCsv(dataset)], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${dataset.instrument.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-derived.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const summary = [
    { label: 'Records', value: dataset.records.length.toLocaleString('en-US') },
    { label: 'Batches', value: batches },
    { label: 'Duration', value: durMin >= 90 ? `${(durMin / 60).toFixed(1)} h` : `${durMin.toFixed(0)} min` },
    { label: 'Avg. cadence', value: `${formatVal(cadence)} s` },
  ]

  return (
    <div className="space-y-3">
      {/* session summary tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {summary.map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-center shadow-soft">
            <div className="text-2xl font-extrabold tabular-nums text-ink">{s.value}</div>
            <div className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-faint">{s.label}</div>
          </div>
        ))}
      </div>

      <p className="px-1 text-xs font-semibold text-muted">
        Session start {t0 != null ? formatDayClock(t0) : '—'}
        {dataset.originalRows > dataset.records.length &&
          ` · bundled sample is downsampled from ${dataset.originalRows.toLocaleString('en-US')} original rows`}
      </p>

      {/* stats table */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.035] p-4 shadow-soft">
        <table className="w-full min-w-[520px] border-collapse text-left text-sm">
          <caption className="sr-only">Per-field statistics</caption>
          <thead>
            <tr className="text-[11px] font-bold uppercase tracking-wide text-faint">
              <th className="pb-2 pr-3">Field</th>
              <th className="pb-2 pr-3 text-right">n</th>
              <th className="pb-2 pr-3 text-right">Min</th>
              <th className="pb-2 pr-3 text-right">Mean</th>
              <th className="pb-2 pr-3 text-right">Max</th>
              <th className="pb-2 pr-3 text-right">σ (std dev)</th>
              <th className="pb-2 text-left">Unit</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {rows.map((r) => (
              <tr key={r.key} className="border-t border-ink/10">
                <td className="py-1.5 pr-3 font-semibold text-ink/85">{r.label}</td>
                <td className="py-1.5 pr-3 text-right text-muted">{r.stats.n}</td>
                <td className="py-1.5 pr-3 text-right text-ink/80">{formatVal(r.stats.min)}</td>
                <td className="py-1.5 pr-3 text-right font-bold text-ink">{formatVal(r.stats.mean)}</td>
                <td className="py-1.5 pr-3 text-right text-ink/80">{formatVal(r.stats.max)}</td>
                <td className="py-1.5 pr-3 text-right text-muted">{formatVal(r.stats.std)}</td>
                <td className="py-1.5 text-muted">{r.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={download}
        className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-app transition-all hover:opacity-90"
      >
        <Icon name="download" className="h-4 w-4" />
        Download derived CSV (env fields + greenness)
      </button>
    </div>
  )
}
