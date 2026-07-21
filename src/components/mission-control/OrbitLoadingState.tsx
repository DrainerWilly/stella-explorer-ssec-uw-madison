// @ts-nocheck
import { useEffect, useState } from 'react'
import { EARTH_FACTS, randomEarthFact } from '../../data/earthFacts'

const FACT_INTERVAL_MS = 5000
const RADIANT_SHADER_BASE = 'assets/radiant-shaders/'

// 35 locally-vendored Radiant shaders. Radiant publishes these as standalone
// HTML/canvas effects, so the loading screen embeds exactly one random shader in
// an isolated iframe instead of adding another runtime dependency.
const RADIANT_SHADERS = [
  { file: 'event-horizon.html', name: 'Event Horizon' },
  { file: 'eclipse-glow.html', name: 'Eclipse Glow' },
  { file: 'stardust-veil.html', name: 'Stardust Veil' },
  { file: 'aurora-veil.html', name: 'Aurora Veil' },
  { file: 'aurora-curtain.html', name: 'Aurora Curtain' },
  { file: 'magnetic-field.html', name: 'Magnetic Field' },
  { file: 'magnetic-sand.html', name: 'Magnetic Sand' },
  { file: 'spark-chamber.html', name: 'Spark Chamber' },
  { file: 'flow-field.html', name: 'Flow Field' },
  { file: 'topographic.html', name: 'Topographic' },
  { file: 'strange-attractor.html', name: 'Strange Attractor' },
  { file: 'phyllotaxis.html', name: 'Phyllotaxis Spiral' },
  { file: 'fluid-amber.html', name: 'Fluid Amber' },
  { file: 'kinetic-grid.html', name: 'Kinetic Grid' },
  { file: 'laser-labyrinth.html', name: 'Laser Labyrinth' },
  { file: 'voltage-arc.html', name: 'Voltage Arc' },
  { file: 'moonlit-ripple.html', name: 'Moonlit Ripple' },
  { file: 'diamond-caustics.html', name: 'Diamond Caustics' },
  { file: 'metamorphosis.html', name: 'Metamorphosis' },
  { file: 'artpop-iridescence.html', name: 'Artpop Iridescence' },
  { file: 'chromatic-bloom.html', name: 'Chromatic Bloom' },
  { file: 'lens-whisper.html', name: 'Lens Whisper' },
  { file: 'luminous-silt.html', name: 'Luminous Silt' },
  { file: 'hologram-glitch.html', name: 'Hologram Glitch' },
  { file: 'feedback-loop.html', name: 'Feedback Loop' },
  { file: 'dither-gradient.html', name: 'Dither Gradient' },
  { file: 'analog-drift.html', name: 'Analog Drift' },
  { file: 'tesseract-shadow.html', name: 'Tesseract Shadow' },
  { file: 'moire-interference.html', name: 'Moiré Interference' },
  { file: 'phase-transition.html', name: 'Phase Transition' },
  { file: 'vortex.html', name: 'Vortex' },
  { file: 'painted-strata.html', name: 'Painted Strata' },
  { file: 'shattered-plains.html', name: 'Shattered Plains' },
  { file: 'signal-decay.html', name: 'Signal Decay' },
  { file: 'radiant-geometry.html', name: 'Radiant Geometry' },
]

const SHADER_FILTERS = [
  'none',
  'hue-rotate(175deg) saturate(1.05)',
  'hue-rotate(90deg) saturate(1.2)',
  'hue-rotate(300deg) saturate(1.1)',
  'hue-rotate(180deg) saturate(0.65) brightness(1.15)',
]

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)]
}

