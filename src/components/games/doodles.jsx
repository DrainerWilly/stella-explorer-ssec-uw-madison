import { useMemo } from 'react'

// Hand-drawn "crayon" doodles for the games arcade. Wobbly double strokes,
// slightly off-round shapes, and rounded caps make them read like a kid drew
// them on black paper. All decorative (aria-hidden), animated via CSS classes
// that respect prefers-reduced-motion.

const crayon = {
  fill: 'none',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function DoodlePlanet({ className = 'h-16 w-16', body = '#f2a65a', ring = '#7fb4ff' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" {...crayon}>
      {/* squashed hand-drawn circle */}
      <path
        d="M32 12c11 0 19 8.4 19.6 19C52.2 42.5 43.5 52 32.4 52 21 52 12.6 43.2 12.4 32.2 12.2 21 21 12 32 12z"
        stroke={body}
        strokeWidth="3.4"
      />
      <path d="M20 27c3.5-1.5 8-1 10 1M38 40c2.5.8 5.5.2 7-1" stroke={body} strokeWidth="2.4" opacity="0.65" />
      {/* wobbly ring, two passes like a crayon going around twice */}
      <path d="M6 38c8 6 32 7 46-2.5 3-2 4.5-4.4 3.6-6.3" stroke={ring} strokeWidth="3" />
      <path d="M9.5 33.5C7 34.8 5.6 36.3 6 38m49.5-8.8c-.7-1.7-3-3-6.3-3.7" stroke={ring} strokeWidth="3" opacity="0.75" />
    </svg>
  )
}

export function DoodleTelescope({ className = 'h-16 w-16', tube = '#c9b6ff', legs = '#9aa4b8' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" {...crayon}>
      <path d="M14 30 44 13l6 10-30.5 17.5z" stroke={tube} strokeWidth="3.4" />
      <path d="M44 13l4-2 6.5 11-4.5 2.2" stroke={tube} strokeWidth="3" />
      <path d="M25 40l-8 16M32 37l7 18M28.5 38.5v6" stroke={legs} strokeWidth="3.2" />
      {/* little star it's looking at */}
      <path d="M55 4l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" stroke="#ffd97a" strokeWidth="2" />
    </svg>
  )
}

export function DoodleRocket({ className = 'h-16 w-16', body = '#ff9db1', flame = '#ffd97a' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" {...crayon}>
      <path
        d="M32 6c8 5 11.5 13 11.5 21 0 5.5-1.5 10.5-3.8 15H24.3A32 32 0 0 1 20.5 27C20.5 19 24 11 32 6z"
        stroke={body}
        strokeWidth="3.4"
      />
      <path d="M32 20.5c2.6 0 4.6 2 4.6 4.5S34.6 29.6 32 29.6 27.4 27.5 27.4 25s2-4.5 4.6-4.5z" stroke="#8fd0ff" strokeWidth="3" />
      <path d="M24 36l-7 9 8-1.5M40 36l7 9-8-1.5" stroke={body} strokeWidth="3.2" />
      <path d="M29 44c-.5 4 .5 7.5 3 10.5 2.5-3 3.5-6.5 3-10.5" stroke={flame} strokeWidth="3.2" />
      <path d="M32 46.5c-.2 2.5.3 4.7 1.5 6.7" stroke="#ff8f5e" strokeWidth="2.4" />
    </svg>
  )
}

export function DoodleStar({ className = 'h-8 w-8', color = '#ffd97a' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" {...crayon}>
      <path d="M16 4l3 7.5L27 13l-7 5 2 8.5L16 21l-6 5.5L12 18l-7-5 8-1.5z" stroke={color} strokeWidth="2.6" />
    </svg>
  )
}

export function DoodleSatellite({ className = 'h-14 w-14', body = '#8fd0ff', panel = '#7fe3a8' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" {...crayon}>
      <path d="M26 26l9-9 12 12-9 9z" stroke={body} strokeWidth="3.2" />
      <path d="M8 40l12-12 5 5-12 12zM44 12l8-8" stroke={panel} strokeWidth="3.2" />
      <path d="M12 36l8 8M16 32l8 8" stroke={panel} strokeWidth="2.2" opacity="0.7" />
      <path d="M40 40c4 1 7 4 7.5 8.5" stroke="#ffd97a" strokeWidth="2.6" />
      <path d="M44 36c6 1.5 10 6 11 12" stroke="#ffd97a" strokeWidth="2.6" opacity="0.6" />
    </svg>
  )
}

export function DoodleEarth({ className = 'h-16 w-16' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" {...crayon}>
      <path
        d="M32 8c13.5 0 23.6 10.5 24 23.2C56.4 44.6 45.8 56 32.3 56 18.6 56 8.4 45 8 31.7 7.7 18.6 18.4 8 32 8z"
        stroke="#7fb4ff"
        strokeWidth="3.4"
      />
      <path d="M18 22c4-3 9-2 11 1s7 2 9-1M14 36c5-2 9 1 10 4s6 4 9 2M38 42c3-2 7-2 9 0" stroke="#7fe3a8" strokeWidth="3" />
      {/* smile + eyes */}
      <circle cx="26" cy="28" r="1.6" fill="#eaf2ff" stroke="none" />
      <circle cx="38" cy="28" r="1.6" fill="#eaf2ff" stroke="none" />
      <path d="M27 35c3 2.5 7 2.5 10 0" stroke="#eaf2ff" strokeWidth="2.4" />
    </svg>
  )
}

// A field of twinkling stars + a couple of drifting doodles, used as the
// arcade background. Star positions are stable per mount.
export function Starfield({ count = 34 }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: `${(i * 37 + 13) % 100}%`,
        top: `${(i * 53 + 7) % 100}%`,
        size: 2 + ((i * 7) % 3),
        delay: `${(i % 10) * 0.35}s`,
        bright: i % 4 === 0,
      })),
    [count],
  )
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((s, i) => (
        <span
          key={i}
          className="g-twinkle absolute rounded-full"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            backgroundColor: s.bright ? '#ffe9b3' : '#cfe3ff',
            animationDelay: s.delay,
            opacity: 0.7,
          }}
        />
      ))}
      {/* one shooting star, drawn as a crayon streak */}
      <svg viewBox="0 0 120 40" className="absolute right-[8%] top-[12%] h-10 w-28 opacity-70" fill="none" strokeLinecap="round">
        <path d="M8 30C40 18 78 10 112 8" stroke="#ffd97a" strokeWidth="2.5" strokeDasharray="1 7" />
        <path d="M104 4l2 4 4.5 1-4 2.5-.5 4.5-3-3.5-4.5.5 2.5-4-2-4z" stroke="#ffd97a" strokeWidth="2" />
      </svg>
    </div>
  )
}
