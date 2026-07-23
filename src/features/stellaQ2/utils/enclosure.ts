import {
  ENCLOSURE_REQUIRED_PART_IDS,
  ENCLOSURE_SLOT_BY_ID,
  ENCLOSURE_SLOT_BY_PART_ID,
  ENCLOSURE_STAGING_TRANSFORMS,
  TOP_HOUSING_DIMENSIONS_MM,
} from '../data/enclosure'
import { CONNECTOR_BY_ID } from '../data/connectors'
import { validateConnectionGraph } from './connections'
import type {
  CableConnectionState,
  ComponentPlacement,
  EnclosurePartId,
  EnclosurePlacement,
  EnclosureValidationStatus,
} from '../types'

export interface EnclosureValidationResult {
  status: EnclosureValidationStatus
  messages: string[]
  placedPartIds: EnclosurePartId[]
}

const normalise = (angle: number) => ((angle % 360) + 360) % 360
const degreesClose = (actual: number, expected: number, tolerance: number) => {
  const diff = Math.abs(normalise(actual) - normalise(expected))
  return Math.min(diff, 360 - diff) <= tolerance
}
const distance = (a: readonly number[], b: readonly number[]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])

export function isEnclosurePartId(value: string | null): value is EnclosurePartId {
  return Boolean(value && ENCLOSURE_REQUIRED_PART_IDS.includes(value as EnclosurePartId))
}

export function createInitialEnclosurePlacements(): EnclosurePlacement[] {
  return ENCLOSURE_REQUIRED_PART_IDS.map((partId) => ({
    partId,
    slotId: null,
    positionMm: ENCLOSURE_STAGING_TRANSFORMS[partId].positionMm,
    rotation: ENCLOSURE_STAGING_TRANSFORMS[partId].rotation,
    seated: false,
  }))
}

export function isValidEnclosurePlacement(value: unknown): value is EnclosurePlacement {
  if (!value || typeof value !== 'object') return false
  const placement = value as Partial<EnclosurePlacement>
  return isEnclosurePartId(placement.partId ?? null)
    && (placement.slotId === null || (typeof placement.slotId === 'string' && ENCLOSURE_SLOT_BY_ID.has(placement.slotId)))
    && Array.isArray(placement.positionMm) && placement.positionMm.length === 3 && placement.positionMm.every((value) => typeof value === 'number' && Number.isFinite(value))
    && Array.isArray(placement.rotation) && placement.rotation.length === 3 && placement.rotation.every((value) => typeof value === 'number' && Number.isFinite(value))
    && typeof placement.seated === 'boolean'
}

export function stagingPlacementFor(partId: EnclosurePartId): EnclosurePlacement {
  const staging = ENCLOSURE_STAGING_TRANSFORMS[partId]
  return { partId, slotId: null, positionMm: staging.positionMm, rotation: staging.rotation, seated: false }
}

export function placementFitsHousing(placement: EnclosurePlacement) {
  const [width, length] = TOP_HOUSING_DIMENSIONS_MM
  const [x, y, z] = placement.positionMm
  // An explicit conservative interior envelope. A placement outside it would
  // cross a permanent side/end wall of the supplied top housing.
  return Math.abs(x) <= width / 2 - 3 && Math.abs(y) <= length / 2 - 3 && z >= 4 && z <= 18
}

function correctOrientation(placement: EnclosurePlacement) {
  const slot = placement.slotId ? ENCLOSURE_SLOT_BY_ID.get(placement.slotId) : undefined
  if (!slot) return false
  return degreesClose(placement.rotation[0], slot.rotation[0], slot.rotationToleranceDegrees)
    && degreesClose(placement.rotation[1], slot.rotation[1], slot.rotationToleranceDegrees)
    && degreesClose(placement.rotation[2], slot.rotation[2], slot.rotationToleranceDegrees)
}

function correctPosition(placement: EnclosurePlacement) {
  const slot = placement.slotId ? ENCLOSURE_SLOT_BY_ID.get(placement.slotId) : undefined
  return Boolean(slot && distance(placement.positionMm, slot.positionMm) <= slot.positionToleranceMm)
}

function componentPosition(placements: EnclosurePlacement[], partId: EnclosurePartId) {
  return placements.find((placement) => placement.partId === partId)?.positionMm
    ?? ENCLOSURE_STAGING_TRANSFORMS[partId].positionMm
}

export function connectorWorldPosition(placements: EnclosurePlacement[], connectorId: string): readonly [number, number, number] | null {
  const connector = CONNECTOR_BY_ID.get(connectorId)
  if (!connector) return null
  // Connectors are defined only for the seven movable Step 7 boards and
  // power items; the CR1220 has no cable connector.
  if (!isEnclosurePartId(connector.partId)) return null
  const base = componentPosition(placements, connector.partId)
  const slot = ENCLOSURE_SLOT_BY_PART_ID.get(connector.partId)
  const width = slot?.footprintMm[0] ?? 20
  const height = slot?.footprintMm[1] ?? 20
  return [
    base[0] + (connector.normalizedX - 0.5) * width,
    base[1] + (0.5 - connector.normalizedY) * height,
    base[2] + 3,
  ]
}

