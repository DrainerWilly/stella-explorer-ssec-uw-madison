// @ts-nocheck
import { useMemo, useRef, useState } from 'react'
import Icon from '../Icon'
import samples from '../../data/stellaSamples.json'
import {
  computeStats,
  fieldMeta,
  greennessForRecord,
  parseStellaCsv,
} from '../../utils/stellaData'
import {
  formatClock,
  formatDayClock,
  formatVal,
  heatColor,
  wavelengthToColor,
} from './vizTheme'

const CHART = {
  w: 1180,
  h: 520,
  left: 72,
  right: 82,
  top: 58,
  bottom: 66,
}

const PLOT = {
  x0: CHART.left,
  x1: CHART.w - CHART.right,
  y0: CHART.top,
  y1: CHART.h - CHART.bottom,
}

const SERIES = {
  ndvi: '#23ef3b',
  air: '#18b8e8',
  surface: '#11140b',
}

const REGION_TYPES = {
  vegetation: {
    fill: '#e5f9e8',
    line: '#8bd69b',
    label: 'vegetation',
  },
  mixed: {
    fill: '#f0f9d9',
    line: '#acd977',
    label: 'mixed cover',
  },
  bare: {
    fill: '#fff3cf',
    line: '#e1c766',
    label: 'warm ground',
  },
  shadow: {
    fill: '#eaf2ff',
    line: '#99b8dd',
    label: 'low signal',
  },
  sensor: {
    fill: '#f3f4f7',
    line: '#c2c7cf',
    label: 'sensor run',
  },
}

const DATASET_TONES = {
  'STELLA-1.1': 'border-emerald-200 bg-emerald-50 text-emerald-950',
  'Helio-STELLA': 'border-amber-200 bg-amber-50 text-amber-950',
  'STELLA-AQ': 'border-sky-200 bg-sky-50 text-sky-950',
  'STELLA-Q2': 'border-violet-200 bg-violet-50 text-violet-950',
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n))
}

function roundNice(n) {
  if (!Number.isFinite(n)) return '—'
  const a = Math.abs(n)
  if (a >= 1000) return Math.round(n).toLocaleString('en-US')
  if (a >= 100) return n.toFixed(1)
  if (a >= 10) return n.toFixed(2)
  if (a >= 1) return n.toFixed(2)
  return n.toFixed(3)
}

function mean(values) {
  const v = values.filter((x) => Number.isFinite(x))
  return v.length ? v.reduce((sum, x) => sum + x, 0) / v.length : null
}

function extent(values, fallback = [0, 1], pad = 0.08) {
  const v = values.filter((x) => Number.isFinite(x))
  if (!v.length) return fallback
  let min = Math.min(...v)
  let max = Math.max(...v)
  if (min === max) {
    min -= 1
    max += 1
  }
  const p = (max - min) * pad
  return [min - p, max + p]
}

function sampleEvery(items, maxItems) {
  if (items.length <= maxItems) return items
  const step = (items.length - 1) / (maxItems - 1)
  return Array.from({ length: maxItems }, (_, i) => items[Math.round(i * step)])
}

