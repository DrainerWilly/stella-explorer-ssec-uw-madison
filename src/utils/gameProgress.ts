// Mission-patch progress for the Games arcade, persisted in localStorage.
//
// Each game awards 0-3 stars based on the share of points earned. A game with
// at least 1 star counts as a "collected" mission patch in the sticker book.
// Everything degrades gracefully when storage is unavailable (private mode).

const STORAGE_KEY = 'ssec-game-progress-v1'

export interface GameRecord {
  /** Best score ever achieved. */
  bestScore: number
  /** The total that best score was out of. */
  bestTotal: number
  /** Best star rating earned (0-3). */
  stars: number
  /** How many times the game has been finished. */
  plays: number
}

export type ProgressMap = Record<string, GameRecord>

export interface RecordOutcome {
  stars: number
  /** True when this play improved the saved star rating. */
  newBest: boolean
  /** True when this play earned the patch for the first time (0 -> 1+ stars). */
  firstPatch: boolean
}

/** Star rating for a score share. Mirrors the medal copy in GameResults. */
export function starsFor(score: number, total: number): number {
  const pct = total > 0 ? score / total : 0
  if (pct >= 0.9) return 3
  if (pct >= 0.6) return 2
  if (pct >= 0.3) return 1
  return 0
}

export function loadProgress(): ProgressMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    return typeof parsed === 'object' && parsed !== null ? (parsed as ProgressMap) : {}
  } catch {
    return {}
  }
}

function saveProgress(map: ProgressMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    /* storage unavailable: session-only play still works */
  }
}

/** Record a finished game and report whether anything new was earned. */
export function recordResult(gameId: string, score: number, total: number): RecordOutcome {
  const map = loadProgress()
  const prev = map[gameId]
  const stars = starsFor(score, total)

  const record: GameRecord = {
    bestScore: Math.max(prev?.bestScore ?? 0, score),
    bestTotal: prev && prev.bestScore >= score ? prev.bestTotal : total,
    stars: Math.max(prev?.stars ?? 0, stars),
    plays: (prev?.plays ?? 0) + 1,
  }
  map[gameId] = record
  saveProgress(map)

  return {
    stars,
    newBest: stars > (prev?.stars ?? 0),
    firstPatch: (prev?.stars ?? 0) === 0 && stars > 0,
  }
}

/** Number of games with at least one star (patches collected). */
export function patchCount(map: ProgressMap, gameIds: string[]): number {
  return gameIds.filter((id) => (map[id]?.stars ?? 0) > 0).length
}
