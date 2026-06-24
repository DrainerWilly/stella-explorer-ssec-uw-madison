import { motion } from 'framer-motion'
import { MODE_COLORS, MODE_NOTES, getMode } from '../../data/visibleInfrared.js'

const W = 400
const H = 260

// clickable bounding boxes per inspector object
const BOX = {
  water: { x: 8, y: 196, w: 108, h: 46 },
  vegHealthy: { x: 126, y: 90, w: 52, h: 64 },
  vegDry: { x: 182, y: 106, w: 38, h: 48 },
  soil: { x: 232, y: 204, w: 74, h: 38 },
  pavement: { x: 250, y: 200, w: 60, h: 60 },
  roof: { x: 306, y: 92, w: 70, h: 62 },
}

const tr = { transition: 'fill .5s ease' }

// Paints the whole landscape for one view mode.
function SceneLayer({ mode, reduced }) {
  const c = MODE_COLORS[mode]
  const glow = mode === 'nir' ? 'url(#nirGlow)' : undefined
  return (
    <g>
      {/* sky + ground */}
      <rect x="0" y="0" width={W} height="152" fill={c.sky} style={tr} />
      <rect x="0" y="150" width={W} height={H - 150} fill={c.soil} style={tr} />
      <rect x="0" y="150" width={W} height="16" fill={c.grass} style={tr} />
      {/* sun */}
      <circle cx="346" cy="34" r="18" fill={c.sun} style={tr} />

      {/* water */}
      <ellipse cx="62" cy="219" rx="54" ry="21" fill={c.water} style={tr} />

      {/* healthy tree */}
      <rect x="148" y="138" width="7" height="14" rx="2" fill="#7a4a2a" />
      <circle cx="151" cy="118" r="22" fill={c.vegHealthy} style={tr} filter={glow} />

      {/* dry tree */}
      <rect x="198" y="138" width="6" height="14" rx="2" fill="#7a5a3a" />
      <circle cx="201" cy="124" r="15" fill={c.vegDry} style={tr} />

      {/* soil patch */}
      <rect x="232" y="206" width="74" height="34" rx="6" fill={c.soil} style={tr} />

      {/* pavement road (trapezoid to horizon) */}
      <polygon points="252,260 300,152 322,152 372,260" fill={c.pavement} style={tr} />

      {/* building + roof */}
      <rect x="312" y="118" width="56" height="36" fill={c.wall} style={tr} />
      <polygon points="306,118 340,98 374,118" fill={c.roof} style={tr} />

      {/* thermal heat shimmer over pavement + roof */}
      {mode === 'thermal' &&
        !reduced &&
        [285, 312, 340].map((x, i) => (
          <motion.path
            key={x}
            d={`M${x} 150 q -6 -10 0 -20 q 6 -10 0 -20`}
            fill="none"
            stroke="#ff8a5a"
            strokeWidth="2"
            strokeLinecap="round"
            animate={{ y: [0, -16], opacity: [0, 0.85, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}
    </g>
  )
}

export default function InfraredScene({ mode, selectedId, onSelect, split, reduced, showLabels }) {
  const rightMode = mode
  const notes = showLabels ? MODE_NOTES[mode] : []

  return (
    <div className="overflow-hidden rounded-panel shadow-soft">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Landscape in ${getMode(mode).label} view`}>
        <defs>
          <clipPath id="clipLeft"><rect x="0" y="0" width={W / 2} height={H} /></clipPath>
          <clipPath id="clipRight"><rect x={W / 2} y="0" width={W / 2} height={H} /></clipPath>
          <filter id="nirGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="scanGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="50%" stopColor="#bff5ff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {split ? (
          <>
            <g clipPath="url(#clipLeft)"><SceneLayer mode="visible" reduced={reduced} /></g>
            <g clipPath="url(#clipRight)"><SceneLayer mode={rightMode} reduced={reduced} /></g>
            <line x1={W / 2} y1="0" x2={W / 2} y2={H} stroke="#ffffff" strokeWidth="2" />
            <line x1={W / 2} y1="0" x2={W / 2} y2={H} stroke="#0f172a" strokeOpacity="0.3" strokeWidth="1" />
            <SplitTag x={W / 4} label="Human eyes" />
            <SplitTag x={(3 * W) / 4} label={getMode(mode).label} />
          </>
        ) : (
          <SceneLayer mode={mode} reduced={reduced} />
        )}

        {/* satellite icon (sweep origin) */}
        <g transform="translate(16,14)" opacity="0.85">
          <rect x="6" y="2" width="10" height="7" rx="1.5" fill="#475569" />
          <rect x="0" y="3" width="5" height="5" rx="1" fill="#93b4d6" />
          <rect x="17" y="3" width="5" height="5" rx="1" fill="#93b4d6" />
        </g>

        {/* scan sweep on mode change */}
        {!reduced && (
          <motion.rect
            key={mode + String(split)}
            y="0"
            width="26"
            height={H}
            fill="url(#scanGrad)"
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: [-30, W], opacity: [0, 0.7, 0] }}
            transition={{ duration: 0.9, ease: 'easeInOut' }}
          />
        )}

        {/* in-scene mode notes */}
        {notes.map((n, i) => (
          <g key={n} transform={`translate(10,${H - 12 - (notes.length - 1 - i) * 16})`}>
            <rect x="0" y="-11" width={n.length * 5.4 + 12} height="15" rx="7" fill="#ffffff" opacity="0.82" />
            <text x="6" y="0" fontSize="9.5" fontWeight="700" className="fill-slate-700">{n}</text>
          </g>
        ))}

        {/* clickable hit-targets + selection ring */}
        {Object.entries(BOX).map(([id, b]) => (
          <rect
            key={id}
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            rx="8"
            fill="transparent"
            tabIndex={0}
            role="button"
            aria-label={id}
            aria-pressed={selectedId === id}
            onClick={() => onSelect(id)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onSelect(id))}
            style={{ cursor: 'pointer', outline: 'none' }}
            stroke={selectedId === id ? '#ffffff' : 'transparent'}
            strokeWidth="2.5"
          />
        ))}
        {selectedId && BOX[selectedId] && (
          <rect
            x={BOX[selectedId].x}
            y={BOX[selectedId].y}
            width={BOX[selectedId].w}
            height={BOX[selectedId].h}
            rx="8"
            fill="none"
            stroke="#0f172a"
            strokeOpacity="0.55"
            strokeWidth="2"
            strokeDasharray="5 4"
            pointerEvents="none"
          />
        )}
      </svg>
    </div>
  )
}

function SplitTag({ x, label }) {
  return (
    <g transform={`translate(${x},16)`}>
      <rect x={-label.length * 3.2 - 6} y="-10" width={label.length * 6.4 + 12} height="16" rx="8" fill="#0f172a" opacity="0.7" />
      <text x="0" y="2" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#ffffff">{label}</text>
    </g>
  )
}