function polylinePath(points) {
  const parts = []
  let open = false
  for (const p of points) {
    if (p.y == null || !Number.isFinite(p.y)) {
      open = false
      continue
    }
    parts.push(`${open ? 'L' : 'M'}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    open = true
  }
  return parts.join(' ')
}

function formatDuration(ds) {
  const first = ds.records[0]?.t
  const last = ds.records[ds.records.length - 1]?.t
  if (first == null || last == null) return '—'
  const minutes = Math.max(0, (last - first) / 60000)
  if (minutes >= 60) return `${(minutes / 60).toFixed(1)} h`
  return `${Math.max(1, Math.round(minutes))} min`
}

function readAirTemp(env) {
  return env.air_temp_C ?? env.co2_temp_C ?? null
}

function readHumidity(env) {
  return env.rh_pct ?? env.co2_rh_pct ?? null
}

function buildRows(dataset) {
  return dataset.records.map((record, index) => ({
    index,
    t: record.t,
    batch: record.batch,
    ndvi: greennessForRecord(record),
    air: readAirTemp(record.env),
    surface: record.env.surface_temp_C ?? null,
    humidity: readHumidity(record.env),
    battery: record.env.battery_v ?? null,
    co2: record.env.co2_ppm ?? null,
    aqi: record.env.aqi ?? null,
    lux: record.env.lux ?? null,
    lidar: record.env.lidar_m ?? null,
    spec: record.spec,
    env: record.env,
  }))
}

function classifyZone(rows, dataset) {
  const ndvi = mean(rows.map((r) => r.ndvi))
  const surface = mean(rows.map((r) => r.surface))
  const air = mean(rows.map((r) => r.air))
  if (dataset.instrument === 'STELLA-AQ') return { ...REGION_TYPES.sensor, label: 'air-quality interval' }
  if (dataset.instrument === 'Helio-STELLA') return { ...REGION_TYPES.sensor, label: 'sunlight interval' }
  if (ndvi == null) return { ...REGION_TYPES.sensor, label: 'spectral snapshots' }
  if (surface != null && air != null && surface - air > 7 && ndvi < 0.32) {
    return { ...REGION_TYPES.bare, label: 'warm stone / soil' }
  }
  if (ndvi > 0.48) return { ...REGION_TYPES.vegetation, label: 'dense vegetation' }
  if (ndvi > 0.16) return { ...REGION_TYPES.mixed, label: 'mixed vegetation' }
  if (ndvi < -0.08) return { ...REGION_TYPES.shadow, label: 'low vegetation signal' }
  return { ...REGION_TYPES.bare, label: 'open ground' }
}

function buildRegions(rows, dataset) {
  if (!rows.length) return []
  const count = clamp(Math.round(rows.length / 190), 4, 7)
  const regions = []
  for (let i = 0; i < count; i++) {
    const start = Math.floor((i * rows.length) / count)
    const end = Math.max(start + 1, Math.floor(((i + 1) * rows.length) / count))
    const slice = rows.slice(start, end)
    const type = classifyZone(slice, dataset)
    regions.push({
      start: slice[0].index,
      end: slice[slice.length - 1].index,
      ...type,
    })
  }
  return regions
}

function sessionSummary(dataset, rows) {
  const allBands = new Set(dataset.records.flatMap((r) => r.spec.map((b) => b[0])))
  const ndviStats = computeStats(rows.map((r) => r.ndvi).filter((v) => v != null))
  const surfaceStats = computeStats(rows.map((r) => r.surface).filter((v) => v != null))
  const airStats = computeStats(rows.map((r) => r.air).filter((v) => v != null))
  return {
    records: dataset.records.length,
    duration: formatDuration(dataset),
    bands: allBands.size,
    fields: dataset.envFields.length,
    ndviStats,
    surfaceStats,
    airStats,
    start: dataset.records[0]?.t,
  }
}

function DatasetControls({ datasets, uploads, activeId, onSelect, onUpload }) {
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
      setError(e?.message || 'Could not parse that STELLA CSV.')
    }
  }

  const all = [...datasets, ...uploads]

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-[0_16px_44px_-32px_rgba(15,23,42,0.45)]">
      <div className="flex flex-wrap items-center gap-2">
        {all.map((dataset) => {
          const active = dataset.id === activeId
          return (
            <button
              key={dataset.id}
              type="button"
              onClick={() => onSelect(dataset.id)}
              className={`rounded-full border px-4 py-2 text-[12px] font-semibold tracking-tight transition ${
                active
                  ? DATASET_TONES[dataset.instrument] || 'border-slate-300 bg-slate-100 text-slate-950'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-950'
              }`}
            >
              {dataset.instrument}
            </button>
          )
        })}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="ml-auto inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-950 px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-slate-800"
        >
          <Icon name="download" className="h-3.5 w-3.5 rotate-180" />
          Upload CSV
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(event) => {
            handleFiles(event.target.files)
            event.target.value = ''
          }}
        />
      </div>
      {error && (
        <p role="alert" className="mt-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
          {error}
        </p>
      )}
    </div>
  )
}

function MetricCard({ label, value, unit, tone = 'slate' }) {
  const tones = {
    green: 'border-emerald-200 bg-emerald-50 text-emerald-950',
    blue: 'border-sky-200 bg-sky-50 text-sky-950',
    amber: 'border-amber-200 bg-amber-50 text-amber-950',
    slate: 'border-slate-200 bg-white text-slate-950',
  }
  return (
    <div className={`rounded-3xl border px-4 py-3 ${tones[tone] || tones.slate}`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-55">{label}</p>
      <p className="mt-2 flex items-baseline gap-1 font-mono text-2xl font-semibold leading-none tabular-nums">
        {value}
        {unit && <span className="text-xs font-semibold opacity-55">{unit}</span>}
      </p>
    </div>
  )
}

function StellaTransectChart({ dataset, rows, selectedIndex, onSelectedIndex }) {
  const svgRef = useRef(null)
  const sampled = useMemo(() => sampleEvery(rows, 260), [rows])
  const regions = useMemo(() => buildRegions(rows, dataset), [dataset, rows])
  const tempDomain = extent(
    rows.flatMap((r) => [r.air, r.surface]).filter((v) => v != null),
    [18, 24],
    0.12,
  )
  const yNdvi = (v) => PLOT.y1 - ((v + 1) / 2) * (PLOT.y1 - PLOT.y0)
  const yTemp = (v) => PLOT.y1 - ((v - tempDomain[0]) / (tempDomain[1] - tempDomain[0])) * (PLOT.y1 - PLOT.y0)
  const x = (i) => {
    if (rows.length <= 1) return (PLOT.x0 + PLOT.x1) / 2
    return PLOT.x0 + (i / (rows.length - 1)) * (PLOT.x1 - PLOT.x0)
  }

  const selected = rows[clamp(selectedIndex, 0, rows.length - 1)] ?? rows[0]
  const ndviPath = polylinePath(sampled.map((r) => ({ x: x(r.index), y: r.ndvi == null ? null : yNdvi(r.ndvi) })))
  const airPath = polylinePath(sampled.map((r) => ({ x: x(r.index), y: r.air == null ? null : yTemp(r.air) })))
  const surfacePath = polylinePath(sampled.map((r) => ({ x: x(r.index), y: r.surface == null ? null : yTemp(r.surface) })))
  const tempTicks = Array.from({ length: 5 }, (_, i) => tempDomain[0] + ((tempDomain[1] - tempDomain[0]) * i) / 4)
  const ndviTicks = [-1, -0.5, 0, 0.5, 1]

  const selectFromPointer = (event) => {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect || !rows.length) return
    const localX = ((event.clientX - rect.left) / rect.width) * CHART.w
    const ratio = clamp((localX - PLOT.x0) / (PLOT.x1 - PLOT.x0), 0, 1)
    onSelectedIndex(Math.round(ratio * (rows.length - 1)))
  }

  return (
    <section className="rounded-[34px] border border-slate-200 bg-white p-4 shadow-[0_28px_80px_-52px_rgba(15,23,42,0.55)] sm:p-5">
      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2 px-1">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">field transect</p>
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">NDVI · air · surface temperature</h2>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-4 text-sm text-slate-700">
          <span className="inline-flex items-center gap-2"><i className="h-2.5 w-8 rounded-full" style={{ background: SERIES.ndvi }} />NDVI</span>
          <span className="inline-flex items-center gap-2"><i className="h-2.5 w-8 rounded-full" style={{ background: SERIES.air }} />Air</span>
          <span className="inline-flex items-center gap-2"><i className="h-2.5 w-8 rounded-full bg-black" />Surface</span>
        </div>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${CHART.w} ${CHART.h}`}
        className="h-auto w-full select-none rounded-[26px] border border-slate-200 bg-[#fbfcf7]"
        role="img"
        aria-label="STELLA data graph with NDVI, air temperature, and surface temperature"
        onPointerMove={selectFromPointer}
        onPointerDown={selectFromPointer}
      >
        <defs>
          <filter id="dv-line-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0f172a" floodOpacity="0.12" />
          </filter>
        </defs>

        {regions.map((region, index) => {
          const x0 = x(region.start)
          const x1 = x(region.end)
          const width = Math.max(8, x1 - x0)
          const rotate = width < 118
          return (
            <g key={`${region.start}-${region.end}-${index}`}>
              <rect x={x0} y={PLOT.y0} width={width} height={PLOT.y1 - PLOT.y0} fill={region.fill} opacity="0.86" />
              {index > 0 && (
                <line x1={x0} x2={x0} y1={PLOT.y0} y2={PLOT.y1} stroke={region.line} strokeWidth="2" strokeDasharray="8 8" />
              )}
              <text
                x={rotate ? x0 + width / 2 : x0 + width / 2}
                y={rotate ? PLOT.y1 - 34 : PLOT.y1 - 24}
                transform={rotate ? `rotate(-90 ${x0 + width / 2} ${PLOT.y1 - 34})` : undefined}
                textAnchor="middle"
                className="fill-slate-700 text-[20px] font-medium"
                opacity="0.78"
              >
                {region.label}
              </text>
            </g>
          )
        })}

        {ndviTicks.map((tick) => (
          <g key={`ndvi-${tick}`}>
            <line x1={PLOT.x0} x2={PLOT.x1} y1={yNdvi(tick)} y2={yNdvi(tick)} stroke="#1f2937" strokeOpacity={tick === 0 ? 0.38 : 0.18} />
            <text x={PLOT.x0 - 18} y={yNdvi(tick) + 5} textAnchor="end" className="fill-slate-500 text-[15px] font-medium">
              {tick.toFixed(tick === 0 ? 0 : 1)}
            </text>
          </g>
        ))}

        {tempTicks.map((tick) => (
          <text key={`temp-${tick}`} x={PLOT.x1 + 18} y={yTemp(tick) + 5} className="fill-slate-500 text-[15px] font-medium">
            {tick.toFixed(1)}
          </text>
        ))}

        <line x1={PLOT.x0} x2={PLOT.x0} y1={PLOT.y0} y2={PLOT.y1} stroke="#111827" strokeOpacity="0.38" />
        <line x1={PLOT.x1} x2={PLOT.x1} y1={PLOT.y0} y2={PLOT.y1} stroke="#111827" strokeOpacity="0.38" />
        <line x1={PLOT.x0} x2={PLOT.x1} y1={PLOT.y1} y2={PLOT.y1} stroke="#111827" strokeOpacity="0.38" />

        <text x={30} y={(PLOT.y0 + PLOT.y1) / 2} transform={`rotate(-90 30 ${(PLOT.y0 + PLOT.y1) / 2})`} textAnchor="middle" className="fill-black text-[26px] font-medium">
          NDVI
        </text>
        <text x={CHART.w - 24} y={(PLOT.y0 + PLOT.y1) / 2} transform={`rotate(90 ${CHART.w - 24} ${(PLOT.y0 + PLOT.y1) / 2})`} textAnchor="middle" className="fill-black text-[26px] font-medium">
          Celsius°
        </text>

        {ndviPath && <path d={ndviPath} fill="none" stroke={SERIES.ndvi} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" filter="url(#dv-line-glow)" />}
        {airPath && <path d={airPath} fill="none" stroke={SERIES.air} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" filter="url(#dv-line-glow)" />}
        {surfacePath && <path d={surfacePath} fill="none" stroke={SERIES.surface} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" filter="url(#dv-line-glow)" />}

        {sampleEvery(sampled, 64).map((row) => (
          <g key={`dot-${row.index}`}>
            {row.ndvi != null && <circle cx={x(row.index)} cy={yNdvi(row.ndvi)} r="3.4" fill="#b9ffbf" stroke={SERIES.ndvi} strokeWidth="1.8" />}
            {row.air != null && <circle cx={x(row.index)} cy={yTemp(row.air)} r="3.1" fill="#dff7ff" stroke={SERIES.air} strokeWidth="1.6" />}
            {row.surface != null && <circle cx={x(row.index)} cy={yTemp(row.surface)} r="3.3" fill="#fbf9e8" stroke={SERIES.surface} strokeWidth="1.8" />}
          </g>
        ))}

        {selected && (
          <g>
            <line x1={x(selected.index)} x2={x(selected.index)} y1={PLOT.y0} y2={PLOT.y1} stroke="#0f172a" strokeOpacity="0.52" strokeDasharray="5 6" />
            <rect x={x(selected.index) - 80} y={18} width="160" height="30" rx="15" fill="#0f172a" opacity="0.9" />
            <text x={x(selected.index)} y={38} textAnchor="middle" className="fill-white text-[13px] font-semibold">
              {formatClock(selected.t)} UTC
            </text>
          </g>
        )}

        <text x={PLOT.x0} y={CHART.h - 22} className="fill-slate-500 text-[13px] font-medium">
          {rows[0] ? formatClock(rows[0].t) : '—'}
        </text>
        <text x={(PLOT.x0 + PLOT.x1) / 2} y={CHART.h - 22} textAnchor="middle" className="fill-slate-500 text-[13px] font-medium">
          {dataset.records.length.toLocaleString('en-US')} STELLA measurements
        </text>
        <text x={PLOT.x1} y={CHART.h - 22} textAnchor="end" className="fill-slate-500 text-[13px] font-medium">
          {rows[rows.length - 1] ? formatClock(rows[rows.length - 1].t) : '—'}
        </text>
      </svg>
    </section>
  )
}

function SpectrumPanel({ dataset, row }) {
  const spec = row?.spec ?? []
  const nms = spec.map((b) => b[0]).filter((v) => Number.isFinite(v))
  const vals = spec.map((b) => b[1]).filter((v) => Number.isFinite(v))
  const hasSpec = nms.length > 0 && vals.length > 0
  const w = 420
  const h = 250
  const pad = { l: 42, r: 18, t: 22, b: 36 }
  const x0 = pad.l
  const x1 = w - pad.r
  const y0 = pad.t
  const y1 = h - pad.b
  const minNm = hasSpec ? Math.min(...nms) : 400
  const maxNm = hasSpec ? Math.max(...nms) : 950
  const maxVal = hasSpec ? Math.max(...vals) * 1.08 : 1
  const x = (nm) => x0 + ((nm - minNm) / (maxNm - minNm || 1)) * (x1 - x0)
  const y = (v) => y1 - (v / (maxVal || 1)) * (y1 - y0)
  const path = hasSpec
    ? polylinePath(spec.map(([nm, v]) => ({ x: x(nm), y: v == null ? null : y(v) })))
    : ''

  const metricRows = [
    ['NDVI', row?.ndvi, ''],
    ['Surface', row?.surface, '°C'],
    ['Air', row?.air, '°C'],
    ['RH', row?.humidity, '%'],
    ['CO₂', row?.co2, 'ppm'],
    ['AQI', row?.aqi, ''],
    ['Lux', row?.lux, ''],
  ].filter(([, value]) => value != null)

  return (
    <aside className="rounded-[34px] border border-slate-200 bg-white p-5 shadow-[0_28px_80px_-56px_rgba(15,23,42,0.5)]">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">selected measurement</p>
      <div className="mt-2 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-2xl font-semibold tracking-tight text-slate-950">{formatClock(row?.t)} UTC</h3>
          <p className="mt-1 text-xs font-semibold text-slate-500">batch {row?.batch ?? '—'} · {dataset.instrument}</p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
          #{(row?.index ?? 0) + 1}
        </span>
      </div>

      <div className="mt-5 rounded-[28px] border border-slate-200 bg-[#fbfcf7] p-3">
        {hasSpec ? (
          <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img" aria-label="Selected STELLA spectral fingerprint">
            <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="#ffffff" />
            {spec.map(([nm], i) => {
              const bx0 = i === 0 ? x0 : (x(spec[i - 1][0]) + x(nm)) / 2
              const bx1 = i === spec.length - 1 ? x1 : (x(nm) + x(spec[i + 1][0])) / 2
              return <rect key={nm} x={bx0} y={y1 + 10} width={Math.max(2, bx1 - bx0)} height="9" fill={wavelengthToColor(nm)} opacity="0.95" />
            })}
            {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
              <line key={tick} x1={x0} x2={x1} y1={y1 - tick * (y1 - y0)} y2={y1 - tick * (y1 - y0)} stroke="#e2e8f0" />
            ))}
            <path d={path} fill="none" stroke="#173f9f" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            {spec.map(([nm, value]) => value == null ? null : (
              <circle key={nm} cx={x(nm)} cy={y(value)} r="4" fill="#fff" stroke={wavelengthToColor(nm)} strokeWidth="2" />
            ))}
            <line x1={x0} x2={x0} y1={y0} y2={y1} stroke="#334155" strokeOpacity="0.35" />
            <line x1={x0} x2={x1} y1={y1} y2={y1} stroke="#334155" strokeOpacity="0.35" />
            <text x={x0} y={h - 7} className="fill-slate-500 text-[11px] font-medium">{minNm} nm</text>
            <text x={x1} y={h - 7} textAnchor="end" className="fill-slate-500 text-[11px] font-medium">{maxNm} nm</text>
            <text x={x0 - 8} y={y0 + 4} textAnchor="end" className="fill-slate-500 text-[11px] font-medium">{formatVal(maxVal, 1)}</text>
          </svg>
        ) : (
          <div className="grid min-h-[220px] place-items-center text-center">
            <div>
              <Icon name="data" className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-600">This dataset has environmental sensors, not spectral bands.</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {metricRows.slice(0, 6).map(([label, value, unit]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
            <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-slate-950">
              {roundNice(value)} <span className="text-xs text-slate-500">{unit}</span>
            </p>
          </div>
        ))}
      </div>
    </aside>
  )
}

function SpectralHeatmap({ dataset, rows }) {
  const records = sampleEvery(rows.filter((r) => r.spec?.length), 150)
  const wavelengths = [...new Set(dataset.records.flatMap((r) => r.spec.map((b) => b[0])))].sort((a, b) => a - b)
  const hasData = records.length > 0 && wavelengths.length > 0
  const values = records.flatMap((r) => r.spec.map((b) => b[1]).filter((v) => Number.isFinite(v)))
  const logs = values.map((v) => Math.log1p(Math.max(0, v)))
  const minLog = logs.length ? Math.min(...logs) : 0
  const maxLog = logs.length ? Math.max(...logs) : 1
  const w = 960
  const h = 260
  const pad = { l: 58, r: 18, t: 28, b: 34 }
  const x0 = pad.l
  const x1 = w - pad.r
  const y0 = pad.t
  const y1 = h - pad.b
  const cw = (x1 - x0) / Math.max(1, records.length)
  const ch = (y1 - y0) / Math.max(1, wavelengths.length)

  return (
    <section className="rounded-[34px] border border-slate-200 bg-white p-5 shadow-[0_28px_80px_-56px_rgba(15,23,42,0.48)]">
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">spectral field</p>
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">Irradiance heatmap</h2>
        </div>
        <p className="text-xs font-medium text-slate-400">{dataset.specUnit || 'sensor value'}</p>
      </div>
      {hasData ? (
        <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full rounded-[26px] border border-slate-200 bg-[#10131a]" role="img" aria-label="STELLA spectral heatmap">
          <rect width={w} height={h} fill="#10131a" />
          {records.map((row, ci) => wavelengths.map((nm, ri) => {
            const band = row.spec.find((b) => b[0] === nm)
            const value = band?.[1]
            const t = value == null ? 0 : (Math.log1p(Math.max(0, value)) - minLog) / (maxLog - minLog || 1)
            return (
              <rect
                key={`${ci}-${nm}`}
                x={x0 + ci * cw}
                y={y0 + (wavelengths.length - 1 - ri) * ch}
                width={Math.ceil(cw) + 0.2}
                height={Math.ceil(ch) + 0.2}
                fill={heatColor(t)}
                opacity={value == null ? 0.05 : 0.96}
              />
            )
          }))}
          {wavelengths.map((nm, ri) => {
            if (ri % Math.ceil(wavelengths.length / 6) !== 0 && ri !== wavelengths.length - 1) return null
            const y = y0 + (wavelengths.length - 1 - ri) * ch + ch / 2
            return (
              <text key={nm} x={x0 - 10} y={y + 4} textAnchor="end" className="fill-slate-300 text-[12px] font-medium">
                {nm}
              </text>
            )
          })}
          <text x={x0} y={h - 10} className="fill-slate-400 text-[12px] font-medium">{records[0] ? formatClock(records[0].t) : '—'}</text>
          <text x={(x0 + x1) / 2} y={h - 10} textAnchor="middle" className="fill-slate-400 text-[12px] font-medium">time</text>
          <text x={x1} y={h - 10} textAnchor="end" className="fill-slate-400 text-[12px] font-medium">{records[records.length - 1] ? formatClock(records[records.length - 1].t) : '—'}</text>
          <text x={18} y={(y0 + y1) / 2} transform={`rotate(-90 18 ${(y0 + y1) / 2})`} textAnchor="middle" className="fill-slate-400 text-[12px] font-bold uppercase tracking-[0.16em]">wavelength nm</text>
        </svg>
      ) : (
        <div className="grid min-h-[250px] place-items-center rounded-[26px] border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-500">
          No spectral heatmap for this dataset.
        </div>
      )}
    </section>
  )
}

function EnvironmentStrip({ dataset, rows }) {
  const keys = dataset.envFields.slice(0, 8)
  return (
    <section className="rounded-[34px] border border-slate-200 bg-white p-5 shadow-[0_28px_80px_-56px_rgba(15,23,42,0.48)]">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">sensor channels</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        {keys.map((key) => {
          const meta = fieldMeta(key)
          const stats = computeStats(rows.map((r) => r.env[key]).filter((v) => v != null))
          if (!stats) return null
          const range = stats.max - stats.min || 1
          return (
            <div key={key} className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-xs font-semibold text-slate-600">{meta.label}</p>
                <p className="font-mono text-sm font-semibold text-slate-950">{roundNice(stats.mean)} {meta.unit}</p>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-slate-900"
                  style={{ width: `${clamp(((stats.mean - stats.min) / range) * 100, 6, 100)}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between font-mono text-[10px] text-slate-400">
                <span>{roundNice(stats.min)}</span>
                <span>{roundNice(stats.max)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default function DataVisualizerPage() {
  const [uploads, setUploads] = useState([])
  const [activeId, setActiveId] = useState(samples.datasets[0].id)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const datasets = samples.datasets
  const allDatasets = useMemo(() => [...datasets, ...uploads], [datasets, uploads])
  const dataset = allDatasets.find((d) => d.id === activeId) ?? datasets[0]
  const rows = useMemo(() => buildRows(dataset), [dataset])
  const summary = useMemo(() => sessionSummary(dataset, rows), [dataset, rows])
  const selected = rows[clamp(selectedIndex, 0, rows.length - 1)] ?? rows[0]

  const selectDataset = (id) => {
    setActiveId(id)
    setSelectedIndex(0)
  }

  const addUpload = (upload) => {
    setUploads((items) => [...items, upload])
    setActiveId(upload.id)
    setSelectedIndex(0)
  }

  return (
    <main className="order-1 flex-1 overflow-y-auto overflow-x-hidden bg-[#f6f7f2] text-slate-950 lg:min-h-0">
      <div className="mx-auto max-w-[1560px] px-5 pb-12 pt-6 sm:px-8 lg:px-10">
        <header className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(560px,0.9fr)] xl:items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">NASA STELLA field data</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.045em] text-slate-950 sm:text-5xl">
              STELLA Data Visualizer
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">
              A clean viewer for STELLA spectra, NDVI estimates, and environmental sensor traces.
            </p>
          </div>
          <DatasetControls
            datasets={datasets}
            uploads={uploads}
            activeId={dataset.id}
            onSelect={selectDataset}
            onUpload={addUpload}
          />
        </header>

        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="records" value={summary.records.toLocaleString('en-US')} />
          <MetricCard label="duration" value={summary.duration} tone="blue" />
          <MetricCard label="bands" value={summary.bands || '—'} tone="green" />
          <MetricCard label="start UTC" value={summary.start ? formatDayClock(summary.start).slice(0, 10) : '—'} tone="amber" />
        </section>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
          <StellaTransectChart
            dataset={dataset}
            rows={rows}
            selectedIndex={selected?.index ?? 0}
            onSelectedIndex={setSelectedIndex}
          />
          <SpectrumPanel dataset={dataset} row={selected} />
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
          <SpectralHeatmap dataset={dataset} rows={rows} />
          <EnvironmentStrip dataset={dataset} rows={rows} />
        </div>

        <footer className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-[11px] font-medium text-slate-400">
          <span>Data source: NASA STELLA sample sessions. Uploads are parsed locally in the browser.</span>
          <a
            href="https://science.gsfc.nasa.gov/stella/stella-dataviewer/"
            target="_blank"
            rel="noreferrer"
            className="text-slate-600 underline decoration-slate-300 underline-offset-4 hover:text-slate-950"
          >
            NASA STELLA Dataviewer ↗
          </a>
        </footer>
      </div>
    </main>
  )
}
