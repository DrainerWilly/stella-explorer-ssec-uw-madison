// @ts-nocheck
import { useEffect, useMemo, useRef, useState } from 'react'
import { ACCENT, AXIS, INK_FAINT, INK_MUTED, PANEL_BG, formatClock, formatDayClock, formatVal, heatColor, heatRGB, wavelengthToColor } from './vizTheme'
import { LABEL, PANEL } from './dvStyles'
import { fieldMeta } from '../../utils/stellaData'

const FIELDH = 40 // px per environmental sensor strip

// The session at a glance, EVERY cell of the dataset rendered at once:
// a spectrogram (wavelength × time, colored by irradiance) stacked over
// time-aligned environmental sensor traces, wired to one moving readout cursor.
export default function OverviewView({ dataset }) {
  const records = dataset.records
  const cols = records.length
  const [norm, setNorm] = useState('row') // 'row' (per-band) | 'global'
  const [hover, setHover] = useState(cols - 1)
  const canvasRef = useRef(null)
  const plotRef = useRef(null)

  useEffect(() => setHover(records.length - 1), [dataset.id, records.length])

  // ----- spectrogram matrix -----
  const spectro = useMemo(() => {
    const nms = [...new Set(records.flatMap((r) => r.spec.map((b) => b[0])))].sort((a, b) => a - b)
    if (nms.length === 0) return null
    const rowOf = new Map(nms.map((nm, i) => [nm, i]))
    const rows = nms.length
    const mat = Array.from({ length: rows }, () => new Array(cols).fill(null))
    let gMin = Infinity
    let gMax = -Infinity
    const rMin = new Array(rows).fill(Infinity)
    const rMax = new Array(rows).fill(-Infinity)
    records.forEach((r, c) => {
      for (const [nm, irr] of r.spec) {
        if (irr == null) continue
        const ri = rowOf.get(nm)
        mat[ri][c] = irr
        if (irr < gMin) gMin = irr
        if (irr > gMax) gMax = irr
        if (irr < rMin[ri]) rMin[ri] = irr
        if (irr > rMax[ri]) rMax[ri] = irr
      }
    })
    return { nms, rows, mat, gMin, gMax, rMin, rMax }
  }, [records, cols])

  const rowH = spectro ? Math.max(15, Math.min(30, Math.round(300 / spectro.rows))) : 0
  const specH = spectro ? spectro.rows * rowH : 0

  // draw spectrogram to canvas
  useEffect(() => {
    const cv = canvasRef.current
    if (!cv || !spectro) return
    const W = Math.max(900, cols)
    cv.width = W
    cv.height = spectro.rows * rowH
    const ctx = cv.getContext('2d')
    ctx.clearRect(0, 0, cv.width, cv.height)
    const cw = W / cols
    for (let ri = 0; ri < spectro.rows; ri++) {
      const lo = norm === 'row' ? spectro.rMin[ri] : spectro.gMin
      const hi = norm === 'row' ? spectro.rMax[ri] : spectro.gMax
      const span = hi - lo || 1
      for (let c = 0; c < cols; c++) {
        const v = spectro.mat[ri][c]
        if (v == null) continue
        const [r, g, b] = heatRGB((v - lo) / span)
        ctx.fillStyle = `rgb(${r},${g},${b})`
        ctx.fillRect(Math.floor(c * cw), ri * rowH, Math.ceil(cw), rowH)
      }
    }
  }, [spectro, norm, rowH, cols])

  // ----- environmental sensor strips -----
  const fields = dataset.envFields
  const envH = fields.length * FIELDH
  const SVGW = 1000
  const xAt = (i) => (cols <= 1 ? 0 : (i / (cols - 1)) * SVGW)
  const strips = useMemo(
    () =>
      fields.map((f, fi) => {
        const pts = records.map((r, i) => ({ i, v: r.env[f] })).filter((p) => Number.isFinite(p.v))
        let lo = Infinity
        let hi = -Infinity
        for (const p of pts) {
          if (p.v < lo) lo = p.v
          if (p.v > hi) hi = p.v
        }
        if (!(hi > lo)) { lo -= 1; hi += 1 }
        const top = fi * FIELDH + 6
        const h = FIELDH - 12
        const y = (v) => top + h - ((v - lo) / (hi - lo)) * h
        const d = pts.map((p, k) => `${k === 0 ? 'M' : 'L'}${xAt(p.i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ')
        // faint fill under the line
        const area =
          pts.length > 1
            ? `M${xAt(pts[0].i).toFixed(1)},${(top + h).toFixed(1)} ` +
              pts.map((p) => `L${xAt(p.i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ') +
              ` L${xAt(pts[pts.length - 1].i).toFixed(1)},${(top + h).toFixed(1)} Z`
            : ''
        return { f, d, area, y, lo, hi, top, h }
      }),
    [fields, records, cols],
  )

  // ----- shared cursor -----
  const onMove = (e) => {
    const el = plotRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    setHover(Math.round(frac * (cols - 1)))
  }
  const cursorFrac = cols <= 1 ? 0 : hover / (cols - 1)
  const rec = records[Math.min(hover, cols - 1)]

  return (
    <div className="space-y-3">
      {/* controls */}
      <div className="flex flex-wrap items-center gap-2">
        <span className={LABEL}>Full session · {cols.toLocaleString('en-US')} measurements</span>
        {spectro && (
          <div className="ml-auto flex items-center gap-1.5">
            <span className={LABEL}>Color scale</span>
            {['row', 'global'].map((m) => (
              <button
                key={m}
                onClick={() => setNorm(m)}
                aria-pressed={norm === m}
                className="rounded-full px-3 py-1 text-[11px] font-bold transition-colors"
                style={
                  norm === m
                    ? { backgroundColor: ACCENT, color: '#04121f' }
                    : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }
                }
              >
                {m === 'row' ? 'per band' : 'absolute'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* the plot: labels gutter + shared-cursor plot column */}
      <div className={`${PANEL} p-3 sm:p-4`}>
        <div className="flex gap-2">
          {/* left gutter: band + field labels */}
          <div className="w-12 shrink-0 sm:w-14">
            {spectro && (
              <div className="relative" style={{ height: specH }}>
                {spectro.nms.map((nm, i) => (
                  <span
                    key={nm}
                    className="absolute right-1 -translate-y-1/2 text-[9px] font-bold tabular-nums"
                    style={{ top: (i + 0.5) * rowH, color: wavelengthToColor(nm) }}
                  >
                    {nm}
                  </span>
                ))}
              </div>
            )}
            {spectro && <div style={{ height: 18 }} />}
            <div className="relative" style={{ height: envH }}>
              {strips.map((s, i) => (
                <span
                  key={s.f}
                  className="absolute right-1 text-[9px] font-semibold leading-tight text-white/50"
                  style={{ top: i * FIELDH + 4 }}
                >
                  {fieldMeta(s.f).label.split(' ')[0]}
                </span>
              ))}
            </div>
          </div>

          {/* plot column (shared cursor) */}
          <div
            ref={plotRef}
            className="relative min-w-0 flex-1"
            onMouseMove={onMove}
            onMouseLeave={() => setHover(cols - 1)}
            style={{ cursor: 'crosshair' }}
          >
            {spectro && (
              <>
                <canvas
                  ref={canvasRef}
                  className="block w-full rounded"
                  style={{ height: specH, imageRendering: 'auto' }}
                  aria-label="Spectrogram: irradiance for every band across the whole session"
                />
                <div className="pointer-events-none flex justify-between px-0.5 pt-0.5 text-[8px] font-bold uppercase tracking-wide text-white/30">
                  <span>wavelength × time: brighter = more irradiance</span>
                  <span style={{ height: 18 }} />
                </div>
              </>
            )}

            {/* env strips */}
            <svg
              viewBox={`0 0 ${SVGW} ${envH}`}
              preserveAspectRatio="none"
              className="block w-full"
              style={{ height: envH }}
              aria-label="Environmental sensors over time"
            >
              {strips.map((s, i) => (
                <g key={s.f}>
                  <line x1="0" y1={i * FIELDH} x2={SVGW} y2={i * FIELDH} stroke="rgba(255,255,255,0.06)" />
                  {s.area && <path d={s.area} fill={`${ACCENT}14`} />}
                  <path d={s.d} fill="none" stroke={ACCENT} strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
                </g>
              ))}
            </svg>

            {/* shared vertical cursor */}
            <div
              className="pointer-events-none absolute top-0 bottom-0 w-px"
              style={{ left: `${cursorFrac * 100}%`, background: 'rgba(255,255,255,0.6)' }}
            />
            <div
              className="pointer-events-none absolute -top-1 h-2 w-2 -translate-x-1/2 rounded-full"
              style={{ left: `${cursorFrac * 100}%`, background: ACCENT }}
            />
          </div>
        </div>

        {/* x time axis */}
        <div className="mt-1.5 flex justify-between pl-12 text-[9px] font-semibold tabular-nums text-white/35 sm:pl-14">
          <span>{records[0] ? formatClock(records[0].t) : ''}</span>
          <span>{records[Math.floor(cols / 2)] ? formatClock(records[Math.floor(cols / 2)].t) : ''}</span>
          <span>{records[cols - 1] ? formatClock(records[cols - 1].t) : ''} UTC</span>
        </div>
      </div>

      {/* live column readout: every cell at the cursor */}
      <div className={`${PANEL} p-3 sm:p-4`}>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className={LABEL}>Readout</span>
          <span className="text-sm font-bold tabular-nums text-white">
            #{Math.min(hover, cols - 1) + 1}
            <span className="text-white/40"> / {cols}</span>
          </span>
          <span className="font-mono text-[11px] text-white/55">{rec ? formatDayClock(rec.t) : ''}</span>
          <span className="ml-auto text-[10px] text-white/35">hover the chart to scan the session</span>
        </div>

        {rec && rec.spec.length > 0 && (
          <div className="mt-2.5">
            <div className={LABEL}>Spectrum ({dataset.specUnit})</div>
            <div className="mt-1 flex flex-wrap gap-1">
              {rec.spec.map(([nm, irr]) => (
                <span
                  key={nm}
                  className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-white/80"
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: wavelengthToColor(nm) }} />
                  {nm}
                  <span className="text-white/50">{irr == null ? '—' : formatVal(irr)}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {rec && fields.length > 0 && (
          <div className="mt-2.5">
            <div className={LABEL}>Environment</div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {fields.map((f) => {
                const m = fieldMeta(f)
                const v = rec.env[f]
                return (
                  <span key={f} className="inline-flex items-baseline gap-1 rounded-md bg-white/[0.06] px-2 py-0.5 text-[11px]">
                    <span className="font-semibold text-white/50">{m.label}</span>
                    <span className="font-mono font-bold tabular-nums text-white">
                      {v == null ? '—' : formatVal(v)}
                    </span>
                    <span className="text-[9px] text-white/40">{m.unit}</span>
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {/* colorbar */}
        {spectro && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-wide text-white/35">low</span>
            <div
              className="h-2 flex-1 rounded-full"
              style={{
                background: `linear-gradient(90deg, ${[0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1]
                  .map((t) => heatColor(t))
                  .join(',')})`,
              }}
            />
            <span className="text-[9px] font-bold uppercase tracking-wide text-white/35">high irradiance</span>
          </div>
        )}
      </div>
    </div>
  )
}
