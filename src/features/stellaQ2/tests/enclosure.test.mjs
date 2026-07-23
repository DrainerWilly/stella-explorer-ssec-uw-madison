import assert from 'node:assert/strict'
import test from 'node:test'

import { ENCLOSURE_REQUIRED_PART_IDS, ENCLOSURE_SLOT_BY_PART_ID, ENCLOSURE_SLOTS } from '../data/enclosure.ts'
import { LAYOUT_TARGET_BY_PART_ID, STEP_FIVE_PART_IDS } from '../data/componentLayout.ts'
import { REQUIRED_CONNECTIONS } from '../data/connectors.ts'
import { INITIAL_LAB_STATE, labReducer, validatePersistedState } from '../state/labMachine.ts'
import { createInitialStep6Connections } from '../utils/connections.ts'
import { cableReachIsPlausible, createInitialEnclosurePlacements, enclosureStlLoadFailureMessage, validateEnclosure } from '../utils/enclosure.ts'

function validLayout() {
  return STEP_FIVE_PART_IDS.map((partId) => {
    const target = LAYOUT_TARGET_BY_PART_ID.get(partId)
    return { partId, targetId: target.id, x: target.x, y: target.y, rotation: target.rotation, face: partId === 'cr1220' ? 'positive-up' : null, snapped: true }
  })
}

function fullyConnected() {
  const connections = createInitialStep6Connections()
  for (const required of REQUIRED_CONNECTIONS) {
    const index = connections.findIndex((connection) => connection.kind === required.kind && (connection.kind === 'qwiic' ? !connection.endpointA : connection.cableId === required.id))
    connections[index] = { ...connections[index], endpointA: required.endpointA, endpointB: required.endpointB }
  }
  return connections
}

function seatedPlacements() {
  return ENCLOSURE_REQUIRED_PART_IDS.map((partId) => {
    const slot = ENCLOSURE_SLOT_BY_PART_ID.get(partId)
    return { partId, slotId: slot.id, positionMm: slot.positionMm, rotation: slot.rotation, seated: true }
  })
}

test('Phase 2D defines stable unique source-backed slots for every documented Step 7 component', () => {
  assert.equal(new Set(ENCLOSURE_SLOTS.map((slot) => slot.id)).size, ENCLOSURE_SLOTS.length)
  assert.equal(new Set(ENCLOSURE_SLOTS.map((slot) => slot.acceptedPartId)).size, ENCLOSURE_SLOTS.length)
  assert.deepEqual([...ENCLOSURE_SLOT_BY_PART_ID.keys()].sort(), [...ENCLOSURE_REQUIRED_PART_IDS].sort())
  assert.equal(ENCLOSURE_SLOT_BY_PART_ID.get('micro-sd-card')?.id, 'micro-sd-reader')
  assert.match(enclosureStlLoadFailureMessage(), /top-housing STL could not be loaded/i)
})

test('Step 7 validation checks source slots, orientation, depth, occupancy, cables, and microSD state', () => {
  const layout = validLayout(); const connections = fullyConnected(); const valid = seatedPlacements()
  assert.equal(validateEnclosure(layout, connections, true, valid, true).status, 'valid')

  const wrongSlot = structuredClone(valid); wrongSlot[0].slotId = 'oled-bay'; wrongSlot.find((placement) => placement.partId === 'oled-display').slotId = null
  assert.equal(validateEnclosure(layout, connections, true, wrongSlot, true).status, 'wrong-slot')
  const wrongOrientation = structuredClone(valid); wrongOrientation[0].rotation = [0, 0, 90]
  assert.equal(validateEnclosure(layout, connections, true, wrongOrientation, true).status, 'wrong-orientation')
  const unseated = structuredClone(valid); unseated[0].seated = false
  assert.equal(validateEnclosure(layout, connections, true, unseated, true).status, 'not-seated')
  const duplicate = structuredClone(valid); duplicate[1].slotId = duplicate[0].slotId
  assert.equal(validateEnclosure(layout, connections, true, duplicate, true).status, 'slot-occupied')
  const collision = structuredClone(valid); collision[0].positionMm = [90, 90, 20]
  assert.equal(validateEnclosure(layout, connections, true, collision, true).status, 'housing-collision')
  const disconnected = structuredClone(connections); disconnected[0].endpointA = null
  assert.equal(validateEnclosure(layout, disconnected, true, valid, true).status, 'connections-incomplete')
  const stretched = structuredClone(valid); stretched.find((placement) => placement.partId === 'i2c-button').positionMm = [0, -175, 8]
  assert.equal(cableReachIsPlausible(stretched, connections), false)
  assert.equal(validateEnclosure(layout, connections, true, valid, false).status, 'micro-sd-missing')
})

test('Step 7 reducer preserves Step 6 state while supporting placement, undo, redo, reset, and Phase 2C migration', () => {
  let state = { ...structuredClone(INITIAL_LAB_STATE), layoutPlacements: validLayout(), step6Connections: fullyConnected(), coinCellInstalled: true, completedBuildStepIds: ['parts-layout', 'cable-connections'] }
  const triad = ENCLOSURE_SLOT_BY_PART_ID.get('triad-spectral-sensor')
  state = labReducer(state, { type: 'PLACE_ENCLOSURE_COMPONENT', placement: { partId: 'triad-spectral-sensor', slotId: triad.id, positionMm: triad.positionMm, rotation: triad.rotation, seated: true } })
  assert.equal(state.enclosurePlacements.find((placement) => placement.partId === 'triad-spectral-sensor').seated, true)
  assert.equal(state.step6Connections.every((connection) => connection.endpointA && connection.endpointB), true)
  state = labReducer(state, { type: 'UNDO_ENCLOSURE' })
  assert.equal(state.enclosurePlacements.find((placement) => placement.partId === 'triad-spectral-sensor').seated, false)
  state = labReducer(state, { type: 'REDO_ENCLOSURE' })
  assert.equal(state.enclosurePlacements.find((placement) => placement.partId === 'triad-spectral-sensor').seated, true)
  state = labReducer(state, { type: 'RESET_ENCLOSURE' })
  assert.equal(state.enclosurePlacements.every((placement) => !placement.seated), true)
  assert.equal(state.step6Connections.every((connection) => connection.endpointA && connection.endpointB), true)

  const phase2c = { ...INITIAL_LAB_STATE, version: 4 }
  const migrated = validatePersistedState(phase2c)
  assert.equal(migrated?.version, 6)
  assert.equal(migrated?.enclosurePlacements.length, createInitialEnclosurePlacements().length)
  assert.deepEqual(validatePersistedState(structuredClone(INITIAL_LAB_STATE)), INITIAL_LAB_STATE)
})
