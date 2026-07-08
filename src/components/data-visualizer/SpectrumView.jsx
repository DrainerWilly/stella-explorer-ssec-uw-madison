import { useEffect, useMemo, useRef, useState } from 'react'
import Icon from '../Icon.jsx'
import { AXIS, GRID, INK_FAINT, INK_MUTED, SERIES, formatClock, formatVal, ticks, wavelengthToColor } from './vizTheme.js'

const W = 720
const H = 320
const M = { l: 56, r: 16, t: 14, b: 42 }

// Spectral signature of one measurement: irradiance vs wavelength with
// wavelength-true band dots, uncertainty whiskers, time playback, and A/B pins.
export default function SpectrumView({ dataset, index, onIndex, reducedMotion }) {
  const [playing, setPlaying] = useState(false)
  const [pinA, setPinA] = useState(null) // record index or null
  const [pinB, setPinB] = useState(null)
  const [showUnc, setShowUnc] = useState(true)
  const [hoverNm, setHoverNm] = useState(null)
  const svgRef = useRef(null)

  const records = dataset.records
  const rec = records[Math.min(index, records.length - 1)]

  // reset pins when the dataset changes
  useEffect(() => {
    setPinA(null)
    setPinB(null)
    setPlaying(false)
  }, [dataset.id])

  // playback: step through records a few times per second
  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      onIndex((i) => (i + 1) % records.length)
    }, reducedMotion ? 900 : 220)
    return () => clearInterval(id)
  }, [playing, records.length, onIndex, reducedMotion])

  // scales — y fixed across the whole dataset so playback is comparable
  const { nmMin, nmMax, yMax } = useMemo(() => {
    let nmLo = Infinity
    let nmHi = -Infinity
    let hi = 0
    for (const r of records) {
      for (const [nm, irr, unc] of r.spec) {
        if (nm < nmLo) nmLo = nm
        if (nm > nmHi) nmHi = nm
        if (irr != null) hi = Math.max(hi, irr + (unc ?? 0))
      }
    }
    return { nmMin: nmLo - 15, nmMax: nmHi + 15, yMax: hi || 1 }
  }, [records])

  const x = (nm) => M.l + ((nm - nmMin) / (nmMax - nmMin)) * (W - M.l - M.r)
  const y = (v) => H - M.b - (Math.max(0, v) / yMax) * (H - M.t - M.b)

  const curve = (r) =>
    r.spec
      .filter((b) => b[1] != null)
      .map((b, i) => `${i === 0 ? 'M' : 'L'}${x(b[0]).toFixed(1)},${y(b[1]).toFixed(1)}`)
      .join(' ')

  const pins = [
    pinA != null && { key: 'A', rec: records[pinA], color: SERIES[1] },
    pinB != null && { key: 'B', rec: records[pinB], color: SERIES[2] },
  ].filter(Boolean)

  // A/B delta readout: mean relative difference across shared bands
  const abDelta = useMemo(() => {
    if (pinA == null || pinB == null) return null
    const a = records[pinA]
    const b = records[pinB]
    let sum = 0
    let n = 0
    for (const [nm, va] of a.spec) {
      const mb = b.spec.find((s) => s[0] === nm)
      if (va != null && mb && mb[1] != null && (va + mb[1]) > 0) {
        sum += ((mb[1] - va) / ((va + mb[1]) / 2)) * 100
        n++
      }
    }
    return n ? sum / n : null
  }, [pinA, pinB, records])

  const hovered = hoverNm != null ? rec.spec.find((b) => b[0] === hoverNm) : null

  const onMove = (e) => {
    const svg = svgRef.current
    if (!svg) return
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const { x: mx } = pt.matrixTransform(svg.getScreenCTM().inverse())
    let best = null
    for (const b of rec.spec) {
      if (best == null || Math.abs(x(b[0]) - mx) < Math.abs(x(best) - mx)) best = b[0]
    }
    setHoverNm(best)
  }

  const btn = (active) =>
    `rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
      active ? 'bg-ink text-app shadow-soft' : 'bg-cream text-ink/70 hover:text-ink'
    }`

  if (!rec || rec.spec.length === 0) {
    return (
      <div className="rounded-panel bg-cream p-6 text-sm text-ink/70">
        This instrument doesn’t record spectral bands — try the Time series or Field report views.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* transport */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setPlaying((p) => !p)}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-bold text-app transition-all hover:opacity-90"
        >
          <Icon name={playing ? 'pause' : 'play'} className="h-3.5 w-3.5" />
          {playing ? 'Pause' : 'Play through time'}
        </button>
        <input
          type="range"
          min={0}
          max={records.length - 1}
          value={Math.min(index, records.length - 1)}
          onChange={(e) => { setPlaying(false); onIndex(+e.target.value) }}
          aria-label="Measurement index"
          className="h-1.5 min-w-[140px] flex-1 cursor-pointer appearance-none rounded-full bg-ink/15 accent-sky-400"
        />
        <span className="text-xs font-bold tabular-nums text-muted">
          #{index + 1}/{records.length} · {formatClock(rec.t)} UTC · batch {rec.batch}
        </span>
      </div>

      {/* pins + uncertainty */}
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setPinA(pinA == null ? index : null)} className={btn(pinA != null)}>
          {pinA == null ? 'Pin as A' : `A = #${pinA + 1} ✕`}
        </button>
        <button onClick={() => setPinB(pinB == null ? index : null)} className={btn(pinB != null)}>
          {pinB == null ? 'Pin as B' : `B = #${pinB + 1} ✕`}
        </button>
        <button onClick={() => setShowUnc((u) => !u)} className={btn(showUnc)}>
          Uncertainty {showUnc ? 'on' : 'off'}
        </button>
        {abDelta != null && (
          <span className="rounded-full bg-cream px-3 py-1.5 text-xs font-bold text-ink/80">
            B vs A: {abDelta >= 0 ? '+' : ''}{abDelta.toFixed(1)}% mean irradiance
          </span>
        )}
      </div>

      {/* chart */}
      <div className="rounded-panel bg-surface p-3 shadow-soft sm:p-4">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label={`Spectral signature, measurement ${index + 1} of ${records.length}`}
          onMouseMove={onMove}
          onMouseLeave={() => setHoverNm(null)}
        >
          {/* gridlines + y ticks */}
          {ticks(0, yMax, 4).map((v) => (
            <g key={v}>
              <line x1={M.l} y1={y(v)} x2={W - M.r} y2={y(v)} stroke={GRID} />
              <text x={M.l - 8} y={y(v) + 3} textAnchor="end" fontSize="10" fill={INK_MUTED}>
                {formatVal(v)}
              </text>
            </g>
          ))}
          {/* x axis: wavelength ticks at each band */}
          <line x1={M.l} y1={H - M.b} x2={W - M.r} y2={H - M.b} stroke={AXIS} />
          {rec.spec.map(([nm]) => (
            <text key={nm} x={x(nm)} y={H - M.b + 14} textAnchor="middle" fontSize="9" fill={INK_MUTED}>
              {nm}
            </text>
          ))}
          <text x={(M.l + W - M.r) / 2} y={H - 6} textAnchor="middle" fontSize="10" fill={INK_FAINT}>
            wavelength (nm) — dot color ≈ the light's real color; gray-red = near-infrared
          </text>
          <text x={14} y={(M.t + H - M.b) / 2} textAnchor="middle" fontSize="10" fill={INK_FAINT} transform={`rotate(-90 14 ${(M.t + H - M.b) / 2})`}>
            irradiance ({dataset.specUnit})
          </text>

          {/* pinned curves (identity by color + label, 2px lines) */}
          {pins.map((p) => (
            <g key={p.key}>
              <path d={curve(p.rec)} fill="none" stroke={p.color} strokeWidth="2" strokeDasharray="5 4" />
              <text
                x={x(p.rec.spec[p.rec.spec.length - 1][0]) + 4}
                y={y(p.rec.spec[p.rec.spec.length - 1][1] ?? 0)}
                fontSize="10"
                fontWeight="700"
                fill={INK_MUTED}
              >
                {p.key}
              </text>
            </g>
          ))}

          {/* current curve */}
          <path d={curve(rec)} fill="none" stroke={SERIES[0]} strokeWidth="2" />

          {/* uncertainty whiskers + wavelength-true dots */}
          {rec.spec.map(([nm, irr, unc]) => {
            if (irr == null) return null
            const cx = x(nm)
            const cy = y(irr)
            const hover = hoverNm === nm
            return (
              <g key={nm}>
                {showUnc && unc != null && unc > 0 && (
                  <g stroke={INK_MUTED} strokeWidth="1">
                    <line x1={cx} y1={y(irr - unc)} x2={cx} y2={y(irr + unc)} />
                    <line x1={cx - 3} y1={y(irr - unc)} x2={cx + 3} y2={y(irr - unc)} />
                    <line x1={cx - 3} y1={y(irr + unc)} x2={cx + 3} y2={y(irr + unc)} />
                  </g>
                )}
                <circle cx={cx} cy={cy} r={hover ? 6.5 : 4.5} fill={wavelengthToColor(nm)} stroke="#14295A" strokeWidth="2" />
              </g>
            )
          })}

          {/* hover tooltip */}
          {hovered && hovered[1] != null && (
            <g pointerEvents="none">
              <line x1={x(hovered[0])} y1={M.t} x2={x(hovered[0])} y2={H - M.b} stroke={AXIS} strokeDasharray="3 3" />
              {(() => {
                const tx = Math.min(W - M.r - 150, Math.max(M.l, x(hovered[0]) + 8))
                return (
                  <g transform={`translate(${tx} ${M.t + 4})`}>
                    <rect width="148" height="40" rx="8" fill="#0b1a3d" stroke="rgba(255,255,255,0.15)" />
                    <text x="10" y="16" fontSize="10" fontWeight="700" fill="#e9f0fc">
                      {hovered[0]} nm {hovered[0] > 750 ? '(near-infrared)' : ''}
                    </text>
                    <text x="10" y="30" fontSize="10" fill={INK_MUTED}>
                      {formatVal(hovered[1])} {hovered[2] != null ? `± ${formatVal(hovered[2])}` : ''} {dataset.specUnit}
                    </text>
                  </g>
                )
              })()}
            </g>
          )}
        </svg>

        {/* legend (identity never color-alone; pins are labeled) */}
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-[11px] font-semibold text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 rounded" style={{ background: SERIES[0] }} /> Current measurement
          </span>
          {pinA != null && (
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-4 rounded" style={{ background: SERIES[1] }} /> Pin A (#{pinA + 1})
            </span>
          )}
          {pinB != null && (
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-4 rounded" style={{ background: SERIES[2] }} /> Pin B (#{pinB + 1})
            </span>
          )}
          {showUnc && <span>┃ whiskers = measurement uncertainty from the device</span>}
        </div>
      </div>
    </div>
  )
}
