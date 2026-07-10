import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Icon from '../Icon.jsx'
import {
  RS_BANDS,
  S11_BANDS,
  RS_TARGETS,
  AA1_TARGETS,
  bandColor,
  spectrumAt,
  STELLA_SOURCE,
} from '../../data/stellaBuilds.js'

// Deterministic per-tick noise so live readings wiggle believably.
const noise = (tick, i, amp = 0.06) => 1 + Math.sin(tick * 1.31 + i * 7.7) * amp

const chip =
  'rounded-[3px] px-1.5 py-0.5 text-[9px] font-bold uppercase leading-tight tracking-wide'

// =================================================================================
// STELLA-1.2 platform screens (shared by the base device and its modules)
// =================================================================================

const PAGES = ['sensors', 'settings', 'status', 'time', 'data']
const PAGE_LABEL = {
  sensors: 'sensors',
  settings: 'system settings',
  status: 'status',
  time: 'time & place',
  data: 'sample data',
}

function RsSensorsPage({ target, tick, live, onToggleLive }) {
  const t = live ? tick : 0
  return (
    <div className="flex h-full flex-col">
      <div className="flex justify-between px-1 text-[9px] font-bold text-slate-600">
        <span className="text-slate-800">counts</span>
        <span>linear</span>
        <span className="text-slate-800">vis + nir</span>
        <span>exposure</span>
        <span>heat</span>
      </div>
      <svg viewBox="0 0 300 118" className="mt-0.5 w-full flex-1">
        <line x1="14" y1="4" x2="14" y2="102" stroke="#3a4358" strokeWidth="1" />
        <line x1="14" y1="102" x2="294" y2="102" stroke="#3a4358" strokeWidth="1" />
        {RS_BANDS.map((nm, i) => {
          const v = Math.min(1, target.spectrum[i] * noise(t, i))
          const x = 16 + ((nm - 400) / 600) * 272
          const h = v * 92
          return <rect key={nm} x={x} y={102 - h} width="6" height={h} fill={bandColor(nm)} />
        })}
        {[400, 550, 700, 850, 1000].map((nm) => (
          <text
            key={nm}
            x={16 + ((nm - 400) / 600) * 272}
            y="113"
            textAnchor="middle"
            fontSize="8"
            fill="#3a4358"
            fontFamily="monospace"
          >
            {nm}
          </text>
        ))}
      </svg>
      <div className="flex items-center justify-between px-1 pb-0.5 text-[9px] font-bold text-slate-600">
        <span>sensors</span>
        <span>wavelength nm</span>
        <span className="text-slate-800">standoff {(0.62 * noise(t, 3, 0.03)).toFixed(2)} m</span>
        <button
          onClick={onToggleLive}
          className={live ? 'bg-emerald-700 px-1 font-bold text-white' : 'bg-slate-500 px-1 font-bold text-white'}
        >
          {live ? 'LIVE' : 'HOLD'}
        </button>
      </div>
      <div className="border-t border-slate-400/60 px-1 pt-0.5 text-[9px] font-bold text-slate-700">
        surface {(target.surfaceTempC + Math.sin(t) * 0.4).toFixed(1)}°C · air{' '}
        {(22.3 * noise(t, 9, 0.01)).toFixed(1)}°C
      </div>
    </div>
  )
}

