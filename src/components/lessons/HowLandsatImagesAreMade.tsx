// @ts-nocheck
import { useEffect, useRef, useState } from 'react'
import Icon from '../Icon'
import LandsatHero from './landsat/LandsatHero'
import LandsatLessonStepper from './landsat/LandsatLessonStepper'
import LandsatBandExplorer from './landsat/LandsatBandExplorer'
import SurfaceInteractionScene from './landsat/SurfaceInteractionScene'
import BandMeasurementPanel from './landsat/BandMeasurementPanel'
import ProcessingPipeline from './landsat/ProcessingPipeline'
import RgbCompositeMixer from './landsat/RgbCompositeMixer'
import RealImageComparison from './landsat/RealImageComparison'
import LandsatKnowledgeCheck from './landsat/LandsatKnowledgeCheck'
import SourceAttribution from './landsat/SourceAttribution'
import ImageWithAttribution from './landsat/ImageWithAttribution'
import MediaVideo from '../MediaVideo'
import { CHAPTERS, GRADE_BANDS } from '../../data/landsatLessonContent'
import { VIDEOS } from '../../data/mediaLibrary'

const META = ['Landsat 8/9', 'Interactive lesson', 'Grades 6–12', 'About 25 minutes']

export default function HowLandsatImagesAreMade({ onBack }) {
  const [band, setBand] = useState('6-8')
  const [active, setActive] = useState('ch1')
  const refs = useRef({})

  const jump = (id) => {
    const el = id === 'sources' ? document.getElementById('landsat-sources') : refs.current[id]
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // highlight the chapter nearest the top of the viewport
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (vis[0]) setActive(vis[0].target.id)
      },
      { rootMargin: '-25% 0px -60% 0px' },
    )
    Object.values(refs.current).forEach((el) => el && obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const chapterBody = {
    ch1: <LandsatBandExplorer band={band} />,
    ch2: <SurfaceInteractionScene band={band} />,
    ch3: <BandMeasurementPanel />,
    ch4: <ProcessingPipeline band={band} />,
    ch5: <RgbCompositeMixer />,
    ch6: <RealImageComparison />,
  }

  return (
    <main className="order-1 flex-1 overflow-y-auto overflow-x-hidden scroll-soft px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
      {/* top controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-full bg-cream px-4 py-2 text-sm font-bold text-ink/80 transition-all hover:-translate-x-0.5 hover:text-ink"
        >
          <Icon name="back" className="h-4 w-4" />
          Back to lessons
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1 rounded-full bg-cream p-1">
            <span className="px-2 text-xs font-bold text-faint">Grade</span>
            {GRADE_BANDS.map((g) => (
              <button
                key={g.id}
                onClick={() => setBand(g.id)}
                aria-pressed={band === g.id}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                  band === g.id ? 'bg-ink text-app shadow-soft' : 'text-muted hover:text-ink'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => jump('sources')}
            className="inline-flex items-center gap-1.5 rounded-full bg-cream px-4 py-2 text-xs font-bold text-ink/80 transition-all hover:text-ink"
          >
            <Icon name="book" className="h-3.5 w-3.5" />
            Sources
          </button>
        </div>
      </div>

      {/* metadata chips */}
      <div className="mt-3 flex flex-wrap gap-2">
        {META.map((m) => (
          <span key={m} className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted shadow-soft">
            {m}
          </span>
        ))}
      </div>

      {/* hero */}
      <div className="mt-4">
        <LandsatHero band={band} onStart={() => jump('ch1')} />
      </div>

      {/* stepper + chapters */}
      <div className="mt-6 lg:grid lg:grid-cols-[14rem_1fr] lg:gap-6">
        <aside className="mb-4 lg:mb-0 lg:sticky lg:top-6 lg:self-start">
          <LandsatLessonStepper activeId={active} onJump={jump} />
        </aside>

        <div className="space-y-10">
          {/* intro: see Landsat from orbit (still + motion) */}
          <div className="rounded-panel bg-surface p-4 shadow-soft sm:p-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-faint">
              See Landsat from orbit
            </p>
            <div className="grid gap-4 lg:grid-cols-2">
              <ImageWithAttribution imageId="landsatInOrbit" aspect="aspect-video" />
              <MediaVideo video={VIDEOS['landsat-orbits']} />
            </div>
          </div>

          {CHAPTERS.map((c) => (
            <section
              key={c.id}
              id={c.id}
              ref={(el) => (refs.current[c.id] = el)}
              className="scroll-mt-6"
            >
              <h2 className="mb-3 text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
                {c.num}. {c.title}
              </h2>
              {chapterBody[c.id]}
            </section>
          ))}

          {/* knowledge check */}
          <section>
            <h2 className="mb-3 text-xl font-extrabold tracking-tight text-ink sm:text-2xl">Knowledge check</h2>
            <LandsatKnowledgeCheck />
          </section>

          {/* sources */}
          <section>
            <SourceAttribution />
          </section>
        </div>
      </div>
    </main>
  )
}
