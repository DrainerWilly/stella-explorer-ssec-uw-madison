import { useMemo, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Icon from '../Icon.jsx'
import GameShell from './GameShell.jsx'
import GameResults from './GameResults.jsx'
import { GAME_ACCENT } from '../../data/games.js'
import {
  PIXEL_SCENES,
  sampleScene,
  PIXEL_LEVEL_POINTS,
  PIXEL_LEVEL_SIZES,
  PIXEL_LEVEL_LABELS,
} from '../../data/pixelScenes.ts'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// The pixel image at the current resolution level.
function PixelImage({ scene, level }) {
  const size = PIXEL_LEVEL_SIZES[level]
  const cells = useMemo(() => sampleScene(scene, size), [scene, size])
  return (
    <div
      className="mx-auto grid aspect-square w-full max-w-[340px] overflow-hidden rounded-2xl border-2 border-white/15"
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
      role="img"
      aria-label={`Satellite image at ${PIXEL_LEVEL_LABELS[level]}`}
    >
      {cells.flat().map((color, i) => (
        <div key={`${size}-${i}`} style={{ backgroundColor: color }} />
      ))}
    </div>
  )
}

export default function PixelDetective({ game, onExit }) {
  const reduce = useReducedMotion()
  const accent = GAME_ACCENT[game.color]

  const scenes = useMemo(() => shuffle(PIXEL_SCENES), [])
  const maxTotal = scenes.length * PIXEL_LEVEL_POINTS[0]

  const [sceneIdx, setSceneIdx] = useState(0)
  const [level, setLevel] = useState(0)
  const [picked, setPicked] = useState(null) // option string picked this scene
  const [solvedPts, setSolvedPts] = useState(null) // points earned when solved (0 = revealed)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const scene = scenes[sceneIdx]
  const options = useMemo(() => shuffle(scene.options), [scene])
  const solved = solvedPts != null

  const guess = (opt) => {
    if (solved) return
    setPicked(opt)
    if (opt === scene.answer) {
      const pts = PIXEL_LEVEL_POINTS[level]
      setScore((s) => s + pts)
      setSolvedPts(pts)
    } else if (level < 2) {
      // wrong guess sharpens the image (and lowers the possible points)
      setLevel((l) => l + 1)
      setPicked(null)
    } else {
      // wrong at full resolution: reveal
      setSolvedPts(0)
    }
  }

  const sharpen = () => {
    if (!solved && level < 2) setLevel((l) => l + 1)
  }

  const next = () => {
    if (sceneIdx + 1 >= scenes.length) {
      setFinished(true)
      return
    }
    setSceneIdx((i) => i + 1)
    setLevel(0)
    setPicked(null)
    setSolvedPts(null)
  }

  const restart = () => {
    setSceneIdx(0)
    setLevel(0)
    setPicked(null)
    setSolvedPts(null)
    setScore(0)
    setFinished(false)
  }

  if (finished) {
    return (
      <GameShell game={game} onExit={onExit}>
        <GameResults
          game={game}
          score={score}
          total={maxTotal}
          onReplay={restart}
          onExit={onExit}
          detail="Pixel size is what scientists call spatial resolution: Landsat sees 30-meter pixels, weather satellites see kilometers. Sharper pixels show more detail but cover less ground."
        />
      </GameShell>
    )
  }

  return (
    <GameShell
      game={game}
      onExit={onExit}
      scoreChip={`Points ${score}`}
      progressPct={(sceneIdx / scenes.length) * 100}
    >
      <div className="text-center">
        <div className="font-game text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">
          Image {sceneIdx + 1} of {scenes.length} · {PIXEL_LEVEL_LABELS[level]}
        </div>
        <h2 className="mt-1 font-game text-xl font-extrabold text-white">
          What is the satellite looking at?
        </h2>
        {!solved && (
          <p className="mt-0.5 text-sm text-white/50">
            Guess now for <strong className="text-white">{PIXEL_LEVEL_POINTS[level]} points</strong>
            {level < 2 && ', or sharpen the image for fewer points'}
          </p>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${scene.id}-${level}`}
          initial={{ opacity: 0, scale: reduce ? 1 : 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="mt-4"
        >
          <PixelImage scene={scene} level={level} />
        </motion.div>
      </AnimatePresence>

      {/* zoom dots */}
      <div className="mt-2.5 flex items-center justify-center gap-1.5">
        {PIXEL_LEVEL_SIZES.map((s, i) => (
          <span
            key={s}
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: i <= level ? accent : 'rgb(255 255 255 / 0.15)' }}
          />
        ))}
        {!solved && level < 2 && (
          <button
            onClick={sharpen}
            className="ml-2 inline-flex items-center gap-1 rounded-full border-2 border-white/15 bg-white/5 px-3 py-1 font-game text-xs font-bold text-white/70 hover:border-white/30 hover:text-white"
          >
            <Icon name="rays" className="h-3.5 w-3.5" />
            Sharpen image
          </button>
        )}
      </div>

      {/* options */}
      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {options.map((opt) => {
          const isAnswer = opt === scene.answer
          let cls = 'border-white/10 bg-white/[0.05] text-white hover:border-white/30 hover:bg-white/[0.09]'
          if (solved && isAnswer) cls = 'border-emerald-400/60 bg-emerald-400/15 text-white'
          else if (solved) cls = 'border-white/10 bg-white/[0.02] text-white/40'
          else if (picked === opt) cls = 'border-rose-400/60 bg-rose-500/15 text-white'
          return (
            <button
              key={opt}
              onClick={() => guess(opt)}
              disabled={solved}
              className={`rounded-2xl border-2 px-4 py-3 text-left font-game text-sm font-bold transition-colors ${cls}`}
            >
              {opt}
              {solved && isAnswer && <Icon name="star" className="ml-2 inline h-4 w-4 align-[-3px] text-emerald-300" />}
            </button>
          )
        })}
      </div>

      {solved && (
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-2xl border-2 p-4"
          style={{ borderColor: `${accent}66`, backgroundColor: `${accent}12` }}
        >
          <div className="flex items-center gap-2 font-game text-base font-extrabold text-white">
            <Icon name={solvedPts > 0 ? 'star' : 'rays'} className="h-5 w-5" style={{ color: accent }} />
            {solvedPts > 0 ? `+${solvedPts} point${solvedPts > 1 ? 's' : ''}!` : 'Revealed!'}
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-white/80">{scene.explain}</p>
          <button
            onClick={next}
            className="mt-3 inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-game text-sm font-extrabold text-[#101426] transition-transform hover:scale-105"
            style={{ backgroundColor: accent }}
          >
            {sceneIdx + 1 >= scenes.length ? 'See results' : 'Next image'}
            <Icon name="chevron" className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </GameShell>
  )
}
