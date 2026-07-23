import test from 'node:test'
import assert from 'node:assert/strict'
import { RETAINERS } from '../data/retainers.ts'
import { INITIAL_LAB_STATE, labReducer } from '../state/labMachine.ts'
import { retainerInstallationFor, validateRetainers } from '../utils/retainers.ts'

test('Phase 2E maps each of the five supplied retainer STLs to one documented component', () => {
  assert.equal(RETAINERS.length, 5)
  assert.equal(new Set(RETAINERS.map((item) => item.securedComponentId)).size, 5)
  assert.ok(RETAINERS.every((item) => item.stlUrl.endsWith('.STL') && item.insertionAxis[2] === -1))
})

test('Step 8 protects the earlier enclosure state and rejects a mismatched retainer target', () => {
  const locked = validateRetainers([], [], false, INITIAL_LAB_STATE.enclosurePlacements, false, INITIAL_LAB_STATE.retainerInstallations, [])
  assert.equal(locked.status, 'enclosure-incomplete')
  const wrong = labReducer(INITIAL_LAB_STATE, { type: 'PLACE_RETAINER', installation: { ...retainerInstallationFor('clock-retainer'), targetId: 'display-retainer-target' } })
  assert.equal(wrong.retainerValidation, 'wrong-target')
  const placed = labReducer(INITIAL_LAB_STATE, { type: 'PLACE_RETAINER', installation: retainerInstallationFor('clock-retainer') })
  assert.equal(placed.enclosurePlacements, INITIAL_LAB_STATE.enclosurePlacements)
})
