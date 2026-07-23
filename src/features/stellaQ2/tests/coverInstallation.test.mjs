import test from 'node:test'
import assert from 'node:assert/strict'
import { LAYOUT_TARGET_BY_PART_ID, STEP_FIVE_PART_IDS } from '../data/componentLayout.ts'
import { REQUIRED_CONNECTIONS } from '../data/connectors.ts'
import {
  BOTTOM_COVER_TARGET,
  COVER_LATCHES,
  bottomCoverStlLoadFailureMessage,
  createInitialCoverLatches,
} from '../data/coverInstallation.ts'
import { ENCLOSURE_SLOTS } from '../data/enclosure.ts'
import { RETAINERS } from '../data/retainers.ts'
import { INITIAL_LAB_STATE, labReducer, validatePersistedState } from '../state/labMachine.ts'
import { createInitialStep6Connections } from '../utils/connections.ts'
import {
  coverAlignmentStatus,
  validateBottomCoverInstallation,
  validateCoverClearance,
} from '../utils/coverInstallation.ts'
import { retainerInstallationFor } from '../utils/retainers.ts'
import { suggestedRouteFor } from '../utils/routing.ts'

function completeFixture() {
  const layoutPlacements = STEP_FIVE_PART_IDS.map((partId) => {
    const target = LAYOUT_TARGET_BY_PART_ID.get(partId)
    return {
      partId,
      targetId: target.id,
      x: target.x,
      y: target.y,
      rotation: target.rotation,
      face: partId === 'cr1220' ? 'positive-up' : null,
      snapped: true,
    }
  })
  const step6Connections = createInitialStep6Connections()
  let qwiicIndex = 0
  for (const required of REQUIRED_CONNECTIONS) {
    const index = required.kind === 'qwiic'
      ? qwiicIndex++
      : step6Connections.findIndex((item) => item.cableId === required.id)
    step6Connections[index] = {
      ...step6Connections[index],
      endpointA: required.endpointA,
      endpointB: required.endpointB,
    }
  }
  const enclosurePlacements = ENCLOSURE_SLOTS.map((slot) => ({
    partId: slot.acceptedPartId,
    slotId: slot.id,
    positionMm: slot.positionMm,
    rotation: slot.rotation,
    seated: true,
  }))
  const retainerInstallations = RETAINERS.map((item) => retainerInstallationFor(item.id))
  const cableRoutes = step6Connections.map((connection) => ({
    ...suggestedRouteFor(connection, enclosurePlacements),
    status: 'routed',
  }))
  return {
    ...INITIAL_LAB_STATE,
    layoutPlacements,
    step6Connections,
    coinCellInstalled: true,
    enclosurePlacements,
    microSdInstalled: true,
    retainerInstallations,
    cableRoutes,
    completedBuildStepIds: [
      'remove-scaffolding',
      'parts-layout',
      'cable-connections',
      'enclosure-placement',
      'retainer-clips',
      'wire-routing',
    ],
  }
}

function validationArgs(state) {
  return {
    layout: state.layoutPlacements,
    connections: state.step6Connections,
    coinInstalled: state.coinCellInstalled,
    placements: state.enclosurePlacements,
    microSdInstalled: state.microSdInstalled,
    retainers: state.retainerInstallations,
    blockedRetainers: state.cableBlockedRetainerIds,
    routes: state.cableRoutes,
  }
}

function closedFixture() {
  return {
    ...completeFixture(),
    bottomCover: {
      positionMm: BOTTOM_COVER_TARGET.targetPositionMm,
      rotation: BOTTOM_COVER_TARGET.targetRotation,
      state: 'latched',
      seatingProgress: 1,
    },
    coverLatches: createInitialCoverLatches().map((item) => ({ ...item, state: 'engaged' })),
    coverAlignment: 'aligned',
  }
}

test('Phase 2G models the real cover and four unique paired corner latches without invented travel', () => {
  assert.ok(BOTTOM_COVER_TARGET.stlUrl.endsWith('Q2%20bottom%20cover.STL'))
  assert.deepEqual(BOTTOM_COVER_TARGET.dimensionsMm, [65.79, 181.945, 11.5])
  assert.equal(COVER_LATCHES.length, 4)
  assert.equal(new Set(COVER_LATCHES.map((latch) => latch.id)).size, 4)
  assert.ok(COVER_LATCHES.every((latch) => latch.maximumRepresentedTravelMm === 0))
  assert.deepEqual(BOTTOM_COVER_TARGET.insertionAxis, [0, 0, -1])
})

