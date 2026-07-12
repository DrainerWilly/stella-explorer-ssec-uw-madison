import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Icon from '../Icon.jsx'
import GameShell from './GameShell.jsx'
import GameResults from './GameResults.jsx'
import { GAME_ACCENT, MATCH_PAIRS } from '../../data/games.js'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Build the 12-card deck: a satellite card + a job card for every pair.
function buildDeck() {
  const cards = MATCH_PAIRS.flatMap((p) => [
    { key: `${p.id}-sat`, pairId: p.id, kind: 'sat', emoji: p.emoji, text: p.satellite },
    { key: `${p.id}-job`, pairId: p.id, kind: 'job', emoji: p.emoji, text: p.job },
  ])
  return shuffle(cards)
}

// Star rating from flip efficiency: a perfect memory needs 12 flips (6 turns).
function scoreFromMoves(moves) {
  if (moves <= 16) return 6
  if (moves <= 20) return 5
  if (moves <= 24) return 4
  if (moves <= 30) return 3
  if (moves <= 38) return 2
  return 1
}

export default function SatelliteMatch({ game, onExit }) {
  const accent = GAME_ACCENT[game.color]
  const [deck, setDeck] = useState(buildDeck)
  const [faceUp, setFaceUp] = useState([]) // keys of the 1-2 currently flipped cards
  const [matched, setMatched] = useState([]) // pairIds found
  const [moves, setMoves] = useState(0)
  const [finished, setFinished] = useState(false)

  const lock = faceUp.length === 2

  const flip = (card) => {
    if (lock || finished) return
    if (faceUp.includes(card.key) || matched.includes(card.pairId)) return
    const next = [...faceUp, card.key]
    setFaceUp(next)
    setMoves((m) => m + 1)
    if (next.length === 2) {
      const [a, b] = next.map((k) => deck.find((c) => c.key === k))
      if (a.pairId === b.pairId && a.kind !== b.kind) {
        // a match: keep them up
        setTimeout(() => {
          setMatched((ms) => [...ms, a.pairId])
          setFaceUp([])
        }, 550)
      } else {
        setTimeout(() => setFaceUp([]), 900)
      }
    }
  }

  // All pairs found → results (small delay so the last match is seen).
  useEffect(() => {
    if (matched.length === MATCH_PAIRS.length && !finished) {
      const t = setTimeout(() => setFinished(true), 700)
      return () => clearTimeout(t)
    }
  }, [matched, finished])

  const restart = () => {
    setDeck(buildDeck())
    setFaceUp([])
    setMatched([])
    setMoves(0)
    setFinished(false)
  }

  const pairText = useMemo(() => {
    if (matched.length === 0) return null
    const last = MATCH_PAIRS.find((p) => p.id === matched[matched.length - 1])
    return `${last.satellite} ${last.emoji} ${last.job.toLowerCase()}`
  }, [matched])

  if (finished) {
    return (
      <GameShell game={game} onExit={onExit}>
        <GameResults
          game={game}
          score={scoreFromMoves(moves)}
          total={6}
          onReplay={restart}
          onExit={onExit}
          detail={`You matched all ${MATCH_PAIRS.length} missions in ${moves} flips! Every one is a real spacecraft (plus STELLA, the instrument you can build yourself).`}
        />
      </GameShell>
    )
  }

  return (
    <GameShell
      game={game}
      onExit={onExit}
      scoreChip={`Pairs ${matched.length} / ${MATCH_PAIRS.length}`}
      progressPct={(matched.length / MATCH_PAIRS.length) * 100}
    >
      <div className="flex items-center justify-between">
        <p className="font-game text-sm font-bold text-white/60">
          Flips: <span className="text-white">{moves}</span>
        </p>
        {pairText && (
          <p className="font-game text-sm font-bold" style={{ color: accent }}>
            {pairText} ✓
          </p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {deck.map((card) => {
          const isUp = faceUp.includes(card.key) || matched.includes(card.pairId)
          const isMatched = matched.includes(card.pairId)
          return (
            <motion.button
              key={card.key}
              onClick={() => flip(card)}
              disabled={isUp}
              aria-label={isUp ? card.text : 'Hidden card'}
              className="relative aspect-[3/3.4] [perspective:600px]"
              whileTap={{ scale: 0.96 }}
            >
              <motion.div
                className="relative h-full w-full [transform-style:preserve-3d]"
                animate={{ rotateY: isUp ? 180 : 0 }}
                transition={{ duration: 0.45 }}
              >
                {/* back */}
                <div className="absolute inset-0 grid place-items-center rounded-2xl border-2 border-white/15 bg-gradient-to-br from-[#182552] to-[#0d1533] [backface-visibility:hidden]">
                  <Icon name="star" className="h-6 w-6 text-white/25" />
                </div>
                {/* face */}
                <div
                  className={`absolute inset-0 flex [transform:rotateY(180deg)] flex-col items-center justify-center gap-1 rounded-2xl border-2 p-2 text-center [backface-visibility:hidden] ${
                    isMatched ? 'border-emerald-400/70 bg-emerald-400/15' : 'border-white/25 bg-white/[0.08]'
                  }`}
                >
                  <span className="text-2xl" aria-hidden="true">{card.emoji}</span>
                  <span
                    className={`font-game font-extrabold leading-tight text-white ${
                      card.kind === 'sat' ? 'text-sm' : 'text-[11px] font-bold'
                    }`}
                  >
                    {card.text}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-white/40">
                    {card.kind === 'sat' ? 'Satellite' : 'Its job'}
                  </span>
                </div>
              </motion.div>
            </motion.button>
          )
        })}
      </div>

      <p className="mt-4 text-center text-[11px] text-white/35">
        Match each satellite with the job it does. Fewer flips = more stars!
      </p>
    </GameShell>
  )
}
