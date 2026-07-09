import { useRef, useState } from 'react'
import Icon from '../Icon.jsx'
import { parseStellaCsv } from '../../utils/stellaData.ts'
import { ACCENT, LABEL } from './dvStyles.js'

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
      onUpload(parseStellaCsv(text, file.name))
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
        className={`w-full rounded-2xl border p-3 text-left transition-colors ${
          active ? 'border-cyan-400/40 bg-white/[0.07]' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
            style={active ? { backgroundColor: ACCENT, color: '#04121f' } : { background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)' }}
          >
            <Icon name={isUpload ? 'share' : INSTRUMENT_ICON[ds.instrument] || 'data'} className="h-[18px] w-[18px]" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-extrabold text-white">{ds.instrument}</span>
            <span className="block truncate text-[11px] font-semibold text-white/45">{ds.title}</span>
          </span>
        </div>
        <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wide text-white/35">
          {ds.records.length.toLocaleString('en-US')} records{isUpload ? ' · your file' : ' · NASA sample'}
        </p>
      </button>
    )
  }

  return (
    <div className="space-y-2.5">
      <p className={LABEL}>NASA sample sessions</p>
      {datasets.map((ds) => card(ds, false))}

      {uploads.length > 0 && (
        <>
          <p className={`${LABEL} pt-1`}>Your files</p>
          {uploads.map((ds) => card(ds, true))}
        </>
      )}

      {/* dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
        className={`rounded-2xl border-2 border-dashed p-4 text-center transition-colors ${
          dragOver ? 'border-cyan-400 bg-cyan-400/10' : 'border-white/15 bg-white/[0.02]'
        }`}
      >
        <Icon name="download" className="mx-auto h-5 w-5 rotate-180 text-white/45" />
        <p className="mt-1.5 text-xs font-bold text-white/80">Drop your STELLA CSV</p>
        <p className="mt-0.5 text-[11px] leading-snug text-white/45">
          Straight off the SD card — parsed in your browser, never uploaded.
        </p>
        <button
          onClick={() => fileRef.current?.click()}
          className="mt-2 rounded-full px-4 py-1.5 text-xs font-bold transition-opacity hover:opacity-90"
          style={{ backgroundColor: ACCENT, color: '#04121f' }}
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
        <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-[11px] font-semibold leading-snug text-rose-100">
          {error}
        </p>
      )}
    </div>
  )
}
