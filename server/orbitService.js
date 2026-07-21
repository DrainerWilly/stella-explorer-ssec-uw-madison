// Shared orbital-data service used by BOTH the local Vite middleware
// (server/localOrbitApi.js) and the Vercel function (api/orbits.js).
//
// Responsibilities:
//   1. Read the active missions from the mission catalog.
//   2. Fetch ONLY those missions' elements from live public TLE providers (one
//      request per verified NORAD catalog number — never a huge catalog dump).
//   3. Validate that each returned object name matches expectedObjectName.
//   4. Return verified missions with source + timestamps.
//   5. Return ONLY live provider data. If fresh data cannot be fetched, the API
//      fails instead of serving stale or committed development TLEs.
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
const SATNOGS_TLE = 'https://db.satnogs.org/api/tle/'
const TLE_API = 'https://tle.ivanstanojevic.me/api/tle'
const CELESTRAK_SOURCE_NAME = 'CelesTrak GP orbital elements'
const SATNOGS_SOURCE_NAME = 'SatNOGS DB TLE data'
const TLE_API_SOURCE_NAME = 'tle.ivanstanojevic.me TLE API'
const PROVIDER_HOME_URLS = {
  [CELESTRAK_SOURCE_NAME]: CELESTRAK_GP,
  [SATNOGS_SOURCE_NAME]: SATNOGS_TLE,
  [TLE_API_SOURCE_NAME]: TLE_API,
}
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
      const missionCatalog = await import(dataModuleUrl(missionCatalogSource))

      return {
        ENABLED_MISSIONS: missionCatalog.ENABLED_MISSIONS,
      }
    })()
  }

  return orbitDataPromise
}

function gpUrlByCatalog(noradId) {
  return `${CELESTRAK_GP}?CATNR=${encodeURIComponent(noradId)}&FORMAT=TLE`
}

function satnogsUrlByCatalog(noradId) {
  return `${SATNOGS_TLE}?norad_cat_id=${encodeURIComponent(noradId)}`
}

function tleApiUrlByCatalog(noradId) {
  return `${TLE_API}/${encodeURIComponent(noradId)}`
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

function parseSatnogsPayload(payload) {
  const rows = Array.isArray(payload) ? payload : []
  const row = rows.find((r) => r?.tle1 && r?.tle2)
  if (!row) return null
  return {
    name: String(row.tle0 || '').replace(/^0\s+/, '').trim(),
    tleLine1: row.tle1,
    tleLine2: row.tle2,
    updated: row.updated,
  }
}

function parseTleApiPayload(payload) {
  if (!payload?.line1 || !payload?.line2) return null
  return {
    name: String(payload.name || '').trim(),
    tleLine1: payload.line1,
    tleLine2: payload.line2,
    updated: payload.date,
  }
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

async function fetchText(url, providerName) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'text/plain,*/*',
        'User-Agent': 'Mozilla/5.0 (compatible; ExSTELLA/1.0; live orbit education)',
      },
    })
    if (!res.ok) throw new Error(`${providerName} HTTP ${res.status}`)
    return await res.text()
  } finally {
    clearTimeout(timer)
  }
}

