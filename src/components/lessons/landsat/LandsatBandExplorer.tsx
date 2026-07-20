// @ts-nocheck
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LANDSAT_BANDS, SPECTRUM_REGIONS } from '../../../data/landsatLessonContent'

const REGION_COLOR = Object.fromEntries(SPECTRUM_REGIONS.map((r) => [r.id, r.color]))
const REGION_LABEL = Object.fromEntries(SPECTRUM_REGIONS.map((r) => [r.id, r.label]))

export default function LandsatBandExplorer({ band }) {
  const [sel, setSel] = useState(5)
  const b = LANDSAT_BANDS.find((x) => x.band === sel)

  return (
    <div className="space-y-4">
      {/* spectrum strip (not to scale) */}
      <div className="rounded-panel bg-surface p-4 shadow-soft">
        <div className="flex overflow-hidden rounded-xl">
          {SPECTRUM_REGIONS.map((r) => {
            const activeRegion = b.region === r.id
            return (
              <div
                key={r.id}
                style={{ flexGrow: r.id === 'visible' ? 0.8 : r.id === 'thermal' ? 1.6 : 1.2 }}
                className={`relative grid h-10 place-items-center text-[10px] font-bold text-white transition-all sm:text-xs ${
                  activeRegion ? 'ring-2 ring-ink ring-offset-1' : ''
                }`}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      r.id === 'visible'
                        ? 'linear-gradient(90deg,#7d5bd6,#4a6fe0,#46c25a,#d6c23f,#e0533d)'
                        : r.color,
                    opacity: activeRegion ? 1 : 0.8,
                  }}
                />
                <span className="relative drop-shadow-sm">{r.label}</span>
              </div>
            )
          })}
        </div>
        <p className="mt-1.5 text-[11px] font-semibold text-faint">
          Visible light is only a small slice: Landsat also measures infrared we cannot see. (Not drawn to scale.)
        </p>
      </div>

      {/* band chips + side panel */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-panel bg-surface p-4 shadow-soft">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-faint">Landsat 8/9 bands</p>
          <div className="flex flex-wrap gap-2">
            {LANDSAT_BANDS.map((x) => {
              const active = x.band === sel
              return (
                <button
                  key={x.band}
                  onClick={() => setSel(x.band)}
                  aria-pressed={active}
                  aria-label={`Band ${x.band}, ${x.name}`}
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-bold transition-all ${
                    active ? 'bg-ink text-app shadow-soft' : 'bg-cream text-ink/70 hover:text-ink'
                  }`}
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: REGION_COLOR[x.region] }} />
                  {x.band}
                </button>
              )
            })}
          </div>

          {/* compact table */}
          <div className="mt-4 overflow-x-auto scroll-soft">
            <table className="w-full min-w-[360px] border-collapse text-xs">
              <thead>
                <tr className="text-left text-[10px] font-bold uppercase tracking-wide text-faint">
                  <th className="py-1.5 pr-2">Band</th>
                  <th className="py-1.5 pr-2">Name</th>
                  <th className="py-1.5 pr-2">Wavelength</th>
                  <th className="py-1.5 text-right">Res.</th>
                </tr>
              </thead>
              <tbody>
                {LANDSAT_BANDS.map((x) => (
                  <tr
                    key={x.band}
                    onClick={() => setSel(x.band)}
                    className={`cursor-pointer border-t border-ink/5 ${x.band === sel ? 'bg-cream' : ''}`}
                  >
                    <td className="py-1.5 pr-2 font-bold text-ink">{x.band}</td>
                    <td className="py-1.5 pr-2 text-ink/80">{x.name}</td>
                    <td className="py-1.5 pr-2 tabular-nums text-muted">{x.range}</td>
                    <td className="py-1.5 text-right tabular-nums text-muted">{x.resolution}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* side panel */}
        <div className="rounded-panel bg-surface p-5 shadow-soft">
          <AnimatePresence mode="wait">
            <motion.div
              key={sel}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: REGION_COLOR[b.region] }} />
                <span className="text-xs font-bold uppercase tracking-wide text-faint">{REGION_LABEL[b.region]}</span>
              </div>
              <h3 className="mt-1 text-2xl font-extrabold tracking-tight text-ink">
                Band {b.band}: {b.name}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <Chip>{b.range}</Chip>
                <Chip>{b.resolution} resolution</Chip>
              </div>
              <p className="mt-3 text-sm font-semibold text-ink/80">Helps scientists observe:</p>
              <p className="text-sm text-muted">{b.observes}</p>
              <p className="mt-3 rounded-xl bg-cream p-3 text-sm leading-relaxed text-ink/80">{b[band]}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function Chip({ children }) {
  return <span className="rounded-full bg-cream px-3 py-1 text-xs font-bold text-muted">{children}</span>
}
