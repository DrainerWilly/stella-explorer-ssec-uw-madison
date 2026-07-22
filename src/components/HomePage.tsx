// @ts-nocheck
import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Masthead from './Masthead'
import { HOME_CARDS } from '../data/nav'

const EASE = [0.19, 1, 0.22, 1] // easeOutExpo — the reference's motion curve
const HERO_FADE_MS = 650
const READ_MORE_SCROLL_MS = 1350
const HERO_STATEMENT = 'Learn remote sensing through satellite and STELLA data.'
const HERO_VIDEOS = [
  { file: 'assets/videos/landsat-orbits.mp4', duration: 39 },
  { file: 'assets/videos/tdrs-fleet-360.mp4', duration: 45, zoom: true },
]

const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2

// Small arrow used by the "view" affordance on each card.
function ViewArrow() {
  return (
    <svg className="cm-view__arrow" width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden="true">
      <path d="M1 6h15M11 1l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Home page: a full-bleed cinematic hero with a looping Landsat orbit video as
// the dominant visual, followed by large editorial feature sections.
export default function HomePage({ onNavigate }) {
  const reduce = useReducedMotion()
  const isSwitchingHeroVideo = useRef(false)
  const heroFadeTimeout = useRef(null)
  const readMoreScrollRaf = useRef(null)
  const [heroVideoIndex, setHeroVideoIndex] = useState(0)
  const [isHeroFading, setIsHeroFading] = useState(false)
  const heroVideo = HERO_VIDEOS[heroVideoIndex]
  const advanceHeroVideo = useCallback(() => {
    if (isSwitchingHeroVideo.current) return
    isSwitchingHeroVideo.current = true
    setIsHeroFading(true)
    if (heroFadeTimeout.current) window.clearTimeout(heroFadeTimeout.current)
    heroFadeTimeout.current = window.setTimeout(() => {
      setHeroVideoIndex((index) => (index + 1) % HERO_VIDEOS.length)
    }, HERO_FADE_MS)
  }, [])
  const scrollToIntro = useCallback(() => {
    const target = document.getElementById('home-intro')
    if (!target) return

    if (readMoreScrollRaf.current) window.cancelAnimationFrame(readMoreScrollRaf.current)

    const startY = window.scrollY
    const targetY = startY + target.getBoundingClientRect().top
    const distance = targetY - startY

    if (reduce) {
      window.scrollTo(0, targetY)
      return
    }

    const startedAt = performance.now()
    const step = (now) => {
      const t = Math.min(1, (now - startedAt) / READ_MORE_SCROLL_MS)
      window.scrollTo(0, startY + distance * easeInOutSine(t))
      if (t < 1) readMoreScrollRaf.current = window.requestAnimationFrame(step)
      else readMoreScrollRaf.current = null
    }

    readMoreScrollRaf.current = window.requestAnimationFrame(step)
  }, [reduce])

  useEffect(() => {
    return () => {
      if (heroFadeTimeout.current) window.clearTimeout(heroFadeTimeout.current)
      if (readMoreScrollRaf.current) window.cancelAnimationFrame(readMoreScrollRaf.current)
    }
  }, [])

  return (
    <main className="cm-root relative min-h-screen w-full overflow-x-hidden bg-white text-[#2b2b2b]">
      {/* ===================== HERO ===================== */}
      <section className="relative h-[100svh] min-h-[560px] w-full overflow-hidden">
        {/* looping Landsat orbit video — dominant hero visual */}
        <div className="absolute inset-0 z-0">
          <video
            key={heroVideo.file}
            className={`h-full w-full object-cover ${heroVideo.zoom ? 'cm-hero-video--zoom' : ''}`}
            src={`${import.meta.env.BASE_URL}${heroVideo.file}`}
            autoPlay
            muted
            playsInline
            preload="metadata"
            aria-hidden="true"
            onLoadedMetadata={(event) => {
              event.currentTarget.currentTime = heroVideo.startAt ?? 0
              event.currentTarget.play().catch(() => {})
              window.requestAnimationFrame(() => {
                setIsHeroFading(false)
                isSwitchingHeroVideo.current = false
              })
            }}
            onEnded={advanceHeroVideo}
            onTimeUpdate={(event) => {
              const loopEnd = (heroVideo.startAt ?? 0) + heroVideo.duration
              if (event.currentTarget.currentTime >= loopEnd) {
                event.currentTarget.pause()
                advanceHeroVideo()
              }
            }}
          />
        </div>
        {/* cinematic scrim keeps the navigation legible while leaving the video clear */}
        <div aria-hidden="true" className="absolute inset-0 z-10 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
        <div aria-hidden="true" className="absolute inset-0 z-10 bg-gradient-to-t from-black/55 via-transparent to-black/35" />
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 z-[25] bg-black transition-opacity duration-700 ${
            isHeroFading ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div className="cm-hero-statement absolute z-20 text-white">
          {HERO_STATEMENT}
        </div>

        <button
          type="button"
          onClick={scrollToIntro}
          className="cm-read-more cm-focus absolute left-1/2 z-20 -translate-x-1/2 text-white"
          aria-label="Read more about ExSTELLA"
        >
          <span>Read more</span>
          <svg width="14" height="18" viewBox="0 0 14 18" fill="none" aria-hidden="true">
            <path d="M7 1v15M2.5 11.5 7 16l4.5-4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* nav pinned to the top of the hero */}
        <div className="absolute inset-x-0 top-0 z-30">
          <Masthead active="home" onNavigate={onNavigate} />
        </div>
      </section>

      {/* ===================== FEATURE SECTIONS ===================== */}
      <div className="bg-white">
        <motion.section
          id="home-intro"
          initial={{ opacity: 0, y: reduce ? 0 : 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: EASE }}
          className="cm-wrapper px-6 pb-20 pt-16 text-center md:pb-28 md:pt-24"
          aria-label="ExSTELLA introduction"
        >
          <p className="cm-hero-sub mx-auto max-w-3xl text-black/65">
            Follow Landsat and other missions in orbit, build NASA STELLA instruments, and
            compare spectral bands through lessons, animations, games, and data tools that show
            how light reveals land, water, heat, and vegetation.
          </p>
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
              <div className="cm-card block w-full text-left">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-0">
                  {/* media cover (66.7%) */}
                  <div className="md:w-2/3">
                    <div className="cm-media-cover">
                      <img
                        src={`${import.meta.env.BASE_URL}${item.image}`}
                        alt={item.imageAlt || ''}
                        loading="lazy"
                        style={{
                          objectFit: item.imageFit || 'cover',
                          objectPosition: item.imagePosition || 'center',
                          backgroundColor: item.imageBg || undefined,
                        }}
                        className="cm-media-cover__img"
                      />
                    </div>
                  </div>

                  {/* text column (25%, offset 8.333%) */}
                  <div className="md:ml-[8.333%] md:w-1/4">
                    <h2 className="cm-triple-border mb-9 text-2xl font-medium leading-tight tracking-tight text-[#2b2b2b] md:text-[28px]">
                      <button
                        onClick={() => onNavigate?.(item.id)}
                        className="cm-title-link cm-focus text-left"
                      >
                        {item.label}
                      </button>
                    </h2>
                    <p className="mb-5 text-sm leading-relaxed text-black/65">{item.blurb}</p>
                    <button
                      type="button"
                      onClick={() => onNavigate?.(item.id)}
                      className="cm-view cm-focus"
                      aria-label={`View ${item.label}`}
                    >
                      View
                      <ViewArrow />
                    </button>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}

          <footer className="cm-home-credit" aria-label="Image credits">
            Homepage imagery and video courtesy of NASA/Goddard Space Flight Center,
            NASA Scientific Visualization Studio, NASA/USGS Landsat, and the NASA STELLA
            project. Made at the Space Science and Engineering Center, University of
            Wisconsin–Madison.
          </footer>
        </div>
      </div>
    </main>
  )
}
