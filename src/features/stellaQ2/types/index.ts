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

export type LayoutPartId =
  | 'thing-plus-rp2040'
  | 'i2c-button'
  | 'pcf8523-clock'
  | 'cr1220'
  | 'triad-spectral-sensor'
  | 'oled-display'
  | 'battery-400'
  | 'power-switch'

export type LayoutComparisonMode = 'diagram' | 'build-one' | 'side-by-side' | 'overlay'

export type CoinCellFace = 'positive-up' | 'negative-up'

export type LayoutValidationStatus =
  | 'idle'
  | 'incomplete'
  | 'valid'
  | 'wrong-part'
  | 'wrong-orientation'
  | 'coin-face-down'
  | 'target-occupied'
  | 'cables-not-available'

export interface ComponentPlacement {
  partId: LayoutPartId
  targetId: string | null
  x: number
  y: number
  rotation: number
  face: CoinCellFace | null
  snapped: boolean
}

export interface LayoutHistoryEntry {
  placements: ComponentPlacement[]
  selectedLayoutPartId: LayoutPartId | null
  selectedLayoutTargetId: string | null
}

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
  version: 3
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
  selectedLayoutPartId: LayoutPartId | null
  selectedLayoutTargetId: string | null
  layoutPlacements: ComponentPlacement[]
  layoutComparisonMode: LayoutComparisonMode
  layoutZoom: number
  layoutPan: readonly [number, number]
  layoutHintVisible: boolean
  layoutTargetOutlinesVisible: boolean
  layoutValidation: LayoutValidationStatus
  layoutUndoHistory: LayoutHistoryEntry[]
  layoutRedoHistory: LayoutHistoryEntry[]
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
  | { type: 'SELECT_LAYOUT_PART'; partId: LayoutPartId | null }
  | { type: 'SELECT_LAYOUT_TARGET'; targetId: string | null }
  | { type: 'PLACE_LAYOUT_PART'; placement: ComponentPlacement }
  | { type: 'RETURN_LAYOUT_PART_TO_TRAY'; partId: LayoutPartId }
  | { type: 'ROTATE_LAYOUT_PART'; partId: LayoutPartId; delta: number }
  | { type: 'SET_COIN_CELL_FACE'; face: CoinCellFace }
  | { type: 'SET_LAYOUT_COMPARISON_MODE'; mode: LayoutComparisonMode }
  | { type: 'SET_LAYOUT_VIEW'; zoom: number; pan: readonly [number, number] }
  | { type: 'TOGGLE_LAYOUT_HINT' }
  | { type: 'TOGGLE_LAYOUT_TARGET_OUTLINES' }
  | { type: 'UNDO_LAYOUT' }
  | { type: 'REDO_LAYOUT' }
  | { type: 'RESET_LAYOUT' }
  | { type: 'CHECK_LAYOUT' }
  | { type: 'RESET_PROGRESS' }
