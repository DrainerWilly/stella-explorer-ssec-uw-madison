// Vite plugin that serves GET /api/orbits during local development and
// `vite preview`, using the SAME shared orbit service as the Vercel function.
// This is why `npm run dev` needs no separate backend terminal.

import { getOrbits } from './orbitService.js'

function sendJson(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  // Let the orbit service own freshness locally; don't let the dev server cache.
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(payload))
}

export function orbitApiPlugin() {
  const attach = (server) => {
    // Mounting at the exact path means only /api/orbits(/…) reaches this handler.
    server.middlewares.use('/api/orbits', async (req, res) => {
      try {
        const payload = await getOrbits()
        sendJson(res, 200, payload)
      } catch (err) {
        sendJson(res, 500, {
          error: 'orbit_service_error',
          message: String(err?.message || err),
        })
      }
    })
  }

  return {
    name: 'mission-control-orbit-api',
    configureServer(server) {
      attach(server)
    },
    configurePreviewServer(server) {
      attach(server)
    },
  }
}
