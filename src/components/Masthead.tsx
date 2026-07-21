// @ts-nocheck
import { useEffect, useState } from 'react'
import { NAV } from '../data/nav'

const PRIMARY_NAV = NAV.filter((item) => item.id !== 'home')

// Global top navigation. Brand/wordmark sits on the left; the section links are
// right-aligned and wrap; below the reference's breakpoint a hamburger opens a
// full-screen menu whose items stagger in. The masthead keeps the same dark
// Chance Maker-inspired treatment on every page.
export default function Masthead({ active = 'home', onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false)

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

  const go = (id) => {
    setMenuOpen(false)
    onNavigate?.(id)
  }

  const ink = 'text-white'
  const linkColor = 'text-white/85 hover:text-white'

  return (
    <header className="cm-root cm-masthead relative z-30 w-full shrink-0 bg-transparent pt-8 md:pt-10">
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
        <nav aria-label="Primary" className="cm-desktop-nav hidden md:block">
          <ul className="cm-primary-nav__list flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
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
          className={`cm-menu-button cm-focus md:hidden ${ink}`}
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
