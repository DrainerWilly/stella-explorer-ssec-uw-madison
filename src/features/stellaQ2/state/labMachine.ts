import { BUILD_PHOTOS } from '../data/buildPhotos'
import { BUILD_STEPS } from '../data/buildSteps'
import { ALL_PARTS, PARTS_LIST } from '../data/parts'
import {
  CAMERA_PRESETS,
  SCAFFOLD_TARGET_BY_ID,
  SCAFFOLDING_MODELS,
  targetsForEnclosurePart,
} from '../data/scaffolding'
import {
  scaffoldingIsComplete,
  validationStatusForScaffolding,
} from '../utils/scaffolding'
import {
  isLayoutPartId,
  isValidNormalizedPlacement,
  validateLayout,
} from '../utils/componentLayout'
import { LAYOUT_TARGET_BY_ID } from '../data/componentLayout'
import { CONNECTOR_BY_ID } from '../data/connectors'
import {
  connectorIsCompatible,
  connectorIsOccupied,
  createInitialStep6Connections,
  isConnectionId,
  validateConnectionGraph,
} from '../utils/connections'
import type {
  CableConnectionState,
  ComponentPlacement,
  ConnectionHistoryEntry,
  LabAction,
  LabState,
  LayoutHistoryEntry,
  LayoutPartId,
  ScaffoldingEnclosurePartId,
  ScaffoldingHistoryEntry,
} from '../types'

// Keep the existing key so a completed Phase 2A session is migrated rather
// than discarded when Phase 2B fields are added.
export const STELLA_Q2_SESSION_KEY = 'exstella.stella-q2.phase-2a.v1'

export const INITIAL_LAB_STATE: LabState = {
  version: 4,
  mode: 'intro',
  guidance: 'standard',
  activeBuildStepId: BUILD_STEPS[0].id,
  completedBuildStepIds: [],
  selectedPartId: PARTS_LIST[0].id,
  selectedPhotoId: BUILD_PHOTOS[0].id,
  workspaceView: 'diagram',
  selectedEnclosurePart: 'top-housing',
  removedScaffoldIds: [],
  selectedScaffoldId: null,
  scaffoldCameraPreset: 'fit',
  scaffoldHintVisible: false,
  scaffoldValidation: 'idle',
  scaffoldUndoHistory: [],
  scaffoldRedoHistory: [],
  selectedLayoutPartId: null,
  selectedLayoutTargetId: null,
  layoutPlacements: [],
  layoutComparisonMode: 'diagram',
  layoutZoom: 1,
  layoutPan: [0, 0],
  layoutHintVisible: false,
  layoutTargetOutlinesVisible: true,
  layoutValidation: 'idle',
  layoutUndoHistory: [],
  layoutRedoHistory: [],
  selectedConnectionId: null,
  selectedConnectionEndpoint: null,
  step6Connections: createInitialStep6Connections(),
  coinCellInstalled: false,
  connectionComparisonMode: 'diagram',
  connectionHintVisible: false,
  connectionLabelsVisible: true,
  requiredPathsVisible: false,
  isolateSelectedConnection: false,
  connectionValidation: 'idle',
  connectionUndoHistory: [],
  connectionRedoHistory: [],
}

function validStepId(stepId: string) {
  return BUILD_STEPS.some((step) => step.id === stepId)
}

function validPartId(partId: string) {
  return ALL_PARTS.some((part) => part.id === partId)
}

function validPhotoId(photoId: string) {
  return BUILD_PHOTOS.some((photo) => photo.id === photoId)
}

function validEnclosurePartId(partId: string): partId is ScaffoldingEnclosurePartId {
  return SCAFFOLDING_MODELS.some((model) => model.id === partId)
}

function validScaffoldId(scaffoldId: string | null) {
  return scaffoldId === null || SCAFFOLD_TARGET_BY_ID.has(scaffoldId)
}

function validHistoryEntry(value: unknown): value is ScaffoldingHistoryEntry {
  if (!value || typeof value !== 'object') return false
  const entry = value as Partial<ScaffoldingHistoryEntry>
  return Array.isArray(entry.removedScaffoldIds)
    && entry.removedScaffoldIds.every((id) => typeof id === 'string' && scaffoldTargetIsRemovable(id))
    && new Set(entry.removedScaffoldIds).size === entry.removedScaffoldIds.length
    && validScaffoldId(entry.selectedScaffoldId ?? null)
}

