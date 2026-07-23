import {
  LAYOUT_TARGET_BY_ID,
  LAYOUT_TARGET_BY_PART_ID,
  STEP_FIVE_PART_IDS,
} from '../data/componentLayout'
import type {
  ComponentPlacement,
  LayoutPartId,
  LayoutValidationStatus,
} from '../types'

export interface LayoutValidationResult {
  status: LayoutValidationStatus
  messages: string[]
  correctPartIds: LayoutPartId[]
}

const angleDistance = (a: number, b: number) => {
  const difference = ((a - b + 540) % 360) - 180
  return Math.abs(difference)
}

export function findLayoutSnapTarget(
  partId: LayoutPartId,
  x: number,
  y: number,
  rotation: number,
  placements: ComponentPlacement[],
) {
  const target = LAYOUT_TARGET_BY_PART_ID.get(partId)
  if (!target) return null
  const occupiedByOtherPart = placements.some(
    (placement) => placement.targetId === target.id && placement.partId !== partId,
  )
  if (occupiedByOtherPart) return null
  const distance = Math.hypot(x - target.x, y - target.y)
  return distance <= target.positionTolerance && angleDistance(rotation, target.rotation) <= target.rotationTolerance
    ? target
    : null
}

export function validateLayout(placements: ComponentPlacement[]): LayoutValidationResult {
  const messages: string[] = []
  const correctPartIds: LayoutPartId[] = []
  const byPart = new Map(placements.map((placement) => [placement.partId, placement]))
  const byTarget = new Map<string, ComponentPlacement[]>()

  for (const placement of placements) {
    if (placement.targetId) {
      const entries = byTarget.get(placement.targetId) ?? []
      entries.push(placement)
      byTarget.set(placement.targetId, entries)
    }
  }

  for (const [targetId, entries] of byTarget) {
    if (entries.length > 1) {
      messages.push(`More than one component occupies the ${LAYOUT_TARGET_BY_ID.get(targetId)?.label ?? 'same'} target.`)
    }
  }

  for (const partId of STEP_FIVE_PART_IDS) {
    const placement = byPart.get(partId)
    const target = LAYOUT_TARGET_BY_PART_ID.get(partId)!
    if (!placement) {
      messages.push(`${target.label} has not been placed.`)
      continue
    }
    if (placement.targetId !== target.id || !placement.snapped) {
      const actualTarget = placement.targetId ? LAYOUT_TARGET_BY_ID.get(placement.targetId) : undefined
      messages.push(
        actualTarget
          ? `${target.label} is over the ${actualTarget.label} outline.`
          : `${target.label} is not snapped to its documented outline.`,
      )
      continue
    }
    if (angleDistance(placement.rotation, target.rotation) > target.rotationTolerance) {
      messages.push(`Rotate ${target.label} so it matches the reference orientation.`)
      continue
    }
    if (partId === 'cr1220' && placement.face !== 'positive-up') {
      messages.push('The CR1220 is in the correct loose location, but its positive face is down.')
      continue
    }
    correctPartIds.push(partId)
  }

  if (!messages.length && correctPartIds.length === STEP_FIVE_PART_IDS.length) {
    return {
      status: 'valid',
      messages: ['All eight Step 5 components are correctly laid out. The CR1220 remains loose with its positive face visible.'],
      correctPartIds,
    }
  }

  const status: LayoutValidationStatus = messages.some((message) => /positive face is down/i.test(message))
    ? 'coin-face-down'
    : messages.some((message) => /Rotate/i.test(message))
      ? 'wrong-orientation'
      : messages.some((message) => /More than one/i.test(message))
        ? 'target-occupied'
        : messages.some((message) => /is over the/i.test(message))
          ? 'wrong-part'
          : 'incomplete'

  return { status, messages, correctPartIds }
}

export function isLayoutPartId(value: string | null): value is LayoutPartId {
  return Boolean(value && STEP_FIVE_PART_IDS.includes(value as LayoutPartId))
}

export function isValidNormalizedPlacement(placement: ComponentPlacement) {
  return isLayoutPartId(placement.partId)
    && placement.x >= 0 && placement.x <= 1
    && placement.y >= 0 && placement.y <= 1
    && Number.isFinite(placement.rotation)
    && (placement.targetId === null || LAYOUT_TARGET_BY_ID.has(placement.targetId))
    && (placement.face === null || placement.face === 'positive-up' || placement.face === 'negative-up')
    && typeof placement.snapped === 'boolean'
}
