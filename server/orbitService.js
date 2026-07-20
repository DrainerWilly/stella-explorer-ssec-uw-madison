// Shared orbital-data service used by BOTH the local Vite middleware
// (server/localOrbitApi.js) and the Vercel function (api/orbits.js).
//
// Responsibilities:
//   1. Read the active missions from the mission catalog.
//   2. Fetch ONLY those missions' elements from CelesTrak (one request per
//      verified NORAD catalog number — never the whole active catalog).
//   3. Validate that each returned object name matches expectedObjectName.
//   4. Return verified missions with source + timestamps.
//   5. Cache valid responses for ~2 hours (in-memory + local file).
//   6. Fall back to stale cache, then to a committed dataset, if CelesTrak is
//      unavailable — the page never dies because a refresh failed.
//
// No API keys or secrets are used or required.

import { twoline2satrec } from 'satellite.js'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  getMemoryCache,
  setMemoryCache,
  isFresh,
  readFileCache,
  writeFileCache,
} from './orbitCache.js'

const CELESTRAK_GP = 'https://celestrak.org/NORAD/elements/gp.php'
const SOURCE_NAME = 'CelesTrak GP orbital elements'
const FETCH_TIMEOUT_MS = 12000
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

let orbitDataPromise = null

function dataModuleUrl(source) {
  return `data:text/javascript;base64,${Buffer.from(source, 'utf8').toString('base64')}`
}

// The browser app is TypeScript-only after migration. This server route runs in
// plain Node, so it cannot import .ts files by path. These data modules contain
// JavaScript-compatible source, so load them through data: module URLs and keep
// the runtime source of truth in src/data/*.ts.
async function loadOrbitData() {
  if (!orbitDataPromise) {
    orbitDataPromise = (async () => {
      const missionCategoriesSource = await readFile(
        path.join(REPO_ROOT, 'src/data/missionCategories.ts'),
        'utf8',
      )
      const missionCategoriesUrl = dataModuleUrl(missionCategoriesSource)
      const missionCatalogSource = (
        await readFile(path.join(REPO_ROOT, 'src/data/missionCatalog.ts'), 'utf8')
      ).replace(
        /from ['"]\.\/missionCategories['"]/g,
        `from ${JSON.stringify(missionCategoriesUrl)}`,
      )
      const orbitsFallbackSource = await readFile(
        path.join(REPO_ROOT, 'src/data/orbitsFallback.ts'),
        'utf8',
      )

      const [missionCatalog, orbitsFallback] = await Promise.all([
        import(dataModuleUrl(missionCatalogSource)),
        import(dataModuleUrl(orbitsFallbackSource)),
      ])

      return {
        ENABLED_MISSIONS: missionCatalog.ENABLED_MISSIONS,
        FALLBACK_TLES: orbitsFallback.FALLBACK_TLES,
        FALLBACK_RETRIEVED_AT: orbitsFallback.FALLBACK_RETRIEVED_AT,
        FALLBACK_SOURCE_URL: orbitsFallback.FALLBACK_SOURCE_URL,
      }
    })()
  }

  return orbitDataPromise
}

function gpUrlByCatalog(noradId) {
  return `${CELESTRAK_GP}?CATNR=${encodeURIComponent(noradId)}&FORMAT=TLE`
}

// CelesTrak FORMAT=TLE returns "NAME\n1 ...\n2 ...". Non-matches return a short
// text message (e.g. "No GP data found") that yields no "1 "/"2 " lines.
function parseTleBlock(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+$/, ''))
    .filter((l) => l.length > 0)
  const i1 = lines.findIndex((l) => l.startsWith('1 '))
  if (i1 < 1) return null
  const l1 = lines[i1]
  const l2 = lines[i1 + 1]
  if (!l2 || !l2.startsWith('2 ')) return null
  return { name: lines[i1 - 1].trim(), tleLine1: l1, tleLine2: l2 }
}

function namesMatch(a, b) {
  return String(a).trim().toUpperCase() === String(b).trim().toUpperCase()
}

// Derive the element-set epoch (ISO) from the TLE using satellite.js.
function epochIsoFromTle(l1, l2) {
  try {
    const satrec = twoline2satrec(l1, l2)
    const jd = satrec?.jdsatepoch
    if (!jd || Number.isNaN(jd)) return null
    const ms = (jd - 2440587.5) * 86400000 // Julian date → Unix ms
    const d = new Date(ms)
    return Number.isNaN(d.getTime()) ? null : d.toISOString()
  } catch {
    return null
  }
}

// Fetch a single orbital OBJECT by catalog number. Name validation happens
// per-mission afterward, because several missions can share one object.
async function fetchByCatalog(noradId) {
  const url = gpUrlByCatalog(noradId)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'text/plain',
        'User-Agent': 'STELLA-Mission-Control/1.0 (K-12 education; server-side fetch)',
      },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const text = await res.text()
    const parsed = parseTleBlock(text)
    if (!parsed) throw new Error('No TLE found in CelesTrak response')
    return {
      name: parsed.name,
      tleLine1: parsed.tleLine1,
      tleLine2: parsed.tleLine2,
      fetchedAt: new Date().toISOString(),
      sourceUrl: url,
    }
  } finally {
    clearTimeout(timer)
  }
}

