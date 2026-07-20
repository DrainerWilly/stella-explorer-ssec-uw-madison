// @ts-nocheck
import { regionColor } from '../data/instruments'

// Exact band details for the selected instrument. Scrolls horizontally inside
// its own card on small screens so the page itself never scrolls sideways.
const res = (b) => {
  if (b.resolutionMeters == null) return '—'
  return b.resolutionNote ? `${b.resolutionMeters} m*` : `${b.resolutionMeters} m`
}

export default function BandTable({ bands }) {
  const hasNote = bands.some((b) => b.resolutionNote)

  return (
    <div className="rounded-panel bg-surface p-2 shadow-soft">
      <div className="overflow-x-auto scroll-soft">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-faint">
              <th className="px-3 py-2.5">Band</th>
              <th className="px-3 py-2.5">Color / purpose</th>
              <th className="px-3 py-2.5">Region</th>
              <th className="px-3 py-2.5 text-right">Range (nm)</th>
              <th className="px-3 py-2.5 text-right">Center</th>
              <th className="px-3 py-2.5 text-right">Width</th>
              <th className="px-3 py-2.5 text-right">Resolution</th>
            </tr>
          </thead>
          <tbody>
            {bands.map((b) => (
              <tr key={b.id} className="border-t border-ink/5">
                <td className="whitespace-nowrap px-3 py-2.5 font-bold text-ink">{b.band}</td>
                <td className="px-3 py-2.5 text-ink/80">{b.colorOrPurpose}</td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  <span className="flex items-center gap-1.5 font-semibold text-muted">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: regionColor(b.spectralRegion) }}
                    />
                    {b.spectralRegion}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-ink/80">
                  {b.minNm}–{b.maxNm}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-ink/80">
                  {b.centerNm} nm
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-ink/80">
                  {b.widthNm} nm
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-ink/80">
                  {res(b)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hasNote && (
        <p className="px-3 py-2 text-xs text-faint">* native resolution, resampled to 30 m</p>
      )}
    </div>
  )
}
