import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

const BASE = import.meta.env.BASE_URL

const LESSON_NAV = [
  {
    id: 'earth-observation',
    number: 'Intro',
    title: 'Earth systems & observation',
    parts: ['A connected planet', 'Why observe Earth?'],
  },
  {
    id: 'defining-remote-sensing',
    number: '01',
    title: 'Defining remote sensing',
    parts: ['Remote vs. in situ', 'Everyday examples', 'Passive vs. active'],
  },
  {
    id: 'electromagnetic-radiation',
    number: '02',
    title: 'Electromagnetic radiation',
    parts: ['Wave anatomy', 'Energy and wavelength', 'Interaction with matter'],
  },
  {
    id: 'electromagnetic-spectrum',
    number: '03',
    title: 'The electromagnetic spectrum',
    parts: ['Earth-observing regions', 'Solar radiation', 'Earth’s emitted energy'],
  },
  {
    id: 'spectral-signatures',
    number: '04',
    title: 'Spectral signatures',
    parts: ['Reflectance patterns', 'Reading Earth materials'],
  },
  {
    id: 'atmospheric-interference',
    number: '05',
    title: 'Atmospheric interference',
    parts: ['Scattering and absorption', 'Atmospheric windows'],
  },
  {
    id: 'energy-to-information',
    number: '06',
    title: 'From energy to information',
    parts: ['The observation chain', 'From measurement to meaning'],
  },
]

const REFERENCES = [
  {
    name: 'Fundamentals of Remote Sensing',
    organization: 'NASA Applied Remote Sensing Training Program (ARSET)',
    url: 'https://appliedsciences.nasa.gov/sites/default/files/2022-11/Fundamentals_of_RS_Edited_SC.pdf',
  },
  {
    name: 'Remote Sensing',
    organization: 'NASA Earth Observatory',
    url: 'https://science.nasa.gov/earth/earth-observatory/remote-sensing/',
  },
  {
    name: 'Fundamentals of Remote Sensing',
    organization: 'NASA Earthdata',
    url: 'https://www.earthdata.nasa.gov/learn/trainings/fundamentals-remote-sensing',
  },
  {
    name: 'The Electromagnetic Spectrum',
    organization: 'NASA Science',
    url: 'https://science.nasa.gov/ems/',
  },
  {
    name: 'Water Falls: Getting the Big Picture',
    organization: 'NASA Scientific Visualization Studio / Goddard Space Flight Center',
    url: 'https://svs.gsfc.nasa.gov/11877/',
  },
  {
    name: 'Earth Systems: Matter and Energy Cycles',
    organization: 'NASA Science',
    url: 'https://science.nasa.gov/learn/heat/resource/earth-systems-matter-and-energy-cycles/',
  },
  {
    name: 'What is Remote Sensing?',
    organization: 'USGS',
    url: 'https://www.usgs.gov/faqs/what-remote-sensing-and-what-it-used',
  },
  {
    name: 'What is remote sensing?',
    organization: 'NOAA National Ocean Service',
    url: 'https://oceanservice.noaa.gov/facts/remotesensing.html',
  },
  {
    name: 'Fundamentals of Remote Sensing',
    organization: 'Esri ArcGIS StoryMaps',
    url: 'https://storymaps.arcgis.com/stories/f9f63a4deca24d7b8dbe034dad60afbd',
  },
]

const MATERIAL_ROWS = [
  {
    material: 'Healthy vegetation',
    signal: 'Absorbs much of the visible red and blue light; strongly reflects near-infrared.',
    use: 'Plant vigor, crop condition, forest change',
    color: '#67c46a',
  },
  {
    material: 'Water',
    signal: 'Often dark in near- and shortwave-infrared because water absorbs those wavelengths.',
    use: 'Shorelines, flooding, surface water',
    color: '#4c87da',
  },
  {
    material: 'Soil',
    signal: 'Reflectance often rises gradually from visible into infrared, modified by moisture and minerals.',
    use: 'Bare ground, moisture, mineral mapping',
    color: '#b78555',
  },
  {
    material: 'Snow & ice',
    signal: 'Bright in visible light; absorption becomes stronger at selected near- and shortwave-infrared wavelengths.',
    use: 'Snow cover, ice discrimination, melt',
    color: '#c9e9f1',
  },
  {
    material: 'Built surfaces',
    signal: 'Concrete, asphalt, roofs, and other materials produce varied responses across spectral bands.',
    use: 'Urban growth, impervious surface mapping',
    color: '#a1999d',
  },
]

