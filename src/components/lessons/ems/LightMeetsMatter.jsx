import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from '../../Icon.jsx'
import NasaSourceCredit from './NasaSourceCredit.jsx'
import { BEHAVIORS, QUOTES } from '../../../data/emsLessonContent.js'

const BEAM = '#f59e0b'

// small static diagram per behavior
function Diagram({ id }) {
  const common = { fill: 'none', stroke: BEAM, strokeWidth: 3, strokeLinecap: 'round' }
  return (
    <svg viewBox="0 0 200 110" className="h-auto w-full" role="img" aria-label={`${id} diagram`}>
      <defs>
        <marker id="lmArrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 z" fill={BEAM} /></marker>
      </defs>
      {id === 'reflection' && (<>
        <line x1="100" y1="92" x2="100" y2="24" stroke="#9aa0a6" strokeWidth="6" strokeLinecap="round" />
        <line x1="24" y1="34" x2="100" y2="62" {...common} markerEnd="url(#lmArrow)" />
        <line x1="100" y1="62" x2="176" y2="34" {...common} markerEnd="url(#lmArrow)" />
      </>)}
      {id === 'absorption' && (<>
        <rect x="44" y="72" width="112" height="18" rx="4" fill="#2a2d34" />
        <line x1="64" y1="22" x2="84" y2="70" {...common} markerEnd="url(#lmArrow)" />
        {[104, 120, 136].map((x) => <path key={x} d={`M${x} 70c-6-8 6-12 0-20`} stroke="#e0533d" strokeWidth="2" fill="none" />)}
      </>)}
      {id === 'transmission' && (<>
        <rect x="85" y="22" width="30" height="68" rx="4" fill="#cdebff" stroke="#3b7fd6" strokeOpacity="0.4" />
        <line x1="20" y1="56" x2="180" y2="56" {...common} markerEnd="url(#lmArrow)" />
      </>)}
      {id === 'refraction' && (<>
        <rect x="20" y="56" width="160" height="40" rx="4" fill="#cdebff" stroke="#3b7fd6" strokeOpacity="0.4" />
        <line x1="52" y1="18" x2="100" y2="56" {...common} />
        <line x1="100" y1="56" x2="128" y2="92" {...common} markerEnd="url(#lmArrow)" />
        <line x1="100" y1="40" x2="100" y2="80" stroke="#000" strokeOpacity="0.2" strokeDasharray="3 3" />
      </>)}
      {id === 'scattering' && (<>
        <line x1="20" y1="56" x2="100" y2="56" {...common} />
        <circle cx="100" cy="56" r="5" fill="#3b7fd6" />
        {[20, 70, 120, 160, 300].map((a) => <line key={a} x1="100" y1="56" x2={100 + 42 * Math.cos((a * Math.PI) / 180)} y2={56 + 42 * Math.sin((a * Math.PI) / 180)} stroke="#3b7fd6" strokeWidth="2" markerEnd="url(#lmArrow)" />)}
      </>)}
      {id === 'diffraction' && (<>
        <rect x="92" y="20" width="16" height="28" fill="#9aa0a6" />
        <rect x="92" y="62" width="16" height="28" fill="#9aa0a6" />
        {[0, 1, 2].map((i) => <line key={i} x1={34 + i * 18} y1="20" x2={34 + i * 18} y2="90" {...common} strokeWidth="2" />)}
        {[0, 1, 2].map((i) => <path key={`a${i}`} d={`M100 56 m-${12 + i * 14} 0 a ${12 + i * 14} ${12 + i * 14} 0 0 1 ${(12 + i * 14) * 2} 0`} transform="rotate(-90 100 56)" {...common} strokeWidth="1.6" opacity={1 - i * 0.25} />)}
      </>)}
      {id === 'polarization' && (<>
        <line x1="20" y1="56" x2="92" y2="56" {...common} />
        {[30, 44, 58, 72, 86].map((x) => <line key={x} x1={x} y1="44" x2={x} y2="68" stroke="#e0533d" strokeWidth="2" />)}
        <rect x="96" y="26" width="10" height="60" fill="#475569" />
        {[20, 40, 60].map((y) => <line key={y} x1="96" y1={26 + y * 0.9} x2="106" y2={26 + y * 0.9} stroke="#cbd5e1" strokeWidth="2" />)}
        <line x1="110" y1="56" x2="180" y2="56" {...common} markerEnd="url(#lmArrow)" />
      </>)}
    </svg>
  )
}

export default function LightMeetsMatter({ band, onOpenAnimation }) {
  const [sel, setSel] = useState('reflection')
  const b = BEHAVIORS.find((x) => x.id === sel)

  return (
    <div>
      <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">When light meets matter</h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink/80 sm:text-base">
        Light waves across the spectrum behave in similar ways when they hit an object — and NASA instruments record those behaviors to learn what matter is made of.
      </p>
      <NasaSourceCredit variant="quote" page={QUOTES.behaviors.page}>{QUOTES.behaviors.text}</NasaSourceCredit>

      <div className="mt-4 flex flex-wrap gap-2">
        {BEHAVIORS.map((x) => (
          <button key={x.id} onClick={() => setSel(x.id)} aria-pressed={x.id === sel}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${x.id === sel ? 'bg-ink text-app shadow-soft' : 'bg-cream text-ink/70 hover:text-ink'}`}>
            {x.name}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2 lg:items-start">
        <div className="rounded-panel bg-cream p-4"><Diagram id={sel} /></div>
        <AnimatePresence mode="wait">
          <motion.div key={sel} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="rounded-panel bg-surface p-5 shadow-soft">
            <h3 className="text-xl font-extrabold tracking-tight text-ink">{b.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/80">{b.explain[band]}</p>
            <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-faint">NASA example</p>
            <p className="text-sm text-ink/80">{b.nasaExample}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl bg-cream p-3"><p className="text-[11px] font-bold uppercase tracking-wide text-faint">Why it matters</p><p className="mt-0.5 text-sm text-ink/80">{b.why}</p></div>
              <div className="rounded-xl bg-cream p-3"><p className="text-[11px] font-bold uppercase tracking-wide text-faint">In remote sensing</p><p className="mt-0.5 text-sm text-ink/80">{b.remoteSensing}</p></div>
            </div>
            <NasaSourceCredit variant="adapted" pages={`${b.page}`} />
          </motion.div>
        </AnimatePresence>
      </div>

      <button onClick={() => onOpenAnimation?.('waveBehaviors')} className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-app transition-all hover:scale-[1.02] hover:opacity-90">
        <Icon name="rays" className="h-4 w-4" />
        Open the full Wave Behaviors animation
      </button>
    </div>
  )
}
