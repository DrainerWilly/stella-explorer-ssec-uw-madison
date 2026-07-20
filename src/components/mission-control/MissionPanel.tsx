// @ts-nocheck
import { useState } from 'react'
import Icon from '../Icon'
import { categoryColor } from '../../data/missionCategories'
import { getMissionSource } from '../../data/missionSources'
import { getSatelliteModel } from '../../data/satelliteModels'
import { MISSION_POSITION_NOTE, cacheStatusInfo, formatUtc, timeInOrbit } from './orbitStatus'
import { LABEL, ACCENT, ACCENT_INK } from './mcStyles'

function relatedLessons(missionId) {
  const links = []
  if (missionId === 'landsat-8' || missionId === 'landsat-9') {
    links.push({ label: 'How Landsat Images Are Made', page: 'lesson-landsat' })
  }
  links.push({ label: 'Spectral Band Explorer', page: 'data' })
  links.push({ label: 'What Is the Electromagnetic Spectrum?', page: 'lesson-ems' })
  return links
}

function Chip({ label, active, color, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors ${
        active ? 'text-[#062033]' : 'bg-white/5 text-white/55 hover:bg-white/10 hover:text-white'
      }`}
      style={active ? { backgroundColor: color } : undefined}
    >
      {label}
    </button>
  )
}

function fmtLat(deg) {
  if (deg == null) return '—'
  return `${Math.abs(deg).toFixed(1)}°${deg >= 0 ? 'N' : 'S'}`
}
function fmtLon(deg) {
  if (deg == null) return '—'
  return `${Math.abs(deg).toFixed(1)}°${deg >= 0 ? 'E' : 'W'}`
}

function Stat({ label, value }) {
  return (
    <div className="min-w-0">
      <div className="text-[9px] font-bold uppercase tracking-wider text-white/35">{label}</div>
      <div className="mt-0.5 truncate font-mono text-[13px] font-bold tabular-nums text-white">{value}</div>
    </div>
  )
}

// Compact NASA-Eyes-style satellite info card. Key live facts up top; the deep
// content (description, instruments, sources, lessons) tucks behind "More".
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
  const [more, setMore] = useState(false)
  if (!item) return null
  const m = item.mission
  if (!m) return null

  const color = categoryColor(m.category)
  const src = getMissionSource(m.id)
  const status = cacheStatusInfo(orbit?.cacheStatus)
  const period = item.periodMin ? `${item.periodMin.toFixed(0)} min` : '—'
  const tio = timeInOrbit(m, simTimeMs ?? Date.now())
  const launchDisplay = m.launchDate || (m.launchYear ? String(m.launchYear) : '—')
  const satModel = getSatelliteModel(m.id)

  return (
    <div className="flex max-h-full flex-col">
      {/* header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color }}>
              {m.category}
            </span>
          </div>
          <h2 className="mt-0.5 truncate text-lg font-bold tracking-tight text-white">{m.displayName}</h2>
          <p className="truncate text-[11px] text-white/45">
            {m.agency} · {m.orbitType}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white"
          >
            <Icon name="plus" className="h-4 w-4 rotate-45" />
          </button>
        )}
      </div>

      {/* unavailable notice */}
      {!item.valid && (
        <div className="mt-2 rounded-lg border border-rose-400/30 bg-rose-500/10 px-2.5 py-1.5 text-[11px] text-rose-200">
          Orbital data unavailable, so no live position is shown.
        </div>
      )}

      {/* live stats */}
      {item.valid && (
        <div className="mt-2.5 grid grid-cols-4 gap-2 rounded-xl border border-white/10 bg-white/5 p-2.5">
          <Stat label="Alt" value={livePosition?.altKm != null ? `${Math.round(livePosition.altKm)}km` : '—'} />
          <Stat label="Speed" value={livePosition?.speedKmS != null ? `${livePosition.speedKmS.toFixed(1)}` : '—'} />
          <Stat label="Lat" value={fmtLat(livePosition?.latDeg)} />
          <Stat label="Lon" value={fmtLon(livePosition?.lonDeg)} />
        </div>
      )}

      {/* quick facts + toggles */}
      <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-white/55">
        <span>In orbit {tio} · {period}/orbit</span>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        <Chip label="Follow" active={toggles.follow} color={ACCENT} onClick={() => onToggle('follow', !toggles.follow)} />
        <Chip label="Orbit trail" active={toggles.trail} color={ACCENT} onClick={() => onToggle('trail', !toggles.trail)} />
        <Chip label="Ground track" active={toggles.groundTrack} color={ACCENT} onClick={() => onToggle('groundTrack', !toggles.groundTrack)} />
      </div>

      {/* more toggle */}
      <button
        onClick={() => setMore((v) => !v)}
        className="mt-2.5 inline-flex items-center gap-1 self-start text-[11px] font-bold uppercase tracking-[0.12em]"
        style={{ color: ACCENT }}
      >
        {more ? 'Less' : 'More details'}
        <Icon name="chevron" className={`h-3.5 w-3.5 transition-transform ${more ? '-rotate-90' : 'rotate-90'}`} />
      </button>

      {/* expandable deep content */}
      {more && (
        <div className="scroll-soft mt-2 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          <p className="text-[12px] leading-relaxed text-white/70">{m.longDescription}</p>

          {m.instruments?.length > 0 && (
            <div>
              <div className={LABEL}>Instruments</div>
              <ul className="mt-1 flex flex-wrap gap-1">
                {m.instruments.map((ins) => (
                  <li key={ins} className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold text-white/70">
                    {ins}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {m.observes?.length > 0 && (
            <div>
              <div className={LABEL}>Observes</div>
              <ul className="mt-1 flex flex-wrap gap-1">
                {m.observes.map((o) => (
                  <li key={o} className="rounded-md px-1.5 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `${color}2b`, color }}>
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-white/10 pt-2 text-[11px]">
            <div><span className="text-white/40">Launched</span> <span className="font-semibold text-white/80">{launchDisplay}</span></div>
            <div><span className="text-white/40">TLE epoch</span> <span className="font-semibold text-white/80">{formatUtc(item.orbit?.epoch)}</span></div>
            <div className="col-span-2"><span className="text-white/40">Data</span> <span className={`font-semibold ${status.tone === 'ok' ? 'text-emerald-400' : 'text-amber-400'}`}>{status.label}</span> <span className="text-white/40">· {MISSION_POSITION_NOTE}</span></div>
          </div>

          <div>
            <div className={LABEL}>Related lessons</div>
            <div className="mt-1 flex flex-col gap-1">
              {relatedLessons(m.id).map((l) => (
                <button
                  key={l.page}
                  onClick={() => onOpenLesson(l.page)}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-left text-[11px] font-semibold text-white/75 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {l.label}
                  <Icon name="chevron" className="h-3 w-3 text-white/40" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-white/10 pt-2">
            <a
              href={m.missionPageUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-opacity hover:opacity-90"
              style={{ backgroundColor: ACCENT, color: ACCENT_INK }}
            >
              Mission page
              <Icon name="share" className="h-3 w-3" />
            </a>
            <button
              onClick={onOpenSource}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/60 hover:text-white"
            >
              Sources
            </button>
          </div>
          {src && <p className="text-[10px] leading-snug text-white/30">{src.credit}</p>}
          <p className="text-[10px] leading-snug text-white/30">
            {satModel.official
              ? '3D model: NASA (NASA-3D-Resources).'
              : 'Representative 3D model (not a NASA model).'}
            {satModel.note ? ` ${satModel.note}` : ''}
          </p>
        </div>
      )}
    </div>
  )
}
