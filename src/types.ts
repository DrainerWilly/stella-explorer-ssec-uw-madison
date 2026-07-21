// Shared domain types for the app. The codebase is being typed gradually; these
// describe the core data shapes (missions, orbit responses, sim clock, games)
// so newly-converted TypeScript modules get real type safety.

/** Live data status reported by the orbit service. */
export type CacheStatus = 'fresh' | (string & {})

export interface CacheStatusInfo {
  label: string
  tone: 'ok' | 'warn'
  note: string
}

/** A mission from the catalog (`src/data/missionCatalog.js`). */
export interface Mission {
  id: string
  displayName: string
  expectedObjectName: string
  noradId: number
  category: string
  agency: string
  orbitType: string
  launchYear: number | null
  launchDate?: string | null
  missionPageUrl: string
  sourceUrl: string
  shortDescription: string
  longDescription: string
  instruments: string[]
  observes: string[]
  markerColor: string
  featured: boolean
  enabled: boolean
  /** Present when the mission is an instrument hosted on another spacecraft. */
  hostedOn?: string | null
  /** Present for members of a constellation (e.g. CYGNSS, GRACE-FO). */
  constellation?: string | null
}

/** A verified orbital-element row returned from `/api/orbits`. */
export interface OrbitMissionData {
  missionId: string
  objectName: string
  noradCatalogNumber: number
  tleLine1: string
  tleLine2: string
  epoch: string
  fetchedAt: string
  source?: string
  sourceUrl: string
}

export interface OrbitUnavailable {
  missionId: string
  expectedObjectName?: string
  reason: string
}

/** Full response shape of the `/api/orbits` endpoint. */
export interface OrbitResponse {
  generatedAt: string
  source: string
  cacheStatus: CacheStatus
  sourceUrl?: string
  sourceUrls?: string[]
  missions: OrbitMissionData[]
  unavailable: OrbitUnavailable[]
}

/**
 * Plain (non-React) simulation clock. Advanced once per animation frame and
 * read by the 3D scene and time bar, so it lives outside React state.
 */
export interface SimClock {
  /** Simulation time, ms since epoch. */
  time: number
  playing: boolean
  speed: number
  /** Live/Now mode: snap to wall-clock at 1×. */
  following: boolean
  advance(dtSeconds: number): void
  getDate(): Date
}

/** A game entry shown in the Games section (`src/data/games.js`). */
export interface GameMeta {
  id: string
  title: string
  tagline: string
  description: string
  icon: string
  color: string
  category: string
  difficulty: string
  minutes: number
}
