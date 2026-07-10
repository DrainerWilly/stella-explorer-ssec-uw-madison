import { useState } from 'react'

// pass = reaches the ground · partial = some gets through · blocked = stopped high up
const REGIONS = [
  { id: 'radio', name: 'Radio', color: '#c94f4f', status: 'pass', text: 'Radio waves pass straight through: this is the "radio window" that lets radio telescopes work from the ground.' },
  { id: 'microwave', name: 'Microwave', color: '#e08a3f', status: 'partial', text: 'Many microwaves get through (even through clouds), but water vapor absorbs some. Radar satellites use this.' },
  { id: 'infrared', name: 'Infrared', color: '#d6c23f', status: 'partial', text: 'Only certain infrared "windows" pass; water vapor and CO₂ absorb the rest.' },
  { id: 'visible', name: 'Visible', color: '#46c25a', status: 'pass', text: 'Visible light passes through the "optical window", the same light our eyes and cameras use.' },
  { id: 'uv', name: 'Ultraviolet', color: '#3f9bd6', status: 'blocked', text: 'Mostly absorbed by the ozone layer, which is good, because UV is harmful.' },
  { id: 'xray', name: 'X-ray', color: '#4a6fe0', status: 'blocked', text: 'Blocked high in the atmosphere, so X-ray telescopes must observe from space.' },
  { id: 'gamma', name: 'Gamma ray', color: '#7d5bd6', status: 'blocked', text: 'Blocked high up: gamma-ray observatories have to orbit above the atmosphere.' },
]

const STATUS_LABEL = { pass: 'Mostly passes through', partial: 'Partially passes', blocked: 'Mostly blocked' }
const ATM_TOP = 72
const GROUND = 150
const BEAMS_X = [80, 160, 240]

export default function AtmosphericWindowsAnimation() {
  const [id, setId] = useState('visible')
  const r = REGIONS.find((x) => x.id === id)
  const stopY = r.status === 'blocked' ? ATM_TOP : GROUND
  const dist = stopY - 14

  return (
    <div className="flex flex-col gap-4">
      {/* region selector */}
      <div className="flex flex-wrap gap-2">
        {REGIONS.map((x) => (
          <button
            key={x.id}
            onClick={() => setId(x.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
              x.id === id ? 'bg-ink text-app shadow-soft' : 'bg-cream text-ink/70 hover:text-ink'
            }`}
          >
            {x.name}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl">
        <svg viewBox="0 0 320 200" className="h-auto w-full" role="img" aria-label={`${r.name} reaching Earth`}>
          {/* space, atmosphere, earth */}
          <rect x="0" y="0" width="320" height={ATM_TOP} fill="#0c0f16" />
          <rect x="0" y={ATM_TOP} width="320" height={GROUND - ATM_TOP} fill="#7fb2e6" fillOpacity="0.5" />
          <rect x="0" y={GROUND} width="320" height={200 - GROUND} fill="#4caf6b" />
          {[30, 90, 150, 210, 270].map((cx) => (
            <circle key={cx} cx={cx} cy={(cx % 7) + 20} r="1.4" fill="#fff" opacity="0.6" />
          ))}
          <text x="8" y="16" fontSize="9" fontWeight="700" fill="#fff" opacity="0.7">SPACE</text>
          <text x="8" y={ATM_TOP + 16} fontSize="9" fontWeight="700" fill="#17171c" opacity="0.55">ATMOSPHERE</text>

          {/* beams */}
          {BEAMS_X.map((x, i) => (
            <g key={x}>
              <line x1={x} y1="14" x2={x} y2={stopY} stroke={r.color} strokeWidth="2.5" strokeOpacity={r.status === 'partial' ? 0.5 : 0.85} strokeDasharray={r.status === 'partial' ? '5 4' : undefined} />
              {/* falling photon */}
              <circle cx={x} cy="14" r="3.5" fill={r.color} className="motion-safe:animate-beam-fall" style={{ ['--beam-dist']: `${dist}px`, animationDelay: `${i * 0.5}s` }} />
              {/* blocked burst at atmosphere top */}
              {r.status === 'blocked' && (
                <text x={x} y={ATM_TOP + 4} textAnchor="middle" fontSize="13" fill={r.color}>✸</text>
              )}
            </g>
          ))}
        </svg>
      </div>

      <div className="rounded-2xl bg-cream p-4">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: r.color }} />
          <span className="text-sm font-extrabold text-ink">{r.name}:</span>
          <span className="text-sm font-bold text-muted">{STATUS_LABEL[r.status]}</span>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{r.text}</p>
      </div>

      <p className="rounded-2xl bg-app px-4 py-3 text-xs font-semibold leading-relaxed text-ink/70 ring-1 ring-ink/5">
        Earth's atmosphere protects life, but it also blocks some wavelengths. That is why many NASA
        instruments observe from space.
      </p>
    </div>
  )
}
