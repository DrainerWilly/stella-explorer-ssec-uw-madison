// @ts-nocheck
import { motion, AnimatePresence } from 'framer-motion'
import { SURFACES, MATERIALS, MEDIA, PAIRS } from '../../data/waveBehaviors'

const W = 400
const H = 240
const PHOTON = '#f59e0b'

// A photon traveling through a list of points (SVG cx/cy keyframes).
function Photon({ pts, playing, dur = 2.4, delay = 0, r = 3.4, color = PHOTON, fade = false }) {
  const xs = pts.map((p) => p.x)
  const ys = pts.map((p) => p.y)
  if (!playing) return <circle cx={xs[0]} cy={ys[0]} r={r} fill={color} opacity="0.9" />
  return (
    <motion.circle
      r={r}
      fill={color}
      initial={false}
      animate={fade ? { cx: xs, cy: ys, opacity: [0.9, 0.9, 0] } : { cx: xs, cy: ys, opacity: 0.9 }}
      transition={{ duration: dur, delay, repeat: Infinity, ease: 'linear' }}
    />
  )
}

function Label({ x, y, children, anchor = 'middle', show }) {
  if (!show) return null
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize="11" fontWeight="700" className="fill-slate-600">
      {children}
    </text>
  )
}

function Detector({ show }) {
  return (
    <g>
      <rect x={W - 26} y={H / 2 - 18} width="16" height="36" rx="4" fill="#475569" />
      <circle cx={W - 18} cy={H / 2} r="4" fill="#e0533d" />
      <Label x={W - 18} y={H / 2 + 32} show={show}>Sensor</Label>
    </g>
  )
}

