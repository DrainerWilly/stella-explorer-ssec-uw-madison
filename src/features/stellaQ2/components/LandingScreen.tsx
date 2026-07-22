import { BUILD_STEPS } from '../data/buildSteps'
import { PARTS_LIST_TOTAL_USD } from '../data/parts'
import { sourceAssetUrl } from '../data/sourceReferences'
import { SPECTRAL_CHANNELS } from '../data/spectralChannels'

const HERO_PHOTO = sourceAssetUrl(
  'Build instructions and documentation/Build Instructions Photos/7 STELLA-Q2 build 3.jpg',
)

interface LandingScreenProps {
  onBegin: () => void
}

export default function LandingScreen({ onBegin }: LandingScreenProps) {
  return (
    <main className="sq2-page order-1 flex min-h-full flex-1 flex-col overflow-y-auto bg-[#030916] text-slate-100">
      <section className="relative isolate flex flex-1 items-center overflow-hidden px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
        <div className="sq2-hero-grid absolute inset-0 -z-20" aria-hidden="true" />
        <div
          className="absolute inset-x-0 top-0 -z-10 h-[36rem] bg-[radial-gradient(circle_at_70%_20%,rgba(21,180,226,0.16),transparent_46%)]"
          aria-hidden="true"
        />

        <div className="mx-auto grid w-full max-w-[1480px] items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(30rem,1.1fr)] lg:gap-16">
          <div className="max-w-2xl">
            <div className="mb-7 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300">
              <span className="h-px w-10 bg-cyan-300/70" />
              NASA STELLA-Q2 · Virtual instrument lab
            </div>
            <h1 className="max-w-[11ch] text-5xl font-semibold leading-[0.98] tracking-[-0.05em] text-white sm:text-6xl lg:text-[5.25rem]">
              Build the instrument. Understand the measurement.
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
              STELLA-Q2 is a hand-built instrument that measures visible and near-infrared
              irradiance across 18 spectral channels. This source-grounded lab lets students
              study the real construction process without needing physical hardware.
            </p>

            <button
              type="button"
              onClick={onBegin}
              className="sq2-focus mt-9 inline-flex min-h-12 items-center gap-4 rounded-sm bg-cyan-300 px-6 py-3 text-sm font-semibold text-[#03101c] transition hover:bg-white"
            >
              Begin STELLA-Q2 Build
              <span aria-hidden="true" className="text-lg">→</span>
            </button>

            <dl className="mt-12 grid max-w-xl grid-cols-3 gap-px overflow-hidden rounded-sm border border-white/10 bg-white/10">
              <LandingMetric value={SPECTRAL_CHANNELS.length.toString()} label="spectral channels" />
              <LandingMetric value={BUILD_STEPS.length.toString()} label="documented steps" />
              <LandingMetric value={`$${PARTS_LIST_TOTAL_USD}`} label="published total" />
            </dl>
          </div>

          <figure className="relative min-h-[31rem] overflow-hidden rounded-sm border border-white/15 bg-[#07101f] shadow-[0_30px_80px_rgba(0,0,0,0.42)] lg:min-h-[38rem]">
            <img
              src={HERO_PHOTO}
              alt="Connected STELLA-Q2 electronics installed in the blue top housing beside its loose cover and retainer clips."
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030916] via-transparent to-[#030916]/20" />
            <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-7">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-cyan-300">
                  Official build reference · Step 7
                </p>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-200">
                  Connected modules placed into the supplied 3D-printed enclosure.
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-white/20 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300">
                Phase 1
              </span>
            </figcaption>
          </figure>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-5 text-center text-[11px] leading-5 text-slate-500 sm:px-8">
        Built from the supplied NASA Goddard Space Flight Center STELLA-Q2 source materials.
        Independent educational simulation; no NASA endorsement is implied.
      </footer>
    </main>
  )
}

function LandingMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-[#07101f]/95 px-3 py-4 sm:px-5">
      <dt className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{label}</dt>
      <dd className="mt-1 font-mono text-xl font-semibold text-white">{value}</dd>
    </div>
  )
}