function scaffoldTargetIsValid(scaffoldId: string) {
  return SCAFFOLD_TARGET_BY_ID.has(scaffoldId)
}

function scaffoldTargetIsRemovable(scaffoldId: string) {
  return SCAFFOLD_TARGET_BY_ID.get(scaffoldId)?.kind === 'removable'
}

function validLayoutTargetId(targetId: string | null) {
  return targetId === null || LAYOUT_TARGET_BY_ID.has(targetId)
}

function validLayoutComparisonMode(mode: unknown) {
  return mode === 'diagram' || mode === 'build-one' || mode === 'side-by-side' || mode === 'overlay'
}

function validConnectionComparisonMode(mode: unknown) {
  return mode === 'diagram' || mode === 'build-two' || mode === 'side-by-side' || mode === 'overlay' || mode === 'schematic'
}

function validConnectionState(value: unknown): value is CableConnectionState {
  if (!value || typeof value !== 'object') return false
  const connection = value as Partial<CableConnectionState>
  return typeof connection.cableId === 'string'
    && isConnectionId(connection.cableId)
    && (connection.kind === 'qwiic' || connection.kind === 'power')
    && (connection.endpointA === null || (typeof connection.endpointA === 'string' && CONNECTOR_BY_ID.has(connection.endpointA)))
    && (connection.endpointB === null || (typeof connection.endpointB === 'string' && CONNECTOR_BY_ID.has(connection.endpointB)))
}

function validConnectionHistoryEntry(value: unknown): value is ConnectionHistoryEntry {
  if (!value || typeof value !== 'object') return false
  const entry = value as Partial<ConnectionHistoryEntry>
  return Array.isArray(entry.connections)
    && entry.connections.every(validConnectionState)
    && entry.connections.length === createInitialStep6Connections().length
    && new Set(entry.connections.map((connection) => connection.cableId)).size === entry.connections.length
    && (entry.selectedConnectionId === null || isConnectionId(entry.selectedConnectionId ?? null))
    && (entry.selectedConnectionEndpoint === null || entry.selectedConnectionEndpoint === 'a' || entry.selectedConnectionEndpoint === 'b')
    && typeof entry.coinCellInstalled === 'boolean'
}

function validLayoutHistoryEntry(value: unknown): value is LayoutHistoryEntry {
  if (!value || typeof value !== 'object') return false
  const entry = value as Partial<LayoutHistoryEntry>
  return Array.isArray(entry.placements)
    && entry.placements.every(isValidNormalizedPlacement)
    && new Set(entry.placements.map((placement) => placement.partId)).size === entry.placements.length
    && (entry.selectedLayoutPartId === null || isLayoutPartId(entry.selectedLayoutPartId ?? null))
    && validLayoutTargetId(entry.selectedLayoutTargetId ?? null)
}

function snapshotScaffolding(state: LabState): ScaffoldingHistoryEntry {
  return {
    removedScaffoldIds: [...state.removedScaffoldIds],
    selectedScaffoldId: state.selectedScaffoldId,
  }
}

function applyScaffoldingSnapshot(
  state: LabState,
  snapshot: ScaffoldingHistoryEntry,
  historyKey: 'scaffoldUndoHistory' | 'scaffoldRedoHistory',
): LabState {
  const otherHistoryKey = historyKey === 'scaffoldUndoHistory'
    ? 'scaffoldRedoHistory'
    : 'scaffoldUndoHistory'
  const updated = {
    ...state,
    removedScaffoldIds: [...snapshot.removedScaffoldIds],
    selectedScaffoldId: snapshot.selectedScaffoldId,
    [historyKey]: state[historyKey].slice(0, -1),
    [otherHistoryKey]: [...state[otherHistoryKey], snapshotScaffolding(state)],
  } as LabState
  return {
    ...updated,
    scaffoldValidation: validationStatusForScaffolding(
      updated.selectedEnclosurePart,
      updated.removedScaffoldIds,
    ),
    completedBuildStepIds: scaffoldingIsComplete(updated.removedScaffoldIds)
      ? updated.completedBuildStepIds
      : updated.completedBuildStepIds.filter((id) => id !== 'remove-scaffolding'),
  }
}

function snapshotLayout(state: LabState): LayoutHistoryEntry {
  return {
    placements: state.layoutPlacements.map((placement) => ({ ...placement })),
    selectedLayoutPartId: state.selectedLayoutPartId,
    selectedLayoutTargetId: state.selectedLayoutTargetId,
  }
}

