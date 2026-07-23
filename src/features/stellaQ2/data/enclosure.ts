import type { EnclosureCameraPreset, EnclosurePartId } from '../types'
import { sourceAssetUrl } from './sourceReferences'

export interface EnclosureSlot {
  id: string
  acceptedPartId: EnclosurePartId
  label: string
  purpose: string
  positionMm: readonly [number, number, number]
  rotation: readonly [number, number, number]
  insertionAxis: readonly [number, number, number]
  footprintMm: readonly [number, number]
  thicknessMm: number
  positionToleranceMm: number
  rotationToleranceDegrees: number
  sourceReference: string
  confidence: 'high' | 'medium'
  orientationNote: string
}

// The supplied top-housing STL is 65.79 × 181.945 × 14.7 mm.  These local
// coordinates use its centred interior plane: x spans the short axis, y the
// long axis, and +z is outward from the open housing.  Slot centres and board
// proportions are conservatively derived from Build 3, checked against the
// 1:1 flat assembly diagram. They are deliberately toleranced, not presented
// as metrology-grade dimensions.
export const TOP_HOUSING_STL_URL = sourceAssetUrl('Q2 parts STL files/Q2 top housing.STL')
export const TOP_HOUSING_DIMENSIONS_MM = [65.79, 181.945, 14.7] as const

export const ENCLOSURE_REQUIRED_PART_IDS: readonly EnclosurePartId[] = [
  'triad-spectral-sensor',
  'pcf8523-clock',
  'oled-display',
  'thing-plus-rp2040',
  'i2c-button',
  'power-switch',
  'battery-400',
  'micro-sd-card',
]

