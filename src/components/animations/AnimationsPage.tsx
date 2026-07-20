// @ts-nocheck
import { useEffect, useState } from 'react'
import '@fontsource/baloo-2/600.css'
import '@fontsource/baloo-2/700.css'
import '@fontsource/baloo-2/800.css'
import Icon from '../Icon'
import AnimationCard from './AnimationCard'
import GradeLevelToggle from './GradeLevelToggle'
import {
  PhotonField,
  DoodlePrism,
  DoodleFlashlight,
  DoodleBulb,
  DoodleSun,
  DoodleRainbow,
  RAINBOW,
} from './labDoodles'
import { ANIMATIONS, DEFAULT_GRADE, getAnimation } from '../../data/animationContent'
import { loadVisited, markVisited } from '../../utils/labNotebook'

import ElectromagneticSpectrumSlider from './ElectromagneticSpectrumSlider'
import WaveAnatomyAnimation from './WaveAnatomyAnimation'
import WaveBehaviorsAnimation from './WaveBehaviorsAnimation'
import VisibleInfraredToggle from './VisibleInfraredToggle'
import SpectralSignatureBuilder from './SpectralSignatureBuilder'
import AtmosphericWindowsAnimation from './AtmosphericWindowsAnimation'

// id → interactive component
const REGISTRY = {
  spectrumSlider: ElectromagneticSpectrumSlider,
  waveAnatomy: WaveAnatomyAnimation,
  waveBehaviors: WaveBehaviorsAnimation,
  visibleInfrared: VisibleInfraredToggle,
  signatureBuilder: SpectralSignatureBuilder,
  atmosphericWindows: AtmosphericWindowsAnimation,
}

// Pastel accents keyed like the data's color tokens.
const ACCENT = {
  pink: '#F7BFC4',
  yellow: '#FFE2AC',
  lavender: '#D8D2FF',
  cardmint: '#BDEFD8',
  blue: '#CDEBFF',
  coral: '#F7A7A7',
}

// The "experiments tried" notebook strip: one stamp per animation.
function LabNotebook({ visited }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.04] px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Icon name="book" className="h-5 w-5 text-amber-300" />
          <span className="font-game text-sm font-bold text-white">
            Experiments tried: {visited.length} / {ANIMATIONS.length}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {ANIMATIONS.map((a) => {
            const done = visited.includes(a.id)
            const accent = ACCENT[a.color]
            return (
              <span
                key={a.id}
                title={done ? `${a.title}: tried!` : `${a.title}: not tried yet`}
                className={`grid h-9 w-9 place-items-center rounded-full border-2 transition-transform hover:scale-110 ${
                  done ? 'border-transparent' : 'border-dashed border-white/20 opacity-50'
                }`}
                style={done ? { backgroundColor: `${accent}30`, borderColor: `${accent}80` } : undefined}
              >
                <Icon
                  name={a.icon}
                  className="h-4 w-4"
                  style={{ color: done ? accent : 'rgb(255 255 255 / 0.35)' }}
                />
              </span>
            )
          })}
        </div>
      </div>
      <p className="mt-1.5 text-[11px] text-white/40">
        Open an experiment to stamp your lab notebook. Can you try all {ANIMATIONS.length}?
      </p>
    </div>
  )
}

