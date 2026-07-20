// @ts-nocheck
import { useMemo } from 'react'
import MultipleChoiceGame from './MultipleChoiceGame'
import { SPECTRAL_BANDS, SPECTRAL_SURFACES, GAME_ACCENT } from '../../data/games'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// SVG reflectance curve for a surface across the six bands.
function ReflectanceChart({ refl, accent }) {
  const W = 340
  const H = 170
  const padL = 34
  const padR = 12
  const padT = 12
  const padB = 30
  const plotW = W - padL - padR
  const plotH = H - padT - padB
  const x = (i) => padL + (i / (refl.length - 1)) * plotW
  const y = (v) => padT + (1 - v) * plotH
  const pts = refl.map((v, i) => `${x(i)},${y(v)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Reflectance curve">
      {/* gridlines */}
      {[0, 0.25, 0.5, 0.75, 1].map((g) => (
        <g key={g}>
          <line x1={padL} y1={y(g)} x2={W - padR} y2={y(g)} stroke="rgb(255 255 255 / 0.08)" />
          <text x={padL - 6} y={y(g) + 3} textAnchor="end" fontSize="8" fill="rgb(255 255 255 / 0.4)">
            {g * 100}
          </text>
        </g>
      ))}
      <text
        x={10}
        y={padT + plotH / 2}
        fontSize="8"
        fill="rgb(255 255 255 / 0.45)"
        transform={`rotate(-90 10 ${padT + plotH / 2})`}
        textAnchor="middle"
      >
        Reflectance %
      </text>

      {/* area + line */}
      <polyline
        points={`${padL},${y(0)} ${pts} ${W - padR},${y(0)}`}
        fill={`${accent}18`}
        stroke="none"
      />
      <polyline points={pts} fill="none" stroke={accent} strokeWidth="2.5" strokeLinejoin="round" />
      {refl.map((v, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(v)} r="3.2" fill={accent} />
          <text x={x(i)} y={H - 16} textAnchor="middle" fontSize="8" fill="rgb(255 255 255 / 0.55)">
            {SPECTRAL_BANDS[i].label}
          </text>
          <text x={x(i)} y={H - 6} textAnchor="middle" fontSize="7" fill="rgb(255 255 255 / 0.3)">
            {SPECTRAL_BANDS[i].nm}
          </text>
        </g>
      ))}
    </svg>
  )
}

export default function SpectralDetective({ game, onExit }) {
  const accent = GAME_ACCENT[game.color]
  const questions = useMemo(() => {
    const rounds = shuffle(SPECTRAL_SURFACES).slice(0, 5)
    return rounds.map((surface) => {
      const distractors = shuffle(SPECTRAL_SURFACES.filter((s) => s.id !== surface.id)).slice(0, 3)
      const opts = shuffle([surface, ...distractors])
      return {
        key: surface.id,
        visual: <ReflectanceChart refl={surface.refl} accent={accent} />,
        prompt: 'Which surface produced this reflectance signature?',
        options: opts.map((o) => o.name),
        correct: opts.findIndex((o) => o.id === surface.id),
        explain: surface.tell,
      }
    })
  }, [accent])

  return (
    <MultipleChoiceGame
      game={game}
      questions={questions}
      onExit={onExit}
      resultDetail="Reading spectral signatures is exactly how satellites like Landsat tell forests from cities, water from snow, and healthy crops from dry ones."
    />
  )
}
