import { useState } from 'react'
import Icon from '../Icon.jsx'
import { categoryColor } from '../../data/missionCategories.js'
import { getMissionSource } from '../../data/missionSources.js'
import { getSatelliteModel } from '../../data/satelliteModels.js'
import { MISSION_POSITION_NOTE, cacheStatusInfo, formatUtc, timeInOrbit } from './orbitStatus'
import { LABEL, ACCENT, ACCENT_INK } from './mcStyles.js'

function relatedLessons(missionId) {
  const links = []
  if (missionId === 'landsat-8' || missionId === 'landsat-9') {
    links.push({ label: 'How Landsat Images Are Made', page: 'lesson-landsat' })
  }
  links.push({ label: 'Spectral Band Explorer (Data & Graphs)', page: 'data' })
  links.push({ label: 'What Is the Electromagnetic Spectrum?', page: 'lesson-ems' })
  return links
}

function Toggle({ label, checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-md px-1 py-1.5 text-left hover:bg-white/5"
    >
      <span className="text-[12px] font-semibold text-white/80">{label}</span>
      <span
        className={`relative h-[18px] w-8 shrink-0 rounded-full transition-colors ${
          checked ? '' : 'bg-white/15'
        }`}
        style={checked ? { backgroundColor: ACCENT } : undefined}
      >
        <span
          className={`absolute top-0.5 h-[14px] w-[14px] rounded-full transition-all ${
            checked ? 'left-[16px] bg-[#062033]' : 'left-0.5 bg-white'
          }`}
        />
      </span>
    </button>
  )
}

function fmtLat(deg) {
  if (deg == null) return '—'
  return `${Math.abs(deg).toFixed(2)}° ${deg >= 0 ? 'N' : 'S'}`
}
function fmtLon(deg) {
  if (deg == null) return '—'
  return `${Math.abs(deg).toFixed(2)}° ${deg >= 0 ? 'E' : 'W'}`
}

function Stat({ label, value, tone }) {
  return (
    <div>
      <div className={LABEL}>{label}</div>
      <div
        className={`mt-0.5 text-[13px] font-bold ${
          tone === 'ok' ? 'text-emerald-400' : tone === 'warn' ? 'text-amber-400' : 'text-white'
        }`}
      >
        {value}
      </div>
    </div>
  )
}

