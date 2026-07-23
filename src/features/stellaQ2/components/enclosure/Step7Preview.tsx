import { useReducer } from 'react'
import { LAYOUT_TARGET_BY_PART_ID, STEP_FIVE_PART_IDS } from '../../data/componentLayout'
import { REQUIRED_CONNECTIONS } from '../../data/connectors'
import { createInitialStep6Connections } from '../../utils/connections'
import { INITIAL_LAB_STATE, labReducer } from '../../state/labMachine'
import BuildWorkspace from '../BuildWorkspace'

// Development-only visual-regression fixture. It never reads or writes the
// browser session and uses the production Step 7 workspace and validation.
function previewState() {
  const layoutPlacements = STEP_FIVE_PART_IDS.map((partId) => {
    const target = LAYOUT_TARGET_BY_PART_ID.get(partId)!
    return { partId, targetId: target.id, x: target.x, y: target.y, rotation: target.rotation, face: partId === 'cr1220' ? 'positive-up' as const : null, snapped: true }
  })
  const step6Connections = createInitialStep6Connections()
  REQUIRED_CONNECTIONS.forEach((required, index) => {
    const connectionIndex = required.kind === 'qwiic'
      ? index
      : step6Connections.findIndex((connection) => connection.cableId === required.id)
    step6Connections[connectionIndex] = { ...step6Connections[connectionIndex], endpointA: required.endpointA, endpointB: required.endpointB }
  })
  return {
    ...INITIAL_LAB_STATE,
    mode: 'build' as const,
    activeBuildStepId: 'enclosure-placement',
    completedBuildStepIds: ['parts-layout', 'cable-connections'],
    layoutPlacements,
    step6Connections,
    coinCellInstalled: true,
  }
}

export default function Step7Preview() {
  const [state, dispatch] = useReducer(labReducer, undefined, previewState)
  return <BuildWorkspace state={state} dispatch={dispatch} />
}
