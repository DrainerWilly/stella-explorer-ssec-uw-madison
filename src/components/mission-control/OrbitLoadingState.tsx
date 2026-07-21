// @ts-nocheck
import { useEffect, useState } from 'react'
import { EARTH_FACTS, randomEarthFact } from '../../data/earthFacts'
import ShaderGradientBackground from './ShaderGradientBackground'

const FACT_INTERVAL_MS = 5000

// Satellite Tracker loading screen. A dark animated shader-gradient field
// (see ShaderGradientBackground) sits behind a minimal, editorial layout:
// a live status eyebrow, a confident headline, a slim indeterminate progress
// bar, and a rotating "Did you know?" fact so the wait feels purposeful.
export default function OrbitLoadingState({ label = 'Loading orbital data' }) {
  const [{ fact, index }, setFactState] = useState(() => randomEarthFact())

  useEffect(() => {
    if (EARTH_FACTS.length <= 1) return
    const id = setInterval(() => setFactState((s) => randomEarthFact(s.index)), FACT_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="relative grid h-full w-full place-items-center overflow-hidden bg-[#050b1f] px-6 text-center">
      <ShaderGradientBackground />

      {/* vignette: darkens the edges so centered text keeps contrast over the
          moving gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 50% 45%, transparent 0%, rgba(5,11,31,0.35) 55%, rgba(5,11,31,0.85) 100%)',
        }}
      />

      <div className="relative flex w-full max-w-md flex-col items-center gap-8">
        {/* status eyebrow with a live pulsing dot */}
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-300" />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-sky-200/70">
            Satellite Tracker
          </span>
        </div>

        {/* headline */}
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            <span className="bg-gradient-to-b from-white to-sky-200/60 bg-clip-text text-transparent">
              {label}
              <span className="motion-safe:animate-pulse">…</span>
            </span>
          </h2>
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-sky-100/50">
            Fetching current orbital elements from public TLE providers and rendering the 3D Earth.
          </p>
        </div>

        {/* slim indeterminate progress bar */}
        <div className="h-[3px] w-56 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-sky-300 to-transparent motion-safe:animate-loader-sweep" />
        </div>

        {/* rotating Earth fact */}
        <div
          key={index}
          className="motion-safe:animate-fade-in w-full rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-5 backdrop-blur-md"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-300/70">
            Did you know?
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-sky-50/90">{fact}</p>
        </div>
      </div>

      <p className="absolute bottom-4 left-0 right-0 text-[10px] text-sky-200/30">
        Earth science facts · Gradient rendered with ShaderGradient
      </p>
    </div>
  )
}
