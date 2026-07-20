// @ts-nocheck
import Icon from '../Icon'
import { LABEL } from './mcStyles'
import { timeInOrbit } from './orbitStatus'

// Keyboard-first, canvas-independent companion. Also serves as the primary UI
// when WebGL is unavailable (pass showTable to render modeled positions as text).
function fmtLat(d) {
  return d == null ? '—' : `${Math.abs(d).toFixed(2)}° ${d >= 0 ? 'N' : 'S'}`
}
function fmtLon(d) {
  return d == null ? '—' : `${Math.abs(d).toFixed(2)}° ${d >= 0 ? 'E' : 'W'}`
}

export default function AccessibleMissionList({
  missions,
  byId,
  selectedId,
  onSelect,
  onPrev,
  onNext,
  livePosition,
  positions,
  simTimeMs,
  showTable = false,
  heading = 'Mission list (accessible)',
}) {
  const selected = missions.find((m) => m.id === selectedId) || null

  return (
    <section aria-label={heading} className="text-white">
      <div className="flex items-center justify-between gap-2">
        <h3 className={LABEL}>{heading}</h3>
        <div className="flex gap-1">
          <button
            onClick={onPrev}
            aria-label="Previous mission"
            className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
          >
            <Icon name="back" className="h-4 w-4" />
          </button>
          <button
            onClick={onNext}
            aria-label="Next mission"
            className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
          >
            <Icon name="chevron" className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* selected coordinates as text */}
      <div
        className="mt-2 rounded-lg border border-white/10 bg-white/5 p-3 text-[13px]"
        aria-live="polite"
      >
        {selected ? (
          <>
            <div className="font-bold text-white">{selected.displayName}</div>
            <div className="text-white/40">
              {selected.category} · {selected.agency}
            </div>
            <div className="mt-1 text-white/75">
              Modeled position: {fmtLat(livePosition?.latDeg)}, {fmtLon(livePosition?.lonDeg)},{' '}
              {livePosition?.altKm != null ? `${Math.round(livePosition.altKm)} km altitude` : '—'}
              {livePosition?.speedKmS != null ? `, ${livePosition.speedKmS.toFixed(2)} km/s` : ''}
            </div>
            <div className="mt-1 text-white/50">
              Time in orbit: {timeInOrbit(selected, simTimeMs ?? Date.now())}
            </div>
          </>
        ) : (
          <span className="text-white/40">Select a mission to see its modeled position.</span>
        )}
      </div>

      {/* keyboard-selectable list */}
      <ul className="mt-2 space-y-0.5">
        {missions.map((m) => {
          const item = byId[m.id]
          const unavailable = !item || !item.valid
          return (
            <li key={m.id}>
              <button
                onClick={() => onSelect(m.id)}
                aria-current={selectedId === m.id ? 'true' : undefined}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-[13px] ${
                  selectedId === m.id
                    ? 'bg-white/10 ring-1 ring-white/20'
                    : 'hover:bg-white/5'
                }`}
              >
                <span className="font-semibold text-white/90">{m.displayName}</span>
                <span className="text-[10px] uppercase tracking-wider text-white/35">
                  {unavailable ? 'Unavailable' : m.category}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      {/* full text table (used for the WebGL fallback) */}
      {showTable && positions && (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-left text-[12px]">
            <caption className="sr-only">Modeled satellite positions</caption>
            <thead>
              <tr className="text-white/35">
                <th className="py-1 pr-3 font-semibold uppercase tracking-wider">Mission</th>
                <th className="py-1 pr-3 font-semibold uppercase tracking-wider">Latitude</th>
                <th className="py-1 pr-3 font-semibold uppercase tracking-wider">Longitude</th>
                <th className="py-1 font-semibold uppercase tracking-wider">Altitude</th>
              </tr>
            </thead>
            <tbody>
              {missions.map((m) => {
                const p = positions[m.id]
                return (
                  <tr key={m.id} className="border-t border-white/10">
                    <td className="py-1.5 pr-3 font-semibold text-white/90">{m.displayName}</td>
                    <td className="py-1.5 pr-3 text-white/55">{fmtLat(p?.latDeg)}</td>
                    <td className="py-1.5 pr-3 text-white/55">{fmtLon(p?.lonDeg)}</td>
                    <td className="py-1.5 text-white/55">
                      {p?.altKm != null ? `${Math.round(p.altKm)} km` : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