test('cover alignment distinguishes correct, reversed, rotated, and offset transforms', () => {
  const aligned = {
    positionMm: BOTTOM_COVER_TARGET.alignedPositionMm,
    rotation: BOTTOM_COVER_TARGET.targetRotation,
    state: 'aligned',
    seatingProgress: 0,
  }
  assert.equal(coverAlignmentStatus(aligned), 'aligned')
  assert.equal(coverAlignmentStatus({ ...aligned, rotation: BOTTOM_COVER_TARGET.reversedRotation }), 'reversed')
  assert.equal(coverAlignmentStatus({ ...aligned, rotation: [0, 0, 90] }), 'wrong-rotation')
  assert.equal(coverAlignmentStatus({ ...aligned, positionMm: [4, 0, 52] }), 'offset')
  assert.equal(coverAlignmentStatus({ ...aligned, positionMm: [2.9, -2.9, 52] }), 'aligned')
})

test('installation validation rejects partial seating and open latches, then accepts the fully closed cover', () => {
  const state = completeFixture()
  const args = validationArgs(state)
  const partial = validateBottomCoverInstallation({
    ...args,
    cover: {
      positionMm: [0, 0, 39],
      rotation: BOTTOM_COVER_TARGET.targetRotation,
      state: 'partiallySeated',
      seatingProgress: .5,
    },
    latches: createInitialCoverLatches().map((item) => ({ ...item, state: 'aligned' })),
  })
  assert.equal(partial.status, 'partially-seated')
  const seated = validateBottomCoverInstallation({
    ...args,
    cover: {
      positionMm: BOTTOM_COVER_TARGET.targetPositionMm,
      rotation: BOTTOM_COVER_TARGET.targetRotation,
      state: 'fullySeated',
      seatingProgress: 1,
    },
    latches: createInitialCoverLatches().map((item) => ({ ...item, state: 'aligned' })),
  })
  assert.equal(seated.status, 'latches-open')
  const closed = closedFixture()
  assert.equal(validateBottomCoverInstallation({ ...validationArgs(closed), cover: closed.bottomCover, latches: closed.coverLatches }).status, 'valid')
})

test('cover clearance detects high routes and the four source-derived latch regions', () => {
  const state = completeFixture()
  const high = {
    ...state,
    cableRoutes: state.cableRoutes.map((route, index) => index === 0
      ? { ...route, controlPointsMm: [[23, -32, 29], [23, -48, 29]] }
      : route),
  }
  const highResult = validateCoverClearance(validationArgs(high))
  assert.equal(highResult.valid, false)
  assert.ok(highResult.issues.some((issue) => issue.code === 'route'))

  const contact = {
    ...state,
    cableRoutes: state.cableRoutes.map((route, index) => index === 0
      ? { ...route, controlPointsMm: [[30, -40, 20]] }
      : route),
  }
  assert.ok(validateCoverClearance(validationArgs(contact)).issues.some((issue) => issue.code === 'cover-contact'))

  for (const latch of COVER_LATCHES) {
    const stateAtLatch = {
      ...state,
      cableRoutes: state.cableRoutes.map((route, index) => index === 0
        ? {
            ...route,
            controlPointsMm: [[
              (latch.housingFeatureBoundsMm[0] + latch.housingFeatureBoundsMm[1]) / 2,
              (latch.housingFeatureBoundsMm[2] + latch.housingFeatureBoundsMm[3]) / 2,
              (latch.housingFeatureBoundsMm[4] + latch.housingFeatureBoundsMm[5]) / 2,
            ]],
          }
        : route),
    }
    const result = validateCoverClearance(validationArgs(stateAtLatch))
    assert.ok(result.issues.some((issue) => issue.code === 'latch' && issue.latchId === latch.id), latch.id)
  }

  const pinched = {
    ...state,
    cableBlockedRetainerIds: [state.retainerInstallations[0].retainerId],
  }
  const pinchResult = validateCoverClearance(validationArgs(pinched))
  assert.equal(pinchResult.prerequisiteValid, false)
  assert.ok(pinchResult.issues.some((issue) => /pinch|trapped|retainer/i.test(issue.message)))
})

test('cover clearance reports component and retainer intrusion even when earlier validation is also invalid', () => {
  const state = completeFixture()
  const componentState = {
    ...state,
    enclosurePlacements: state.enclosurePlacements.map((placement, index) => index === 0
      ? { ...placement, positionMm: [placement.positionMm[0], placement.positionMm[1], 40] }
      : placement),
  }
  assert.ok(validateCoverClearance(validationArgs(componentState)).issues.some((issue) => issue.code === 'component'))
  const retainerState = {
    ...state,
    retainerInstallations: state.retainerInstallations.map((installation, index) => index === 0
      ? { ...installation, positionMm: [installation.positionMm[0], installation.positionMm[1], 40] }
      : installation),
  }
  assert.ok(validateCoverClearance(validationArgs(retainerState)).issues.some((issue) => issue.code === 'retainer'))
})

