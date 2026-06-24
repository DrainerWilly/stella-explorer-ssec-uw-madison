// Four summary cards describing the selected instrument.
const fmt = (n) => n.toLocaleString('en-US')
const um = (nm) => +(nm / 1000).toFixed(2)

export default function BandInfoPanel({ instrument }) {
  if (!instrument) return null
  const isField = instrument.platformType === 'Field Instrument'

  const cards = [
    { label: 'Instrument', value: instrument.displayName },
    {
      label: 'Platform type',
      value: instrument.platformType,
      badge: isField ? 'bg-cardmint' : 'bg-blue',
    },
    { label: 'Number of bands', value: instrument.bandCount },
    {
      label: 'Wavelength coverage',
      value: `${fmt(instrument.minNm)}–${fmt(instrument.maxNm)} nm`,
      sub: `${um(instrument.minNm)}–${um(instrument.maxNm)} µm`,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-card bg-surface p-4 shadow-soft">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-faint">
            {c.label}
          </div>
          {c.badge ? (
            <span
              className={`mt-2 inline-block rounded-full ${c.badge} px-2.5 py-1 text-sm font-bold text-cink`}
            >
              {c.value}
            </span>
          ) : (
            <div className="mt-1 text-lg font-extrabold leading-tight tracking-tight text-ink">
              {c.value}
            </div>
          )}
          {c.sub && <div className="mt-0.5 text-xs font-semibold text-muted">{c.sub}</div>}
        </div>
      ))}
    </div>
  )
}
