import assert from 'node:assert/strict'
import test from 'node:test'

import { CONNECTORS, QWIIC_CABLE_IDS, REQUIRED_CONNECTIONS } from '../data/connectors.ts'
import { LAYOUT_TARGET_BY_PART_ID, STEP_FIVE_PART_IDS } from '../data/componentLayout.ts'
import { INITIAL_LAB_STATE, labReducer, validatePersistedState } from '../state/labMachine.ts'
import { createInitialStep6Connections, validateConnectionGraph } from '../utils/connections.ts'

function validLayout() {
  return STEP_FIVE_PART_IDS.map((partId) => {
    const target = LAYOUT_TARGET_BY_PART_ID.get(partId)
    return { partId, targetId: target.id, x: target.x, y: target.y, rotation: target.rotation, face: partId === 'cr1220' ? 'positive-up' : null, snapped: true }
  })
}

function fullyConnected() {
  const connections = createInitialStep6Connections()
  const qwiic = REQUIRED_CONNECTIONS.filter((connection) => connection.kind === 'qwiic')
  for (let index = 0; index < qwiic.length; index += 1) {
    connections[index] = { ...connections[index], endpointA: qwiic[index].endpointA, endpointB: qwiic[index].endpointB }
  }
  for (const required of REQUIRED_CONNECTIONS.filter((connection) => connection.kind === 'power')) {
    const index = connections.findIndex((connection) => connection.cableId === required.id)
    connections[index] = { ...connections[index], endpointA: required.endpointA, endpointB: required.endpointB }
  }
  return connections
}

test('Phase 2C defines four individual Qwiic cables, unique physical connectors, and the verified Build 2 graph', () => {
  assert.equal(QWIIC_CABLE_IDS.length, 4)
  assert.equal(new Set(QWIIC_CABLE_IDS).size, 4)
  assert.equal(new Set(CONNECTORS.map((connector) => connector.id)).size, CONNECTORS.length)
  assert.equal(REQUIRED_CONNECTIONS.filter((connection) => connection.kind === 'qwiic').length, 4)
  assert.equal(REQUIRED_CONNECTIONS.filter((connection) => connection.kind === 'power').length, 2)
  assert.deepEqual(REQUIRED_CONNECTIONS.filter((connection) => connection.kind === 'qwiic').map((connection) => connection.label), ['RP2040 ↔ button', 'Button ↔ RTC', 'RTC ↔ TRIAD', 'TRIAD ↔ OLED'])
})

test('connection graph accepts the complete topology regardless of Qwiic cable identity and rejects incomplete or wrong graphs', () => {
  const good = fullyConnected()
  assert.equal(validateConnectionGraph(validLayout(), good, true).status, 'valid')
  const swappedCableOrder = [good[3], good[2], good[1], good[0], good[4], good[5]]
  assert.equal(validateConnectionGraph(validLayout(), swappedCableOrder, true).status, 'valid')

  const missing = fullyConnected(); missing[0] = { ...missing[0], endpointB: null }
  assert.notEqual(validateConnectionGraph(validLayout(), missing, true).status, 'valid')
  const wrongLink = fullyConnected(); wrongLink[0] = { ...wrongLink[0], endpointB: 'rtc-qwiic-left' }
  assert.notEqual(validateConnectionGraph(validLayout(), wrongLink, true).status, 'valid')
  const duplicatePort = fullyConnected(); duplicatePort[1] = { ...duplicatePort[1], endpointA: 'rp2040-qwiic' }
  assert.equal(validateConnectionGraph(validLayout(), duplicatePort, true).status, 'port-occupied')
  const self = fullyConnected(); self[0] = { ...self[0], endpointB: 'rp2040-qwiic' }
  assert.equal(validateConnectionGraph(validLayout(), self, true).status, 'self-connection')
  const bypass = fullyConnected(); bypass[4] = { ...bypass[4], endpointB: 'rp2040-battery' }
  assert.notEqual(validateConnectionGraph(validLayout(), bypass, true).status, 'valid')
  assert.equal(validateConnectionGraph(validLayout(), good, false).status, 'coin-not-installed')
})

test('reducer rejects incompatible or occupied connector assignments and preserves undo, redo, reset, persistence, and phase migration', () => {
  let state = structuredClone(INITIAL_LAB_STATE)
  state = { ...state, layoutPlacements: validLayout(), completedBuildStepIds: ['parts-layout'] }
  state = labReducer(state, { type: 'SELECT_CONNECTION', connectionId: 'qwiic-cable-1' })
  state = labReducer(state, { type: 'SET_CONNECTION_ENDPOINT', connectionId: 'qwiic-cable-1', endpoint: 'a', connectorId: 'rp2040-qwiic' })
  assert.equal(state.step6Connections[0].endpointA, 'rp2040-qwiic')
  state = labReducer(state, { type: 'SET_CONNECTION_ENDPOINT', connectionId: 'qwiic-cable-1', endpoint: 'b', connectorId: 'battery-lead' })
  assert.equal(state.connectionValidation, 'incompatible-connector')
  state = labReducer(state, { type: 'SET_CONNECTION_ENDPOINT', connectionId: 'qwiic-cable-2', endpoint: 'a', connectorId: 'rp2040-qwiic' })
  assert.equal(state.connectionValidation, 'port-occupied')
  state = labReducer(state, { type: 'UNDO_CONNECTIONS' })
  assert.equal(state.step6Connections[0].endpointA, null)
  state = labReducer(state, { type: 'REDO_CONNECTIONS' })
  assert.equal(state.step6Connections[0].endpointA, 'rp2040-qwiic')
  state = labReducer(state, { type: 'SET_COIN_CELL_INSTALLED', installed: true })
  assert.equal(state.coinCellInstalled, true)
  state = labReducer(state, { type: 'RESET_CONNECTIONS' })
  assert.equal(state.coinCellInstalled, false)
  assert.equal(state.step6Connections.every((connection) => !connection.endpointA && !connection.endpointB), true)

  const phase2b = { ...INITIAL_LAB_STATE, version: 3 }
  const migrated = validatePersistedState(phase2b)
  assert.equal(migrated?.version, 5)
  assert.equal(migrated?.step6Connections.length, 6)
  assert.deepEqual(validatePersistedState(structuredClone(INITIAL_LAB_STATE)), INITIAL_LAB_STATE)
})