export default function AnimationsPage({ initialId = null }) {
  const [gradeLevel, setGradeLevel] = useState(DEFAULT_GRADE)
  const [selectedId, setSelectedId] = useState(initialId)
  const [visited, setVisited] = useState(loadVisited)

  // deep-link: open a specific module when navigated here from a lesson
  useEffect(() => {
    if (initialId) setSelectedId(initialId)
  }, [initialId])

  // stamp the notebook whenever an experiment is opened
  useEffect(() => {
    if (selectedId) setVisited(markVisited(selectedId))
  }, [selectedId])

  const selected = selectedId ? getAnimation(selectedId) : null
  const SelectedComponent = selectedId ? REGISTRY[selectedId] : null
  const accent = selected ? ACCENT[selected.color] : null

  const backButton = (
    <button
      onClick={() => setSelectedId(null)}
      className="inline-flex items-center gap-1.5 rounded-full border-2 border-white/10 bg-white/5 px-4 py-2 font-game text-sm font-bold text-white/80 transition-colors hover:border-white/25 hover:bg-white/10 hover:text-white"
    >
      <Icon name="back" className="h-4 w-4" />
      Light Lab
    </button>
  )

  return (
    <main className="order-1 relative flex-1 overflow-x-hidden overflow-y-auto scroll-soft bg-[#070d24] lg:order-2">
      <PhotonField />

      {!selected ? (
        <div className="relative px-5 py-8 sm:px-8 lg:px-10">
          {/* floating doodles */}
          <div aria-hidden="true" className="pointer-events-none absolute left-[3%] top-24 hidden md:block" style={{ '--tilt': '-7deg' }}>
            <div className="g-float"><DoodleFlashlight className="h-16 w-16" /></div>
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute right-[4%] top-16 hidden md:block" style={{ '--tilt': '5deg' }}>
            <div className="g-float" style={{ animationDelay: '1.4s' }}><DoodleSun className="h-16 w-16" /></div>
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute right-[14%] top-56 hidden lg:block" style={{ '--tilt': '-4deg' }}>
            <div className="g-float" style={{ animationDelay: '2.6s' }}><DoodleBulb className="h-14 w-14" /></div>
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute left-[10%] top-64 hidden lg:block">
            <div className="g-float" style={{ animationDelay: '0.7s' }}><DoodleRainbow className="h-12 w-20" /></div>
          </div>

          {/* ---------- header ---------- */}
          <header className="mx-auto max-w-3xl text-center">
            <div className="mx-auto flex items-center justify-center gap-2">
              <div className="g-wobble"><DoodlePrism className="h-16 w-20 sm:h-20 sm:w-24" /></div>
              <h1 className="font-game text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                The{' '}
                <span className="bg-gradient-to-r from-rose-300 via-amber-200 to-sky-300 bg-clip-text text-transparent">
                  Light Lab
                </span>
              </h1>
            </div>

            {/* rainbow squiggle underline */}
            <svg viewBox="0 0 260 18" className="mx-auto mt-1 h-4 w-56" fill="none" aria-hidden="true">
              {RAINBOW.slice(0, 3).map((c, i) => (
                <path
                  key={c}
                  d={`M6 ${8 + i * 3.5}C40 ${2 + i * 3.5} 80 ${10 + i * 3.5} 120 ${6 + i * 3.5}s80 -${5 - i} 134 ${i}`}
                  stroke={c}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              ))}
            </svg>

            <p className="mx-auto mt-3 max-w-xl font-game text-[15px] leading-relaxed text-sky-100/80 sm:text-base">
              Welcome to the lab! Bend light through prisms, stretch waves, and see the invisible
              colors satellites use. Every experiment stamps your lab notebook.
            </p>
          </header>

          {/* ---------- notebook + grade ---------- */}
          <div className="mx-auto mt-6 max-w-3xl">
            <LabNotebook visited={visited} />
          </div>
          <div className="mx-auto mt-4 flex max-w-3xl justify-center">
            <GradeLevelToggle value={gradeLevel} onChange={setGradeLevel} />
          </div>

          {/* ---------- experiment cards ---------- */}
          <div className="mx-auto mt-7 grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ANIMATIONS.map((a, i) => (
              <AnimationCard
                key={a.id}
                animation={a}
                index={i}
                visited={visited.includes(a.id)}
                onOpen={setSelectedId}
              />
            ))}
          </div>
        </div>
      ) : selected.standalone ? (
        /* standalone module: owns its full detail layout */
        <div className="relative px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
          {backButton}
          <div className="mt-4">
            <SelectedComponent gradeLevel={gradeLevel} onGradeChange={setGradeLevel} />
          </div>
        </div>
      ) : (
        /* detail */
        <div className="relative mx-auto max-w-4xl px-5 py-6 sm:px-8 lg:py-8">
          {backButton}

          {/* title row */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span
              className="grid h-14 w-14 rotate-[-4deg] place-items-center rounded-2xl border-2"
              style={{ backgroundColor: `${accent}26`, borderColor: `${accent}66`, color: accent }}
            >
              <Icon name={selected.icon} className="h-7 w-7" />
            </span>
            <div>
              <div className="font-game text-[11px] font-bold uppercase tracking-wider text-white/40">
                Experiment · {selected.label}
              </div>
              <h2 className="font-game text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                {selected.title}
              </h2>
            </div>
            <span className="ml-auto rounded-full border-2 border-white/10 bg-white/5 px-3.5 py-1.5 font-game text-xs font-bold text-white/60">
              {selected.badge}
            </span>
          </div>

          {/* the interactive animation */}
          <div className="mt-4 rounded-3xl border-2 border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm sm:p-6">
            <SelectedComponent gradeLevel={gradeLevel} />
          </div>

          {/* grade-level explanation */}
          <div className="mt-4 rounded-3xl border-2 border-white/10 bg-white/[0.05] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-game text-sm font-extrabold uppercase tracking-wide text-white/60">
                What's happening
              </h3>
              <GradeLevelToggle value={gradeLevel} onChange={setGradeLevel} />
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/80 sm:text-base">
              {selected.explain[gradeLevel]}
            </p>
          </div>

          {/* info boxes */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border-2 p-5" style={{ borderColor: `${accent}44`, backgroundColor: `${accent}12` }}>
              <h3 className="flex items-center gap-2 font-game text-sm font-extrabold text-white">
                <Icon name="satellite" className="h-4 w-4" style={{ color: accent }} />
                Related to remote sensing
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/70">{selected.remoteSensing}</p>
            </div>
            <div className="rounded-3xl border-2 border-amber-300/30 bg-amber-300/10 p-5">
              <h3 className="flex items-center gap-2 font-game text-sm font-extrabold text-white">
                <Icon name="star" className="h-4 w-4 text-amber-300" />
                Try this
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/70">{selected.tryThis}</p>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
