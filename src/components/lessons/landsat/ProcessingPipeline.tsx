// @ts-nocheck
import { motion, useReducedMotion } from 'framer-motion'
import Icon from '../../Icon'
import { PIPELINE, PIPELINE_TEXT, ATMOSPHERE_NOTE } from '../../../data/landsatLessonContent'

export default function ProcessingPipeline({ band }) {
  const reduced = useReducedMotion()
  return (
    <div className="space-y-4">
      {/* pipeline chips */}
      <div className="rounded-panel bg-surface p-4 shadow-soft">
        <div className="flex flex-wrap items-center gap-2">
          {PIPELINE.map((step, i) => (
            <div key={step.id} className="flex items-center gap-2">
              <motion.div
                initial={reduced ? false : { opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: reduced ? 0 : i * 0.1 }}
                className="flex items-center gap-2 rounded-2xl bg-cream px-3 py-2"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-surface text-ink/70 shadow-soft">
                  <Icon name={step.icon} className="h-4 w-4" />
                </span>
                <span className="text-xs font-bold text-ink/80">{step.label}</span>
              </motion.div>
              {i < PIPELINE.length - 1 && <Icon name="chevron" className="h-4 w-4 text-faint" />}
            </div>
          ))}
        </div>
      </div>

      <p className="rounded-panel bg-cream p-4 text-sm leading-relaxed text-ink/80">{PIPELINE_TEXT[band]}</p>

      {/* atmosphere correction visual */}
      <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-panel bg-surface p-3 shadow-soft">
          <p className="mb-2 text-xs font-bold text-muted">Raw measurement</p>
          <svg viewBox="0 0 160 96" className="h-auto w-full" role="img" aria-label="Raw signal affected by haze">
            <rect x="0" y="0" width="160" height="96" rx="8" fill="#8aa0b8" />
            <rect x="0" y="0" width="160" height="96" rx="8" fill="#ffffff" opacity="0.28" />
            {!reduced &&
              [20, 44, 68].map((y, i) => (
                <motion.path key={y} d={`M0 ${y} q40 -8 80 0 t80 0`} fill="none" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="3"
                  animate={{ x: [0, 12] }} transition={{ duration: 2.2, repeat: Infinity, repeatType: 'reverse', delay: i * 0.3 }} />
              ))}
            <text x="80" y="86" textAnchor="middle" fontSize="9" fontWeight="700" fill="#1f2937">haze + scattering</text>
          </svg>
        </div>
        <div className="grid place-items-center">
          <Icon name="chevron" className="h-5 w-5 text-faint" />
        </div>
        <div className="rounded-panel bg-surface p-3 shadow-soft">
          <p className="mb-2 text-xs font-bold text-muted">Surface reflectance</p>
          <svg viewBox="0 0 160 96" className="h-auto w-full" role="img" aria-label="Processed surface reflectance result">
            <rect x="0" y="0" width="160" height="96" rx="8" fill="#2f7d4f" />
            <path d="M20 70 Q60 50 100 64 T150 56" fill="none" stroke="#bdf0d4" strokeWidth="4" />
            <circle cx="120" cy="32" r="12" fill="#7fc6a0" />
            <text x="80" y="86" textAnchor="middle" fontSize="9" fontWeight="700" fill="#ffffff">clearer, comparable</text>
          </svg>
        </div>
      </div>

      <p className="rounded-panel bg-blue/40 px-4 py-3 text-sm font-semibold text-cink">{ATMOSPHERE_NOTE}</p>
    </div>
  )
}