export default function BehaviorScene({ behavior, params, playing, showLabels, advanced, reduced }) {
  const p = { params, playing: playing && !reduced, showLabels, advanced }
  return (
    <div className="overflow-hidden rounded-panel shadow-soft">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${behavior} scene`}>
        <defs>
          <linearGradient id="bsBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#eef3ff" />
            <stop offset="100%" stopColor="#fdeef5" />
          </linearGradient>
          <pattern id="bsGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke="#64748b" strokeOpacity="0.07" strokeWidth="1" />
          </pattern>
          <filter id="bsGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <marker id="bsArrow" markerWidth="8" markerHeight="8" refX="5" refY="4" orient="auto">
            <path d="M1 1 L7 4 L1 7 z" fill="#f59e0b" />
          </marker>
        </defs>

        <rect x="0" y="0" width={W} height={H} fill="url(#bsBg)" />
        <rect x="0" y="0" width={W} height={H} fill="url(#bsGrid)" />

        <AnimatePresence mode="wait">
          <motion.g
            key={behavior}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {behavior === 'reflection' && <Reflection {...p} />}
            {behavior === 'absorption' && <Absorption {...p} />}
            {behavior === 'transmission' && <Transmission {...p} />}
            {behavior === 'refraction' && <Refraction {...p} />}
            {behavior === 'scattering' && <Scattering {...p} />}
            {behavior === 'diffraction' && <Diffraction {...p} />}
          </motion.g>
        </AnimatePresence>
      </svg>
    </div>
  )
}

/* ----------------------------------------------------------- Reflection */
function Reflection({ params, playing, showLabels, advanced }) {
  const surf = SURFACES[params.surface] ?? SURFACES.mirror
  const hit = { x: 200, y: 168 }
  const inStart = { x: 56, y: 56 }
  const outEnd = { x: 344, y: 56 }
  const reflOpacity = 0.3 + (surf.reflected / 10) * 0.7

  return (
    <g>
      {/* surface */}
      <rect x="110" y="168" width="180" height="10" rx="3" fill={surf.color} />
      <rect x="110" y="168" width="180" height="3" rx="2" fill="#ffffff" opacity="0.5" />
      {/* normal */}
      <line x1={hit.x} y1={hit.y} x2={hit.x} y2="40" stroke="#475569" strokeOpacity="0.4" strokeDasharray="4 4" />
      {/* beams */}
      <line x1={inStart.x} y1={inStart.y} x2={hit.x} y2={hit.y} stroke={PHOTON} strokeWidth="2.5" filter="url(#bsGlow)" />
      <line x1={hit.x} y1={hit.y} x2={outEnd.x} y2={outEnd.y} stroke={PHOTON} strokeWidth="2.5" opacity={reflOpacity} filter="url(#bsGlow)" />
      {/* hit glow */}
      <motion.circle cx={hit.x} cy={hit.y} r="6" fill="#fff7d6" animate={playing ? { scale: [1, 1.6, 1], opacity: [0.9, 0.4, 0.9] } : {}} transition={{ duration: 1.4, repeat: Infinity }} style={{ transformOrigin: `${hit.x}px ${hit.y}px` }} />
      {/* photons */}
      {[0, 0.8, 1.6].map((d) => (
        <Photon key={d} pts={[inStart, hit, outEnd]} playing={playing} delay={d} dur={2.4} color={PHOTON} />
      ))}

      {advanced && (
        <>
          <path d="M200 168 A 40 40 0 0 0 173 132" fill="none" stroke="#7c3aed" strokeWidth="1.3" />
          <path d="M200 168 A 40 40 0 0 1 227 132" fill="none" stroke="#7c3aed" strokeWidth="1.3" />
          <text x="200" y="120" textAnchor="middle" fontSize="10" fontWeight="800" className="fill-violet-700">θi = θr</text>
        </>
      )}

      <Label x={inStart.x + 6} y={inStart.y - 6} anchor="start" show={showLabels}>Incoming light</Label>
      <Label x={outEnd.x - 6} y={outEnd.y - 6} anchor="end" show={showLabels}>Reflected light</Label>
      <Label x="200" y="196" show={showLabels}>{surf.label}</Label>
    </g>
  )
}

/* ----------------------------------------------------------- Absorption */
function Absorption({ params, playing, showLabels }) {
  const mat = MATERIALS[params.material] ?? MATERIALS.pavement
  const blockX = 240
  const enter = { x: blockX, y: 130 }
  const inStart = { x: 20, y: 130 }
  const heatFill = (mat.heat / 10) * 70

  return (
    <g>
      {/* material block */}
      <rect x={blockX} y="96" width="90" height="86" rx="8" fill={mat.color} />
      {/* incoming beam */}
      <line x1={inStart.x} y1="130" x2={blockX} y2="130" stroke={PHOTON} strokeWidth="2.5" filter="url(#bsGlow)" />
      {[0, 0.7, 1.4, 2.1].map((d) => (
        <Photon key={d} pts={[inStart, { x: blockX - 6, y: 130 }, enter]} playing={playing} delay={d} dur={2.2} fade />
      ))}
      {/* heat squiggles rising */}
      {[260, 285, 310].map((x, i) => (
        <motion.path
          key={x}
          d={`M${x} 96 q -6 -10 0 -20 q 6 -10 0 -20`}
          fill="none"
          stroke="#e0533d"
          strokeWidth="2"
          strokeLinecap="round"
          animate={playing ? { y: [0, -14], opacity: [0, 0.9, 0] } : { opacity: 0.5 }}
          transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.5 }}
        />
      ))}
      {/* thermometer */}
      <rect x="356" y="70" width="12" height="92" rx="6" fill="#e2e8f0" />
      <motion.rect x="356" width="12" rx="6" fill="#e0533d" initial={false} animate={{ height: heatFill, y: 162 - heatFill }} transition={{ type: 'spring', stiffness: 120, damping: 18 }} />
      <circle cx="362" cy="168" r="9" fill="#e0533d" />

      <Label x={inStart.x} y="120" anchor="start" show={showLabels}>Incoming light</Label>
      <Label x={blockX + 45} y="176" show={showLabels}>{mat.label}</Label>
      <Label x="285" y="44" show={showLabels}>Heat released</Label>
    </g>
  )
}

/* --------------------------------------------------------- Transmission */
function Transmission({ params, playing, showLabels }) {
  const med = MEDIA[params.medium] ?? MEDIA.air
  const passFrac = med.transmitted / 10
  const inStart = { x: 16, y: 120 }
  const blockL = { x: 170, y: 120 }
  const blockR = { x: 250, y: 120 }
  const out = { x: W - 30, y: 120 }
  const photons = [0, 0.5, 1.0, 1.5, 2.0]

  return (
    <g>
      {/* translucent material */}
      <rect x="170" y="70" width="80" height="100" rx="10" fill={med.color} opacity="0.75" stroke="#94a3b8" strokeOpacity="0.4" />
      <line x1={inStart.x} y1="120" x2={blockL.x} y2="120" stroke={PHOTON} strokeWidth="2.5" filter="url(#bsGlow)" />
      <line x1={blockR.x} y1="120" x2={out.x} y2="120" stroke={PHOTON} strokeWidth="2.5" opacity={0.25 + passFrac * 0.7} filter="url(#bsGlow)" />
      {photons.map((d, i) => {
        const passes = i / photons.length < passFrac
        return (
          <Photon
            key={d}
            pts={passes ? [inStart, blockL, blockR, out] : [inStart, blockL, { x: 210, y: 120 }]}
            playing={playing}
            delay={d}
            dur={passes ? 2.8 : 1.8}
            fade={!passes}
            color={passes ? PHOTON : '#94a3b8'}
          />
        )
      })}
      <Detector show={showLabels} />
      <Label x={inStart.x} y="108" anchor="start" show={showLabels}>Incoming light</Label>
      <Label x="210" y="62" show={showLabels}>{med.label}</Label>
      <Label x={out.x - 4} y="108" anchor="end" show={showLabels}>Transmitted</Label>
    </g>
  )
}

/* ----------------------------------------------------------- Refraction */
function Refraction({ params, playing, showLabels }) {
  const pr = PAIRS[params.pair] ?? PAIRS.water
  const boundaryY = 120
  const hit = { x: 200, y: boundaryY }
  const inStart = { x: 70, y: 28 }
  // higher bend → more vertical (toward normal)
  const refEnd = { x: 200 + (1 - pr.bend / 10) * 150, y: 224 }

  return (
    <g>
      {/* media */}
      <rect x="0" y="0" width={W} height={boundaryY} fill="#eaf4ff" />
      <rect x="0" y={boundaryY} width={W} height={H - boundaryY} fill={pr.color} />
      <line x1="0" y1={boundaryY} x2={W} y2={boundaryY} stroke="#94a3b8" strokeOpacity="0.5" />
      {/* normal */}
      <line x1={hit.x} y1="40" x2={hit.x} y2="200" stroke="#475569" strokeOpacity="0.4" strokeDasharray="4 4" />
      {/* beams */}
      <line x1={inStart.x} y1={inStart.y} x2={hit.x} y2={hit.y} stroke={PHOTON} strokeWidth="2.5" filter="url(#bsGlow)" />
      <line x1={hit.x} y1={hit.y} x2={refEnd.x} y2={refEnd.y} stroke={PHOTON} strokeWidth="2.5" filter="url(#bsGlow)" />
      {/* ripple at boundary */}
      <motion.circle cx={hit.x} cy={hit.y} r="5" fill="none" stroke="#3b7fd6" strokeWidth="1.6" animate={playing ? { r: [4, 16], opacity: [0.8, 0] } : {}} transition={{ duration: 1.4, repeat: Infinity }} />
      {/* photons: slow in lower medium (times) */}
      {[0, 1.2].map((d) => (
        <motion.circle
          key={d}
          r="3.4"
          fill={PHOTON}
          initial={false}
          animate={playing ? { cx: [inStart.x, hit.x, refEnd.x], cy: [inStart.y, hit.y, refEnd.y] } : {}}
          transition={{ duration: 3, times: [0, 0.45, 1], delay: d, repeat: Infinity, ease: 'linear' }}
        />
      ))}
      <Label x={inStart.x} y={inStart.y - 6} anchor="start" show={showLabels}>Incoming light</Label>
      <Label x="12" y="20" anchor="start" show={showLabels}>Air</Label>
      <Label x="12" y={boundaryY + 22} anchor="start" show={showLabels}>{pr.label.replace('Air → ', '')}</Label>
      <Label x={refEnd.x + 4} y={refEnd.y - 6} anchor="start" show={showLabels}>Bent light</Label>
    </g>
  )
}

/* ----------------------------------------------------------- Scattering */
function Scattering({ params, playing, showLabels }) {
  const density = Math.round(params.density ?? 5)
  const isBlue = (params.scatterColor ?? 'blue') === 'blue'
  const color = isBlue ? '#3b82f6' : '#ef4444'
  const center = { x: 210, y: 120 }
  const rayCount = isBlue ? Math.min(10, 4 + density) : Math.max(3, Math.round((4 + density) / 2))
  const rays = Array.from({ length: rayCount }, (_, i) => {
    const ang = -90 + (i / (rayCount - 1)) * 200 - 10
    const rad = (ang * Math.PI) / 180
    return { x: center.x + Math.cos(rad) * 120, y: center.y + Math.sin(rad) * 120, ang }
  })
  // particle field dots
  const dots = Array.from({ length: 6 + density }, (_, i) => ({
    x: 150 + ((i * 53) % 110),
    y: 70 + ((i * 37) % 100),
  }))

  return (
    <g>
      <rect x="148" y="64" width="120" height="112" rx="10" fill="#ffffff" opacity="0.25" />
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r="2.4" fill="#94a3b8" opacity="0.7" />
      ))}
      {/* incoming */}
      <line x1="16" y1="120" x2={center.x} y2="120" stroke={PHOTON} strokeWidth="2.5" filter="url(#bsGlow)" />
      {[0, 0.8].map((d) => (
        <Photon key={d} pts={[{ x: 16, y: 120 }, center]} playing={playing} delay={d} dur={1.6} />
      ))}
      {/* scattered rays + photons */}
      {rays.map((r, i) => (
        <g key={i}>
          <line x1={center.x} y1={center.y} x2={r.x} y2={r.y} stroke={color} strokeWidth="1.4" opacity="0.35" />
          <Photon pts={[center, { x: r.x, y: r.y }]} playing={playing} delay={(i % 4) * 0.4} dur={1.6} r={2.8} color={color} fade />
        </g>
      ))}
      <Label x="16" y="108" anchor="start" show={showLabels}>Incoming sunlight</Label>
      <Label x="208" y="190" show={showLabels}>Air particles</Label>
      <Label x="208" y="40" show={showLabels}>Scattered light</Label>
    </g>
  )
}

/* ---------------------------------------------------------- Diffraction */
function Diffraction({ params, playing, showLabels }) {
  const slit = params.slitWidth ?? 40 // 16..90
  const wl = params.waveLen ?? 5 // 1..10
  const barX = 200
  const cy = 120
  const top = cy - slit / 2
  const bot = cy + slit / 2
  // more spread for smaller slit / longer wavelength
  const arcs = [0, 1, 2]

  return (
    <g>
      {/* incoming wavefronts (march toward slit) */}
      <motion.g
        animate={playing ? { x: [0, 26] } : {}}
        transition={{ duration: 1.1 + wl * 0.12, repeat: Infinity, ease: 'linear' }}
      >
        {[-30, -4, 22, 48, 74, 100, 126, 152, 178].map((x) => (
          <line key={x} x1={x} y1="30" x2={x} y2="210" stroke="#38bdf8" strokeWidth="2" opacity="0.5" />
        ))}
      </motion.g>
      {/* barrier with slit */}
      <rect x={barX - 4} y="20" width="8" height={top - 20} fill="#475569" />
      <rect x={barX - 4} y={bot} width="8" height={220 - bot} fill="#475569" />
      {/* diffracted expanding arcs */}
      <g style={{ transformOrigin: `${barX}px ${cy}px` }}>
        {arcs.map((i) => (
          <motion.path
            key={i}
            d={`M ${barX} ${cy - 70} A 70 70 0 0 1 ${barX} ${cy + 70}`}
            fill="none"
            stroke="#6366f1"
            strokeWidth="2"
            style={{ transformOrigin: `${barX}px ${cy}px` }}
            animate={playing ? { scale: [0.18, 1], opacity: [0.9, 0] } : { scale: 0.6, opacity: 0.5 }}
            transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.73, ease: 'easeOut' }}
          />
        ))}
      </g>
      {/* slit highlight */}
      <line x1={barX} y1={top} x2={barX} y2={bot} stroke="#fbbf24" strokeWidth="3" />

      <Label x="60" y="24" anchor="start" show={showLabels}>Incoming wave</Label>
      <Label x={barX} y={top - 8} show={showLabels}>Opening</Label>
      <Label x={barX + 76} y="40" show={showLabels}>Diffracted wave</Label>
    </g>
  )
}
