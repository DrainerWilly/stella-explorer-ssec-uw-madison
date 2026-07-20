import { Suspense, lazy } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Masthead from './Masthead.jsx'
import { HOME_CARDS } from '../data/nav.js'

// Heavy Three.js Earth loads after first paint (kept out of the initial bundle).
const HomeEarthBackground = lazy(() => import('./HomeEarthBackground.jsx'))

const EASE = [0.19, 1, 0.22, 1] // easeOutExpo — the reference's motion curve

// Small arrow used by the "view" affordance on each card.
function ViewArrow() {
  return (
    <svg className="cm-view__arrow" width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden="true">
      <path d="M1 6h15M11 1l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Home page: a full-bleed cinematic hero with a slowly rotating 3D Earth as the
// dominant visual, followed by seven large editorial feature sections. No
// footer, no CTA — the page ends cleanly after the seventh section.
export default function HomePage({ onNavigate }) {
  const reduce = useReducedMotion()

  return (
    <main className="cm-root relative min-h-screen w-full overflow-x-hidden bg-white text-[#2b2b2b]">
      {/* ===================== HERO ===================== */}
      <section className="relative h-[100svh] min-h-[560px] w-full overflow-hidden">
        {/* the globe — dominant hero visual, sits large and low-right */}
        <div className="absolute inset-0 z-0">
          <Suspense fallback={<div className="h-full w-full bg-gradient-to-br from-[#03071a] via-[#050b1f] to-[#0b1a3d]" />}>
            <HomeEarthBackground />
          </Suspense>
        </div>
        {/* cinematic scrim keeps the navigation legible while leaving Earth clear */}
        <div aria-hidden="true" className="absolute inset-0 z-10 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
        <div aria-hidden="true" className="absolute inset-0 z-10 bg-gradient-to-t from-black/55 via-transparent to-black/35" />

        {/* nav pinned to the top of the hero */}
        <div className="absolute inset-x-0 top-0 z-30">
          <Masthead variant="dark" active="home" onNavigate={onNavigate} />
        </div>
      </section>

      {/* ===================== FEATURE SECTIONS ===================== */}
      <div className="bg-white">
        <motion.section
          initial={{ opacity: 0, y: reduce ? 0 : 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: EASE }}
          className="cm-wrapper px-6 pb-20 pt-16 text-center md:pb-28 md:pt-24"
          aria-labelledby="home-intro-title"
        >
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.32em] text-black/45">
            ExStella · Earth observation
          </p>
          <h1 id="home-intro-title" className="cm-intro-title">
            Read the Earth in light.
          </h1>
          <p className="cm-hero-sub mx-auto mt-6 max-w-3xl text-black/65">
            Track satellites in orbit, build a STELLA spectrometer, and explore how scientists
            observe our changing planet from space.
          </p>
          <button
            onClick={() => onNavigate?.('mission-control')}
            className="cm-intro-button cm-focus mt-10"
          >
            Explore ExStella
          </button>
        </motion.section>

        <div className="cm-wrapper pb-20 md:pb-28">
          {HOME_CARDS.map((item) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: reduce ? 0 : 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, ease: EASE }}
              className="mb-16 last:mb-0 md:mb-24"
            >
              <button
                onClick={() => onNavigate?.(item.id)}
                aria-label={`${item.label}. ${item.blurb}`}
                className="cm-card cm-focus group block w-full text-left"
              >
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-0">
                  {/* media cover (66.7%) */}
                  <div className="md:w-2/3">
                    <div className="cm-media-cover">
                      <img
                        src={`${import.meta.env.BASE_URL}${item.image}`}
                        alt=""
                        loading="lazy"
                        className="cm-media-cover__img"
                      />
                    </div>
                  </div>

                  {/* text column (25%, offset 8.333%) */}
                  <div className="md:ml-[8.333%] md:w-1/4">
                    <h2 className="cm-triple-border mb-9 text-2xl font-medium leading-tight tracking-tight text-[#2b2b2b] md:text-[28px]">
                      {item.label}
                    </h2>
                    <p className="mb-5 text-sm leading-relaxed text-black/65">{item.blurb}</p>
                    <span className="cm-view">
                      View
                      <ViewArrow />
                    </span>
                  </div>
                </div>
              </button>
            </motion.article>
          ))}
        </div>
      </div>
    </main>
  )
}
