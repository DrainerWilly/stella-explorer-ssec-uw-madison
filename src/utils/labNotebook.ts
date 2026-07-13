// Light Lab notebook: remembers which animation "experiments" the visitor has
// tried, persisted in localStorage. Mirrors the games' mission-patch system but
// simpler; opening an experiment counts as trying it.

const STORAGE_KEY = 'ssec-light-lab-v1'

export function loadVisited(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

/** Mark an experiment as tried. Returns the updated list. */
export function markVisited(id: string): string[] {
  const list = loadVisited()
  if (!list.includes(id)) {
    list.push(id)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    } catch {
      /* storage unavailable: session-only */
    }
  }
  return list
}
