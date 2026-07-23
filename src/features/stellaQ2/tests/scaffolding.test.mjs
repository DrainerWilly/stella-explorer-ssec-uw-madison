import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'

import { BUILD_PHOTO_BY_ID } from '../data/buildPhotos.ts'
import {
  SCAFFOLD_TARGETS,
  SCAFFOLDING_MODELS,
  removableTargetsForEnclosurePart,
} from '../data/scaffolding.ts'
import {
  INITIAL_LAB_STATE,
  labReducer,
  validatePersistedState,
} from '../state/labMachine.ts'
import {
  missingScaffoldIds,
  scaffoldingIsComplete,
  stlLoadFailureMessage,
} from '../utils/scaffolding.ts'

const SOURCE_ROOT = join(
  process.cwd(),
  'public/assets/stella/STELLA-Q2_download_Jan2026/STELLA-Q2_download_Jan2026',
)

function removeAllFor(partId, state = structuredClone(INITIAL_LAB_STATE)) {
  return removableTargetsForEnclosurePart(partId).reduce(
    (current, target) => labReducer(current, { type: 'REMOVE_SCAFFOLD', scaffoldId: target.id }),
    state,
  )
}

test('Phase 2A uses only actual top and bottom enclosure STL files and Step 4 photographs', () => {
  assert.deepEqual(SCAFFOLDING_MODELS.map((model) => model.id), ['top-housing', 'bottom-cover'])
  assert.deepEqual(SCAFFOLDING_MODELS.map((model) => model.connectedComponentCount), [1, 1])

  for (const model of SCAFFOLDING_MODELS) {
    assert.ok(existsSync(join(SOURCE_ROOT, model.stlRelativePath)), `${model.stlRelativePath} exists`)
    assert.ok(BUILD_PHOTO_BY_ID.has(model.beforePhotoId), `${model.beforePhotoId} is an official photo`)
    assert.ok(BUILD_PHOTO_BY_ID.has(model.afterPhotoId), `${model.afterPhotoId} is an official photo`)
  }

  assert.equal(SCAFFOLD_TARGETS.filter((target) => target.kind === 'removable').length, 4)
  assert.equal(SCAFFOLD_TARGETS.filter((target) => target.kind === 'permanent').length, 2)
  assert.equal(new Set(SCAFFOLD_TARGETS.map((target) => target.id)).size, SCAFFOLD_TARGETS.length)
  for (const target of SCAFFOLD_TARGETS) {
    assert.ok(BUILD_PHOTO_BY_ID.has(target.sourcePhotoId), `${target.id} cites a supplied Step 4 photo`)
    assert.equal(target.meshComponentIndex, 0)
    assert.match(target.meshEvidence, /photo-supported hitbox|never eligible/i)
  }
})

test('removal state only accepts documented removable targets and protects permanent geometry', () => {
  const permanentTarget = SCAFFOLD_TARGETS.find((target) => target.kind === 'permanent')
  assert.ok(permanentTarget)

  let state = labReducer(structuredClone(INITIAL_LAB_STATE), {
    type: 'SELECT_SCAFFOLD',
    scaffoldId: permanentTarget.id,
  })
  state = labReducer(state, { type: 'REMOVE_SCAFFOLD' })
  assert.deepEqual(state.removedScaffoldIds, [])
  assert.equal(state.scaffoldValidation, 'permanent-protected')
  assert.equal(state.completedBuildStepIds.includes('remove-scaffolding'), false)

  assert.equal(
    validatePersistedState({ ...state, removedScaffoldIds: [permanentTarget.id] }),
    null,
  )
})

test('Phase 2A supports deterministic removal, undo, redo, reset, and explicit validation', () => {
  const [firstTop, secondTop] = removableTargetsForEnclosurePart('top-housing')
  let state = structuredClone(INITIAL_LAB_STATE)

  state = labReducer(state, { type: 'REMOVE_SCAFFOLD', scaffoldId: firstTop.id })
  state = labReducer(state, { type: 'REMOVE_SCAFFOLD', scaffoldId: secondTop.id })
  assert.deepEqual(missingScaffoldIds('top-housing', state.removedScaffoldIds), [])

  state = labReducer(state, { type: 'UNDO_SCAFFOLD_REMOVAL' })
  assert.deepEqual(state.removedScaffoldIds, [firstTop.id])
  state = labReducer(state, { type: 'REDO_SCAFFOLD_REMOVAL' })
  assert.deepEqual(state.removedScaffoldIds, [firstTop.id, secondTop.id])

  state = labReducer(state, { type: 'CHECK_SCAFFOLDING' })
  assert.equal(state.scaffoldValidation, 'top-complete')
  assert.equal(state.completedBuildStepIds.includes('remove-scaffolding'), false)

  state = labReducer(state, { type: 'RESET_SCAFFOLDING_PART' })
  assert.deepEqual(state.removedScaffoldIds, [])
  assert.equal(state.scaffoldUndoHistory.length > 0, true)
})

test('Step 4 validates only after all documented targets across both enclosure parts are removed', () => {
  let state = removeAllFor('top-housing')
  state = labReducer(state, { type: 'SELECT_SCAFFOLDING_PART', partId: 'bottom-cover' })
  state = removeAllFor('bottom-cover', state)

  assert.equal(scaffoldingIsComplete(state.removedScaffoldIds), true)
  assert.equal(state.completedBuildStepIds.includes('remove-scaffolding'), false)
  state = labReducer(state, { type: 'CHECK_SCAFFOLDING' })
  assert.equal(state.scaffoldValidation, 'complete')
  assert.equal(state.completedBuildStepIds.includes('remove-scaffolding'), true)
  assert.deepEqual(validatePersistedState(structuredClone(state)), state)
})

test('Phase 2A presents a recoverable source-asset failure message', () => {
  assert.match(stlLoadFailureMessage('Top housing'), /Top housing could not be loaded/i)
  assert.match(stlLoadFailureMessage('Top housing'), /try loading the STL again/i)
})