function snapshotConnections(state: LabState): ConnectionHistoryEntry {
  return {
    connections: state.step6Connections.map((connection) => ({ ...connection })),
    selectedConnectionId: state.selectedConnectionId,
    selectedConnectionEndpoint: state.selectedConnectionEndpoint,
    coinCellInstalled: state.coinCellInstalled,
  }
}

function applyConnectionSnapshot(
  state: LabState,
  snapshot: ConnectionHistoryEntry,
  historyKey: 'connectionUndoHistory' | 'connectionRedoHistory',
): LabState {
  const otherHistoryKey = historyKey === 'connectionUndoHistory' ? 'connectionRedoHistory' : 'connectionUndoHistory'
  const updated = {
    ...state,
    step6Connections: snapshot.connections.map((connection) => ({ ...connection })),
    selectedConnectionId: snapshot.selectedConnectionId,
    selectedConnectionEndpoint: snapshot.selectedConnectionEndpoint,
    coinCellInstalled: snapshot.coinCellInstalled,
    [historyKey]: state[historyKey].slice(0, -1),
    [otherHistoryKey]: [...state[otherHistoryKey], snapshotConnections(state)],
  } as LabState
  const validation = validateConnectionGraph(updated.layoutPlacements, updated.step6Connections, updated.coinCellInstalled)
  return {
    ...updated,
    connectionValidation: validation.status === 'valid' ? 'idle' : validation.status,
    completedBuildStepIds: validation.status === 'valid'
      ? updated.completedBuildStepIds
      : updated.completedBuildStepIds.filter((id) => id !== 'cable-connections'),
  }
}

function applyLayoutSnapshot(
  state: LabState,
  snapshot: LayoutHistoryEntry,
  historyKey: 'layoutUndoHistory' | 'layoutRedoHistory',
): LabState {
  const otherHistoryKey = historyKey === 'layoutUndoHistory' ? 'layoutRedoHistory' : 'layoutUndoHistory'
  const updated = {
    ...state,
    layoutPlacements: snapshot.placements.map((placement) => ({ ...placement })),
    selectedLayoutPartId: snapshot.selectedLayoutPartId,
    selectedLayoutTargetId: snapshot.selectedLayoutTargetId,
    [historyKey]: state[historyKey].slice(0, -1),
    [otherHistoryKey]: [...state[otherHistoryKey], snapshotLayout(state)],
  } as LabState
  const result = validateLayout(updated.layoutPlacements)
  return {
    ...updated,
    layoutValidation: result.status === 'valid' ? 'idle' : result.status,
    completedBuildStepIds: result.status === 'valid'
      ? updated.completedBuildStepIds
      : updated.completedBuildStepIds.filter((id) => id !== 'parts-layout'),
  }
}

function normalizeRotation(rotation: number) {
  return ((rotation % 360) + 360) % 360
}

function adjacentStepId(activeId: string, delta: -1 | 1) {
  const currentIndex = BUILD_STEPS.findIndex((step) => step.id === activeId)
  const nextIndex = Math.min(
    BUILD_STEPS.length - 1,
    Math.max(0, currentIndex + delta),
  )
  return BUILD_STEPS[nextIndex].id
}

