import { useEffect, useRef, useState } from 'react'
import Icon from '../Icon.jsx'
import { SECTIONS, HEADER, GRADE_BANDS } from '../../data/emsLessonContent.js'
import SpectrumAroundUs from './ems/SpectrumAroundUs.jsx'
import WaveExplainer from './ems/WaveExplainer.jsx'
import LightMeetsMatter from './ems/LightMeetsMatter.jsx'
import AtmosphereWindows from './ems/AtmosphereWindows.jsx'
import EnergyToImage from './ems/EnergyToImage.jsx'
import RegionExplorer from './ems/RegionExplorer.jsx'
import RadiationBudget from './ems/RadiationBudget.jsx'
import RemoteSensingConnections from './ems/RemoteSensingConnections.jsx'
import EmsReview from './ems/EmsReview.jsx'
import EmsSources from './ems/EmsSources.jsx'
import MediaVideo from '../MediaVideo.jsx'
import { VIDEOS } from '../../data/mediaLibrary.js'

export default function WhatIsTheEMS({ onBack, onOpenAnimation }) {
  const [band, setBand] = useState('6-8')
  const [active, setActive] = useState('around-us')
  const [navOpen, setNavOpen] = useState(false)
  const [focusRegion, setFocusRegion] = useState(null)
  const refs = useRef({})

  const jump = (id) => {
    refs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setNavOpen(false)
  }
  const jumpToRegion = (region) => {
    refs.current.regions?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setFocusRegion(region) // RegionExplorer opens + centers the card
  }

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (vis[0]) setActive(vis[0].target.id)
      },
      { rootMargin: '-20% 0px -70% 0px' },
    )
    Object.values(refs.current).forEach((el) => el && obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const body = {
    'around-us': <SpectrumAroundUs band={band} onJumpToRegion={jumpToRegion} />,
    waves: <WaveExplainer band={band} onOpenAnimation={onOpenAnimation} />,
    matter: <LightMeetsMatter band={band} onOpenAnimation={onOpenAnimation} />,
    atmosphere: <AtmosphereWindows band={band} />,
    'energy-image': <EnergyToImage band={band} onOpenAnimation={onOpenAnimation} />,
    regions: <RegionExplorer band={band} focusId={focusRegion} />,
    'radiation-budget': <RadiationBudget band={band} />,
    'remote-sensing': <RemoteSensingConnections />,
    review: <EmsReview />,
    sources: <EmsSources />,
  }

  return (
    <main className="order-1 flex-1 overflow-y-auto overflow-x-hidden scroll-soft px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
      {/* top controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 rounded-full bg-cream px-4 py-2 text-sm font-bold text-ink/80 transition-all hover:-translate-x-0.5 hover:text-ink">
          <Icon name="back" className="h-4 w-4" />
          Back to lessons
        </button>
        <div className="inline-flex items-center gap-1 rounded-full bg-cream p-1">
          <span className="px-2 text-xs font-bold text-faint">Grade</span>
          {GRADE_BANDS.map((g) => (
            <button key={g.id} onClick={() => setBand(g.id)} aria-pressed={band === g.id}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${band === g.id ? 'bg-ink text-app shadow-soft' : 'text-muted hover:text-ink'}`}>
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* header */}
      <header className="mt-4 max-w-3xl">
        <div className="flex flex-wrap gap-2">
          {HEADER.chips.map((c) => (
            <span key={c} className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted shadow-soft">{c}</span>
          ))}
        </div>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">{HEADER.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">{HEADER.subtitle}</p>
      </header>

      {/* nav + content */}
      <div className="mt-6 lg:grid lg:grid-cols-[15rem_1fr] lg:gap-8">
        {/* in-page nav */}
        <aside className="mb-4 lg:mb-0 lg:sticky lg:top-6 lg:self-start">
          <nav aria-label="Explore this lesson" className="rounded-panel bg-surface p-3 shadow-soft">
            <button
              onClick={() => setNavOpen((o) => !o)}
              aria-expanded={navOpen}
              className="flex w-full items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-left text-xs font-extrabold uppercase tracking-wide text-faint lg:cursor-default lg:hover:bg-transparent"
            >
              Explore this lesson
              <Icon name="chevron" className={`h-4 w-4 transition-transform lg:hidden ${navOpen ? 'rotate-90' : ''}`} />
            </button>
            <ul className={`mt-1 space-y-0.5 ${navOpen ? 'block' : 'hidden'} lg:block`}>
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => jump(s.id)}
                    aria-current={active === s.id ? 'true' : undefined}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition-all ${active === s.id ? 'bg-ink text-app shadow-soft' : 'text-ink/70 hover:bg-cream hover:text-ink'}`}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* sections */}
        <div className="min-w-0 space-y-12">
          {/* intro video: a tour of the spectrum */}
          <div className="rounded-panel bg-surface p-4 shadow-soft sm:p-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-faint">
              Watch first: a tour of the spectrum
            </p>
            <MediaVideo video={VIDEOS['electromagnetic-spectrum']} />
          </div>

          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} ref={(el) => (refs.current[s.id] = el)} className="scroll-mt-6">
              {body[s.id]}
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
