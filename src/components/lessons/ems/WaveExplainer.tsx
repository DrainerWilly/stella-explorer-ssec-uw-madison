// @ts-nocheck
import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Icon from '../../Icon'
import NasaSourceCredit from './NasaSourceCredit'
import { WAVES, QUOTES } from '../../../data/emsLessonContent'

const W = 480
const H = 180
const MID = 96

function sine(amp, cycles) {
  let d = ''
  for (let i = 0; i <= 240; i++) {
    const x = (i / 240) * (W - 60) + 40
    const y = MID - amp * Math.sin((i / 240) * cycles * 2 * Math.PI)
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)} `
  }
  return d
}

export default function WaveExplainer({ band, onOpenAnimation }) {
  const reduced = useReducedMotion()
  const [view, setView] = useState('wave')
  const period = (W - 60) / 3.5

  return (
    <div>
      <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">How electromagnetic waves carry energy</h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink/80 sm:text-base">{WAVES.mechanicalVsEm[band]}</p>
      <NasaSourceCredit variant="quote" page={QUOTES.fields.page}>{QUOTES.fields.text}</NasaSourceCredit>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="rounded-panel bg-surface p-4 shadow-soft">
          {/* view toggle */}
          <div className="mb-3 inline-flex rounded-full bg-cream p-1 text-xs font-bold">
            <button onClick={() => setView('wave')} aria-pressed={view === 'wave'} className={`rounded-full px-3.5 py-1.5 transition-all ${view === 'wave' ? 'bg-ink text-app shadow-soft' : 'text-muted hover:text-ink'}`}>Show wave view</button>
            <button onClick={() => setView('photon')} aria-pressed={view === 'photon'} className={`rounded-full px-3.5 py-1.5 transition-all ${view === 'photon' ? 'bg-ink text-app shadow-soft' : 'text-muted hover:text-ink'}`}>Show photon view</button>
          </div>

          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={view === 'wave' ? 'Electromagnetic wave with electric and magnetic fields' : 'Photons traveling as packets of energy'}>
            <line x1="20" y1={MID} x2={W - 12} y2={MID} stroke="#000" strokeOpacity="0.12" strokeDasharray="4 4" />
            <line x1="24" y1={MID} x2={W - 16} y2={MID} stroke="#475569" strokeWidth="1.5" markerEnd="url(#emArrow)" />
            <defs>
              <marker id="emArrow" markerWidth="8" markerHeight="8" refX="5" refY="4" orient="auto"><path d="M1 1 L7 4 L1 7 z" fill="#475569" /></marker>
            </defs>
            <text x={W - 60} y={MID + 16} fontSize="10" fontWeight="700" className="fill-slate-500">direction of travel</text>

            {view === 'wave' ? (
              <>
                {/* electric field (red) */}
                <path d={sine(46, 3.5)} fill="none" stroke="#e0533d" strokeWidth="2.6" />
                {/* magnetic field (blue, smaller, offset) */}
                <path d={sine(22, 3.5)} fill="none" stroke="#3b7fd6" strokeWidth="2.2" strokeOpacity="0.85" />
                {/* wavelength bracket */}
                <line x1={40} y1="26" x2={40 + period} y2="26" stroke="#7c3aed" strokeWidth="1.4" markerStart="url(#emArrow)" markerEnd="url(#emArrow)" />
                <text x={40 + period / 2} y="20" textAnchor="middle" fontSize="10" fontWeight="800" className="fill-violet-700">wavelength</text>
                <text x="44" y="58" fontSize="10" fontWeight="800" className="fill-[#e0533d]">electric field</text>
                <text x="44" y={MID + 40} fontSize="10" fontWeight="800" className="fill-[#3b7fd6]">magnetic field</text>
                {!reduced && (
                  <motion.circle r="4" fill="#7c3aed" animate={{ cx: [40, W - 16], cy: [MID, MID] }} transition={{ duration: 2.6, repeat: Infinity, ease: 'linear' }} />
                )}
              </>
            ) : (
              <>
                <path d={sine(30, 3.5)} fill="none" stroke="#000" strokeOpacity="0.08" strokeWidth="2" />
                {[0, 1, 2, 3, 4, 5].map((i) => {
                  const cx = 50 + i * 72
                  return reduced ? (
                    <circle key={i} cx={cx} cy={MID} r="7" fill="#f59e0b" />
                  ) : (
                    <motion.circle key={i} cy={MID} r="7" fill="#f59e0b" animate={{ cx: [cx, cx + 72] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'linear', delay: i * 0.05 }} />
                  )
                })}
                <text x="40" y="40" fontSize="10" fontWeight="800" className="fill-amber-600">photons = packets of energy</text>
              </>
            )}
          </svg>

          <p className="mt-2 text-sm leading-relaxed text-ink/80">{view === 'wave' ? WAVES.fieldsEnergy[band] : WAVES.photonView[band]}</p>
          <p className="mt-2 text-[11px] font-semibold text-faint">{WAVES.note}</p>
        </div>

        {/* side facts */}
        <div className="space-y-3">
          <div className="rounded-panel bg-cream p-4">
            <h3 className="text-sm font-extrabold text-ink">Waves or particles? Both.</h3>
            <NasaSourceCredit variant="quote" page={QUOTES.photons.page}>{QUOTES.photons.text}</NasaSourceCredit>
          </div>
          <div className="rounded-panel bg-cream p-4">
            <h3 className="text-sm font-extrabold text-ink">Polarization</h3>
            <p className="mt-1 text-sm leading-relaxed text-ink/80">{WAVES.polarization[band]}</p>
          </div>
        </div>
      </div>

      <NasaSourceCredit variant="adapted" pages={WAVES.pages} />

      <button onClick={() => onOpenAnimation?.('waveAnatomy')} className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-app transition-all hover:scale-[1.02] hover:opacity-90">
        <Icon name="wave" className="h-4 w-4" />
        Open the full Wave Anatomy animation
      </button>
    </div>
  )
}
