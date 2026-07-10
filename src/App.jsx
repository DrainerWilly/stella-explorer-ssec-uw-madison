import { Suspense, lazy, useMemo, useState } from 'react'
import AppShell from './components/AppShell.jsx'
import SidebarNav from './components/SidebarNav.jsx'
import HomePage from './components/HomePage.jsx'
import LessonsPage from './components/LessonsPage.jsx'
import GamesPage from './components/games/GamesPage.jsx'
import DataGraphsPage from './components/DataGraphsPage.jsx'
import AnimationsPage from './components/animations/AnimationsPage.jsx'
import StellaDevicePage from './components/device/StellaDevicePage.jsx'
import HowLandsatImagesAreMade from './components/lessons/HowLandsatImagesAreMade.jsx'
import WhatIsTheEMS from './components/lessons/WhatIsTheEMS.jsx'
import { LESSONS, filterLessons } from './data/lessons.js'

// Mission Control pulls in Three.js; load it (and its deps) only when opened.
const MissionControlPage = lazy(() =>
  import('./components/mission-control/MissionControlPage.jsx'),
)

// Data Visualizer bundles ~800 KB of NASA STELLA sample data; lazy-load it too.
const DataVisualizerPage = lazy(() =>
  import('./components/data-visualizer/DataVisualizerPage.jsx'),
)

export default function App() {
  const [page, setPage] = useState('home')
  const [category, setCategory] = useState('all')
  const [grade, setGrade] = useState('all')

  // Open a lesson detail view when a card with a `route` is clicked.
  const openLesson = (lesson) => {
    if (lesson?.route) setPage(lesson.route)
  }

  // Deep-link from a lesson into a specific animation module.
  const [animationTarget, setAnimationTarget] = useState(null)
  const openAnimation = (id) => {
    setAnimationTarget(id)
    setPage('animations')
  }

  const visibleLessons = useMemo(
    () => filterLessons(LESSONS, category, grade),
    [category, grade],
  )

  return (
    <AppShell>
      {/* Full-screen three-column dashboard. On desktop the columns fill the
          viewport height and scroll independently; on mobile they stack and the
          page scrolls, with the nav dropping to the bottom. */}
      <div className="flex min-h-screen w-full flex-col bg-app lg:h-screen lg:min-h-0 lg:flex-row lg:overflow-hidden">
        {/* left sidebar: first on desktop, bottom nav on mobile */}
        <SidebarNav
          className="order-3 lg:order-1"
          active={page}
          onNavigate={(id) => {
            setAnimationTarget(null) // clear lesson deep-link on manual nav
            setPage(id)
          }}
        />

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
          /* STELLA Device Lab: choose, build, and demo a NASA STELLA instrument */
          <StellaDevicePage onNavigate={setPage} />
        ) : page === 'data-viz' ? (
          /* Data Visualizer: real STELLA instrument data + user uploads */
          <Suspense
            fallback={
              <div className="order-1 grid flex-1 place-items-center bg-app text-sm font-semibold text-muted">
                Loading Data Visualizer…
              </div>
            }
          >
            <DataVisualizerPage />
          </Suspense>
        ) : page === 'lesson-landsat' ? (
          /* Landsat lesson: full width beside the sidebar */
          <HowLandsatImagesAreMade onBack={() => setPage('home')} />
        ) : page === 'lesson-ems' ? (
          /* Electromagnetic Spectrum lesson: full width beside the sidebar */
          <WhatIsTheEMS onBack={() => setPage('home')} onOpenAnimation={openAnimation} />
        ) : page === 'mission-control' ? (
          /* Mission Control: 3D Earth-orbit explorer, full width beside the sidebar */
          <Suspense
            fallback={
              <div className="order-1 grid flex-1 place-items-center bg-[#050b1f] text-sm font-semibold text-white/60">
                Loading Satellite Tracker…
              </div>
            }
          >
            <MissionControlPage onNavigate={setPage} />
          </Suspense>
        ) : (
          <HomePage onNavigate={setPage} />
        )}
      </div>
    </AppShell>
  )
}
