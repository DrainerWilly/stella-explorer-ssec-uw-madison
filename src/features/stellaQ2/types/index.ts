export type LabMode = 'intro' | 'build' | 'program' | 'operate' | 'measure'

export type GuidanceLevel = 'beginner' | 'standard' | 'expert'

export type WorkspaceView = 'diagram' | 'photos'

export type ScaffoldingEnclosurePartId = 'top-housing' | 'bottom-cover'

export type ScaffoldCameraPreset =
  | 'fit'
  | 'front'
  | 'back'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'

export type ScaffoldingValidationStatus =
  | 'idle'
  | 'top-incomplete'
  | 'bottom-incomplete'
  | 'top-complete'
  | 'bottom-complete'
  | 'complete'
  | 'permanent-protected'
  | 'nothing-selected'
  | 'already-removed'

export type SourceKind =
  | 'pdf'
  | 'spreadsheet'
  | 'photograph'
  | 'csv'
  | 'stl'
  | 'firmware'
  | 'library'
  | 'test-code'
  | 'binary'

export interface SourceReference {
  id: string
  title: string
  relativePath: string
  kind: SourceKind
  purpose: string
  inspected: boolean
}

export type PartCategory = 'electronics' | 'power' | 'storage' | 'utility' | 'printed'

export interface PartDefinition {
  id: string
  lineNumber?: number
  officialName: string
  quantity: number
  manufacturer: string
  partNumber: string
  unitCostUsd?: number
  lineCostUsd?: number
  category: PartCategory
  purpose: string
  assemblyRole: string
  connectorLocations: string[]
  assemblySlot: string
  sourceIds: string[]
  stlAssetId?: string
  note?: string
}

export interface BuildPhoto {
  id: string
  sequence: number
  buildStepNumber: number
  filename: string
  assetPath: string
  alt: string
  caption: string
}

export interface BuildStep {
  id: string
  number: number
  shortTitle: string
  title: string
  instruction: string
  why: string
  verify: string
  commonMistake: string
  safety?: string
  sourceIds: string[]
  photoIds: string[]
  partIds: string[]
}

export interface ConnectionDefinition {
  id: string
  fromPartId: string
  fromConnector: string
  toPartId: string
  toConnector: string
  connectionType: 'qwiic' | 'battery' | 'usb-c' | 'removable-media'
  quantity: number
  sourceIds: string[]
}

export interface SpectralChannel {
  channel: number
  centerWavelengthNm: number
  displayColorName: string
  authoritativeHex: `#${string}`
  rgb: readonly [number, number, number]
  frequencyThz: number
  energyJoulesPerPhoton: number
  energyElectronVoltsPerPhoton: number
  category: 'visible' | 'near-infrared'
  accessibleTreatment: string
}

export interface StlAsset {
  id: string
  filename: string
  assetPath: string
  quantity: number
  role: string
  dimensionsMm?: readonly [number, number, number]
  sourceIds: string[]
}

export interface ScaffoldTarget {
  id: string
  enclosurePartId: ScaffoldingEnclosurePartId
  kind: 'removable' | 'permanent'
  label: string
  location: string
  description: string
  sourcePhotoId: string
  meshComponentIndex: number
  meshEvidence: string
  interactionAnchorMm: readonly [number, number, number]
  interactionSizeMm: readonly [number, number, number]
}

export interface ScaffoldingHistoryEntry {
  removedScaffoldIds: string[]
  selectedScaffoldId: string | null
}

export interface LabState {
  version: 2
  mode: LabMode
  guidance: GuidanceLevel
  activeBuildStepId: string
  completedBuildStepIds: string[]
  selectedPartId: string
  selectedPhotoId: string
  workspaceView: WorkspaceView
  selectedEnclosurePart: ScaffoldingEnclosurePartId
  removedScaffoldIds: string[]
  selectedScaffoldId: string | null
  scaffoldCameraPreset: ScaffoldCameraPreset
  scaffoldHintVisible: boolean
  scaffoldValidation: ScaffoldingValidationStatus
  scaffoldUndoHistory: ScaffoldingHistoryEntry[]
  scaffoldRedoHistory: ScaffoldingHistoryEntry[]
}

export type LabAction =
  | { type: 'START_BUILD' }
  | { type: 'RETURN_TO_INTRO' }
  | { type: 'SELECT_BUILD_STEP'; stepId: string }
  | { type: 'COMPLETE_BUILD_STEP'; stepId: string }
  | { type: 'NEXT_BUILD_STEP' }
  | { type: 'PREVIOUS_BUILD_STEP' }
  | { type: 'SELECT_PART'; partId: string }
  | { type: 'SELECT_PHOTO'; photoId: string }
  | { type: 'SET_WORKSPACE_VIEW'; view: WorkspaceView }
  | { type: 'SET_GUIDANCE'; guidance: GuidanceLevel }
  | { type: 'SELECT_SCAFFOLDING_PART'; partId: ScaffoldingEnclosurePartId }
  | { type: 'SELECT_SCAFFOLD'; scaffoldId: string }
  | { type: 'REMOVE_SCAFFOLD'; scaffoldId?: string }
  | { type: 'UNDO_SCAFFOLD_REMOVAL' }
  | { type: 'REDO_SCAFFOLD_REMOVAL' }
  | { type: 'RESET_SCAFFOLDING_PART' }
  | { type: 'SET_SCAFFOLD_CAMERA'; preset: ScaffoldCameraPreset }
  | { type: 'TOGGLE_SCAFFOLD_HINT' }
  | { type: 'CHECK_SCAFFOLDING' }
  | { type: 'RESET_PROGRESS' }