export function cableReachIsPlausible(placements: EnclosurePlacement[], connections: CableConnectionState[]) {
  return connections.every((connection) => {
    if (!connection.endpointA || !connection.endpointB) return false
    const a = connectorWorldPosition(placements, connection.endpointA)
    const b = connectorWorldPosition(placements, connection.endpointB)
    if (!a || !b) return false
    // Qwiic leads are documented at 100 mm. 130 mm permits the loose Step 7
    // temporary curves. Power leads are visibly longer in Build 3.
    return distance(a, b) <= (connection.kind === 'qwiic' ? 130 : 165)
  })
}

export function enclosureStlLoadFailureMessage() {
  return 'The supplied top-housing STL could not be loaded. Check the source asset and retry the workspace.'
}

export function validateEnclosure(
  layoutPlacements: ComponentPlacement[],
  connections: CableConnectionState[],
  coinCellInstalled: boolean,
  placements: EnclosurePlacement[],
  microSdInstalled: boolean,
): EnclosureValidationResult {
  const graph = validateConnectionGraph(layoutPlacements, connections, coinCellInstalled)
  if (graph.status !== 'valid') {
    return { status: 'connections-incomplete', messages: ['Step 7 is locked until the documented Step 6 cable graph and positive-side-up CR1220 are valid.'], placedPartIds: [] }
  }

  const messages: string[] = []
  const placedPartIds: EnclosurePartId[] = []
  const occupied = new Map<string, EnclosurePartId>()

  // Evaluate double occupancy independently of whether one of the occupants
  // is also the wrong part. This produces a useful physical failure instead
  // of masking the collision behind whichever component is inspected first.
  for (const placement of placements) {
    if (!placement.slotId) continue
    if (occupied.has(placement.slotId)) {
      return { status: 'slot-occupied', messages: [`${ENCLOSURE_SLOT_BY_ID.get(placement.slotId)?.label ?? placement.slotId} contains more than one component.`], placedPartIds: [] }
    }
    occupied.set(placement.slotId, placement.partId)
  }
  occupied.clear()

  for (const partId of ENCLOSURE_REQUIRED_PART_IDS) {
    const placement = placements.find((candidate) => candidate.partId === partId)
    const target = ENCLOSURE_SLOT_BY_PART_ID.get(partId)!
    if (!placement || !placement.slotId) {
      messages.push(`${target.label} is not occupied.`)
      continue
    }
    if (placement.slotId !== target.id) {
      messages.push(`${partId} is in the wrong housing slot.`)
      continue
    }
    if (occupied.has(placement.slotId)) {
      messages.push(`${target.label} contains more than one component.`)
      continue
    }
    occupied.set(placement.slotId, partId)
    if (!placementFitsHousing(placement)) {
      messages.push(`${target.label} intersects a permanent top-housing wall.`)
      continue
    }
    if (!correctOrientation(placement)) {
      messages.push(`${target.label} is rotated or face-down relative to the Build 3 orientation.`)
      continue
    }
    if (!placement.seated || !correctPosition(placement)) {
      messages.push(`${target.label} is above the correct slot but is not fully seated.`)
      continue
    }
    placedPartIds.push(partId)
  }

  if (!microSdInstalled || !placedPartIds.includes('micro-sd-card')) {
    messages.push('Insert the source-visible microSD card into the RP2040 integrated reader.')
  }
  if (!cableReachIsPlausible(placements, connections)) {
    messages.push('At least one connected cable is stretched beyond the documented temporary Step 7 reach.')
  }

  if (!messages.length) {
    return {
      status: 'valid',
      messages: ['All connected components are correctly seated. Retainer clips are reserved for Step 8 and final cable routing remains for Step 9.'],
      placedPartIds,
    }
  }

  const status: EnclosureValidationStatus = messages.some((message) => /wrong housing slot/.test(message))
    ? 'wrong-slot'
    : messages.some((message) => /rotated|face-down/.test(message))
      ? 'wrong-orientation'
      : messages.some((message) => /not fully seated/.test(message))
        ? 'not-seated'
        : messages.some((message) => /more than one/.test(message))
          ? 'slot-occupied'
          : messages.some((message) => /intersects/.test(message))
            ? 'housing-collision'
            : messages.some((message) => /stretched/.test(message))
              ? 'cable-stretched'
              : messages.some((message) => /microSD/.test(message))
                ? 'micro-sd-missing'
                : 'incomplete'
  return { status, messages, placedPartIds }
}