const PIPELINE = [
  ['01', 'Energy source', 'Usually sunlight; active sensors supply their own pulse.'],
  ['02', 'Atmosphere', 'Energy may be scattered, absorbed, or transmitted.'],
  ['03', 'Earth’s surface', 'Land, water, ice, and vegetation interact with the energy.'],
  ['04', 'Returning energy', 'Reflected or emitted energy travels toward the instrument.'],
  ['05', 'Sensor', 'A detector records energy in selected wavelength bands.'],
  ['06', 'Information', 'Calibration and analysis turn measurements into maps and knowledge.'],
]

function goToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function SourceMark({ children }: { children: ReactNode }) {
  return (
    <span className="ml-1 whitespace-nowrap text-[0.72em] font-bold uppercase tracking-[0.12em] text-[#3166df]">
      {children}
    </span>
  )
}

function MediaCredit({
  children,
  href,
}: {
  children: ReactNode
  href?: string
}) {
  const content = (
    <>
      <span className="font-semibold text-black/75">Credit:</span> {children}
      {href ? <span aria-hidden="true"> ↗</span> : null}
    </>
  )

  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="mt-2 block text-[11px] leading-5 text-black/48 underline-offset-4 hover:text-black hover:underline"
    >
      {content}
    </a>
  ) : (
    <figcaption className="mt-2 text-[11px] leading-5 text-black/48">{content}</figcaption>
  )
}

function SectionTitle({
  number,
  eyebrow,
  title,
  intro,
  dark = false,
}: {
  number: string
  eyebrow: string
  title: string
  intro: string
  dark?: boolean
}) {
  return (
    <header className={`grid gap-5 border-t pt-6 sm:grid-cols-[5rem_minmax(0,1fr)] ${dark ? 'border-white/20' : 'border-black/20'}`}>
      <span className={`text-[12px] font-bold tracking-[0.16em] ${dark ? 'text-white/45' : 'text-black/45'}`}>{number}</span>
      <div>
        <p className={`text-[11px] font-bold uppercase tracking-[0.2em] ${dark ? 'text-[#91b3ff]' : 'text-[#3166df]'}`}>{eyebrow}</p>
        <h2 className={`mt-3 max-w-[15ch] text-4xl font-medium leading-[0.98] tracking-[-0.055em] sm:text-5xl lg:text-6xl ${dark ? 'text-white' : 'text-black'}`}>
          {title}
        </h2>
        <p className={`mt-6 max-w-3xl text-lg leading-8 ${dark ? 'text-white/66' : 'text-black/66'}`}>{intro}</p>
      </div>
    </header>
  )
}

function VideoFigure({
  src,
  title,
  credit,
  href,
}: {
  src: string
  title: string
  credit: string
  href?: string
}) {
  return (
    <figure>
      <div className="overflow-hidden bg-black">
        <video
          className="aspect-video w-full object-cover"
          controls
          playsInline
          preload="metadata"
          aria-label={title}
        >
          <source src={`${BASE}${src}`} />
          Your browser does not support embedded video.
        </video>
      </div>
      <MediaCredit href={href}>{credit}</MediaCredit>
    </figure>
  )
}

function ImageFigure({
  src,
  alt,
  credit,
  href,
  className = '',
}: {
  src: string
  alt: string
  credit: string
  href?: string
  className?: string
}) {
  return (
    <figure className={className}>
      <div className="overflow-hidden bg-[#111]">
        <img src={`${BASE}${src}`} alt={alt} loading="lazy" className="h-full w-full object-cover" />
      </div>
      <MediaCredit href={href}>{credit}</MediaCredit>
    </figure>
  )
}

