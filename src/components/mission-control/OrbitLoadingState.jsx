import { useEffect, useState } from 'react'
import { BASE_EARTH_LAYER } from '../../data/earthLayers.js'
import { EARTH_FACTS, randomEarthFact } from '../../data/earthFacts'

const IMG_SRC = `${import.meta.env.BASE_URL}${BASE_EARTH_LAYER.file}`
const FACT_INTERVAL_MS = 5000

// Polished, science-themed loading state shown while orbital data and the 3D
// assets initialize. Shows the NASA Blue Marble Earth image plus a rotating
// "Did you know?" fact so the wait feels purposeful rather than empty.
export default function OrbitLoadingState({ label = 'Loading orbital data…' }) {
  const [{ fact, index }, setFactState] = useState(() => randomEarthFact())
  const [imgOk, setImgOk] = useState(true)

  useEffect(() => {
    if (EARTH_FACTS.length <= 1) return
    const id = setInterval(() => setFactState((s) => randomEarthFact(s.index)), FACT_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="relative grid h-full w-full place-items-center overflow-hidden bg-gradient-to-b from-[#060e26] to-[#0b1a3d] p-6 text-center">
      {/* NASA Blue Marble backdrop, dimmed for text contrast */}
      {imgOk && (
        <img
          src={IMG_SRC}
          alt=""
          aria-hidden="true"
          onError={() => setImgOk(false)}
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-[2px]"
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#060e26]/70 via-[#060e26]/55 to-[#0b1a3d]/90" />

      <div className="relative flex w-full max-w-sm flex-col items-center gap-5">
        {/* orbiting dot around a globe */}
        <div className="relative h-16 w-16">
          <span className="absolute inset-0 rounded-full border border-sky-300/30" />
          <span className="absolute inset-2 rounded-full bg-gradient-to-br from-sky-500/60 to-indigo-700/60 blur-[1px]" />
          <span className="absolute inset-0 motion-safe:animate-spin" style={{ animationDuration: '2.4s' }}>
            <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-sky-300 shadow-[0_0_10px_2px_rgba(125,211,252,0.8)]" />
          </span>
        </div>

        <div>
          <p className="text-sm font-bold text-sky-100">{label}</p>
          <p className="mt-1 text-xs text-sky-200/60">
            Fetching modeled elements and preparing the globe
          </p>
        </div>

        {/* rotating Earth fact */}
        <div
          key={index}
          className="motion-safe:animate-fade-in rounded-xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-sky-300/70">
            Did you know?
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-sky-50/90">{fact}</p>
        </div>

        <p className="text-[10px] text-sky-200/35">
          Earth imagery: NASA Earth Observatory, Blue Marble: Next Generation.
        </p>
      </div>
    </div>
  )
}
