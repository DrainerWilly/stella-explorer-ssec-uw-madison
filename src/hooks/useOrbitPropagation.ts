// @ts-nocheck
import { useMemo } from 'react'
import { makeSatrec, orbitalPeriodMinutes, tleEpochDate } from '../utils/orbitMath'
import { MISSION_BY_ID, ENABLED_MISSIONS } from '../data/missionCatalog'

// Merges the mission catalog with the fetched TLEs into propagatable objects.
// A mission whose TLE cannot be parsed is returned with `valid: false` so the
// UI can show it as "unavailable" instead of rendering an invented position.
export default function useOrbitPropagation(orbitResponse) {
  return useMemo(() => {
    const rows = orbitResponse?.missions ?? []

    const items = rows.map((od) => {
      const mission = MISSION_BY_ID[od.missionId] ?? null
      const satrec = makeSatrec(od.tleLine1, od.tleLine2)
      return {
        id: od.missionId,
        mission,
        orbit: od,
        satrec,
        valid: Boolean(mission && satrec),
        periodMin: satrec ? orbitalPeriodMinutes(satrec) : null,
        epoch: satrec ? tleEpochDate(satrec) : od.epoch ? new Date(od.epoch) : null,
        reason: mission ? null : 'Not in catalog',
      }
    })

    // Missions the service reported as unavailable (no verified TLE at all).
    const seen = new Set(items.map((i) => i.id))
    const unavailable = (orbitResponse?.unavailable ?? [])
      .filter((u) => !seen.has(u.missionId))
      .map((u) => ({
        id: u.missionId,
        mission: MISSION_BY_ID[u.missionId] ?? null,
        orbit: null,
        satrec: null,
        valid: false,
        periodMin: null,
        epoch: null,
        reason: u.reason || 'Unavailable',
      }))

    // Belt-and-suspenders: guarantee every enabled catalog mission is present,
    // even if a live provider response omitted it entirely, so the UI shows it
    // as unavailable rather than dropping it.
    const present = new Set([...items, ...unavailable].map((i) => i.id))
    const missing = ENABLED_MISSIONS.filter((m) => !present.has(m.id)).map((m) => ({
      id: m.id,
      mission: m,
      orbit: null,
      satrec: null,
      valid: false,
      periodMin: null,
      epoch: null,
      reason: 'No current orbital data',
    }))

    const all = [...items, ...unavailable, ...missing]
    return {
      items: all,
      valid: all.filter((i) => i.valid),
      byId: Object.fromEntries(all.map((i) => [i.id, i])),
    }
  }, [orbitResponse])
}
