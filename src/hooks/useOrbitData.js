import { useCallback, useEffect, useRef, useState } from 'react'

// Fetches modeled orbital elements from THIS project's internal API only.
// The browser never talks to CelesTrak directly — it always calls /api/orbits.
export default function useOrbitData() {
  const [state, setState] = useState({ status: 'loading', data: null, error: null })
  const mounted = useRef(true)

  const load = useCallback(async ({ refresh = false } = {}) => {
    setState((s) => ({
      status: s.data ? 'refreshing' : 'loading',
      data: s.data,
      error: null,
    }))
    try {
      const res = await fetch(refresh ? '/api/orbits?refresh=1' : '/api/orbits', {
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) throw new Error(`Orbit API returned HTTP ${res.status}`)
      const data = await res.json()
      if (data?.error) throw new Error(data.message || 'Orbit service error')
      if (!Array.isArray(data?.missions)) throw new Error('Malformed orbit response')
      if (!mounted.current) return
      setState({ status: 'ready', data, error: null })
    } catch (err) {
      if (!mounted.current) return
      // Keep any previously loaded data usable; surface the error as a warning.
      setState((s) => ({
        status: s.data ? 'ready' : 'error',
        data: s.data,
        error: String(err?.message || err),
      }))
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
