import { BUILD_PHOTOS } from '../data/buildPhotos'
import { BUILD_STEPS } from '../data/buildSteps'
import { ALL_PARTS, PARTS_LIST } from '../data/parts'
import type { LabAction, LabState } from '../types'

export const STELLA_Q2_SESSION_KEY = 'exstella.stella-q2.phase-1.v1'

export const INITIAL_LAB_STATE: LabState = {
  version: 1,
  mode: 'intro',
  guidance: 'standard',
  activeBuildStepId: BUILD_STEPS[0].id,
  completedBuildStepIds: [],
  selectedPartId: PARTS_LIST[0].id,
  selectedPhotoId: BUILD_PHOTOS[0].id,
  workspaceView: 'diagram',
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
    candidate.version !== 1 ||
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
    (candidate.workspaceView !== 'diagram' && candidate.workspaceView !== 'photos')
  ) {
    return null
  }

  return candidate as LabState
}