export function labReducer(state: LabState, action: LabAction): LabState {
  switch (action.type) {
    case 'START_BUILD':
      return { ...state, mode: 'build' }
    case 'RETURN_TO_INTRO':
      return { ...state, mode: 'intro' }
    case 'SELECT_BUILD_STEP':
      return validStepId(action.stepId)
        ? { ...state, activeBuildStepId: action.stepId }
        : state
    case 'COMPLETE_BUILD_STEP': {
      if (!validStepId(action.stepId) || state.completedBuildStepIds.includes(action.stepId)) {
        return state
      }
      return {
        ...state,
        completedBuildStepIds: [...state.completedBuildStepIds, action.stepId],
      }
    }
    case 'NEXT_BUILD_STEP':
      return { ...state, activeBuildStepId: adjacentStepId(state.activeBuildStepId, 1) }
    case 'PREVIOUS_BUILD_STEP':
      return { ...state, activeBuildStepId: adjacentStepId(state.activeBuildStepId, -1) }
    case 'SELECT_PART':
      return validPartId(action.partId) ? { ...state, selectedPartId: action.partId } : state
    case 'SELECT_PHOTO':
      return validPhotoId(action.photoId)
        ? { ...state, selectedPhotoId: action.photoId, workspaceView: 'photos' }
        : state
    case 'SET_WORKSPACE_VIEW':
      return { ...state, workspaceView: action.view }
    case 'SET_GUIDANCE':
      return { ...state, guidance: action.guidance }
    case 'SELECT_SCAFFOLDING_PART':
      return {
        ...state,
        selectedEnclosurePart: action.partId,
        selectedScaffoldId: null,
        scaffoldCameraPreset: 'fit',
        scaffoldValidation: validationStatusForScaffolding(action.partId, state.removedScaffoldIds),
      }
    case 'SELECT_SCAFFOLD':
      return scaffoldTargetIsValid(action.scaffoldId)
        ? { ...state, selectedScaffoldId: action.scaffoldId, scaffoldValidation: 'idle' }
        : state
    case 'REMOVE_SCAFFOLD': {
      const targetId = action.scaffoldId ?? state.selectedScaffoldId
      const target = targetId
        ? SCAFFOLD_TARGET_BY_ID.get(targetId)
        : undefined
      if (!target) return { ...state, scaffoldValidation: 'nothing-selected' }
      if (target.kind === 'permanent') return { ...state, scaffoldValidation: 'permanent-protected' }
      if (state.removedScaffoldIds.includes(target.id)) {
        return { ...state, scaffoldValidation: 'already-removed' }
      }
      return {
        ...state,
        selectedScaffoldId: target.id,
        removedScaffoldIds: [...state.removedScaffoldIds, target.id],
        scaffoldUndoHistory: [...state.scaffoldUndoHistory, snapshotScaffolding(state)],
        scaffoldRedoHistory: [],
        scaffoldValidation: 'idle',
      }
    }
    case 'UNDO_SCAFFOLD_REMOVAL': {
      const snapshot = state.scaffoldUndoHistory[state.scaffoldUndoHistory.length - 1]
      return snapshot
        ? applyScaffoldingSnapshot(state, snapshot, 'scaffoldUndoHistory')
        : state
    }
    case 'REDO_SCAFFOLD_REMOVAL': {
      const snapshot = state.scaffoldRedoHistory[state.scaffoldRedoHistory.length - 1]
      return snapshot
        ? applyScaffoldingSnapshot(state, snapshot, 'scaffoldRedoHistory')
        : state
    }
    case 'RESET_SCAFFOLDING_PART': {
      const idsForPart = new Set(
        targetsForEnclosurePart(state.selectedEnclosurePart).map((target) => target.id),
      )
      const nextRemoved = state.removedScaffoldIds.filter((id) => !idsForPart.has(id))
      if (nextRemoved.length === state.removedScaffoldIds.length) return state
      const updated = {
        ...state,
        removedScaffoldIds: nextRemoved,
        selectedScaffoldId: null,
        scaffoldUndoHistory: [...state.scaffoldUndoHistory, snapshotScaffolding(state)],
        scaffoldRedoHistory: [],
      }
      return {
        ...updated,
        scaffoldValidation: validationStatusForScaffolding(
          updated.selectedEnclosurePart,
          updated.removedScaffoldIds,
        ),
        completedBuildStepIds: updated.completedBuildStepIds.filter((id) => id !== 'remove-scaffolding'),
      }
    }
    case 'SET_SCAFFOLD_CAMERA':
      return { ...state, scaffoldCameraPreset: action.preset }
    case 'TOGGLE_SCAFFOLD_HINT':
      return { ...state, scaffoldHintVisible: !state.scaffoldHintVisible }
    case 'CHECK_SCAFFOLDING': {
      const validation = validationStatusForScaffolding(
        state.selectedEnclosurePart,
        state.removedScaffoldIds,
      )
      const complete = validation === 'complete'
      return {
        ...state,
        scaffoldValidation: validation,
        completedBuildStepIds: complete && !state.completedBuildStepIds.includes('remove-scaffolding')
          ? [...state.completedBuildStepIds, 'remove-scaffolding']
          : state.completedBuildStepIds,
      }
    }
    case 'SELECT_LAYOUT_PART':
      return action.partId === null || isLayoutPartId(action.partId)
        ? { ...state, selectedLayoutPartId: action.partId, layoutValidation: 'idle' }
        : state
    case 'SELECT_LAYOUT_TARGET':
      return validLayoutTargetId(action.targetId)
        ? { ...state, selectedLayoutTargetId: action.targetId, layoutValidation: 'idle' }
        : state
    case 'PLACE_LAYOUT_PART': {
      const placement = action.placement
      if (!isValidNormalizedPlacement(placement)) return state
      const nextPlacement: ComponentPlacement = {
        ...placement,
        rotation: normalizeRotation(placement.rotation),
      }
      const nextPlacements = [
        ...state.layoutPlacements.filter((item) => item.partId !== nextPlacement.partId),
        nextPlacement,
      ]
      return {
        ...state,
        layoutPlacements: nextPlacements,
        selectedLayoutPartId: nextPlacement.partId,
        selectedLayoutTargetId: nextPlacement.targetId,
        layoutUndoHistory: [...state.layoutUndoHistory, snapshotLayout(state)],
        layoutRedoHistory: [],
        layoutValidation: 'idle',
        completedBuildStepIds: state.completedBuildStepIds.filter((id) => id !== 'parts-layout'),
      }
    }
    case 'RETURN_LAYOUT_PART_TO_TRAY': {
      if (!isLayoutPartId(action.partId) || !state.layoutPlacements.some((item) => item.partId === action.partId)) return state
      return {
        ...state,
        layoutPlacements: state.layoutPlacements.filter((item) => item.partId !== action.partId),
        selectedLayoutPartId: action.partId,
        selectedLayoutTargetId: null,
        layoutUndoHistory: [...state.layoutUndoHistory, snapshotLayout(state)],
        layoutRedoHistory: [],
        layoutValidation: 'idle',
        completedBuildStepIds: state.completedBuildStepIds.filter((id) => id !== 'parts-layout'),
      }
    }
    case 'ROTATE_LAYOUT_PART': {
      if (!isLayoutPartId(action.partId)) return state
      const placement = state.layoutPlacements.find((item) => item.partId === action.partId)
      if (!placement) return state
      return {
        ...state,
        layoutPlacements: state.layoutPlacements.map((item) => item.partId === action.partId
          ? { ...item, rotation: normalizeRotation(item.rotation + action.delta) }
          : item),
        layoutUndoHistory: [...state.layoutUndoHistory, snapshotLayout(state)],
        layoutRedoHistory: [],
        layoutValidation: 'idle',
        completedBuildStepIds: state.completedBuildStepIds.filter((id) => id !== 'parts-layout'),
      }
    }
    case 'SET_COIN_CELL_FACE': {
      const coin = state.layoutPlacements.find((item) => item.partId === 'cr1220')
      if (!coin) return state
      return {
        ...state,
        layoutPlacements: state.layoutPlacements.map((item) => item.partId === 'cr1220' ? { ...item, face: action.face } : item),
        layoutUndoHistory: [...state.layoutUndoHistory, snapshotLayout(state)],
        layoutRedoHistory: [],
        layoutValidation: 'idle',
        completedBuildStepIds: state.completedBuildStepIds.filter((id) => id !== 'parts-layout'),
      }
    }
    case 'SET_LAYOUT_COMPARISON_MODE':
      return validLayoutComparisonMode(action.mode) ? { ...state, layoutComparisonMode: action.mode } : state
    case 'SET_LAYOUT_VIEW':
      return {
        ...state,
        layoutZoom: Math.min(2.4, Math.max(0.7, action.zoom)),
        layoutPan: [
          Math.min(220, Math.max(-220, action.pan[0])),
          Math.min(220, Math.max(-220, action.pan[1])),
        ],
      }
    case 'TOGGLE_LAYOUT_HINT':
      return { ...state, layoutHintVisible: !state.layoutHintVisible }
    case 'TOGGLE_LAYOUT_TARGET_OUTLINES':
      return { ...state, layoutTargetOutlinesVisible: !state.layoutTargetOutlinesVisible }
    case 'UNDO_LAYOUT': {
      const snapshot = state.layoutUndoHistory[state.layoutUndoHistory.length - 1]
      return snapshot ? applyLayoutSnapshot(state, snapshot, 'layoutUndoHistory') : state
    }
    case 'REDO_LAYOUT': {
      const snapshot = state.layoutRedoHistory[state.layoutRedoHistory.length - 1]
      return snapshot ? applyLayoutSnapshot(state, snapshot, 'layoutRedoHistory') : state
    }
    case 'RESET_LAYOUT':
      return {
        ...state,
        layoutPlacements: [],
        selectedLayoutPartId: null,
        selectedLayoutTargetId: null,
        layoutUndoHistory: [...state.layoutUndoHistory, snapshotLayout(state)],
        layoutRedoHistory: [],
        layoutValidation: 'idle',
        completedBuildStepIds: state.completedBuildStepIds.filter((id) => id !== 'parts-layout'),
      }
    case 'CHECK_LAYOUT': {
      const result = validateLayout(state.layoutPlacements)
      return {
        ...state,
        layoutValidation: result.status,
        completedBuildStepIds: result.status === 'valid' && !state.completedBuildStepIds.includes('parts-layout')
          ? [...state.completedBuildStepIds, 'parts-layout']
          : state.completedBuildStepIds,
      }
    }
    case 'SELECT_CONNECTION':
      return action.connectionId === null || isConnectionId(action.connectionId)
        ? { ...state, selectedConnectionId: action.connectionId, selectedConnectionEndpoint: action.connectionId ? 'a' : null, connectionValidation: 'idle' }
        : state
    case 'SELECT_CONNECTION_ENDPOINT':
      return { ...state, selectedConnectionEndpoint: action.endpoint }
    case 'SET_CONNECTION_ENDPOINT': {
      if (!isConnectionId(action.connectionId)) return state
      const connection = state.step6Connections.find((item) => item.cableId === action.connectionId)
      if (!connection) return state
      if (action.connectorId !== null) {
        if (!CONNECTOR_BY_ID.has(action.connectorId) || !connectorIsCompatible(connection, action.connectorId)) {
          return { ...state, connectionValidation: 'incompatible-connector' }
        }
        if (connectorIsOccupied(state.step6Connections, action.connectorId, action.connectionId)) {
          return { ...state, connectionValidation: 'port-occupied' }
        }
        const otherEndpoint = action.endpoint === 'a' ? connection.endpointB : connection.endpointA
        if (otherEndpoint === action.connectorId) {
          return { ...state, connectionValidation: 'self-connection' }
        }
      }
      return {
        ...state,
        step6Connections: state.step6Connections.map((item) => item.cableId === action.connectionId
          ? { ...item, [action.endpoint === 'a' ? 'endpointA' : 'endpointB']: action.connectorId }
          : item),
        selectedConnectionId: action.connectionId,
        selectedConnectionEndpoint: action.endpoint === 'a' ? 'b' : 'a',
        connectionUndoHistory: [...state.connectionUndoHistory, snapshotConnections(state)],
        connectionRedoHistory: [],
        connectionValidation: 'idle',
        completedBuildStepIds: state.completedBuildStepIds.filter((id) => id !== 'cable-connections'),
      }
    }
    case 'CLEAR_CONNECTION': {
      if (!isConnectionId(action.connectionId) || !state.step6Connections.some((item) => item.cableId === action.connectionId)) return state
      return {
        ...state,
        step6Connections: state.step6Connections.map((item) => item.cableId === action.connectionId ? { ...item, endpointA: null, endpointB: null } : item),
        selectedConnectionId: action.connectionId,
        selectedConnectionEndpoint: 'a',
        connectionUndoHistory: [...state.connectionUndoHistory, snapshotConnections(state)],
        connectionRedoHistory: [],
        connectionValidation: 'idle',
        completedBuildStepIds: state.completedBuildStepIds.filter((id) => id !== 'cable-connections'),
      }
    }
    case 'SET_COIN_CELL_INSTALLED': {
      const looseCoin = state.layoutPlacements.find((placement) => placement.partId === 'cr1220')
      if (action.installed && looseCoin?.face !== 'positive-up') {
        return { ...state, connectionValidation: 'coin-face-down' }
      }
      return {
        ...state,
        coinCellInstalled: action.installed,
        connectionUndoHistory: [...state.connectionUndoHistory, snapshotConnections(state)],
        connectionRedoHistory: [],
        connectionValidation: 'idle',
        completedBuildStepIds: state.completedBuildStepIds.filter((id) => id !== 'cable-connections'),
      }
    }
    case 'SET_CONNECTION_COMPARISON_MODE':
      return validConnectionComparisonMode(action.mode) ? { ...state, connectionComparisonMode: action.mode } : state
    case 'TOGGLE_CONNECTION_HINT':
      return { ...state, connectionHintVisible: !state.connectionHintVisible }
    case 'TOGGLE_CONNECTION_LABELS':
      return { ...state, connectionLabelsVisible: !state.connectionLabelsVisible }
    case 'TOGGLE_REQUIRED_PATHS':
      return { ...state, requiredPathsVisible: !state.requiredPathsVisible }
    case 'TOGGLE_CONNECTION_ISOLATION':
      return { ...state, isolateSelectedConnection: !state.isolateSelectedConnection }
    case 'UNDO_CONNECTIONS': {
      const snapshot = state.connectionUndoHistory[state.connectionUndoHistory.length - 1]
      return snapshot ? applyConnectionSnapshot(state, snapshot, 'connectionUndoHistory') : state
    }
    case 'REDO_CONNECTIONS': {
      const snapshot = state.connectionRedoHistory[state.connectionRedoHistory.length - 1]
      return snapshot ? applyConnectionSnapshot(state, snapshot, 'connectionRedoHistory') : state
    }
    case 'RESET_CONNECTIONS':
      return {
        ...state,
        selectedConnectionId: null,
        selectedConnectionEndpoint: null,
        step6Connections: createInitialStep6Connections(),
        coinCellInstalled: false,
        connectionUndoHistory: [...state.connectionUndoHistory, snapshotConnections(state)],
        connectionRedoHistory: [],
        connectionValidation: 'idle',
        completedBuildStepIds: state.completedBuildStepIds.filter((id) => id !== 'cable-connections'),
      }
    case 'CHECK_CONNECTIONS': {
      const validation = validateConnectionGraph(state.layoutPlacements, state.step6Connections, state.coinCellInstalled)
      return {
        ...state,
        connectionValidation: validation.status,
        completedBuildStepIds: validation.status === 'valid' && !state.completedBuildStepIds.includes('cable-connections')
          ? [...state.completedBuildStepIds, 'cable-connections']
          : state.completedBuildStepIds,
      }
    }
    case 'RESET_PROGRESS':
      return { ...INITIAL_LAB_STATE, mode: state.mode, guidance: state.guidance }
    default:
      return state
  }
}

