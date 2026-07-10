// Small shared helpers for presenting orbital-data freshness consistently.
import type { CacheStatus, CacheStatusInfo, Mission } from '../../types'

export const MODELED_POSITION_DISCLAIMER =
  'Satellite locations are calculated from publicly available orbital-element data and your selected simulation time. They are modeled estimates, not live GPS tracking or operational telemetry.'

export const MISSION_POSITION_NOTE =
  'Position is modeled from publicly available orbital elements. It does not represent operational telemetry.'

export function cacheStatusInfo(status: CacheStatus | null | undefined): CacheStatusInfo {
  switch (status) {
    case 'fresh':
      return { label: 'Fresh', tone: 'ok', note: 'Fetched recently from CelesTrak.' }
    case 'stale':
      return {
        label: 'Stale',
        tone: 'warn',
        note: 'CelesTrak could not be reached. Showing the last cached data.',
      }
    case 'fallback':
      return {
        label: 'Fallback',
        tone: 'warn',
        note: 'Using committed development data (not guaranteed current).',
      }
    default:
      return { label: status || 'Unknown', tone: 'warn', note: '' }
  }
}

export function isStale(status: CacheStatus | null | undefined): boolean {
  return status === 'stale' || status === 'fallback'
}

// Format an ISO timestamp as a readable UTC string.
export function formatUtc(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return (
    d.toLocaleString('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }) + ' UTC'
  )
}

interface LaunchMs {
  ms: number
  approx: boolean
}

// Launch epoch (ms) for a mission. `approx` is true when only a launch year is
// known (falls back to mid-year).
export function missionLaunchMs(mission: Mission | null | undefined): LaunchMs | null {
  if (!mission) return null
  if (mission.launchDate) {
    const t = Date.parse(`${mission.launchDate}T00:00:00Z`)
    if (!Number.isNaN(t)) return { ms: t, approx: false }
  }
  if (mission.launchYear) {
    const t = Date.parse(`${mission.launchYear}-07-01T00:00:00Z`)
    if (!Number.isNaN(t)) return { ms: t, approx: true }
  }
  return null
}

// Human-friendly duration: "12 yr 4 mo", "8 mo 3 d", or "5 d".
export function formatDuration(ms: number): string | null {
  if (ms < 0) return null
  const days = ms / 86400000
  const years = Math.floor(days / 365.25)
  const afterYears = days - years * 365.25
  const months = Math.floor(afterYears / 30.4375)
  const remDays = Math.floor(afterYears - months * 30.4375)
  if (years > 0) return `${years} yr ${months} mo`
  if (months > 0) return `${months} mo ${remDays} d`
  return `${Math.floor(days)} d`
}

// "Time in orbit" for a mission at the given simulation time (ms).
export function timeInOrbit(mission: Mission | null | undefined, simTimeMs: number): string {
  const launch = missionLaunchMs(mission)
  if (!launch) return '—'
  const diff = simTimeMs - launch.ms
  if (diff < 0) return 'Not yet launched'
  const d = formatDuration(diff)
  return d ? `${launch.approx ? '~' : ''}${d}` : '—'
}

export function formatClockUtc(date: Date): string {
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
