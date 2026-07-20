// @ts-nocheck
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IMAGES } from '../../../data/landsatLessonSources'
import { COMPARISON } from '../../../data/landsatLessonContent'

const POS = {
  vegetation: { x: 60, y: 52 },
  water: { x: 22, y: 78 },
  urban: { x: 80, y: 60 },
  soil: { x: 42, y: 86 },
}

// One image layer that falls back to a clearly-labeled placeholder block.
function Layer({ meta, kind, style }) {
  const [ok, setOk] = useState(true)
  const src = `${import.meta.env.BASE_URL}${meta.file}`
  if (ok)
    return (
      <img
        src={src}
        alt={meta.alt}
        onError={() => setOk(false)}
        className="absolute inset-0 h-full w-full object-cover"
        style={style}
        draggable={false}
      />
    )
  return (
    <div
      className="absolute inset-0 grid place-items-center text-center"
      style={{ ...style, background: kind === 'false' ? 'linear-gradient(135deg,#7a1f33,#b3324f)' : 'linear-gradient(135deg,#2f6d3f,#3f8f57)' }}
    >
      <span className="px-3 text-[11px] font-bold text-white/90">
        {kind === 'false' ? 'Color-infrared example' : 'Natural-color example'}
        <br />
        (add official image)
      </span>
    </div>
  )
}

export default function RealImageComparison() {
  const [pos, setPos] = useState(50)
  const [sel, setSel] = useState(null)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        {/* comparison */}
        <div className="lg:col-span-2">
          <div className="relative aspect-video w-full overflow-hidden rounded-panel shadow-soft">
            <Layer meta={IMAGES.falseColor} kind="false" />
            <Layer meta={IMAGES.naturalColor} kind="natural" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }} />

            {/* labels */}
            <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-bold text-white">
              {COMPARISON.natural.label}
            </span>
            <span className="absolute right-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-bold text-white">
              {COMPARISON.false.label}
            </span>

            {/* divider */}
            <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pos}%` }}>
              <div className="h-full w-0.5 -translate-x-1/2 bg-white shadow" />
              <span className="absolute top-1/2 left-0 grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-ink shadow">⇄</span>
            </div>

            {/* feature markers */}
            {COMPARISON.callouts.map((c) => {
              const p = POS[c.id]
              const on = sel === c.id
              return (
                <motion.button
                  key={c.id}
                  onClick={() => setSel(c.id)}
                  aria-label={`Highlight ${c.label}`}
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  animate={on ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                  transition={{ duration: 1, repeat: on ? Infinity : 0 }}
                >
                  <span className={`grid h-5 w-5 place-items-center rounded-full border-2 ${on ? 'border-white bg-ink' : 'border-white/80 bg-black/40'}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  </span>
                </motion.button>
              )
            })}
          </div>

          {/* accessible slider */}
          <input
            type="range" min={0} max={100} value={pos}
            onChange={(e) => setPos(Number(e.target.value))}
            aria-label="Reveal natural-color vs color-infrared"
            className="mt-2 w-full accent-ink"
          />
          {/* credits */}
          <div className="mt-1 flex flex-wrap justify-between gap-2 text-[11px] text-faint">
            <span>{IMAGES.naturalColor.credit} <a href={IMAGES.naturalColor.sourceUrl} target="_blank" rel="noreferrer" className="font-bold underline decoration-dotted hover:text-ink">source ↗</a></span>
            <span>{IMAGES.falseColor.credit} <a href={IMAGES.falseColor.sourceUrl} target="_blank" rel="noreferrer" className="font-bold underline decoration-dotted hover:text-ink">source ↗</a></span>
          </div>
        </div>

        {/* explore the image */}
        <div className="rounded-panel bg-surface p-5 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wide text-faint">Explore the image</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {COMPARISON.callouts.map((c) => (
              <button
                key={c.id}
                onClick={() => setSel(c.id)}
                aria-pressed={sel === c.id}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                  sel === c.id ? 'bg-ink text-app shadow-soft' : 'bg-cream text-ink/70 hover:text-ink'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            {sel ? (
              <motion.div key={sel} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="mt-3">
                <h4 className="text-base font-extrabold tracking-tight text-ink">{COMPARISON.callouts.find((c) => c.id === sel).label}</h4>
                <dl className="mt-2 space-y-1 text-sm">
                  <div className="flex gap-2"><dt className="w-24 shrink-0 font-semibold text-faint">Natural</dt><dd className="font-semibold text-ink/80">{COMPARISON.callouts.find((c) => c.id === sel).natural}</dd></div>
                  <div className="flex gap-2"><dt className="w-24 shrink-0 font-semibold text-faint">Color IR</dt><dd className="font-semibold text-ink/80">{COMPARISON.callouts.find((c) => c.id === sel).false}</dd></div>
                </dl>
                <p className="mt-2 rounded-xl bg-cream p-3 text-sm leading-relaxed text-ink/80">{COMPARISON.callouts.find((c) => c.id === sel).text}</p>
              </motion.div>
            ) : (
              <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-3 text-sm text-muted">
                Drag the slider to compare the two views, then tap a feature to see how it changes between natural color and color infrared.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
