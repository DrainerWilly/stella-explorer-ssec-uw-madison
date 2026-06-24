import { useEffect, useMemo, useState } from 'react'
import AppShell from './components/AppShell.jsx'
import SidebarNav from './components/SidebarNav.jsx'
import HeroSection from './components/HeroSection.jsx'
import CategoryFilters from './components/CategoryFilters.jsx'
import LessonCardGrid from './components/LessonCardGrid.jsx'
import FeaturedActivityCard from './components/FeaturedActivityCard.jsx'
import RightDashboard from './components/RightDashboard.jsx'
import DataGraphsPage from './components/DataGraphsPage.jsx'
import AnimationsPage from './components/animations/AnimationsPage.jsx'
import HowLandsatImagesAreMade from './components/lessons/HowLandsatImagesAreMade.jsx'
import WhatIsTheEMS from './components/lessons/WhatIsTheEMS.jsx'
import { LESSONS, GRADES, filterLessons } from './data/lessons.js'

export default function App() {
  const [page, setPage] = useState('home')
  const [category, setCategory] = useState('all')
  const [grade, setGrade] = useState('all')
  const [theme, setTheme] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
      ? 'dark'
      : 'light',
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem('theme', theme)
    } catch (e) {
      /* ignore storage failures (private mode) */
    }
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

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

  const gradeLabel = GRADES.find((g) => g.id === grade)?.label ?? 'All grades'

  return (
    <AppShell>
      {/* Full-screen three-column dashboard. On desktop the columns fill the
          viewport height and scroll independently; on mobile they stack and the
          page scrolls, with the nav dropping to the bottom. */}
      <div className="flex min-h-screen w-full flex-col bg-app lg:h-screen lg:min-h-0 lg:flex-row lg:overflow-hidden">
        {/* left sidebar — first on desktop, bottom nav on mobile */}
        <SidebarNav
          className="order-3 lg:order-1"
          theme={theme}
          onToggleTheme={toggleTheme}
          active={page}
          onNavigate={(id) => {
            setAnimationTarget(null) // clear lesson deep-link on manual nav
            setPage(id)
          }}
        />

        {page === 'data' ? (
          /* Spectral Band Explorer — full width beside the sidebar */
          <DataGraphsPage />
        ) : page === 'animations' ? (
          /* Animations gallery — full width beside the sidebar */
          <AnimationsPage initialId={animationTarget} />
        ) : page === 'lesson-landsat' ? (
          /* Landsat lesson — full width beside the sidebar */
          <HowLandsatImagesAreMade onBack={() => setPage('home')} />
        ) : page === 'lesson-ems' ? (
          /* Electromagnetic Spectrum lesson — full width beside the sidebar */
          <WhatIsTheEMS onBack={() => setPage('home')} onOpenAnimation={openAnimation} />
        ) : (
          <>
            {/* main content */}
            <main className="order-1 flex-1 overflow-y-auto scroll-soft px-5 py-6 sm:px-8 lg:order-2 lg:px-10 lg:py-8">
              <HeroSection grade={grade} onGradeChange={setGrade} />

              <div className="mt-8">
                <CategoryFilters active={category} onChange={setCategory} />
              </div>

              <div className="mt-7 flex items-center justify-between">
                <h2 className="text-lg font-extrabold tracking-tight text-ink">Start learning</h2>
                <span className="text-sm font-semibold text-faint">
                  {visibleLessons.length} {visibleLessons.length === 1 ? 'lesson' : 'lessons'}
                </span>
              </div>
              <div className="mt-4">
                <LessonCardGrid lessons={visibleLessons} onOpenLesson={openLesson} />
              </div>

              <div className="mt-6">
                <FeaturedActivityCard />
              </div>
            </main>

            {/* right dashboard — between main and nav on mobile, far right on desktop */}
            <div className="order-2 px-5 pb-6 lg:order-3 lg:flex lg:p-3 lg:pl-0">
              <RightDashboard gradeLabel={gradeLabel} lessonCount={visibleLessons.length} />
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}
