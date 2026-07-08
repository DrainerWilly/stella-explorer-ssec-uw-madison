// Chart theme for the Data Visualizer.
//
// Categorical slots were validated with the dataviz palette validator against
// this app's navy chart surface (#14295A): lightness band PASS, chroma PASS,
// worst adjacent CVD ΔE 41.3 PASS, contrast ≥3:1 PASS. Assign in fixed order,
// never cycled. Text always wears ink tokens, never series colors.

export const SERIES = ['#3987e5', '#199e70', '#c98500', '#9085e9', '#e66767']

export const GRID = 'rgba(255,255,255,0.09)' // hairline gridlines
export const AXIS = 'rgba(255,255,255,0.22)' // baseline / axis
export const INK_MUTED = 'rgba(233,240,252,0.55)'
export const INK_FAINT = 'rgba(233,240,252,0.38)'

// Approximate visible-spectrum color for a wavelength (nm). Original
// implementation of the standard piecewise mapping; beyond ~750 nm (NIR) we
// return a desaturated deep red→gray so "invisible" bands read as beyond-visible.
export function wavelengthToColor(nm) {
  if (nm < 380) return '#8b7bd8'
  if (nm > 750) {
    // NIR: fade deep red toward warm gray by 940 nm
    const f = Math.min(1, (nm - 750) / 190)
    const mix = (a, b) => Math.round(a + (b - a) * f)
    return `rgb(${mix(150, 122)},${mix(40, 104)},${mix(40, 112)})`
  }
  let r = 0
  let g = 0
  let b = 0
  if (nm < 440) { r = (440 - nm) / 60; b = 1 }
  else if (nm < 490) { g = (nm - 440) / 50; b = 1 }
  else if (nm < 510) { g = 1; b = (510 - nm) / 20 }
  else if (nm < 580) { r = (nm - 510) / 70; g = 1 }
  else if (nm < 645) { r = 1; g = (645 - nm) / 65 }
  else { r = 1 }
  // intensity falloff at the edges of the visible range
  let f = 1
  if (nm < 420) f = 0.4 + (0.6 * (nm - 380)) / 40
  else if (nm > 700) f = 0.4 + (0.6 * (750 - nm)) / 50
  const c = (x) => Math.round(255 * Math.min(1, x * f) ** 0.85)
  return `rgb(${c(r)},${c(g)},${c(b)})`
}

export function formatClock(tMs) {
  const d = new Date(tMs)
  const p = (n) => String(n).padStart(2, '0')
  return `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`
}

export function formatDayClock(tMs) {
  const d = new Date(tMs)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())} UTC`
}

export function formatVal(v, digits = 3) {
  if (v == null || !Number.isFinite(v)) return '—'
  const a = Math.abs(v)
  if (a >= 1000) return Math.round(v).toLocaleString('en-US')
  if (a >= 100) return v.toFixed(digits > 1 ? 1 : 0)
  if (a >= 1) return v.toFixed(2)
  return v.toPrecision(2)
}

// nice tick values for a [0..max] or [min..max] scale
export function ticks(min, max, count = 4) {
  if (!(max > min)) return [min]
  const span = max - min
  const step0 = span / count
  const mag = 10 ** Math.floor(Math.log10(step0))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= count + 0.5) ?? mag * 10
  const start = Math.ceil(min / step) * step
  const out = []
  for (let v = start; v <= max + 1e-9; v += step) out.push(+v.toPrecision(12))
  return out
}
