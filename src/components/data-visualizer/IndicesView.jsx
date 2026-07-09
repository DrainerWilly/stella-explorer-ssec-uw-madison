import { useEffect, useMemo } from 'react'
import { AXIS, GRID, INK_FAINT, INK_MUTED, SERIES, formatClock, ticks } from './vizTheme.js'
import { greennessForRecord, hasNirBand } from '../../utils/stellaData.ts'

const W = 720
const H = 200
const M = { l: 50, r: 14, t: 12, b: 30 }

// Greenness zones (same science as the NDVI Ranger game, kept consistent)
const ZONES = [
  { max: 0, label: 'water / shadow', color: '#4a90d9' },
  { max: 0.2, label: 'bare / built', color: '#b98a4b' },
  { max: 0.5, label: 'sparse veg', color: '#a7c957' },
  { max: 1.01, label: 'dense veg', color: '#4faa5a' },
]
const zoneFor = (v) => ZONES.find((z) => v < z.max) ?? ZONES[ZONES.length - 1]

// Greenness lab: an NDVI-style index computed from the real red + NIR bands of
// each measurement. Honestly labeled as an irradiance-based estimate.
export default function IndicesView({ dataset, index, onIndex }) {
  const usable = hasNirBand(dataset)

  const series = useMemo(() => {
    if (!usable) return []
    return dataset.records
      .map((r, i) => ({ i, t: r.t, g: greennessForRecord(r) }))
      .filter((p) => p.g != null)
  }, [dataset, usable])

  useEffect(() => {
    /* keep index valid when dataset changes */
    if (index >= dataset.records.length) onIndex(0)
  }, [dataset.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!usable) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-relaxed text-ink/70">
        This dataset has no near-infrared band, so a greenness index can’t be computed.{' '}
        {dataset.instrument === 'Helio-STELLA'
          ? 'Helio-STELLA looks at the Sun, not at plants — try its lux and band data in the Time series view instead.'
          : 'Try the Time series or Field report views instead.'}
      </div>
    )
  }

  const rec = dataset.records[Math.min(index, dataset.records.length - 1)]
  const g = greennessForRecord(rec)
  const red = rec.spec.filter((b) => b[0] >= 620 && b[0] <= 690 && b[1] != null).sort((a, b) => Math.abs(a[0] - 650) - Math.abs(b[0] - 650))[0]
  const nir = rec.spec.filter((b) => b[0] >= 780 && b[0] <= 950 && b[1] != null).sort((a, b) => Math.abs(a[0] - 860) - Math.abs(b[0] - 860))[0]

  const [t0, t1] = [series[0]?.t ?? 0, series[series.length - 1]?.t ?? 1]
  const x = (t) => M.l + ((t - t0) / Math.max(1, t1 - t0)) * (W - M.l - M.r)
  const y = (v) => M.t + (1 - (v + 1) / 2) * (H - M.t - M.b) // -1..1

  return (
    <div className="space-y-3">
      {/* live formula for the current measurement */}
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wide text-faint">
            Greenness estimate — measurement #{Math.min(index, dataset.records.length - 1) + 1}
          </p>
          <p className="mt-2 font-mono text-sm text-ink/85">
            (NIR − red) / (NIR + red) ={' '}
            {red && nir ? (
              <>
                ({nir[1]} − {red[1]}) / ({nir[1]} + {red[1]}) ={' '}
                <strong className="text-lg" style={{ color: g != null ? zoneFor(g).color : undefined }}>
                  {g != null ? g.toFixed(3) : '—'}
                </strong>
              </>
            ) : (
              '— (no red/NIR reading in this record)'
            )}
          </p>
          <p className="mt-1.5 text-[11px] leading-snug text-faint">
            red = band nearest 650 nm ({red ? `${red[0]} nm` : '—'}) · NIR = band nearest 860 nm ({nir ? `${nir[0]} nm` : '—'}).
            Computed from raw irradiance — true NDVI first converts to reflectance with a white-reference calibration.
          </p>
        </div>
        {g != null && (
          <div className="grid min-w-[130px] place-items-center rounded-2xl p-4" style={{ backgroundColor: `${zoneFor(g).color}22` }}>
            <span className="text-3xl font-extrabold tabular-nums" style={{ color: zoneFor(g).color }}>
              {g.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-ink/70">{zoneFor(g).label}</span>
          </div>
        )}
      </div>

      {/* index over time */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3 shadow-soft sm:p-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Greenness estimate over time">
          {/* zone bands as recessive backdrop */}
          {ZONES.map((z, i) => {
            const lo = i === 0 ? -1 : ZONES[i - 1].max
            return (
              <rect key={z.label} x={M.l} y={y(Math.min(z.max, 1))} width={W - M.l - M.r} height={y(lo) - y(Math.min(z.max, 1))} fill={z.color} opacity="0.10" />
            )
          })}
          {ticks(-1, 1, 4).map((v) => (
            <g key={v}>
              <line x1={M.l} y1={y(v)} x2={W - M.r} y2={y(v)} stroke={GRID} />
              <text x={M.l - 6} y={y(v) + 3} textAnchor="end" fontSize="9" fill={INK_MUTED}>{v.toFixed(1)}</text>
            </g>
          ))}
          <line x1={M.l} y1={y(-1)} x2={W - M.r} y2={y(-1)} stroke={AXIS} />
          <path
            d={series.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.t).toFixed(1)},${y(p.g).toFixed(1)}`).join(' ')}
            fill="none"
            stroke={SERIES[1]}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* current marker */}
          {g != null && (
            <circle cx={x(rec.t)} cy={y(g)} r="5" fill={SERIES[1]} stroke="#14295A" strokeWidth="2" />
          )}
          {[t0, t1].map((t, i) => (
            <text key={i} x={x(t)} y={H - 8} textAnchor={i === 0 ? 'start' : 'end'} fontSize="9" fill={INK_FAINT}>
              {formatClock(t)} UTC
            </text>
          ))}
        </svg>
        <input
          type="range"
          min={0}
          max={dataset.records.length - 1}
          value={Math.min(index, dataset.records.length - 1)}
          onChange={(e) => onIndex(+e.target.value)}
          aria-label="Measurement index"
          className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-ink/15 accent-emerald-400"
        />
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 px-1 text-[11px] font-semibold text-muted">
          {ZONES.map((z) => (
            <span key={z.label} className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: z.color, opacity: 0.7 }} />
              {z.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
