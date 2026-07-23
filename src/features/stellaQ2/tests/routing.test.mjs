import test from 'node:test'
import assert from 'node:assert/strict'
import { LAYOUT_TARGET_BY_PART_ID, STEP_FIVE_PART_IDS } from '../data/componentLayout.ts'
import { ENCLOSURE_SLOTS } from '../data/enclosure.ts'
import { REQUIRED_CONNECTIONS } from '../data/connectors.ts'
import { ROUTE_TEMPLATES, ROUTING_REGIONS } from '../data/routing.ts'
import { RETAINERS } from '../data/retainers.ts'
import { INITIAL_LAB_STATE, labReducer, validatePersistedState } from '../state/labMachine.ts'
import { createInitialStep6Connections } from '../utils/connections.ts'
import { retainerInstallationFor } from '../utils/retainers.ts'
import { ROUTING_CABLE_IDS, createLooseCableRoutes, suggestedRouteFor, validateCableRoute, validateRoutingStep } from '../utils/routing.ts'

function completeFixture() {
  const layoutPlacements = STEP_FIVE_PART_IDS.map((partId) => { const target = LAYOUT_TARGET_BY_PART_ID.get(partId); return { partId, targetId: target.id, x: target.x, y: target.y, rotation: target.rotation, face: partId === 'cr1220' ? 'positive-up' : null, snapped: true } })
  const step6Connections = createInitialStep6Connections()
  let qwiicIndex = 0
  for (const required of REQUIRED_CONNECTIONS) {
    const index = required.kind === 'qwiic' ? qwiicIndex++ : step6Connections.findIndex((item) => item.cableId === required.id)
    step6Connections[index] = { ...step6Connections[index], endpointA: required.endpointA, endpointB: required.endpointB }
  }
  const enclosurePlacements = ENCLOSURE_SLOTS.map((slot) => ({ partId: slot.acceptedPartId, slotId: slot.id, positionMm: slot.positionMm, rotation: slot.rotation, seated: true }))
  const retainerInstallations = RETAINERS.map((item) => retainerInstallationFor(item.id))
  const cableRoutes = step6Connections.map((connection) => ({ ...suggestedRouteFor(connection, enclosurePlacements), status: 'routed' }))
  return { ...INITIAL_LAB_STATE, layoutPlacements, step6Connections, coinCellInstalled: true, enclosurePlacements, microSdInstalled: true, retainerInstallations, cableRoutes, completedBuildStepIds: ['remove-scaffolding','parts-layout','cable-connections','enclosure-placement','retainer-clips'] }
}

test('Phase 2F models every unique central cable and the source-backed cover regions', () => {
  assert.equal(ROUTING_CABLE_IDS.length, 6)
  assert.equal(new Set(ROUTING_CABLE_IDS).size, 6)
  assert.equal(ROUTE_TEMPLATES.length, 6)
  assert.ok(ROUTING_REGIONS.some((region) => region.type === 'cover-contact'))
  assert.ok(ROUTING_REGIONS.some((region) => region.type === 'latch'))
})

test('suggested routes preserve endpoints and complete valid Step 9 routing', () => {
  const fixture = completeFixture()
  const result = validateRoutingStep({ layout: fixture.layoutPlacements, connections: fixture.step6Connections, coinInstalled: true, placements: fixture.enclosurePlacements, microSdInstalled: true, retainers: fixture.retainerInstallations, blockedRetainers: [], routes: fixture.cableRoutes })
  assert.equal(result.status, 'valid', result.messages.join(' '))
  assert.equal(result.validCableIds.length, 6)
  fixture.cableRoutes.forEach((route) => { const connection = fixture.step6Connections.find((item) => item.cableId === route.cableId); assert.equal(route.endpointA, connection.endpointA); assert.equal(route.endpointB, connection.endpointB) })
})