function LessonSidebar({
  activeId,
  onBack,
}: {
  activeId: string
  onBack: () => void
}) {
  return (
    <aside className="hidden h-full border-r border-black/15 bg-[#f0f0ed] lg:sticky lg:top-0 lg:flex lg:w-[19rem] lg:shrink-0 lg:self-start lg:flex-col">
      <div className="border-b border-black/15 px-5 py-5">
        <button
          type="button"
          onClick={onBack}
          className="group flex items-center gap-3 text-sm font-medium text-black/65 hover:text-black"
        >
          <span className="transition-transform group-hover:-translate-x-1" aria-hidden="true">←</span>
          Lessons
        </button>
        <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-black/42">Lesson 01</p>
        <p className="mt-1 text-xl font-medium leading-tight tracking-[-0.025em] text-black">What Is Remote Sensing?</p>
      </div>

      <nav aria-label="Remote sensing lesson sections" className="min-h-0 flex-1 overflow-y-auto py-2">
        {LESSON_NAV.map((section) => {
          const active = activeId === section.id
          return (
            <details key={section.id} open className="group border-b border-black/10">
              <summary
                className={`flex cursor-pointer list-none items-start gap-3 px-5 py-3.5 marker:hidden ${
                  active ? 'bg-black text-white' : 'text-black/70 hover:bg-black/[0.045] hover:text-black'
                }`}
                onClick={(event) => {
                  event.preventDefault()
                  goToSection(section.id)
                }}
              >
                <span className={`mt-0.5 w-8 shrink-0 text-[10px] font-bold tracking-[0.12em] ${active ? 'text-white/55' : 'text-black/35'}`}>
                  {section.number}
                </span>
                <span className="min-w-0 flex-1 text-[13px] font-semibold leading-5">{section.title}</span>
                <span className="mt-0.5 text-xs opacity-50" aria-hidden="true">⌄</span>
              </summary>
              <div className="space-y-1 px-5 py-3 pl-16">
                {section.parts.map((part) => (
                  <button
                    key={part}
                    type="button"
                    onClick={() => goToSection(section.id)}
                    className="block w-full py-1 text-left text-[12px] leading-4 text-black/48 hover:text-black"
                  >
                    {part}
                  </button>
                ))}
              </div>
            </details>
          )
        })}
      </nav>
    </aside>
  )
}

