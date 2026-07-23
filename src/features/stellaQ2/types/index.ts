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

export type ConnectionComparisonMode = 'diagram' | 'build-two' | 'side-by-side' | 'overlay' | 'schematic'

export type ConnectionValidationStatus =
  | 'idle'
  | 'layout-incomplete'
  | 'incomplete'
  | 'incompatible-connector'
  | 'port-occupied'
  | 'self-connection'
  | 'wrong-topology'
  | 'coin-not-installed'
  | 'coin-face-down'
  | 'valid'

export type EnclosurePartId = Exclude<LayoutPartId, 'cr1220'> | 'micro-sd-card'

export type EnclosureCameraPreset =
  | 'fit'
  | 'top'
  | 'build-three'
  | 'front'
  | 'back'
  | 'left'
  | 'right'
  | 'interior'

export type EnclosureComparisonMode = 'workspace' | 'build-three' | 'side-by-side' | 'overlay'

export type EnclosureValidationStatus =
  | 'idle'
  | 'connections-incomplete'
  | 'incomplete'
  | 'wrong-slot'
  | 'wrong-orientation'
  | 'not-seated'
  | 'slot-occupied'
  | 'housing-collision'
  | 'cable-stretched'
  | 'micro-sd-missing'
  | 'valid'

export type RetainerId = 'clock-retainer' | 'display-retainer' | 'processor-retainer' | 'button-retainer' | 'battery-retainer'
export type RetainerInstallationState = 'tray' | 'aligned' | 'installing' | 'installed'
export type RetainerCameraPreset = EnclosureCameraPreset | 'selected-retainer'
export type RetainerComparisonMode = 'workspace' | 'build-three' | 'side-by-side' | 'build-four-next'
export type RetainerValidationStatus = 'idle' | 'enclosure-incomplete' | 'incomplete' | 'wrong-target' | 'wrong-orientation' | 'not-seated' | 'target-occupied' | 'housing-collision' | 'component-collision' | 'cable-pinched' | 'valid'

export interface CableConnectionState {
  cableId: string
  kind: 'qwiic' | 'power'
  endpointA: string | null
  endpointB: string | null
}

export interface ConnectionHistoryEntry {
  connections: CableConnectionState[]
  selectedConnectionId: string | null
  selectedConnectionEndpoint: 'a' | 'b' | null
  coinCellInstalled: boolean
}

export interface EnclosurePlacement {
  partId: EnclosurePartId
  slotId: string | null
  positionMm: readonly [number, number, number]
  rotation: readonly [number, number, number]
  seated: boolean
}

export interface EnclosureHistoryEntry {
  placements: EnclosurePlacement[]
  selectedEnclosureComponentId: EnclosurePartId | null
  selectedEnclosureSlotId: string | null
  microSdInstalled: boolean
}

export interface RetainerInstallation {
  retainerId: RetainerId
  targetId: string | null
  positionMm: readonly [number, number, number]
  rotation: readonly [number, number, number]
  installationState: RetainerInstallationState
}

