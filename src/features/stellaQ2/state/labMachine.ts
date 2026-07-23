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
import {
  createInitialEnclosurePlacements,
  isEnclosurePartId,
  isValidEnclosurePlacement,
  stagingPlacementFor,
  validateEnclosure,
} from '../utils/enclosure'
import { ENCLOSURE_CAMERA_PRESETS, ENCLOSURE_SLOT_BY_ID } from '../data/enclosure'
import { RETAINER_CAMERA_PRESETS, RETAINER_BY_ID, RETAINER_TARGET_BY_ID } from '../data/retainers'
import { createInitialRetainerInstallations, isRetainerId, isValidRetainerInstallation, retainerInstallationFor, validateRetainers } from '../utils/retainers'
import { ROUTING_CAMERA_PRESETS, ROUTING_CORRIDOR_BY_ID } from '../data/routing'
import { createLooseCableRoutes, isRoutingCableId, isValidCableRouteState, suggestedRouteFor, validateCableRoute, validateRoutingStep } from '../utils/routing'
import { BOTTOM_COVER_TARGET, COVER_CAMERA_PRESETS, COVER_COMPARISON_MODES, COVER_LATCHES, createInitialBottomCoverState, createInitialCoverLatches } from '../data/coverInstallation'
import { coverAlignmentStatus, coverHistoryEntry, isCoverLatchId, isValidBottomCoverState, isValidCoverHistoryEntry, isValidCoverLatches, validateBottomCoverInstallation, validateCoverClearance } from '../utils/coverInstallation'
import type {
  CableConnectionState,
  ComponentPlacement,
  ConnectionHistoryEntry,
  EnclosureHistoryEntry,
  EnclosurePartId,
  RetainerHistoryEntry,
  RoutingHistoryEntry,
  CoverHistoryEntry,
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
  version: 8,
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
  selectedEnclosureComponentId: null,
  selectedEnclosureSlotId: null,
  enclosurePlacements: createInitialEnclosurePlacements(),
  microSdInstalled: false,
  enclosureCameraPreset: 'fit',
  enclosureComparisonMode: 'workspace',
  enclosureHintVisible: false,
  enclosureTargetsVisible: true,
  enclosureCablesVisible: true,
  enclosureTransparentHousing: false,
  enclosureWireframeHousing: false,
  enclosureIsolateSelected: false,
  enclosureValidation: 'idle',
  enclosureUndoHistory: [],
  enclosureRedoHistory: [],
  selectedRetainerId: null,
  selectedRetainerTargetId: null,
  retainerInstallations: createInitialRetainerInstallations(),
  cableBlockedRetainerIds: [],
  retainerCameraPreset: 'fit',
  retainerComparisonMode: 'workspace',
  retainerHintVisible: false,
  retainerTargetsVisible: true,
  retainerCableClearanceVisible: true,
  retainerTransparentHousing: false,
  retainerWireframeHousing: false,
  retainerIsolateSelected: false,
  retainerValidation: 'idle',
  retainerUndoHistory: [],
  retainerRedoHistory: [],
  cableRoutes: createLooseCableRoutes(createInitialStep6Connections(), createInitialEnclosurePlacements()),
  selectedRoutingCableId: null,
  selectedRoutePointIndex: null,
  routingCameraPreset: 'fit',
  routingComparisonMode: 'workspace',
  routingHintVisible: false,
  routingControlPointsVisible: true,
  routingCorridorsVisible: true,
  routingCollisionRegionsVisible: false,
  bottomCoverGhostVisible: false,
  routingTransparentHousing: false,
  routingWireframeHousing: false,
  routingIsolateSelectedCable: false,
  routingValidation: 'idle',
  routingUndoHistory: [],
  routingRedoHistory: [],
  bottomCover: createInitialBottomCoverState(),
  coverLatches: createInitialCoverLatches(),
  selectedCoverLatchId: null,
  coverAlignment: 'idle',
  coverClearanceIssues: [],
  coverCameraPreset: 'fit',
  coverCameraResetCount: 0,
  coverComparisonMode: 'workspace',
  coverHintVisible: false,
  coverTransparent: false,
  coverWireframe: false,
  coverHousingTransparent: false,
  coverMatingPerimeterVisible: true,
  coverLatchTargetsVisible: true,
  coverClearanceRegionsVisible: false,
  coverIsolated: false,
  coverCableIsolation: false,
  coverExplodedView: false,
  coverCrossSectionVisible: false,
  coverValidation: 'idle',
  coverUndoHistory: [],
  coverRedoHistory: [],
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

function validEnclosureComparisonMode(mode: unknown) {
  return mode === 'workspace' || mode === 'build-three' || mode === 'side-by-side' || mode === 'overlay'
}
function validRetainerComparisonMode(mode: unknown) { return mode === 'workspace' || mode === 'build-three' || mode === 'side-by-side' || mode === 'build-four-next' }
function validRetainerTargetId(targetId: string | null) { return targetId === null || RETAINER_TARGET_BY_ID.has(targetId) }
function validRetainerHistoryEntry(value: unknown): value is RetainerHistoryEntry {
  if (!value || typeof value !== 'object') return false
  const entry = value as Partial<RetainerHistoryEntry>
  return Array.isArray(entry.installations) && entry.installations.every(isValidRetainerInstallation)
    && entry.installations.length === createInitialRetainerInstallations().length
    && new Set(entry.installations.map((item) => item.retainerId)).size === entry.installations.length
    && (entry.selectedRetainerId === null || isRetainerId(entry.selectedRetainerId ?? null))
    && validRetainerTargetId(entry.selectedRetainerTargetId ?? null)
    && Array.isArray(entry.cableBlockedRetainerIds) && entry.cableBlockedRetainerIds.every((id) => isRetainerId(id))
}
function validRoutingComparisonMode(mode: unknown) { return mode === 'workspace' || mode === 'build-three' || mode === 'build-four' || mode === 'photos-side-by-side' || mode === 'workspace-build-four' || mode === 'build-four-large' || mode === 'annotated' }
function validCoverComparisonMode(mode: unknown) { return COVER_COMPARISON_MODES.includes(mode as typeof COVER_COMPARISON_MODES[number]) }
function validRoutingHistoryEntry(value: unknown): value is RoutingHistoryEntry {
  if (!value || typeof value !== 'object') return false
  const entry = value as Partial<RoutingHistoryEntry>
  return Array.isArray(entry.routes) && entry.routes.length === 6 && entry.routes.every(isValidCableRouteState)
    && new Set(entry.routes.map((route) => route.cableId)).size === entry.routes.length
    && (entry.selectedCableId === null || isRoutingCableId(entry.selectedCableId ?? null))
    && (entry.selectedRoutePointIndex === null || (typeof entry.selectedRoutePointIndex === 'number' && Number.isInteger(entry.selectedRoutePointIndex) && entry.selectedRoutePointIndex >= 0))
}

function validEnclosureSlotId(slotId: string | null) {
  return slotId === null || ENCLOSURE_SLOT_BY_ID.has(slotId)
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

function validEnclosureHistoryEntry(value: unknown): value is EnclosureHistoryEntry {
  if (!value || typeof value !== 'object') return false
  const entry = value as Partial<EnclosureHistoryEntry>
  return Array.isArray(entry.placements)
    && entry.placements.every(isValidEnclosurePlacement)
    && entry.placements.length === createInitialEnclosurePlacements().length
    && new Set(entry.placements.map((placement) => placement.partId)).size === entry.placements.length
    && (entry.selectedEnclosureComponentId === null || isEnclosurePartId(entry.selectedEnclosureComponentId ?? null))
    && validEnclosureSlotId(entry.selectedEnclosureSlotId ?? null)
    && typeof entry.microSdInstalled === 'boolean'
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

function snapshotEnclosure(state: LabState): EnclosureHistoryEntry {
  return {
    placements: state.enclosurePlacements.map((placement) => ({ ...placement })),
    selectedEnclosureComponentId: state.selectedEnclosureComponentId,
    selectedEnclosureSlotId: state.selectedEnclosureSlotId,
    microSdInstalled: state.microSdInstalled,
  }
}
function snapshotRetainers(state: LabState): RetainerHistoryEntry {
  return { installations: state.retainerInstallations.map((item) => ({ ...item })), selectedRetainerId: state.selectedRetainerId, selectedRetainerTargetId: state.selectedRetainerTargetId, cableBlockedRetainerIds: [...state.cableBlockedRetainerIds] }
}
function snapshotRouting(state: LabState): RoutingHistoryEntry {
  return { routes: state.cableRoutes.map((route) => ({ ...route, controlPointsMm: route.controlPointsMm.map((point) => [...point] as const), corridorIds: [...route.corridorIds], validationIssues: [...route.validationIssues] })), selectedCableId: state.selectedRoutingCableId, selectedRoutePointIndex: state.selectedRoutePointIndex }
}
function applyRoutingSnapshot(state: LabState, snapshot: RoutingHistoryEntry, historyKey: 'routingUndoHistory' | 'routingRedoHistory'): LabState {
  const other = historyKey === 'routingUndoHistory' ? 'routingRedoHistory' : 'routingUndoHistory'
  return { ...state, cableRoutes: snapshot.routes.map((route) => ({ ...route, controlPointsMm: route.controlPointsMm.map((point) => [...point] as const), corridorIds: [...route.corridorIds], validationIssues: [...route.validationIssues] })), selectedRoutingCableId: snapshot.selectedCableId, selectedRoutePointIndex: snapshot.selectedRoutePointIndex, [historyKey]: state[historyKey].slice(0, -1), [other]: [...state[other], snapshotRouting(state)], routingValidation: 'idle', completedBuildStepIds: state.completedBuildStepIds.filter((id) => id !== 'wire-routing') } as LabState
}
function snapshotCover(state: LabState): CoverHistoryEntry {
  return coverHistoryEntry(state.bottomCover, state.coverLatches, state.selectedCoverLatchId, state.coverAlignment, state.coverClearanceIssues)
}
function applyCoverSnapshot(state: LabState, snapshot: CoverHistoryEntry, historyKey: 'coverUndoHistory' | 'coverRedoHistory'): LabState {
  const other = historyKey === 'coverUndoHistory' ? 'coverRedoHistory' : 'coverUndoHistory'
  return {
    ...state,
    bottomCover: { ...snapshot.cover, positionMm: [...snapshot.cover.positionMm], rotation: [...snapshot.cover.rotation] },
    coverLatches: snapshot.latches.map((item) => ({ ...item })),
    selectedCoverLatchId: snapshot.selectedLatchId,
    coverAlignment: snapshot.alignment,
    coverClearanceIssues: [...snapshot.clearanceIssues],
    [historyKey]: state[historyKey].slice(0, -1),
    [other]: [...state[other], snapshotCover(state)],
    coverValidation: 'idle',
    completedBuildStepIds: state.completedBuildStepIds.filter((id) => id !== 'bottom-cover'),
  } as LabState
}
function coverValidationArgs(state: LabState) {
  return {
    layout: state.layoutPlacements,
    connections: state.step6Connections,
    coinInstalled: state.coinCellInstalled,
    placements: state.enclosurePlacements,
    microSdInstalled: state.microSdInstalled,
    retainers: state.retainerInstallations,
    blockedRetainers: state.cableBlockedRetainerIds,
    routes: state.cableRoutes,
    cover: state.bottomCover,
    latches: state.coverLatches,
  }
}
function withCoverHistory(state: LabState, changes: Partial<LabState>): LabState {
  return {
    ...state,
    ...changes,
    coverUndoHistory: [...state.coverUndoHistory, snapshotCover(state)],
    coverRedoHistory: [],
    coverValidation: 'idle',
    completedBuildStepIds: state.completedBuildStepIds.filter((id) => id !== 'bottom-cover'),
  }
}
function applyRetainerSnapshot(state: LabState, snapshot: RetainerHistoryEntry, historyKey: 'retainerUndoHistory' | 'retainerRedoHistory'): LabState {
  const other = historyKey === 'retainerUndoHistory' ? 'retainerRedoHistory' : 'retainerUndoHistory'
  const updated = { ...state, retainerInstallations: snapshot.installations.map((item) => ({ ...item })), selectedRetainerId: snapshot.selectedRetainerId, selectedRetainerTargetId: snapshot.selectedRetainerTargetId, cableBlockedRetainerIds: [...snapshot.cableBlockedRetainerIds], [historyKey]: state[historyKey].slice(0, -1), [other]: [...state[other], snapshotRetainers(state)] } as LabState
  return { ...updated, retainerValidation: 'idle', completedBuildStepIds: updated.completedBuildStepIds.filter((id) => id !== 'retainer-clips') }
}

function applyEnclosureSnapshot(
  state: LabState,
  snapshot: EnclosureHistoryEntry,
  historyKey: 'enclosureUndoHistory' | 'enclosureRedoHistory',
): LabState {
  const otherHistoryKey = historyKey === 'enclosureUndoHistory' ? 'enclosureRedoHistory' : 'enclosureUndoHistory'
  const updated = {
    ...state,
    enclosurePlacements: snapshot.placements.map((placement) => ({ ...placement })),
    selectedEnclosureComponentId: snapshot.selectedEnclosureComponentId,
    selectedEnclosureSlotId: snapshot.selectedEnclosureSlotId,
    microSdInstalled: snapshot.microSdInstalled,
    [historyKey]: state[historyKey].slice(0, -1),
    [otherHistoryKey]: [...state[otherHistoryKey], snapshotEnclosure(state)],
  } as LabState
  const validation = validateEnclosure(updated.layoutPlacements, updated.step6Connections, updated.coinCellInstalled, updated.enclosurePlacements, updated.microSdInstalled)
  return {
    ...updated,
    enclosureValidation: validation.status === 'valid' ? 'idle' : validation.status,
    completedBuildStepIds: validation.status === 'valid'
      ? updated.completedBuildStepIds
      : updated.completedBuildStepIds.filter((id) => id !== 'enclosure-placement'),
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
      if (!validStepId(action.stepId)) return state
      if (action.stepId === 'wire-routing' && state.cableRoutes.every((route) => !route.endpointA || !route.endpointB)) {
        return { ...state, activeBuildStepId: action.stepId, cableRoutes: createLooseCableRoutes(state.step6Connections, state.enclosurePlacements), selectedRoutingCableId: state.step6Connections[0]?.cableId ?? null }
      }
      return { ...state, activeBuildStepId: action.stepId }
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
    case 'SELECT_ENCLOSURE_COMPONENT':
      return action.partId === null || isEnclosurePartId(action.partId)
        ? { ...state, selectedEnclosureComponentId: action.partId, enclosureValidation: 'idle' }
        : state
    case 'SELECT_ENCLOSURE_SLOT':
      return validEnclosureSlotId(action.slotId)
        ? { ...state, selectedEnclosureSlotId: action.slotId, enclosureValidation: 'idle' }
        : state
    case 'PLACE_ENCLOSURE_COMPONENT': {
      if (!isValidEnclosurePlacement(action.placement)) return state
      const placement = action.placement
      const slot = placement.slotId ? ENCLOSURE_SLOT_BY_ID.get(placement.slotId) : undefined
      if (slot && slot.acceptedPartId !== placement.partId) {
        return { ...state, enclosureValidation: 'wrong-slot' }
      }
      if (placement.slotId && state.enclosurePlacements.some((item) => item.partId !== placement.partId && item.slotId === placement.slotId)) {
        return { ...state, enclosureValidation: 'slot-occupied' }
      }
      const updated = {
        ...state,
        enclosurePlacements: state.enclosurePlacements.map((item) => item.partId === placement.partId ? {
          ...placement,
          rotation: [normalizeRotation(placement.rotation[0]), normalizeRotation(placement.rotation[1]), normalizeRotation(placement.rotation[2])] as const,
        } : item),
        selectedEnclosureComponentId: placement.partId,
        selectedEnclosureSlotId: placement.slotId,
        microSdInstalled: placement.partId === 'micro-sd-card' ? Boolean(placement.slotId && placement.seated) : state.microSdInstalled,
        enclosureUndoHistory: [...state.enclosureUndoHistory, snapshotEnclosure(state)],
        enclosureRedoHistory: [],
        enclosureValidation: 'idle' as const,
        completedBuildStepIds: state.completedBuildStepIds.filter((id) => id !== 'enclosure-placement'),
      }
      return updated
    }
    case 'REMOVE_ENCLOSURE_COMPONENT': {
      if (!isEnclosurePartId(action.partId)) return state
      return {
        ...state,
        enclosurePlacements: state.enclosurePlacements.map((placement) => placement.partId === action.partId ? stagingPlacementFor(action.partId) : placement),
        selectedEnclosureComponentId: action.partId,
        selectedEnclosureSlotId: null,
        microSdInstalled: action.partId === 'micro-sd-card' ? false : state.microSdInstalled,
        enclosureUndoHistory: [...state.enclosureUndoHistory, snapshotEnclosure(state)],
        enclosureRedoHistory: [],
        enclosureValidation: 'idle',
        completedBuildStepIds: state.completedBuildStepIds.filter((id) => id !== 'enclosure-placement'),
      }
    }
    case 'ROTATE_ENCLOSURE_COMPONENT': {
      if (!isEnclosurePartId(action.partId)) return state
      return {
        ...state,
        enclosurePlacements: state.enclosurePlacements.map((placement) => placement.partId === action.partId
          ? { ...placement, rotation: [placement.rotation[0], placement.rotation[1], normalizeRotation(placement.rotation[2] + action.delta)] as const, seated: false }
          : placement),
        enclosureUndoHistory: [...state.enclosureUndoHistory, snapshotEnclosure(state)],
        enclosureRedoHistory: [],
        enclosureValidation: 'idle',
        completedBuildStepIds: state.completedBuildStepIds.filter((id) => id !== 'enclosure-placement'),
      }
    }
    case 'SET_MICRO_SD_INSTALLED':
      return {
        ...state,
        microSdInstalled: action.installed,
        enclosureUndoHistory: [...state.enclosureUndoHistory, snapshotEnclosure(state)],
        enclosureRedoHistory: [],
        enclosureValidation: 'idle',
        completedBuildStepIds: state.completedBuildStepIds.filter((id) => id !== 'enclosure-placement'),
      }
    case 'SET_ENCLOSURE_CAMERA':
      return ENCLOSURE_CAMERA_PRESETS.includes(action.preset) ? { ...state, enclosureCameraPreset: action.preset } : state
    case 'SET_ENCLOSURE_COMPARISON_MODE':
      return validEnclosureComparisonMode(action.mode) ? { ...state, enclosureComparisonMode: action.mode } : state
    case 'TOGGLE_ENCLOSURE_HINT': return { ...state, enclosureHintVisible: !state.enclosureHintVisible }
    case 'TOGGLE_ENCLOSURE_TARGETS': return { ...state, enclosureTargetsVisible: !state.enclosureTargetsVisible }
    case 'TOGGLE_ENCLOSURE_CABLES': return { ...state, enclosureCablesVisible: !state.enclosureCablesVisible }
    case 'TOGGLE_ENCLOSURE_TRANSPARENCY': return { ...state, enclosureTransparentHousing: !state.enclosureTransparentHousing }
    case 'TOGGLE_ENCLOSURE_WIREFRAME': return { ...state, enclosureWireframeHousing: !state.enclosureWireframeHousing }
    case 'TOGGLE_ENCLOSURE_ISOLATION': return { ...state, enclosureIsolateSelected: !state.enclosureIsolateSelected }
    case 'UNDO_ENCLOSURE': {
      const snapshot = state.enclosureUndoHistory[state.enclosureUndoHistory.length - 1]
      return snapshot ? applyEnclosureSnapshot(state, snapshot, 'enclosureUndoHistory') : state
    }
    case 'REDO_ENCLOSURE': {
      const snapshot = state.enclosureRedoHistory[state.enclosureRedoHistory.length - 1]
      return snapshot ? applyEnclosureSnapshot(state, snapshot, 'enclosureRedoHistory') : state
    }
    case 'RESET_ENCLOSURE':
      return {
        ...state,
        selectedEnclosureComponentId: null,
        selectedEnclosureSlotId: null,
        enclosurePlacements: createInitialEnclosurePlacements(),
        microSdInstalled: false,
        enclosureUndoHistory: [...state.enclosureUndoHistory, snapshotEnclosure(state)],
        enclosureRedoHistory: [],
        enclosureValidation: 'idle',
        completedBuildStepIds: state.completedBuildStepIds.filter((id) => id !== 'enclosure-placement'),
      }
    case 'CHECK_ENCLOSURE': {
      const validation = validateEnclosure(state.layoutPlacements, state.step6Connections, state.coinCellInstalled, state.enclosurePlacements, state.microSdInstalled)
      return {
        ...state,
        enclosureValidation: validation.status,
        completedBuildStepIds: validation.status === 'valid' && !state.completedBuildStepIds.includes('enclosure-placement')
          ? [...state.completedBuildStepIds, 'enclosure-placement']
          : state.completedBuildStepIds,
      }
    }
    case 'SELECT_RETAINER':
      return action.retainerId === null || isRetainerId(action.retainerId) ? { ...state, selectedRetainerId: action.retainerId, retainerValidation: 'idle' } : state
    case 'SELECT_RETAINER_TARGET':
      return validRetainerTargetId(action.targetId) ? { ...state, selectedRetainerTargetId: action.targetId, retainerValidation: 'idle' } : state
    case 'PLACE_RETAINER': {
      if (!isValidRetainerInstallation(action.installation)) return state
      const retainer = RETAINER_BY_ID.get(action.installation.retainerId)!
      if (action.installation.targetId && action.installation.targetId !== `${retainer.id}-target`) return { ...state, retainerValidation: 'wrong-target' }
      if (action.installation.targetId && state.retainerInstallations.some((item) => item.retainerId !== retainer.id && item.targetId === action.installation.targetId)) return { ...state, retainerValidation: 'target-occupied' }
      return { ...state, retainerInstallations: state.retainerInstallations.map((item) => item.retainerId === retainer.id ? action.installation : item), selectedRetainerId: retainer.id, selectedRetainerTargetId: action.installation.targetId, retainerUndoHistory: [...state.retainerUndoHistory, snapshotRetainers(state)], retainerRedoHistory: [], retainerValidation: 'idle', completedBuildStepIds: state.completedBuildStepIds.filter((id) => id !== 'retainer-clips') }
    }
    case 'REMOVE_RETAINER': {
      if (!isRetainerId(action.retainerId)) return state
      const tray = createInitialRetainerInstallations().find((item) => item.retainerId === action.retainerId)!
      return { ...state, retainerInstallations: state.retainerInstallations.map((item) => item.retainerId === action.retainerId ? tray : item), selectedRetainerId: action.retainerId, selectedRetainerTargetId: null, retainerUndoHistory: [...state.retainerUndoHistory, snapshotRetainers(state)], retainerRedoHistory: [], retainerValidation: 'idle', completedBuildStepIds: state.completedBuildStepIds.filter((id) => id !== 'retainer-clips') }
    }
    case 'ROTATE_RETAINER': {
      if (!isRetainerId(action.retainerId)) return state
      return { ...state, retainerInstallations: state.retainerInstallations.map((item) => item.retainerId === action.retainerId ? { ...item, rotation: [item.rotation[0], item.rotation[1], normalizeRotation(item.rotation[2] + action.delta)], installationState: 'aligned' } : item), retainerUndoHistory: [...state.retainerUndoHistory, snapshotRetainers(state)], retainerRedoHistory: [], retainerValidation: 'idle', completedBuildStepIds: state.completedBuildStepIds.filter((id) => id !== 'retainer-clips') }
    }
    case 'TOGGLE_RETAINER_CABLE_CLEARANCE':
      return isRetainerId(action.retainerId) ? { ...state, cableBlockedRetainerIds: state.cableBlockedRetainerIds.includes(action.retainerId) ? state.cableBlockedRetainerIds.filter((id) => id !== action.retainerId) : [...state.cableBlockedRetainerIds, action.retainerId], retainerUndoHistory: [...state.retainerUndoHistory, snapshotRetainers(state)], retainerRedoHistory: [], retainerValidation: 'idle' } : state
    case 'SET_RETAINER_CAMERA': return RETAINER_CAMERA_PRESETS.includes(action.preset) ? { ...state, retainerCameraPreset: action.preset } : state
    case 'SET_RETAINER_COMPARISON_MODE': return validRetainerComparisonMode(action.mode) ? { ...state, retainerComparisonMode: action.mode } : state
    case 'TOGGLE_RETAINER_HINT': return { ...state, retainerHintVisible: !state.retainerHintVisible }
    case 'TOGGLE_RETAINER_TARGETS': return { ...state, retainerTargetsVisible: !state.retainerTargetsVisible }
    case 'TOGGLE_RETAINER_CLEARANCES': return { ...state, retainerCableClearanceVisible: !state.retainerCableClearanceVisible }
    case 'TOGGLE_RETAINER_TRANSPARENCY': return { ...state, retainerTransparentHousing: !state.retainerTransparentHousing }
    case 'TOGGLE_RETAINER_WIREFRAME': return { ...state, retainerWireframeHousing: !state.retainerWireframeHousing }
    case 'TOGGLE_RETAINER_ISOLATION': return { ...state, retainerIsolateSelected: !state.retainerIsolateSelected }
    case 'UNDO_RETAINER': { const snapshot = state.retainerUndoHistory[state.retainerUndoHistory.length - 1]; return snapshot ? applyRetainerSnapshot(state, snapshot, 'retainerUndoHistory') : state }
    case 'REDO_RETAINER': { const snapshot = state.retainerRedoHistory[state.retainerRedoHistory.length - 1]; return snapshot ? applyRetainerSnapshot(state, snapshot, 'retainerRedoHistory') : state }
    case 'RESET_RETAINERS': return { ...state, selectedRetainerId: null, selectedRetainerTargetId: null, retainerInstallations: createInitialRetainerInstallations(), cableBlockedRetainerIds: [], retainerUndoHistory: [...state.retainerUndoHistory, snapshotRetainers(state)], retainerRedoHistory: [], retainerValidation: 'idle', completedBuildStepIds: state.completedBuildStepIds.filter((id) => id !== 'retainer-clips') }
    case 'CHECK_RETAINERS': {
      const validation = validateRetainers(state.layoutPlacements, state.step6Connections, state.coinCellInstalled, state.enclosurePlacements, state.microSdInstalled, state.retainerInstallations, state.cableBlockedRetainerIds)
      return { ...state, retainerValidation: validation.status, completedBuildStepIds: validation.status === 'valid' && !state.completedBuildStepIds.includes('retainer-clips') ? [...state.completedBuildStepIds, 'retainer-clips'] : state.completedBuildStepIds }
    }
    case 'INITIALIZE_ROUTING':
      return { ...state, cableRoutes: createLooseCableRoutes(state.step6Connections, state.enclosurePlacements), selectedRoutingCableId: state.step6Connections[0]?.cableId ?? null, selectedRoutePointIndex: null, routingValidation: 'idle', routingUndoHistory: [], routingRedoHistory: [] }
    case 'SELECT_ROUTING_CABLE':
      return action.cableId === null || isRoutingCableId(action.cableId) ? { ...state, selectedRoutingCableId: action.cableId, selectedRoutePointIndex: null, routingValidation: 'idle' } : state
    case 'SELECT_ROUTE_POINT':
      return action.index === null || (Number.isInteger(action.index) && action.index >= 0) ? { ...state, selectedRoutePointIndex: action.index } : state
    case 'ADD_ROUTE_POINT': {
      if (!isRoutingCableId(action.cableId)) return state
      const corridor = action.corridorId ? ROUTING_CORRIDOR_BY_ID.get(action.corridorId) : undefined
      const point = action.pointMm ?? corridor?.preferredControlPointMm ?? [0, 0, 20]
      const route = state.cableRoutes.find((item) => item.cableId === action.cableId)
      if (!route) return state
      return { ...state, cableRoutes: state.cableRoutes.map((item) => item.cableId === action.cableId ? { ...item, controlPointsMm: [...item.controlPointsMm, point], corridorIds: corridor && !item.corridorIds.includes(corridor.id) ? [...item.corridorIds, corridor.id] : item.corridorIds, status: 'editing', validationStatus: 'idle', validationIssues: [] } : item), selectedRoutingCableId: action.cableId, selectedRoutePointIndex: route.controlPointsMm.length, routingUndoHistory: [...state.routingUndoHistory, snapshotRouting(state)], routingRedoHistory: [], routingValidation: 'idle', completedBuildStepIds: state.completedBuildStepIds.filter((id) => id !== 'wire-routing') }
    }
    case 'MOVE_ROUTE_POINT': {
      if (!isRoutingCableId(action.cableId) || action.index < 0) return state
      const route = state.cableRoutes.find((item) => item.cableId === action.cableId)
      if (!route || action.index >= route.controlPointsMm.length) return state
      return { ...state, cableRoutes: state.cableRoutes.map((item) => item.cableId === action.cableId ? { ...item, controlPointsMm: item.controlPointsMm.map((point, index) => index === action.index ? action.pointMm : point), status: 'editing', validationStatus: 'idle', validationIssues: [] } : item), selectedRoutingCableId: action.cableId, selectedRoutePointIndex: action.index, routingUndoHistory: [...state.routingUndoHistory, snapshotRouting(state)], routingRedoHistory: [], routingValidation: 'idle', completedBuildStepIds: state.completedBuildStepIds.filter((id) => id !== 'wire-routing') }
    }
    case 'REMOVE_ROUTE_POINT': {
      if (!isRoutingCableId(action.cableId) || action.index < 0) return state
      const route = state.cableRoutes.find((item) => item.cableId === action.cableId)
      if (!route || action.index >= route.controlPointsMm.length) return state
      return { ...state, cableRoutes: state.cableRoutes.map((item) => item.cableId === action.cableId ? { ...item, controlPointsMm: item.controlPointsMm.filter((_, index) => index !== action.index), status: 'editing', validationStatus: 'idle', validationIssues: [] } : item), selectedRoutePointIndex: null, routingUndoHistory: [...state.routingUndoHistory, snapshotRouting(state)], routingRedoHistory: [], routingValidation: 'idle', completedBuildStepIds: state.completedBuildStepIds.filter((id) => id !== 'wire-routing') }
    }
    case 'MOVE_ROUTE_CORRIDOR': {
      const route = state.cableRoutes.find((item) => item.cableId === action.cableId)
      if (!route || action.corridorIndex < 0 || action.corridorIndex >= route.corridorIds.length) return state
      const nextIndex = Math.max(0, Math.min(route.corridorIds.length - 1, action.corridorIndex + action.direction))
      if (nextIndex === action.corridorIndex) return state
      const next = [...route.corridorIds]; [next[action.corridorIndex], next[nextIndex]] = [next[nextIndex], next[action.corridorIndex]]
      return { ...state, cableRoutes: state.cableRoutes.map((item) => item.cableId === route.cableId ? { ...item, corridorIds: next, status: 'editing', validationStatus: 'idle', validationIssues: [] } : item), routingUndoHistory: [...state.routingUndoHistory, snapshotRouting(state)], routingRedoHistory: [], routingValidation: 'idle' }
    }
    case 'APPLY_SUGGESTED_ROUTE': {
      const connection = state.step6Connections.find((item) => item.cableId === action.cableId)
      if (!connection) return state
      const suggested = suggestedRouteFor(connection, state.enclosurePlacements)
      return { ...state, cableRoutes: state.cableRoutes.map((item) => item.cableId === action.cableId ? suggested : item), selectedRoutingCableId: action.cableId, selectedRoutePointIndex: null, routingUndoHistory: [...state.routingUndoHistory, snapshotRouting(state)], routingRedoHistory: [], routingValidation: 'idle', completedBuildStepIds: state.completedBuildStepIds.filter((id) => id !== 'wire-routing') }
    }
    case 'RESET_SELECTED_ROUTE': {
      const loose = createLooseCableRoutes(state.step6Connections, state.enclosurePlacements).find((item) => item.cableId === action.cableId)
      if (!loose) return state
      return { ...state, cableRoutes: state.cableRoutes.map((item) => item.cableId === action.cableId ? loose : item), selectedRoutingCableId: action.cableId, selectedRoutePointIndex: null, routingUndoHistory: [...state.routingUndoHistory, snapshotRouting(state)], routingRedoHistory: [], routingValidation: 'idle', completedBuildStepIds: state.completedBuildStepIds.filter((id) => id !== 'wire-routing') }
    }
    case 'MARK_ROUTE_READY':
      return isRoutingCableId(action.cableId) ? { ...state, cableRoutes: state.cableRoutes.map((item) => item.cableId === action.cableId ? { ...item, status: 'routed', validationStatus: 'idle', validationIssues: [] } : item), routingUndoHistory: [...state.routingUndoHistory, snapshotRouting(state)], routingRedoHistory: [], routingValidation: 'idle', completedBuildStepIds: state.completedBuildStepIds.filter((id) => id !== 'wire-routing') } : state
    case 'CHECK_SELECTED_ROUTE': {
      const route = state.cableRoutes.find((item) => item.cableId === action.cableId)
      const connection = state.step6Connections.find((item) => item.cableId === action.cableId)
      if (!route) return state
      const result = validateCableRoute(route, connection, state.enclosurePlacements, state.retainerInstallations, state.cableBlockedRetainerIds)
      return { ...state, cableRoutes: state.cableRoutes.map((item) => item.cableId === action.cableId ? { ...item, validationStatus: result.status, validationIssues: result.issues } : item), routingValidation: result.status === 'valid' ? 'idle' : result.status === 'missing-route' ? 'incomplete' : result.status }
    }
    case 'SET_ROUTING_CAMERA': return ROUTING_CAMERA_PRESETS.includes(action.preset) ? { ...state, routingCameraPreset: action.preset } : state
    case 'SET_ROUTING_COMPARISON_MODE': return validRoutingComparisonMode(action.mode) ? { ...state, routingComparisonMode: action.mode } : state
    case 'TOGGLE_ROUTING_HINT': return { ...state, routingHintVisible: !state.routingHintVisible }
    case 'TOGGLE_ROUTING_CONTROL_POINTS': return { ...state, routingControlPointsVisible: !state.routingControlPointsVisible }
    case 'TOGGLE_ROUTING_CORRIDORS': return { ...state, routingCorridorsVisible: !state.routingCorridorsVisible }
    case 'TOGGLE_ROUTING_COLLISIONS': return { ...state, routingCollisionRegionsVisible: !state.routingCollisionRegionsVisible }
    case 'TOGGLE_BOTTOM_COVER_GHOST': return { ...state, bottomCoverGhostVisible: !state.bottomCoverGhostVisible }
    case 'TOGGLE_ROUTING_TRANSPARENCY': return { ...state, routingTransparentHousing: !state.routingTransparentHousing }
    case 'TOGGLE_ROUTING_WIREFRAME': return { ...state, routingWireframeHousing: !state.routingWireframeHousing }
    case 'TOGGLE_ROUTING_ISOLATION': return { ...state, routingIsolateSelectedCable: !state.routingIsolateSelectedCable }
    case 'UNDO_ROUTING': { const snapshot = state.routingUndoHistory[state.routingUndoHistory.length - 1]; return snapshot ? applyRoutingSnapshot(state, snapshot, 'routingUndoHistory') : state }
    case 'REDO_ROUTING': { const snapshot = state.routingRedoHistory[state.routingRedoHistory.length - 1]; return snapshot ? applyRoutingSnapshot(state, snapshot, 'routingRedoHistory') : state }
    case 'RESET_ROUTING': return { ...state, cableRoutes: createLooseCableRoutes(state.step6Connections, state.enclosurePlacements), selectedRoutePointIndex: null, routingValidation: 'idle', routingUndoHistory: [...state.routingUndoHistory, snapshotRouting(state)], routingRedoHistory: [], completedBuildStepIds: state.completedBuildStepIds.filter((id) => id !== 'wire-routing') }
    case 'CHECK_ROUTING': {
      const validation = validateRoutingStep({ layout: state.layoutPlacements, connections: state.step6Connections, coinInstalled: state.coinCellInstalled, placements: state.enclosurePlacements, microSdInstalled: state.microSdInstalled, retainers: state.retainerInstallations, blockedRetainers: state.cableBlockedRetainerIds, routes: state.cableRoutes })
      return { ...state, routingValidation: validation.status, completedBuildStepIds: validation.status === 'valid' && !state.completedBuildStepIds.includes('wire-routing') ? [...state.completedBuildStepIds, 'wire-routing'] : state.completedBuildStepIds }
    }
    case 'MOVE_BOTTOM_COVER':
      return withCoverHistory(state, {
        bottomCover: { ...state.bottomCover, positionMm: action.positionMm, state: 'staged', seatingProgress: 0 },
        coverLatches: createInitialCoverLatches(),
        coverAlignment: 'idle',
        coverClearanceIssues: [],
      })
    case 'ROTATE_BOTTOM_COVER':
      return withCoverHistory(state, {
        bottomCover: { ...state.bottomCover, rotation: action.rotation, state: 'staged', seatingProgress: 0 },
        coverLatches: createInitialCoverLatches(),
        coverAlignment: 'idle',
      })
    case 'SET_BOTTOM_COVER_FACE': {
      const rotation = action.face === 'reversed' ? BOTTOM_COVER_TARGET.reversedRotation : BOTTOM_COVER_TARGET.targetRotation
      return withCoverHistory(state, {
        bottomCover: { ...state.bottomCover, rotation, state: 'staged', seatingProgress: 0 },
        coverLatches: createInitialCoverLatches(),
        coverAlignment: action.face === 'reversed' ? 'reversed' : 'idle',
      })
    }
    case 'ALIGN_BOTTOM_COVER': {
      const clearance = validateCoverClearance(coverValidationArgs(state))
      if (!clearance.prerequisiteValid) return { ...state, coverValidation: 'step9-incomplete', coverClearanceIssues: clearance.issues.map((issue) => issue.message) }
      if (!clearance.valid) return { ...state, coverValidation: 'clearance-failed', coverClearanceIssues: clearance.issues.map((issue) => issue.message) }
      const alignment = coverAlignmentStatus({ ...state.bottomCover, positionMm: BOTTOM_COVER_TARGET.alignedPositionMm })
      if (alignment !== 'aligned') return { ...state, coverAlignment: alignment, coverValidation: alignment === 'reversed' ? 'reversed' : 'wrong-rotation' }
      return withCoverHistory(state, {
        bottomCover: { ...state.bottomCover, positionMm: BOTTOM_COVER_TARGET.alignedPositionMm, state: 'aligned', seatingProgress: 0 },
        coverLatches: state.coverLatches.map((item) => ({ ...item, state: 'aligned' })),
        coverAlignment: 'aligned',
        coverClearanceIssues: [],
      })
    }
    case 'PARTIALLY_SEAT_BOTTOM_COVER': {
      const clearance = validateCoverClearance(coverValidationArgs(state))
      if (!clearance.valid || coverAlignmentStatus(state.bottomCover) !== 'aligned') return { ...state, coverValidation: clearance.prerequisiteValid ? 'clearance-failed' : 'step9-incomplete', coverClearanceIssues: clearance.issues.map((issue) => issue.message) }
      const a = BOTTOM_COVER_TARGET.alignedPositionMm; const b = BOTTOM_COVER_TARGET.targetPositionMm
      return withCoverHistory(state, {
        bottomCover: { ...state.bottomCover, positionMm: [a[0], a[1], (a[2] + b[2]) / 2], state: 'partiallySeated', seatingProgress: .5 },
        coverAlignment: 'aligned',
      })
    }
    case 'SEAT_BOTTOM_COVER': {
      const clearance = validateCoverClearance(coverValidationArgs(state))
      if (!clearance.valid) return { ...state, coverValidation: clearance.prerequisiteValid ? 'clearance-failed' : 'step9-incomplete', coverClearanceIssues: clearance.issues.map((issue) => issue.message) }
      if (coverAlignmentStatus(state.bottomCover) !== 'aligned' || state.bottomCover.state === 'staged') return { ...state, coverValidation: 'not-aligned', coverAlignment: coverAlignmentStatus(state.bottomCover) }
      return withCoverHistory(state, {
        bottomCover: { ...state.bottomCover, positionMm: BOTTOM_COVER_TARGET.targetPositionMm, state: 'fullySeated', seatingProgress: 1 },
        coverLatches: state.coverLatches.map((item) => ({ ...item, state: 'aligned' })),
        coverAlignment: 'aligned',
      })
    }
    case 'RETURN_BOTTOM_COVER_TO_STAGING':
      return withCoverHistory(state, { bottomCover: createInitialBottomCoverState(), coverLatches: createInitialCoverLatches(), selectedCoverLatchId: null, coverAlignment: 'idle', coverClearanceIssues: [] })
    case 'SELECT_COVER_LATCH':
      return action.latchId === null || isCoverLatchId(action.latchId) ? { ...state, selectedCoverLatchId: action.latchId } : state
    case 'ENGAGE_COVER_LATCH': {
      if (!isCoverLatchId(action.latchId) || state.bottomCover.state !== 'fullySeated' && state.bottomCover.state !== 'latched') return { ...state, coverValidation: 'not-seated' }
      const clearance = validateCoverClearance(coverValidationArgs(state))
      if (!clearance.valid) return { ...state, coverValidation: clearance.prerequisiteValid ? 'clearance-failed' : 'step9-incomplete', coverClearanceIssues: clearance.issues.map((issue) => issue.message) }
      const latches = state.coverLatches.map((item) => item.latchId === action.latchId ? { ...item, state: 'engaged' as const } : item)
      return withCoverHistory(state, { coverLatches: latches, selectedCoverLatchId: action.latchId, bottomCover: { ...state.bottomCover, state: latches.every((item) => item.state === 'engaged') ? 'latched' : 'fullySeated' } })
    }
    case 'DISENGAGE_COVER_LATCH': {
      if (!isCoverLatchId(action.latchId)) return state
      return withCoverHistory(state, { coverLatches: state.coverLatches.map((item) => item.latchId === action.latchId ? { ...item, state: 'aligned' } : item), bottomCover: { ...state.bottomCover, state: 'fullySeated' }, selectedCoverLatchId: action.latchId })
    }
    case 'ENGAGE_ALL_COVER_LATCHES': {
      if (state.bottomCover.state !== 'fullySeated' && state.bottomCover.state !== 'latched') return { ...state, coverValidation: 'not-seated' }
      const clearance = validateCoverClearance(coverValidationArgs(state))
      if (!clearance.valid) return { ...state, coverValidation: clearance.prerequisiteValid ? 'clearance-failed' : 'step9-incomplete', coverClearanceIssues: clearance.issues.map((issue) => issue.message) }
      return withCoverHistory(state, { coverLatches: state.coverLatches.map((item) => ({ ...item, state: 'engaged' })), bottomCover: { ...state.bottomCover, state: 'latched' } })
    }
    case 'REOPEN_BOTTOM_COVER':
      return withCoverHistory(state, { bottomCover: { ...state.bottomCover, positionMm: BOTTOM_COVER_TARGET.alignedPositionMm, state: 'aligned', seatingProgress: 0 }, coverLatches: state.coverLatches.map((item) => ({ ...item, state: 'aligned' })), coverAlignment: 'aligned' })
    case 'CHECK_COVER_CLEARANCE': {
      const clearance = validateCoverClearance(coverValidationArgs(state))
      return { ...state, coverClearanceIssues: clearance.issues.map((issue) => issue.message), coverValidation: clearance.valid ? 'idle' : clearance.prerequisiteValid ? 'clearance-failed' : 'step9-incomplete' }
    }
    case 'SET_COVER_CAMERA': return COVER_CAMERA_PRESETS.includes(action.preset) ? { ...state, coverCameraPreset: action.preset } : state
    case 'RESET_COVER_CAMERA': return { ...state, coverCameraPreset: 'fit', coverCameraResetCount: state.coverCameraResetCount + 1 }
    case 'SET_COVER_COMPARISON_MODE': return validCoverComparisonMode(action.mode) ? { ...state, coverComparisonMode: action.mode } : state
    case 'TOGGLE_COVER_HINT': return { ...state, coverHintVisible: !state.coverHintVisible }
    case 'TOGGLE_COVER_TRANSPARENCY': return { ...state, coverTransparent: !state.coverTransparent }
    case 'TOGGLE_COVER_WIREFRAME': return { ...state, coverWireframe: !state.coverWireframe }
    case 'TOGGLE_COVER_HOUSING_TRANSPARENCY': return { ...state, coverHousingTransparent: !state.coverHousingTransparent }
    case 'TOGGLE_COVER_MATING_PERIMETER': return { ...state, coverMatingPerimeterVisible: !state.coverMatingPerimeterVisible }
    case 'TOGGLE_COVER_LATCH_TARGETS': return { ...state, coverLatchTargetsVisible: !state.coverLatchTargetsVisible }
    case 'TOGGLE_COVER_CLEARANCE_REGIONS': return { ...state, coverClearanceRegionsVisible: !state.coverClearanceRegionsVisible }
    case 'TOGGLE_COVER_ISOLATION': return { ...state, coverIsolated: !state.coverIsolated }
    case 'TOGGLE_COVER_CABLE_ISOLATION': return { ...state, coverCableIsolation: !state.coverCableIsolation }
    case 'TOGGLE_COVER_EXPLODED': return { ...state, coverExplodedView: !state.coverExplodedView }
    case 'TOGGLE_COVER_CROSS_SECTION': return { ...state, coverCrossSectionVisible: !state.coverCrossSectionVisible }
    case 'UNDO_COVER_INSTALLATION': { const snapshot = state.coverUndoHistory[state.coverUndoHistory.length - 1]; return snapshot ? applyCoverSnapshot(state, snapshot, 'coverUndoHistory') : state }
    case 'REDO_COVER_INSTALLATION': { const snapshot = state.coverRedoHistory[state.coverRedoHistory.length - 1]; return snapshot ? applyCoverSnapshot(state, snapshot, 'coverRedoHistory') : state }
    case 'RESET_COVER_INSTALLATION':
      return withCoverHistory(state, { bottomCover: createInitialBottomCoverState(), coverLatches: createInitialCoverLatches(), selectedCoverLatchId: null, coverAlignment: 'idle', coverClearanceIssues: [] })
    case 'CHECK_COVER_INSTALLATION': {
      const validation = validateBottomCoverInstallation(coverValidationArgs(state))
      return { ...state, coverValidation: validation.status, coverClearanceIssues: validation.status === 'valid' ? [] : validation.messages, completedBuildStepIds: validation.status === 'valid' && !state.completedBuildStepIds.includes('bottom-cover') ? [...state.completedBuildStepIds, 'bottom-cover'] : state.completedBuildStepIds }
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
  // Phase 2D adds only deterministic Step 7 placement state. Preserve the
  // validated Phase 2C graph and all earlier progress exactly as saved.
  if (persistedVersion === 4) {
    const migrated = {
      ...INITIAL_LAB_STATE,
      ...candidate,
      version: 5 as const,
      selectedEnclosureComponentId: null,
      selectedEnclosureSlotId: null,
      enclosurePlacements: createInitialEnclosurePlacements(),
      microSdInstalled: false,
      enclosureCameraPreset: 'fit' as const,
      enclosureComparisonMode: 'workspace' as const,
      enclosureHintVisible: false,
      enclosureTargetsVisible: true,
      enclosureCablesVisible: true,
      enclosureTransparentHousing: false,
      enclosureWireframeHousing: false,
      enclosureIsolateSelected: false,
      enclosureValidation: 'idle' as const,
      enclosureUndoHistory: [],
      enclosureRedoHistory: [],
    }
    return validatePersistedState(migrated)
  }
  // Phase 2E adds deterministic Step 8 retainer state while preserving the
  // completed Step 7 enclosure exactly as it was saved.
  if (persistedVersion === 5) {
    const migrated = { ...INITIAL_LAB_STATE, ...candidate, version: 6 as const,
      selectedRetainerId: null, selectedRetainerTargetId: null, retainerInstallations: createInitialRetainerInstallations(), cableBlockedRetainerIds: [], retainerCameraPreset: 'fit' as const, retainerComparisonMode: 'workspace' as const, retainerHintVisible: false, retainerTargetsVisible: true, retainerCableClearanceVisible: true, retainerTransparentHousing: false, retainerWireframeHousing: false, retainerIsolateSelected: false, retainerValidation: 'idle' as const, retainerUndoHistory: [], retainerRedoHistory: [] }
    return validatePersistedState(migrated)
  }
  if (persistedVersion === 6) {
    const persistedConnections = Array.isArray(candidate.step6Connections) ? candidate.step6Connections as CableConnectionState[] : createInitialStep6Connections()
    const persistedPlacements = Array.isArray(candidate.enclosurePlacements) ? candidate.enclosurePlacements : createInitialEnclosurePlacements()
    const migrated = { ...INITIAL_LAB_STATE, ...candidate, version: 7 as const,
      cableRoutes: createLooseCableRoutes(persistedConnections, persistedPlacements), selectedRoutingCableId: null, selectedRoutePointIndex: null, routingCameraPreset: 'fit' as const, routingComparisonMode: 'workspace' as const, routingHintVisible: false, routingControlPointsVisible: true, routingCorridorsVisible: true, routingCollisionRegionsVisible: false, bottomCoverGhostVisible: false, routingTransparentHousing: false, routingWireframeHousing: false, routingIsolateSelectedCable: false, routingValidation: 'idle' as const, routingUndoHistory: [], routingRedoHistory: [] }
    return validatePersistedState(migrated)
  }
  if (persistedVersion === 7) {
    const migrated = {
      ...INITIAL_LAB_STATE,
      ...candidate,
      version: 8 as const,
      bottomCover: createInitialBottomCoverState(),
      coverLatches: createInitialCoverLatches(),
      selectedCoverLatchId: null,
      coverAlignment: 'idle' as const,
      coverClearanceIssues: [],
      coverCameraPreset: 'fit' as const,
      coverCameraResetCount: 0,
      coverComparisonMode: 'workspace' as const,
      coverHintVisible: false,
      coverTransparent: false,
      coverWireframe: false,
      coverHousingTransparent: false,
      coverMatingPerimeterVisible: true,
      coverLatchTargetsVisible: true,
      coverClearanceRegionsVisible: false,
      coverIsolated: false,
      coverCableIsolation: false,
      coverExplodedView: false,
      coverCrossSectionVisible: false,
      coverValidation: 'idle' as const,
      coverUndoHistory: [],
      coverRedoHistory: [],
    }
    return validatePersistedState(migrated)
  }
  if (
    persistedVersion !== 8 ||
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
    !candidate.connectionRedoHistory.every(validConnectionHistoryEntry) ||
    (candidate.selectedEnclosureComponentId !== null && !isEnclosurePartId(candidate.selectedEnclosureComponentId ?? null)) ||
    !validEnclosureSlotId(candidate.selectedEnclosureSlotId ?? null) ||
    !Array.isArray(candidate.enclosurePlacements) ||
    candidate.enclosurePlacements.length !== createInitialEnclosurePlacements().length ||
    !candidate.enclosurePlacements.every(isValidEnclosurePlacement) ||
    new Set(candidate.enclosurePlacements.map((placement) => placement.partId)).size !== candidate.enclosurePlacements.length ||
    typeof candidate.microSdInstalled !== 'boolean' ||
    !ENCLOSURE_CAMERA_PRESETS.includes(candidate.enclosureCameraPreset ?? 'fit') ||
    !validEnclosureComparisonMode(candidate.enclosureComparisonMode) ||
    typeof candidate.enclosureHintVisible !== 'boolean' ||
    typeof candidate.enclosureTargetsVisible !== 'boolean' ||
    typeof candidate.enclosureCablesVisible !== 'boolean' ||
    typeof candidate.enclosureTransparentHousing !== 'boolean' ||
    typeof candidate.enclosureWireframeHousing !== 'boolean' ||
    typeof candidate.enclosureIsolateSelected !== 'boolean' ||
    !['idle', 'connections-incomplete', 'incomplete', 'wrong-slot', 'wrong-orientation', 'not-seated', 'slot-occupied', 'housing-collision', 'cable-stretched', 'micro-sd-missing', 'valid'].includes(candidate.enclosureValidation ?? '') ||
    !Array.isArray(candidate.enclosureUndoHistory) ||
    !candidate.enclosureUndoHistory.every(validEnclosureHistoryEntry) ||
    !Array.isArray(candidate.enclosureRedoHistory) ||
    !candidate.enclosureRedoHistory.every(validEnclosureHistoryEntry) ||
    (candidate.selectedRetainerId !== null && !isRetainerId(candidate.selectedRetainerId ?? null)) ||
    !validRetainerTargetId(candidate.selectedRetainerTargetId ?? null) ||
    !Array.isArray(candidate.retainerInstallations) || candidate.retainerInstallations.length !== createInitialRetainerInstallations().length || !candidate.retainerInstallations.every(isValidRetainerInstallation) ||
    new Set(candidate.retainerInstallations.map((item) => item.retainerId)).size !== candidate.retainerInstallations.length ||
    !Array.isArray(candidate.cableBlockedRetainerIds) || !candidate.cableBlockedRetainerIds.every((id) => isRetainerId(id)) ||
    !RETAINER_CAMERA_PRESETS.includes(candidate.retainerCameraPreset ?? 'fit') || !validRetainerComparisonMode(candidate.retainerComparisonMode) ||
    typeof candidate.retainerHintVisible !== 'boolean' || typeof candidate.retainerTargetsVisible !== 'boolean' || typeof candidate.retainerCableClearanceVisible !== 'boolean' || typeof candidate.retainerTransparentHousing !== 'boolean' || typeof candidate.retainerWireframeHousing !== 'boolean' || typeof candidate.retainerIsolateSelected !== 'boolean' ||
    !['idle','enclosure-incomplete','incomplete','wrong-target','wrong-orientation','not-seated','target-occupied','housing-collision','component-collision','cable-pinched','valid'].includes(candidate.retainerValidation ?? '') ||
    !Array.isArray(candidate.retainerUndoHistory) || !candidate.retainerUndoHistory.every(validRetainerHistoryEntry) || !Array.isArray(candidate.retainerRedoHistory) || !candidate.retainerRedoHistory.every(validRetainerHistoryEntry) ||
    !Array.isArray(candidate.cableRoutes) || candidate.cableRoutes.length !== 6 || !candidate.cableRoutes.every(isValidCableRouteState) || new Set(candidate.cableRoutes.map((route) => route.cableId)).size !== candidate.cableRoutes.length ||
    (candidate.selectedRoutingCableId !== null && !isRoutingCableId(candidate.selectedRoutingCableId ?? null)) ||
    (candidate.selectedRoutePointIndex !== null && (typeof candidate.selectedRoutePointIndex !== 'number' || !Number.isInteger(candidate.selectedRoutePointIndex) || candidate.selectedRoutePointIndex < 0)) ||
    !ROUTING_CAMERA_PRESETS.includes(candidate.routingCameraPreset ?? 'fit') || !validRoutingComparisonMode(candidate.routingComparisonMode) ||
    typeof candidate.routingHintVisible !== 'boolean' || typeof candidate.routingControlPointsVisible !== 'boolean' || typeof candidate.routingCorridorsVisible !== 'boolean' || typeof candidate.routingCollisionRegionsVisible !== 'boolean' || typeof candidate.bottomCoverGhostVisible !== 'boolean' || typeof candidate.routingTransparentHousing !== 'boolean' || typeof candidate.routingWireframeHousing !== 'boolean' || typeof candidate.routingIsolateSelectedCable !== 'boolean' ||
    !['idle','retainers-incomplete','incomplete','endpoint-changed','too-long','too-taut','housing-collision','component-collision','retainer-collision','cover-contact','latch-collision','cable-pinched','outside-corridor','valid'].includes(candidate.routingValidation ?? '') ||
    !Array.isArray(candidate.routingUndoHistory) || !candidate.routingUndoHistory.every(validRoutingHistoryEntry) || !Array.isArray(candidate.routingRedoHistory) || !candidate.routingRedoHistory.every(validRoutingHistoryEntry) ||
    !isValidBottomCoverState(candidate.bottomCover) || !isValidCoverLatches(candidate.coverLatches) ||
    (candidate.selectedCoverLatchId !== null && !isCoverLatchId(candidate.selectedCoverLatchId ?? null)) ||
    !['idle','reversed','wrong-rotation','offset','aligned'].includes(candidate.coverAlignment ?? '') ||
    !Array.isArray(candidate.coverClearanceIssues) || !candidate.coverClearanceIssues.every((issue) => typeof issue === 'string') ||
    !COVER_CAMERA_PRESETS.includes(candidate.coverCameraPreset ?? 'fit') || typeof candidate.coverCameraResetCount !== 'number' || !Number.isInteger(candidate.coverCameraResetCount) || candidate.coverCameraResetCount < 0 || !validCoverComparisonMode(candidate.coverComparisonMode) ||
    typeof candidate.coverHintVisible !== 'boolean' || typeof candidate.coverTransparent !== 'boolean' || typeof candidate.coverWireframe !== 'boolean' || typeof candidate.coverHousingTransparent !== 'boolean' ||
    typeof candidate.coverMatingPerimeterVisible !== 'boolean' || typeof candidate.coverLatchTargetsVisible !== 'boolean' || typeof candidate.coverClearanceRegionsVisible !== 'boolean' ||
    typeof candidate.coverIsolated !== 'boolean' || typeof candidate.coverCableIsolation !== 'boolean' || typeof candidate.coverExplodedView !== 'boolean' || typeof candidate.coverCrossSectionVisible !== 'boolean' ||
    !['idle','step9-incomplete','reversed','wrong-rotation','not-aligned','clearance-failed','partially-seated','not-seated','latches-open','valid'].includes(candidate.coverValidation ?? '') ||
    !Array.isArray(candidate.coverUndoHistory) || !candidate.coverUndoHistory.every(isValidCoverHistoryEntry) || !Array.isArray(candidate.coverRedoHistory) || !candidate.coverRedoHistory.every(isValidCoverHistoryEntry)
  ) {
    return null
  }

  return candidate as LabState
}
