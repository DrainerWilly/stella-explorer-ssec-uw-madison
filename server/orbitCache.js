// Two-tier cache for orbital-element responses.
//
//   • In-memory  — used by every environment (and the ONLY writable cache on
//                  Vercel, where the filesystem is read-only for warm instances).
//   • File cache — used in local development so a successful live provider
//                  fetch survives dev-server restarts. Written to .cache/ (gitignored)
//                  and skipped entirely on serverless read-only filesystems.

import { promises as fs } from 'node:fs'
import path from 'node:path'

// Keep only a short recent-live cache. This prevents transient provider/network
// failures from blanking the tracker while still avoiding old committed fallback
// data or long-lived stale orbital elements.
export const CACHE_TTL_MS = 10 * 60 * 1000

const CACHE_DIR = path.join(process.cwd(), '.cache')
const CACHE_FILE = path.join(CACHE_DIR, 'orbits-cache.json')

// Vercel / AWS Lambda filesystems are read-only outside /tmp. Detect and skip.
const isReadOnlyFs = Boolean(process.env.VERCEL || process.env.AWS_REGION)

let memory = null // { savedAt: number, payload: object }

export function getMemoryCache() {
  return memory
}

export function setMemoryCache(payload) {
  memory = { savedAt: Date.now(), payload }
}

export function isFresh(entry) {
  return Boolean(entry) && Date.now() - entry.savedAt < CACHE_TTL_MS
}

export async function readFileCache() {
  if (isReadOnlyFs) return null
  try {
    const raw = await fs.readFile(CACHE_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed.savedAt === 'number' && parsed.payload) return parsed
    return null
  } catch {
    return null
  }
}

export async function writeFileCache(payload) {
  if (isReadOnlyFs) return
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true })
    await fs.writeFile(
      CACHE_FILE,
      JSON.stringify({ savedAt: Date.now(), payload }, null, 2),
      'utf8',
    )
  } catch {
    // Cache writes are best-effort; never fail the request because of them.
  }
}
