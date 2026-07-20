// @ts-nocheck
import { useMemo, useState } from 'react'
import InstrumentSelector from './InstrumentSelector'
import BandInfoPanel from './BandInfoPanel'
import SpectralBandChart from './SpectralBandChart'
import SpectrumLegend from './SpectrumLegend'
import BandTable from './BandTable'
import {
  DEFAULT_INSTRUMENT_ID,
  getBandsForInstrument,
  getInstrument,
} from '../data/instruments'

// Spectral Band Explorer: the Data & Graphs page. Students pick a satellite
// mission or field instrument and compare how its bands sample the spectrum.
export default function DataGraphsPage() {
  const [instrumentId, setInstrumentId] = useState(DEFAULT_INSTRUMENT_ID)
  const instrument = getInstrument(instrumentId)
  const bands = useMemo(() => getBandsForInstrument(instrumentId), [instrumentId])

  return (
    <main className="order-1 flex-1 overflow-y-auto overflow-x-hidden scroll-soft px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Spectral Band Explorer
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
          Compare how satellites and field instruments observe different parts of the
          electromagnetic spectrum.
        </p>
      </header>

      <div className="mt-6">
        <InstrumentSelector value={instrumentId} onChange={setInstrumentId} />
      </div>

      <div className="mt-5">
        <BandInfoPanel instrument={instrument} />
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <h2 className="text-lg font-extrabold tracking-tight text-ink">Band coverage</h2>
        <SpectrumLegend className="hidden sm:flex" />
      </div>
      <SpectrumLegend className="mt-3 sm:hidden" />
      <div className="mt-3">
        <SpectralBandChart bands={bands} instrumentName={instrument?.displayName} />
      </div>

      <h2 className="mt-7 text-lg font-extrabold tracking-tight text-ink">Band details</h2>
      <div className="mt-3">
        <BandTable bands={bands} />
      </div>

      <div className="mt-6 rounded-panel bg-cream p-5">
        <h3 className="text-sm font-extrabold uppercase tracking-wide text-muted">
          Why bands are important
        </h3>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink/80">
          Every instrument splits light into bands, slices of the spectrum it can
          measure. Our eyes only see <strong>visible light</strong> (about 400–700 nm), but
          satellites and STELLA also detect <strong>infrared</strong>, which reveals plant health,
          water, heat, and more. Wider bands collect more light; narrower bands target specific
          features like the vegetation red edge. A field instrument like STELLA has no ground
          resolution, it measures whatever you point it at, while a satellite band's resolution is
          how much ground each pixel covers. Switch instruments above to see how a handheld sensor
          and a satellite sample the same spectrum differently.
        </p>
      </div>
    </main>
  )
}
