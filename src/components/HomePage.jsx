import { Suspense, lazy } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Icon from './Icon.jsx'
import { NAV } from './SidebarNav.jsx'

// Heavy Three.js Earth loads after first paint (kept out of the initial bundle).
const HomeEarthBackground = lazy(() => import('./HomeEarthBackground.jsx'))

const EASE = [0.22, 1, 0.36, 1]

export default function HomePage({ onNavigate }) {
  const reduce = useReducedMotion()

  const fade = (i = 0) => ({
    initial: { opacity: 0, y: reduce ? 0 : 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay: 0.08 * i, ease: EASE },
  })

  return (
    <main className="relative order-1 flex-1 overflow-x-hidden overflow-y-auto scroll-soft bg-app lg:order-2">
      {/* live 3D Earth, pinned behind the scrolling content */}
      <div className="pointer-events-none sticky top-0 z-0 -mb-[100svh] h-[100svh]">
        <Suspense fallback={<div className="h-full w-full bg-gradient-to-b from-[#03071a] to-app" />}>
          <HomeEarthBackground />
        </Suspense>
        {/* legibility gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-app via-app/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-app via-transparent to-app/50" />
      </div>

      <div className="relative z-10">
        {/* ---------- HERO ---------- */}
        <section className="flex min-h-[62svh] flex-col justify-center px-6 pb-8 pt-16 sm:px-10 lg:px-16">
          <div className="relative max-w-2xl">
            {/* soft glow behind the headline */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-24 -top-20 h-72 w-72 rounded-full bg-sky-500/20 blur-[120px]"
            />

            <motion.div {...fade(0)}>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-200/90 backdrop-blur">
                <Icon name="globe" className="h-3.5 w-3.5" />
                SSEC · University of Wisconsin–Madison
              </span>
            </motion.div>

            <motion.h1
              {...fade(1)}
              className="mt-5 text-[44px] font-extrabold leading-[1.02] tracking-[-0.02em] text-white sm:text-[60px] lg:text-[72px]"
            >
              Explore Earth
              <br />
              <span className="bg-gradient-to-br from-sky-200 via-white to-sky-400 bg-clip-text text-transparent">
                with STELLA
              </span>
            </motion.h1>

            <motion.p
              {...fade(2)}
              className="mt-5 max-w-xl text-[15px] leading-relaxed text-slate-300/90 sm:text-lg"
            >
              Collect real field measurements, compare them with live satellite orbits and Landsat
              imagery, and discover how scientists observe our changing planet from space.
            </motion.p>

            <motion.div {...fade(3)} className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate?.('mission-control')}
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 px-6 py-3.5 text-sm font-bold text-white shadow-[0_8px_30px_-8px_rgba(56,189,248,0.6)] transition-transform hover:scale-[1.03]"
              >
                <Icon name="globe" className="h-4 w-4" />
                Launch Mission Control
              </button>
            </motion.div>
          </div>
        </section>

        {/* ---------- EXPLORE ---------- */}
        <section className="bg-app px-5 pb-24 pt-4 sm:px-8 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300/80">
              Explore
            </span>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Everywhere you can go
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {NAV.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate?.(item.id)}
                  className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur transition-colors hover:bg-white/10"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-sky-200 transition-colors group-hover:bg-white/20">
                    <Icon name={item.icon} className="h-[18px] w-[18px]" />
                  </span>
                  <span className="text-sm font-bold text-white">{item.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  )
}
