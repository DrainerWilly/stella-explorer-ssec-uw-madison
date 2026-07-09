// Shared style tokens for the Data Visualizer — a precise, dark-glass
// "instrument dashboard" aesthetic layered over the app's navy background.

export const ACCENT = '#6ae0ff'
export const ACCENT_INK = '#04121f'

// translucent glass panel
export const PANEL =
  'rounded-2xl border border-white/10 bg-white/[0.035] backdrop-blur-sm'
export const PANEL_SOLID = 'rounded-2xl border border-white/10 bg-[#0b1a3d]/70 backdrop-blur-sm'

// uppercase micro-label
export const LABEL = 'text-[10px] font-bold uppercase tracking-[0.16em] text-white/40'

// pill toggle (inactive); active adds accent inline styles at the call site
export const PILL =
  'rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'

export const MONO = 'font-mono tabular-nums'
