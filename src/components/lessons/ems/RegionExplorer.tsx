// @ts-nocheck
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from '../../Icon'
import NasaSourceCredit from './NasaSourceCredit'
import { REGIONS } from '../../../data/emsLessonContent'

export default function RegionExplorer({ band, focusId }) {
  const [open, setOpen] = useState('radio')

  // open + scroll to a region when the hero "Explore this region below" is used
  useEffect(() => {
    if (!focusId) return
    setOpen(focusId)
    const el = document.getElementById(`region-${focusId}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [focusId])

  return (
    <div>
      <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Explore the electromagnetic spectrum in detail</h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink/80 sm:text-base">
        Eight regions, ordered from the longest wavelengths to the shortest. Open each to see what makes it distinct, how NASA uses it, and how it relates to Earth observation.
      </p>

      <div className="mt-4 space-y-2">
        {REGIONS.map((r) => {
          const isOpen = open === r.id
          return (
            <div key={r.id} id={`region-${r.id}`} className="scroll-mt-6 overflow-hidden rounded-2xl bg-surface shadow-soft">
              <button
                onClick={() => setOpen(isOpen ? null : r.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <span className="text-sm font-extrabold text-ink">{r.name}</span>
                <span className="flex items-center gap-2">
                  <span className="rounded-full bg-cream px-2 py-0.5 text-[10px] font-bold text-muted">p. {r.page}</span>
                  <Icon name="chevron" className={`h-4 w-4 text-faint transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                    <div className="px-4 pb-4">
                      <p className="text-sm leading-relaxed text-ink/85">{r.distinct[band]}</p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <Fact label="Everyday uses">{r.uses}</Fact>
                        <Fact label="NASA example">{r.nasaExample}</Fact>
                        <Fact label="In the atmosphere">{r.atmosphere}</Fact>
                        <Fact label="Remote sensing">{r.remoteSensing}</Fact>
                      </div>
                      <details className="mt-3 rounded-xl bg-cream p-3">
                        <summary className="cursor-pointer text-xs font-bold text-ink/80">Learn more</summary>
                        <p className="mt-2 text-sm leading-relaxed text-ink/80">{r.learnMore}</p>
                      </details>
                      <NasaSourceCredit variant="adapted" pages={`${r.page}`} />
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

function Fact({ label, children }) {
  return (
    <div className="rounded-xl bg-cream p-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-faint">{label}</p>
      <p className="mt-0.5 text-sm leading-relaxed text-ink/80">{children}</p>
    </div>
  )
}
