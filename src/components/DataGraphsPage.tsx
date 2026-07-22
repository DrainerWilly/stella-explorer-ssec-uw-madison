// @ts-nocheck
import { useMemo, useState } from 'react'
import InstrumentSelector from './InstrumentSelector'
import SpectralBandChart from './SpectralBandChart'
import SpectralCompare from './SpectralCompare'
import SpectrumLegend from './SpectrumLegend'
import BandTable from './BandTable'
import {
  DEFAULT_INSTRUMENT_ID,
  INSTRUMENTS,
  SPECTRAL_REGIONS,
  getBandsForInstrument,
  getInstrument,
  regionColor,
} from '../data/instruments'

// Spectral Band Explorer: the Data & Graphs page. Students pick a satellite
// mission or field instrument and compare how its bands sample the spectrum.
export default function DataGraphsPage() {
  const [instrumentId, setInstrumentId] = useState(DEFAULT_INSTRUMENT_ID)
  const instrument = getInstrument(instrumentId)
  const bands = useMemo(() => getBandsForInstrument(instrumentId), [instrumentId])
  const allStats = useMemo(() => {
    const totalBands = INSTRUMENTS.reduce((sum, i) => sum + i.bandCount, 0)
    const satelliteCount = INSTRUMENTS.filter((i) => i.platformType === 'Satellite').length
    const fieldCount = INSTRUMENTS.filter((i) => i.platformType === 'Field Instrument').length
    return { totalBands, satelliteCount, fieldCount }
  }, [])
  const selectedStats = useMemo(() => summarizeBands(bands), [bands])

  return (
    <main className="cm-page--spectral scroll-soft order-1 flex-1 overflow-y-auto overflow-x-hidden bg-[#050b1f] text-ink">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_10%,rgba(103,209,255,0.18),transparent_32%),radial-gradient(circle_at_10%_90%,rgba(177,77,224,0.14),transparent_34%)]" />
        <div className="relative mx-auto max-w-[1380px] px-5 pb-10 pt-8 sm:px-8 lg:px-10 lg:pb-14 lg:pt-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.12fr)_420px] lg:items-end">
            <header>
              <div className="text-[11px] font-bold uppercase tracking-[0.35em] text-[#67d1ff]/80">
                Remote sensing reference
              </div>
              <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">
                Spectral bands make Earth readable.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-muted sm:text-lg">
                Compare the exact wavelengths that Landsat, Sentinel, GOES, VIIRS,
                and NASA STELLA instruments measure. Each band is a window into
                vegetation, water, clouds, heat, or surface materials.
              </p>
              <div className="mt-7 grid max-w-3xl gap-3 sm:grid-cols-3">
                <Metric value={INSTRUMENTS.length} label="instruments" />
                <Metric value={allStats.totalBands} label="documented bands" />
                <Metric value={`${allStats.satelliteCount}+${allStats.fieldCount}`} label="satellite + field" />
              </div>
            </header>

            <SpectrumHero bands={bands} instrument={instrument} selectedStats={selectedStats} />
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1380px] gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[360px_minmax(0,1fr)] lg:px-10 lg:py-8">
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_24px_80px_-36px_rgba(0,0,0,0.9)] backdrop-blur-xl">
            <InstrumentSelector value={instrumentId} onChange={setInstrumentId} />
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#0b1a3d]/80 p-4 shadow-[0_24px_80px_-36px_rgba(0,0,0,0.9)]">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
              Selected sensor
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <MiniStat label="Bands" value={instrument?.bandCount ?? '—'} />
              <MiniStat label="Platform" value={instrument?.platformType ?? '—'} />
              <MiniStat label="Coverage" value={selectedStats.rangeLabel} />
              <MiniStat label="Median width" value={selectedStats.medianWidthLabel} />
            </div>
          </section>

          <RegionBreakdown counts={selectedStats.regionCounts} />
        </aside>

        <section className="min-w-0 space-y-6">
          <SectionCard
            eyebrow="Interactive band map"
            title={`${instrument?.displayName ?? 'Instrument'} coverage`}
            blurb="Switch wavelength windows to see where each band sits. Narrow bars target specific spectral clues; wider bars gather more light."
            action={<SpectrumLegend className="hidden md:flex" />}
          >
            <SpectrumLegend className="mb-4 md:hidden" />
            <SpectralBandChart bands={bands} instrumentName={instrument?.displayName} />
          </SectionCard>

          <SectionCard
            eyebrow="What satellites add"
            title="Your eyes stop at red. Sensors keep going."
            blurb="This comparison shows why infrared bands are central to vegetation and surface analysis."
          >
            <SpectralCompare />
          </SectionCard>

          <SectionCard
            eyebrow="Reference table"
            title="Exact band details"
            blurb="Use the table when you need the numeric wavelength range, center wavelength, width, and spatial resolution."
          >
            <BandTable bands={bands} />
          </SectionCard>

          <section className="grid gap-4 lg:grid-cols-3">
            <ConceptCard
              title="Visible bands"
              copy="Blue, green, and red bands approximate what human eyes can see and support true-color imagery."
            />
            <ConceptCard
              title="Near infrared"
              copy="Healthy leaves strongly reflect NIR, so these bands help estimate vegetation condition and NDVI."
            />
            <ConceptCard
              title="SWIR + thermal"
              copy="Longer wavelengths reveal moisture, burn scars, clouds, mineral signals, and surface heat."
            />
          </section>
        </section>
      </div>
    </main>
  )
}

