import { useEffect, useMemo, useRef, useState } from 'react'
import { AXIS, GRID, INK_FAINT, INK_MUTED, SERIES, formatClock, formatVal, ticks } from './vizTheme.js'
import { envSeries, fieldMeta } from '../../utils/stellaData.ts'

const W = 720
const PH = 120 // per-panel plot height
const M = { l: 56, r: 14, t: 8, b: 20 }
const MAX_PANELS = 3

// Environment fields over time as ALIGNED SMALL MULTIPLES (one panel per field,
// each with its own y-scale — never a dual-axis chart) with a shared crosshair
// and drag-to-zoom on the shared time domain.
export default function TimeSeriesView({ dataset }) {
  const fields = dataset.envFields
  const [selected, setSelected] = useState(() => fields.slice(0, 2))
  const [domain, setDomain] = useState(null) // [t0,t1] zoom or null = full
  const [hoverT, setHoverT] = useState(null)
  const dragRef = useRef(null) // {startT, curT}
  const [drag, setDrag] = useState(null)
  const svgRef = useRef(null)

  useEffect(() => {
    setSelected(dataset.envFields.slice(0, 2))
    setDomain(null)
    setHoverT(null)
  }, [dataset.id])

  const seriesByField = useMemo(() => {
    const out = {}
    for (const f of selected) out[f] = envSeries(dataset, f)
    return out
  }, [dataset, selected])

  const [t0, t1] = useMemo(() => {
    if (domain) return domain
    const ts = dataset.records.map((r) => r.t)
    return [Math.min(...ts), Math.max(...ts)]
  }, [dataset, domain])

  const x = (t) => M.l + ((t - t0) / Math.max(1, t1 - t0)) * (W - M.l - M.r)
  const tFromX = (mx) => t0 + ((mx - M.l) / (W - M.l - M.r)) * (t1 - t0)

  const panels = selected.map((f, pi) => {
    const pts = seriesByField[f].filter((p) => p.t >= t0 && p.t <= t1)
    let lo = Infinity
    let hi = -Infinity
    for (const p of pts) {
      if (p.v < lo) lo = p.v
      if (p.v > hi) hi = p.v
    }
    if (!(hi > lo)) { lo = lo === Infinity ? 0 : lo - 1; hi = lo + 2 }
    const pad = (hi - lo) * 0.08
    lo -= pad
    hi += pad
    const top = M.t + pi * (PH + M.t + M.b)
    const y = (v) => top + PH - ((v - lo) / (hi - lo)) * PH
    return { field: f, pts, lo, hi, top, y, color: SERIES[pi] }
  })

  const totalH = selected.length * (PH + M.t + M.b) + 24

  const svgX = (e) => {
    const svg = svgRef.current
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    return pt.matrixTransform(svg.getScreenCTM().inverse()).x
  }

  const onMove = (e) => {
    const mx = svgX(e)
    const t = Math.max(t0, Math.min(t1, tFromX(mx)))
    setHoverT(t)
    if (dragRef.current) {
      dragRef.current.curT = t
      setDrag({ ...dragRef.current })
    }
  }
  const onDown = (e) => {
    const t = Math.max(t0, Math.min(t1, tFromX(svgX(e))))
    dragRef.current = { startT: t, curT: t }
    setDrag({ ...dragRef.current })
  }
  const onUp = () => {
    const d = dragRef.current
    dragRef.current = null
    setDrag(null)
    if (d && Math.abs(d.curT - d.startT) > (t1 - t0) * 0.02) {
      setDomain([Math.min(d.startT, d.curT), Math.max(d.startT, d.curT)])
    }
  }

  const nearest = (pts, t) => {
    if (!pts.length || t == null) return null
    let best = pts[0]
    for (const p of pts) if (Math.abs(p.t - t) < Math.abs(best.t - t)) best = p
    return best
  }

  const toggle = (f) =>
    setSelected((sel) =>
      sel.includes(f) ? sel.filter((s) => s !== f) : sel.length >= MAX_PANELS ? sel : [...sel, f],
    )

  return (
    <div className="space-y-3">
      {/* field picker */}
      <div className="flex flex-wrap gap-2">
        {fields.map((f) => {
          const on = selected.includes(f)
          const slot = selected.indexOf(f)
          return (
            <button
              key={f}
              onClick={() => toggle(f)}
              aria-pressed={on}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                on ? 'bg-ink text-app shadow-soft' : 'bg-cream text-ink/70 hover:text-ink'
              }`}
            >
              {on && <span className="h-2 w-2 rounded-full" style={{ background: SERIES[slot] }} />}
              {fieldMeta(f).label}
            </button>
          )
        })}
        <span className="self-center text-[11px] font-semibold text-faint">up to {MAX_PANELS} fields</span>
        {domain && (
          <button onClick={() => setDomain(null)} className="rounded-full bg-cream px-3 py-1.5 text-xs font-bold text-ink/70 hover:text-ink">
            Reset zoom ✕
          </button>
        )}
      </div>

      {selected.length === 0 ? (
        <div className="rounded-panel bg-cream p-6 text-sm text-ink/70">Pick a field above to plot it over time.</div>
      ) : (
        <div className="rounded-panel bg-surface p-3 shadow-soft sm:p-4">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${totalH}`}
            className="w-full touch-none select-none"
            role="img"
            aria-label={`Time series of ${selected.map((f) => fieldMeta(f).label).join(', ')}`}
            onMouseMove={onMove}
            onMouseLeave={() => { setHoverT(null); onUp() }}
            onMouseDown={onDown}
            onMouseUp={onUp}
            style={{ cursor: 'crosshair' }}
          >
            {panels.map((p) => {
              const meta = fieldMeta(p.field)
              const hp = nearest(p.pts, hoverT)
              return (
                <g key={p.field}>
                  {/* panel title — direct label, ink not series color */}
                  <text x={M.l} y={p.top - 1} fontSize="10" fontWeight="700" fill={INK_MUTED}>
                    <tspan fill={p.color}>●</tspan> {meta.label} {meta.unit && `(${meta.unit})`}
                  </text>
                  {ticks(p.lo, p.hi, 3).map((v) => (
                    <g key={v}>
                      <line x1={M.l} y1={p.y(v)} x2={W - M.r} y2={p.y(v)} stroke={GRID} />
                      <text x={M.l - 6} y={p.y(v) + 3} textAnchor="end" fontSize="9" fill={INK_MUTED}>
                        {formatVal(v)}
                      </text>
                    </g>
                  ))}
                  <line x1={M.l} y1={p.top + PH} x2={W - M.r} y2={p.top + PH} stroke={AXIS} />
                  <path
                    d={p.pts.map((pt, i) => `${i === 0 ? 'M' : 'L'}${x(pt.t).toFixed(1)},${p.y(pt.v).toFixed(1)}`).join(' ')}
                    fill="none"
                    stroke={p.color}
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  {hp && hoverT != null && (
                    <g pointerEvents="none">
                      <circle cx={x(hp.t)} cy={p.y(hp.v)} r="4" fill={p.color} stroke="#14295A" strokeWidth="2" />
                      <text
                        x={Math.min(x(hp.t) + 8, W - M.r - 4)}
                        y={p.y(hp.v) - 8}
                        fontSize="10"
                        fontWeight="700"
                        fill="#e9f0fc"
                        textAnchor={x(hp.t) > W - 120 ? 'end' : 'start'}
                      >
                        {formatVal(hp.v)} {meta.unit}
                      </text>
                    </g>
                  )}
                </g>
              )
            })}

            {/* shared crosshair + time readout */}
            {hoverT != null && (
              <g pointerEvents="none">
                <line x1={x(hoverT)} y1={M.t} x2={x(hoverT)} y2={totalH - 18} stroke={AXIS} strokeDasharray="3 3" />
                <text x={Math.min(x(hoverT), W - 60)} y={totalH - 6} fontSize="10" fill={INK_MUTED} textAnchor="middle">
                  {formatClock(hoverT)} UTC
                </text>
              </g>
            )}

            {/* brush rectangle */}
            {drag && (
              <rect
                x={Math.min(x(drag.startT), x(drag.curT))}
                y={M.t}
                width={Math.abs(x(drag.curT) - x(drag.startT))}
                height={totalH - M.t - 18}
                fill="rgba(57,135,229,0.15)"
                stroke="rgba(57,135,229,0.6)"
              />
            )}

            {/* x time labels */}
            {[t0, (t0 + t1) / 2, t1].map((t, i) => (
              <text key={i} x={x(t)} y={totalH - 18} textAnchor={i === 0 ? 'start' : i === 2 ? 'end' : 'middle'} fontSize="9" fill={INK_FAINT}>
                {formatClock(t)}
              </text>
            ))}
          </svg>
          <p className="mt-1 px-1 text-[11px] font-semibold text-faint">
            Drag across the chart to zoom into a time window · each panel has its own scale
          </p>
        </div>
      )}
    </div>
  )
}
