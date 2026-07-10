import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from '../../Icon.jsx'
import ImageWithAttribution from './ImageWithAttribution.jsx'
import { RGB_PRESETS, BAND_PREVIEW_COLOR } from '../../../data/landsatLessonContent.js'

const ASSIGNABLE = [2, 3, 4, 5, 6, 7]
const CHANNELS = [
  { key: 'r', label: 'Red', color: '#e0533d' },
  { key: 'g', label: 'Green', color: '#3fae5e' },
  { key: 'b', label: 'Blue', color: '#3b6fd6' },
]

// Illustrative composite palettes per preset (clearly not recomputed pixels).
const PALETTES = {
  natural: { veg: '#3f9e5b', water: '#3b7fd6', soil: '#bd9a5e', urban: '#9aa0a6' },
  colorIr: { veg: '#ff4d6d', water: '#0f2440', soil: '#e7b58a', urban: '#8fb6bf' },
  swir: { veg: '#6f8f3a', water: '#10243f', soil: '#e0a23f', urban: '#7c6f9e' },
  custom: { veg: '#3f9e5b', water: '#3b7fd6', soil: '#bd9a5e', urban: '#9aa0a6' },
}

export default function RgbCompositeMixer() {
  const [ch, setCh] = useState({ r: 4, g: 3, b: 2 })
  const [active, setActive] = useState('r')

  const presetId = useMemo(() => {
    const m = RGB_PRESETS.find((p) => p.r === ch.r && p.g === ch.g && p.b === ch.b)
    return m?.id ?? 'custom'
  }, [ch])
  const preset = RGB_PRESETS.find((p) => p.id === presetId)
  const pal = PALETTES[presetId] ?? PALETTES.custom

  const applyPreset = (p) => setCh({ r: p.r, g: p.g, b: p.b })
  const assign = (bandNum) => {
    setCh((c) => ({ ...c, [active]: bandNum }))
    setActive((a) => (a === 'r' ? 'g' : a === 'g' ? 'b' : 'r'))
  }
  const reset = () => { setCh({ r: 4, g: 3, b: 2 }); setActive('r') }

  return (
    <div className="space-y-4">
      {/* presets */}
      <div className="flex flex-wrap gap-2">
        {RGB_PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => applyPreset(p)}
            aria-pressed={presetId === p.id}
            className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
              presetId === p.id ? 'bg-ink text-app shadow-soft' : 'bg-cream text-ink/70 hover:text-ink'
            }`}
          >
            {p.label}
          </button>
        ))}
        <button onClick={reset} className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-cream px-4 py-2 text-xs font-bold text-ink/70 transition-all hover:text-ink">
          <Icon name="reset" className="h-3.5 w-3.5" /> Reset
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* channel assignment: band (left) → color channel (right) */}
        <div className="rounded-panel bg-surface p-5 shadow-soft">
          <div className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-faint">
            <span>Band</span>
            <span>Display channel</span>
          </div>
          <div className="space-y-2.5">
            {CHANNELS.map((c) => (
              <button
                key={c.key}
                onClick={() => setActive(c.key)}
                aria-pressed={active === c.key}
                className={`grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-2xl border-2 p-3 transition-all ${
                  active === c.key ? 'border-ink bg-cream' : 'border-transparent bg-cream/60 hover:bg-cream'
                }`}
              >
                {/* band (left) */}
                <motion.span
                  key={ch[c.key]}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                  className="inline-flex items-center gap-1.5 justify-self-start rounded-full bg-surface px-3 py-1.5 text-xs font-bold text-ink shadow-soft"
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: BAND_PREVIEW_COLOR[ch[c.key]] ?? '#94a3b8' }} />
                  Band {ch[c.key]}
                </motion.span>

                {/* arrow: band maps to channel */}
                <Icon
                  name="arrowRight"
                  className={`h-5 w-5 transition-colors ${active === c.key ? 'text-ink' : 'text-faint'}`}
                  strokeWidth={2.2}
                />

                {/* display channel (right) */}
                <span className="inline-flex items-center gap-2 justify-self-end">
                  <span className="text-sm font-extrabold text-ink">{c.label}</span>
                  <span className="h-4 w-4 rounded-full ring-2 ring-white" style={{ backgroundColor: c.color }} />
                </span>
              </button>
            ))}
          </div>

          <p className="mt-4 mb-1.5 text-xs font-bold uppercase tracking-wide text-faint">
            Assign a band to the <span className="text-ink">{CHANNELS.find((c) => c.key === active).label}</span> channel
          </p>
          <div className="flex flex-wrap gap-2">
            {ASSIGNABLE.map((n) => (
              <button
                key={n}
                onClick={() => assign(n)}
                className="flex items-center gap-1.5 rounded-full bg-cream px-3 py-1.5 text-xs font-bold text-ink/70 transition-all hover:text-ink"
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: BAND_PREVIEW_COLOR[n] }} />
                Band {n}
              </button>
            ))}
          </div>
        </div>

        {/* illustrative preview */}
        <div className="rounded-panel bg-surface p-5 shadow-soft">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-faint">Illustrative composite</p>
          <div className="overflow-hidden rounded-xl">
            <svg viewBox="0 0 200 130" className="h-auto w-full" role="img" aria-label="Illustrative composite preview">
              <rect x="0" y="0" width="200" height="86" fill={presetId === 'natural' ? '#cfe6ff' : '#0c1422'} style={{ transition: 'fill .4s' }} />
              <rect x="0" y="86" width="200" height="44" fill={pal.soil} style={{ transition: 'fill .4s' }} />
              <ellipse cx="44" cy="104" rx="40" ry="16" fill={pal.water} style={{ transition: 'fill .4s' }} />
              <circle cx="120" cy="70" r="20" fill={pal.veg} style={{ transition: 'fill .4s' }} />
              <rect x="118" y="86" width="6" height="14" fill="#6b4a2a" />
              <rect x="150" y="64" width="34" height="36" fill={pal.urban} style={{ transition: 'fill .4s' }} />
            </svg>
          </div>
          <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-faint">
            Illustrative only: shows how the combination looks, not recomputed pixels
          </p>
          <div className="mt-2 flex items-center justify-center gap-2 text-xs font-bold text-muted">
            <span>R {ch.r}</span><span>·</span><span>G {ch.g}</span><span>·</span><span>B {ch.b}</span>
          </div>
        </div>
      </div>

      {/* explanation */}
      <AnimatePresence mode="wait">
        <motion.p
          key={presetId}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="rounded-panel bg-cream p-4 text-sm leading-relaxed text-ink/80"
        >
          {preset ? preset.explain : 'A custom band combination assigns any band to each display channel. Try a preset to see a named example.'}
        </motion.p>
      </AnimatePresence>

      {/* official reference */}
      <div className="rounded-panel bg-surface p-4 shadow-soft">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-faint">Official example composite</p>
        <ImageWithAttribution imageId="bandCombinations" aspect="aspect-[16/9]" />
      </div>
    </div>
  )
}