// Satellite Tracker loading screen. The left side carries the useful status
// information; the center/right side becomes a generative "signal field" using
// one random local Radiant shader per load.
export default function OrbitLoadingState({ label = 'Loading orbital data' }) {
  const [{ fact, index }, setFactState] = useState(() => randomEarthFact())
  const [shader] = useState(() => pickRandom(RADIANT_SHADERS))
  const [shaderFilter] = useState(() => pickRandom(SHADER_FILTERS))

  useEffect(() => {
    if (EARTH_FACTS.length <= 1) return
    const id = setInterval(() => setFactState((s) => randomEarthFact(s.index)), FACT_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="relative min-h-[620px] w-full overflow-hidden bg-[#040817] text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 72% 45%, rgba(56,189,248,0.16), transparent 34%), radial-gradient(circle at 18% 18%, rgba(79,70,229,0.22), transparent 32%), linear-gradient(135deg, #030613 0%, #06102a 48%, #09142d 100%)',
        }}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0,rgba(0,0,0,0.42)_72%)]" />
      <div aria-hidden="true" className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:56px_56px]" />

      <div className="relative z-10 grid min-h-[620px] w-full items-center gap-8 px-6 pb-10 pt-28 sm:px-8 md:pt-32 lg:grid-cols-[minmax(320px,0.42fr)_minmax(380px,0.58fr)] lg:px-12 lg:pb-12 lg:pt-32 xl:px-16">
        <section className="max-w-xl text-left">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-sky-300 opacity-75 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sky-200" />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.38em] text-sky-100/65">
              Satellite Tracker
            </span>
          </div>

          <h2 className="mt-7 text-4xl font-semibold leading-[0.95] tracking-[-0.04em] sm:text-5xl xl:text-6xl">
            <span className="bg-gradient-to-b from-white to-sky-200/60 bg-clip-text text-transparent">
              {label}
              <span className="motion-safe:animate-pulse">…</span>
            </span>
          </h2>

          <p className="mt-5 max-w-md text-sm leading-7 text-sky-100/58 sm:text-base">
            Fetching current orbital elements from public TLE providers, validating mission IDs,
            and preparing the 3D Earth scene.
          </p>

          <div className="mt-8 max-w-sm">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.22em] text-sky-100/38">
              <span>Orbit feed</span>
              <span>Live TLE</span>
            </div>
            <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-sky-200 to-transparent motion-safe:animate-loader-sweep" />
            </div>
          </div>

          <div className="mt-8 grid max-w-md gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 backdrop-blur-md">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-300/70">
                Visual field
              </p>
              <p className="mt-1 text-sm text-sky-50/85">{shader.name}</p>
              <p className="mt-1 text-[11px] text-sky-100/35">Random Radiant shader</p>
            </div>

            <div
              key={index}
              className="motion-safe:animate-fade-in rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 backdrop-blur-md"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-300/70">
                Did you know?
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-sky-50/82">{fact}</p>
            </div>
          </div>
        </section>

        <section className="relative mx-auto flex w-full max-w-[660px] items-center justify-center py-6 lg:py-0">
          <div aria-hidden="true" className="absolute h-[82%] w-[82%] rounded-full border border-sky-200/10" />
          <div aria-hidden="true" className="absolute h-[98%] w-[98%] rounded-full border border-sky-200/5" />
          <div aria-hidden="true" className="absolute h-[118%] w-[118%] rounded-full border border-sky-200/[0.035]" />

          <div className="relative aspect-square w-[min(70vw,560px)] overflow-hidden rounded-full border border-white/10 bg-black shadow-[0_0_90px_rgba(56,189,248,0.22)]">
            <iframe
              title={`Radiant shader: ${shader.name}`}
              src={`${import.meta.env.BASE_URL}${RADIANT_SHADER_BASE}${shader.file}`}
              className="h-full w-full scale-[1.03]"
              style={{ filter: shaderFilter }}
              loading="eager"
              sandbox="allow-scripts"
              referrerPolicy="no-referrer"
              aria-hidden="true"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_0_80px_rgba(0,0,0,0.72),inset_0_0_8px_rgba(255,255,255,0.22)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_34%_22%,rgba(255,255,255,0.18),transparent_19%),radial-gradient(circle_at_center,transparent_48%,rgba(2,6,23,0.62)_100%)]"
            />
          </div>
        </section>
      </div>
    </div>
  )
}