export const ENCLOSURE_SLOTS: readonly EnclosureSlot[] = [
  {
    id: 'triad-optical-bay', acceptedPartId: 'triad-spectral-sensor', label: 'TRIAD optical bay', purpose: 'Holds the AS7265x optical module beneath the top sensing opening.',
    positionMm: [0, 63, 8.2], rotation: [0, 0, 0], insertionAxis: [0, 0, -1], footprintMm: [31, 34], thicknessMm: 4, positionToleranceMm: 7, rotationToleranceDegrees: 18,
    sourceReference: 'Build 3 upper red AS7265x TRIAD board; 1:1 flat assembly diagram.', confidence: 'high', orientationNote: 'Keep the circular optical face upward, with the printed TRIAD orientation matching Build 3.',
  },
  {
    id: 'rtc-bay', acceptedPartId: 'pcf8523-clock', label: 'Real-time clock bay', purpose: 'Seats the PCF8523 module directly below the TRIAD.',
    positionMm: [0, 34, 8.2], rotation: [0, 0, 0], insertionAxis: [0, 0, -1], footprintMm: [24, 18], thicknessMm: 4, positionToleranceMm: 6, rotationToleranceDegrees: 18,
    sourceReference: 'Build 3 PCF8523 board below TRIAD; 1:1 flat assembly diagram.', confidence: 'high', orientationNote: 'The installed CR1220 holder remains on the upward-facing board side.',
  },
  {
    id: 'oled-bay', acceptedPartId: 'oled-display', label: 'OLED display bay', purpose: 'Seats the 0.91-inch OLED module below the clock.',
    positionMm: [0, 10, 8.2], rotation: [0, 0, 0], insertionAxis: [0, 0, -1], footprintMm: [28, 20], thicknessMm: 4, positionToleranceMm: 6, rotationToleranceDegrees: 18,
    sourceReference: 'Build 3 blue OLED board; 1:1 flat assembly diagram.', confidence: 'high', orientationNote: 'Screen faces upward; its connector faces toward the cable path at the right edge.',
  },
  {
    id: 'rp2040-bay', acceptedPartId: 'thing-plus-rp2040', label: 'Thing Plus RP2040 bay', purpose: 'Seats the red SparkFun Thing Plus RP2040 board with its storage edge accessible.',
    positionMm: [0, -25, 8.2], rotation: [0, 0, 0], insertionAxis: [0, 0, -1], footprintMm: [37, 27], thicknessMm: 4, positionToleranceMm: 7, rotationToleranceDegrees: 18,
    sourceReference: 'Build 3 red SparkFun Thing Plus RP2040 board; 1:1 flat assembly diagram.', confidence: 'high', orientationNote: 'Keep the board face upward and the microSD-reader edge matching the visible Build 3 card.',
  },
  {
    id: 'micro-sd-reader', acceptedPartId: 'micro-sd-card', label: 'Integrated microSD reader', purpose: 'The card is inserted into the RP2040 board’s source-visible reader.',
    positionMm: [-12, -25, 10.8], rotation: [0, 0, 0], insertionAxis: [0, -1, 0], footprintMm: [12, 10], thicknessMm: 1.2, positionToleranceMm: 4, rotationToleranceDegrees: 30,
    sourceReference: 'Build 3 visibly shows a SanDisk microSD card seated at the left edge of the RP2040 board.', confidence: 'high', orientationNote: 'Card label faces upward; this is an insertion into the integrated reader, not a separate reader board.',
  },
  {
    id: 'pushbutton-bay', acceptedPartId: 'i2c-button', label: 'Pushbutton bay', purpose: 'Seats the red button module below the microcontroller.',
    positionMm: [0, -55, 8.2], rotation: [0, 0, 0], insertionAxis: [0, 0, -1], footprintMm: [27, 22], thicknessMm: 4, positionToleranceMm: 6, rotationToleranceDegrees: 20,
    sourceReference: 'Build 3 lower red pushbutton board; 1:1 flat assembly diagram.', confidence: 'high', orientationNote: 'Keep the button-facing board side upward, matching the photographed board.',
  },
  {
    id: 'power-switch-bay', acceptedPartId: 'power-switch', label: 'Battery disconnect bay', purpose: 'Stages the inline power switch above the pouch battery; it is not final-routed yet.',
    positionMm: [0, -72, 9], rotation: [0, 0, 0], insertionAxis: [0, 0, -1], footprintMm: [28, 12], thicknessMm: 8, positionToleranceMm: 7, rotationToleranceDegrees: 25,
    sourceReference: 'Build 3 black inline switch immediately above the battery recess.', confidence: 'medium', orientationNote: 'Keep the inline switch horizontal across the housing; loose lead slack is expected before Step 9.',
  },
  {
    id: 'battery-bay', acceptedPartId: 'battery-400', label: '400 mAh battery bay', purpose: 'Seats the rechargeable pouch battery in the lower housing recess.',
    positionMm: [0, -82, 8.2], rotation: [0, 0, 0], insertionAxis: [0, 0, -1], footprintMm: [29, 25], thicknessMm: 7, positionToleranceMm: 6, rotationToleranceDegrees: 20,
    sourceReference: 'Build 3 lower pouch battery in blue lower recess; 1:1 flat assembly diagram.', confidence: 'high', orientationNote: 'Keep the pouch flat in the lower bay with its leads toward the switch path.',
  },
]

export const ENCLOSURE_SLOT_BY_ID = new Map(ENCLOSURE_SLOTS.map((slot) => [slot.id, slot]))
export const ENCLOSURE_SLOT_BY_PART_ID = new Map(ENCLOSURE_SLOTS.map((slot) => [slot.acceptedPartId, slot]))

export const ENCLOSURE_CAMERA_PRESETS: readonly EnclosureCameraPreset[] = [
  'fit', 'top', 'build-three', 'front', 'back', 'left', 'right', 'interior',
]

export const ENCLOSURE_STAGING_TRANSFORMS: Record<EnclosurePartId, { positionMm: readonly [number, number, number]; rotation: readonly [number, number, number] }> = {
  'triad-spectral-sensor': { positionMm: [-62, 55, 34], rotation: [0, 0, 0] },
  'pcf8523-clock': { positionMm: [-62, 30, 34], rotation: [0, 0, 0] },
  'oled-display': { positionMm: [-62, 6, 34], rotation: [0, 0, 0] },
  'thing-plus-rp2040': { positionMm: [-62, -22, 34], rotation: [0, 0, 0] },
  'i2c-button': { positionMm: [-62, -48, 34], rotation: [0, 0, 0] },
  'power-switch': { positionMm: [-62, -70, 34], rotation: [0, 0, 0] },
  'battery-400': { positionMm: [-62, -85, 34], rotation: [0, 0, 0] },
  'micro-sd-card': { positionMm: [-48, -17, 35], rotation: [0, 0, 0] },
}
