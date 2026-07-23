// @ts-nocheck
import { useEffect, useRef, useState } from 'react'
import { NAV } from '../data/nav'

const PRIMARY_NAV = NAV.filter((item) => item.id !== 'home')

// Global top navigation. Brand/wordmark sits on the left; the section links are
// right-aligned and wrap; below the reference's breakpoint a hamburger opens a
// full-screen menu whose items stagger in. The masthead keeps the same dark
// Chance Maker-inspired treatment on every page.
export default function Masthead({ active = 'home', onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const lastWindowScroll = useRef(0)
  const lastElementScroll = useRef(new WeakMap())
  // Lessons keeps its editorial masthead visible while its own grid scrolls;
  // other long-form pages retain the hide-on-scroll behavior.
  const shouldAutoHide = active !== 'home' && active !== 'mission-control' && active !== 'lessons'

  // Close on Escape and lock body scroll while the drawer is open.
  useEffect(() => {
    if (!menuOpen) return undefined
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  useEffect(() => {
    setHidden(false)
    lastWindowScroll.current = window.scrollY || document.documentElement.scrollTop || 0
    lastElementScroll.current = new WeakMap()

    if (!shouldAutoHide) return undefined

    const threshold = 3

    const readWindowScroll = () => window.scrollY || document.documentElement.scrollTop || 0

    const handleWindowScroll = () => {
      const next = readWindowScroll()
      const previous = lastWindowScroll.current
      const delta = next - previous
      if (Math.abs(delta) < threshold) return
      setHidden(delta > 0 && next > 36)
      lastWindowScroll.current = next
    }

    const handleElementScroll = (event) => {
      const target = event.target
      if (!target || target === document || target === window) return
      if (typeof target.scrollTop !== 'number') return

      const next = target.scrollTop
      if (!lastElementScroll.current.has(target)) {
        lastElementScroll.current.set(target, next)
        return
      }

      const previous = lastElementScroll.current.get(target)
      const delta = next - previous
      if (Math.abs(delta) < threshold) return

      setHidden(delta > 0 && next > 36)
      lastElementScroll.current.set(target, next)
    }

    window.addEventListener('scroll', handleWindowScroll, { passive: true })
    document.addEventListener('scroll', handleElementScroll, true)

    return () => {
      window.removeEventListener('scroll', handleWindowScroll)
      document.removeEventListener('scroll', handleElementScroll, true)
    }
  }, [active, shouldAutoHide])

  useEffect(() => {
    if (menuOpen) setHidden(false)
  }, [menuOpen])

  const go = (id) => {
    setMenuOpen(false)
    onNavigate?.(id)
  }

  // The Lessons page is a light, visualjournal-style layout, so the navbar
  // there is white with black text instead of the default dark treatment.
  const isLight = active === 'lessons'
  const ink = isLight ? 'text-[#111]' : 'text-white'
  const linkColor = isLight ? 'text-[#333] hover:text-black' : 'text-white/85 hover:text-white'
  const autoHidden = shouldAutoHide && hidden && !menuOpen
  const isMissionControl = active === 'mission-control'

  return (
    <header
      aria-hidden={autoHidden ? 'true' : undefined}
      inert={autoHidden ? true : undefined}
      className={`cm-root w-full pt-8 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] md:pt-10 ${
        isMissionControl ? 'cm-masthead--tracker' : ''
      } ${
        shouldAutoHide
          ? `fixed inset-x-0 top-0 z-50 pb-5 ${
              isMissionControl
                ? 'bg-transparent shadow-none'
                : isLight
                  ? 'bg-white'
                  : 'bg-[#050b1f] shadow-[0_18px_44px_rgba(2,6,23,0.22)]'
            }`
          : 'relative z-30 shrink-0 bg-transparent'
      } ${
        autoHidden
          ? 'pointer-events-none -translate-y-[calc(100%+2.5rem)] opacity-0'
          : 'translate-y-0 opacity-100'
      }`}
    >
      <div className="cm-masthead-inner flex items-center">
        {/* brand / wordmark — pinned left */}
        <button
          onClick={() => go('home')}
          aria-label="ExSTELLA home"
          className={`cm-wordmark cm-focus mr-auto ${ink}`}
        >
          ExSTELLA
        </button>

        {/* desktop nav */}
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
            {PRIMARY_NAV.map((item) => {
              const isActive = active === item.id
              return (
                <li key={item.id}>
                  <button
                    onClick={() => go(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`cm-nav__link cm-focus ${linkColor}`}
                  >
                    {item.label}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* mobile hamburger */}
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          className={`cm-focus md:hidden ${ink}`}
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <path d="M5 9h18M5 14h18M5 19h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* full-screen mobile menu */}
      <div
        className={`cm-mobile-nav fixed inset-0 z-50 bg-[#0a0a0f] md:hidden ${
          menuOpen ? 'cm-mobile-nav--open visible opacity-100' : 'invisible opacity-0'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <div className="cm-masthead-inner flex items-center pt-8">
          <span className="cm-wordmark mr-auto text-white">ExSTELLA</span>
          <button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="cm-focus text-white">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <path d="M7 7l14 14M21 7L7 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <nav aria-label="Primary" className="cm-masthead-inner mt-10">
          <ul className="flex flex-col">
            {PRIMARY_NAV.map((item, i) => (
              <li
                key={item.id}
                className="cm-mobile-nav__item"
                style={{ transitionDelay: menuOpen ? `${80 + i * 45}ms` : '0ms' }}
              >
                <button
                  onClick={() => go(item.id)}
                  aria-current={active === item.id ? 'page' : undefined}
                  className="cm-mobile-nav__link cm-focus w-full border-b border-white/10 py-5 text-left text-white/90"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
