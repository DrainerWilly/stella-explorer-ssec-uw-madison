import { useEffect, useState } from 'react'
import Icon from '../Icon.jsx'
import { formatClockUtc } from './orbitStatus'
import { PANEL, LABEL, ACCENT, ACCENT_INK } from './mcStyles.js'

const RATES = [1, 10, 60, 600]
const WINDOW_MS = 12 * 60 * 60 * 1000 // ±12h scrubber window

function rateLabel(speed) {
  if (speed === 1) return 'REAL RATE'
  if (speed < 60) return `${speed} SECS / SEC`
  return `${speed / 60} ${speed / 60 === 1 ? 'MIN' : 'MINS'} / SEC`
}

// Bottom simulation-time bar. Reads the sim clock a few times per second (not
// every frame) so the readout stays smooth without heavy re-renders.
export default function TimeControlBar({
  clock,
  playing,
  speed,
  following,
  onPlayPause,
  onSpeed,
  onLive,
  onReset,
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

  const rateIdx = Math.max(0, RATES.indexOf(speed))
  const stepRate = (dir) => {
    const next = RATES[Math.min(RATES.length - 1, Math.max(0, rateIdx + dir))]
    onSpeed(next)
  }

  const stepBtn =
    'grid h-8 w-8 place-items-center rounded-md bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-white/5'

  return (
    <div className={`${PANEL} px-4 py-2.5`}>
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        {/* rate stepper */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => stepRate(-1)}
            disabled={following || rateIdx <= 0}
            aria-label="Slower simulation rate"
            className={stepBtn}
          >
            <Icon name="back" className="h-4 w-4" />
          </button>
          <div className="w-[6.5rem] text-center">
            <div className={LABEL}>Rate</div>
            <div className="text-[12px] font-bold tracking-wider text-white">
              {following ? 'REAL RATE' : rateLabel(speed)}
            </div>
          </div>
          <button
            onClick={() => stepRate(1)}
            disabled={following || rateIdx >= RATES.length - 1}
            aria-label="Faster simulation rate"
            className={stepBtn}
          >
            <Icon name="chevron" className="h-4 w-4" />
          </button>
        </div>

        {/* transport */}
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            aria-label="Reset simulation time to now"
            title="Reset to now"
            className={stepBtn}
          >
            <Icon name="reset" className="h-4 w-4" />
          </button>
          <button
            onClick={onPlayPause}
            aria-label={playing ? 'Pause' : 'Play'}
            className="grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <Icon name={playing ? 'pause' : 'play'} className="h-5 w-5" />
          </button>
        </div>

        {/* readout */}
        <div className="text-center">
          <div className={LABEL}>Simulation time</div>
          <div className="font-mono text-[15px] font-bold uppercase tracking-wide text-white">
            {formatClockUtc(simDate)}
          </div>
          <div className="text-[10px] text-white/35">
            Local {simDate.toLocaleDateString()} {simDate.toLocaleTimeString()}
          </div>
        </div>

        {/* live */}
        <button
          onClick={onLive}
          aria-pressed={following}
          title="Return to the current time at real rate"
          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.15em] transition-colors ${
            following
              ? ''
              : 'border border-white/20 bg-white/5 text-white/60 hover:text-white'
          }`}
          style={following ? { backgroundColor: ACCENT, color: ACCENT_INK } : undefined}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${following ? 'bg-[#062033]' : 'bg-white/40'}`}
          />
          Live
        </button>
      </div>

      {/* scrubber */}
      <div className="mt-2 flex items-center gap-2">
        <span className="text-[9px] font-bold tracking-wider text-white/30">−12H</span>
        <input
          type="range"
          min={min}
          max={max}
          step={60000}
          value={scrubValue}
          onChange={(e) => onScrub(Number(e.target.value))}
          aria-label="Scrub simulation time"
          className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-[#67d1ff]"
        />
        <span className="text-[9px] font-bold tracking-wider text-white/30">+12H</span>
      </div>

      <p className="mt-1.5 text-center text-[9px] uppercase tracking-[0.22em] text-white/25">
        Simulated view · positions modeled from orbital elements · not live tracking
      </p>
    </div>
  )
}
