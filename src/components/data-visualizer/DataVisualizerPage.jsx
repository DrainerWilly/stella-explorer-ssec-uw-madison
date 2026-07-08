import { useMemo, useState } from 'react'
import Icon from '../Icon.jsx'
import useReducedMotion from '../../hooks/useReducedMotion.js'
import DatasetPicker from './DatasetPicker.jsx'
import SpectrumView from './SpectrumView.jsx'
import TimeSeriesView from './TimeSeriesView.jsx'
import IndicesView from './IndicesView.jsx'
import FieldReport from './FieldReport.jsx'
import ExplainerCard from './ExplainerCard.jsx'
import DataDictionary from './DataDictionary.jsx'
import samples from '../../data/stellaSamples.json'

const VIEWS = [
  { id: 'spectrum', label: 'Spectrum', icon: 'spectrum' },
  { id: 'timeseries', label: 'Time series', icon: 'data' },
  { id: 'indices', label: 'Greenness lab', icon: 'leaf' },
  { id: 'report', label: 'Field report', icon: 'lessons' },
]

// Data Visualizer — an interactive observatory for real NASA STELLA instrument
// data, plus any CSV a student collects with their own device.
export default function DataVisualizerPage() {
  const reducedMotion = useReducedMotion()
  const [uploads, setUploads] = useState([])
  const [activeId, setActiveId] = useState(samples.datasets[0].id)
  const [view, setView] = useState('spectrum')
  // shared "current measurement" cursor for Spectrum + Greenness views
  const [recIndex, setRecIndex] = useState(0)

  const all = useMemo(() => [...samples.datasets, ...uploads], [uploads])
  const dataset = all.find((d) => d.id === activeId) ?? samples.datasets[0]

  const selectDataset = (id) => {
    setActiveId(id)
    setRecIndex(0)
  }
  const addUpload = (ds) => {
    setUploads((u) => [...u, ds])
    selectDataset(ds.id)
  }

  const hasSpectra = dataset.records.some((r) => r.spec.length > 0)

  return (
    <main className="order-1 flex-1 overflow-y-auto overflow-x-hidden scroll-soft px-5 py-6 sm:px-8 lg:order-2 lg:px-10 lg:py-8">
      <header className="max-w-3xl">
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300/80">
          Real instrument data · explore · upload your own
        </span>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Data Visualizer
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
          A working observatory for NASA’s STELLA field instruments. Play through real spectral
          signatures, line up sensors on a shared clock, compute vegetation greenness — or drop in
          the CSV from your own STELLA and analyze your class’s data the same way scientists do.
        </p>
      </header>

      <div className="mt-6 gap-6 lg:grid lg:grid-cols-[280px_1fr]">
        {/* dataset rail */}
        <aside className="mb-5 lg:mb-0">
          <DatasetPicker
            datasets={samples.datasets}
            uploads={uploads}
            activeId={dataset.id}
            onSelect={selectDataset}
            onUpload={addUpload}
          />
        </aside>

        {/* workspace */}
        <div className="min-w-0 space-y-4">
          {/* active dataset banner */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-panel bg-cream px-4 py-3">
            <span className="text-sm font-extrabold text-ink">{dataset.instrument}</span>
            <span className="text-xs font-semibold text-muted">{dataset.title}</span>
            <span className="ml-auto text-[11px] font-bold uppercase tracking-wide text-faint">
              {dataset.records.length.toLocaleString('en-US')} records
              {dataset.uploaded ? ' · parsed locally' : ' · NASA sample'}
            </span>
          </div>

          {/* view tabs */}
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Visualization views">
            {VIEWS.map((v) => {
              const disabled =
                (v.id === 'spectrum' && !hasSpectra) ||
                (v.id === 'indices' && !hasSpectra)
              const active = view === v.id
              return (
                <button
                  key={v.id}
                  role="tab"
                  aria-selected={active}
                  disabled={disabled}
                  onClick={() => setView(v.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                    active
                      ? 'bg-ink text-app shadow-soft'
                      : disabled
                        ? 'bg-cream/60 text-faint'
                        : 'bg-cream text-ink/70 hover:text-ink'
                  }`}
                >
                  <Icon name={v.icon} className="h-3.5 w-3.5" />
                  {v.label}
                </button>
              )
            })}
          </div>

          {/* active view */}
          {view === 'spectrum' && hasSpectra && (
            <SpectrumView dataset={dataset} index={recIndex} onIndex={setRecIndex} reducedMotion={reducedMotion} />
          )}
          {view === 'timeseries' && <TimeSeriesView dataset={dataset} />}
          {view === 'indices' && <IndicesView dataset={dataset} index={recIndex} onIndex={setRecIndex} />}
          {view === 'report' && <FieldReport dataset={dataset} />}
          {(view === 'spectrum' || view === 'indices') && !hasSpectra && (
            <div className="rounded-panel bg-cream p-6 text-sm text-ink/70">
              {dataset.instrument} doesn’t record spectral bands — try Time series or Field report.
            </div>
          )}

          <ExplainerCard view={view} />
          <DataDictionary dataset={dataset} />

          {/* sources */}
          <div className="rounded-panel bg-cream p-4 text-[12px] leading-relaxed text-muted">
            <span className="font-extrabold uppercase tracking-wide text-faint">Sources · </span>
            Sample sessions: NASA STELLA instrument sample data (public domain, credit NASA),{' '}
            <a
              href={samples.source}
              target="_blank"
              rel="noreferrer"
              className="font-bold text-ink/80 underline decoration-dotted underline-offset-2 hover:text-ink"
            >
              science.gsfc.nasa.gov/stella
            </a>
            {dataset.sourceUrl && (
              <>
                {' · '}
                <a
                  href={dataset.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-ink/80 underline decoration-dotted underline-offset-2 hover:text-ink"
                >
                  this dataset ↗
                </a>
              </>
            )}
            . Uploaded files are processed entirely in your browser. Greenness values are
            irradiance-based estimates, not calibrated NDVI.
          </div>
        </div>
      </div>
    </main>
  )
}
