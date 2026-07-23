import { sourceAssetUrl } from './sourceReferences'
import type { RoutingCameraPreset } from '../types'

export type ClearanceRegionType = 'cover-contact' | 'latch' | 'wall' | 'safe-corridor' | 'component' | 'retainer'
export interface RoutingRegion {
  id: string
  label: string
  type: ClearanceRegionType
  boundsMm: readonly [number, number, number, number, number, number]
  severity: 'safe' | 'warning' | 'block'
  explanation: string
  sourceReference: string
  confidence: 'high' | 'medium' | 'low'
}
export interface RoutingCorridor {
  id: string
  label: string
  acceptedPairKeys: readonly string[]
  regionMm: readonly [number, number, number, number, number, number]
  preferredControlPointMm: readonly [number, number, number]
  required: boolean
  sourceReference: string
  confidence: 'high' | 'medium'
}
export interface RouteTemplate {
  pairKey: string
  label: string
  controlPointsMm: Array<readonly [number, number, number]>
  corridorIds: string[]
  sourceFinding: string
  confidence: 'high' | 'medium'
}

export const BOTTOM_COVER_STL_URL = sourceAssetUrl('Q2 parts STL files/Q2 bottom cover.STL')
export const BOTTOM_COVER_DIMENSIONS_MM = [65.79, 181.945, 11.5] as const
export const QWIIC_AVAILABLE_LENGTH_MM = 100
// The source package does not specify separate lead lengths. This preserves
// the conservative visual reach already used by Phase 2D, and the UI labels
// it as an approximate allowance rather than a manufacturer specification.
export const POWER_LEAD_ALLOWANCE_MM = 165
export const ROUTE_LENGTH_TOLERANCE_MM = 8
export const MIN_SLACK_RATIO = 1.035

export const pairKey = (a: string | null, b: string | null) => a && b ? [a, b].sort().join('|') : ''

export const ROUTING_CORRIDORS: readonly RoutingCorridor[] = [
  { id: 'upper-left-service', label: 'Upper-left service channel', acceptedPairKeys: ['rtc-qwiic-right|triad-qwiic-left'], regionMm: [-28, -17, 27, 67, 14, 24], preferredControlPointMm: [-23, 48, 18], required: false, sourceReference: 'Build 4 left-side clock/TRIAD lead bundle.', confidence: 'medium' },
  { id: 'upper-right-service', label: 'Upper-right service channel', acceptedPairKeys: ['oled-qwiic|triad-qwiic-right'], regionMm: [17, 28, 5, 67, 14, 24], preferredControlPointMm: [23, 37, 18], required: false, sourceReference: 'Build 4 right-side TRIAD/display lead bundle.', confidence: 'medium' },
  { id: 'mid-left-service', label: 'Left interior channel', acceptedPairKeys: ['button-qwiic-right|rtc-qwiic-left'], regionMm: [-28, -17, -57, 36, 14, 24], preferredControlPointMm: [-23, -8, 18], required: false, sourceReference: 'Build 4 lead descending beside CK and DISP retainers.', confidence: 'medium' },
  { id: 'mid-right-service', label: 'Right interior channel', acceptedPairKeys: ['button-qwiic-left|rp2040-qwiic', 'rp2040-battery|switch-output'], regionMm: [17, 28, -72, -20, 14, 25], preferredControlPointMm: [23, -43, 19], required: false, sourceReference: 'Build 4 right-side processor/button corridor.', confidence: 'medium' },
  { id: 'lower-left-power', label: 'Lower-left battery channel', acceptedPairKeys: ['battery-lead|switch-input'], regionMm: [-26, -14, -88, -64, 14, 24], preferredControlPointMm: [-21, -77, 18], required: false, sourceReference: 'Build 4 battery lead turns beside BAT and switch body.', confidence: 'medium' },
  { id: 'center-open', label: 'Open center bridge', acceptedPairKeys: ['button-qwiic-left|rp2040-qwiic', 'button-qwiic-right|rtc-qwiic-left', 'rp2040-battery|switch-output'], regionMm: [-16, 16, -65, 25, 15, 27], preferredControlPointMm: [0, -28, 20], required: false, sourceReference: 'Build 4 free slack across the open central interior.', confidence: 'medium' },
]

