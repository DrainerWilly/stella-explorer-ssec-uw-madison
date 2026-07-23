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
import type {
  LabAction,
  LabState,
  ScaffoldingEnclosurePartId,
  ScaffoldingHistoryEntry,
} from '../types'

export const STELLA_Q2_SESSION_KEY = 'exstella.stella-q2.phase-2a.v1'

export const INITIAL_LAB_STATE: LabState = {
  version: 2,
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
    case 'RESET_PROGRESS':
      return { ...INITIAL_LAB_STATE, mode: state.mode, guidance: state.guidance }
    default:
      return state
  }
}

export function validatePersistedState(value: unknown): LabState | null {
  if (!value || typeof value !== 'object') return null

  const candidate = value as Partial<LabState>
  if (
    candidate.version !== 2 ||
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
    !candidate.scaffoldRedoHistory.every(validHistoryEntry)
  ) {
    return null
  }

  return candidate as LabState
}
