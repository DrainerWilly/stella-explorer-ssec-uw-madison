import { useEffect, useState } from 'react'
import Icon from '../Icon.jsx'
import AnimationCard from './AnimationCard.jsx'
import GradeLevelToggle from './GradeLevelToggle.jsx'
import { ANIMATIONS, DEFAULT_GRADE, getAnimation } from '../../data/animationContent.js'

import ElectromagneticSpectrumSlider from './ElectromagneticSpectrumSlider.jsx'
import WaveAnatomyAnimation from './WaveAnatomyAnimation.jsx'
import WaveBehaviorsAnimation from './WaveBehaviorsAnimation.jsx'
import VisibleInfraredToggle from './VisibleInfraredToggle.jsx'
import SpectralSignatureBuilder from './SpectralSignatureBuilder.jsx'
import AtmosphericWindowsAnimation from './AtmosphericWindowsAnimation.jsx'

// id → interactive component
const REGISTRY = {
  spectrumSlider: ElectromagneticSpectrumSlider,
  waveAnatomy: WaveAnatomyAnimation,
  waveBehaviors: WaveBehaviorsAnimation,
  visibleInfrared: VisibleInfraredToggle,
  signatureBuilder: SpectralSignatureBuilder,
  atmosphericWindows: AtmosphericWindowsAnimation,
}

export default function AnimationsPage({ initialId = null }) {
  const [gradeLevel, setGradeLevel] = useState(DEFAULT_GRADE)
  const [selectedId, setSelectedId] = useState(initialId)

  // deep-link: open a specific module when navigated here from a lesson
  useEffect(() => {
    if (initialId) setSelectedId(initialId)
  }, [initialId])
  const selected = selectedId ? getAnimation(selectedId) : null
  const SelectedComponent = selectedId ? REGISTRY[selectedId] : null

  return (
    <main className="order-1 flex-1 overflow-y-auto overflow-x-hidden scroll-soft px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <header className="max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Animations</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
            Explore electromagnetic spectrum and remote sensing concepts through interactive visual
            models.
          </p>
        </header>
        <GradeLevelToggle value={gradeLevel} onChange={setGradeLevel} />
      </div>

      {!selected ? (
        /* gallery */
        <div className="mt-7 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {ANIMATIONS.map((a) => (
            <AnimationCard key={a.id} animation={a} onOpen={setSelectedId} />
          ))}
        </div>
      ) : selected.standalone ? (
        /* standalone module: owns its full detail layout */
        <div className="mt-6">
          <button
            onClick={() => setSelectedId(null)}
            className="inline-flex items-center gap-1.5 rounded-full bg-cream px-4 py-2 text-sm font-bold text-ink/80 transition-all hover:-translate-x-0.5 hover:text-ink"
          >
            <Icon name="back" className="h-4 w-4" />
            Back to animations
          </button>
          <div className="mt-4">
            <SelectedComponent gradeLevel={gradeLevel} onGradeChange={setGradeLevel} />
          </div>
        </div>
      ) : (
        /* detail */
        <div className="mt-6">
          <button
            onClick={() => setSelectedId(null)}
            className="inline-flex items-center gap-1.5 rounded-full bg-cream px-4 py-2 text-sm font-bold text-ink/80 transition-all hover:-translate-x-0.5 hover:text-ink"
          >
            <Icon name="back" className="h-4 w-4" />
            Back to animations
          </button>

          {/* title row */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className={`grid h-11 w-11 place-items-center rounded-2xl bg-${selected.color} text-cink`}>
              <Icon name={selected.icon} className="h-5 w-5" />
            </span>
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-faint">{selected.label}</div>
              <h2 className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">{selected.title}</h2>
            </div>
            <span className="ml-auto rounded-full bg-cream px-3 py-1 text-xs font-bold text-muted">
              {selected.badge}
            </span>
          </div>

          {/* the interactive animation */}
          <div className="mt-4 rounded-panel bg-surface p-4 shadow-soft sm:p-6">
            <SelectedComponent gradeLevel={gradeLevel} />
          </div>

          {/* grade-level explanation */}
          <div className="mt-4 rounded-panel bg-cream p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-muted">What's happening</h3>
              <GradeLevelToggle value={gradeLevel} onChange={setGradeLevel} />
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink/80 sm:text-base">
              {selected.explain[gradeLevel]}
            </p>
          </div>

          {/* info boxes */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-panel bg-blue/40 p-5">
              <h3 className="flex items-center gap-2 text-sm font-extrabold text-cink">
                <Icon name="satellite" className="h-4 w-4" />
                Related to remote sensing
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-cink/75">{selected.remoteSensing}</p>
            </div>
            <div className="rounded-panel bg-cardmint/50 p-5">
              <h3 className="flex items-center gap-2 text-sm font-extrabold text-cink">
                <Icon name="star" className="h-4 w-4" />
                Try this
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-cink/75">{selected.tryThis}</p>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
