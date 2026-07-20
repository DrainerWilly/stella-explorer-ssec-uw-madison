// @ts-nocheck
import { useMemo, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Icon from '../Icon'
import GameShell from './GameShell'
import GameResults from './GameResults'
import { GAME_ACCENT } from '../../data/games'
import {
  FC_BANDS,
  FC_REGIONS,
  FC_MISSIONS,
  displayColor,
  matchesTarget,
} from '../../data/falseColorScene'

const CHANNELS = [
  { id: 'r', label: 'Red channel', tint: '#ff7d7d' },
  { id: 'g', label: 'Green channel', tint: '#7de3a0' },
  { id: 'b', label: 'Blue channel', tint: '#7db7ff' },
]

// Top-down satellite scene. Every region's fill is computed live from the
// player's band-to-channel assignment, like a real composite being developed.
function SatelliteScene({ colors }) {
  return (
    <svg viewBox="0 0 480 300" className="w-full rounded-2xl" role="img" aria-label="Satellite scene preview">
      {/* base farmland */}
      <rect x="0" y="0" width="480" height="300" fill={colors.crops} />
      {/* crop strips for texture */}
      {[40, 110, 250, 320].map((x) => (
        <rect key={x} x={x} y="0" width="34" height="300" fill={colors.crops} style={{ filter: 'brightness(0.9)' }} />
      ))}

      {/* dry fields (right side) */}
      <rect x="360" y="20" width="120" height="120" fill={colors.dryfield} />
      <rect x="330" y="150" width="150" height="60" fill={colors.dryfield} style={{ filter: 'brightness(0.92)' }} />

      {/* forest (left) with a wavy edge */}
      <path
        d="M0 0h180c-14 40 12 60-6 96s10 62-10 96-2 72-24 108H0z"
        fill={colors.forest}
      />
      {/* forest texture dots */}
      {[
        [30, 40], [70, 26], [110, 58], [46, 96], [96, 120], [30, 150], [80, 190], [40, 240], [100, 262],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="9" fill={colors.forest} style={{ filter: 'brightness(1.18)' }} />
      ))}

      {/* burn scar bite in the forest */}
      <path d="M96 148c26-10 52 2 56 24s-16 40-42 38-42-20-38-36 12-22 24-26z" fill={colors.burn} />

      {/* river + lake */}
      <path
        d="M210 0c-10 34 16 52 8 84s-26 44-16 76 30 44 22 78-18 42-14 62h30c-6-22 6-34 12-60s-14-46-20-76 16-42 22-72-10-58 0-92z"
        fill={colors.water}
      />
      <ellipse cx="286" cy="226" rx="52" ry="34" fill={colors.water} />

      {/* town grid (bottom right) */}
      <g>
        <rect x="376" y="228" width="104" height="72" fill={colors.city} />
        {[388, 412, 436, 460].map((x) => (
          <rect key={x} x={x} y="234" width="14" height="60" fill={colors.city} style={{ filter: 'brightness(0.8)' }} />
        ))}
      </g>

      {/* clouds + soft shadows */}
      <g style={{ filter: 'brightness(0.55)', opacity: 0.25 }}>
        <ellipse cx="160" cy="78" rx="34" ry="13" fill="#000" />
        <ellipse cx="356" cy="182" rx="28" ry="11" fill="#000" />
      </g>
      <ellipse cx="150" cy="66" rx="36" ry="14" fill={colors.cloud} />
      <ellipse cx="176" cy="60" rx="22" ry="10" fill={colors.cloud} />
      <ellipse cx="346" cy="170" rx="30" ry="12" fill={colors.cloud} />
    </svg>
  )
}

