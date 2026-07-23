// @ts-nocheck
import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import AppShell from './components/AppShell'
import Masthead from './components/Masthead'
import HomePage from './components/HomePage'
import LessonsPage from './components/LessonsPage'
import GamesPage from './components/games/GamesPage'
import DataGraphsPage from './components/DataGraphsPage'
import AnimationsPage from './components/animations/AnimationsPage'
import HowLandsatImagesAreMade from './components/lessons/HowLandsatImagesAreMade'
import WhatIsTheEMS from './components/lessons/WhatIsTheEMS'
import { LESSONS, filterLessons } from './data/lessons'

// Mission Control pulls in Three.js; load it (and its deps) only when opened.
const MissionControlPage = lazy(() =>
  import('./components/mission-control/MissionControlPage'),
)

// STELLA Data Visualizer bundles ~800 KB of NASA STELLA sample data; lazy-load it too.
const DataVisualizerPage = lazy(() =>
  import('./components/data-visualizer/DataVisualizerPage'),
)

// The STELLA-Q2 Lab is an independent feature and is loaded only when opened.
const StellaQ2Page = lazy(() =>
  import('./features/stellaQ2/components/StellaQ2Page'),
)

const Step7Preview = lazy(() =>
  import('./features/stellaQ2/components/enclosure/Step7Preview'),
)

const Step9Preview = lazy(() =>
  import('./features/stellaQ2/components/routing/Step9Preview'),
)

const Step10Preview = lazy(() =>
  import('./features/stellaQ2/components/cover/Step10Preview'),
)

export default function App() {
  const [page, setPage] = useState('home')
  const [category, setCategory] = useState('all')
  const [grade, setGrade] = useState('all')

  // Deep-link from a lesson into a specific animation module.
  const [animationTarget, setAnimationTarget] = useState(null)

  // A deterministic, development-only fixture for screenshot capture. It is
  // excluded from production navigation and does not touch session progress.
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).has('stella-step7-preview')) {
    return <AppShell><Suspense fallback={<div className="min-h-screen bg-[#030916]" />}><Step7Preview /></Suspense></AppShell>
  }
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).has('stella-step9-preview')) {
    return <AppShell><Suspense fallback={<div className="min-h-screen bg-[#030916]" />}><Step9Preview /></Suspense></AppShell>
  }
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).has('stella-step10-preview')) {
    return <AppShell><Suspense fallback={<div className="min-h-screen bg-[#030916]" />}><Step10Preview /></Suspense></AppShell>
  }

  // Navigation is tracked in browser history so the back/forward buttons
  // (including mouse side buttons, which fire the same popstate event) move
  // between pages. `navigate` pushes a new entry; `popstate` restores the page
  // the user is returning to. Without this the page lives only in React state
  // and the browser has no history to walk.
  const navigate = (nextPage, nextTarget = null) => {
    if (nextPage === page && nextTarget === animationTarget) return
    setPage(nextPage)
    setAnimationTarget(nextTarget)
    window.history.pushState({ page: nextPage, animationTarget: nextTarget }, '')
  }

  useEffect(() => {
    // Seed the current (first) history entry so back returns here with state.
    window.history.replaceState({ page: 'home', animationTarget: null }, '')

    const onPopState = (e) => {
      const state = e.state
      setPage(state && typeof state.page === 'string' ? state.page : 'home')
      setAnimationTarget(state?.animationTarget ?? null)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  // Open a lesson detail view when a card with a `route` is clicked.
  const openLesson = (lesson) => {
    if (lesson?.route) navigate(lesson.route)
  }

  const openAnimation = (id) => navigate('animations', id)

  const visibleLessons = useMemo(
    () => filterLessons(LESSONS, category, grade),
    [category, grade],
  )

  // The home page is a full-bleed editorial landing with its own dark masthead
  // inside the hero, so it renders without the shared top bar.
  if (page === 'home') {
    return (
      <AppShell>
        <HomePage onNavigate={navigate} />
      </AppShell>
    )
  }

  const isMissionControl = page === 'mission-control'

  return (
    <AppShell>
      {/* Inner pages: the global dark masthead stays consistent with the home
          hero header. On desktop the page fills the viewport height and
          scrolls internally; on mobile the document scrolls. */}
      <div
        className={`flex min-h-screen w-full flex-col lg:h-screen lg:min-h-0 lg:overflow-hidden ${
          isMissionControl ? 'relative bg-[#050b1f]' : page === 'lessons' ? 'bg-white' : 'bg-app'
        }`}
      >
        <div className={isMissionControl ? 'lg:absolute lg:inset-x-0 lg:top-0 lg:z-40' : undefined}>
          <Masthead active={page} onNavigate={navigate} />
        </div>

        <div className="cm-floating-nav-content relative flex flex-1 flex-col lg:min-h-0">
          {page === 'lessons' ? (
          /* Lessons & activities catalog: full width beside the sidebar */
          <LessonsPage
            category={category}
            onCategory={setCategory}
            grade={grade}
            onGrade={setGrade}
            lessons={visibleLessons}
            onOpenLesson={openLesson}
          />
        ) : page === 'data' ? (
          /* Spectral Band Explorer: full width beside the sidebar */
          <DataGraphsPage />
        ) : page === 'animations' ? (
          /* Animations gallery: full width beside the sidebar */
          <AnimationsPage initialId={animationTarget} />
        ) : page === 'games' ? (
          /* Educational games: gallery + individual games, full width */
          <GamesPage />
        ) : page === 'device' ? (
          /* STELLA-Q2 Lab: source-grounded construction learning workspace */
          <Suspense
            fallback={
              <div className="order-1 grid flex-1 place-items-center bg-[#050b1f] text-sm font-semibold text-slate-300">
                Loading STELLA-Q2 Lab…
              </div>
            }
          >
            <StellaQ2Page />
          </Suspense>
        ) : page === 'data-viz' ? (
          /* STELLA Data Visualizer: real STELLA instrument data + user uploads */
          <Suspense
            fallback={
              <div className="order-1 grid flex-1 place-items-center bg-app text-sm font-semibold text-muted">
                Loading STELLA Data Visualizer…
              </div>
            }
          >
            <DataVisualizerPage />
          </Suspense>
        ) : page === 'lesson-landsat' ? (
          /* Landsat lesson: full width beside the sidebar */
          <HowLandsatImagesAreMade onBack={() => navigate('home')} />
        ) : page === 'lesson-ems' ? (
          /* Electromagnetic Spectrum lesson: full width beside the sidebar */
          <WhatIsTheEMS onBack={() => navigate('home')} onOpenAnimation={openAnimation} />
        ) : page === 'mission-control' ? (
          /* Mission Control: 3D Earth-orbit explorer, full width beside the sidebar */
          <Suspense
            fallback={
              /* Brief, lightweight screen while the Mission Control chunk loads;
                 the richer shader loading state renders once the chunk is in.
                 Kept on the same #050b1f base so the handoff is seamless. */
              <div className="order-1 grid flex-1 place-items-center bg-[#08090c] px-6 text-center">
                <div className="flex flex-col items-center gap-4">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75 motion-safe:animate-ping" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-300" />
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-sky-200/70">
                    Satellite Tracker
                  </span>
                </div>
              </div>
            }
          >
            <MissionControlPage onNavigate={navigate} />
          </Suspense>
        ) : null}
        </div>
      </div>
    </AppShell>
  )
}
