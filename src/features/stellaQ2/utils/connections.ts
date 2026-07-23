import { CONNECTOR_BY_ID, QWIIC_CABLE_IDS, REQUIRED_CONNECTIONS } from '../data/connectors'
import { validateLayout } from './componentLayout'
import type { CableConnectionState, ComponentPlacement, ConnectionValidationStatus } from '../types'

export interface ConnectionValidationResult {
  status: ConnectionValidationStatus
  messages: string[]
  completeConnectionIds: string[]
}

const unorderedKey = (a: string, b: string) => [a, b].sort().join('|')
const requiredByPair = new Map(REQUIRED_CONNECTIONS.map((connection) => [unorderedKey(connection.endpointA, connection.endpointB), connection]))

export function createInitialStep6Connections(): CableConnectionState[] {
  return [
    ...QWIIC_CABLE_IDS.map((cableId) => ({ cableId, kind: 'qwiic' as const, endpointA: null, endpointB: null })),
    { cableId: 'power-battery-switch', kind: 'power' as const, endpointA: null, endpointB: null },
    { cableId: 'power-switch-rp2040', kind: 'power' as const, endpointA: null, endpointB: null },
  ]
}

export function isConnectionId(value: string | null) {
  return Boolean(value && createInitialStep6Connections().some((connection) => connection.cableId === value))
}

export function connectorIsCompatible(connection: CableConnectionState, connectorId: string) {
  const connector = CONNECTOR_BY_ID.get(connectorId)
  if (!connector) return false
  return connection.kind === 'qwiic'
    ? connector.type === 'qwiic'
    : connector.type !== 'qwiic'
}

export function connectorIsOccupied(
  connections: CableConnectionState[],
  connectorId: string,
  exceptConnectionId?: string,
) {
  return connections.some((connection) => connection.cableId !== exceptConnectionId
    && (connection.endpointA === connectorId || connection.endpointB === connectorId))
}

export function validateConnectionGraph(
  placements: ComponentPlacement[],
  connections: CableConnectionState[],
  coinCellInstalled: boolean,
): ConnectionValidationResult {
  if (validateLayout(placements).status !== 'valid') {
    return { status: 'layout-incomplete', messages: ['Complete and validate the Step 5 component layout before connecting cables.'], completeConnectionIds: [] }
  }
  if (!coinCellInstalled) {
    return { status: 'coin-not-installed', messages: ['Insert the CR1220 into the clock module with its positive side up.'], completeConnectionIds: [] }
  }
  const messages: string[] = []
  const completeConnectionIds: string[] = []
  const occupied = new Map<string, string>()
  const usedRequiredPairs = new Set<string>()

  for (const connection of connections) {
    if (!connection.endpointA || !connection.endpointB) {
      messages.push(`${connection.kind === 'qwiic' ? 'A Qwiic cable' : 'A power lead'} is not fully connected.`)
      continue
    }
    if (connection.endpointA === connection.endpointB) {
      messages.push('A cable cannot connect a physical port to itself.')
      continue
    }
    const connectorA = CONNECTOR_BY_ID.get(connection.endpointA)
    const connectorB = CONNECTOR_BY_ID.get(connection.endpointB)
    if (!connectorA || !connectorB || !connectorIsCompatible(connection, connection.endpointA) || !connectorIsCompatible(connection, connection.endpointB)
      || !connectorA.accepts.includes(connectorB.type) || !connectorB.accepts.includes(connectorA.type)) {
      messages.push('This connector type is incompatible with the selected cable.')
      continue
    }
    if (occupied.has(connection.endpointA) || occupied.has(connection.endpointB)) {
      messages.push('A physical connector is occupied by more than one cable.')
      continue
    }
    occupied.set(connection.endpointA, connection.cableId)
    occupied.set(connection.endpointB, connection.cableId)
    const pair = unorderedKey(connection.endpointA, connection.endpointB)
    const required = requiredByPair.get(pair)
    if (!required || required.kind !== connection.kind || usedRequiredPairs.has(pair)) {
      messages.push(connection.kind === 'qwiic'
        ? 'This Qwiic cable links the wrong modules for the documented chain.'
        : 'The battery must connect through the power switch, then to the microcontroller.')
      continue
    }
    usedRequiredPairs.add(pair)
    completeConnectionIds.push(connection.cableId)
  }

  const requiredQwiic = REQUIRED_CONNECTIONS.filter((connection) => connection.kind === 'qwiic')
  const requiredPower = REQUIRED_CONNECTIONS.filter((connection) => connection.kind === 'power')
  const missingQwiic = requiredQwiic.filter((connection) => !usedRequiredPairs.has(unorderedKey(connection.endpointA, connection.endpointB)))
  const missingPower = requiredPower.filter((connection) => !usedRequiredPairs.has(unorderedKey(connection.endpointA, connection.endpointB)))
  if (missingQwiic.length) messages.push(`${missingQwiic.length} documented Qwiic link${missingQwiic.length === 1 ? ' remains' : 's remain'} incomplete.`)
  if (missingPower.length) messages.push('The battery power path is incomplete: battery → switch → RP2040 is required.')

  if (!messages.length && usedRequiredPairs.size === REQUIRED_CONNECTIONS.length) {
    return { status: 'valid', messages: ['All four Qwiic links and the complete switched battery path match the documented Build 2 topology.'], completeConnectionIds }
  }
  const status: ConnectionValidationStatus = messages.some((message) => /incompatible/i.test(message))
    ? 'incompatible-connector'
    : messages.some((message) => /occupied/i.test(message))
      ? 'port-occupied'
      : messages.some((message) => /itself/i.test(message))
        ? 'self-connection'
        : messages.some((message) => /wrong modules|must connect through/i.test(message))
          ? 'wrong-topology'
          : 'incomplete'
  return { status, messages, completeConnectionIds }
}

export function connectionPairMatchesRequired(connection: CableConnectionState) {
  return Boolean(connection.endpointA && connection.endpointB && requiredByPair.has(unorderedKey(connection.endpointA, connection.endpointB)))
}