async function fetchJson(url, providerName) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; ExSTELLA/1.0; live orbit education)',
      },
    })
    if (!res.ok) throw new Error(`${providerName} HTTP ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

async function fetchCelesTrakByCatalog(noradId) {
  const url = gpUrlByCatalog(noradId)
  const text = await fetchText(url, CELESTRAK_SOURCE_NAME)
  const parsed = parseTleBlock(text)
  if (!parsed) throw new Error('No TLE found in CelesTrak response')
  return {
    noradCatalogNumber: noradId,
    name: parsed.name,
    tleLine1: parsed.tleLine1,
    tleLine2: parsed.tleLine2,
    fetchedAt: new Date().toISOString(),
    source: CELESTRAK_SOURCE_NAME,
    sourceUrl: url,
  }
}

async function fetchSatnogsByCatalog(noradId) {
  const url = satnogsUrlByCatalog(noradId)
  const payload = await fetchJson(url, SATNOGS_SOURCE_NAME)
  const parsed = parseSatnogsPayload(payload)
  if (!parsed) throw new Error('No TLE found in SatNOGS response')
  return {
    noradCatalogNumber: noradId,
    name: parsed.name,
    tleLine1: parsed.tleLine1,
    tleLine2: parsed.tleLine2,
    fetchedAt: parsed.updated ? new Date(parsed.updated).toISOString() : new Date().toISOString(),
    source: SATNOGS_SOURCE_NAME,
    sourceUrl: url,
  }
}

async function fetchTleApiByCatalog(noradId) {
  const url = tleApiUrlByCatalog(noradId)
  const payload = await fetchJson(url, TLE_API_SOURCE_NAME)
  const parsed = parseTleApiPayload(payload)
  if (!parsed) throw new Error('No TLE found in tle.ivanstanojevic.me response')
  return {
    noradCatalogNumber: noradId,
    name: parsed.name,
    tleLine1: parsed.tleLine1,
    tleLine2: parsed.tleLine2,
    fetchedAt: parsed.updated ? new Date(parsed.updated).toISOString() : new Date().toISOString(),
    source: TLE_API_SOURCE_NAME,
    sourceUrl: url,
  }
}

// Fetch a single orbital OBJECT by catalog number. Name validation happens
// per-mission afterward, because several missions can share one object.
async function fetchByCatalog(noradId) {
  const errors = []
  for (const fetcher of [fetchCelesTrakByCatalog, fetchSatnogsByCatalog, fetchTleApiByCatalog]) {
    try {
      return await fetcher(noradId)
    } catch (err) {
      errors.push(String(err?.message || err))
    }
  }
  throw new Error(errors.join(' | '))
}

// Turn a fetched object into a mission row, validating the object name
// against the mission's expectedObjectName.
function toMissionRow(mission, obj, fetchedAt, sourceUrl) {
  const catalogMatches = Number(obj.noradCatalogNumber) === Number(mission.noradId)
  if (!catalogMatches && !namesMatch(obj.name ?? obj.objectName, mission.expectedObjectName)) {
    return null
  }
  return {
    missionId: mission.id,
    objectName: obj.name ?? obj.objectName,
    noradCatalogNumber: mission.noradId,
    tleLine1: obj.tleLine1,
    tleLine2: obj.tleLine2,
    epoch: epochIsoFromTle(obj.tleLine1, obj.tleLine2),
    fetchedAt,
    source: obj.source,
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

/**
 * Return verified orbital elements for the enabled missions.
 * Throws when fresh live TLE provider data cannot be fetched.
 */
export async function getOrbits({ forceRefresh = false } = {}) {
  const mem = getMemoryCache()
  if (!forceRefresh && isFresh(mem) && mem.payload?.cacheStatus === 'fresh') return mem.payload

  const { missions, unavailable } = await fetchFresh()
  if (missions.length === 0) {
    const file = await readFileCache()
    if (!forceRefresh && isFresh(file) && file.payload?.cacheStatus === 'fresh') {
      setMemoryCache(file.payload)
      return file.payload
    }
    throw new Error('No missions could be verified from live TLE providers')
  }
  const providers = [...new Set(missions.map((m) => m.source).filter(Boolean))]
  const source =
    providers.length > 0
      ? `Live orbital elements: ${providers.join(' + ')}`
      : 'Live orbital elements'
  const sourceUrls = providers.map((provider) => PROVIDER_HOME_URLS[provider]).filter(Boolean)

  const payload = {
    generatedAt: new Date().toISOString(),
    source,
    sourceUrl: sourceUrls[0] || 'https://celestrak.org/NORAD/documentation/gp-data-formats.php',
    sourceUrls,
    cacheStatus: 'fresh',
    missions,
    unavailable,
  }
  setMemoryCache(payload)
  await writeFileCache(payload)
  return payload
}
