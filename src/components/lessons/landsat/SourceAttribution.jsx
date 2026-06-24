import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from '../../Icon.jsx'
import { SOURCES, SOURCE_GROUPS, IMAGES } from '../../../data/landsatLessonSources.js'

export default function SourceAttribution() {
  const [open, setOpen] = useState(SOURCE_GROUPS[0])

  // group sources; the image-credits group is built from IMAGES
  const groupItems = (group) => {
    if (group === 'Image credits & licenses') {
      const seen = new Set()
      return Object.values(IMAGES)
        .filter((m) => !seen.has(m.sourceUrl) && seen.add(m.sourceUrl))
        .map((m) => ({ title: m.alt, organization: m.org, url: m.sourceUrl, credit: m.credit, note: 'Public domain with credit.' }))
    }
    return SOURCES.filter((s) => s.group === group)
  }

  return (
    <div id="landsat-sources" className="rounded-panel bg-surface p-4 shadow-soft sm:p-5">
      <h2 className="text-lg font-extrabold tracking-tight text-ink">Image and data sources</h2>
      <p className="mt-1 text-sm text-muted">
        All imagery and facts come from official NASA and USGS sources. Links open in a new tab.
      </p>

      <div className="mt-4 space-y-2">
        {SOURCE_GROUPS.map((group) => {
          const items = groupItems(group)
          if (items.length === 0) return null
          const isOpen = open === group
          return (
            <div key={group} className="overflow-hidden rounded-2xl bg-cream">
              <button
                onClick={() => setOpen(isOpen ? null : group)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-extrabold text-ink"
              >
                {group}
                <Icon name="chevron" className={`h-4 w-4 shrink-0 text-faint transition-transform ${isOpen ? 'rotate-90' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <ul className="space-y-2 px-4 pb-4">
                      {items.map((s) => (
                        <li key={s.url + s.title} className="rounded-xl bg-surface p-3 shadow-soft">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-cream px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted">
                              {s.organization}
                            </span>
                            <a
                              href={s.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-bold text-ink underline decoration-dotted underline-offset-2 hover:text-muted"
                            >
                              {s.title} ↗
                            </a>
                          </div>
                          {s.note && <p className="mt-1 text-xs text-faint">{s.note}</p>}
                        </li>
                      ))}
                    </ul>
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
