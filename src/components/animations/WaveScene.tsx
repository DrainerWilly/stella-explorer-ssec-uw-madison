// @ts-nocheck
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'

// Coordinate space (responsive via viewBox).
const W = 600
const H = 360
const CY = 190 // equilibrium / center line
const DET_X = 470 // detector position

// Build the static sine path for the current amplitude/wavelength. Drawn from
// -wl to W so the scrolling group can translate right by up to one wavelength
// and still fully cover the viewport (seamless because the wave is periodic).
function buildPath(amp, wl) {
  const step = wl / 40
  let d = ''
  for (let x = -wl; x <= W + 1; x += step) {
    const y = CY - amp * Math.sin((x / wl) * 2 * Math.PI)
    d += `${d ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)} `
  }
  return d
}

export default function WaveScene({ amplitude, wavelength, isPlaying, showLabels, freqNorm, reduced }) {
  const waveRef = useRef(null)
  const markerRef = useRef(null)
  const phaseRef = useRef(0)
  const wlRef = useRef(wavelength)
  const speedRef = useRef(0)
  const crossRef = useRef(0)
  const [pulseId, setPulseId] = useState(0)
  const [cycles, setCycles] = useState(0)

  wlRef.current = wavelength
  speedRef.current = 28 + freqNorm * 130 // px/sec: shorter wavelength scrolls faster

  // static geometry recomputed only when amplitude/wavelength change
  const { path, particles, anchorCrestX } = useMemo(() => {
    const wl = wavelength
    const k = Math.round((300 - wl / 2 - wl / 4) / wl)
    const crestX = wl / 4 + k * wl // a crest, positioned so the λ-arrow centers ~300
    const pts = []
    for (let x = -wl / 2; x <= W; x += wl / 2.5) {
      pts.push({ x, y: CY - amplitude * Math.sin((x / wl) * 2 * Math.PI) })
    }
    return { path: buildPath(amplitude, wavelength), particles: pts, anchorCrestX: crestX }
  }, [amplitude, wavelength])

  const crestY = CY - amplitude
  const troughX = anchorCrestX + wavelength / 2

  // animation loop: imperatively translates the wave + marker groups (1-2 attr
  // writes/frame), so the React tree does not re-render at 60fps.
  useEffect(() => {
    if (reduced) {
      // reduced motion → clean static baseline
      waveRef.current?.setAttribute('transform', 'translate(0,0)')
      markerRef.current?.setAttribute('transform', 'translate(0,0)')
      return
    }
    if (!isPlaying) return // paused → freeze in place (keep last transform)
    let raf
    let last = performance.now()
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const wl = wlRef.current
      phaseRef.current += speedRef.current * dt
      const t = ((phaseRef.current % wl) + wl) % wl
      waveRef.current?.setAttribute('transform', `translate(${t.toFixed(2)},0)`)
      // markers ride a crest but stay centered (±wl/2, wraps seamlessly)
      const shift = ((t + wl / 2) % wl) - wl / 2
      markerRef.current?.setAttribute('transform', `translate(${shift.toFixed(2)},0)`)
      // detector crossing → pulse + cycle counter
      const cross = Math.floor((phaseRef.current - (DET_X - wl / 4)) / wl)
      if (cross !== crossRef.current) {
        crossRef.current = cross
        setPulseId((p) => p + 1)
        setCycles((c) => c + 1)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [isPlaying, reduced])

  return (
    <div className="overflow-hidden rounded-panel shadow-soft">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Animated wave simulation">
        <defs>
          <linearGradient id="wsBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#eef3ff" />
            <stop offset="100%" stopColor="#fdeef5" />
          </linearGradient>
          <linearGradient id="wsWave" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="55%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <pattern id="wsGrid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M24 0H0V24" fill="none" stroke="#64748b" strokeOpacity="0.08" strokeWidth="1" />
          </pattern>
          <filter id="wsGlow" x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <marker id="wsArrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M1 1 L7 4 L1 7 z" fill="#475569" />
          </marker>
        </defs>

        {/* background */}
        <rect x="0" y="0" width={W} height={H} fill="url(#wsBg)" />
        <rect x="0" y="0" width={W} height={H} fill="url(#wsGrid)" />

        {/* equilibrium line */}
        <line x1="0" y1={CY} x2={W} y2={CY} stroke="#475569" strokeOpacity="0.45" strokeDasharray="6 6" />
        {showLabels && (
          <text x={W - 8} y={CY - 6} textAnchor="end" fontSize="11" fontWeight="700" className="fill-slate-500">
            Equilibrium
          </text>
        )}

        {/* wave direction (fixed) */}
        {showLabels && (
          <g>
            <line x1="24" y1="30" x2="74" y2="30" stroke="#475569" strokeWidth="2" markerEnd="url(#wsArrow)" />
            <text x="24" y="22" fontSize="11" fontWeight="700" className="fill-slate-500">Wave direction</text>
          </g>
        )}

        {/* scrolling wave + particles */}
        <g ref={waveRef}>
          <path d={path} fill="none" stroke="url(#wsWave)" strokeWidth="5" strokeLinecap="round" filter="url(#wsGlow)" opacity="0.95" />
          {!reduced &&
            particles.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="3.2" fill="#fff" stroke="#6366f1" strokeWidth="1.5" />
            ))}
        </g>

        {/* measurement markers: ride the wave, stay centered */}
        <g ref={markerRef}>
          {/* wavelength arrow (crest → crest) */}
          <line x1={anchorCrestX} y1={crestY - 16} x2={troughX + wavelength / 2} y2={crestY - 16} stroke="#7c3aed" strokeWidth="1.6" markerStart="url(#wsArrow)" markerEnd="url(#wsArrow)" />
          <line x1={anchorCrestX} y1={crestY} x2={anchorCrestX} y2={crestY - 20} stroke="#7c3aed" strokeOpacity="0.4" strokeWidth="1" />
          <line x1={anchorCrestX + wavelength} y1={crestY} x2={anchorCrestX + wavelength} y2={crestY - 20} stroke="#7c3aed" strokeOpacity="0.4" strokeWidth="1" />
          {showLabels && (
            <text x={anchorCrestX + wavelength / 2} y={crestY - 22} textAnchor="middle" fontSize="11" fontWeight="800" className="fill-violet-700">
              Wavelength
            </text>
          )}

          {/* amplitude arrow (equilibrium → crest) */}
          <line x1={anchorCrestX} y1={CY} x2={anchorCrestX} y2={crestY} stroke="#0ea5e9" strokeWidth="1.6" markerStart="url(#wsArrow)" markerEnd="url(#wsArrow)" />
          {showLabels && (
            <text x={anchorCrestX + 8} y={(CY + crestY) / 2} fontSize="11" fontWeight="800" className="fill-sky-600">
              Amplitude
            </text>
          )}

          {/* crest marker */}
          <motion.circle cx={anchorCrestX} cy={crestY} r="6" fill="#6366f1" animate={reduced ? {} : { scale: [1, 1.35, 1] }} transition={{ duration: 1.4, repeat: Infinity }} style={{ transformOrigin: `${anchorCrestX}px ${crestY}px` }} />
          {showLabels && (
            <text x={anchorCrestX} y={crestY - 30} textAnchor="middle" fontSize="11" fontWeight="800" className="fill-indigo-600">
              Crest
            </text>
          )}

          {/* trough marker */}
          <motion.circle cx={troughX} cy={CY + amplitude} r="6" fill="#a855f7" animate={reduced ? {} : { scale: [1, 1.35, 1] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0.5 }} style={{ transformOrigin: `${troughX}px ${CY + amplitude}px` }} />
          {showLabels && (
            <text x={troughX} y={CY + amplitude + 22} textAnchor="middle" fontSize="11" fontWeight="800" className="fill-purple-600">
              Trough
            </text>
          )}
        </g>

        {/* detector (fixed) + pulse */}
        <line x1={DET_X} y1="40" x2={DET_X} y2={H - 30} stroke="#e0533d" strokeWidth="2" strokeDasharray="4 4" />
        <motion.circle key={pulseId} cx={DET_X} cy={CY} r="6" fill="none" stroke="#e0533d" strokeWidth="2" initial={{ r: 6, opacity: 0.7 }} animate={{ r: 44, opacity: 0 }} transition={{ duration: 0.8 }} />
        {showLabels && (
          <text x={DET_X} y="32" textAnchor="middle" fontSize="11" fontWeight="800" className="fill-[#e0533d]">
            Detector
          </text>
        )}
        <g>
          <rect x={DET_X - 40} y={H - 26} width="80" height="20" rx="10" fill="#ffffff" opacity="0.9" />
          <text x={DET_X} y={H - 12} textAnchor="middle" fontSize="11" fontWeight="800" className="fill-slate-700">
            {cycles} cycles
          </text>
        </g>
        <text x="12" y={H - 12} fontSize="10" fontWeight="600" className="fill-slate-500">
          Wave cycles passing the detector show frequency.
        </text>
      </svg>
    </div>
  )
}
