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
              Track real satellites in orbit, build your own STELLA instrument, play hands-on
              science games, and explore real field and Landsat data. It's a full toolkit for
              learning how scientists observe our changing planet from space.
            </motion.p>

          </div>
        </section>

        {/* ---------- EXPLORE ---------- */}
        <section className="px-5 pb-24 pt-4 sm:px-8 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300/80 [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]">
              Explore
            </span>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.6)] sm:text-3xl">
              Everywhere you can go
            </h2>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {NAV.filter((item) => item.id !== 'home').map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate?.(item.id)}
                  className="group overflow-hidden rounded-2xl border border-white/15 bg-white/[0.03] text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-colors hover:border-white/30 hover:bg-white/10"
                >
                  {item.image && (
                    <div className="relative h-24 w-full overflow-hidden sm:h-28">
                      <img
                        src={`${import.meta.env.BASE_URL}${item.image}`}
                        alt={item.imageAlt}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050b1f]/85 via-[#050b1f]/10 to-transparent" />
                      <span className="absolute left-2 top-2 grid h-7 w-7 place-items-center rounded-lg bg-black/50 text-sky-200 backdrop-blur-sm">
                        <Icon name={item.icon} className="h-[15px] w-[15px]" />
                      </span>
                    </div>
                  )}
                  <span className="block px-3 py-2.5 text-sm font-bold text-white">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>

            <p className="mt-4 text-[10px] leading-relaxed text-white/25">
              Photos: NASA (Landsat, Hubble Space Telescope, electromagnetic spectrum diagram, and
              the STELLA field program) and the STELLA-1.2 / STELLA-Q2 instruments.
            </p>
          </motion.div>
        </section>
      </div>
    </main>
  )
}
