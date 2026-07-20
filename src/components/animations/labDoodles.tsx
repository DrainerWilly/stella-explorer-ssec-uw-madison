// @ts-nocheck
import { useMemo } from 'react'

// Hand-drawn "crayon" doodles for the Light Lab (Animations page). Same family
// as the Space Arcade doodles: wobbly strokes, rounded caps, kid-drawing feel.
// All decorative (aria-hidden); motion comes from the shared g-* CSS classes,
// which stop under prefers-reduced-motion.

const crayon = {
  fill: 'none',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export const RAINBOW = ['#ff6b6b', '#ffa94d', '#ffd97a', '#7fe3a8', '#7fb4ff', '#c9b6ff']

// The hero: a prism splitting a white beam into a rainbow fan.
export function DoodlePrism({ className = 'h-20 w-24' }) {
  return (
    <svg viewBox="0 0 96 80" className={className} aria-hidden="true" {...crayon}>
      {/* incoming white beam */}
      <path d="M4 34 36 42" stroke="#eaf2ff" strokeWidth="3" strokeDasharray="7 5" />
      {/* wobbly triangle prism, drawn twice like a crayon pass */}
      <path d="M48 14 68 62l-40 .5z" stroke="#8fd0ff" strokeWidth="3.4" />
      <path d="M48 17.5 65 60" stroke="#8fd0ff" strokeWidth="2" opacity="0.5" />
      {/* rainbow fan out */}
      {RAINBOW.map((c, i) => (
        <path
          key={c}
          d={`M62 46 92 ${26 + i * 7}`}
          stroke={c}
          strokeWidth="3"
        />
      ))}
    </svg>
  )
}

export function DoodleFlashlight({ className = 'h-16 w-16' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" {...crayon}>
      <path d="M10 38 26 22l8 8-16 16c-3 3-8 3-10 0 -2-2-2-6 2-8z" stroke="#c9b6ff" strokeWidth="3.2" />
      <path d="M26 22l4-4 12 12-4 4" stroke="#c9b6ff" strokeWidth="3.2" />
      {/* beam */}
      <path d="M44 26 58 15M47 33l16-4M40 20l4-15" stroke="#ffd97a" strokeWidth="3" />
    </svg>
  )
}

export function DoodleBulb({ className = 'h-16 w-16' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" {...crayon}>
      <path
        d="M32 8c9.5 0 16 6.8 16 15 0 5.6-3 9.4-6 12.6-2 2.2-3 3.9-3.3 6.4h-13.4C25 39.5 24 37.8 22 35.6c-3-3.2-6-7-6-12.6 0-8.2 6.5-15 16-15z"
        stroke="#ffd97a"
        strokeWidth="3.4"
      />
      <path d="M27 48h10M28.5 53h7" stroke="#9aa4b8" strokeWidth="3" />
      <path d="M27 28c1.5-2 4-2 5 0s3.5 2 5 0" stroke="#ffd97a" strokeWidth="2.4" opacity="0.7" />
      {/* idea sparks */}
      <path d="M10 18l4 2M54 18l-4 2M32 2v4" stroke="#ff9db1" strokeWidth="2.6" />
    </svg>
  )
}

export function DoodleSun({ className = 'h-16 w-16' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" {...crayon}>
      <path
        d="M32 16c9 0 15.6 6.9 16 15 .4 8.8-6.7 16.6-15.7 16.6C23 47.6 16.3 40.4 16 31.5 15.8 22.8 23 16 32 16z"
        stroke="#ffd97a"
        strokeWidth="3.4"
      />
      {/* rays */}
      <path d="M32 4v6M32 54v6M4 32h6M54 32h6M11 11l4.5 4.5M48.5 48.5 53 53M53 11l-4.5 4.5M15.5 48.5 11 53" stroke="#ffa94d" strokeWidth="3" />
      {/* cool sunglasses */}
      <path d="M22 29h8v5c0 2-1.6 3.4-4 3.4S22 36 22 34zM34 29h8v5c0 2-1.6 3.4-4 3.4S34 36 34 34zM30 30h4" stroke="#17213d" strokeWidth="2.8" />
      <path d="M26 42c3.5 2.5 8.5 2.5 12 0" stroke="#17213d" strokeWidth="2.6" />
    </svg>
  )
}

export function DoodleRainbow({ className = 'h-14 w-24' }) {
  return (
    <svg viewBox="0 0 96 56" className={className} aria-hidden="true" {...crayon}>
      {RAINBOW.slice(0, 5).map((c, i) => (
        <path
          key={c}
          d={`M${10 + i * 5} 52a${38 - i * 5} ${38 - i * 5} 0 0 1 ${76 - i * 10} 0`}
          stroke={c}
          strokeWidth="4"
        />
      ))}
      {/* little clouds at the ends */}
      <path d="M4 52c1-4 6-5 8-2M84 52c1-4 6-5 8-2" stroke="#eaf2ff" strokeWidth="3" />
    </svg>
  )
}

// A field of drifting rainbow "photons" for the Light Lab background.
export function PhotonField({ count = 30 }) {
  const photons = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: `${(i * 43 + 11) % 100}%`,
        top: `${(i * 59 + 5) % 100}%`,
        size: 2.5 + ((i * 7) % 3),
        delay: `${(i % 9) * 0.4}s`,
        color: RAINBOW[i % RAINBOW.length],
      })),
    [count],
  )
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {photons.map((p, i) => (
        <span
          key={i}
          className="g-twinkle absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: p.delay,
            opacity: 0.6,
          }}
        />
      ))}
      {/* a faint crayon light beam sweeping across the top corner */}
      <svg viewBox="0 0 160 60" className="absolute -right-4 top-[8%] h-14 w-40 opacity-50" fill="none" strokeLinecap="round">
        <path d="M6 54C50 34 104 18 154 10" stroke="#eaf2ff" strokeWidth="2.5" strokeDasharray="2 8" />
      </svg>
    </div>
  )
}
