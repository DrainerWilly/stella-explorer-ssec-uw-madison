// @ts-nocheck
import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Icon from '../Icon'
import PartIcon from './PartIcon'
import { buildSteps } from '../../data/stellaBuilds'

// Deterministic shuffle so the parts tray is scrambled but stable per instrument.
function shuffled(list, seed) {
  const arr = [...list]
  let s = seed
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280
    const j = Math.floor((s / 233280) * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// ---- assembly rig slot layouts (SVG, 360 × 540) -------------------------------

// Bespoke layout for the STELLA-1.2 platform build (matches the real device).
const PLATFORM_SLOTS = {
  tft: { x: 60, y: 116, w: 240, h: 150 },
  gps: { x: 60, y: 286, w: 80, h: 60 },
  rtc: { x: 150, y: 286, w: 80, h: 60 },
  sd: { x: 240, y: 286, w: 60, h: 60 },
  proto: { x: 60, y: 366, w: 180, h: 76 },
  esp32: { x: 76, y: 384, w: 92, h: 40 },
  encoder: { x: 262, y: 374, w: 60, h: 60 },
  boost: { x: 60, y: 458, w: 70, h: 46 },
  battery: { x: 142, y: 458, w: 158, h: 46 },
}
const HOUSING = { x: 14, y: 78, w: 332, h: 446 }
const MODULE_BAY = { x: 60, y: 10, w: 240, h: 56 }

// Slot geometry for a snap-on module part: the bay is split evenly.
function moduleSlot(index, count) {
  const gap = 6
  const w = (MODULE_BAY.w - gap * (Math.max(count, 1) - 1)) / Math.max(count, 1)
  return { x: MODULE_BAY.x + index * (w + gap), y: MODULE_BAY.y, w, h: MODULE_BAY.h }
}

// Auto grid for fixed instruments (Q2, 1.1): two columns inside the housing.
function gridSlot(index) {
  const col = index % 2
  const row = Math.floor(index / 2)
  return { x: 44 + col * 142, y: 108 + row * 88, w: 130, h: 74 }
}

// One slot on the rig: dashed placeholder → filled panel once placed.
function RigSlot({ slot, placed, active, accent, part, reduce }) {
  return (
    <g>
      {!placed && (
        <rect
          x={slot.x}
          y={slot.y}
          width={slot.w}
          height={slot.h}
          rx="8"
          fill={active ? `${accent}14` : 'transparent'}
          stroke={active ? accent : 'rgba(120,130,150,0.35)'}
          strokeWidth={active ? 2 : 1.2}
          strokeDasharray="5 4"
          className={active && !reduce ? 'animate-pulse' : ''}
        />
      )}
      {!placed && active && (
        <text
          x={slot.x + slot.w / 2}
          y={slot.y + slot.h / 2 + 3}
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          fill={accent}
        >
          ?
        </text>
      )}
      {placed && (
        <motion.g
          initial={{ opacity: 0, y: reduce ? 0 : -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <rect
            x={slot.x}
            y={slot.y}
            width={slot.w}
            height={slot.h}
            rx="8"
            fill="#ffffff"
            stroke={accent}
            strokeWidth="1.5"
          />
          <PartIcon
            name={part.icon}
            className=""
            x={slot.x + slot.w / 2 - 11}
            y={slot.y + (slot.h > 50 && slot.w > 70 ? slot.h / 2 - 18 : slot.h / 2 - 11)}
            width={22}
            height={22}
            style={{ color: accent }}
          />
          {slot.h > 50 && slot.w > 70 && (
            <text
              x={slot.x + slot.w / 2}
              y={slot.y + slot.h / 2 + 18}
              textAnchor="middle"
              fontSize="9"
              fontWeight="700"
              fill="#3a4358"
            >
              {part.name.length > 24 ? part.kind : part.name}
            </text>
          )}
          <title>{part.name}</title>
        </motion.g>
      )}
    </g>
  )
}

// Stage 2: build the instrument part by part. Each step describes the part by
// its JOB; the builder picks the matching component from the tray.
export default function BuildWorkshop({ instrument, onComplete, onBack }) {
  const reduce = useReducedMotion()
  const isPlatform = instrument.chassis === 'platform'
  const steps = useMemo(() => buildSteps(instrument), [instrument])
  const tray = useMemo(() => shuffled(steps, instrument.id.length * 7 + 13), [steps, instrument])

  const [stepIdx, setStepIdx] = useState(0)
  const [wrongId, setWrongId] = useState(null)
  const done = stepIdx >= steps.length
  const current = done ? null : steps[stepIdx]
  const placedIds = useMemo(() => new Set(steps.slice(0, stepIdx).map((p) => p.id)), [steps, stepIdx])
  const accent = instrument.accent

  const moduleParts = instrument.moduleParts ?? []
  // Which slot does each part occupy?
  const slotOf = (part) => {
    if (isPlatform && PLATFORM_SLOTS[part.id]) return PLATFORM_SLOTS[part.id]
    if (isPlatform) {
      const idx = moduleParts.findIndex((p) => p.id === part.id)
      if (idx >= 0) return moduleSlot(idx, moduleParts.length)
      return null
    }
    const idx = steps.filter((p) => p.id !== 'housing').findIndex((p) => p.id === part.id)
    return idx >= 0 ? gridSlot(idx) : null
  }

  const pick = (part) => {
    if (done) return
    if (part.id === current.id) {
      setWrongId(null)
      setStepIdx((i) => i + 1)
    } else {
      setWrongId(part.id)
      setTimeout(() => setWrongId(null), 650)
    }
  }

  const housingPlaced = placedIds.has('housing')

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(300px,380px)_1fr]">
      {/* ---- assembly rig ---- */}
      <div className="rounded-panel bg-cream p-4 shadow-soft">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-faint">
            Assembly bench
          </span>
          <span className="rounded-full bg-ink/5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-ink/60">
            {instrument.buildTag}
          </span>
        </div>

        <svg viewBox="0 0 360 540" className="mt-2 w-full" role="img" aria-label="Instrument assembly diagram">
          {/* bench dots */}
          {Array.from({ length: 8 }).map((_, r) => (
            <g key={r}>
              {Array.from({ length: 6 }).map((_, c) => (
                <circle key={c} cx={30 + c * 60} cy={95 + r * 58} r="1.2" fill="rgba(120,130,150,0.2)" />
              ))}
            </g>
          ))}

          {/* housing outline (always the final step) */}
          <rect
            x={HOUSING.x}
            y={HOUSING.y}
            width={HOUSING.w}
            height={HOUSING.h}
            rx="22"
            fill={housingPlaced ? 'rgba(255,255,255,0.6)' : 'transparent'}
            stroke={housingPlaced ? accent : current?.id === 'housing' ? accent : 'rgba(120,130,150,0.3)'}
            strokeWidth={housingPlaced ? 2.5 : 1.2}
            strokeDasharray={housingPlaced ? 'none' : '6 5'}
            className={current?.id === 'housing' && !reduce ? 'animate-pulse' : ''}
          />
          <text
            x={HOUSING.x + 14}
            y={HOUSING.y + 20}
            fontSize="9"
            fontWeight="700"
            fill={housingPlaced ? accent : 'rgba(120,130,150,0.5)'}
            style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}
          >
            {housingPlaced ? `${instrument.name} housing` : 'housing'}
          </text>

          {/* snap-on module bay: platform builds only */}
          {isPlatform && (
            <>
              <text
                x={MODULE_BAY.x}
                y={MODULE_BAY.y - 1}
                fontSize="8.5"
                fontWeight="700"
                fill="rgba(120,130,150,0.6)"
                style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}
              >
                snap-on module bay
              </text>
              {moduleParts.length === 0 && (
                <>
                  <rect
                    x={MODULE_BAY.x}
                    y={MODULE_BAY.y}
                    width={MODULE_BAY.w}
                    height={MODULE_BAY.h}
                    rx="8"
                    fill="transparent"
                    stroke="rgba(120,130,150,0.35)"
                    strokeWidth="1.2"
                    strokeDasharray="5 4"
                  />
                  <text
                    x={MODULE_BAY.x + MODULE_BAY.w / 2}
                    y={MODULE_BAY.y + MODULE_BAY.h / 2 + 3}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="700"
                    fill="rgba(120,130,150,0.55)"
                  >
                    empty, RS / AA1 / Proto snap on here
                  </text>
                </>
              )}
            </>
          )}

          {/* part slots (platform: proto board renders under the brain) */}
          {steps
            .filter((p) => p.id !== 'housing')
            .map((p) => {
              const slot = slotOf(p)
              if (!slot) return null
              return (
                <RigSlot
                  key={p.id}
                  part={p}
                  slot={slot}
                  placed={placedIds.has(p.id)}
                  active={current?.id === p.id}
                  accent={accent}
                  reduce={reduce}
                />
              )
            })}
        </svg>

        {/* progress */}
        <div className="mt-2">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(stepIdx / steps.length) * 100}%`, backgroundColor: accent }}
            />
          </div>
          <p className="mt-1.5 text-center text-[11px] font-bold text-faint">
            {stepIdx} of {steps.length} parts installed
          </p>
        </div>
      </div>

      {/* ---- instruction + parts tray ---- */}
      <div className="flex min-w-0 flex-col gap-4">
        {!done ? (
          <div className="rounded-panel bg-cream p-5 shadow-soft">
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: accent }}>
              Step {stepIdx + 1} of {steps.length}
            </p>
            <p className="mt-1.5 text-[15px] font-semibold leading-relaxed text-ink">
              {current.callout}
            </p>
            <p className="mt-2 text-xs text-faint">
              Pick the matching part from the tray below, just like following NASA’s real build guide.
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: reduce ? 1 : 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-panel p-5 shadow-soft"
            style={{ backgroundColor: `${accent}1e`, border: `1px solid ${accent}55` }}
          >
            <p className="text-lg font-extrabold text-ink">🛰️ {instrument.name} assembled!</p>
            <p className="mt-1 text-sm leading-relaxed text-ink/75">
              {steps.length} components and a 3D-printed housing make a real NASA field
              instrument. Time to switch it on.
            </p>
            <button
              onClick={onComplete}
              className="mt-4 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.03]"
              style={{ backgroundColor: accent }}
            >
              <Icon name="play" className="h-4 w-4" />
              Power it on
            </button>
          </motion.div>
        )}

        {/* parts tray */}
        {!done && (
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-faint">
              Parts tray
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
              {tray
                .filter((p) => !placedIds.has(p.id))
                .map((p) => {
                  const wrong = wrongId === p.id
                  return (
                    <motion.button
                      key={p.id}
                      onClick={() => pick(p)}
                      animate={wrong && !reduce ? { x: [0, -7, 7, -5, 5, 0] } : { x: 0 }}
                      transition={{ duration: 0.4 }}
                      className={`flex items-start gap-2.5 rounded-card border p-3 text-left transition-colors ${
                        wrong
                          ? 'border-coral bg-coral/10'
                          : 'border-ink/10 bg-cream hover:border-ink/25 hover:bg-white'
                      }`}
                    >
                      <span
                        className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg"
                        style={{ backgroundColor: `${accent}1a`, color: accent }}
                      >
                        <PartIcon name={p.icon} className="h-[18px] w-[18px]" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[12px] font-bold leading-tight text-ink">
                          {p.name}
                        </span>
                        <span className="block text-[10px] font-semibold uppercase tracking-wide text-faint">
                          {p.kind}
                        </span>
                      </span>
                    </motion.button>
                  )
                })}
            </div>
            {wrongId && (
              <p className="mt-2 text-xs font-semibold text-coral">
                Not that one. That’s the {tray.find((p) => p.id === wrongId)?.kind.toLowerCase()}.
                Read the step again!
              </p>
            )}
          </div>
        )}

        {/* footer actions */}
        <div className="mt-auto flex items-center justify-between pt-1">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-ink"
          >
            <Icon name="back" className="h-3.5 w-3.5" />
            Choose a different instrument
          </button>
          {!done && (
            <button
              onClick={onComplete}
              className="text-xs font-bold text-faint underline-offset-2 hover:text-ink hover:underline"
            >
              Skip the build, jump to the demo
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
