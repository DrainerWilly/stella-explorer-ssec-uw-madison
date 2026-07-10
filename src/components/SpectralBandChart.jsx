import { useRef, useState } from 'react'
import { regionColor } from '../data/instruments.js'

// View ranges double as the "X-axis window". Full spectrum uses a log scale so
// the narrow visible/NIR bands stay readable next to the broad thermal bands.
const VIEWS = [
  { id: 'visnir', label: 'Visible / NIR', min: 400, max: 1000, log: false, ticks: [400, 500, 600, 700, 800, 900, 1000] },
  { id: 'swir', label: 'SWIR', min: 1000, max: 2500, log: false, ticks: [1000, 1500, 2000, 2500] },
  { id: 'thermal', label: 'Thermal IR', min: 2500, max: 14000, log: false, ticks: [2500, 5000, 7500, 10000, 12500] },
  { id: 'full', label: 'Full spectrum', min: 400, max: 14000, log: true, ticks: [400, 700, 1000, 2000, 5000, 10000, 14000] },
]

const pct = (w, view) => {
  const { min, max, log } = view
  const v = Math.min(Math.max(w, min), max)
  const f = log
    ? (Math.log10(v) - Math.log10(min)) / (Math.log10(max) - Math.log10(min))
    : (v - min) / (max - min)
  return f * 100
}

const tickLabel = (nm) => (nm >= 1000 ? `${+(nm / 1000).toFixed(nm % 1000 ? 1 : 0)}µm` : `${nm}`)

export default function SpectralBandChart({ bands, instrumentName }) {
  const [viewId, setViewId] = useState('visnir')
  const [hover, setHover] = useState(null) // { band, x, y }
  const wrapRef = useRef(null)

  const view = VIEWS.find((v) => v.id === viewId)
  const inView = bands.filter((b) => b.maxNm > view.min && b.minNm < view.max)

  const move = (e, band) => {
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!rect) return
    setHover({ band, x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <div className="rounded-panel bg-surface p-4 shadow-soft sm:p-5">
      {/* view controls */}
      <div className="mb-4 flex flex-wrap gap-2">
        {VIEWS.map((v) => {
          const active = v.id === viewId
          return (
            <button
              key={v.id}
              onClick={() => setViewId(v.id)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                active ? 'bg-ink text-app shadow-soft' : 'bg-cream text-ink/70 hover:text-ink'
              }`}
            >
              {v.label}
            </button>
          )
        })}
      </div>

      <div ref={wrapRef} className="relative" onMouseLeave={() => setHover(null)}>
        {inView.length === 0 ? (
          <p className="py-10 text-center text-sm font-semibold text-muted">
            {instrumentName} has no bands in this range. Try another view.
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {inView.map((b) => {
              const left = pct(b.minNm, view)
              const right = pct(b.maxNm, view)
              const isHover = hover?.band?.id === b.id
              return (
                <div key={b.id} className="flex items-center gap-2 sm:gap-3">
                  {/* band label */}
                  <div className="w-20 shrink-0 text-right sm:w-28">
                    <div className="truncate text-xs font-bold text-ink">{b.band}</div>
                    <div className="truncate text-[10px] text-faint">{b.colorOrPurpose}</div>
                  </div>
                  {/* track + bar */}
                  <div className="relative h-5 flex-1 rounded-full bg-ink/[0.05]">
                    <div
                      className="absolute top-0 h-full cursor-pointer rounded-full transition-[filter,transform] hover:brightness-105"
                      style={{
                        left: `${left}%`,
                        width: `${Math.max(right - left, 0)}%`,
                        minWidth: '6px',
                        backgroundColor: regionColor(b.spectralRegion),
                        outline: isHover ? '2px solid rgb(var(--ink))' : 'none',
                        outlineOffset: '1px',
                      }}
                      onMouseEnter={(e) => move(e, b)}
                      onMouseMove={(e) => move(e, b)}
                      title={`${b.band}: ${b.colorOrPurpose} (${b.minNm}–${b.maxNm} nm)`}
                    />
                  </div>
                </div>
              )
            })}

            {/* x-axis ticks, aligned to the track (offset by label column) */}
            <div className="mt-1 flex items-center gap-2 sm:gap-3">
              <div className="w-20 shrink-0 sm:w-28" />
              <div className="relative h-5 flex-1">
                {view.ticks.map((t) => (
                  <span
                    key={t}
                    className="absolute top-0 -translate-x-1/2 text-[10px] font-semibold text-faint"
                    style={{ left: `${pct(t, view)}%` }}
                  >
                    {tickLabel(t)}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-20 shrink-0 sm:w-28" />
              <div className="flex-1 text-center text-[10px] font-semibold uppercase tracking-wide text-faint">
                wavelength {view.log ? '(log scale)' : ''}
              </div>
            </div>
          </div>
        )}

        {/* hover tooltip */}
        {hover && (
          <div
            className="pointer-events-none absolute z-20 w-56 rounded-2xl border border-ink/10 bg-surface p-3 text-xs shadow-lift"
            style={{
              left: Math.min(hover.x + 14, (wrapRef.current?.clientWidth ?? 0) - 232),
              top: hover.y + 14,
            }}
          >
            <div className="text-[11px] font-semibold text-faint">{instrumentName}</div>
            <div className="text-sm font-extrabold text-ink">
              {hover.band.band} · {hover.band.colorOrPurpose}
            </div>
            <dl className="mt-1.5 space-y-0.5 text-ink/80">
              <Row k="Region">
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: regionColor(hover.band.spectralRegion) }}
                  />
                  {hover.band.spectralRegion}
                </span>
              </Row>
              <Row k="Range">
                {hover.band.minNm}–{hover.band.maxNm} nm
              </Row>
              <Row k="Center">
                {hover.band.centerNm} nm ({hover.band.centerUm} µm)
              </Row>
              <Row k="Resolution">
                {hover.band.resolutionMeters == null
                  ? 'field instrument'
                  : `${hover.band.resolutionMeters} m${hover.band.resolutionNote ? '*' : ''}`}
              </Row>
            </dl>
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ k, children }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-faint">{k}</dt>
      <dd className="text-right font-semibold">{children}</dd>
    </div>
  )
}