const fmt = (n) => n.toLocaleString('en-US')
const um = (nm) => +(nm / 1000).toFixed(2)

function summarizeBands(bands) {
  if (!bands.length) {
    return {
      minNm: 0,
      maxNm: 0,
      rangeLabel: '—',
      medianWidthLabel: '—',
      regionCounts: {},
    }
  }
  const widths = [...bands.map((b) => b.widthNm)].sort((a, b) => a - b)
  const mid = Math.floor(widths.length / 2)
  const median = widths.length % 2 ? widths[mid] : (widths[mid - 1] + widths[mid]) / 2
  const minNm = Math.min(...bands.map((b) => b.minNm))
  const maxNm = Math.max(...bands.map((b) => b.maxNm))
  const regionCounts = bands.reduce((acc, band) => {
    acc[band.spectralRegion] = (acc[band.spectralRegion] || 0) + 1
    return acc
  }, {})
  return {
    minNm,
    maxNm,
    rangeLabel: `${fmt(minNm)}–${fmt(maxNm)} nm`,
    rangeUmLabel: `${um(minNm)}–${um(maxNm)} µm`,
    medianWidthLabel: `${+median.toFixed(1)} nm`,
    regionCounts,
  }
}

function Metric({ value, label }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
      <div className="text-2xl font-semibold tracking-tight text-white">{value}</div>
      <div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
        {label}
      </div>
    </div>
  )
}

function MiniStat({ label, value }) {
  return (
    <div className="min-w-0 rounded-2xl bg-white/[0.05] p-3">
      <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/35">{label}</div>
      <div className="mt-1 truncate text-sm font-semibold text-white">{value}</div>
    </div>
  )
}

function SpectrumHero({ bands, instrument, selectedStats }) {
  return (
    <div className="rounded-[32px] border border-white/10 bg-[#0b1a3d]/80 p-5 shadow-[0_30px_100px_-42px_rgba(0,0,0,0.95)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
            Current selection
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            {instrument?.displayName ?? 'Choose an instrument'}
          </h2>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">
          {instrument?.platformType ?? 'Sensor'}
        </span>
      </div>

      <div className="mt-7">
        <div className="relative h-24 overflow-hidden rounded-3xl border border-white/10 bg-[#050b1f]">
          <div className="absolute inset-x-5 top-1/2 h-7 -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,#6a4bd8_0%,#2f6df6_16%,#35c96b_31%,#e7d33f_45%,#e04c3f_54%,#b14de0_66%,#e08a3c_82%,#e0533d_100%)] blur-[0.2px]" />
          <div className="absolute inset-x-5 top-1/2 h-px -translate-y-1/2 bg-white/60" />
          {bands.map((band) => (
            <span
              key={band.id}
              className="absolute top-4 h-16 w-px rounded-full"
              style={{
                left: `${spectrumPct(band.centerNm)}%`,
                backgroundColor: regionColor(band.spectralRegion),
                boxShadow: `0 0 14px ${regionColor(band.spectralRegion)}`,
              }}
              title={`${band.band}: ${band.centerNm} nm`}
            />
          ))}
          <span className="absolute bottom-3 left-5 text-[10px] font-semibold text-white/35">400 nm</span>
          <span className="absolute bottom-3 right-5 text-[10px] font-semibold text-white/35">14,000 nm</span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <MiniStat label="Range" value={selectedStats.rangeUmLabel ?? '—'} />
        <MiniStat label="Bands" value={instrument?.bandCount ?? '—'} />
        <MiniStat label="Window" value="VIS → IR" />
      </div>
    </div>
  )
}

function spectrumPct(nm) {
  const min = Math.log10(400)
  const max = Math.log10(14000)
  const v = Math.log10(Math.min(Math.max(nm, 400), 14000))
  return ((v - min) / (max - min)) * 90 + 5
}

function RegionBreakdown({ counts }) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
      <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
        Spectral regions
      </div>
      <div className="mt-3 space-y-2">
        {SPECTRAL_REGIONS.map((region) => {
          const count = counts[region.label] || 0
          return (
            <div key={region.id} className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: region.color }} />
              <span className="min-w-0 flex-1 text-sm font-semibold text-white/75">{region.label}</span>
              <span className="font-mono text-sm font-bold tabular-nums text-white">{count}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function SectionCard({ eyebrow, title, blurb, action, children }) {
  return (
    <section className="rounded-[32px] border border-white/10 bg-[#0b1a3d]/65 p-4 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.9)] sm:p-5">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#67d1ff]/75">{eyebrow}</div>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{blurb}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function ConceptCard({ title, copy }) {
  return (
    <article className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
      <h3 className="text-lg font-semibold tracking-tight text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{copy}</p>
    </article>
  )
}
