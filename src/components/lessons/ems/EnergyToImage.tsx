// @ts-nocheck
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from '../../Icon'
import NasaSourceCredit from './NasaSourceCredit'
import { ENERGY_IMAGE, QUOTES } from '../../../data/emsLessonContent'

export default function EnergyToImage({ band, onOpenAnimation }) {
  const [mode, setMode] = useState('natural')

  return (
    <div>
      <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">How scientists turn energy into images and data</h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink/80 sm:text-base">{ENERGY_IMAGE.intro[band]}</p>

      {/* pipeline */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        {ENERGY_IMAGE.pipeline.map((step, i) => (
          <div key={step} className="flex items-center gap-1.5">
            <span className="rounded-full bg-surface px-2.5 py-1.5 text-[11px] font-bold text-ink/80 shadow-soft">{step}</span>
            {i < ENERGY_IMAGE.pipeline.length - 1 && <Icon name="chevron" className="h-3.5 w-3.5 text-faint" />}
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* RGB camera */}
        <div className="rounded-panel bg-surface p-5 shadow-soft">
          <h3 className="text-sm font-extrabold text-ink">A digital camera, simplified</h3>
          <p className="mt-1 text-sm leading-relaxed text-ink/80">{ENERGY_IMAGE.camera[band]}</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 space-y-1.5">
              {[{ c: '#e0533d', l: 'Red', w: 70 }, { c: '#3fae5e', l: 'Green', w: 55 }, { c: '#3b6fd6', l: 'Blue', w: 40 }].map((r) => (
                <div key={r.l}>
                  <div className="flex justify-between text-[10px] font-bold text-muted"><span>{r.l}</span><span>{r.w}</span></div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink/[0.06]"><motion.div className="h-full rounded-full" style={{ backgroundColor: r.c }} initial={false} animate={{ width: `${r.w}%` }} transition={{ type: 'spring', stiffness: 240, damping: 26 }} /></div>
                </div>
              ))}
            </div>
            <Icon name="chevron" className="h-4 w-4 text-faint" />
            <div className="grid h-16 w-16 place-items-center rounded-xl shadow-soft" style={{ background: 'linear-gradient(135deg,#b98a4a,#6f8f57)' }}>
              <span className="text-[9px] font-bold text-white/90">composite</span>
            </div>
          </div>
        </div>

        {/* natural vs false */}
        <div className="rounded-panel bg-surface p-5 shadow-soft">
          <div className="inline-flex rounded-full bg-cream p-1 text-xs font-bold">
            <button onClick={() => setMode('natural')} aria-pressed={mode === 'natural'} className={`rounded-full px-3.5 py-1.5 transition-all ${mode === 'natural' ? 'bg-ink text-app shadow-soft' : 'text-muted hover:text-ink'}`}>Natural color</button>
            <button onClick={() => setMode('false')} aria-pressed={mode === 'false'} className={`rounded-full px-3.5 py-1.5 transition-all ${mode === 'false' ? 'bg-ink text-app shadow-soft' : 'text-muted hover:text-ink'}`}>False color</button>
          </div>
          <AnimatePresence mode="wait">
            <motion.p key={mode} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="mt-3 text-sm leading-relaxed text-ink/80">
              {ENERGY_IMAGE[mode][band]}
            </motion.p>
          </AnimatePresence>
          {mode === 'false' && (
            <>
              <NasaSourceCredit variant="quote" page={QUOTES.falseColor.page}>{QUOTES.falseColor.text}</NasaSourceCredit>
              <p className="mt-2 rounded-xl bg-cream p-3 text-sm leading-relaxed text-ink/80">{ENERGY_IMAGE.themis}</p>
            </>
          )}
        </div>
      </div>

      <NasaSourceCredit variant="adapted" pages={ENERGY_IMAGE.pages} />

      <button onClick={() => onOpenAnimation?.('visibleInfrared')} className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-app transition-all hover:scale-[1.02] hover:opacity-90">
        <Icon name="satellite" className="h-4 w-4" />
        Open Visible vs Infrared
      </button>
    </div>
  )
}
