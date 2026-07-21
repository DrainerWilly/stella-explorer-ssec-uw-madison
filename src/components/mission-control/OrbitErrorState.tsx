// @ts-nocheck
import Icon from '../Icon'

// Full error screen shown when fresh orbital data is unavailable.
export default function OrbitErrorState({ error, onRetry }) {
  const offline = typeof navigator !== 'undefined' && navigator.onLine === false
  const title = offline ? 'No network connection' : 'Orbital data is unavailable'
  const detail = offline
    ? 'Your device appears to be offline. Reconnect to fetch modeled orbital elements.'
    : 'The orbit service could not fetch fresh public TLE data. Try again when the orbit providers and your network are available.'

  return (
    <div className="grid h-full w-full place-items-center bg-gradient-to-b from-[#060e26] to-[#0b1a3d] p-8 text-center">
      <div className="max-w-md">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-rose-500/15 text-rose-300">
          <Icon name="satellite" className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-lg font-extrabold text-slate-100">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-300/80">{detail}</p>
        {error && (
          <p className="mt-3 rounded-lg bg-black/30 px-3 py-2 text-left font-mono text-[11px] text-slate-400">
            {error}
          </p>
        )}
        <button
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-sky-400 px-5 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-sky-300"
        >
          <Icon name="reset" className="h-4 w-4" />
          Try again
        </button>
      </div>
    </div>
  )
}