test('routing validation rejects missing, changed, excessive, taut, wall, cover, latch, component, retainer, and pinch states', () => {
  const fixture = completeFixture()
  const connection = fixture.step6Connections[0]
  const base = fixture.cableRoutes[0]
  const check = (route) => validateCableRoute(route, connection, fixture.enclosurePlacements, fixture.retainerInstallations, [])
  assert.equal(check({ ...base, status: 'loose', controlPointsMm: [] }).status, 'missing-route')
  assert.equal(check({ ...base, endpointA: 'wrong' }).status, 'endpoint-changed')
  assert.equal(check({ ...base, controlPointsMm: [[0, 500, 20]], corridorIds: [] }).status, 'too-long')
  const a = fixture.enclosurePlacements.find((item) => item.partId === 'thing-plus-rp2040').positionMm
  const b = fixture.enclosurePlacements.find((item) => item.partId === 'i2c-button').positionMm
  assert.equal(check({ ...base, controlPointsMm: [[(a[0]+b[0])/2,(a[1]+b[1])/2,11]], corridorIds: ['mid-right-service'] }).status, 'too-taut')
  assert.ok(['housing-collision','cover-contact'].includes(check({ ...base, controlPointsMm: [[31,-40,20]], corridorIds: ['mid-right-service'] }).status))
  assert.equal(check({ ...base, controlPointsMm: [[30,-40,20]], corridorIds: ['mid-right-service'] }).status, 'cover-contact')
  const power = fixture.cableRoutes.find((route) => route.cableId === 'power-switch-rp2040')
  const powerConnection = fixture.step6Connections.find((item) => item.cableId === power.cableId)
  assert.equal(validateCableRoute({ ...power, controlPointsMm: [[28,-62,20]], corridorIds: ['mid-right-service'] }, powerConnection, fixture.enclosurePlacements, fixture.retainerInstallations, []).status, 'latch-collision')
  assert.equal(check({ ...base, controlPointsMm: [[0,-40,10],[20,-43,19]], corridorIds: ['mid-right-service'] }).status, 'component-collision')
  assert.equal(validateCableRoute({ ...power, controlPointsMm: [[0,10,15.5]], corridorIds: ['mid-right-service'] }, powerConnection, fixture.enclosurePlacements, fixture.retainerInstallations, []).status, 'retainer-collision')
  assert.equal(validateCableRoute(base, connection, fixture.enclosurePlacements, fixture.retainerInstallations, ['processor-retainer']).status, 'cable-pinched')
})

test('routing reducer supports undo, redo, selected reset, full reset, completion and v6 migration without changing earlier state', () => {
  const fixture = completeFixture()
  const beforeConnections = fixture.step6Connections
  const beforePlacements = fixture.enclosurePlacements
  const beforeRetainers = fixture.retainerInstallations
  const edited = labReducer(fixture, { type: 'ADD_ROUTE_POINT', cableId: 'qwiic-cable-1', pointMm: [10,-30,20] })
  assert.equal(edited.cableRoutes[0].controlPointsMm.length, fixture.cableRoutes[0].controlPointsMm.length + 1)
  const undone = labReducer(edited, { type: 'UNDO_ROUTING' })
  assert.equal(undone.cableRoutes[0].controlPointsMm.length, fixture.cableRoutes[0].controlPointsMm.length)
  const redone = labReducer(undone, { type: 'REDO_ROUTING' })
  assert.equal(redone.cableRoutes[0].controlPointsMm.length, edited.cableRoutes[0].controlPointsMm.length)
  const resetSelected = labReducer(redone, { type: 'RESET_SELECTED_ROUTE', cableId: 'qwiic-cable-1' })
  assert.equal(resetSelected.cableRoutes[0].status, 'loose')
  const reset = labReducer(fixture, { type: 'RESET_ROUTING' })
  assert.ok(reset.cableRoutes.every((route) => route.status === 'loose'))
  assert.equal(reset.step6Connections, beforeConnections)
  assert.equal(reset.enclosurePlacements, beforePlacements)
  assert.equal(reset.retainerInstallations, beforeRetainers)
  const checked = labReducer(fixture, { type: 'CHECK_ROUTING' })
  assert.equal(checked.routingValidation, 'valid')
  assert.ok(checked.completedBuildStepIds.includes('wire-routing'))
  const migrated = validatePersistedState({ ...fixture, version: 6, cableRoutes: undefined })
  assert.equal(migrated?.version, 7)
  assert.ok(migrated?.completedBuildStepIds.includes('retainer-clips'))
  assert.equal(migrated?.cableRoutes.length, 6)
})

test('loose-route factory is serializable and leaves fixed connector topology untouched', () => {
  const fixture = completeFixture()
  const routes = createLooseCableRoutes(fixture.step6Connections, fixture.enclosurePlacements)
  assert.doesNotThrow(() => JSON.stringify(routes))
  assert.deepEqual(fixture.step6Connections.map((item) => [item.endpointA,item.endpointB]), routes.map((route) => [route.endpointA,route.endpointB]))
  const restored = validatePersistedState(JSON.parse(JSON.stringify(fixture)))
  assert.deepEqual(restored?.cableRoutes, fixture.cableRoutes)
  assert.deepEqual(restored?.step6Connections, fixture.step6Connections)
  assert.deepEqual(restored?.enclosurePlacements, fixture.enclosurePlacements)
  assert.deepEqual(restored?.retainerInstallations, fixture.retainerInstallations)
})
