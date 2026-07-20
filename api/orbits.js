// Vercel-compatible Node.js Function for GET /api/orbits.
//
// It reuses the SAME shared orbit service used by local development, and adds
// strict freshness headers so the tracker does not serve stale orbital data.
//
// This file is Vercel-ready but is NOT deployed as part of this change.

import { getOrbits } from '../server/orbitService.js'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Content-Type', 'application/json; charset=utf-8')

  try {
    const payload = await getOrbits()
    res.status(200).send(JSON.stringify(payload))
  } catch (err) {
    res.status(503).send(
      JSON.stringify({
        error: 'orbit_service_unavailable',
        message: String(err?.message || err),
      }),
    )
  }
}
