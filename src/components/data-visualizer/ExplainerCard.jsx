import Icon from '../Icon.jsx'

// Per-view teaching copy: what the chart shows + a classroom prompt.
const COPY = {
  spectrum: {
    what:
      'Each dot is one wavelength band the instrument measured, placed left-to-right from violet to near-infrared. The height is irradiance — how much light energy arrived in that band. The whole curve is a spectral signature: different surfaces (grass, soil, water, pavement) draw different shapes.',
    tryThis:
      'Press play and watch the curve breathe as the session unfolds. Pin one measurement as A, scrub to a different moment, pin B, and read the % change — did the target get brighter in the near-infrared?',
  },
  timeseries: {
    what:
      'Each panel is one sensor plotted against time on a shared clock — temperature, humidity, CO₂, light. Panels keep separate scales on purpose: the shapes line up, so you can see what changes together without comparing raw numbers.',
    tryThis:
      'Plot surface temperature next to a spectral band and drag-zoom into a few minutes of data. Do dips line up — like a cloud passing, or the instrument moving between targets?',
  },
  indices: {
    what:
      'One number per measurement: (NIR − red)/(NIR + red). Healthy leaves reflect near-infrared strongly and absorb red, so greener targets push the value toward +1. Water and pavement sit near or below 0.',
    tryThis:
      'Scrub through the session and watch the marker cross the colored zones. When the value jumps, flip to the Spectrum view at the same measurement — what did the red and NIR bands do?',
  },
  report: {
    what:
      'The whole session summarized the way a field notebook would: how long you measured, how often, and the min / mean / max / spread of every sensor. σ (standard deviation) tells you how steady a reading was.',
    tryThis:
      'Export the derived CSV and open it in a spreadsheet — the greenness column is ready for graphing. Compare σ between two fields: which sensor was noisiest, and can you explain why?',
  },
}

export default function ExplainerCard({ view }) {
  const c = COPY[view]
  if (!c) return null
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-panel bg-cream p-4">
        <h3 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-muted">
          <Icon name="rays" className="h-3.5 w-3.5" />
          What am I looking at?
        </h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink/80">{c.what}</p>
      </div>
      <div className="rounded-panel bg-cardmint/40 p-4">
        <h3 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-cink/70">
          <Icon name="star" className="h-3.5 w-3.5" />
          Try this in class
        </h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-cink/80">{c.tryThis}</p>
      </div>
    </div>
  )
}
