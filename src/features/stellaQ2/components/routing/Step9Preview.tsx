import { useReducer } from 'react'
import { LAYOUT_TARGET_BY_PART_ID, STEP_FIVE_PART_IDS } from '../../data/componentLayout'
import { REQUIRED_CONNECTIONS } from '../../data/connectors'
import { ENCLOSURE_SLOTS } from '../../data/enclosure'
import { RETAINERS } from '../../data/retainers'
import { INITIAL_LAB_STATE, labReducer } from '../../state/labMachine'
import { createInitialStep6Connections } from '../../utils/connections'
import { retainerInstallationFor } from '../../utils/retainers'
import { createLooseCableRoutes, suggestedRouteFor } from '../../utils/routing'
import BuildWorkspace from '../BuildWorkspace'

type PreviewVariant = 'loose' | 'partial' | 'collision' | 'excessive' | 'complete'

function requestedVariant(): PreviewVariant {
  const value = new URLSearchParams(window.location.search).get('stella-step9-preview')
  return ['loose', 'partial', 'collision', 'excessive', 'complete'].includes(value ?? '')
    ? value as PreviewVariant
    : 'complete'
}

// Development-only visual-regression fixtures. They exercise the production
// Step 9 workspace and reducer without reading or overwriting session progress.
function previewState() {
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
  const looseRoutes = createLooseCableRoutes(step6Connections, enclosurePlacements)
  const suggestedRoutes = step6Connections.map((connection) => ({
    ...suggestedRouteFor(connection, enclosurePlacements),
    status: 'routed' as const,
  }))
  const variant = requestedVariant()
  const cableRoutes = variant === 'loose'
    ? looseRoutes
    : variant === 'partial'
      ? suggestedRoutes.map((route, index) => index < 3 ? route : looseRoutes[index])
      : suggestedRoutes.map((route, index) => {
          if (index !== 0 || variant === 'complete') return route
          return {
            ...route,
            controlPointsMm: variant === 'collision'
              ? [[30, -40, 20] as const]
              : [[0, 500, 20] as const],
          }
        })

  return {
    ...INITIAL_LAB_STATE,
    mode: 'build' as const,
    activeBuildStepId: 'wire-routing',
    completedBuildStepIds: [
      'remove-scaffolding',
      'parts-layout',
      'cable-connections',
      'enclosure-placement',
      'retainer-clips',
    ],
    layoutPlacements,
    step6Connections,
    coinCellInstalled: true,
    enclosurePlacements,
    microSdInstalled: true,
    retainerInstallations: RETAINERS.map((retainer) => retainerInstallationFor(retainer.id)),
    cableRoutes,
    selectedRoutingCableId: cableRoutes[0]?.cableId ?? null,
  }
}

export default function Step9Preview() {
  const [state, dispatch] = useReducer(labReducer, undefined, previewState)
  return <BuildWorkspace state={state} dispatch={dispatch} />
}