test('Step 9 remains a hard prerequisite and completion is limited to bottom-cover', () => {
  const state = { ...completeFixture(), cableRoutes: completeFixture().cableRoutes.slice(1) }
  const aligned = labReducer(state, { type: 'ALIGN_BOTTOM_COVER' })
  assert.equal(aligned.coverValidation, 'step9-incomplete')
  const closed = closedFixture()
  const checked = labReducer(closed, { type: 'CHECK_COVER_INSTALLATION' })
  assert.equal(checked.coverValidation, 'valid')
  assert.ok(checked.completedBuildStepIds.includes('bottom-cover'))
  assert.ok(!checked.completedBuildStepIds.includes('lamp-windows'))
  assert.equal('lampWindows' in checked, false)
  assert.equal('usbConnected' in checked, false)
})

test('guided reducer flow preserves all Step 4–9 topology and supports partial, latch, undo, redo, reopen, and reset states', () => {
  const initial = completeFixture()
  const preserved = {
    layout: initial.layoutPlacements,
    connections: initial.step6Connections,
    enclosure: initial.enclosurePlacements,
    retainers: initial.retainerInstallations,
    routes: initial.cableRoutes,
  }
  const aligned = labReducer(initial, { type: 'ALIGN_BOTTOM_COVER' })
  assert.equal(aligned.bottomCover.state, 'aligned')
  const partial = labReducer(aligned, { type: 'PARTIALLY_SEAT_BOTTOM_COVER' })
  assert.equal(partial.bottomCover.seatingProgress, .5)
  const seated = labReducer(partial, { type: 'SEAT_BOTTOM_COVER' })
  assert.equal(seated.bottomCover.state, 'fullySeated')
  const oneLatch = labReducer(seated, { type: 'ENGAGE_COVER_LATCH', latchId: 'front-left-latch' })
  assert.equal(oneLatch.coverLatches.filter((item) => item.state === 'engaged').length, 1)
  const undone = labReducer(oneLatch, { type: 'UNDO_COVER_INSTALLATION' })
  assert.equal(undone.coverLatches.filter((item) => item.state === 'engaged').length, 0)
  const redone = labReducer(undone, { type: 'REDO_COVER_INSTALLATION' })
  assert.equal(redone.coverLatches.filter((item) => item.state === 'engaged').length, 1)
  const all = labReducer(redone, { type: 'ENGAGE_ALL_COVER_LATCHES' })
  assert.equal(all.bottomCover.state, 'latched')
  const reopened = labReducer(all, { type: 'REOPEN_BOTTOM_COVER' })
  assert.equal(reopened.bottomCover.state, 'aligned')
  const reset = labReducer(all, { type: 'RESET_COVER_INSTALLATION' })
  assert.equal(reset.bottomCover.state, 'staged')
  assert.equal(reset.layoutPlacements, preserved.layout)
  assert.equal(reset.step6Connections, preserved.connections)
  assert.equal(reset.enclosurePlacements, preserved.enclosure)
  assert.equal(reset.retainerInstallations, preserved.retainers)
  assert.equal(reset.cableRoutes, preserved.routes)
})

test('Phase 2G state persists and version 7 sessions migrate without losing Step 4–9 progress', () => {
  const fixture = closedFixture()
  const restored = validatePersistedState(JSON.parse(JSON.stringify(fixture)))
  assert.equal(restored?.version, 8)
  assert.deepEqual(restored?.bottomCover, fixture.bottomCover)
  assert.deepEqual(restored?.coverLatches, fixture.coverLatches)
  const migrated = validatePersistedState({ ...completeFixture(), version: 7, bottomCover: undefined, coverLatches: undefined })
  assert.equal(migrated?.version, 8)
  assert.equal(migrated?.bottomCover.state, 'staged')
  assert.deepEqual(migrated?.cableRoutes, fixture.cableRoutes)
  assert.ok(migrated?.completedBuildStepIds.includes('wire-routing'))
})

test('bottom-cover source failure text is explicit and preserves earlier progress', () => {
  const message = bottomCoverStlLoadFailureMessage()
  assert.match(message, /Q2 bottom cover\.STL/)
  assert.match(message, /Step 4–9 progress is preserved/)
  assert.match(message, /retry/i)
})