export function validatePersistedState(value: unknown): LabState | null {
  if (!value || typeof value !== 'object') return null

  const candidate = value as Partial<LabState>
  const persistedVersion = (value as { version?: unknown }).version
  // Preserve completed Phase 2A work from the immediately preceding state
  // schema while adding empty, deterministic Phase 2B layout state.
  if (persistedVersion === 2) {
    const migrated = {
      ...INITIAL_LAB_STATE,
      ...candidate,
      version: 3,
      selectedLayoutPartId: null,
      selectedLayoutTargetId: null,
      layoutPlacements: [],
      layoutComparisonMode: 'diagram' as const,
      layoutZoom: 1,
      layoutPan: [0, 0] as const,
      layoutHintVisible: false,
      layoutTargetOutlinesVisible: true,
      layoutValidation: 'idle' as const,
      layoutUndoHistory: [],
      layoutRedoHistory: [],
    }
    return validatePersistedState(migrated)
  }
  if (persistedVersion === 3) {
    const migrated = {
      ...INITIAL_LAB_STATE,
      ...candidate,
      version: 4 as const,
      selectedConnectionId: null,
      selectedConnectionEndpoint: null,
      step6Connections: createInitialStep6Connections(),
      coinCellInstalled: false,
      connectionComparisonMode: 'diagram' as const,
      connectionHintVisible: false,
      connectionLabelsVisible: true,
      requiredPathsVisible: false,
      isolateSelectedConnection: false,
      connectionValidation: 'idle' as const,
      connectionUndoHistory: [],
      connectionRedoHistory: [],
    }
    return validatePersistedState(migrated)
  }
  if (
    persistedVersion !== 4 ||
    (candidate.mode !== 'intro' && candidate.mode !== 'build') ||
    !validStepId(candidate.activeBuildStepId ?? '') ||
    !validPartId(candidate.selectedPartId ?? '') ||
    !validPhotoId(candidate.selectedPhotoId ?? '') ||
    !Array.isArray(candidate.completedBuildStepIds) ||
    !candidate.completedBuildStepIds.every((id) => typeof id === 'string' && validStepId(id)) ||
    new Set(candidate.completedBuildStepIds).size !== candidate.completedBuildStepIds.length ||
    (candidate.guidance !== 'beginner' &&
      candidate.guidance !== 'standard' &&
      candidate.guidance !== 'expert') ||
    (candidate.workspaceView !== 'diagram' && candidate.workspaceView !== 'photos') ||
    !validEnclosurePartId(candidate.selectedEnclosurePart ?? '') ||
    !Array.isArray(candidate.removedScaffoldIds) ||
    !candidate.removedScaffoldIds.every((id) => typeof id === 'string' && scaffoldTargetIsRemovable(id)) ||
    new Set(candidate.removedScaffoldIds).size !== candidate.removedScaffoldIds.length ||
    !validScaffoldId(candidate.selectedScaffoldId ?? null) ||
    !CAMERA_PRESETS.includes(candidate.scaffoldCameraPreset ?? 'fit') ||
    typeof candidate.scaffoldHintVisible !== 'boolean' ||
    !['idle', 'top-incomplete', 'bottom-incomplete', 'top-complete', 'bottom-complete', 'complete', 'permanent-protected', 'nothing-selected', 'already-removed'].includes(candidate.scaffoldValidation ?? '') ||
    !Array.isArray(candidate.scaffoldUndoHistory) ||
    !candidate.scaffoldUndoHistory.every(validHistoryEntry) ||
    !Array.isArray(candidate.scaffoldRedoHistory) ||
    !candidate.scaffoldRedoHistory.every(validHistoryEntry) ||
    (candidate.selectedLayoutPartId !== null && !isLayoutPartId(candidate.selectedLayoutPartId ?? null)) ||
    !validLayoutTargetId(candidate.selectedLayoutTargetId ?? null) ||
    !Array.isArray(candidate.layoutPlacements) ||
    !candidate.layoutPlacements.every(isValidNormalizedPlacement) ||
    new Set(candidate.layoutPlacements.map((placement) => placement.partId)).size !== candidate.layoutPlacements.length ||
    !validLayoutComparisonMode(candidate.layoutComparisonMode) ||
    typeof candidate.layoutZoom !== 'number' ||
    !Array.isArray(candidate.layoutPan) ||
    candidate.layoutPan.length !== 2 ||
    !candidate.layoutPan.every((coordinate) => typeof coordinate === 'number' && Number.isFinite(coordinate)) ||
    typeof candidate.layoutHintVisible !== 'boolean' ||
    typeof candidate.layoutTargetOutlinesVisible !== 'boolean' ||
    !['idle', 'incomplete', 'valid', 'wrong-part', 'wrong-orientation', 'coin-face-down', 'target-occupied', 'cables-not-available'].includes(candidate.layoutValidation ?? '') ||
    !Array.isArray(candidate.layoutUndoHistory) ||
    !candidate.layoutUndoHistory.every(validLayoutHistoryEntry) ||
    !Array.isArray(candidate.layoutRedoHistory) ||
    !candidate.layoutRedoHistory.every(validLayoutHistoryEntry) ||
    (candidate.selectedConnectionId !== null && !isConnectionId(candidate.selectedConnectionId ?? null)) ||
    (candidate.selectedConnectionEndpoint !== null && candidate.selectedConnectionEndpoint !== 'a' && candidate.selectedConnectionEndpoint !== 'b') ||
    !Array.isArray(candidate.step6Connections) ||
    candidate.step6Connections.length !== createInitialStep6Connections().length ||
    !candidate.step6Connections.every(validConnectionState) ||
    new Set(candidate.step6Connections.map((connection) => connection.cableId)).size !== candidate.step6Connections.length ||
    !validConnectionComparisonMode(candidate.connectionComparisonMode) ||
    typeof candidate.coinCellInstalled !== 'boolean' ||
    typeof candidate.connectionHintVisible !== 'boolean' ||
    typeof candidate.connectionLabelsVisible !== 'boolean' ||
    typeof candidate.requiredPathsVisible !== 'boolean' ||
    typeof candidate.isolateSelectedConnection !== 'boolean' ||
    !['idle', 'layout-incomplete', 'incomplete', 'incompatible-connector', 'port-occupied', 'self-connection', 'wrong-topology', 'coin-not-installed', 'coin-face-down', 'valid'].includes(candidate.connectionValidation ?? '') ||
    !Array.isArray(candidate.connectionUndoHistory) ||
    !candidate.connectionUndoHistory.every(validConnectionHistoryEntry) ||
    !Array.isArray(candidate.connectionRedoHistory) ||
    !candidate.connectionRedoHistory.every(validConnectionHistoryEntry)
  ) {
    return null
  }

  return candidate as LabState
}
