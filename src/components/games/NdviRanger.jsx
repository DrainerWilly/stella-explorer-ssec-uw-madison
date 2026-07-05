import { useState } from 'react'
import Icon from '../Icon.jsx'
import GameShell from './GameShell.jsx'
import GameResults from './GameResults.jsx'
import { NDVI_TARGETS, ndvi, GAME_ACCENT } from '../../data/games.js'

// Continuous NDVI zones for the scale + live classification.
const ZONES = [
  { max: 0, label: 'Open water', color: '#4a90d9' },
  { max: 0.2, label: 'Bare soil', color: '#b98a4b' },
  { max: 0.5, label: 'Grass & shrubs', color: '#a7c957' },
  { max: 0.8, label: 'Healthy crops', color: '#4faa5a' },
  { max: 1.01, label: 'Dense forest', color: '#2f7d3b' },
]
function classify(v) {
  return ZONES.find((z) => v < z.max) || ZONES[ZONES.length - 1]
}
const pos = (v) => ((v + 1) / 2) * 100 // NDVI -1..1 → 0..100%

function Slider({ label, value, onChange, tint }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-bold text-ink">{label}</span>
        <span className="font-mono font-bold" style={{ color: tint }}>
          {Math.round(value * 100)}%
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(value * 100)}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="mt-1.5 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/15"
        style={{ accentColor: tint }}
      />
    </div>
  )
}

export default function NdviRanger({ game, onExit }) {
  const accent = GAME_ACCENT[game.color]
  const total = NDVI_TARGETS.length
  const [round, setRound] = useState(0)
  const [red, setRed] = useState(0.25)
  const [nir, setNir] = useState(0.25)
  const [locked, setLocked] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const target = NDVI_TARGETS[round]
  const value = ndvi(red, nir)
  const inRange = value >= target.min && value <= target.max
  const currentZone = classify(value)

  const restart = () => {
    setRound(0)
    setRed(0.25)
    setNir(0.25)
    setLocked(false)
    setScore(0)
    setFinished(false)
  }
  const lockIn = () => {
    if (inRange) setScore((s) => s + 1)
    setLocked(true)
  }
  const next = () => {
    if (round + 1 >= total) {
      setFinished(true)
    } else {
      setRound((r) => r + 1)
      setRed(0.25)
      setNir(0.25)
      setLocked(false)
    }
  }

  if (finished) {
    return (
      <GameShell game={game} onExit={onExit}>
        <GameResults
          game={game}
          score={score}
          total={total}
          onReplay={restart}
          onExit={onExit}
          detail="NDVI turns two numbers — red and near-infrared reflectance — into a global map of where plants are growing and how healthy they are."
        />
      </GameShell>
    )
  }

  return (
    <GameShell
      game={game}
      onExit={onExit}
      scoreChip={`Score ${score} / ${total}`}
      progressPct={(round / total) * 100}
    >
      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
        Target {round + 1} of {total}
      </div>
      <h2 className="mt-1 text-lg font-bold text-ink">
        Tune the bands to read as{' '}
        <span style={{ color: accent }}>{target.label}</span>
      </h2>

      {/* live NDVI formula */}
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <div className="text-center font-mono text-sm text-ink/80">
          NDVI ={' '}
          <span className="text-ink">
            (NIR − Red) / (NIR + Red)
          </span>
        </div>
        <div className="mt-1 text-center font-mono text-[13px] text-muted">
          = ({nir.toFixed(2)} − {red.toFixed(2)}) / ({nir.toFixed(2)} + {red.toFixed(2)}) ={' '}
          <span className="font-bold" style={{ color: accent }}>
            {value.toFixed(2)}
          </span>
        </div>

        {/* NDVI scale */}
        <div className="relative mt-4 h-6 w-full overflow-hidden rounded-full">
          <div className="flex h-full w-full">
            {ZONES.map((z, i) => {
              const start = i === 0 ? -1 : ZONES[i - 1].max
              const w = ((Math.min(z.max, 1) - start) / 2) * 100
              return <div key={z.label} style={{ width: `${w}%`, backgroundColor: z.color, opacity: 0.5 }} />
            })}
          </div>
          {/* target band */}
          <div
            className="absolute top-0 h-full border-x-2 bg-white/15"
            style={{
              left: `${pos(target.min)}%`,
              width: `${pos(target.max) - pos(target.min)}%`,
              borderColor: accent,
            }}
          />
          {/* current marker */}
          <div
            className="absolute top-[-2px] h-[calc(100%+4px)] w-1 rounded-full bg-white shadow"
            style={{ left: `calc(${pos(value)}% - 2px)` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[10px] font-semibold text-muted">
          <span>−1</span>
          <span>0</span>
          <span>+1</span>
        </div>
        <p className="mt-2 text-center text-[13px]">
          Reads as{' '}
          <span className="font-bold" style={{ color: currentZone.color }}>
            {currentZone.label}
          </span>
        </p>
      </div>

      {/* sliders */}
      <div className="mt-4 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:grid-cols-2">
        <Slider label="Red reflectance" value={red} onChange={setRed} tint="#f47171" />
        <Slider label="Near-infrared reflectance" value={nir} onChange={setNir} tint="#c98bff" />
      </div>

      {!locked ? (
        <button
          onClick={lockIn}
          className="mt-5 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-[#04122b] transition-transform hover:scale-[1.03]"
          style={{ backgroundColor: accent }}
        >
          <Icon name="star" className="h-4 w-4" />
          Lock in reading
        </button>
      ) : (
        <div
          className="mt-5 rounded-xl border p-4"
          style={{
            borderColor: inRange ? 'rgb(52 211 153 / 0.5)' : 'rgb(251 113 133 / 0.5)',
            backgroundColor: inRange ? 'rgb(52 211 153 / 0.12)' : 'rgb(251 113 133 / 0.12)',
          }}
        >
          <div className="flex items-center gap-2 text-sm font-bold text-ink">
            <Icon name={inRange ? 'star' : 'rays'} className="h-4 w-4" style={{ color: accent }} />
            {inRange ? `Locked in — that's ${target.label}!` : 'Off target —'}
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-ink/80">
            {target.hint}
            {!inRange &&
              ` Your NDVI of ${value.toFixed(2)} landed in "${currentZone.label}". Aim for ${target.min.toFixed(2)}–${target.max.toFixed(2)}.`}
          </p>
          <button
            onClick={next}
            className="mt-3 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-[#04122b] transition-transform hover:scale-[1.03]"
            style={{ backgroundColor: accent }}
          >
            {round + 1 >= total ? 'See results' : 'Next target'}
            <Icon name="chevron" className="h-4 w-4" />
          </button>
        </div>
      )}
    </GameShell>
  )
}
