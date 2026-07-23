import type { RetainerCameraPreset, RetainerId } from '../types'
import { sourceAssetUrl } from './sourceReferences'

export interface RetainerDefinition {
  id: RetainerId
  filename: string
  stlUrl: string
  securedComponentId: 'pcf8523-clock' | 'oled-display' | 'thing-plus-rp2040' | 'i2c-button' | 'battery-400'
  label: string
  dimensionsMm: readonly [number, number, number]
  installedPositionMm: readonly [number, number, number]
  installedRotation: readonly [number, number, number]
  insertionAxis: readonly [number, number, number]
  positionToleranceMm: number
  rotationToleranceDegrees: number
  targetHousingFeatures: string
  cableClearance: string
  sourceReference: string
  confidence: 'high' | 'medium'
  trayPositionMm: readonly [number, number, number]
}

const root = 'Q2 parts STL files'

// Dimensions are the supplied STL inventory dimensions. Target coordinates use
// the same centred millimetre enclosure frame as Phase 2D and were aligned to
// the Build 3/4 clip labels (CK, DISP, MC, BN, BAT) plus the corresponding
// source-backed module bays. No TRIAD retainer STL is supplied.
export const RETAINERS: readonly RetainerDefinition[] = [
  { id: 'clock-retainer', filename: 'Q2 clock retainer.STL', stlUrl: sourceAssetUrl(`${root}/Q2 clock retainer.STL`), securedComponentId: 'pcf8523-clock', label: 'Clock retainer (CK)', dimensionsMm: [19.53, 14, 5.55], installedPositionMm: [0, 34, 12.3], installedRotation: [0, 0, 0], insertionAxis: [0, 0, -1], positionToleranceMm: 5, rotationToleranceDegrees: 18, targetHousingFeatures: 'Clock-bay side rails and clip-contact shelf above the PCF8523.', cableClearance: 'Keep the two RTC Qwiic leads clear of the clip-contact surface.', sourceReference: 'Build 3 loose CK clip; Build 4 installed CK clip; Q2 clock retainer.STL.', confidence: 'high', trayPositionMm: [-68, 45, 26] },
  { id: 'display-retainer', filename: 'Q2 display retainer.STL', stlUrl: sourceAssetUrl(`${root}/Q2 display retainer.STL`), securedComponentId: 'oled-display', label: 'Display retainer (DISP)', dimensionsMm: [23.29, 20, 9.3], installedPositionMm: [0, 10, 12.8], installedRotation: [0, 0, 0], insertionAxis: [0, 0, -1], positionToleranceMm: 5, rotationToleranceDegrees: 18, targetHousingFeatures: 'Display-bay side rails around the OLED board.', cableClearance: 'Keep the OLED Qwiic connector and lead outside the clamp contact region.', sourceReference: 'Build 3 loose DISP clip; Build 4 installed DISP clip; Q2 display retainer.STL.', confidence: 'high', trayPositionMm: [-68, 18, 26] },
  { id: 'processor-retainer', filename: 'Q2 processor retainer.STL', stlUrl: sourceAssetUrl(`${root}/Q2 processor retainer.STL`), securedComponentId: 'thing-plus-rp2040', label: 'Processor retainer (MC)', dimensionsMm: [24.9, 14, 5.2], installedPositionMm: [0, -25, 12.2], installedRotation: [0, 0, 0], insertionAxis: [0, 0, -1], positionToleranceMm: 5, rotationToleranceDegrees: 18, targetHousingFeatures: 'Processor-bay rails and access-side clip seat.', cableClearance: 'Protect the RP2040 Qwiic lead, battery lead, USB-C access, and visible microSD edge.', sourceReference: 'Build 3 loose MC clip; Build 4 installed MC clip; Q2 processor retainer.STL.', confidence: 'high', trayPositionMm: [-68, -12, 26] },
  { id: 'button-retainer', filename: 'Q2 button retainer.STL', stlUrl: sourceAssetUrl(`${root}/Q2 button retainer.STL`), securedComponentId: 'i2c-button', label: 'Button retainer (BN)', dimensionsMm: [27.8, 20, 7.05], installedPositionMm: [0, -55, 12.7], installedRotation: [0, 0, 0], insertionAxis: [0, 0, -1], positionToleranceMm: 5, rotationToleranceDegrees: 20, targetHousingFeatures: 'Button-bay side rails while retaining central button travel.', cableClearance: 'Keep both button Qwiic leads and the button cap travel path unobstructed.', sourceReference: 'Build 3 loose BN clip; Build 4 installed BN clip; Q2 button retainer.STL.', confidence: 'high', trayPositionMm: [-68, -43, 26] },
  { id: 'battery-retainer', filename: 'Q2 battery retainer.STL', stlUrl: sourceAssetUrl(`${root}/Q2 battery retainer.STL`), securedComponentId: 'battery-400', label: 'Battery retainer (BAT)', dimensionsMm: [19.3, 24, 4.8], installedPositionMm: [0, -82, 13.1], installedRotation: [0, 0, 0], insertionAxis: [0, 0, -1], positionToleranceMm: 5, rotationToleranceDegrees: 20, targetHousingFeatures: 'Lower pouch-battery cradle and BAT clip rails.', cableClearance: 'Keep the red/black battery lead outside the battery-retainer installation path.', sourceReference: 'Build 3 loose BAT clip; Build 4 installed BAT clip; Q2 battery retainer.STL.', confidence: 'high', trayPositionMm: [-68, -74, 26] },
]

export const RETAINER_BY_ID = new Map(RETAINERS.map((retainer) => [retainer.id, retainer]))
export const RETAINER_TARGET_BY_ID = new Map(RETAINERS.map((retainer) => [`${retainer.id}-target`, retainer]))
export const RETAINER_CAMERA_PRESETS: readonly RetainerCameraPreset[] = ['fit', 'top', 'build-three', 'front', 'back', 'left', 'right', 'interior', 'selected-retainer']
