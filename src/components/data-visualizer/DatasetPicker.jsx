import { useRef, useState } from 'react'
import Icon from '../Icon.jsx'
import { parseStellaCsv } from '../../utils/stellaData.ts'

const INSTRUMENT_ICON = {
  'STELLA-1.1': 'device',
  'Helio-STELLA': 'sun',
  'STELLA-AQ': 'cloud',
  'STELLA-Q2': 'spectrum',
}

// Left rail: NASA sample datasets + drop-your-own-CSV. Uploads are parsed
// locally in the browser and never leave the device.
export default function DatasetPicker({ datasets, uploads, activeId, onSelect, onUpload }) {
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState(null)
  const fileRef = useRef(null)

  const handleFiles = async (files) => {
    const file = files?.[0]
    if (!file) return
    setError(null)
    try {
      const text = await file.text()
      const ds = parseStellaCsv(text, file.name)
      onUpload(ds)
    } catch (e) {
      setError(e?.message || 'Could not parse that file.')
    }
  }

  const card = (ds, isUpload) => {
    const active = ds.id === activeId
    return (
      <button
        key={ds.id}
        onClick={() => onSelect(ds.id)}
        aria-pressed={active}
        className={`w-full rounded-2xl border-2 p-3 text-left transition-all ${
          active ? 'border-ink bg-surface shadow-soft' : 'border-transparent bg-surface/60 hover:bg-surface'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${active ? 'bg-ink text-app' : 'bg-cream text-ink/70'}`}>
            <Icon name={isUpload ? 'share' : INSTRUMENT_ICON[ds.instrument] || 'data'} className="h-[18px] w-[18px]" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-extrabold text-ink">{ds.instrument}</span>
            <span className="block truncate text-[11px] font-semibold text-muted">{ds.title}</span>
          </span>
        </div>
        <p className="mt-2 line-clamp-3 text-[11px] leading-snug text-muted">{ds.description}</p>
        <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wide text-faint">
          {ds.records.length.toLocaleString('en-US')} records{isUpload ? ' · your file' : ' · NASA sample'}
        </p>
      </button>
    )
  }

  return (
    <div className="space-y-2.5">
      <p className="text-xs font-bold uppercase tracking-wide text-faint">NASA sample sessions</p>
      {datasets.map((ds) => card(ds, false))}

      {uploads.length > 0 && (
        <>
          <p className="pt-1 text-xs font-bold uppercase tracking-wide text-faint">Your files</p>
          {uploads.map((ds) => card(ds, true))}
        </>
      )}

      {/* dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
        className={`rounded-2xl border-2 border-dashed p-4 text-center transition-colors ${
          dragOver ? 'border-sky-400 bg-sky-400/10' : 'border-ink/20 bg-cream/50'
        }`}
      >
        <Icon name="download" className="mx-auto h-5 w-5 rotate-180 text-ink/50" />
        <p className="mt-1.5 text-xs font-bold text-ink/80">Drop your STELLA CSV here</p>
        <p className="mt-0.5 text-[11px] leading-snug text-muted">
          Straight off the device’s SD card. Parsed in your browser — it never leaves this computer.
        </p>
        <button
          onClick={() => fileRef.current?.click()}
          className="mt-2 rounded-full bg-ink px-4 py-1.5 text-xs font-bold text-app transition-all hover:opacity-90"
        >
          Choose file
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => { handleFiles(e.target.files); e.target.value = '' }}
        />
      </div>
      {error && (
        <p role="alert" className="rounded-xl bg-coral/20 px-3 py-2 text-[11px] font-semibold leading-snug text-ink/90">
          {error}
        </p>
      )}
    </div>
  )
}
