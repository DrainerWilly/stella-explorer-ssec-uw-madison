// @ts-nocheck
import { useState } from 'react'
import { SIGNATURES } from '../../data/spectra'

// Chart domain: 400–950 nm (visible + near-infrared, the range STELLA and the
// signature story live in). Reuses the published curves in spectra.js and adds
// two extra educational mock curves (dry leaf, grass).
const clip = (pts) => pts.filter((p) => p.w <= 950)

const CURVES = {
  healthyLeaf: { label: 'Healthy leaf', color: '#3fae5e', points: clip(SIGNATURES.vegetation.points), note: 'Low in red (chlorophyll absorbs it), then a sharp "red edge" jump into the near-infrared.' },
  grass: { label: 'Grass', color: '#7cb342', points: [
    { w: 450, r: 5 }, { w: 550, r: 14 }, { w: 650, r: 7 }, { w: 700, r: 20 }, { w: 750, r: 40 }, { w: 800, r: 43 }, { w: 865, r: 44 }, { w: 950, r: 42 },
  ], note: 'Like a healthy leaf but a little less near-infrared reflectance.' },
  dryLeaf: { label: 'Dry leaf', color: '#c79a3f', points: [
    { w: 450, r: 9 }, { w: 550, r: 18 }, { w: 650, r: 20 }, { w: 700, r: 26 }, { w: 750, r: 33 }, { w: 800, r: 36 }, { w: 865, r: 38 }, { w: 950, r: 39 },
  ], note: 'No strong red edge: a dried leaf has lost the chlorophyll that creates it.' },
  soil: { label: 'Soil', color: '#b07a45', points: clip(SIGNATURES.soil.points), note: 'A gradual, steady rise: no red edge, no sharp features.' },
  pavement: { label: 'Pavement', color: '#8a8f96', points: clip(SIGNATURES.pavement.points), note: 'Nearly flat across the whole range: manmade surfaces lack the vegetation jump.' },
  water: { label: 'Water', color: '#3b7fd6', points: clip(SIGNATURES.water.points), note: 'Low everywhere and nearly zero in the near-infrared: water absorbs it.' },
}

const ORDER = ['healthyLeaf', 'dryLeaf', 'grass', 'soil', 'pavement', 'water']

const W = 360
const H = 180
const PAD = { l: 30, r: 10, t: 12, b: 26 }
const PW = W - PAD.l - PAD.r
const PH = H - PAD.t - PAD.b
const WMIN = 400
const WMAX = 950
const RMAX = 55
const VIS_MAX = 700

const xs = (w) => PAD.l + ((w - WMIN) / (WMAX - WMIN)) * PW
const ys = (r) => PAD.t + (1 - r / RMAX) * PH

export default function SpectralSignatureBuilder() {
  const [key, setKey] = useState('healthyLeaf')
  const cur = CURVES[key]
  const line = cur.points.map((p, i) => `${i === 0 ? 'M' : 'L'}${xs(p.w).toFixed(1)} ${ys(p.r).toFixed(1)}`).join(' ')
  const area = `${line} L${xs(WMAX).toFixed(1)} ${ys(0)} L${xs(WMIN).toFixed(1)} ${ys(0)} Z`

  return (
    <div className="flex flex-col gap-4">
      {/* object selector */}
      <div className="flex flex-wrap gap-2">
        {ORDER.map((k) => (
          <button
            key={k}
            onClick={() => setKey(k)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
              k === key ? 'bg-ink text-app shadow-soft' : 'bg-cream text-ink/70 hover:text-ink'
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CURVES[k].color }} />
            {CURVES[k].label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-3 shadow-soft">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${cur.label} spectral signature`}>
          {/* region shading */}
          <rect x={xs(WMIN)} y={PAD.t} width={xs(VIS_MAX) - xs(WMIN)} height={PH} fill="#4F9DDE" fillOpacity="0.07" />
          <rect x={xs(VIS_MAX)} y={PAD.t} width={xs(WMAX) - xs(VIS_MAX)} height={PH} fill="#B14DE0" fillOpacity="0.07" />
          <text x={(xs(WMIN) + xs(VIS_MAX)) / 2} y={H - 4} textAnchor="middle" className="fill-faint" fontSize="8">visible</text>
          <text x={(xs(VIS_MAX) + xs(WMAX)) / 2} y={H - 4} textAnchor="middle" className="fill-faint" fontSize="8">near-infrared</text>

          {/* y gridlines */}
          {[0, 25, 50].map((r) => (
            <g key={r}>
              <line x1={PAD.l} x2={W - PAD.r} y1={ys(r)} y2={ys(r)} stroke="#000" strokeOpacity="0.06" />
              <text x={PAD.l - 5} y={ys(r) + 3} textAnchor="end" className="fill-faint" fontSize="8">{r}</text>
            </g>
          ))}

          {/* x ticks */}
          {[400, 550, 700, 850, 950].map((w) => (
            <text key={w} x={xs(w)} y={PAD.t + PH + 11} textAnchor="middle" className="fill-faint" fontSize="8">{w}</text>
          ))}

          <path d={area} fill={cur.color} fillOpacity="0.14" />
          <path d={line} fill="none" stroke={cur.color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="mt-1 text-center text-[10px] font-semibold text-faint">wavelength (nm) · reflectance (%)</p>
      </div>

      <div className="rounded-2xl bg-cream p-4">
        <h4 className="text-sm font-extrabold tracking-tight text-ink">{cur.label}</h4>
        <p className="mt-1 text-sm leading-relaxed text-muted">{cur.note}</p>
      </div>
    </div>
  )
}