// Turn a fetched/fallback object into a mission row, validating the object name
// against the mission's expectedObjectName.
function toMissionRow(mission, obj, fetchedAt, sourceUrl) {
  if (!namesMatch(obj.name ?? obj.objectName, mission.expectedObjectName)) return null
  return {
    missionId: mission.id,
    objectName: obj.name ?? obj.objectName,
    noradCatalogNumber: mission.noradId,
    tleLine1: obj.tleLine1,
    tleLine2: obj.tleLine2,
    epoch: epochIsoFromTle(obj.tleLine1, obj.tleLine2),
    fetchedAt,
    sourceUrl,
  }
}

async function fetchFresh() {
  const { ENABLED_MISSIONS } = await loadOrbitData()
  // Fetch each UNIQUE catalog object once (hosted instruments share an object).
  const uniqueIds = [...new Set(ENABLED_MISSIONS.map((m) => m.noradId))]
  const results = await Promise.allSettled(uniqueIds.map((id) => fetchByCatalog(id)))
  const byNorad = {}
  const errByNorad = {}
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') byNorad[uniqueIds[i]] = r.value
    else errByNorad[uniqueIds[i]] = String(r.reason?.message || r.reason)
  })

  const missions = []
  const unavailable = []
  for (const m of ENABLED_MISSIONS) {
    const obj = byNorad[m.noradId]
    if (!obj) {
      unavailable.push({
        missionId: m.id,
        expectedObjectName: m.expectedObjectName,
        reason: errByNorad[m.noradId] || 'Fetch failed',
      })
      continue
    }
    const row = toMissionRow(m, obj, obj.fetchedAt, obj.sourceUrl)
    if (row) missions.push(row)
    else
      unavailable.push({
        missionId: m.id,
        expectedObjectName: m.expectedObjectName,
        reason: `Object name mismatch (got "${obj.name}")`,
      })
  }
  return { missions, unavailable }
}

async function buildFromFallback() {
  const { ENABLED_MISSIONS, FALLBACK_TLES, FALLBACK_RETRIEVED_AT, FALLBACK_SOURCE_URL } =
    await loadOrbitData()
  const byNorad = Object.fromEntries(FALLBACK_TLES.map((t) => [t.noradCatalogNumber, t]))
  const missions = []
  for (const m of ENABLED_MISSIONS) {
    const obj = byNorad[m.noradId]
    if (!obj) continue
    const row = toMissionRow(m, obj, FALLBACK_RETRIEVED_AT, FALLBACK_SOURCE_URL)
    if (row) missions.push(row)
  }
  return missions
}

/**
 * Return verified orbital elements for the enabled missions.
 * Always resolves (never throws) — worst case it returns the committed fallback.
 */
export async function getOrbits({ forceRefresh = false } = {}) {
  const mem = getMemoryCache()

  // 1) Warm, fresh in-memory cache.
  if (!forceRefresh && isFresh(mem)) {
    return { ...mem.payload, cacheStatus: 'fresh' }
  }

  // 2) Try a fresh fetch from CelesTrak.
  try {
    const { missions, unavailable } = await fetchFresh()
    if (missions.length === 0) {
      throw new Error('No missions could be verified from CelesTrak')
    }
    const payload = {
      generatedAt: new Date().toISOString(),
      source: SOURCE_NAME,
      sourceUrl: 'https://celestrak.org/NORAD/documentation/gp-data-formats.php',
      cacheStatus: 'fresh',
      missions,
      unavailable,
    }
    setMemoryCache(payload)
    await writeFileCache(payload)
    return payload
  } catch (err) {
    const staleReason = String(err?.message || err)

    // 3) Serve whatever is in memory, even if past its TTL.
    if (mem?.payload) {
      return { ...mem.payload, cacheStatus: 'stale', staleReason }
    }

    // 4) Serve the last successful local file cache.
    const file = await readFileCache()
    if (file?.payload) {
      setMemoryCache(file.payload)
      return { ...file.payload, cacheStatus: 'stale', staleReason }
    }

    // 5) Last resort: the committed development fallback.
    const { FALLBACK_RETRIEVED_AT, FALLBACK_SOURCE_URL } = await loadOrbitData()
    return {
      generatedAt: FALLBACK_RETRIEVED_AT,
      source: `${SOURCE_NAME} — committed development fallback (not guaranteed current)`,
      sourceUrl: FALLBACK_SOURCE_URL,
      cacheStatus: 'fallback',
      staleReason,
      missions: await buildFromFallback(),
      unavailable: [],
    }
  }
}
