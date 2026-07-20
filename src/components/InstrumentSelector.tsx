// @ts-nocheck
import Icon from './Icon'
import { INSTRUMENTS } from '../data/instruments'

// "Choose an instrument" dropdown. Native <select> for accessibility (keyboard,
// screen readers, mobile pickers) with grouped options and a chevron overlay.
export default function InstrumentSelector({ value, onChange }) {
  const satellites = INSTRUMENTS.filter((i) => i.platformType === 'Satellite')
  const field = INSTRUMENTS.filter((i) => i.platformType === 'Field Instrument')

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-muted">Choose an instrument</span>
      <div className="relative max-w-md">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-2xl border border-ink/10 bg-surface px-4 py-3 pr-11 text-base font-bold text-ink shadow-soft outline-none transition-colors hover:border-ink/20 focus-visible:border-ink/40 focus-visible:ring-2 focus-visible:ring-ink/15"
        >
          <optgroup label="Satellites">
            {satellites.map((i) => (
              <option key={i.id} value={i.id}>
                {i.displayName}
              </option>
            ))}
          </optgroup>
          <optgroup label="Field Instruments">
            {field.map((i) => (
              <option key={i.id} value={i.id}>
                {i.displayName}
              </option>
            ))}
          </optgroup>
        </select>
        <Icon
          name="chevron"
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-ink/50"
        />
      </div>
    </label>
  )
}
