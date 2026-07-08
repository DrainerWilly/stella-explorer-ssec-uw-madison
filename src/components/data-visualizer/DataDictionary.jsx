import { useState } from 'react'
import Icon from '../Icon.jsx'
import { fieldMeta } from '../../utils/stellaData.ts'
import { wavelengthToColor } from './vizTheme.js'

// Collapsible reference describing every field in the active dataset — the
// bridge between the raw CSV headers and what each number physically means.
export default function DataDictionary({ dataset }) {
  const [open, setOpen] = useState(false)
  const nms = [...new Set(dataset.records.flatMap((r) => r.spec.map((b) => b[0])))].sort((a, b) => a - b)

  return (
    <div className="rounded-panel bg-surface shadow-soft">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-extrabold text-ink">
          <Icon name="book" className="h-4 w-4" />
          Data dictionary — what every field means
        </span>
        <Icon name="chevron" className={`h-4 w-4 text-muted transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>

      {open && (
        <div className="grid gap-x-6 gap-y-2 px-4 pb-4 sm:grid-cols-2">
          {dataset.envFields.map((k) => {
            const m = fieldMeta(k)
            return (
              <div key={k} className="border-t border-ink/10 pt-2">
                <div className="text-[13px] font-bold text-ink">
                  {m.label} {m.unit && <span className="font-semibold text-muted">({m.unit})</span>}
                </div>
                <p className="text-[12px] leading-snug text-muted">{m.note}</p>
              </div>
            )
          })}
          {nms.length > 0 && (
            <div className="border-t border-ink/10 pt-2 sm:col-span-2">
              <div className="text-[13px] font-bold text-ink">
                Spectral bands <span className="font-semibold text-muted">({dataset.specUnit})</span>
              </div>
              <p className="text-[12px] leading-snug text-muted">
                Irradiance measured in {nms.length} wavelength bands. Values above ~750 nm are
                near-infrared — invisible to eyes, loud to plants.
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {nms.map((nm) => (
                  <span key={nm} className="inline-flex items-center gap-1 rounded-full bg-cream px-2 py-0.5 text-[10px] font-bold text-ink/75">
                    <span className="h-2 w-2 rounded-full ring-1 ring-ink/20" style={{ background: wavelengthToColor(nm) }} />
                    {nm} nm
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
