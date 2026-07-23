// @ts-nocheck
import { useEffect, useState } from 'react'
import '@fontsource/baloo-2/600.css'
import '@fontsource/baloo-2/700.css'
import '@fontsource/baloo-2/800.css'
import Icon from '../Icon'
import GradeLevelToggle from './GradeLevelToggle'
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

const IOSEVKA =
  "'Iosevka', 'Iosevka Nerd Font', 'Iosevka Fixed', 'Roboto Mono', 'SFMono-Regular', Consolas, monospace"

const GALLERY_CARDS = [
  {
    title: 'Electromagnetic Spectrum Slider',
    id: 'spectrumSlider',
    image: 'assets/animations/nasa/electromagnetic-spectrum.jpg',
    alt: 'NASA Goddard Conceptual Image Lab visualization of the electromagnetic spectrum',
  },
  {
    title: 'Wave Anatomy',
    id: 'waveAnatomy',
    image: 'assets/animations/nasa/wave-anatomy.jpg',
    alt: 'NASA Scientific Visualization Studio rendering of electric and magnetic fields in polarized waves',
  },
  {
    title: 'Wave Behaviors',
    id: 'waveBehaviors',
    image: 'assets/animations/nasa/wave-behaviors.png',
    alt: 'NASA Scientific Visualization Studio diagram of radio-wave reflection and refraction in the ionosphere',
  },
  {
    title: 'Visible vs Infrared',
    id: 'visibleInfrared',
    image: 'assets/animations/nasa/visible-infrared.jpg',
    alt: 'NASA Hubble visible-light and near-infrared comparison of the 30 Doradus nebula',
  },
  {
    title: 'Spectral Signature Builder',
    id: 'signatureBuilder',
    image: 'assets/animations/nasa/spectral-signature.jpg',
    alt: 'NASA Hyperion visualization pairing hyperspectral Earth imagery with measured spectral signatures',
  },
  {
    title: 'Atmospheric Windows',
    id: 'atmosphericWindows',
    image: 'assets/animations/nasa/atmospheric-windows.png',
    alt: 'NASA Earth Observatory graph of atmospheric transmission windows by wavelength',
  },
  {
    title: 'Landsat Orbits',
    id: 'visibleInfrared',
    image: 'assets/animations/nasa/landsat-orbit.png',
    alt: 'NASA Scientific Visualization Studio rendering of the Landsat orbit and observation swath',
  },
  {
    title: 'TDRS Fleet 360',
    id: 'waveBehaviors',
    image: 'assets/animations/nasa/tdrs-fleet.jpg',
    alt: 'NASA Scientific Visualization Studio rendering of the Tracking and Data Relay Satellite fleet',
  },
  {
    title: 'Urban Heat Islands',
    id: 'signatureBuilder',
    image: 'assets/animations/nasa/urban-heat.png',
    alt: 'NASA Scientific Visualization Studio map of modeled outgoing thermal radiation over urban areas',
  },
]

function AnimationGalleryCard({ card, index, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(card.id)}
      className="group relative min-h-[220px] overflow-hidden bg-black text-left outline-none sm:min-h-[260px] lg:min-h-[310px]"
      aria-label={`Open ${card.title}`}
    >
      <img
        src={card.image}
        alt={card.alt}
        loading={index < 3 ? 'eager' : 'lazy'}
        className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-[1.035] group-hover:opacity-100"
      />
      <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/25 transition duration-500 group-hover:from-black/65" />
      <span className="absolute inset-x-0 bottom-0 flex min-h-[86px] items-end p-5 sm:p-6">
        <span
          className="text-[1.35rem] font-medium leading-tight text-white drop-shadow-[0_2px_10px_rgb(0_0_0_/_0.8)] sm:text-[1.55rem]"
          style={{ fontFamily: IOSEVKA }}
        >
          {card.title}
        </span>
      </span>
    </button>
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

  return (
    <main className="cm-animations order-1 relative flex-1 overflow-x-hidden overflow-y-auto scroll-soft bg-black lg:order-2">
      {!selected ? (
        <div className="relative min-h-full bg-black">
          <header className="relative h-[35vh] min-h-[240px] max-h-[380px] overflow-hidden border-b border-black bg-black">
            <img
              src="assets/animations/nasa/hero-seeing-earths-magnetism.jpg"
              alt="NASA Scientific Visualization Studio rendering of spacecraft observing Earth’s magnetic environment"
              className="absolute inset-0 h-full w-full object-cover opacity-55"
            />
            <div className="absolute inset-0 bg-black/55" />
            <div className="relative flex h-full items-center px-7 pt-4 sm:px-12 lg:px-24">
              <h1
                className="text-5xl font-semibold leading-none text-white sm:text-6xl lg:text-7xl"
                style={{ fontFamily: IOSEVKA }}
              >
                Animations
              </h1>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-2.5 bg-black px-2.5 pb-2.5 pt-1 sm:grid-cols-2 lg:grid-cols-3">
            {GALLERY_CARDS.map((card, i) => (
              <AnimationGalleryCard key={`${card.title}-${i}`} card={card} index={i} onOpen={setSelectedId} />
            ))}
          </div>
        </div>
      ) : selected.standalone ? (
        /* standalone module: owns its full detail layout */
        <div className="relative px-5 pb-6 pt-24 sm:px-8 sm:pt-28 lg:px-10 lg:pb-8">
          <div className="mt-4">
            <SelectedComponent gradeLevel={gradeLevel} onGradeChange={setGradeLevel} />
          </div>
        </div>
      ) : (
        /* detail */
        <div className="relative mx-auto max-w-4xl px-5 pb-6 pt-24 sm:px-8 sm:pt-28 lg:pb-8">
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
