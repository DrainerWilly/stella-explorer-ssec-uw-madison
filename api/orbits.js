// Vercel-compatible Node.js Function for GET /api/orbits.
//
// It reuses the SAME shared orbit service used by local development, and adds
// CDN-friendly cache headers so orbital data is cached at the edge for ~2 hours
// while stale data can keep serving during a background refresh.
//
// This file is Vercel-ready but is NOT deployed as part of this change.

import { getOrbits } from '../server/orbitService.js'

export default async function handler(req, res) {
  // Edge/CDN cache: ~2h fresh, serve stale up to 24h while revalidating.
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=7200, stale-while-revalidate=86400',
  )
  res.setHeader('Content-Type', 'application/json; charset=utf-8')

  try {
    const forceRefresh = String(req.query?.refresh ?? '') === '1'
    const payload = await getOrbits({ forceRefresh })
    res.status(200).send(JSON.stringify(payload))
  } catch (err) {
    // getOrbits already degrades gracefully; this is a final safety net.
    res.status(200).send(
      JSON.stringify({
        generatedAt: new Date().toISOString(),
        source: 'unavailable',
        cacheStatus: 'fallback',
        staleReason: String(err?.message || err),
        missions: [],
        unavailable: [],
      }),
    )
  }
}
