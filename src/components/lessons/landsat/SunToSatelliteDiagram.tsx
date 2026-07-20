// @ts-nocheck
import { motion, useReducedMotion } from 'framer-motion'
import Icon from '../../Icon'

const ICONS = ['sun', 'globe', 'satellite', 'data', 'spectrum']

// Compact Sunlight → Surface → Sensor → Bands → Composite pipeline.
export default function SunToSatelliteDiagram({ steps }) {
  const reduced = useReducedMotion()
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-1.5">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : i * 0.12 }}
            className="flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1.5 shadow-soft"
          >
            <span className="grid h-5 w-5 place-items-center rounded-full bg-cream text-ink/70">
              <Icon name={ICONS[i] ?? 'spectrum'} className="h-3 w-3" />
            </span>
            <span className="text-[11px] font-bold text-ink/80">{label}</span>
          </motion.div>
          {i < steps.length - 1 && <Icon name="chevron" className="h-3.5 w-3.5 text-faint" />}
        </div>
      ))}
    </div>
  )
}
