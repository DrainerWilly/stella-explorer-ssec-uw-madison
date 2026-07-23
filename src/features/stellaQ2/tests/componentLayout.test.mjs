import assert from 'node:assert/strict'
import test from 'node:test'

import {
  LAYOUT_TARGET_BY_PART_ID,
  LAYOUT_TARGETS,
  STEP_FIVE_PART_IDS,
} from '../data/componentLayout.ts'
import {
  INITIAL_LAB_STATE,
  labReducer,
  validatePersistedState,
} from '../state/labMachine.ts'
import { validateLayout } from '../utils/componentLayout.ts'

function documentedPlacement(partId, overrides = {}) {
  const target = LAYOUT_TARGET_BY_PART_ID.get(partId)
  return {
    partId,
    targetId: target.id,
    x: target.x,
    y: target.y,
    rotation: target.rotation,
    face: partId === 'cr1220' ? 'positive-up' : null,
    snapped: true,
    ...overrides,
  }
}

test('Phase 2B has exactly eight source-backed Step 5 targets with bounded normalized footprints', () => {
  assert.equal(STEP_FIVE_PART_IDS.length, 8)
  assert.equal(LAYOUT_TARGETS.length, 8)
  assert.equal(new Set(STEP_FIVE_PART_IDS).size, 8)
  assert.equal(new Set(LAYOUT_TARGETS.map((target) => target.id)).size, 8)
  assert.deepEqual(LAYOUT_TARGETS.map((target) => target.partId).sort(), [...STEP_FIVE_PART_IDS].sort())

  for (const target of LAYOUT_TARGETS) {
    assert.ok(target.x >= 0 && target.x <= 1, `${target.id} x is normalized`)
    assert.ok(target.y >= 0 && target.y <= 1, `${target.id} y is normalized`)
    assert.ok(target.width > 0 && target.width <= 1, `${target.id} width is normalized`)
    assert.ok(target.height > 0 && target.height <= 1, `${target.id} height is normalized`)
    assert.match(target.sourceReference, /Build 1|Flat assembly diagram/i)
  }
  assert.equal(STEP_FIVE_PART_IDS.includes('qwiic-cables'), false, 'cables remain reserved for Step 6')
})

test('layout validation distinguishes correct placement, wrong targets, orientation, coin face, and occupancy', () => {
  const correct = STEP_FIVE_PART_IDS.map((partId) => documentedPlacement(partId))
  assert.equal(validateLayout(correct).status, 'valid')

  const wrongOrientation = correct.map((placement) => placement.partId === 'triad-spectral-sensor'
    ? { ...placement, rotation: 90 }
    : placement)
  assert.equal(validateLayout(wrongOrientation).status, 'wrong-orientation')

  const wrongTarget = correct
    .filter((placement) => placement.partId !== 'pcf8523-clock')
    .map((placement) => placement.partId === 'oled-display'
      ? { ...placement, targetId: 'clock-outline', snapped: true }
      : placement)
  assert.equal(validateLayout(wrongTarget).status, 'wrong-part')

  const coinFaceDown = correct.map((placement) => placement.partId === 'cr1220'
    ? { ...placement, face: 'negative-up' }
    : placement)
  assert.equal(validateLayout(coinFaceDown).status, 'coin-face-down')

  const occupied = correct.map((placement) => placement.partId === 'oled-display'
    ? { ...placement, targetId: 'clock-outline', snapped: true }
    : placement)
  assert.equal(validateLayout(occupied).status, 'target-occupied')
})

test('Phase 2B layout supports deterministic placement, undo, redo, reset, validation, and Phase 2A migration', () => {
  let state = structuredClone(INITIAL_LAB_STATE)
  for (const partId of STEP_FIVE_PART_IDS) {
    state = labReducer(state, { type: 'PLACE_LAYOUT_PART', placement: documentedPlacement(partId) })
  }
  assert.equal(state.layoutPlacements.length, 8)
  state = labReducer(state, { type: 'CHECK_LAYOUT' })
  assert.equal(state.layoutValidation, 'valid')
  assert.equal(state.completedBuildStepIds.includes('parts-layout'), true)

  state = labReducer(state, { type: 'UNDO_LAYOUT' })
  assert.equal(state.layoutPlacements.length, 7)
  assert.equal(state.completedBuildStepIds.includes('parts-layout'), false)
  state = labReducer(state, { type: 'REDO_LAYOUT' })
  assert.equal(state.layoutPlacements.length, 8)
  state = labReducer(state, { type: 'RESET_LAYOUT' })
  assert.deepEqual(state.layoutPlacements, [])

  const phase2a = {
    ...INITIAL_LAB_STATE,
    version: 2,
  }
  const migrated = validatePersistedState(phase2a)
  assert.equal(migrated?.version, 4)
  assert.deepEqual(migrated?.layoutPlacements, [])
  assert.deepEqual(validatePersistedState(structuredClone(INITIAL_LAB_STATE)), INITIAL_LAB_STATE)
})