export default function FalseColorPainter({ game, onExit }) {
  const reduce = useReducedMotion()
  const accent = GAME_ACCENT[game.color]

  const [missionIdx, setMissionIdx] = useState(0)
  const [assignment, setAssignment] = useState({ r: null, g: null, b: null })
  const [activeSlot, setActiveSlot] = useState('r')
  const [attempted, setAttempted] = useState(false) // wrong develop pressed this mission
  const [solved, setSolved] = useState(false)
  const [shake, setShake] = useState(0)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const mission = FC_MISSIONS[missionIdx]

  // Region id → current display color.
  const colors = useMemo(() => {
    const map = {}
    for (const region of FC_REGIONS) map[region.id] = displayColor(region.refl, assignment)
    return map
  }, [assignment])

  const assign = (bandId) => {
    if (solved) return
    setAssignment((a) => ({ ...a, [activeSlot]: bandId }))
    // hop to the next empty slot for fast painting
    const order = ['r', 'g', 'b']
    const next = order.find((c) => c !== activeSlot && !assignment[c])
    if (next) setActiveSlot(next)
  }

  const develop = () => {
    if (solved) return
    if (matchesTarget(assignment, mission)) {
      if (!attempted) setScore((s) => s + 1)
      setSolved(true)
    } else {
      setAttempted(true)
      setShake((n) => n + 1)
    }
  }

  const nextMission = () => {
    if (missionIdx + 1 >= FC_MISSIONS.length) {
      setFinished(true)
      return
    }
    setMissionIdx((i) => i + 1)
    setAssignment({ r: null, g: null, b: null })
    setActiveSlot('r')
    setAttempted(false)
    setSolved(false)
  }

  const restart = () => {
    setMissionIdx(0)
    setAssignment({ r: null, g: null, b: null })
    setActiveSlot('r')
    setAttempted(false)
    setSolved(false)
    setScore(0)
    setFinished(false)
  }

  if (finished) {
    return (
      <GameShell game={game} onExit={onExit}>
        <GameResults
          game={game}
          score={score}
          total={FC_MISSIONS.length}
          onReplay={restart}
          onExit={onExit}
          detail="You just built the same composites scientists make every day: natural color for our eyes, color-infrared for plant health, and SWIR combos for mapping fires."
        />
      </GameShell>
    )
  }

  const ready = assignment.r && assignment.g && assignment.b

  return (
    <GameShell
      game={game}
      onExit={onExit}
      scoreChip={`Missions ${score} / ${FC_MISSIONS.length}`}
      progressPct={(missionIdx / FC_MISSIONS.length) * 100}
    >
      {/* mission brief */}
      <div className="rounded-2xl border-2 border-white/10 bg-white/[0.05] p-4">
        <div className="font-game text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">
          Mission {missionIdx + 1} of {FC_MISSIONS.length} · {mission.title}
        </div>
        <p className="mt-1 font-game text-lg font-bold leading-snug text-white">{mission.brief}</p>
        {attempted && !solved && (
          <p className="mt-1.5 text-sm text-amber-200/90">
            <Icon name="rays" className="mr-1 inline h-3.5 w-3.5 align-[-2px]" />
            Hint: {mission.hint}
          </p>
        )}
      </div>

      {/* live scene */}
      <motion.div
        key={shake}
        animate={shake && !reduce ? { x: [0, -8, 8, -5, 5, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="mt-4 overflow-hidden rounded-2xl border-2 border-white/10"
      >
        <SatelliteScene colors={colors} />
      </motion.div>
      <p className="mt-1.5 text-center text-[11px] text-white/35">
        Forest · burn scar · river & lake · crop fields · dry fields · town · clouds
      </p>

      {/* channel slots */}
      <div className="mt-4 grid grid-cols-3 gap-2.5">
        {CHANNELS.map((ch) => {
          const band = FC_BANDS.find((b) => b.id === assignment[ch.id])
          const active = activeSlot === ch.id
          return (
            <button
              key={ch.id}
              onClick={() => setActiveSlot(ch.id)}
              aria-pressed={active}
              className={`rounded-2xl border-2 p-3 text-center transition-all ${
                active ? 'scale-[1.03] border-white/60 bg-white/10' : 'border-white/10 bg-white/[0.04] hover:border-white/25'
              }`}
            >
              <div className="font-game text-[11px] font-bold uppercase tracking-wider" style={{ color: ch.tint }}>
                {ch.label}
              </div>
              {band ? (
                <div
                  className="mx-auto mt-1.5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-game text-sm font-extrabold text-white"
                  style={{ backgroundColor: band.chip }}
                >
                  {band.label}
                </div>
              ) : (
                <div className="mx-auto mt-1.5 inline-block rounded-full border-2 border-dashed border-white/25 px-3 py-1 font-game text-sm font-bold text-white/40">
                  empty
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* band palette */}
      <div className="mt-3">
        <p className="mb-1.5 font-game text-[11px] font-bold uppercase tracking-wider text-white/40">
          Pick a band for the highlighted channel:
        </p>
        <div className="flex flex-wrap gap-2">
          {FC_BANDS.map((b) => (
            <button
              key={b.id}
              onClick={() => assign(b.id)}
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-white/10 px-3.5 py-1.5 font-game text-sm font-bold text-white transition-transform hover:scale-105"
              style={{ backgroundColor: `${b.chip}cc` }}
            >
              {b.label}
              <span className="text-[10px] font-semibold text-white/70">{b.nm} nm{b.invisible ? ' · invisible' : ''}</span>
            </button>
          ))}
        </div>
      </div>

      {/* develop / result */}
      <AnimatePresence mode="wait">
        {solved ? (
          <motion.div
            key="solved"
            initial={{ opacity: 0, y: reduce ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-2xl border-2 p-4"
            style={{ borderColor: `${accent}66`, backgroundColor: `${accent}14` }}
          >
            <div className="flex items-center gap-2 font-game text-base font-extrabold text-white">
              <Icon name="star" className="h-5 w-5" style={{ color: accent }} />
              Perfect composite!
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-white/80">{mission.explain}</p>
            <button
              onClick={nextMission}
              className="mt-3 inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-game text-sm font-extrabold text-[#101426] transition-transform hover:scale-105"
              style={{ backgroundColor: accent }}
            >
              {missionIdx + 1 >= FC_MISSIONS.length ? 'See results' : 'Next mission'}
              <Icon name="chevron" className="h-4 w-4" />
            </button>
          </motion.div>
        ) : (
          <motion.div key="develop" className="mt-4">
            <button
              onClick={develop}
              disabled={!ready}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-game text-sm font-extrabold text-[#101426] transition-transform enabled:hover:scale-105 disabled:opacity-40"
              style={{ backgroundColor: accent }}
            >
              <Icon name="palette" className="h-4 w-4" />
              Develop the image
            </button>
            {!ready && (
              <span className="ml-3 text-sm text-white/40">Load a band into all three channels first.</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </GameShell>
  )
}
