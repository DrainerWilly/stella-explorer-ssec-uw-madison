import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { SURFACES, SURFACE_NOTE } from '../../../data/landsatLessonContent.js'

const W = 400
const H = 250
const GROUND = 196
const SAT = { x: 348, y: 30 }
const SUN = { x: 46, y: 36 }
const SLOTS = [78, 158, 238, 318] // surface x-centers

export default function SurfaceInteractionScene({ band }) {
  const reduced = useReducedMotion()
  const [sel, setSel] = useState('vegetation')
  const s = SURFACES.find((x) => x.id === sel)
  const idx = SURFACES.findIndex((x) => x.id === sel)
  const sx = SLOTS[idx]
  const sy = GROUND - 6

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        {/* scene */}
        <div className="overflow-hidden rounded-panel shadow-soft">
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Sunlight interacting with Earth surfaces">
            <defs>
              <linearGradient id="siSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#cfe6ff" />
                <stop offset="100%" stopColor="#eaf4ff" />
              </linearGradient>
              <marker id="siSun" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 z" fill="#f4b740" /></marker>
              <marker id="siRefl" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 z" fill="#e08a3f" /></marker>
              <marker id="siHeat" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 z" fill="#e0533d" /></marker>
            </defs>

            <rect x="0" y="0" width={W} height={GROUND} fill="url(#siSky)" />
            <rect x="0" y="64" width={W} height="16" fill="#ffffff" opacity="0.35" />
            <rect x="0" y={GROUND} width={W} height={H - GROUND} fill="#cdb38a" />

            {/* sun */}
            <circle cx={SUN.x} cy={SUN.y} r="16" fill="#ffd76a" />
            {!reduced &&
              [0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
                <motion.line
                  key={a}
                  x1={SUN.x + 18 * Math.cos((a * Math.PI) / 180)}
                  y1={SUN.y + 18 * Math.sin((a * Math.PI) / 180)}
                  x2={SUN.x + 24 * Math.cos((a * Math.PI) / 180)}
                  y2={SUN.y + 24 * Math.sin((a * Math.PI) / 180)}
                  stroke="#ffd76a"
                  strokeWidth="2"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, delay: a / 360 }}
                />
              ))}

            {/* satellite */}
            <g transform={`translate(${SAT.x - 12},${SAT.y - 8})`}>
              <rect x="7" y="3" width="10" height="9" rx="1.5" fill="#475569" />
              <rect x="0" y="4" width="6" height="7" rx="1" fill="#93b4d6" />
              <rect x="18" y="4" width="6" height="7" rx="1" fill="#93b4d6" />
            </g>
            <text x={SAT.x} y={SAT.y + 22} textAnchor="middle" fontSize="9" fontWeight="700" className="fill-slate-600">Landsat</text>

            {/* surfaces */}
            {SURFACES.map((su, i) => {
              const active = su.id === sel
              return (
                <g key={su.id} onClick={() => setSel(su.id)} style={{ cursor: 'pointer' }}>
                  <rect
                    x={SLOTS[i] - 32}
                    y={GROUND - 12}
                    width="64"
                    height="22"
                    rx="6"
                    fill={su.color}
                    stroke={active ? '#0f172a' : 'transparent'}
                    strokeWidth="2.5"
                  />
                  <text x={SLOTS[i]} y={GROUND + 26} textAnchor="middle" fontSize="8.5" fontWeight="700" className="fill-slate-600">
                    {su.name.replace('Healthy ', '')}
                  </text>
                </g>
              )
            })}

            {/* incoming sunlight to selected */}
            <motion.line
              x1={SUN.x + 10} y1={SUN.y + 10} x2={sx - 8} y2={sy - 12}
              stroke="#f4b740" strokeWidth="2.4" markerEnd="url(#siSun)"
              strokeDasharray="6 5"
              animate={reduced ? {} : { strokeDashoffset: [22, 0] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
            />
            {/* reflected sunlight to satellite (width ~ reflected) */}
            <motion.line
              x1={sx + 6} y1={sy - 12} x2={SAT.x - 6} y2={SAT.y + 8}
              stroke="#e08a3f" strokeWidth={1 + s.reflected / 3} markerEnd="url(#siRefl)"
              strokeDasharray="6 5"
              animate={reduced ? {} : { strokeDashoffset: [0, -22] }}
              transition={{ duration: 1.3, repeat: Infinity, ease: 'linear' }}
            />
            {/* emitted thermal upward (if warm) */}
            {s.emitted >= 5 && (
              <motion.line
                x1={sx + 18} y1={sy - 12} x2={sx + 30} y2={sy - 64}
                stroke="#e0533d" strokeWidth={1 + s.emitted / 4} markerEnd="url(#siHeat)"
                strokeDasharray="3 4"
                animate={reduced ? {} : { strokeDashoffset: [0, -14] }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            )}

            {/* legend */}
            <g transform="translate(10,224)" fontSize="8" fontWeight="700">
              <line x1="0" y1="-3" x2="14" y2="-3" stroke="#f4b740" strokeWidth="2.4" />
              <text x="18" y="0" className="fill-slate-600">Sunlight in</text>
              <line x1="86" y1="-3" x2="100" y2="-3" stroke="#e08a3f" strokeWidth="2.4" />
              <text x="104" y="0" className="fill-slate-600">Reflected</text>
              <line x1="166" y1="-3" x2="180" y2="-3" stroke="#e0533d" strokeWidth="2.4" strokeDasharray="3 3" />
              <text x="184" y="0" className="fill-slate-600">Emitted heat</text>
            </g>
          </svg>
        </div>

        {/* inspector */}
        <div className="rounded-panel bg-surface p-5 shadow-soft">
          <div className="flex flex-wrap gap-1.5">
            {SURFACES.map((su) => (
              <button
                key={su.id}
                onClick={() => setSel(su.id)}
                aria-pressed={su.id === sel}
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-all ${
                  su.id === sel ? 'bg-ink text-app shadow-soft' : 'bg-cream text-ink/70 hover:text-ink'
                }`}
              >
                {su.name}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={sel} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="mt-3">
              <h3 className="text-lg font-extrabold tracking-tight text-ink">{s.name}</h3>
              <p className="text-sm font-semibold text-muted">{s.key}</p>
              <div className="mt-3 space-y-2">
                <EnergyBar label="Reflected sunlight" value={s.reflected} color="#e08a3f" />
                <EnergyBar label="Absorbed" value={s.absorbed} color="#475569" />
                <EnergyBar label="Emitted heat (thermal)" value={s.emitted} color="#e0533d" />
              </div>
              <p className="mt-3 rounded-xl bg-cream p-3 text-sm leading-relaxed text-ink/80">{s[band]}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <p className="rounded-panel bg-blue/40 px-4 py-3 text-sm font-semibold text-cink">{SURFACE_NOTE}</p>
    </div>
  )
}

function EnergyBar({ label, value, color }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] font-bold">
        <span className="text-muted">{label}</span>
        <span className="text-ink">{value}/10</span>
      </div>
      <div className="mt-0.5 h-2.5 w-full overflow-hidden rounded-full bg-ink/[0.06]">
        <motion.div className="h-full rounded-full" style={{ backgroundColor: color }} initial={false} animate={{ width: `${(value / 10) * 100}%` }} transition={{ type: 'spring', stiffness: 260, damping: 28 }} />
      </div>
    </div>
  )
}
