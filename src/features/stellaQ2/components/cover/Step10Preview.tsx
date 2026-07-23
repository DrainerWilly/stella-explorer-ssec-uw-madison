import { useReducer } from 'react'
import { LAYOUT_TARGET_BY_PART_ID, STEP_FIVE_PART_IDS } from '../../data/componentLayout'
import { REQUIRED_CONNECTIONS } from '../../data/connectors'
import { ENCLOSURE_SLOTS } from '../../data/enclosure'
import { RETAINERS } from '../../data/retainers'
import { INITIAL_LAB_STATE, labReducer } from '../../state/labMachine'
import { createInitialStep6Connections } from '../../utils/connections'
import { retainerInstallationFor } from '../../utils/retainers'
import { suggestedRouteFor } from '../../utils/routing'
import type { LabState } from '../../types'
import BuildWorkspace from '../BuildWorkspace'

type PreviewVariant = 'staged' | 'reversed' | 'aligned' | 'clearance' | 'partial' | 'one-latch' | 'closed'

function requestedVariant(): PreviewVariant {
  const value = new URLSearchParams(window.location.search).get('stella-step10-preview')
  return ['staged', 'reversed', 'aligned', 'clearance', 'partial', 'one-latch', 'closed'].includes(value ?? '')
    ? value as PreviewVariant
    : 'staged'
}

function completePrerequisites() {
  const layoutPlacements = STEP_FIVE_PART_IDS.map((partId) => {
    const target = LAYOUT_TARGET_BY_PART_ID.get(partId)!
    return {
      partId,
      targetId: target.id,
      x: target.x,
      y: target.y,
      rotation: target.rotation,
      face: partId === 'cr1220' ? 'positive-up' as const : null,
      snapped: true,
    }
  })
  const step6Connections = createInitialStep6Connections()
  let qwiicIndex = 0
  REQUIRED_CONNECTIONS.forEach((required) => {
    const connectionIndex = required.kind === 'qwiic'
      ? qwiicIndex++
      : step6Connections.findIndex((connection) => connection.cableId === required.id)
    step6Connections[connectionIndex] = {
      ...step6Connections[connectionIndex],
      endpointA: required.endpointA,
      endpointB: required.endpointB,
    }
  })
  const enclosurePlacements = ENCLOSURE_SLOTS.map((slot) => ({
    partId: slot.acceptedPartId,
    slotId: slot.id,
    positionMm: slot.positionMm,
    rotation: slot.rotation,
    seated: true,
  }))
  const cableRoutes = step6Connections.map((connection) => ({
    ...suggestedRouteFor(connection, enclosurePlacements),
    status: 'routed' as const,
  }))
  return {
    layoutPlacements,
    step6Connections,
    enclosurePlacements,
    cableRoutes,
    retainerInstallations: RETAINERS.map((retainer) => retainerInstallationFor(retainer.id)),
  }
}

// Development-only visual-regression fixtures. They render the production
// Step 10 workspace without reading or overwriting session progress.
function previewState() {
  const variant = requestedVariant()
  const prerequisites = completePrerequisites()
  const cableRoutes = variant === 'clearance'
    ? prerequisites.cableRoutes.map((route, index) => index === 0
      ? { ...route, controlPointsMm: [[23, -32, 29] as const, [23, -48, 29] as const] }
      : route)
    : prerequisites.cableRoutes
  let state: LabState = {
    ...INITIAL_LAB_STATE,
    ...prerequisites,
    mode: 'build' as const,
    activeBuildStepId: 'bottom-cover',
    completedBuildStepIds: [
      'remove-scaffolding',
      'parts-layout',
      'cable-connections',
      'enclosure-placement',
      'retainer-clips',
      'wire-routing',
    ],
    coinCellInstalled: true,
    microSdInstalled: true,
    cableRoutes,
    coverClearanceRegionsVisible: variant === 'clearance',
  }
  if (variant === 'reversed') return labReducer(state, { type: 'SET_BOTTOM_COVER_FACE', face: 'reversed' })
  if (variant === 'clearance') return labReducer(state, { type: 'CHECK_COVER_CLEARANCE' })
  if (variant === 'staged') return state
  state = labReducer(state, { type: 'ALIGN_BOTTOM_COVER' })
  if (variant === 'aligned') return state
  state = labReducer(state, { type: 'PARTIALLY_SEAT_BOTTOM_COVER' })
  if (variant === 'partial') return state
  state = labReducer(state, { type: 'SEAT_BOTTOM_COVER' })
  state = labReducer(state, { type: 'ENGAGE_COVER_LATCH', latchId: 'front-left-latch' })
  if (variant === 'one-latch') return state
  state = labReducer(state, { type: 'ENGAGE_ALL_COVER_LATCHES' })
  return labReducer(state, { type: 'CHECK_COVER_INSTALLATION' })
}

export default function Step10Preview() {
  const [state, dispatch] = useReducer(labReducer, undefined, previewState)
  return <BuildWorkspace state={state} dispatch={dispatch} />
}
