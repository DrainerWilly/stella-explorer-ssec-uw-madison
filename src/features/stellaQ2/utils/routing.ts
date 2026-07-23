import { ENCLOSURE_SLOT_BY_PART_ID, TOP_HOUSING_DIMENSIONS_MM } from '../data/enclosure'
import { REQUIRED_CONNECTIONS } from '../data/connectors'
import { CONNECTOR_BY_ID } from '../data/connectors'
import { RETAINER_BY_ID, RETAINERS } from '../data/retainers'
import { MIN_SLACK_RATIO, POWER_LEAD_ALLOWANCE_MM, QWIIC_AVAILABLE_LENGTH_MM, ROUTE_LENGTH_TOLERANCE_MM, ROUTE_TEMPLATE_BY_PAIR, ROUTING_CORRIDOR_BY_ID, ROUTING_REGIONS, pairKey } from '../data/routing'
import { connectorWorldPosition } from './enclosure'
import { validateRetainers } from './retainers'
import type { CableConnectionState, CableRouteState, CableRouteValidationStatus, ComponentPlacement, EnclosurePlacement, RetainerId, RetainerInstallation, RoutingValidationStatus } from '../types'

const distance = (a: readonly number[], b: readonly number[]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
const clonePoint = (point: readonly [number, number, number]) => [point[0], point[1], point[2]] as const
const pointInBounds = (point: readonly number[], bounds: readonly [number, number, number, number, number, number]) => point[0] >= bounds[0] && point[0] <= bounds[1] && point[1] >= bounds[2] && point[1] <= bounds[3] && point[2] >= bounds[4] && point[2] <= bounds[5]

export const ROUTING_CABLE_IDS = ['qwiic-cable-1', 'qwiic-cable-2', 'qwiic-cable-3', 'qwiic-cable-4', 'power-battery-switch', 'power-switch-rp2040'] as const
export const isRoutingCableId = (value: string | null) => Boolean(value && ROUTING_CABLE_IDS.includes(value as typeof ROUTING_CABLE_IDS[number]))

export function availableCableLengthMm(connection: CableConnectionState | undefined) {
  return connection?.kind === 'qwiic' ? QWIIC_AVAILABLE_LENGTH_MM : POWER_LEAD_ALLOWANCE_MM
}

function resolvedEndpoints(connection: CableConnectionState | undefined, placements: EnclosurePlacement[]) {
  if (!connection?.endpointA || !connection.endpointB) return null
  const a = connectorWorldPosition(placements, connection.endpointA)
  const b = connectorWorldPosition(placements, connection.endpointB)
  return a && b ? { a, b } : null
}

export function createLooseCableRoutes(connections: CableConnectionState[], placements: EnclosurePlacement[]): CableRouteState[] {
  return ROUTING_CABLE_IDS.map((cableId, index) => {
    const connection = connections.find((item) => item.cableId === cableId)
    const endpoints = resolvedEndpoints(connection, placements)
    const midpoint: readonly [number, number, number] = endpoints
      ? [(endpoints.a[0] + endpoints.b[0]) / 2 + (index % 2 ? -9 : 9), (endpoints.a[1] + endpoints.b[1]) / 2, 25]
      : [0, 0, 25]
    return { cableId, endpointA: connection?.endpointA ?? null, endpointB: connection?.endpointB ?? null, controlPointsMm: endpoints ? [midpoint] : [], corridorIds: [], status: 'loose', validationStatus: 'idle', validationIssues: [] }
  })
}

export function suggestedRouteFor(connection: CableConnectionState, placements: EnclosurePlacement[]): CableRouteState {
  const template = ROUTE_TEMPLATE_BY_PAIR.get(pairKey(connection.endpointA, connection.endpointB))
  const loose = createLooseCableRoutes([connection], placements).find((route) => route.cableId === connection.cableId)
  return { cableId: connection.cableId, endpointA: connection.endpointA, endpointB: connection.endpointB, controlPointsMm: template?.controlPointsMm.map(clonePoint) ?? loose?.controlPointsMm ?? [], corridorIds: [...(template?.corridorIds ?? [])], status: 'editing', validationStatus: 'idle', validationIssues: [] }
}

export function routeWorldPoints(route: CableRouteState, connection: CableConnectionState, placements: EnclosurePlacement[]) {
  const endpoints = resolvedEndpoints(connection, placements)
  return endpoints ? [endpoints.a, ...route.controlPointsMm, endpoints.b] : []
}

export function calculateRouteLengthMm(route: CableRouteState, connection: CableConnectionState, placements: EnclosurePlacement[]) {
  const points = routeWorldPoints(route, connection, placements)
  return points.slice(1).reduce((total, point, index) => total + distance(points[index], point), 0)
}

function sampledRoute(points: readonly (readonly [number, number, number])[]) {
  const samples: Array<readonly [number, number, number]> = []
  points.slice(1).forEach((end, index) => {
    const start = points[index]
    const steps = Math.max(2, Math.ceil(distance(start, end) / 3))
    for (let step = 0; step <= steps; step += 1) {
      const t = step / steps
      samples.push([start[0] + (end[0] - start[0]) * t, start[1] + (end[1] - start[1]) * t, start[2] + (end[2] - start[2]) * t])
    }
  })
  return samples
}

function collisionIssue(samples: Array<readonly [number, number, number]>, endpoints: { a: readonly [number, number, number]; b: readonly [number, number, number] }, placements: EnclosurePlacement[], retainers: RetainerInstallation[], endpointPartIds: Array<string | undefined>) {
  const interiorSamples = samples.filter((point) => distance(point, endpoints.a) > 14 && distance(point, endpoints.b) > 14)
  const [width, length] = TOP_HOUSING_DIMENSIONS_MM
  if (interiorSamples.some((point) => Math.abs(point[0]) > width / 2 - 1 || Math.abs(point[1]) > length / 2 - 1 || point[2] < 7 || point[2] > 30)) return { status: 'housing-collision' as const, message: 'The cable exits or intersects a permanent top-housing wall.' }
  const blockedRegions = ROUTING_REGIONS.filter((item) => item.severity === 'block').sort((a, b) => Number(b.type === 'latch') - Number(a.type === 'latch'))
  for (const region of blockedRegions) {
    if (!interiorSamples.some((point) => pointInBounds(point, region.boundsMm))) continue
    return region.type === 'latch'
      ? { status: 'latch-collision' as const, message: `Move this cable away from ${region.label.toLowerCase()}.` }
      : { status: 'cover-contact' as const, message: `This cable crosses the ${region.label.toLowerCase()} needed for Step 10.` }
  }
  for (const installation of retainers.filter((item) => item.installationState === 'installed')) {
    const definition = RETAINER_BY_ID.get(installation.retainerId)
    if (!definition) continue
    // The cable necessarily leaves through the connector beside its own clip.
    // Actual under-clip pinching is represented by the explicit Phase 2E
    // clearance state, while unrelated clips remain solid collision bodies.
    if (endpointPartIds.includes(definition.securedComponentId)) continue
    const [x, y, z] = installation.positionMm; const [w, h, d] = definition.dimensionsMm
    const bounds = [x - w / 2, x + w / 2, y - h / 2, y + h / 2, z - d / 2, z + d / 2] as const
    if (interiorSamples.some((point) => pointInBounds(point, bounds))) return { status: 'retainer-collision' as const, message: `This cable passes through the ${definition.label}.` }
  }
  for (const placement of placements.filter((item) => item.seated && item.partId !== 'micro-sd-card')) {
    const slot = ENCLOSURE_SLOT_BY_PART_ID.get(placement.partId)
    if (!slot) continue
    const bounds = [placement.positionMm[0] - slot.footprintMm[0] / 2, placement.positionMm[0] + slot.footprintMm[0] / 2, placement.positionMm[1] - slot.footprintMm[1] / 2, placement.positionMm[1] + slot.footprintMm[1] / 2, 6, 13] as const
    if (interiorSamples.some((point) => pointInBounds(point, bounds))) return { status: 'component-collision' as const, message: `This route passes through the ${slot.label} component body.` }
  }
  return null
}

export function validateCableRoute(route: CableRouteState, connection: CableConnectionState | undefined, placements: EnclosurePlacement[], retainers: RetainerInstallation[], blockedRetainers: RetainerId[] = []): { status: CableRouteValidationStatus; issues: string[]; lengthMm: number; availableMm: number } {
  const availableMm = availableCableLengthMm(connection)
  if (!connection || route.endpointA !== connection.endpointA || route.endpointB !== connection.endpointB) return { status: 'endpoint-changed', issues: ['The fixed Step 6 connector assignment changed. Return to Step 6 to change electrical connections.'], lengthMm: 0, availableMm }
  const endpoints = resolvedEndpoints(connection, placements)
  if (!endpoints || route.controlPointsMm.length === 0 || route.status !== 'routed') return { status: 'missing-route', issues: ['Add at least one routing point and mark this cable ready.'], lengthMm: 0, availableMm }
  const lengthMm = calculateRouteLengthMm(route, connection, placements)
  const directMm = distance(endpoints.a, endpoints.b)
  if (lengthMm > availableMm + ROUTE_LENGTH_TOLERANCE_MM) return { status: 'too-long', issues: [`This route is about ${Math.round(lengthMm)} mm, longer than the ${availableMm} mm ${connection.kind === 'qwiic' ? 'cable' : 'visual lead allowance'}.`], lengthMm, availableMm }
  if (lengthMm < directMm * MIN_SLACK_RATIO) return { status: 'too-taut', issues: ['The connector is being pulled by an excessively short route. Add modest slack near a safe corridor.'], lengthMm, availableMm }
  const endpointParts = [connection.endpointA, connection.endpointB].map((id) => CONNECTOR_BY_ID.get(id ?? '')?.partId)
  if (blockedRetainers.some((id) => { const definition = RETAINER_BY_ID.get(id); return definition ? endpointParts.includes(definition.securedComponentId) : false })) return { status: 'cable-pinched', issues: ['This cable is trapped beneath an installed retainer.'], lengthMm, availableMm }
  const collision = collisionIssue(sampledRoute([endpoints.a, ...route.controlPointsMm, endpoints.b]), endpoints, placements, retainers, endpointParts)
  if (collision) return { status: collision.status, issues: [collision.message], lengthMm, availableMm }
  const template = ROUTE_TEMPLATE_BY_PAIR.get(pairKey(connection.endpointA, connection.endpointB))
  if (template && !template.corridorIds.some((id) => route.corridorIds.includes(id) || route.controlPointsMm.some((point) => { const corridor = ROUTING_CORRIDOR_BY_ID.get(id); return corridor ? pointInBounds(point, corridor.regionMm) : false }))) return { status: 'outside-corridor', issues: ['Guide this cable through a source-supported interior corridor; small variations from Build 4 are accepted.'], lengthMm, availableMm }
  return { status: 'valid', issues: [`${template?.label ?? connection.cableId} is safely routed with about ${Math.max(0, Math.round(availableMm - lengthMm))} mm of remaining slack.`], lengthMm, availableMm }
}

export function validateRoutingStep(args: { layout: ComponentPlacement[]; connections: CableConnectionState[]; coinInstalled: boolean; placements: EnclosurePlacement[]; microSdInstalled: boolean; retainers: RetainerInstallation[]; blockedRetainers: RetainerId[]; routes: CableRouteState[] }) {
  const prerequisite = validateRetainers(args.layout, args.connections, args.coinInstalled, args.placements, args.microSdInstalled, args.retainers, args.blockedRetainers)
  if (prerequisite.status !== 'valid') return { status: 'retainers-incomplete' as RoutingValidationStatus, messages: ['Step 9 is locked until every Step 8 retainer and its cable clearance pass validation.'], validCableIds: [] as string[] }
  const validCableIds: string[] = []; const messages: string[] = []
  let failure: RoutingValidationStatus = 'incomplete'
  for (const cableId of ROUTING_CABLE_IDS) {
    const route = args.routes.find((item) => item.cableId === cableId)
    const result = route ? validateCableRoute(route, args.connections.find((item) => item.cableId === cableId), args.placements, args.retainers, args.blockedRetainers) : { status: 'missing-route' as const, issues: ['A required cable has no route.'], lengthMm: 0, availableMm: 0 }
    if (result.status === 'valid') validCableIds.push(cableId)
    else if (failure === 'incomplete') failure = result.status === 'missing-route' ? 'incomplete' : result.status
    messages.push(...result.issues)
  }
  if (validCableIds.length === ROUTING_CABLE_IDS.length) return { status: 'valid' as RoutingValidationStatus, messages: ['All internal wiring is safely routed. Install the bottom cover in Step 10.'], validCableIds }
  return { status: failure, messages: [`${validCableIds.length} of ${ROUTING_CABLE_IDS.length} wire routes pass validation.`, ...messages], validCableIds }
}

export function isValidCableRouteState(value: unknown): value is CableRouteState {
  if (!value || typeof value !== 'object') return false
  const route = value as Partial<CableRouteState>
  return typeof route.cableId === 'string' && isRoutingCableId(route.cableId)
    && (route.endpointA === null || typeof route.endpointA === 'string') && (route.endpointB === null || typeof route.endpointB === 'string')
    && Array.isArray(route.controlPointsMm) && route.controlPointsMm.every((point) => Array.isArray(point) && point.length === 3 && point.every((coordinate) => typeof coordinate === 'number' && Number.isFinite(coordinate)))
    && Array.isArray(route.corridorIds) && route.corridorIds.every((id) => typeof id === 'string' && ROUTING_CORRIDOR_BY_ID.has(id))
    && ['loose', 'editing', 'routed'].includes(route.status ?? '')
    && ['idle','valid','missing-route','endpoint-changed','too-long','too-taut','housing-collision','component-collision','retainer-collision','cover-contact','latch-collision','cable-pinched','outside-corridor'].includes(route.validationStatus ?? '')
    && Array.isArray(route.validationIssues) && route.validationIssues.every((issue) => typeof issue === 'string')
}

export function requiredPairForRoute(route: CableRouteState) {
  return REQUIRED_CONNECTIONS.find((required) => pairKey(required.endpointA, required.endpointB) === pairKey(route.endpointA, route.endpointB))
}
