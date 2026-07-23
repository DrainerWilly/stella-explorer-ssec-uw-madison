// @ts-nocheck
import { useEffect, useState } from 'react'
import Icon from '../Icon'
import { ACCENT, ACCENT_INK } from './mcStyles'

const RATES = [1, 10, 60, 600]
const WINDOW_MS = 12 * 60 * 60 * 1000 // ±12h scrubber window

function rateLabel(speed) {
  if (speed === 1) return '1×'
  if (speed < 60) return `${speed}×`
  return `${speed / 60}m/s`
}

function shortClockUtc(date) {
  return (
    date.toLocaleString('en-US', {
      timeZone: 'UTC',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }) + ' UTC'
  )
}

// Slim NASA-Eyes-style time ribbon: a single compact pill (transport · rate ·
// clock · live) sitting over a hairline scrubber, so the globe stays visible.
export default function TimeControlBar({
  clock,
  playing,
  speed,
  following,
  onPlayPause,
  onSpeed,
  onLive,
  onScrub,
}) {
  const [timeMs, setTimeMs] = useState(clock.time)

  useEffect(() => {
    const id = setInterval(() => setTimeMs(clock.time), 250)
    return () => clearInterval(id)
  }, [clock])

  const simDate = new Date(timeMs)
  const now = Date.now()
  const min = now - WINDOW_MS
  const max = now + WINDOW_MS
  const scrubValue = Math.min(max, Math.max(min, timeMs))
  const scrubPct = ((scrubValue - min) / (max - min)) * 100

  // Live is the bottom rung of the rate ladder (real rate, snapped to now), so
  // the stepper treats it as 1× and ">" simply steps up out of it. The stepper
  // only ever changes the rate: it never jumps the clock. Use Live to do that.
  const effectiveIdx = following ? 0 : Math.max(0, RATES.indexOf(speed))
  const stepRate = (dir) => {
    const next = Math.min(RATES.length - 1, Math.max(0, effectiveIdx + dir))
    if (next !== effectiveIdx) onSpeed(RATES[next])
  }

  const iconBtn =
    'mc-liquid-glass grid h-7 w-7 place-items-center rounded-lg text-white/60 transition-colors hover:text-white disabled:opacity-25 disabled:hover:bg-transparent'

  return (
    <div className="mc-liquid-glass overflow-hidden rounded-full shadow-[0_10px_40px_-12px_rgba(0,0,0,0.9)]">
      {/* control row */}
      <div className="flex items-center gap-1.5 px-2 py-1.5">
        {/* play/pause */}
        <button
          onClick={onPlayPause}
          aria-label={playing ? 'Pause' : 'Play'}
          className="mc-liquid-glass grid h-9 w-9 place-items-center rounded-lg text-white transition-colors"
        >
          <Icon name={playing ? 'pause' : 'play'} className="h-[18px] w-[18px]" />
        </button>

        {/* rate stepper */}
        <div className="flex items-center">
          <button
            onClick={() => stepRate(-1)}
            disabled={effectiveIdx <= 0}
            aria-label="Slower"
            className={iconBtn}
          >
            <Icon name="back" className="h-3.5 w-3.5" />
          </button>
          <span className="w-9 text-center font-mono text-[12px] font-bold tabular-nums text-white">
            {rateLabel(RATES[effectiveIdx])}
          </span>
          <button
            onClick={() => stepRate(1)}
            disabled={effectiveIdx >= RATES.length - 1}
            aria-label="Faster"
            className={iconBtn}
          >
            <Icon name="chevron" className="h-3.5 w-3.5" />
          </button>
        </div>

        <span className="mx-0.5 h-5 w-px bg-white/10" />

        {/* clock readout */}
        <span className="whitespace-nowrap font-mono text-[12px] font-semibold tabular-nums text-white/90">
          {shortClockUtc(simDate)}
        </span>

        <span className="mx-0.5 h-5 w-px bg-white/10" />

        {/* live */}
        <button
          onClick={onLive}
          aria-pressed={following}
          title="Return to the current time at real rate"
          className={`mc-liquid-glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
            following ? '' : 'text-white/55 hover:bg-white/10 hover:text-white'
          }`}
          style={following ? { backgroundColor: ACCENT, color: ACCENT_INK } : undefined}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${following ? 'bg-[#062033]' : 'bg-white/40'}`} />
          Live
        </button>
      </div>

      {/* hairline scrubber */}
      <div className="relative h-4">
        {/* track fill (behind the thumb, non-interactive) */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden">
          <div className="h-full bg-white/10" />
          <div className="absolute inset-y-0 left-0" style={{ width: `${scrubPct}%`, backgroundColor: `${ACCENT}99` }} />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={60000}
          value={scrubValue}
          onChange={(e) => onScrub(Number(e.target.value))}
          aria-label="Scrub simulation time (±12 hours)"
          className="absolute inset-0 block h-4 w-full cursor-pointer appearance-none bg-transparent
                     [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full
                     [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white [&::-moz-range-track]:bg-transparent
                     [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:h-3
                     [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow"
        />
      </div>
    </div>
  )
}