function Aa1SensorsPage({ target, tick }) {
  const rows = [
    { label: 'CO2', value: Math.round(target.co2 * noise(tick, 1, 0.02)), unit: 'ppm', max: 1200 },
    { label: 'CH4', value: (target.ch4 * noise(tick, 2, 0.03)).toFixed(1), unit: 'ppm', max: 10 },
    { label: 'PM2.5', value: Math.round(target.pm25 * noise(tick, 3)), unit: 'ug/m3', max: 80 },
    { label: 'PM10', value: Math.round(target.pm10 * noise(tick, 4)), unit: 'ug/m3', max: 120 },
    { label: 'RH', value: Math.round(target.rh * noise(tick, 5, 0.02)), unit: '%', max: 100 },
    { label: 'TEMP', value: (target.tempC + Math.sin(tick) * 0.2).toFixed(1), unit: 'C', max: 45 },
    { label: 'PRES', value: Math.round(target.hpa), unit: 'hPa', max: 1060 },
  ]
  const co2 = Number(rows[0].value)
  const airTag = co2 > 1500 ? 'HIGH' : co2 > 800 ? 'MODERATE' : 'GOOD'
  const tagColor = airTag === 'GOOD' ? 'bg-emerald-700' : airTag === 'MODERATE' ? 'bg-amber-600' : 'bg-red-700'
  return (
    <div className="flex h-full flex-col px-1">
      <div className="flex items-baseline justify-between">
        <span className="text-[9px] font-bold uppercase text-slate-600">air analyzer 1</span>
        <span className={`${chip} ${tagColor} text-white`}>{airTag}</span>
      </div>
      <div className="mt-0.5 grid flex-1 content-between">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-1.5">
            <span className="w-9 text-[9px] font-bold text-slate-800">{r.label}</span>
            <span className="w-14 text-right text-[10px] font-bold tabular-nums text-slate-900">
              {r.value}
            </span>
            <span className="w-9 text-[8px] text-slate-600">{r.unit}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-sm bg-slate-400/40">
              <div
                className="h-full bg-slate-700"
                style={{ width: `${Math.min(100, (Number(r.value) / r.max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="pb-0.5 text-[8px] text-slate-600">logging to SD · csv · every 2 s</p>
    </div>
  )
}

function ScanPage({ tick, lines }) {
  const shown = Math.min(lines.length, Math.floor(tick / 1.5) + 1)
  return (
    <div className="h-full px-1 py-0.5 text-[10px] leading-[1.5] text-slate-800">
      {lines.slice(0, shown).map((l, i) => (
        <div key={i} className={i === lines.length - 1 ? 'font-bold text-emerald-800' : ''}>
          {l}
        </div>
      ))}
    </div>
  )
}

const PROTO_LINES = [
  '> stella-1.2 qwiic bus scan…',
  '  0x10  gps          ok',
  '  0x36  rotary knob   ok',
  '  0x68  pcf8523 rtc   ok',
  '  ----  module bay   EMPTY',
  '> no module sensors found.',
  '> add YOUR sensor here_',
]

const BASE12_LINES = [
  '> stella-1.2 self-test…',
  '  0x10  gps          ok',
  '  0x36  rotary knob   ok',
  '  0x68  pcf8523 rtc   ok',
  '  sd    8 GB          ok',
  '  ----  module bay   EMPTY',
  '> snap on STELLA-RS or AA1_',
]

function SettingsPage({ settings, onChange }) {
  const Row = ({ label, unit, k, step, min, max }) => (
    <div className="flex items-center justify-between border-b border-slate-400/40 py-1">
      <span className="text-[9px] font-bold uppercase text-slate-700">{label}</span>
      <span className="flex items-center gap-1.5">
        <button
          onClick={() => onChange(k, Math.max(min, settings[k] - step))}
          className="grid h-4 w-4 place-items-center rounded-sm bg-slate-700 text-[9px] font-bold text-white"
          aria-label={`decrease ${label}`}
        >
          −
        </button>
        <span className="w-12 text-center text-[10px] font-bold tabular-nums text-slate-900">
          {settings[k]} {unit}
        </span>
        <button
          onClick={() => onChange(k, Math.min(max, settings[k] + step))}
          className="grid h-4 w-4 place-items-center rounded-sm bg-slate-700 text-[9px] font-bold text-white"
          aria-label={`increase ${label}`}
        >
          +
        </button>
      </span>
    </div>
  )
  return (
    <div className="px-1">
      <Row label="sample interval" k="interval" unit="s" step={1} min={1} max={3600} />
      <Row label="burst count" k="burstMax" unit="" step={1} min={1} max={9} />
      <div className="flex items-center justify-between border-b border-slate-400/40 py-1">
        <span className="text-[9px] font-bold uppercase text-slate-700">serial output</span>
        <span className="text-[10px] font-bold text-slate-900">ON</span>
      </div>
      <div className="flex items-center justify-between py-1">
        <span className="text-[9px] font-bold uppercase text-slate-700">transmit rate</span>
        <span className="text-[10px] font-bold text-slate-900">1 Hz</span>
      </div>
      <p className="mt-1 text-[8px] leading-snug text-slate-600">
        tap − / + or use the knob on the real device. settings persist to settings.toml
      </p>
    </div>
  )
}

function StatusPage({ battery }) {
  const rows = [
    ['stella id', '27F41'],
    ['firmware', 'circuitpython v1.2.0'],
    ['battery', `${(3.55 + battery * 0.006).toFixed(2)} V · ${battery}%`],
    ['clock battery', 'ok'],
    ['sd card', '8 GB · 12 MB used'],
    ['boost rail', '5.02 V'],
  ]
  return (
    <div className="px-1">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between border-b border-slate-400/40 py-1">
          <span className="text-[9px] font-bold uppercase text-slate-700">{k}</span>
          <span className="text-[10px] font-bold text-slate-900">{v}</span>
        </div>
      ))}
    </div>
  )
}

function TimePage({ gpsFix, now }) {
  const utc = now.toISOString().slice(0, 19).replace('T', ' ')
  return (
    <div className="px-1">
      <div className="py-1 text-center">
        <div className="text-[9px] font-bold uppercase text-slate-600">utc</div>
        <div className="text-[13px] font-bold tabular-nums text-slate-900">{utc}</div>
        <div className="text-[8px] text-slate-600">rtc drift ±2–3 s/day · gps sync 1/min</div>
      </div>
      <div className="mt-1 border-t border-slate-400/40 pt-1.5">
        {[
          ['latitude', '43.0731 N'],
          ['longitude', '89.4012 W'],
          ['altitude', '264 m'],
          ['fix', gpsFix ? 'True' : 'False…'],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between py-0.5">
            <span className="text-[9px] font-bold uppercase text-slate-700">{k}</span>
            <span
              className={`text-[10px] font-bold ${
                k === 'fix' ? (gpsFix ? 'text-emerald-800' : 'text-red-700') : 'text-slate-900'
              }`}
            >
              {v}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DataPage({ instrument, batch, burst, now }) {
  const ts = now.toISOString().slice(11, 19)
  const sample =
    instrument.id === 'aa1'
      ? `27F41,${ts},${batch},${burst},co2:421,pm25:6,rh:46`
      : instrument.id === 'proto' || instrument.id === 'stella12'
        ? `27F41,${ts},${batch},${burst},--no module--`
        : `27F41,${ts},${batch},${burst},680nm:0.11,860nm:0.86`
  return (
    <div className="px-1">
      <div className="text-[9px] font-bold uppercase text-slate-600">last samples → sd card</div>
      <div className="mt-1 space-y-1 text-[9px] leading-snug text-slate-800">
        {[2, 1, 0].map((back) => (
          <div key={back} className="truncate rounded-sm bg-white/50 px-1 py-0.5">
            {sample.replace(ts, `${ts.slice(0, 6)}${String(Math.max(0, Number(ts.slice(6)) - back * 2)).padStart(2, '0')}`)}
          </div>
        ))}
      </div>
      <p className="mt-1.5 text-[8px] leading-snug text-slate-600">
        id-utc-session numbering · drop these CSVs into this site’s Data Visualizer!
      </p>
    </div>
  )
}

// =================================================================================
// Chassis 1: STELLA-1.2 platform (base device + RS / AA1 / Proto modules)
// =================================================================================

function PlatformDevice({ instrument, target, tick, reduce }) {
  const [power, setPower] = useState(true)
  const [page, setPage] = useState('sensors')
  const [recording, setRecording] = useState(false)
  const [live, setLive] = useState(true)
  const [knobTurns, setKnobTurns] = useState(0)
  const [settings, setSettings] = useState({ interval: 2, burstMax: 2 })
  const [recStart, setRecStart] = useState(0)

  const gpsFix = tick > 6
  const battery = Math.max(9, 67 - Math.floor(tick / 40))
  const recTicks = recording ? tick - recStart : 0
  const burst = recording ? (recTicks % settings.burstMax) + 1 : 0
  const batch = 3 + (recording ? Math.floor(recTicks / settings.burstMax) : 0)
  const now = useMemo(() => new Date(), [tick]) // eslint-disable-line react-hooks/exhaustive-deps

  const clickKnob = () => {
    setKnobTurns((k) => k + 1)
    setPage((p) => PAGES[(PAGES.indexOf(p) + 1) % PAGES.length])
  }
  const toggleRec = () => {
    setRecording((r) => {
      if (!r) setRecStart(tick)
      return !r
    })
  }

  const accent = instrument.accent

  return (
    <div className="relative rounded-[34px] bg-gradient-to-b from-[#f4f5f2] to-[#e4e6e0] p-5 shadow-[0_24px_60px_-18px_rgba(10,20,50,0.45)] ring-1 ring-black/10">
      {/* snap-on module bay */}
      <div
        className="relative mb-3 flex items-center justify-between rounded-2xl px-4 py-2.5 ring-1 ring-black/10"
        style={{ backgroundColor: instrument.id === 'stella12' ? 'rgba(0,0,0,0.05)' : `${accent}26` }}
      >
        <span className="absolute -left-1.5 top-1/2 h-5 w-2 -translate-y-1/2 rounded-l bg-[#d6d8d2] ring-1 ring-black/10" />
        <span className="absolute -right-1.5 top-1/2 h-5 w-2 -translate-y-1/2 rounded-r bg-[#d6d8d2] ring-1 ring-black/10" />
        <span
          className="text-[11px] font-extrabold uppercase tracking-wider"
          style={{ color: instrument.id === 'stella12' ? 'rgba(0,0,0,0.35)' : accent }}
        >
          {instrument.id === 'stella12' ? 'module bay · empty' : `${instrument.name} module`}
        </span>
        <span className="text-[9px] font-bold uppercase tracking-wider text-black/35">
          magnetic snap-fit
        </span>
      </div>

      {/* branding row */}
      <div className="mb-2 flex items-end justify-between px-1">
        <div className="text-xl font-black leading-none tracking-tight" style={{ color: '#59b95f' }}>
          STELLA <span className="text-black/70">1.2</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] font-bold uppercase tracking-wider text-black/40">gps</span>
          <span className="grid h-6 w-7 place-items-center rounded-md bg-[#c9cdc6] ring-1 ring-black/15">
            <span className={`h-2 w-2 rounded-full ${gpsFix && power ? 'bg-emerald-500' : 'bg-black/25'}`} />
          </span>
        </div>
      </div>

      {/* screen bezel */}
      <div className="rounded-2xl bg-[#14161c] p-2.5 shadow-inner">
        <div
          className={`relative aspect-[4/3] overflow-hidden rounded-lg font-mono transition-colors duration-300 ${
            power ? 'bg-[#ccd5e3]' : 'bg-[#0a0c10]'
          }`}
        >
          {power ? (
            <div className="flex h-full flex-col p-1.5">
              {/* control bar: matches the real STELLA-1.2 screen */}
              <div className="mb-1 flex items-center gap-1">
                <span className={`${chip} ${gpsFix ? 'bg-emerald-800 text-white' : 'bg-slate-800 text-white'}`}>
                  GPS {gpsFix ? 'fix' : 'nofix'}
                </span>
                <span className={`${chip} bg-blue-800 text-white`}>batch {batch}</span>
                <button
                  onClick={toggleRec}
                  aria-label={recording ? 'Stop recording' : 'Start recording'}
                  className="grid h-5 w-5 place-items-center rounded-full bg-white/60"
                >
                  <span
                    className={`h-3.5 w-3.5 rounded-full ${
                      recording ? `bg-red-600 ${reduce ? '' : 'animate-pulse'}` : 'bg-red-600/35'
                    }`}
                  />
                </button>
                <span className={`${chip} bg-teal-700 text-white`}>
                  burst {recording ? burst : settings.burstMax}
                </span>
                <button onClick={() => setPage('settings')} className={`${chip} bg-blue-900 text-white`}>
                  system
                </button>
                <span className={`${chip} ml-auto bg-slate-900 text-white`}>{battery}%</span>
              </div>

              {/* active page */}
              <div className="min-h-0 flex-1">
                {page === 'sensors' &&
                  (instrument.id === 'rs' ? (
                    <RsSensorsPage
                      target={target}
                      tick={tick}
                      live={live}
                      onToggleLive={() => setLive((v) => !v)}
                    />
                  ) : instrument.id === 'aa1' ? (
                    <Aa1SensorsPage target={target} tick={tick} />
                  ) : (
                    <ScanPage tick={tick} lines={instrument.id === 'proto' ? PROTO_LINES : BASE12_LINES} />
                  ))}
                {page === 'settings' && (
                  <SettingsPage
                    settings={settings}
                    onChange={(k, v) => setSettings((s) => ({ ...s, [k]: v }))}
                  />
                )}
                {page === 'status' && <StatusPage battery={battery} />}
                {page === 'time' && <TimePage gpsFix={gpsFix} now={now} />}
                {page === 'data' && (
                  <DataPage instrument={instrument} batch={batch} burst={burst || 1} now={now} />
                )}
              </div>

              {/* page tabs (touchscreen!) */}
              <div className="mt-1 flex gap-1">
                {PAGES.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`flex-1 truncate rounded-sm px-0.5 py-0.5 text-[7.5px] font-bold uppercase tracking-wide ${
                      page === p ? 'bg-slate-800 text-white' : 'bg-white/45 text-slate-700'
                    }`}
                  >
                    {PAGE_LABEL[p]}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid h-full place-items-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/15">
                stella
              </span>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent" />
        </div>
      </div>

      {/* lower controls */}
      <div className="mt-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          {[
            { on: power, cls: 'bg-emerald-500' },
            { on: power && gpsFix, cls: 'bg-sky-500' },
            { on: power && recording, cls: `bg-red-500 ${reduce ? '' : 'animate-pulse'}` },
          ].map((led, i) => (
            <span
              key={i}
              className={`h-1.5 w-4 rounded-full ring-1 ring-black/10 ${led.on ? led.cls : 'bg-black/15'}`}
            />
          ))}
          <span className="ml-1 text-[8px] font-bold uppercase tracking-wider text-black/35">
            tail lights
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setPower((p) => !p)}
            aria-pressed={power}
            aria-label="Power"
            className={`grid h-8 w-8 place-items-center rounded-full ring-1 ring-black/15 transition-colors ${
              power ? 'bg-[#d8dad4]' : 'bg-[#c6c8c2]'
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-black/55" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 3v8" />
              <path d="M6.3 6.5a8 8 0 1 0 11.4 0" />
            </svg>
          </button>

          <button
            onClick={clickKnob}
            aria-label="Rotary encoder, press to change page"
            title="Press to change page"
            className="relative grid h-14 w-14 place-items-center rounded-full bg-gradient-to-b from-[#2c2f36] to-[#191b20] shadow-[inset_0_2px_4px_rgba(255,255,255,0.15),0_4px_10px_rgba(0,0,0,0.35)] transition-transform active:scale-95"
          >
            <span
              className="absolute inset-1.5 rounded-full ring-1 ring-white/10 transition-transform duration-300"
              style={{ transform: `rotate(${knobTurns * 45}deg)` }}
            >
              <span className="absolute left-1/2 top-1 h-2 w-1 -translate-x-1/2 rounded-full bg-white/60" />
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

// =================================================================================
// Chassis 2: STELLA-Q2, bright green pocket spectrometer with a 128×32 OLED
// =================================================================================

function Q2Device({ target, tick, reduce }) {
  const [on, setOn] = useState(true) // battery disconnect switch
  const [mode, setMode] = useState('continuous') // continuous | burst
  const [lamps, setLamps] = useState(false)
  const holdRef = useRef(null)
  const heldRef = useRef(false)

  // Real Q2: click = toggle recording mode, hold ~2 s = lamps on/off.
  const pressStart = () => {
    heldRef.current = false
    holdRef.current = setTimeout(() => {
      heldRef.current = true
      setLamps((l) => !l)
    }, 900)
  }
  const pressEnd = () => {
    clearTimeout(holdRef.current)
    if (!heldRef.current) setMode((m) => (m === 'continuous' ? 'burst' : 'continuous'))
  }

  const emboss = 'font-black uppercase tracking-wide text-white/85 [text-shadow:0_1px_1px_rgba(0,0,0,0.25)]'

  return (
    <div className="mx-auto w-full max-w-[300px] rounded-[26px] bg-gradient-to-b from-[#5ec13e] to-[#4aa930] p-5 shadow-[0_24px_60px_-18px_rgba(10,40,10,0.5)] ring-1 ring-black/15">
      {/* irradiance + OLED window */}
      <div className={`text-center text-[15px] ${emboss}`}>irradiance</div>
      <div className="mt-1 flex items-center gap-2">
        <span className={`text-[15px] ${emboss}`}>410</span>
        <div className="relative h-12 flex-1 overflow-hidden rounded-md bg-[#0b0d14] ring-2 ring-black/30">
          {on ? (
            <svg viewBox="0 0 128 32" className="h-full w-full" preserveAspectRatio="none">
              {RS_BANDS.map((nm, i) => {
                const v = Math.min(1, target.spectrum[i] * noise(tick, i))
                const h = 2 + v * 26
                return (
                  <rect
                    key={nm}
                    x={4 + i * 6.7}
                    y={30 - h}
                    width="4.2"
                    height={h}
                    fill="#cfd8ff"
                  />
                )
              })}
              <text x="4" y="8" fontSize="6" fill="#8f9bce" fontFamily="monospace">
                {mode === 'continuous' ? 'cont' : 'burst'}
              </text>
            </svg>
          ) : null}
        </div>
        <span className={`text-[15px] ${emboss}`}>940</span>
      </div>
      <div className={`mt-1 text-center text-[13px] ${emboss}`}>B G R IR λ</div>

      {/* LEDs + lamps + REC */}
      <div className="mt-4 flex items-center justify-between px-1">
        <div className="flex flex-col gap-1.5">
          {[
            { label: 'b', on: on, cls: 'bg-emerald-300' },
            { label: 'r', on: on && mode === 'continuous', cls: `bg-red-500 ${reduce ? '' : 'animate-pulse'}` },
          ].map((led) => (
            <span key={led.label} className="flex items-center gap-1.5">
              <span className={`text-[12px] lowercase ${emboss}`}>{led.label}</span>
              <span className={`h-2 w-2 rounded-sm ${led.on ? led.cls : 'bg-black/40'} ring-1 ring-black/40`} />
            </span>
          ))}
        </div>

        {/* reference lamps */}
        <div className="flex items-center gap-5">
          {[0, 1].map((i) => (
            <span
              key={i}
              className={`grid h-12 w-12 place-items-center rounded-full ring-2 ring-black/20 transition-colors duration-300 ${
                lamps && on ? 'bg-amber-100 shadow-[0_0_18px_4px_rgba(255,220,120,0.8)]' : 'bg-white/40'
              }`}
            >
              <span className={`h-8 w-8 rounded-full ${lamps && on ? 'bg-amber-200' : 'bg-white/30'} ring-1 ring-black/10`} />
            </span>
          ))}
        </div>

        <span className={`text-[14px] ${emboss}`}>REC</span>
      </div>

      {/* battery glyph + switch */}
      <div className="mt-3 flex items-center justify-between px-1">
        <svg viewBox="0 0 24 12" className="h-3.5 w-7 text-white/85" fill="currentColor">
          <rect x="0" y="1" width="21" height="10" rx="2" />
          <rect x="21.5" y="4" width="2.5" height="4" rx="1" />
        </svg>
        <button
          onClick={() => setOn((v) => !v)}
          aria-pressed={on}
          aria-label="Battery disconnect switch"
          className="flex items-center gap-1.5"
        >
          <span className={`text-[10px] ${emboss}`}>{on ? 'on' : 'off'}</span>
          <span className={`relative h-4 w-8 rounded-full ring-1 ring-black/30 ${on ? 'bg-white/70' : 'bg-black/30'}`}>
            <span
              className={`absolute top-0.5 h-3 w-3 rounded-full bg-[#2c2f36] transition-all ${on ? 'left-[18px]' : 'left-0.5'}`}
            />
          </span>
        </button>
      </div>

      {/* MODE button */}
      <div className="mt-4 flex items-center justify-between px-1">
        <div className={`text-[12px] leading-tight ${emboss}`}>
          lamps
          <br />
          2s+
        </div>
        <button
          onMouseDown={pressStart}
          onMouseUp={pressEnd}
          onMouseLeave={() => clearTimeout(holdRef.current)}
          onTouchStart={pressStart}
          onTouchEnd={pressEnd}
          aria-label="MODE button, click to switch recording mode, hold for lamps"
          title="Click: continuous/burst · Hold: lamps"
          className="grid h-12 w-12 place-items-center rounded-full bg-black/25 ring-2 ring-black/30 transition-transform active:scale-95"
        >
          <span className="h-8 w-8 rounded-full bg-gradient-to-b from-red-500 to-red-700 shadow-[inset_0_2px_3px_rgba(255,255,255,0.4),0_2px_5px_rgba(0,0,0,0.5)]" />
        </button>
        <span className={`text-[15px] ${emboss}`}>MODE</span>
      </div>
    </div>
  )
}

// =================================================================================
// Chassis 3: STELLA-1.1, the classic handheld with its text-table color screen
// =================================================================================

function S11Device({ target, tick, reduce }) {
  const [power, setPower] = useState(true)
  const [mode, setMode] = useState('continuous') // single | continuous | average
  const [frozenTick, setFrozenTick] = useState(0)
  const [batch, setBatch] = useState(49)

  // In single-sample mode the numbers freeze until the pushbutton is pressed.
  const t = mode === 'single' ? frozenTick : tick
  const now = new Date()
  const utc = `${now.toISOString().slice(11, 19)}Z`
  const date = now.toISOString().slice(0, 10)

  const val = (nm, i) => {
    const raw = spectrumAt(target, nm) * 260 * noise(t, i, mode === 'average' ? 0.015 : 0.05)
    return raw >= 100 ? raw.toFixed(0) : raw.toFixed(1)
  }
  const vis = S11_BANDS.slice(0, 6)
  const nir = S11_BANDS.slice(6)
  const visLabel = ['V450', 'B500', 'G550', 'Y570', 'O600', 'R650']

  const takeSample = () => {
    setFrozenTick(tick)
    setBatch((b) => b + 1)
  }

  const zoneBtn = (m, extra) =>
    `absolute rounded-full transition-opacity ${mode === m ? 'opacity-60' : 'opacity-25 hover:opacity-40'} ${extra}`

  return (
    <div className="mx-auto w-full max-w-[320px]">
      {/* top cap: power + pushbutton */}
      <div className="mx-4 flex items-center justify-between rounded-t-2xl bg-gradient-to-b from-[#f2f3f0] to-[#dfe1db] px-5 py-3 ring-1 ring-black/10">
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <path d="M12 3v8" />
          <path d="M6.3 6.5a8 8 0 1 0 11.4 0" />
        </svg>
        <button
          onClick={() => setPower((p) => !p)}
          aria-pressed={power}
          aria-label="Power button"
          className="grid h-9 w-9 place-items-center rounded-full bg-black/80 ring-2 ring-black/30 transition-transform active:scale-95"
        >
          <span className="h-5 w-5 rounded-full bg-gradient-to-b from-[#3a3d44] to-[#17181c]" />
        </button>
        <button
          onClick={takeSample}
          aria-label="Pushbutton, take a measurement"
          title="Take a measurement"
          className="grid h-10 w-10 place-items-center rounded-full bg-blue-200 ring-2 ring-black/20 transition-transform active:scale-95"
        >
          <span className="h-7 w-7 rounded-full bg-gradient-to-b from-blue-400 to-blue-600 shadow-[inset_0_2px_3px_rgba(255,255,255,0.5)]" />
        </button>
        <span className="h-3 w-3 rounded-full bg-blue-500/80" />
      </div>

      {/* body + screen */}
      <div className="rounded-[22px] bg-gradient-to-b from-[#23262c] to-[#101216] p-4 shadow-[0_24px_60px_-18px_rgba(10,20,50,0.55)] ring-1 ring-black/30">
        <div
          className={`relative overflow-hidden rounded-md border-4 font-mono transition-colors ${
            power ? 'border-red-600/80 bg-[#bcc8f2]' : 'border-black/40 bg-[#0a0c10]'
          }`}
        >
          {power ? (
            <div className="relative px-2 py-1.5 text-[10px] leading-[1.45] text-slate-900">
              {/* touch zones (yellow = single, blue = continuous, green = average) */}
              <button
                onClick={() => setMode('single')}
                aria-label="Single sample mode"
                title="Single sample mode"
                className={zoneBtn('single', 'left-1 top-6 h-12 w-12 bg-yellow-300')}
              />
              <button
                onClick={() => setMode('continuous')}
                aria-label="Continuous record mode"
                title="Continuous record mode"
                className={zoneBtn('continuous', 'left-1/2 top-8 h-14 w-14 -translate-x-1/2 bg-sky-400')}
              />
              <button
                onClick={() => setMode('average')}
                aria-label="Sample and average mode"
                title="Sample and average mode"
                className={zoneBtn('average', 'right-1 top-6 h-12 w-12 bg-emerald-400')}
              />

              {/* header */}
              <div className="flex items-center justify-between">
                <span>
                  UID:9631 <span className="text-slate-700">{date}</span>
                </span>
                <span className="border border-red-600 bg-white/70 px-1 font-bold">{batch}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{utc}</span>
                <span>Surface:{(target.surfaceTempC + Math.sin(t) * 0.3).toFixed(1)}C</span>
              </div>
              <div className="flex items-center justify-between">
                <span>
                  nm: uW/cm^2{' '}
                  <span
                    className={`inline-block h-2 w-2 rounded-full align-middle ${
                      mode !== 'single' ? `bg-red-600 ${reduce ? '' : 'animate-pulse'}` : 'bg-red-600/30'
                    }`}
                  />
                </span>
                <span>Air:{(22.9 * noise(t, 9, 0.01)).toFixed(1)}C</span>
              </div>

              {/* two-column band table */}
              <div className="relative mt-0.5 grid grid-cols-[1fr_auto_1fr] gap-x-1">
                <div>
                  {vis.map((nm, i) => (
                    <div key={nm} className="flex justify-between tabular-nums">
                      <span>{visLabel[i]}:</span>
                      <span>{val(nm, i)}</span>
                    </div>
                  ))}
                </div>
                {/* mode telltale */}
                <div className="mt-1 flex w-4 flex-col items-center gap-0.5 self-start rounded-sm border border-slate-700 bg-white/60 p-0.5">
                  <span className={`h-2.5 w-2 ${mode === 'single' ? 'bg-yellow-400' : 'bg-white/40'}`} />
                  <span className={`h-2.5 w-2 ${mode === 'continuous' ? 'bg-sky-500' : 'bg-white/40'}`} />
                  <span className={`h-2.5 w-2 ${mode === 'average' ? 'bg-emerald-500' : 'bg-white/40'}`} />
                </div>
                <div>
                  {nir.map((nm, i) => (
                    <div key={nm} className="flex justify-between tabular-nums">
                      <span>{nm}:</span>
                      <span>{val(nm, i + 6)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid h-44 place-items-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/15">
                stella
              </span>
            </div>
          )}
        </div>
        <p className="mt-2 text-center text-[8px] font-bold uppercase tracking-[0.2em] text-white/30">
          stella-1.1 · 12-band + thermal ir
        </p>
      </div>
    </div>
  )
}

// =================================================================================
// Stage 3: the finished instrument as an interactive product demo.
// =================================================================================

export default function DeviceSimulator({ instrument, onRebuild, onChooseAnother, onNavigate }) {
  const reduce = useReducedMotion()
  const [tick, setTick] = useState(0)

  const targets =
    instrument.id === 'aa1'
      ? AA1_TARGETS
      : ['rs', 'q2', 's11'].includes(instrument.id)
        ? RS_TARGETS
        : []
  const [targetId, setTargetId] = useState(targets[0]?.id ?? null)
  const target = targets.find((t) => t.id === targetId) ?? targets[0] ?? null

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), reduce ? 1600 : 700)
    return () => clearInterval(id)
  }, [reduce])

  const accent = instrument.accent

  const howTo =
    instrument.chassis === 'q2'
      ? 'Click the red MODE button to switch between continuous and burst recording, hold it to switch the reference lamps on, and flip the battery switch to power down.'
      : instrument.chassis === 's11'
        ? 'Tap the yellow, blue, or green zones on the screen to switch sampling modes (single · continuous · average), press the blue pushbutton to take a sample, and use the power button up top.'
        : 'Tap the screen chips, press the knob to flip through the menu pages, hit record, or power it down. It’s the same control bar and pages as the real device.'

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(320px,430px)_1fr]">
      {/* ---- device column ---- */}
      <div className="mx-auto w-full max-w-[430px]">
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {instrument.chassis === 'q2' ? (
            <Q2Device target={target} tick={tick} reduce={reduce} />
          ) : instrument.chassis === 's11' ? (
            <S11Device target={target} tick={tick} reduce={reduce} />
          ) : (
            <PlatformDevice instrument={instrument} target={target} tick={tick} reduce={reduce} />
          )}
        </motion.div>

        {/* point-at targets */}
        {targets.length > 0 && (
          <div className="mt-4">
            <p className="mb-1.5 text-center text-[11px] font-bold uppercase tracking-wider text-faint">
              Point the instrument at…
            </p>
            <div className="flex justify-center gap-2">
              {targets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTargetId(t.id)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                    targetId === t.id ? 'text-white' : 'bg-cream text-muted hover:text-ink'
                  }`}
                  style={targetId === t.id ? { backgroundColor: accent } : undefined}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ---- explainer column ---- */}
      <div className="flex min-w-0 flex-col gap-4">
        <div className="rounded-panel bg-cream p-5 shadow-soft">
          <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: accent }}>
            Live demo · {instrument.name}
          </p>
          <h3 className="mt-1 text-xl font-extrabold tracking-tight text-ink">
            Your instrument, switched on
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            This is a working recreation of the real {instrument.name} interface. {howTo}
          </p>
          {target?.note && (
            <div
              className="mt-3 rounded-card px-3.5 py-2.5 text-[13px] font-semibold leading-relaxed"
              style={{ backgroundColor: `${accent}16`, color: '#3a4358' }}
            >
              {target.note}
            </div>
          )}
        </div>

        <div className="rounded-panel bg-cream p-5 shadow-soft">
          <p className="text-[11px] font-bold uppercase tracking-wider text-faint">Spec sheet</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {instrument.specs.map((s) => (
              <li key={s} className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-ink/75 ring-1 ring-ink/10">
                {s}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-relaxed text-faint">{instrument.science}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            <a
              href={instrument.sourceUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 text-xs font-bold hover:underline"
              style={{ color: accent }}
            >
              NASA build guide <Icon name="share" className="h-3 w-3" />
            </a>
            <a
              href={STELLA_SOURCE.buildVideoUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 text-xs font-bold hover:underline"
              style={{ color: accent }}
            >
              Build video <Icon name="play" className="h-3 w-3" />
            </a>
          </div>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate?.('data-viz')}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-bold text-app transition-opacity hover:opacity-90"
          >
            Explore real STELLA data
            <Icon name="chevron" className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onRebuild}
            className="rounded-full bg-cream px-4 py-2 text-xs font-bold text-ink/75 hover:text-ink"
          >
            Rebuild it
          </button>
          <button
            onClick={onChooseAnother}
            className="rounded-full bg-cream px-4 py-2 text-xs font-bold text-ink/75 hover:text-ink"
          >
            Choose another instrument
          </button>
        </div>
      </div>
    </div>
  )
}