export interface RetainerHistoryEntry {
  installations: RetainerInstallation[]
  selectedRetainerId: RetainerId | null
  selectedRetainerTargetId: string | null
  cableBlockedRetainerIds: RetainerId[]
}

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
  version: 6
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
  selectedConnectionId: string | null
  selectedConnectionEndpoint: 'a' | 'b' | null
  step6Connections: CableConnectionState[]
  coinCellInstalled: boolean
  connectionComparisonMode: ConnectionComparisonMode
  connectionHintVisible: boolean
  connectionLabelsVisible: boolean
  requiredPathsVisible: boolean
  isolateSelectedConnection: boolean
  connectionValidation: ConnectionValidationStatus
  connectionUndoHistory: ConnectionHistoryEntry[]
  connectionRedoHistory: ConnectionHistoryEntry[]
  selectedEnclosureComponentId: EnclosurePartId | null
  selectedEnclosureSlotId: string | null
  enclosurePlacements: EnclosurePlacement[]
  microSdInstalled: boolean
  enclosureCameraPreset: EnclosureCameraPreset
  enclosureComparisonMode: EnclosureComparisonMode
  enclosureHintVisible: boolean
  enclosureTargetsVisible: boolean
  enclosureCablesVisible: boolean
  enclosureTransparentHousing: boolean
  enclosureWireframeHousing: boolean
  enclosureIsolateSelected: boolean
  enclosureValidation: EnclosureValidationStatus
  enclosureUndoHistory: EnclosureHistoryEntry[]
  enclosureRedoHistory: EnclosureHistoryEntry[]
  selectedRetainerId: RetainerId | null
  selectedRetainerTargetId: string | null
  retainerInstallations: RetainerInstallation[]
  cableBlockedRetainerIds: RetainerId[]
  retainerCameraPreset: RetainerCameraPreset
  retainerComparisonMode: RetainerComparisonMode
  retainerHintVisible: boolean
  retainerTargetsVisible: boolean
  retainerCableClearanceVisible: boolean
  retainerTransparentHousing: boolean
  retainerWireframeHousing: boolean
  retainerIsolateSelected: boolean
  retainerValidation: RetainerValidationStatus
  retainerUndoHistory: RetainerHistoryEntry[]
  retainerRedoHistory: RetainerHistoryEntry[]
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
  | { type: 'SELECT_CONNECTION'; connectionId: string | null }
  | { type: 'SELECT_CONNECTION_ENDPOINT'; endpoint: 'a' | 'b' | null }
  | { type: 'SET_CONNECTION_ENDPOINT'; connectionId: string; endpoint: 'a' | 'b'; connectorId: string | null }
  | { type: 'CLEAR_CONNECTION'; connectionId: string }
  | { type: 'SET_COIN_CELL_INSTALLED'; installed: boolean }
  | { type: 'SET_CONNECTION_COMPARISON_MODE'; mode: ConnectionComparisonMode }
  | { type: 'TOGGLE_CONNECTION_HINT' }
  | { type: 'TOGGLE_CONNECTION_LABELS' }
  | { type: 'TOGGLE_REQUIRED_PATHS' }
  | { type: 'TOGGLE_CONNECTION_ISOLATION' }
  | { type: 'UNDO_CONNECTIONS' }
  | { type: 'REDO_CONNECTIONS' }
  | { type: 'RESET_CONNECTIONS' }
  | { type: 'CHECK_CONNECTIONS' }
  | { type: 'SELECT_ENCLOSURE_COMPONENT'; partId: EnclosurePartId | null }
  | { type: 'SELECT_ENCLOSURE_SLOT'; slotId: string | null }
  | { type: 'PLACE_ENCLOSURE_COMPONENT'; placement: EnclosurePlacement }
  | { type: 'REMOVE_ENCLOSURE_COMPONENT'; partId: EnclosurePartId }
  | { type: 'ROTATE_ENCLOSURE_COMPONENT'; partId: EnclosurePartId; delta: number }
  | { type: 'SET_MICRO_SD_INSTALLED'; installed: boolean }
  | { type: 'SET_ENCLOSURE_CAMERA'; preset: EnclosureCameraPreset }
  | { type: 'SET_ENCLOSURE_COMPARISON_MODE'; mode: EnclosureComparisonMode }
  | { type: 'TOGGLE_ENCLOSURE_HINT' }
  | { type: 'TOGGLE_ENCLOSURE_TARGETS' }
  | { type: 'TOGGLE_ENCLOSURE_CABLES' }
  | { type: 'TOGGLE_ENCLOSURE_TRANSPARENCY' }
  | { type: 'TOGGLE_ENCLOSURE_WIREFRAME' }
  | { type: 'TOGGLE_ENCLOSURE_ISOLATION' }
  | { type: 'UNDO_ENCLOSURE' }
  | { type: 'REDO_ENCLOSURE' }
  | { type: 'RESET_ENCLOSURE' }
  | { type: 'CHECK_ENCLOSURE' }
  | { type: 'SELECT_RETAINER'; retainerId: RetainerId | null }
  | { type: 'SELECT_RETAINER_TARGET'; targetId: string | null }
  | { type: 'PLACE_RETAINER'; installation: RetainerInstallation }
  | { type: 'REMOVE_RETAINER'; retainerId: RetainerId }
  | { type: 'ROTATE_RETAINER'; retainerId: RetainerId; delta: number }
  | { type: 'TOGGLE_RETAINER_CABLE_CLEARANCE'; retainerId: RetainerId }
  | { type: 'SET_RETAINER_CAMERA'; preset: RetainerCameraPreset }
  | { type: 'SET_RETAINER_COMPARISON_MODE'; mode: RetainerComparisonMode }
  | { type: 'TOGGLE_RETAINER_HINT' }
  | { type: 'TOGGLE_RETAINER_TARGETS' }
  | { type: 'TOGGLE_RETAINER_CLEARANCES' }
  | { type: 'TOGGLE_RETAINER_TRANSPARENCY' }
  | { type: 'TOGGLE_RETAINER_WIREFRAME' }
  | { type: 'TOGGLE_RETAINER_ISOLATION' }
  | { type: 'UNDO_RETAINER' }
  | { type: 'REDO_RETAINER' }
  | { type: 'RESET_RETAINERS' }
  | { type: 'CHECK_RETAINERS' }
  | { type: 'RESET_PROGRESS' }
