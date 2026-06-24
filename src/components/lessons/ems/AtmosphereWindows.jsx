import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import NasaSourceCredit from './NasaSourceCredit.jsx'
import { ATMOSPHERE, QUOTES } from '../../../data/emsLessonContent.js'

const W = 400
const H = 230
const ATM_TOP = 78
const GROUND = 150
const COLORS = { transmitted: '#46c25a', absorbed: '#e08a3f', reflected: '#3b7fd6', blocked: '#e0533d' }
const X = { transmitted: 110, absorbed: 200, reflected: 150, blocked: 300 }

export default function AtmosphereWindows({ band }) {
  const reduced = useReducedMotion()
  const [sel, setSel] = useState('transmitted')

  return (
    <div>
      <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Earth’s atmosphere is both a shield and a filter</h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink/80 sm:text-base">{ATMOSPHERE.intro[band]}</p>
      <NasaSourceCredit variant="quote" page={QUOTES.windows.page}>{QUOTES.windows.text}</NasaSourceCredit>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="overflow-hidden rounded-panel shadow-soft">
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Energy paths through Earth's atmosphere">
            <rect x="0" y="0" width={W} height={ATM_TOP} fill="#0c0f16" />
            <rect x="0" y={ATM_TOP} width={W} height={GROUND - ATM_TOP} fill="#7fb2e6" fillOpacity="0.5" />
            <rect x="0" y={GROUND} width={W} height={H - GROUND} fill="#4caf6b" />
            <circle cx="40" cy="34" r="15" fill="#ffd76a" />
            <text x="8" y="16" fontSize="9" fontWeight="700" fill="#fff" opacity="0.7">SPACE</text>
            <text x="8" y={ATM_TOP + 15} fontSize="9" fontWeight="700" fill="#17171c" opacity="0.55">ATMOSPHERE</text>
            {ATMOSPHERE.paths.map((p) => {
              const on = p.id === sel
              const x = X[p.id]
              const stopY = p.kind === 'blocked' ? ATM_TOP : p.kind === 'partial' ? GROUND : GROUND
              const c = COLORS[p.id]
              return (
                <g key={p.id} opacity={on ? 1 : 0.28}>
                  <line x1="48" y1="44" x2={x} y2="16" stroke="#f4b740" strokeWidth="1.4" opacity="0.5" />
                  <line x1={x} y1="16" x2={x} y2={stopY} stroke={c} strokeWidth={on ? 3.4 : 2} strokeDasharray={p.kind === 'partial' ? '6 4' : undefined} />
                  {p.id === 'reflected' && <line x1={x} y1={ATM_TOP} x2={x + 40} y2="20" stroke={c} strokeWidth={on ? 3 : 2} />}
                  {p.kind === 'blocked' && <text x={x} y={ATM_TOP + 4} textAnchor="middle" fontSize="13" fill={c}>✸</text>}
                  {!reduced && on && p.kind !== 'blocked' && (
                    <motion.circle cx={x} r="3.6" fill={c} animate={{ cy: [16, stopY] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }} />
                  )}
                </g>
              )
            })}
            {/* satellite above atmosphere */}
            <g transform="translate(330,18)"><rect x="6" y="2" width="10" height="8" rx="1.5" fill="#cbd5e1" /><rect x="0" y="3" width="5" height="6" rx="1" fill="#93b4d6" /><rect x="17" y="3" width="5" height="6" rx="1" fill="#93b4d6" /></g>
          </svg>
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {ATMOSPHERE.paths.map((p) => (
              <button key={p.id} onClick={() => setSel(p.id)} aria-pressed={p.id === sel}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${p.id === sel ? 'bg-ink text-app shadow-soft' : 'bg-cream text-ink/70 hover:text-ink'}`}>
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[p.id] }} />{p.label}
              </button>
            ))}
          </div>
          <p className="rounded-xl bg-cream p-3 text-sm leading-relaxed text-ink/80">{ATMOSPHERE.paths.find((p) => p.id === sel).text}</p>
          <p className="text-sm leading-relaxed text-muted">{ATMOSPHERE.spaceNote[band]}</p>
        </div>
      </div>

      {/* ionizing callout */}
      <div className="mt-4 rounded-panel bg-coral/30 p-5">
        <h3 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-cink">⚠ Ionizing radiation</h3>
        <NasaSourceCredit variant="quote" page={QUOTES.ionizing.page}>{QUOTES.ionizing.text}</NasaSourceCredit>
      </div>

      <NasaSourceCredit variant="adapted" pages={ATMOSPHERE.pages} />
    </div>
  )
}
