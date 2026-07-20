// @ts-nocheck
// Orbit math for Mission Control.
//
// Clear separation of concerns:
//   • REAL physical calculations use kilometres and radians (via satellite.js).
//   • VISUAL display scaling converts km → scene units for Three.js.
//   • Orbit-height exaggeration is applied ONLY at the display step and is always
//     surfaced in the UI, never silently.

import { twoline2satrec, propagate, gstime, eciToGeodetic } from 'satellite.js'

// --- constants ---------------------------------------------------------------

export const EARTH_RADIUS_KM = 6371 // mean radius (physical)
export const EARTH_RADIUS_UNITS = 2 // Earth radius in Three.js scene units (visual)

export const RAD2DEG = 180 / Math.PI
export const DEG2RAD = Math.PI / 180

// Labelled visual-exaggeration options (see SceneControls / methodology panel).
export const EXAGGERATION_OPTIONS = [
  { id: 'physical', label: 'Physical scale', value: 1 },
  { id: '1.5x', label: '1.5×', value: 1.5 },
  { id: '2x', label: '2×', value: 2 },
  { id: '3x', label: '3×', value: 3 },
  { id: '4x', label: '4×', value: 4 },
]

// Convert a physical altitude/length in km to visual scene units.
export function kmToUnits(km) {
  return (km / EARTH_RADIUS_KM) * EARTH_RADIUS_UNITS
}

// --- TLE / propagation -------------------------------------------------------

// Build a satrec from TLE lines. Returns null on malformed input.
export function makeSatrec(tleLine1, tleLine2) {
  try {
    if (!tleLine1 || !tleLine2) return null
    const satrec = twoline2satrec(tleLine1, tleLine2)
    if (!satrec || satrec.error) return null
    return satrec
  } catch {
    return null
  }
}

// Epoch (Date) of the element set.
export function tleEpochDate(satrec) {
  if (!satrec?.jdsatepoch) return null
  const d = new Date((satrec.jdsatepoch - 2440587.5) * 86400000)
  return Number.isNaN(d.getTime()) ? null : d
}

// Orbital period in minutes from mean motion (satrec.no is rad/min).
export function orbitalPeriodMinutes(satrec) {
  const n = satrec?.no
  if (!n || n <= 0) return null
  return (2 * Math.PI) / n
}

/**
 * Propagate to `date`. Returns geodetic lat/lon (radians), altitude (km), and
 * speed (km/s). Returns { ok:false } for any propagation error or NaN; callers
 * must handle malformed/degenerate elements gracefully.
 */
export function propagateAt(satrec, date) {
  if (!satrec) return { ok: false }
  try {
    const pv = propagate(satrec, date)
    const p = pv?.position
    const v = pv?.velocity
    if (!p || Number.isNaN(p.x) || Number.isNaN(p.y) || Number.isNaN(p.z)) {
      return { ok: false }
    }
    const gmst = gstime(date)
    const geo = eciToGeodetic(p, gmst)
    const speedKmS = v
      ? Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
      : null
    return {
      ok: true,
      latRad: geo.latitude,
      lonRad: geo.longitude,
      altKm: geo.height,
      speedKmS,
    }
  } catch {
    return { ok: false }
  }
}

// --- coordinate mapping (display) --------------------------------------------

// Normalize a longitude (radians) to [-π, π].
export function normalizeLonRad(lon) {
  let x = lon
  while (x > Math.PI) x -= 2 * Math.PI
  while (x < -Math.PI) x += 2 * Math.PI
  return x
}

/**
 * Geodetic (lat, lon in radians; alt in km) → Three.js Cartesian scene units.
 * Convention: lon 0 → +Z (Greenwich faces the camera at start), lon +90°E → +X,
 * north pole → +Y. Orbit height is exaggerated only here, via `exaggeration`.
 */
export function geodeticToVec3(latRad, lonRad, altKm, exaggeration = 1) {
  const radius = EARTH_RADIUS_UNITS + kmToUnits(altKm) * exaggeration
  const cosLat = Math.cos(latRad)
  return [
    radius * cosLat * Math.sin(lonRad),
    radius * Math.sin(latRad),
    radius * cosLat * Math.cos(lonRad),
  ]
}

// A point on (or just above) Earth's surface, for ground tracks and the grid.
export function surfaceVec3(latRad, lonRad, liftUnits = 0) {
  const radius = EARTH_RADIUS_UNITS + liftUnits
  const cosLat = Math.cos(latRad)
  return [
    radius * cosLat * Math.sin(lonRad),
    radius * Math.sin(latRad),
    radius * cosLat * Math.cos(lonRad),
  ]
}

// --- sun direction (day/night) ----------------------------------------------

/**
 * Approximate unit vector from Earth's center toward the Sun, in the SAME frame
 * as geodeticToVec3. Good enough for a moving day/night terminator.
 */
export function sunDirectionUnitVec(date) {
  const jd = date.getTime() / 86400000 + 2440587.5
  const n = jd - 2451545.0 // days since J2000.0
  const L = (280.46 + 0.9856474 * n) * DEG2RAD
  const g = (357.528 + 0.9856003 * n) * DEG2RAD
  const lambda = L + (1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * DEG2RAD
  const epsilon = (23.439 - 0.0000004 * n) * DEG2RAD
  const declination = Math.asin(Math.sin(epsilon) * Math.sin(lambda))
  const rightAscension = Math.atan2(
    Math.cos(epsilon) * Math.sin(lambda),
    Math.cos(lambda),
  )
  const gmst = gstime(date)
  const subsolarLon = normalizeLonRad(rightAscension - gmst)
  const cosDec = Math.cos(declination)
  return [
    cosDec * Math.sin(subsolarLon),
    Math.sin(declination),
    cosDec * Math.cos(subsolarLon),
  ]
}

// --- orbit sampling (trails & ground tracks) --------------------------------

/**
 * Sample the sub-satellite path over one orbital period centered on `centerDate`.
 * Returns an array of { latRad, lonRad, altKm } for successful samples only.
 */
export function sampleGroundPath(satrec, centerDate, count = 128) {
  const periodMin = orbitalPeriodMinutes(satrec)
  if (!periodMin) return []
  const periodMs = periodMin * 60000
  const start = centerDate.getTime() - periodMs / 2
  const step = periodMs / count
  const out = []
  for (let i = 0; i <= count; i++) {
    const s = propagateAt(satrec, new Date(start + i * step))
    if (s.ok) out.push({ latRad: s.latRad, lonRad: s.lonRad, altKm: s.altKm })
  }
  return out
}

/**
 * Split a lat/lon path into segments wherever it crosses the antimeridian
 * (a longitude jump > π), so a drawn line never streaks across the whole globe.
 */
export function splitAtAntimeridian(samples) {
  const segments = []
  let current = []
  for (let i = 0; i < samples.length; i++) {
    if (i > 0) {
      const dLon = Math.abs(samples[i].lonRad - samples[i - 1].lonRad)
      if (dLon > Math.PI) {
        if (current.length > 1) segments.push(current)
        current = []
      }
    }
    current.push(samples[i])
  }
  if (current.length > 1) segments.push(current)
  return segments
}
