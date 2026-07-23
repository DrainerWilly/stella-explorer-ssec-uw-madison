import { ENCLOSURE_SLOT_BY_PART_ID } from '../data/enclosure'
import { COVER_INTERIOR_CLEARANCE_CEILING_MM, COVER_LATCHES, COVER_LATCH_BY_ID, BOTTOM_COVER_TARGET } from '../data/coverInstallation'
import { RETAINER_BY_ID } from '../data/retainers'
import { ROUTE_TEMPLATE_BY_PAIR, ROUTING_REGIONS, pairKey } from '../data/routing'
import { routeWorldPoints, validateRoutingStep } from './routing'
import type {
  BottomCoverState,
  CableConnectionState,
  CableRouteState,
  ComponentPlacement,
  CoverAlignmentStatus,
  CoverHistoryEntry,
  CoverLatchId,
  CoverLatchInstallation,
  CoverValidationStatus,
  EnclosurePlacement,
  RetainerId,
  RetainerInstallation,
} from '../types'

export type CoverClearanceIssueCode = 'route' | 'cover-contact' | 'latch' | 'component' | 'retainer'
export interface CoverClearanceIssue {
  code: CoverClearanceIssueCode
  message: string
  cableId?: string
  latchId?: CoverLatchId
}

const distance = (a: readonly number[], b: readonly number[]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
const pointInBounds = (point: readonly number[], bounds: readonly [number, number, number, number, number, number]) =>
  point[0] >= bounds[0] && point[0] <= bounds[1] && point[1] >= bounds[2] && point[1] <= bounds[3] && point[2] >= bounds[4] && point[2] <= bounds[5]
const rotationDelta = (a: number, b: number) => {
  const delta = Math.abs(((a - b) % 360 + 360) % 360)
  return Math.min(delta, 360 - delta)
}
const cloneCover = (cover: BottomCoverState): BottomCoverState => ({ ...cover, positionMm: [...cover.positionMm], rotation: [...cover.rotation] })

function sampledRoute(points: readonly (readonly [number, number, number])[]) {
  const samples: Array<readonly [number, number, number]> = []
  points.slice(1).forEach((end, index) => {
    const start = points[index]
    const steps = Math.max(2, Math.ceil(distance(start, end) / 2))
    for (let step = 0; step <= steps; step += 1) {
      const t = step / steps
      samples.push([
        start[0] + (end[0] - start[0]) * t,
        start[1] + (end[1] - start[1]) * t,
        start[2] + (end[2] - start[2]) * t,
      ])
    }
  })
  return samples
}

export function coverAlignmentStatus(cover: BottomCoverState): CoverAlignmentStatus {
  const target = BOTTOM_COVER_TARGET.targetRotation
  const reversed = rotationDelta(cover.rotation[0], 180) <= BOTTOM_COVER_TARGET.rotationToleranceDegrees
    && rotationDelta(cover.rotation[1], target[1]) <= BOTTOM_COVER_TARGET.rotationToleranceDegrees
    && rotationDelta(cover.rotation[2], target[2]) <= BOTTOM_COVER_TARGET.rotationToleranceDegrees
  if (reversed) return 'reversed'
  if (cover.rotation.some((angle, index) => rotationDelta(angle, target[index]) > BOTTOM_COVER_TARGET.rotationToleranceDegrees)) return 'wrong-rotation'
  const alignmentTarget = cover.state === 'fullySeated' || cover.state === 'latched'
    ? BOTTOM_COVER_TARGET.targetPositionMm
    : BOTTOM_COVER_TARGET.alignedPositionMm
  if (Math.abs(cover.positionMm[0] - alignmentTarget[0]) > BOTTOM_COVER_TARGET.alignmentToleranceMm
    || Math.abs(cover.positionMm[1] - alignmentTarget[1]) > BOTTOM_COVER_TARGET.alignmentToleranceMm) return 'offset'
  return 'aligned'
}

export function validateCoverClearance(args: {
  layout: ComponentPlacement[]
  connections: CableConnectionState[]
  coinInstalled: boolean
  placements: EnclosurePlacement[]
  microSdInstalled: boolean
  retainers: RetainerInstallation[]
  blockedRetainers: RetainerId[]
  routes: CableRouteState[]
}) {
  const issues: CoverClearanceIssue[] = []

  // Check the physical cover volume independently of the Step 9 prerequisite.
  // This keeps a corrupt or migrated placement diagnosable instead of masking
  // the actual cover collision behind a generic routing failure.
  for (const placement of args.placements.filter((item) => item.seated)) {
    const slot = ENCLOSURE_SLOT_BY_PART_ID.get(placement.partId)
    if (!slot) continue
    if (placement.positionMm[2] + slot.thicknessMm / 2 > COVER_INTERIOR_CLEARANCE_CEILING_MM) {
      issues.push({ code: 'component', message: `${slot.label} extends into the bottom cover's interior clearance volume.` })
    }
  }
  for (const installation of args.retainers.filter((item) => item.installationState === 'installed')) {
    const retainer = RETAINER_BY_ID.get(installation.retainerId)
    if (!retainer) continue
    if (installation.positionMm[2] + retainer.dimensionsMm[2] / 2 > COVER_INTERIOR_CLEARANCE_CEILING_MM) {
      issues.push({ code: 'retainer', message: `${retainer.label} extends into the bottom cover's interior clearance volume.` })
    }
  }

  const contactRegions = ROUTING_REGIONS.filter((region) => region.type === 'cover-contact')
  for (const route of args.routes) {
    const connection = args.connections.find((item) => item.cableId === route.cableId)
    if (!connection) continue
    const samples = sampledRoute(routeWorldPoints(route, connection, args.placements))
    const label = ROUTE_TEMPLATE_BY_PAIR.get(pairKey(route.endpointA, route.endpointB))?.label ?? route.cableId
    const high = samples.find((point) => point[2] > COVER_INTERIOR_CLEARANCE_CEILING_MM)
    if (high) issues.push({ code: 'route', cableId: route.cableId, message: `${label} rises above the bottom cover's available interior clearance.` })
    const contact = contactRegions.find((region) => samples.some((point) => pointInBounds(point, region.boundsMm)))
    if (contact) issues.push({ code: 'cover-contact', cableId: route.cableId, message: `${label} crosses the ${contact.label.toLowerCase()}. Return to Step 9 and adjust this route.` })
    const latch = COVER_LATCHES.find((definition) => samples.some((point) => pointInBounds(point, definition.housingFeatureBoundsMm)))
    if (latch) issues.push({ code: 'latch', cableId: route.cableId, latchId: latch.id, message: `${label} occupies the ${latch.label.toLowerCase()} region.` })
  }

  const routing = validateRoutingStep(args)
  if (routing.status !== 'valid') {
    routing.messages.forEach((message) => {
      if (!issues.some((issue) => issue.message === message)) issues.push({ code: 'route', message })
    })
  }

  return { valid: routing.status === 'valid' && issues.length === 0, prerequisiteValid: routing.status === 'valid', issues }
}

export function validateBottomCoverInstallation(args: Parameters<typeof validateCoverClearance>[0] & {
  cover: BottomCoverState
  latches: CoverLatchInstallation[]
}): { status: CoverValidationStatus; messages: string[] } {
  const clearance = validateCoverClearance(args)
  if (!clearance.prerequisiteValid) return { status: 'step9-incomplete', messages: clearance.issues.map((issue) => issue.message) }
  if (!clearance.valid) return { status: 'clearance-failed', messages: clearance.issues.map((issue) => issue.message) }
  const alignment = coverAlignmentStatus(args.cover)
  if (alignment === 'reversed') return { status: 'reversed', messages: ['Turn the cover so its interior faces the electronics.'] }
  if (alignment === 'wrong-rotation') return { status: 'wrong-rotation', messages: ['Rotate the bottom cover to align all four corner latch features.'] }
  if (alignment !== 'aligned') return { status: 'not-aligned', messages: ['The bottom cover is offset from the top-housing mating perimeter.'] }
  if (args.cover.state === 'partiallySeated' || (args.cover.seatingProgress > 0 && args.cover.seatingProgress < 1)) {
    return { status: 'partially-seated', messages: ['The cover is aligned but not fully seated.'] }
  }
  if (args.cover.state !== 'fullySeated' && args.cover.state !== 'latched') return { status: 'not-seated', messages: ['Seat the cover completely before engaging its latches.'] }
  const open = COVER_LATCHES.filter((definition) => args.latches.find((item) => item.latchId === definition.id)?.state !== 'engaged')
  if (open.length) return { status: 'latches-open', messages: open.map((latch) => `${latch.label} remains open.`) }
  return { status: 'valid', messages: ['The bottom cover is fully seated and all four source-supported latches are engaged. Install the signal-lamp windows in Step 11.'] }
}

export function isCoverLatchId(value: string | null): value is CoverLatchId {
  return Boolean(value && COVER_LATCH_BY_ID.has(value as CoverLatchId))
}

export function isValidBottomCoverState(value: unknown): value is BottomCoverState {
  if (!value || typeof value !== 'object') return false
  const cover = value as Partial<BottomCoverState>
  return Array.isArray(cover.positionMm) && cover.positionMm.length === 3 && cover.positionMm.every(Number.isFinite)
    && Array.isArray(cover.rotation) && cover.rotation.length === 3 && cover.rotation.every(Number.isFinite)
    && ['staged', 'aligned', 'partiallySeated', 'fullySeated', 'latched'].includes(cover.state ?? '')
    && typeof cover.seatingProgress === 'number' && cover.seatingProgress >= 0 && cover.seatingProgress <= 1
}

export function isValidCoverLatches(value: unknown): value is CoverLatchInstallation[] {
  return Array.isArray(value) && value.length === COVER_LATCHES.length
    && value.every((item) => item && typeof item === 'object' && isCoverLatchId((item as CoverLatchInstallation).latchId)
      && ['disengaged', 'aligned', 'engaging', 'engaged'].includes((item as CoverLatchInstallation).state))
    && new Set(value.map((item) => item.latchId)).size === value.length
}

export function coverHistoryEntry(cover: BottomCoverState, latches: CoverLatchInstallation[], selectedLatchId: CoverLatchId | null, alignment: CoverAlignmentStatus, clearanceIssues: string[]): CoverHistoryEntry {
  return { cover: cloneCover(cover), latches: latches.map((item) => ({ ...item })), selectedLatchId, alignment, clearanceIssues: [...clearanceIssues] }
}

export function isValidCoverHistoryEntry(value: unknown): value is CoverHistoryEntry {
  if (!value || typeof value !== 'object') return false
  const entry = value as Partial<CoverHistoryEntry>
  return isValidBottomCoverState(entry.cover) && isValidCoverLatches(entry.latches)
    && (entry.selectedLatchId === null || isCoverLatchId(entry.selectedLatchId ?? null))
    && ['idle', 'reversed', 'wrong-rotation', 'offset', 'aligned'].includes(entry.alignment ?? '')
    && Array.isArray(entry.clearanceIssues) && entry.clearanceIssues.every((issue) => typeof issue === 'string')
}
