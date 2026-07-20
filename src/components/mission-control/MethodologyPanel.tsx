// @ts-nocheck
import Icon from '../Icon'
import { DATA_SOURCES } from '../../data/missionSources'
import { SCIENCE_LAYERS_NOTE } from '../../data/earthLayers'
import { MODELED_POSITION_DISCLAIMER, cacheStatusInfo, formatUtc } from './orbitStatus'
import { LABEL, ACCENT } from './mcStyles'

function SourceRow({ title, children, href }) {
  return (
    <li className="py-2.5">
      <div className="text-[13px] font-bold text-white">{title}</div>
      <div className="mt-0.5 text-[12px] leading-relaxed text-white/55">{children}</div>
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-1 inline-flex items-center gap-1 text-[12px] font-semibold hover:underline"
          style={{ color: ACCENT }}
        >
          {href.replace(/^https?:\/\//, '').replace(/\/$/, '')}
          <Icon name="share" className="h-3 w-3" />
        </a>
      )}
    </li>
  )
}

// Reusable "Sources and methodology" panel, shown as a modal dialog.
export default function MethodologyPanel({ open, onClose, orbit }) {
  if (!open) return null
  const status = cacheStatusInfo(orbit?.cacheStatus)

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Sources and methodology"
      onClick={onClose}
    >
      <div
        className="scroll-soft max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-white/10 bg-[#0b1a3d] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.9)] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className={LABEL}>Satellite Tracker</div>
            <h2 className="mt-0.5 text-lg font-light tracking-wide text-white">
              Sources & methodology
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <Icon name="plus" className="h-4 w-4 rotate-45" />
          </button>
        </div>

        <p className="mt-3 rounded-lg border border-amber-400/25 bg-amber-400/10 px-3 py-2.5 text-[12px] font-medium leading-relaxed text-amber-100">
          {MODELED_POSITION_DISCLAIMER}
        </p>

        <ul className="mt-2 divide-y divide-white/10">
          <SourceRow title="Orbital elements" href={DATA_SOURCES.orbitalElements.url}>
            {DATA_SOURCES.orbitalElements.credit} Your browser fetches them only from this site’s
            internal <code className="rounded bg-white/10 px-1">/api/orbits</code> route.
          </SourceRow>
          <SourceRow title="Orbit propagation" href={DATA_SOURCES.propagation.url}>
            {DATA_SOURCES.propagation.credit}
          </SourceRow>
          <SourceRow title="Earth texture" href={DATA_SOURCES.earthTexture.url}>
            {DATA_SOURCES.earthTexture.credit} Shown when the texture loads; otherwise a clean
            procedural material is used (not satellite imagery).
          </SourceRow>
          <SourceRow title="Spacecraft 3D models" href={DATA_SOURCES.spacecraftModels.url}>
            {DATA_SOURCES.spacecraftModels.credit}
          </SourceRow>
          <SourceRow title="Mission descriptions">
            Official NASA, NASA/USGS, NOAA, and ESA / mission-agency sources. See each mission’s
            “Official mission page” link in its detail panel.
          </SourceRow>
        </ul>

        <div className="mt-3 rounded-lg border border-white/10 bg-white/5 p-3 text-[12px] text-white/55">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white/80">Orbital-data updated</span>
            <span>{formatUtc(orbit?.generatedAt)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="font-semibold text-white/80">Cache status</span>
            <span
              className={
                status.tone === 'ok' ? 'font-bold text-emerald-400' : 'font-bold text-amber-400'
              }
            >
              {status.label}
            </span>
          </div>
          {status.note && <p className="mt-1 text-[11px]">{status.note}</p>}
        </div>

        <p className="mt-3 text-[11px] leading-relaxed text-white/35">
          {SCIENCE_LAYERS_NOTE} Positions are modeled estimates, not live GPS or operational
          telemetry. This is an independent educational project and does not imply endorsement by
          NASA, NOAA, ESA, or USGS.
        </p>
      </div>
    </div>
  )
}