export const ROUTING_REGIONS: readonly RoutingRegion[] = [
  { id: 'cover-left-contact', label: 'Left cover seating edge', type: 'cover-contact', boundsMm: [-33, -27, -91, 91, 10, 30], severity: 'block', explanation: 'The bottom cover must seat on this perimeter in Step 10.', sourceReference: 'Bottom-cover STL and Build 4 loose-cover photograph.', confidence: 'high' },
  { id: 'cover-right-contact', label: 'Right cover seating edge', type: 'cover-contact', boundsMm: [27, 33, -91, 91, 10, 30], severity: 'block', explanation: 'The bottom cover must seat on this perimeter in Step 10.', sourceReference: 'Bottom-cover STL and Build 4 loose-cover photograph.', confidence: 'high' },
  { id: 'cover-top-contact', label: 'Upper cover seating edge', type: 'cover-contact', boundsMm: [-33, 33, 85, 91, 10, 30], severity: 'block', explanation: 'Keep wiring inside the upper housing wall.', sourceReference: 'Bottom-cover STL bounds.', confidence: 'high' },
  { id: 'cover-bottom-contact', label: 'Lower cover seating edge', type: 'cover-contact', boundsMm: [-33, 33, -91, -85, 10, 30], severity: 'block', explanation: 'Keep the battery lead away from the closing edge.', sourceReference: 'Bottom-cover STL bounds and Build 4.', confidence: 'high' },
  { id: 'left-latch', label: 'Left cover latch', type: 'latch', boundsMm: [-33, -23, -69, -55, 9, 30], severity: 'block', explanation: 'A cable here prevents the cover latch from closing.', sourceReference: 'Top-housing and bottom-cover STL side-latch geometry.', confidence: 'medium' },
  { id: 'right-latch', label: 'Right cover latch', type: 'latch', boundsMm: [23, 33, -69, -55, 9, 30], severity: 'block', explanation: 'A cable here prevents the cover latch from closing.', sourceReference: 'Top-housing and bottom-cover STL side-latch geometry.', confidence: 'medium' },
  { id: 'interior-safe', label: 'Interior cable volume', type: 'safe-corridor', boundsMm: [-26, 26, -84, 84, 13, 27], severity: 'safe', explanation: 'Approximate open volume visible in Build 4; avoid boards and clips within it.', sourceReference: 'Build 4 and top-housing STL.', confidence: 'medium' },
]

export const ROUTE_TEMPLATES: readonly RouteTemplate[] = [
  { pairKey: 'button-qwiic-left|rp2040-qwiic', label: 'RP2040 ↔ button', controlPointsMm: [[23, -32, 19], [23, -48, 19]], corridorIds: ['mid-right-service'], sourceFinding: 'Short link follows the right side of the RP2040/button area.', confidence: 'medium' },
  { pairKey: 'button-qwiic-right|rtc-qwiic-left', label: 'Button ↔ RTC', controlPointsMm: [[-17, -39, 18], [-17, 0, 18]], corridorIds: ['mid-left-service'], sourceFinding: 'Long link turns left below the processor clip, then rises beside DISP; this preserves modest slack within the 100 mm cable.', confidence: 'medium' },
  { pairKey: 'rtc-qwiic-right|triad-qwiic-left', label: 'RTC ↔ TRIAD', controlPointsMm: [[-22, 39, 18], [-23, 57, 18]], corridorIds: ['upper-left-service'], sourceFinding: 'Short upper link loops beside the RTC retainer.', confidence: 'medium' },
  { pairKey: 'oled-qwiic|triad-qwiic-right', label: 'TRIAD ↔ OLED', controlPointsMm: [[23, 57, 18], [23, 30, 18], [22, 14, 18]], corridorIds: ['upper-right-service'], sourceFinding: 'Upper link descends along the right interior edge.', confidence: 'medium' },
  { pairKey: 'battery-lead|switch-input', label: 'Battery ↔ switch', controlPointsMm: [[-20, -84, 18], [-21, -76, 18], [-18, -70, 18]], corridorIds: ['lower-left-power'], sourceFinding: 'Battery lead remains inside the lower-left battery/switch corridor.', confidence: 'medium' },
  { pairKey: 'rp2040-battery|switch-output', label: 'Switch ↔ RP2040', controlPointsMm: [[21, -68, 19], [23, -48, 20], [19, -31, 19]], corridorIds: ['mid-right-service'], sourceFinding: 'Red/black lead rises along the right side of button and processor.', confidence: 'medium' },
]

export const ROUTE_TEMPLATE_BY_PAIR = new Map(ROUTE_TEMPLATES.map((template) => [template.pairKey, template]))
export const ROUTING_CORRIDOR_BY_ID = new Map(ROUTING_CORRIDORS.map((corridor) => [corridor.id, corridor]))
export const ROUTING_CAMERA_PRESETS: readonly RoutingCameraPreset[] = ['fit', 'top', 'build-four', 'front', 'back', 'left', 'right', 'selected-cable']
