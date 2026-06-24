import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from '../../Icon.jsx'
import { DIAGRAM } from '../../../data/nasaEmsSources.js'
import { HOTSPOTS } from '../../../data/emsLessonContent.js'

const WL_LABEL = { longest: 'Longest λ', long: 'Long λ', medium: 'Medium λ', short: 'Short λ', shorter: 'Shorter λ', shortest: 'Shortest λ' }
const EN_LABEL = { lowest: 'Lowest energy', low: 'Low energy', medium: 'Medium energy', high: 'High energy', higher: 'Higher energy', highest: 'Highest energy' }

export default function EmsHeroDiagram({ band, onJumpToRegion }) {
  const [sel, setSel] = useState('visible')
  const [imgOk, setImgOk] = useState(true)
  const hot = HOTSPOTS.find((h) => h.id === sel)
  const src = `${import.meta.env.BASE_URL}${DIAGRAM.file}`

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="relative overflow-hidden rounded-panel shadow-soft ring-1 ring-ink/5">
          {imgOk ? (
            <img src={src} alt={DIAGRAM.alt} className="block w-full" onError={() => setImgOk(false)} />
          ) : (
            <div className="grid aspect-[2500/1404] w-full place-items-center bg-cream p-6 text-center">
              <span className="max-w-md text-sm font-semibold text-muted">{DIAGRAM.alt}</span>
            </div>
          )}

          {/* hotspot buttons over the spectrum bands */}
          {HOTSPOTS.map((h) => {
            const active = h.id === sel
            return (
              <button
                key={h.id}
                onClick={() => setSel(h.id)}
                aria-pressed={active}
                aria-label={`${h.name}: ${WL_LABEL[h.wavelength]}, ${EN_LABEL[h.energy]}`}
                title={h.name}
                className="absolute rounded-md transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                style={{
                  left: `${h.left}%`,
                  width: `${h.width}%`,
                  top: '6%',
                  height: '62%',
                  background: active ? 'rgba(255,255,255,0.18)' : 'transparent',
                  boxShadow: active ? 'inset 0 0 0 2px rgba(255,255,255,0.95), 0 0 0 1px rgba(0,0,0,0.25)' : 'inset 0 0 0 1px rgba(255,255,255,0.25)',
                }}
              />
            )
          })}
        </div>

        {/* required visible credit, linked to the NASA source */}
        <p className="mt-2 text-[11px] font-semibold text-faint">
          {DIAGRAM.credit}{' '}
          <a href={DIAGRAM.creditUrl} target="_blank" rel="noreferrer noopener" className="font-bold text-muted underline decoration-dotted underline-offset-2 hover:text-ink">
            View source ↗
          </a>
        </p>
        <p className="mt-1 text-xs text-muted">Select a region on the diagram to learn what it is and how NASA uses it.</p>
      </div>

      {/* side panel */}
      <div className="rounded-panel bg-surface p-5 shadow-soft">
        <div className="flex flex-wrap gap-1.5">
          {HOTSPOTS.map((h) => (
            <button
              key={h.id}
              onClick={() => setSel(h.id)}
              aria-pressed={h.id === sel}
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-all ${
                h.id === sel ? 'bg-ink text-app shadow-soft' : 'bg-cream text-ink/70 hover:text-ink'
              }`}
            >
              {h.name}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={sel} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="mt-3">
            <h3 className="text-lg font-extrabold tracking-tight text-ink">{hot.name}</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-cream px-2.5 py-1 text-[11px] font-bold text-muted">{WL_LABEL[hot.wavelength]}</span>
              <span className="rounded-full bg-cream px-2.5 py-1 text-[11px] font-bold text-muted">{EN_LABEL[hot.energy]}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink/80">{hot.blurb[band]}</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wide text-faint">Everyday example</dt>
                <dd className="text-ink/80">{hot.everyday}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wide text-faint">NASA science</dt>
                <dd className="text-ink/80">{hot.nasaExample}</dd>
              </div>
            </dl>
            <button
              onClick={() => onJumpToRegion?.(hot.region)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-cream px-3.5 py-2 text-xs font-bold text-ink/80 transition-all hover:text-ink"
            >
              Explore this region below
              <Icon name="chevron" className="h-3.5 w-3.5 rotate-90" />
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
