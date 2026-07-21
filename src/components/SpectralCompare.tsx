// @ts-nocheck
import { useState } from 'react'
import { SIGNATURES, VISIBLE_MAX_NM, ndvi } from '../data/spectra'
import { LANDSAT_REFLECTIVE } from '../data/landsat'

// Plot geometry (SVG user units). The chart scales responsively via viewBox.
const W = 360
const H = 170
const PAD = { l: 30, r: 12, t: 12, b: 26 }
const PLOT_W = W - PAD.l - PAD.r
const PLOT_H = H - PAD.t - PAD.b
const WL_MIN = 400
const WL_MAX = 2300
const R_MAX = 55 // max reflectance shown (%)

const xScale = (w) => PAD.l + ((w - WL_MIN) / (WL_MAX - WL_MIN)) * PLOT_W
const yScale = (r) => PAD.t + (1 - r / R_MAX) * PLOT_H

const toPath = (points) =>
  points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.w).toFixed(1)} ${yScale(p.r).toFixed(1)}`).join(' ')

// reflectance at a given wavelength (nearest sample) for NDVI readout
const rAt = (sig, w) =>
  sig.points.reduce((best, p) => (Math.abs(p.w - w) < Math.abs(best.w - w) ? p : best)).r

export default function SpectralCompare() {
  const [mode, setMode] = useState('satellite') // 'visible' | 'satellite'
  const veg = SIGNATURES.vegetation
  const pav = SIGNATURES.pavement
  const visibleOnly = mode === 'visible'

  const vegNdvi = ndvi(rAt(veg, 655), rAt(veg, 865)).toFixed(2)

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
      {/* chart */}
      <div className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] p-3 shadow-soft">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Spectral reflectance chart">
          {/* y gridlines + labels */}
          {[0, 25, 50].map((r) => (
            <g key={r}>
              <line x1={PAD.l} x2={W - PAD.r} y1={yScale(r)} y2={yScale(r)} stroke="#fff" strokeOpacity="0.08" />
              <text x={PAD.l - 6} y={yScale(r) + 3} textAnchor="end" className="fill-faint" fontSize="8">
                {r}
              </text>
            </g>
          ))}

          {/* visible-light rainbow band (400–700 nm) */}
          <defs>
            <linearGradient id="rainbow" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#7d5bd6" />
              <stop offset="22%" stopColor="#4a6fe0" />
              <stop offset="45%" stopColor="#46c25a" />
              <stop offset="68%" stopColor="#d6c23f" />
              <stop offset="100%" stopColor="#e0533d" />
            </linearGradient>
          </defs>
          <rect
            x={xScale(WL_MIN)}
            y={H - PAD.b}
            width={xScale(VISIBLE_MAX_NM) - xScale(WL_MIN)}
            height="5"
            fill="url(#rainbow)"
            rx="2"
          />

          {/* infrared region: dimmed when in "what your eyes see" mode */}
          {visibleOnly && (
            <rect
              x={xScale(VISIBLE_MAX_NM)}
              y={PAD.t}
              width={W - PAD.r - xScale(VISIBLE_MAX_NM)}
              height={PLOT_H}
              fill="#050b1f"
              fillOpacity="0.72"
            />
          )}

          {/* visible | infrared divider */}
          <line
            x1={xScale(VISIBLE_MAX_NM)}
            x2={xScale(VISIBLE_MAX_NM)}
            y1={PAD.t}
            y2={H - PAD.b}
            stroke="#fff"
            strokeOpacity="0.2"
            strokeDasharray="3 3"
          />

          {/* Landsat reflective band markers: shown in satellite mode */}
          {!visibleOnly &&
            LANDSAT_REFLECTIVE.map((b) => (
              <line
                key={b.band}
                x1={xScale(b.center)}
                x2={xScale(b.center)}
                y1={PAD.t}
                y2={H - PAD.b}
                stroke={b.swatch}
                strokeOpacity="0.35"
                strokeWidth="1"
              />
            ))}

          {/* curves */}
          <path d={toPath(pav.points)} fill="none" stroke={pav.color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <path d={toPath(veg.points)} fill="none" stroke={veg.color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />

          {/* axis labels */}
          <text x={xScale(550)} y={H - 4} textAnchor="middle" className="fill-faint" fontSize="8">
            visible
          </text>
          <text x={xScale(1500)} y={H - 4} textAnchor="middle" className="fill-faint" fontSize="8">
            infrared (satellites)
          </text>
        </svg>
      </div>

      {/* controls + readout */}
      <div className="flex flex-col justify-between gap-3 lg:w-56">
        {/* visible / infrared toggle */}
        <div className="flex rounded-full bg-white/[0.06] p-1 text-xs font-bold">
          <button
            onClick={() => setMode('visible')}
            className={`flex-1 rounded-full px-3 py-2 transition-all ${
              visibleOnly ? 'bg-ink text-app shadow-soft' : 'text-muted hover:text-ink'
            }`}
          >
            👁 Your eyes
          </button>
          <button
            onClick={() => setMode('satellite')}
            className={`flex-1 rounded-full px-3 py-2 transition-all ${
              !visibleOnly ? 'bg-ink text-app shadow-soft' : 'text-muted hover:text-ink'
            }`}
          >
            🛰 Satellite
          </button>
        </div>

        <p className="text-xs leading-relaxed text-muted">
          {visibleOnly
            ? 'Your eyes only see 400–700 nm. The leaf looks green because it reflects green light.'
            : 'Landsat also reads near-infrared. The leaf reflects ~50% of NIR, invisible to you, but it reveals plant health.'}
        </p>

        {/* legend */}
        <div className="flex flex-col gap-1.5">
          {[veg, pav].map((s) => (
            <span key={s.label} className="flex items-center gap-2 text-xs font-semibold text-ink/80">
              <span className="h-2.5 w-4 rounded-full" style={{ backgroundColor: s.color }} />
              {s.short}
            </span>
          ))}
        </div>

        {/* NDVI readout: only meaningful with NIR */}
        <div className="rounded-2xl bg-cardmint px-3 py-2.5 shadow-soft">
          <div className="text-[11px] font-semibold text-cink/60">Leaf NDVI (vegetation health)</div>
          <div className="text-lg font-extrabold text-cink">
            {visibleOnly ? 'Needs NIR' : vegNdvi}
          </div>
        </div>
      </div>
    </div>
  )
}
