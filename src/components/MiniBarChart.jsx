// Small stacked-look bar chart echoing the reference dashboard. Each bar is a
// rounded column whose height encodes `value` (0..1). The last bar is
// highlighted with a dark frame, like the reference "Dec" bar.
export default function MiniBarChart({ bars }) {
  return (
    <div className="flex items-end justify-between gap-2">
      {bars.map((bar, i) => {
        const highlight = i === bars.length - 1
        return (
          <div key={bar.label} className="flex flex-1 flex-col items-center gap-2">
            <div
              className={`flex h-24 w-full items-end justify-center rounded-2xl px-1 pb-1 pt-2 ${
                highlight ? 'bg-ink' : 'bg-ink/[0.06]'
              }`}
            >
              <div
                className="w-full rounded-[10px] transition-all duration-500"
                style={{
                  height: `${Math.max(8, bar.value * 100)}%`,
                  backgroundColor: bar.color,
                }}
              />
            </div>
            <span
              className={`text-[10px] font-semibold ${highlight ? 'text-ink' : 'text-faint'}`}
            >
              {bar.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
