import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from '../../Icon.jsx'
import { SOURCES } from '../../../data/nasaEmsSources.js'

export default function EmsSources() {
  const [open, setOpen] = useState('tour-pdf')

  return (
    <div id="ems-sources" className="rounded-panel bg-surface p-4 shadow-soft sm:p-5">
      <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">NASA sources and credits</h2>
      <p className="mt-2 text-sm text-muted">
        This lesson draws only from NASA. All explanations, examples, and quotations come from NASA’s
        Tour of the Electromagnetic Spectrum (Third Edition); the hero diagram is from NASA Science.
        Links open in a new tab.
      </p>

      <div className="mt-4 space-y-2">
        {SOURCES.map((s) => {
          const isOpen = open === s.id
          return (
            <div key={s.id} className="overflow-hidden rounded-2xl bg-cream">
              <button onClick={() => setOpen(isOpen ? null : s.id)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
                <span className="flex items-center gap-2">
                  <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted">{s.organization}</span>
                  <span className="text-sm font-extrabold text-ink">{s.title}</span>
                </span>
                <Icon name="chevron" className={`h-4 w-4 shrink-0 text-faint transition-transform ${isOpen ? 'rotate-90' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="px-4 pb-4">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-faint">Credits</p>
                      <ul className="mt-1 space-y-0.5 text-sm text-ink/80">
                        {s.credits.map((c) => <li key={c}>{c}</li>)}
                      </ul>
                      <p className="mt-2 text-xs text-muted">{s.pub}</p>
                      <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-faint">Used in</p>
                      <p className="text-sm text-ink/80">{s.usedIn}</p>
                      <a href={s.url} target="_blank" rel="noreferrer noopener" className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-bold text-app transition-all hover:opacity-90">
                        Open source ↗
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
