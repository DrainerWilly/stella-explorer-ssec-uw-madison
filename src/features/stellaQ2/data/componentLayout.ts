import type { LayoutPartId } from '../types'

export interface LayoutTarget {
  id: string
  partId: LayoutPartId
  label: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  positionTolerance: number
  rotationTolerance: number
  sourceReference: string
  orientationNote: string
}

export interface LayoutComponentVisual {
  partId: LayoutPartId
  label: string
  shortLabel: string
  visualMethod: 'accurate simplified representation'
  sourceReference: string
  photoEvidence: string
}

export const STEP_FIVE_PART_IDS: readonly LayoutPartId[] = [
  'thing-plus-rp2040',
  'i2c-button',
  'pcf8523-clock',
  'cr1220',
  'triad-spectral-sensor',
  'oled-display',
  'battery-400',
  'power-switch',
]

// Normalized centers and footprints were read from the supplied flat-assembly
// diagram. These coordinates deliberately stay independent of browser pixels.
export const LAYOUT_TARGETS: readonly LayoutTarget[] = [
  {
    id: 'microcontroller-outline', partId: 'thing-plus-rp2040', label: 'Microcontroller',
    x: 0.093, y: 0.745, width: 0.092, height: 0.22, rotation: 0,
    positionTolerance: 0.042, rotationTolerance: 18,
    sourceReference: 'Flat assembly diagram microcontroller outline; Build 1 lower-left red Thing Plus.',
    orientationNote: 'USB-C end faces upward, matching the printed outline and Build 1.',
  },
  {
    id: 'pushbutton-outline', partId: 'i2c-button', label: 'Pushbutton switch module',
    x: 0.205, y: 0.455, width: 0.115, height: 0.12, rotation: 0,
    positionTolerance: 0.045, rotationTolerance: 20,
    sourceReference: 'Flat assembly diagram pushbutton outline; Build 1 red button board.',
    orientationNote: 'Button is centered with the board upright as drawn.',
  },
  {
    id: 'clock-outline', partId: 'pcf8523-clock', label: 'Real time clock module',
    x: 0.325, y: 0.185, width: 0.105, height: 0.09, rotation: 0,
    positionTolerance: 0.04, rotationTolerance: 20,
    sourceReference: 'Flat assembly diagram clock outline; Build 1 black PCF8523 board.',
    orientationNote: 'Coin-cell holder is oriented upward as shown on the reference.',
  },
  {
    id: 'coin-cell-staging', partId: 'cr1220', label: 'Loose CR1220 staging position',
    x: 0.379, y: 0.105, width: 0.05, height: 0.05, rotation: 0,
    positionTolerance: 0.04, rotationTolerance: 180,
    sourceReference: 'Build 1 loose coin cell beside the printed clock callout.',
    orientationNote: 'Positive (+) face must remain visible; it is not inserted in Step 5.',
  },
  {
    id: 'spectrometer-outline', partId: 'triad-spectral-sensor', label: '18-channel spectrometer module',
    x: 0.585, y: 0.47, width: 0.14, height: 0.16, rotation: 0,
    positionTolerance: 0.045, rotationTolerance: 18,
    sourceReference: 'Flat assembly diagram spectrometer outline; Build 1 red TRIAD board.',
    orientationNote: 'IR marking and circular optical face are upright as drawn.',
  },
  {
    id: 'oled-outline', partId: 'oled-display', label: 'Organic LED display module',
    x: 0.855, y: 0.185, width: 0.13, height: 0.085, rotation: 0,
    positionTolerance: 0.04, rotationTolerance: 18,
    sourceReference: 'Flat assembly diagram OLED outline; Build 1 blue OLED board.',
    orientationNote: 'Screen faces upward with the connector on the right.',
  },
  {
    id: 'power-switch-outline', partId: 'power-switch', label: 'Power switch',
    x: 0.425, y: 0.745, width: 0.17, height: 0.075, rotation: 0,
    positionTolerance: 0.045, rotationTolerance: 20,
    sourceReference: 'Flat assembly diagram power-switch outline; Build 1 black inline switch.',
    orientationNote: 'Switch body runs horizontally, as in the source diagram and photograph.',
  },
  {
    id: 'pouch-battery-outline', partId: 'battery-400', label: 'Rechargeable 400 mAh pouch battery',
    x: 0.86, y: 0.72, width: 0.12, height: 0.105, rotation: 0,
    positionTolerance: 0.045, rotationTolerance: 20,
    sourceReference: 'Flat assembly diagram rechargeable battery outline; Build 1 PKCELL 3.7V 400mAh pouch.',
    orientationNote: 'Lead faces left toward the power-switch path, without creating a connection.',
  },
]

export const LAYOUT_TARGET_BY_ID = new Map(LAYOUT_TARGETS.map((target) => [target.id, target]))
export const LAYOUT_TARGET_BY_PART_ID = new Map(LAYOUT_TARGETS.map((target) => [target.partId, target]))

export const LAYOUT_COMPONENT_VISUALS: readonly LayoutComponentVisual[] = [
  { partId: 'thing-plus-rp2040', label: 'Thing Plus RP2040', shortLabel: 'RP2040', visualMethod: 'accurate simplified representation', sourceReference: 'Build 1 and flat assembly diagram', photoEvidence: 'Red, narrow board with USB-C at the upper end.' },
  { partId: 'i2c-button', label: 'Pushbutton switch module', shortLabel: 'MODE', visualMethod: 'accurate simplified representation', sourceReference: 'Build 1 and flat assembly diagram', photoEvidence: 'Red board with a prominent central pushbutton.' },
  { partId: 'pcf8523-clock', label: 'PCF8523 real-time clock', shortLabel: 'RTC', visualMethod: 'accurate simplified representation', sourceReference: 'Build 1 and flat assembly diagram', photoEvidence: 'Dark board with a circular coin-cell holder.' },
  { partId: 'cr1220', label: 'CR1220 coin cell', shortLabel: 'CR1220', visualMethod: 'accurate simplified representation', sourceReference: 'Build 1 and flat assembly diagram', photoEvidence: 'Loose metallic coin cell beside the clock module.' },
  { partId: 'triad-spectral-sensor', label: 'AS7265x TRIAD 18-channel spectrometer', shortLabel: 'TRIAD', visualMethod: 'accurate simplified representation', sourceReference: 'Build 1 and flat assembly diagram', photoEvidence: 'Red square board with circular optical assembly.' },
  { partId: 'oled-display', label: '128×32 OLED display', shortLabel: 'OLED', visualMethod: 'accurate simplified representation', sourceReference: 'Build 1 and flat assembly diagram', photoEvidence: 'Blue board with a black rectangular screen.' },
  { partId: 'battery-400', label: 'Rechargeable 400 mAh pouch battery', shortLabel: '400 mAh', visualMethod: 'accurate simplified representation', sourceReference: 'Build 1 and flat assembly diagram', photoEvidence: 'Silver pouch marked 3.7V 400mAh.' },
  { partId: 'power-switch', label: 'Battery disconnect / power switch', shortLabel: 'POWER', visualMethod: 'accurate simplified representation', sourceReference: 'Build 1 and flat assembly diagram', photoEvidence: 'Black rounded inline switch body.' },
]

export const LAYOUT_VISUAL_BY_PART_ID = new Map(
  LAYOUT_COMPONENT_VISUALS.map((component) => [component.partId, component]),
)
