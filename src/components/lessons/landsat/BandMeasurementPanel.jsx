import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BAND_TILES } from '../../../data/landsatLessonContent.js'
import { BAND_TILE_IMAGES } from '../../../data/landsatLessonSources.js'

export default function BandMeasurementPanel() {
  const [sel, setSel] = useState(5)
  const tile = BAND_TILES.find((t) => t.band === sel)
  const image = BAND_TILE_IMAGES[sel]
  const [imgOk, setImgOk] = useState(true)
  const src = image ? `${import.meta.env.BASE_URL}${image.file}` : null

  return (
    <div className="space-y-4">
      <p className="rounded-panel bg-cream p-4 text-sm leading-relaxed text-ink/80">
        Landsat measures several wavelength ranges separately. A single band can be displayed as a
        grayscale image, where brightness represents the amount of energy recorded in that band.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* tile */}
        <div className="rounded-panel bg-surface p-4 shadow-soft">
          <div className="relative overflow-hidden rounded-xl bg-cream ring-1 ring-ink/5">
            <AnimatePresence mode="wait">
              {imgOk && src ? (
                <motion.img
                  key={sel}
                  src={src}
                  alt={image.alt}
                  loading="lazy"
                  onError={() => setImgOk(false)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="grid aspect-square w-full place-items-center p-4 text-center text-xs font-semibold text-muted">
                  Band {sel} image unavailable
                </div>
              )}
            </AnimatePresence>
          </div>
          <p className="mt-2 text-center text-[11px] font-bold uppercase tracking-wide text-faint">
            Real Landsat 8 measurement — Cape Coral–Fort Myers, FL (2024-02-22)
          </p>
          {image && (
            <p className="mt-1 text-center text-[10px] leading-snug text-faint/80">
              {image.credit}{' '}
              <a
                href={image.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-dotted underline-offset-2 hover:text-ink"
              >
                Source ↗
              </a>
            </p>
          )}
        </div>

        {/* chooser + use */}
        <div className="rounded-panel bg-surface p-5 shadow-soft">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-faint">Choose a band</p>
          <div className="flex flex-wrap gap-2">
            {BAND_TILES.map((t) => (
              <button
                key={t.band}
                onClick={() => {
                  setSel(t.band)
                  setImgOk(true)
                }}
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
              {sel === 5 && (
                <p className="mt-3 rounded-xl bg-cream p-3 text-xs leading-relaxed text-ink/70">
                  Notice how the river and bay turn almost black — water absorbs near-infrared light
                  — while golf courses, lawns, and other vegetation turn bright.
                </p>
              )}
              {sel === 10 && (
                <p className="mt-3 rounded-xl bg-cream p-3 text-xs leading-relaxed text-ink/70">
                  A few small dark patches (mostly large flat rooftops) show where the
                  surface-temperature algorithm couldn’t confidently retrieve a reading — a real
                  limitation of this data product, not a rendering error.
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
