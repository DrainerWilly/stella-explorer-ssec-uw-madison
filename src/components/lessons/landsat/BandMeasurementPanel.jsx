import { useMemo, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { BAND_TILES } from '../../../data/landsatLessonContent.js'

const COLS = 12
const ROWS = 9
const CELL = 12

// deterministic pseudo-grayscale so each band tile looks distinct but stable
function cellValue(band, i, j, brightness) {
  const h = (((i * 73856093) ^ (j * 19349663) ^ (band * 83492791)) >>> 0) % 100
  // a consistent diagonal "river" runs brighter through every band
  const river = Math.abs(i - (ROWS - 1 - j) * 0.7 - 1) < 0.9 ? 0.32 : 0
  let v = brightness + (h - 50) / 280 + river
  return Math.max(0.05, Math.min(0.97, v))
}

export default function BandMeasurementPanel() {
  const reduced = useReducedMotion()
  const [sel, setSel] = useState(5)
  const tile = BAND_TILES.find((t) => t.band === sel)

  const cells = useMemo(() => {
    const out = []
    for (let j = 0; j < ROWS; j++)
      for (let i = 0; i < COLS; i++) {
        const v = cellValue(sel, i, j, tile.brightness)
        const g = Math.round(v * 255)
        out.push({ i, j, fill: `rgb(${g},${g},${g})` })
      }
    return out
  }, [sel, tile.brightness])

  return (
    <div className="space-y-4">
      <p className="rounded-panel bg-cream p-4 text-sm leading-relaxed text-ink/80">
        Landsat measures several wavelength ranges separately. A single band can be displayed as a
        grayscale image, where brightness represents the amount of energy recorded in that band.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* tile */}
        <div className="rounded-panel bg-surface p-4 shadow-soft">
          <div className="relative overflow-hidden rounded-xl">
            <svg viewBox={`0 0 ${COLS * CELL} ${ROWS * CELL}`} className="h-auto w-full" role="img" aria-label={`Illustrative Band ${sel} grayscale measurement`}>
              {cells.map((c) => (
                <rect key={`${c.i}-${c.j}`} x={c.i * CELL} y={c.j * CELL} width={CELL} height={CELL} fill={c.fill} />
              ))}
              {!reduced && (
                <motion.rect
                  y="0" width="10" height={ROWS * CELL} fill="#bff5ff" opacity="0.35"
                  animate={{ x: [-12, COLS * CELL] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
                />
              )}
            </svg>
          </div>
          <p className="mt-2 text-center text-[11px] font-bold uppercase tracking-wide text-faint">
            Illustrative band measurement — not a real Landsat scene
          </p>
        </div>

        {/* chooser + use */}
        <div className="rounded-panel bg-surface p-5 shadow-soft">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-faint">Choose a band</p>
          <div className="flex flex-wrap gap-2">
            {BAND_TILES.map((t) => (
              <button
                key={t.band}
                onClick={() => setSel(t.band)}
                aria-pressed={t.band === sel}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                  t.band === sel ? 'bg-ink text-app shadow-soft' : 'bg-cream text-ink/70 hover:text-ink'
                }`}
              >
                Band {t.band}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={sel} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="mt-4">
              <h3 className="text-lg font-extrabold tracking-tight text-ink">Band {tile.band} — {tile.name}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{tile.use}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
