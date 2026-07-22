import { useEffect, useReducer } from 'react'
import {
  INITIAL_LAB_STATE,
  labReducer,
  STELLA_Q2_SESSION_KEY,
  validatePersistedState,
} from './labMachine'

function loadSessionState() {
  if (typeof window === 'undefined') return INITIAL_LAB_STATE

  try {
    const saved = window.sessionStorage.getItem(STELLA_Q2_SESSION_KEY)
    if (!saved) return INITIAL_LAB_STATE
    return validatePersistedState(JSON.parse(saved)) ?? INITIAL_LAB_STATE
  } catch {
    return INITIAL_LAB_STATE
  }
}

export function useLabMachine() {
  const [state, dispatch] = useReducer(labReducer, undefined, loadSessionState)

  useEffect(() => {
    try {
      window.sessionStorage.setItem(STELLA_Q2_SESSION_KEY, JSON.stringify(state))
    } catch {
      // The simulator remains usable when storage is unavailable.
    }
  }, [state])

  return { state, dispatch }
}
