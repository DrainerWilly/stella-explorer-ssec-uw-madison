// @ts-nocheck
import { useCallback, useEffect, useRef, useState } from 'react'

const MIN_LOADING_MS = 2500

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

async function keepLoadingVisible(startedAt, enabled) {
  if (!enabled) return
  const remaining = MIN_LOADING_MS - (Date.now() - startedAt)
  if (remaining > 0) await wait(remaining)
}

// Fetches modeled orbital elements from THIS project's internal API only.
// The browser never talks to external TLE providers directly: it always calls /api/orbits.
export default function useOrbitData() {
  const [state, setState] = useState({ status: 'loading', data: null, error: null })
  const mounted = useRef(true)
  const hasData = useRef(false)
  const requestId = useRef(0)

  const load = useCallback(async ({ refresh = false } = {}) => {
    const id = requestId.current + 1
    requestId.current = id
    const startedAt = Date.now()
    const shouldHoldLoading = !hasData.current

    setState((s) => ({
      status: s.data ? 'refreshing' : 'loading',
      data: s.data,
      error: null,
    }))
    try {
      const res = await fetch(refresh ? '/api/orbits?refresh=1' : '/api/orbits', {
        headers: { Accept: 'application/json' },
      })
      let data = null
      try {
        data = await res.json()
      } catch {
        // Keep the HTTP status error below if the body is not JSON.
      }
      if (!res.ok) {
        const detail = data?.message || data?.error
        throw new Error(
          detail ? `Orbit API returned HTTP ${res.status}: ${detail}` : `Orbit API returned HTTP ${res.status}`,
        )
      }
      if (data?.error) throw new Error(data.message || 'Orbit service error')
      if (!Array.isArray(data?.missions)) throw new Error('Malformed orbit response')
      await keepLoadingVisible(startedAt, shouldHoldLoading)
      if (!mounted.current || requestId.current !== id) return
      hasData.current = true
      setState({ status: 'ready', data, error: null })
    } catch (err) {
      await keepLoadingVisible(startedAt, shouldHoldLoading)
      if (!mounted.current || requestId.current !== id) return
      setState({ status: 'error', data: null, error: String(err?.message || err) })
    }
  }, [])

  useEffect(() => {
    mounted.current = true
    load()
    return () => {
      mounted.current = false
    }
  }, [load])

  return {
    status: state.status,
    data: state.data,
    error: state.error,
    refetch: () => load({ refresh: true }),
  }
}
