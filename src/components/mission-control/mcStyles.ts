// @ts-nocheck
// Shared style tokens for the Mission Control "flight software" UI.
//
// Mission Control is intentionally ALWAYS dark, a cinematic, planetarium-style
// view, regardless of the site-wide theme. Panels therefore use fixed colors
// instead of the theme CSS variables used elsewhere in the app.

export const ACCENT = '#67d1ff' // cyan highlight
export const ACCENT_INK = '#062033' // dark text on cyan

// floating translucent panel
export const PANEL =
  'rounded-xl border border-white/10 bg-[#0b1a3d]/85 shadow-[0_12px_48px_-12px_rgba(0,0,0,0.9)] backdrop-blur-xl'

// uppercase micro-label
export const LABEL = 'text-[10px] font-bold uppercase tracking-[0.18em] text-white/40'

// square icon button
export const GHOST_BTN =
  'mc-liquid-glass grid h-9 w-9 place-items-center rounded-lg text-white/70 transition-colors hover:text-white'

// small text chip
export const CHIP =
  'mc-liquid-glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold text-white/70'
