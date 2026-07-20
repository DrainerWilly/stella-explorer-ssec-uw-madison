// @ts-nocheck
import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import NasaSourceCredit from './NasaSourceCredit'
import { RADIATION_BUDGET } from '../../../data/emsLessonContent'

const W = 400
const H = 220
const GROUND = 168
const C = { incoming: '#ffd76a', reflected: '#3b7fd6', absorbed: '#e08a3f', emitted: '#e0533d' }

export default function RadiationBudget({ band }) {
  const reduced = useReducedMotion()
  const [sel, setSel] = useState('incoming')

  return (
    <div>
      <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Earth absorbs, reflects, and emits energy</h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink/80 sm:text-base">{RADIATION_BUDGET.intro[band]}</p>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="overflow-hidden rounded-panel shadow-soft">
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Earth's radiation budget">
            <rect x="0" y="0" width={W} height={GROUND} fill="#0c1422" />
            <rect x="0" y={GROUND} width={W} height={H - GROUND} fill="#2f6d3f" />
            <ellipse cx="300" cy={GROUND} rx="70" ry="18" fill="#1d3a6b" />
            <circle cx="44" cy="36" r="16" fill="#ffd76a" />
            {/* incoming */}
            <g opacity={sel === 'incoming' ? 1 : 0.3}>
              <line x1="56" y1="48" x2="180" y2={GROUND - 6} stroke={C.incoming} strokeWidth={sel === 'incoming' ? 3.2 : 2} markerEnd="url(#rbA)" />
              {!reduced && sel === 'incoming' && <motion.circle r="3.4" fill={C.incoming} animate={{ cx: [56, 180], cy: [48, GROUND - 6] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }} />}
            </g>
            {/* reflected */}
            <g opacity={sel === 'reflected' ? 1 : 0.3}><line x1="180" y1={GROUND - 6} x2="250" y2="20" stroke={C.reflected} strokeWidth={sel === 'reflected' ? 3.2 : 2} markerEnd="url(#rbA)" /></g>
            {/* absorbed */}
            <g opacity={sel === 'absorbed' ? 1 : 0.3}><circle cx="120" cy={GROUND + 18} r={sel === 'absorbed' ? 12 : 8} fill={C.absorbed} fillOpacity="0.5" /><text x="120" y={GROUND + 22} textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff">warm</text></g>
            {/* emitted */}
            <g opacity={sel === 'emitted' ? 1 : 0.3}>
              <line x1="150" y1={GROUND - 4} x2="120" y2="24" stroke={C.emitted} strokeWidth={sel === 'emitted' ? 3.2 : 2} strokeDasharray="4 4" markerEnd="url(#rbA)" />
              {!reduced && sel === 'emitted' && <motion.circle r="3.4" fill={C.emitted} animate={{ cx: [150, 120], cy: [GROUND - 4, 24] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }} />}
            </g>
            <defs><marker id="rbA" markerWidth="8" markerHeight="8" refX="5" refY="4" orient="auto"><path d="M1 1 L7 4 L1 7 z" fill="#cbd5e1" /></marker></defs>
            <text x="8" y="14" fontSize="9" fontWeight="700" fill="#fff" opacity="0.6">SPACE</text>
          </svg>
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {RADIATION_BUDGET.parts.map((p) => (
              <button key={p.id} onClick={() => setSel(p.id)} aria-pressed={p.id === sel}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${p.id === sel ? 'bg-ink text-app shadow-soft' : 'bg-cream text-ink/70 hover:text-ink'}`}>
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: C[p.id] }} />{p.label}
              </button>
            ))}
          </div>
          <p className="rounded-xl bg-cream p-3 text-sm leading-relaxed text-ink/80">{RADIATION_BUDGET.parts.find((p) => p.id === sel).text}</p>
        </div>
      </div>

      <div className="mt-4 rounded-panel bg-blue/40 p-5">
        <h3 className="text-sm font-extrabold uppercase tracking-wide text-cink">Connect this to the city</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-cink/80">{RADIATION_BUDGET.cityCallout[band]}</p>
      </div>

      <NasaSourceCredit variant="adapted" pages={RADIATION_BUDGET.pages} />
    </div>
  )
}
