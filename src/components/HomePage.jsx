import { Suspense, lazy } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Icon from './Icon.jsx'
import CategoryFilters from './CategoryFilters.jsx'
import LessonCardGrid from './LessonCardGrid.jsx'
import FeaturedActivityCard from './FeaturedActivityCard.jsx'
import { GRADES } from '../data/lessons.js'

// Heavy Three.js Earth loads after first paint (kept out of the initial bundle).
const HomeEarthBackground = lazy(() => import('./HomeEarthBackground.jsx'))

const EASE = [0.22, 1, 0.36, 1]

export default function HomePage({
  category,
  onCategory,
  grade,
  onGrade,
  lessons,
  onOpenLesson,
  onNavigate,
}) {
  const reduce = useReducedMotion()

  const fade = (i = 0) => ({
    initial: { opacity: 0, y: reduce ? 0 : 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay: 0.08 * i, ease: EASE },
  })

  const scrollToLessons = () =>
    document
      .getElementById('home-lessons')
      ?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })

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
        <section className="flex min-h-[90svh] flex-col justify-center px-6 py-16 sm:px-10 lg:px-16">
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
                onClick={scrollToLessons}
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 px-6 py-3.5 text-sm font-bold text-white shadow-[0_8px_30px_-8px_rgba(56,189,248,0.6)] transition-transform hover:scale-[1.03]"
              >
                <Icon name="play" className="h-4 w-4" />
                Start learning
              </button>
              <button
                onClick={() => onNavigate?.('mission-control')}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition-colors hover:bg-white/10"
              >
                <Icon name="orbit" className="h-4 w-4" />
                Launch Mission Control
              </button>
            </motion.div>
          </div>

          {/* scroll cue */}
          <motion.button
            {...fade(5)}
            onClick={scrollToLessons}
            aria-label="Scroll to lessons"
            className="mt-10 inline-flex w-fit items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 transition-colors hover:text-white"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full border border-white/15">
              <Icon name="chevron" className="h-4 w-4 rotate-90 motion-safe:animate-bounce" />
            </span>
            Explore
          </motion.button>
        </section>

        {/* ---------- LESSONS / CONTENT ---------- */}
        <section
          id="home-lessons"
          className="bg-gradient-to-b from-transparent via-app/90 to-app px-5 pb-20 pt-10 sm:px-8 lg:px-16"
        >
          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300/80">
                  Lessons & activities
                </span>
                <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  Start learning
                </h2>
              </div>

              {/* grade-level selector */}
              <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur">
                {GRADES.map((g) => {
                  const active = grade === g.id
                  return (
                    <button
                      key={g.id}
                      onClick={() => onGrade(g.id)}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                        active ? 'bg-white text-[#04122b]' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {g.short}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-5">
              <CategoryFilters active={category} onChange={onCategory} />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-400">
                {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}
              </span>
            </div>

            <div className="mt-4">
              <LessonCardGrid lessons={lessons} onOpenLesson={onOpenLesson} />
            </div>

            <div className="mt-6">
              <FeaturedActivityCard />
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  )
}