export default function WhatIsRemoteSensing({ onBack }: { onBack: () => void }) {
  const mainRef = useRef<HTMLElement | null>(null)
  const [activeId, setActiveId] = useState(LESSON_NAV[0].id)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const sectionIds = useMemo(() => LESSON_NAV.map((item) => item.id), [])

  useEffect(() => {
    const root = mainRef.current
    if (!root) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible?.target.id) setActiveId(visible.target.id)
      },
      { root, rootMargin: '-12% 0px -68% 0px', threshold: [0, 0.08, 0.2, 0.45] },
    )

    sectionIds.forEach((id) => {
      const section = document.getElementById(id)
      if (section) observer.observe(section)
    })
    return () => observer.disconnect()
  }, [sectionIds])

  return (
    <main
      ref={mainRef}
      className="cm-remote-sensing rs-lesson order-1 flex flex-1 overflow-y-auto bg-[#f7f7f4] text-black lg:min-h-0"
    >
      <LessonSidebar activeId={activeId} onBack={onBack} />

      <div className="min-w-0 flex-1">
        <div className="sticky top-0 z-30 border-b border-black/15 bg-[#f7f7f4]/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <button type="button" onClick={onBack} className="text-sm font-medium text-black/65">← Lessons</button>
            <button
              type="button"
              onClick={() => setMobileNavOpen((open) => !open)}
              aria-expanded={mobileNavOpen}
              className="border border-black/20 px-3 py-2 text-xs font-semibold"
            >
              {LESSON_NAV.find((item) => item.id === activeId)?.number} · Sections
            </button>
          </div>
          {mobileNavOpen ? (
            <nav className="mt-3 grid border-t border-black/15 pt-3">
              {LESSON_NAV.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => {
                    goToSection(section.id)
                    setMobileNavOpen(false)
                  }}
                  className={`flex gap-3 px-2 py-2 text-left text-sm ${
                    activeId === section.id ? 'bg-black text-white' : 'text-black/65'
                  }`}
                >
                  <span className="w-10 text-[10px] font-bold tracking-widest opacity-55">{section.number}</span>
                  <span>{section.title}</span>
                </button>
              ))}
            </nav>
          ) : null}
        </div>

        <article>
          <section
            id="earth-observation"
            className="scroll-mt-20 bg-black px-5 pb-14 pt-14 text-white sm:px-8 lg:px-14 lg:pb-20 lg:pt-20 xl:px-20"
          >
            <div className="mx-auto max-w-[1180px]">
              <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(30rem,1.05fr)] lg:items-end">
                <header>
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#91b3ff]">
                    Earth observation · Lesson 01
                  </p>
                  <h1 className="mt-5 max-w-[9ch] text-6xl font-medium leading-[0.9] tracking-[-0.065em] sm:text-7xl xl:text-[6.4rem]">
                    What Is Remote Sensing?
                  </h1>
                  <p className="mt-7 max-w-xl text-lg leading-8 text-white/64">
                    Before studying sensors, begin with the planet they observe: a connected system of air,
                    water, land, ice, and life. NASA combines satellite, airborne, and ground observations to
                    examine how those parts exchange matter and energy.
                    <SourceMark>NASA Earth Science</SourceMark>
                  </p>
                </header>

                <div className="grid grid-cols-2 border-l border-t border-white/20 sm:grid-cols-3">
                  {['Atmosphere', 'Hydrosphere', 'Geosphere', 'Biosphere', 'Cryosphere', 'Human systems'].map((sphere, index) => (
                    <div key={sphere} className="min-h-24 border-b border-r border-white/20 p-4">
                      <span className="text-[10px] font-bold tracking-[0.18em] text-white/35">0{index + 1}</span>
                      <p className="mt-4 text-sm font-medium">{sphere}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-14">
                <VideoFigure
                  src="assets/videos/layered_pairs_720p.mp4"
                  title="NASA visualization of interacting layers of the Earth system"
                  credit="NASA’s Goddard Space Flight Center"
                />
              </div>

              <div className="mt-12 grid gap-px bg-white/20 lg:grid-cols-2">
                <div className="bg-black p-6 sm:p-8">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#91b3ff]">Earth as a system</p>
                  <p className="mt-4 text-xl leading-8 text-white/82">
                    Changes in one sphere can move through the others. Sunlight, water, carbon, heat, and living
                    organisms connect processes that unfold from minutes to decades.
                  </p>
                </div>
                <div className="bg-black p-6 sm:p-8">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#91b3ff]">The observing view</p>
                  <p className="mt-4 text-xl leading-8 text-white/82">
                    Repeated observations reveal patterns that are difficult to see from one location—storms,
                    seasonal vegetation, ocean conditions, wildfire effects, and long-term change.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section
            id="defining-remote-sensing"
            className="scroll-mt-20 px-5 py-16 sm:px-8 lg:px-14 lg:py-24 xl:px-20"
          >
            <div className="mx-auto max-w-[1180px]">
              <SectionTitle
                number="01"
                eyebrow="Foundations"
                title="Defining remote sensing"
                intro="NASA Earth Observatory defines remote sensing as identifying, observing, and measuring an object without direct contact—by detecting reflected or emitted radiation."
              />

              <div className="mt-12">
                <VideoFigure
                  src="assets/videos/Remote_Sensing_Final_youtube_hq.mov"
                  title="Water Falls: Getting the Big Picture"
                  credit="NASA’s Goddard Space Flight Center"
                  href="https://svs.gsfc.nasa.gov/11877/"
                />
              </div>

              <div className="mt-14 grid border-l border-t border-black/20 md:grid-cols-2">
                <div className="border-b border-r border-black/20 p-6 sm:p-8">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/42">Remote observation</p>
                  <h3 className="mt-4 text-2xl font-medium tracking-[-0.03em]">Measure from a distance</h3>
                  <p className="mt-4 leading-7 text-black/64">
                    Instruments aboard satellites or aircraft measure energy associated with distant targets.
                    A camera, a satellite radiometer, and weather radar are all remote-sensing systems.
                  </p>
                </div>
                <div className="border-b border-r border-black/20 p-6 sm:p-8">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/42">In-situ observation</p>
                  <h3 className="mt-4 text-2xl font-medium tracking-[-0.03em]">Measure at the location</h3>
                  <p className="mt-4 leading-7 text-black/64">
                    Thermometers, rain gauges, water samples, and field spectrometers take measurements at or
                    very near the target. These observations help verify and interpret remotely sensed data.
                  </p>
                </div>
              </div>

              <div className="mt-12 grid gap-5 lg:grid-cols-2">
                <div className="bg-[#e7edff] p-6 sm:p-8">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#3156ad]">Passive</span>
                  <h3 className="mt-3 text-3xl font-medium tracking-[-0.04em]">Receives available energy</h3>
                  <p className="mt-4 leading-7 text-black/65">
                    Passive sensors detect naturally available radiation, such as sunlight reflected by a surface
                    or thermal infrared energy emitted by Earth.
                  </p>
                </div>
                <div className="bg-[#ffe8d8] p-6 sm:p-8">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9a4c20]">Active</span>
                  <h3 className="mt-3 text-3xl font-medium tracking-[-0.04em]">Sends and measures a pulse</h3>
                  <p className="mt-4 leading-7 text-black/65">
                    Active instruments supply energy and measure the returning signal. Radar and lidar are common
                    Earth-observing examples.
                  </p>
                </div>
              </div>

              <p className="mt-5 text-xs leading-5 text-black/42">
                Source basis: NASA ARSET, NASA Earthdata, NASA Earth Observatory, and USGS.
              </p>
            </div>
          </section>

          <section
            id="electromagnetic-radiation"
            className="scroll-mt-20 bg-[#ecece8] px-5 py-16 sm:px-8 lg:px-14 lg:py-24 xl:px-20"
          >
            <div className="mx-auto max-w-[1180px]">
              <SectionTitle
                number="02"
                eyebrow="Energy"
                title="Electromagnetic radiation"
                intro="Electromagnetic radiation transports energy in waves. A wave’s wavelength and frequency are inversely related; higher-frequency radiation carries more energy per photon."
              />

              <div className="mt-14 grid gap-7 lg:grid-cols-2">
                <ImageFigure
                  src="assets/animations/nasa/wave-anatomy.jpg"
                  alt="NASA illustration showing the anatomy of an electromagnetic wave"
                  credit="NASA Science / Goddard Space Flight Center"
                  href="https://science.nasa.gov/ems/02_anatomy/"
                />
                <div className="grid content-start gap-px bg-black/15 sm:grid-cols-2">
                  {[
                    ['Wavelength', 'Distance between matching points on successive waves.'],
                    ['Frequency', 'Number of wave cycles passing a point each second.'],
                    ['Amplitude', 'A measure associated with the strength or intensity of the wave.'],
                    ['Energy', 'Photon energy increases as frequency rises and wavelength shortens.'],
                  ].map(([title, copy]) => (
                    <div key={title} className="bg-[#ecece8] p-5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/38">{title}</p>
                      <p className="mt-3 text-sm leading-6 text-black/66">{copy}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-16">
                <h3 className="max-w-xl text-3xl font-medium tracking-[-0.04em]">When energy meets matter</h3>
                <p className="mt-4 max-w-3xl leading-7 text-black/64">
                  What a sensor detects depends on how incoming energy interacts with the atmosphere and surface.
                  NASA’s electromagnetic-spectrum materials describe common behaviors including reflection,
                  absorption, transmission, emission, and scattering.
                </p>
                <div className="mt-8 grid border-l border-t border-black/20 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    ['Reflection', 'Energy changes direction at a surface and travels away from it.'],
                    ['Absorption', 'Matter takes in energy; the missing wavelengths become diagnostic clues.'],
                    ['Transmission', 'Energy passes through a material or through the atmosphere.'],
                    ['Emission', 'Matter releases electromagnetic energy, strongly influenced by temperature.'],
                  ].map(([title, copy], index) => (
                    <div key={title} className="min-h-48 border-b border-r border-black/20 p-5">
                      <span className="text-[10px] font-bold tracking-[0.16em] text-[#3166df]">0{index + 1}</span>
                      <h4 className="mt-8 text-xl font-medium">{title}</h4>
                      <p className="mt-3 text-sm leading-6 text-black/58">{copy}</p>
                    </div>
                  ))}
                </div>
                <ImageFigure
                  className="mt-10"
                  src="assets/animations/nasa/wave-behaviors.png"
                  alt="NASA visualization illustrating electromagnetic wave behaviors"
                  credit="NASA Science / Goddard Space Flight Center"
                  href="https://science.nasa.gov/ems/03_behaviors/"
                />
              </div>
            </div>
          </section>

          <section
            id="electromagnetic-spectrum"
            className="scroll-mt-20 bg-black px-5 py-16 text-white sm:px-8 lg:px-14 lg:py-24 xl:px-20"
          >
            <div className="mx-auto max-w-[1180px]">
              <SectionTitle
                number="03"
                eyebrow="Wavelength regions"
                title="The electromagnetic spectrum"
                intro="The spectrum extends from long radio waves to short gamma rays. Human vision occupies only a narrow interval; Earth-observing instruments also use infrared and microwave regions."
                dark
              />

              <ImageFigure
                className="mt-14 [&_figcaption]:!text-white/45"
                src="assets/animations/nasa/electromagnetic-spectrum.jpg"
                alt="NASA diagram of regions of the electromagnetic spectrum"
                credit="NASA Science / Goddard Space Flight Center"
                href="https://science.nasa.gov/ems/"
              />

              <div className="mt-14 grid gap-px bg-white/20 md:grid-cols-2 xl:grid-cols-4">
                {[
                  ['Visible', 'Reflected sunlight supports natural-color and many land, ocean, and cloud observations.'],
                  ['Near & shortwave IR', 'Useful for vegetation, moisture, snow, burn scars, and mineral differences.'],
                  ['Thermal IR', 'Measures emitted energy related to surface and cloud-top temperature.'],
                  ['Microwave', 'Supports radar and radiometry; selected wavelengths can observe through clouds.'],
                ].map(([title, copy]) => (
                  <div key={title} className="min-h-48 bg-black p-5">
                    <h3 className="text-xl font-medium">{title}</h3>
                    <p className="mt-4 text-sm leading-6 text-white/58">{copy}</p>
                  </div>
                ))}
              </div>

              <div className="mt-16 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#91b3ff]">Solar radiation</p>
                  <h3 className="mt-4 text-4xl font-medium tracking-[-0.05em]">Reflected and emitted are not the same.</h3>
                </div>
                <div className="grid gap-6 text-lg leading-8 text-white/68">
                  <p>
                    For many passive observations, the Sun is the illumination source. Solar energy travels through
                    the atmosphere, interacts with Earth, and a portion is reflected toward the sensor.
                  </p>
                  <p>
                    Earth also emits thermal infrared energy. A sensor can therefore measure energy originating
                    from Earth itself, not only reflected sunlight. NASA describes reflected, absorbed, and emitted
                    energy together as parts of Earth’s radiation budget.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section
            id="spectral-signatures"
            className="scroll-mt-20 px-5 py-16 sm:px-8 lg:px-14 lg:py-24 xl:px-20"
          >
            <div className="mx-auto max-w-[1180px]">
              <SectionTitle
                number="04"
                eyebrow="Material clues"
                title="Spectral signatures"
                intro="Materials do not reflect and absorb every wavelength equally. Plotting reflectance against wavelength creates a pattern—a spectral signature—that helps analysts distinguish surface features."
              />

              <div className="mt-14 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                <ImageFigure
                  src="assets/animations/nasa/spectral-signature.jpg"
                  alt="NASA field spectrometer imagery used to study spectral reflectance"
                  credit="NASA Goddard Space Flight Center / NASA STELLA"
                />
                <ImageFigure
                  src="assets/animations/nasa/visible-infrared.jpg"
                  alt="NASA comparison of visible and infrared observations"
                  credit="NASA Science / Goddard Space Flight Center"
                  href="https://science.nasa.gov/ems/07_reflected-near-infrared-waves/"
                />
              </div>

              <div className="mt-14 overflow-hidden border border-black/20">
                {MATERIAL_ROWS.map((row, index) => (
                  <div
                    key={row.material}
                    className={`grid gap-4 p-5 sm:grid-cols-[13rem_minmax(0,1fr)_minmax(0,0.75fr)] sm:p-6 ${
                      index ? 'border-t border-black/15' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: row.color }} />
                      <h3 className="font-semibold">{row.material}</h3>
                    </div>
                    <p className="text-sm leading-6 text-black/62">{row.signal}</p>
                    <p className="text-sm leading-6 text-black/42">{row.use}</p>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-xs leading-5 text-black/42">
                These are broad instructional patterns; moisture, condition, viewing geometry, atmosphere, and
                sensor bands can change measured responses. Source basis: NASA Earth Observatory and NASA EMS.
              </p>
            </div>
          </section>

          <section
            id="atmospheric-interference"
            className="scroll-mt-20 bg-[#dfe8f2] px-5 py-16 sm:px-8 lg:px-14 lg:py-24 xl:px-20"
          >
            <div className="mx-auto max-w-[1180px]">
              <SectionTitle
                number="05"
                eyebrow="Between surface and sensor"
                title="Atmospheric interference"
                intro="Energy must travel through the atmosphere before many sensors can measure it. Gases and particles can redirect or remove portions of the signal, so the atmosphere is part of every observation."
              />

              <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {[
                  ['Scattering', 'Molecules and particles redirect energy. Shorter visible wavelengths are especially susceptible to molecular scattering.'],
                  ['Absorption', 'Water vapor, carbon dioxide, ozone, and other gases absorb selected wavelength ranges.'],
                  ['Clouds & aerosols', 'Cloud droplets, smoke, dust, and haze can obscure a surface or alter the measured signal.'],
                  ['Transmission', 'At selected wavelengths, much of the radiation can pass through the atmosphere to or from the surface.'],
                ].map(([title, copy]) => (
                  <div key={title} className="border-t border-black/30 pt-5">
                    <h3 className="text-xl font-medium">{title}</h3>
                    <p className="mt-4 text-sm leading-6 text-black/60">{copy}</p>
                  </div>
                ))}
              </div>

              <div className="mt-16">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#3156ad]">Atmospheric windows</p>
                <h3 className="mt-4 max-w-3xl text-4xl font-medium tracking-[-0.05em]">
                  Sensors look through wavelength “windows.”
                </h3>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-black/65">
                  NASA Earth Observatory describes atmospheric windows as wavelength ranges where the atmosphere
                  is comparatively transparent. Many instruments place their bands in these windows so useful
                  reflected or emitted energy can reach the detector.
                </p>
                <ImageFigure
                  className="mt-9"
                  src="assets/animations/nasa/atmospheric-windows.png"
                  alt="NASA diagram showing atmospheric transmission windows across wavelengths"
                  credit="NASA Earth Observatory"
                  href="https://science.nasa.gov/earth/earth-observatory/remote-sensing/"
                />
              </div>
            </div>
          </section>

          <section
            id="energy-to-information"
            className="scroll-mt-20 bg-[#f7f7f4] px-5 py-16 sm:px-8 lg:px-14 lg:py-24 xl:px-20"
          >
            <div className="mx-auto max-w-[1180px]">
              <SectionTitle
                number="06"
                eyebrow="Conceptual summary"
                title="From energy to information"
                intro="Remote sensing is a measurement chain. Each link influences what the final image, map, or data product can tell us."
              />

              <div className="mt-14 grid border-l border-t border-black/20 md:grid-cols-2 xl:grid-cols-3">
                {PIPELINE.map(([number, title, copy]) => (
                  <div key={number} className="min-h-52 border-b border-r border-black/20 p-5 sm:p-6">
                    <span className="text-[10px] font-bold tracking-[0.18em] text-[#3166df]">{number}</span>
                    <h3 className="mt-10 text-2xl font-medium tracking-[-0.03em]">{title}</h3>
                    <p className="mt-3 text-sm leading-6 text-black/58">{copy}</p>
                  </div>
                ))}
              </div>

              <div className="mt-14 bg-black p-6 text-white sm:p-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#91b3ff]">Observation chain</p>
                <p className="mt-6 text-2xl font-medium leading-relaxed tracking-[-0.025em] sm:text-3xl">
                  Energy source <span className="text-white/35">→</span> atmosphere <span className="text-white/35">→</span> Earth’s surface
                  <span className="text-white/35"> → </span> reflected or emitted energy <span className="text-white/35">→</span> sensor
                  <span className="text-white/35"> → </span> information
                </p>
              </div>

              <div className="mt-20 border-t border-black/20 pt-8">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/42">References & further study</p>
                <h3 className="mt-4 text-4xl font-medium tracking-[-0.05em]">Authoritative sources</h3>
                <p className="mt-4 max-w-3xl leading-7 text-black/58">
                  Lesson explanations are condensed and paraphrased from the official sources below. Media credits
                  are listed directly beneath each visual.
                </p>
                <ol className="mt-10 border-t border-black/20">
                  {REFERENCES.map((reference, index) => (
                    <li key={reference.url} className="grid gap-3 border-b border-black/15 py-5 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:items-center">
                      <span className="text-[11px] font-bold tracking-[0.15em] text-black/35">{String(index + 1).padStart(2, '0')}</span>
                      <div>
                        <p className="font-semibold">{reference.name}</p>
                        <p className="mt-1 text-sm text-black/48">{reference.organization}</p>
                      </div>
                      <a
                        href={reference.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-[#3156ad] underline-offset-4 hover:underline"
                      >
                        Open source ↗
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </section>
        </article>
      </div>
    </main>
  )
}
