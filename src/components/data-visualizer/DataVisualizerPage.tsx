// @ts-nocheck
import { useMemo, useState } from 'react'
import Icon from '../Icon'
import useReducedMotion from '../../hooks/useReducedMotion'
import DatasetPicker from './DatasetPicker'
import OverviewView from './OverviewView'
import SpectrumView from './SpectrumView'
import IndicesView from './IndicesView'
import FieldReport from './FieldReport'
import DataDictionary from './DataDictionary'
import { LABEL, PANEL, ACCENT } from './dvStyles'
import { formatDayClock } from './vizTheme'
import samples from '../../data/stellaSamples.json'

const VIEWS = [
  { id: 'overview', label: 'Session', icon: 'grid', hint: 'Every measurement at once: the spectrogram shows irradiance for every band across time; sensor traces sit on the same clock. Sweep the cursor to read any moment.' },
  { id: 'spectrum', label: 'Spectrum', icon: 'spectrum', hint: 'One measurement’s spectral signature. Play through time, then pin A vs B to compare two moments.' },
  { id: 'indices', label: 'Greenness', icon: 'leaf', hint: '(NIR − red)/(NIR + red) per measurement: an irradiance-based vegetation estimate.' },
  { id: 'report', label: 'Report', icon: 'lessons', hint: 'Per-field statistics for the whole session; export a derived CSV.' },
]

function sessionStats(ds) {
  const t0 = ds.records[0]?.t
  const t1 = ds.records[ds.records.length - 1]?.t
  const durMin = t0 != null && t1 != null ? (t1 - t0) / 60000 : 0
  const cadence = ds.records.length > 1 ? (t1 - t0) / (ds.records.length - 1) / 1000 : 0
  const bands = new Set(ds.records.flatMap((r) => r.spec.map((b) => b[0]))).size
  return {
    t0,
    records: ds.records.length,
    duration: durMin >= 90 ? `${(durMin / 60).toFixed(1)} h` : `${Math.round(durMin)} min`,
    cadence: `${cadence < 10 ? cadence.toFixed(1) : Math.round(cadence)} s`,
    bands,
    fields: ds.envFields.length,
  }
}

export default function DataVisualizerPage() {
  const reducedMotion = useReducedMotion()
  const [uploads, setUploads] = useState([])
  const [activeId, setActiveId] = useState(samples.datasets[0].id)
  const [view, setView] = useState('overview')
  const [recIndex, setRecIndex] = useState(0)

  const all = useMemo(() => [...samples.datasets, ...uploads], [uploads])
  const dataset = all.find((d) => d.id === activeId) ?? samples.datasets[0]
  const stats = useMemo(() => sessionStats(dataset), [dataset])
  const hasSpectra = stats.bands > 0

  const selectDataset = (id) => { setActiveId(id); setRecIndex(0); setView('overview') }
  const addUpload = (ds) => { setUploads((u) => [...u, ds]); setActiveId(ds.id); setRecIndex(0); setView('overview') }

  const activeHint = VIEWS.find((v) => v.id === view)?.hint

  const StatChip = ({ value, label }) => (
    <div className="flex flex-col">
      <span className="font-mono text-lg font-extrabold leading-none tabular-nums text-white sm:text-xl">{value}</span>
      <span className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white/40">{label}</span>
    </div>
  )

  return (
    <main className="order-1 flex-1 overflow-y-auto overflow-x-hidden scroll-soft bg-app px-5 py-6 text-white sm:px-8 lg:order-2 lg:px-10 lg:py-8">
      {/* instrument-readout header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-300/80">
            NASA STELLA · data observatory
          </span>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
            STELLA Data Visualizer
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-white/55">
            Explore real STELLA field instruments, or drop in your own device’s CSV and analyze it
            the same way.
          </p>
        </div>
        {/* live session stats */}
        <div className={`${PANEL} flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3`}>
          <StatChip value={stats.records.toLocaleString('en-US')} label="records" />
          <StatChip value={stats.duration} label="duration" />
          {hasSpectra && <StatChip value={stats.bands} label="bands" />}
          <StatChip value={stats.fields} label="sensors" />
          <StatChip value={stats.cadence} label="cadence" />
        </div>
      </div>

      <div className="mt-6 gap-6 lg:grid lg:grid-cols-[264px_1fr]">
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
        <div className="min-w-0">
          {/* active dataset + view tabs */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-extrabold">{dataset.instrument}</span>
              <span className="text-xs text-white/45">{dataset.title}</span>
              {dataset.uploaded && (
                <span className="rounded-full bg-cyan-400/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cyan-200">
                  your file
                </span>
              )}
            </div>
            <div className="ml-auto flex flex-wrap gap-1 rounded-full border border-white/10 bg-white/5 p-1" role="tablist">
              {VIEWS.map((v) => {
                const disabled = (v.id === 'spectrum' || v.id === 'indices') && !hasSpectra
                const active = view === v.id
                return (
                  <button
                    key={v.id}
                    role="tab"
                    aria-selected={active}
                    disabled={disabled}
                    onClick={() => setView(v.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                      active ? '' : disabled ? 'text-white/25' : 'text-white/60 hover:text-white'
                    }`}
                    style={active ? { backgroundColor: ACCENT, color: '#04121f' } : undefined}
                  >
                    <Icon name={v.icon} className="h-3.5 w-3.5" />
                    {v.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* one-line contextual hint (kept intentionally short) */}
          {activeHint && (
            <p className="mt-2 flex items-start gap-1.5 text-[12px] leading-snug text-white/45">
              <Icon name="rays" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-300/70" />
              {activeHint}
            </p>
          )}

          <div className="mt-4 space-y-4">
            {view === 'overview' && <OverviewView dataset={dataset} />}
            {view === 'spectrum' && hasSpectra && (
              <SpectrumView dataset={dataset} index={recIndex} onIndex={setRecIndex} reducedMotion={reducedMotion} />
            )}
            {view === 'indices' && <IndicesView dataset={dataset} index={recIndex} onIndex={setRecIndex} />}
            {view === 'report' && <FieldReport dataset={dataset} />}

            <DataDictionary dataset={dataset} />

            <p className="text-[11px] leading-relaxed text-white/35">
              Data: NASA STELLA sample sessions (public domain) ·{' '}
              <a href={samples.source} target="_blank" rel="noreferrer" className="font-semibold text-white/55 underline decoration-dotted underline-offset-2 hover:text-white">
                science.gsfc.nasa.gov/stella
              </a>
              {dataset.sourceUrl && (
                <>
                  {' · '}
                  <a href={dataset.sourceUrl} target="_blank" rel="noreferrer" className="font-semibold text-white/55 underline decoration-dotted underline-offset-2 hover:text-white">
                    this dataset ↗
                  </a>
                </>
              )}
              {'. '}Uploads are parsed in-browser and never leave this device. Greenness is an
              irradiance-based estimate, not calibrated NDVI.
              {stats.t0 != null && ` Session start ${formatDayClock(stats.t0)}.`}
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