export default function MissionPanel({
  item,
  livePosition,
  orbit,
  simTimeMs,
  toggles,
  onToggle,
  onOpenLesson,
  onOpenSource,
  onClose,
}) {
  const [expanded, setExpanded] = useState(false)
  if (!item) return null
  const m = item.mission
  if (!m) return null

  const color = categoryColor(m.category)
  const src = getMissionSource(m.id)
  const status = cacheStatusInfo(orbit?.cacheStatus)
  const period = item.periodMin ? `${item.periodMin.toFixed(1)} min` : '—'
  const tio = timeInOrbit(m, simTimeMs ?? Date.now())
  const launchDisplay = m.launchDate || (m.launchYear ? String(m.launchYear) : '—')
  const satModel = getSatelliteModel(m.id)

  return (
    <div className="flex h-full flex-col">
      {/* header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
            <span className={LABEL} style={{ color }}>
              {m.category}
            </span>
          </div>
          <h2 className="mt-1 text-[22px] font-light leading-tight tracking-wide text-white">
            {m.displayName}
          </h2>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-white/40">
            {m.agency}
          </p>
          <p className="mt-0.5 text-[11px] text-white/40">{m.orbitType}</p>
          {m.hostedOn && (
            <p className="mt-1 inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/60">
              <Icon name="orbit" className="h-3 w-3" />
              Aboard {m.hostedOn}
            </p>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close mission details"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <Icon name="plus" className="h-4 w-4 rotate-45" />
          </button>
        )}
      </div>

      {/* headline stats — time in orbit ticks with the simulation clock */}
      <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg border border-white/10 bg-white/5 p-2.5">
        <Stat label="Time in orbit" value={tio} />
        <Stat label="Launched" value={launchDisplay} />
        <Stat label="Orbital period" value={period} />
      </div>

      <div className="scroll-soft mt-3 min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
        {/* unavailable notice */}
        {!item.valid && (
          <div className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-[12px] text-rose-200">
            Orbital data for this mission is currently unavailable, so no modeled position is
            shown. {item.reason ? `(${item.reason})` : ''}
          </div>
        )}

        {/* description */}
        <div>
          <p className="text-[13px] leading-relaxed text-white/70">
            {expanded ? m.longDescription : m.shortDescription}
          </p>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.15em] hover:underline"
            style={{ color: ACCENT }}
          >
            {expanded ? '− Less' : '+ More'}
          </button>
        </div>

        {/* modeled position */}
        {item.valid && (
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <div className={LABEL}>Current modeled position</div>
            <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2.5">
              <Stat label="Latitude" value={fmtLat(livePosition?.latDeg)} />
              <Stat label="Longitude" value={fmtLon(livePosition?.lonDeg)} />
              <Stat
                label="Altitude"
                value={livePosition?.altKm != null ? `${Math.round(livePosition.altKm)} km` : '—'}
              />
              <Stat
                label="Est. velocity"
                value={
                  livePosition?.speedKmS != null ? `${livePosition.speedKmS.toFixed(2)} km/s` : '—'
                }
              />
            </div>
            <p className="mt-2.5 text-[10px] leading-snug text-white/35">
              {MISSION_POSITION_NOTE}
              {m.hostedOn
                ? ` This instrument shares its host’s orbit; its marker is offset slightly so it stays visible.`
                : ''}
            </p>
          </div>
        )}

        {/* orbit facts */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 border-t border-white/10 pt-3">
          <Stat label="Launch date" value={launchDisplay} />
          <Stat label="TLE epoch" value={formatUtc(item.orbit?.epoch)} />
          <Stat label="Data fetched" value={formatUtc(item.orbit?.fetchedAt)} />
          <Stat
            label="Cache status"
            value={status.label}
            tone={status.tone === 'ok' ? 'ok' : 'warn'}
          />
        </div>

        {/* instruments */}
        {m.instruments?.length > 0 && (
          <div className="border-t border-white/10 pt-3">
            <div className={LABEL}>Instruments</div>
            <ul className="mt-1.5 flex flex-wrap gap-1.5">
              {m.instruments.map((ins) => (
                <li
                  key={ins}
                  className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-white/75"
                >
                  {ins}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* observes */}
        {m.observes?.length > 0 && (
          <div>
            <div className={LABEL}>What it observes</div>
            <ul className="mt-1.5 flex flex-wrap gap-1.5">
              {m.observes.map((o) => (
                <li
                  key={o}
                  className="rounded-md px-2 py-0.5 text-[11px] font-bold"
                  style={{ backgroundColor: `${color}2b`, color }}
                >
                  {o}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* view toggles */}
        <div className="rounded-lg border border-white/10 bg-white/5 p-2">
          <Toggle label="Follow mission" checked={toggles.follow} onChange={(v) => onToggle('follow', v)} />
          <Toggle label="Show orbit trail" checked={toggles.trail} onChange={(v) => onToggle('trail', v)} />
          <Toggle
            label="Show ground track"
            checked={toggles.groundTrack}
            onChange={(v) => onToggle('groundTrack', v)}
          />
        </div>

        {/* related lessons */}
        <div>
          <div className={LABEL}>Related lessons</div>
          <div className="mt-1.5 flex flex-col gap-1">
            {relatedLessons(m.id).map((l) => (
              <button
                key={l.page}
                onClick={() => onOpenLesson(l.page)}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-[12px] font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                {l.label}
                <Icon name="chevron" className="h-3.5 w-3.5 text-white/40" />
              </button>
            ))}
          </div>
        </div>

        {/* source */}
        <div className="flex flex-wrap gap-2 border-t border-white/10 pt-3">
          <a
            href={m.missionPageUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider transition-opacity hover:opacity-90"
            style={{ backgroundColor: ACCENT, color: ACCENT_INK }}
          >
            Official mission page
            <Icon name="share" className="h-3.5 w-3.5" />
          </a>
          <button
            onClick={onOpenSource}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-white/70 hover:text-white"
          >
            Sources
          </button>
        </div>
        {src && <p className="text-[10px] leading-snug text-white/30">{src.credit}</p>}
        <p className="text-[10px] leading-snug text-white/30">
          <Icon name="orbit" className="mr-1 inline h-3 w-3 align-[-2px]" />
          {satModel.official
            ? '3D model shown on the globe: NASA (NASA-3D-Resources).'
            : 'A representative 3D model is shown on the globe (not a NASA model).'}
          {satModel.note ? ` ${satModel.note}` : ''}
        </p>
      </div>
    </div>
  )
}
