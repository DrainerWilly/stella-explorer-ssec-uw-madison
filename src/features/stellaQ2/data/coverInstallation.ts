import { BOTTOM_COVER_STL_URL } from './routing'
import { TOP_HOUSING_STL_URL } from './enclosure'
import type { CoverCameraPreset, CoverComparisonMode, CoverLatchId } from '../types'

export interface CoverLatchDefinition {
  id: CoverLatchId
  label: string
  owner: 'top-housing-flexure-and-bottom-cover-catch'
  positionMm: readonly [number, number, number]
  engagementDirection: readonly [number, number, number]
  coverFeatureBoundsMm: readonly [number, number, number, number, number, number]
  housingFeatureBoundsMm: readonly [number, number, number, number, number, number]
  maximumRepresentedTravelMm: 0
  sourceReference: string
  confidence: 'high' | 'medium'
}

export const BOTTOM_COVER_TARGET = {
  coverId: 'bottom-cover',
  stlUrl: BOTTOM_COVER_STL_URL,
  housingStlUrl: TOP_HOUSING_STL_URL,
  dimensionsMm: [65.79, 181.945, 11.5] as const,
  targetPositionMm: [0, 0, 26] as const,
  alignedPositionMm: [0, 0, 52] as const,
  stagingPositionMm: [95, 0, 45] as const,
  targetRotation: [0, 0, 0] as const,
  reversedRotation: [180, 0, 0] as const,
  insertionAxis: [0, 0, -1] as const,
  alignmentToleranceMm: 3,
  rotationToleranceDegrees: 8,
  seatingDepthMm: 26,
  latchIds: ['front-left-latch', 'front-right-latch', 'rear-left-latch', 'rear-right-latch'] as CoverLatchId[],
  matingRegionIds: ['cover-left-contact', 'cover-right-contact', 'cover-top-contact', 'cover-bottom-contact'],
  sourceReference: 'Q2 bottom cover.STL, Q2 top housing.STL, Build Step 10, and Version 3.0 latch-flexure note.',
  confidence: 'medium' as const,
}

// STL coordinates are translated from 0…65.79 × 0…181.945 mm into the
// centered enclosure coordinate system used by Steps 7–10. Boundary geometry
// shows four paired corner features. No source establishes a required order.
export const COVER_LATCHES: readonly CoverLatchDefinition[] = [
  {
    id: 'front-left-latch', label: 'Front-left latch', owner: 'top-housing-flexure-and-bottom-cover-catch',
    positionMm: [-32, -81, 13], engagementDirection: [1, 0, 0],
    coverFeatureBoundsMm: [-32.895, -31.145, -88.973, -72.973, 4.9, 8],
    housingFeatureBoundsMm: [-32.895, -31.02, -88.973, -73.473, 5.25, 12.77],
    maximumRepresentedTravelMm: 0,
    sourceReference: 'Matched front-left boundary geometry in both supplied enclosure STLs.', confidence: 'high',
  },
  {
    id: 'front-right-latch', label: 'Front-right latch', owner: 'top-housing-flexure-and-bottom-cover-catch',
    positionMm: [32, -81, 13], engagementDirection: [-1, 0, 0],
    coverFeatureBoundsMm: [31.145, 32.895, -88.973, -72.973, 4.9, 8],
    housingFeatureBoundsMm: [31.02, 32.895, -88.973, -73.473, 5.25, 12.77],
    maximumRepresentedTravelMm: 0,
    sourceReference: 'Matched front-right boundary geometry in both supplied enclosure STLs.', confidence: 'high',
  },
  {
    id: 'rear-left-latch', label: 'Rear-left latch', owner: 'top-housing-flexure-and-bottom-cover-catch',
    positionMm: [-32, 81, 13], engagementDirection: [1, 0, 0],
    coverFeatureBoundsMm: [-32.895, -31.145, 72.972, 88.972, 4.9, 8],
    housingFeatureBoundsMm: [-32.895, -31.02, 73.472, 88.972, 5.25, 12.77],
    maximumRepresentedTravelMm: 0,
    sourceReference: 'Matched rear-left boundary geometry in both supplied enclosure STLs.', confidence: 'high',
  },
  {
    id: 'rear-right-latch', label: 'Rear-right latch', owner: 'top-housing-flexure-and-bottom-cover-catch',
    positionMm: [32, 81, 13], engagementDirection: [-1, 0, 0],
    coverFeatureBoundsMm: [31.145, 32.895, 72.972, 88.972, 4.9, 8],
    housingFeatureBoundsMm: [31.02, 32.895, 73.472, 88.972, 5.25, 12.77],
    maximumRepresentedTravelMm: 0,
    sourceReference: 'Matched rear-right boundary geometry in both supplied enclosure STLs.', confidence: 'high',
  },
]

export const COVER_LATCH_BY_ID = new Map(COVER_LATCHES.map((latch) => [latch.id, latch]))
export const COVER_CAMERA_PRESETS: readonly CoverCameraPreset[] = ['fit', 'cover', 'top', 'bottom', 'front', 'rear', 'left', 'right', 'front-latches', 'rear-latches', 'interior']
export const COVER_COMPARISON_MODES: readonly CoverComparisonMode[] = ['workspace', 'build-four', 'side-by-side', 'build-four-large', 'annotated', 'transparent-comparison']
export const COVER_INTERIOR_CLEARANCE_CEILING_MM = 28

export function createInitialBottomCoverState() {
  return {
    positionMm: BOTTOM_COVER_TARGET.stagingPositionMm,
    rotation: BOTTOM_COVER_TARGET.targetRotation,
    state: 'staged' as const,
    seatingProgress: 0,
  }
}

export function createInitialCoverLatches() {
  return COVER_LATCHES.map((latch) => ({ latchId: latch.id, state: 'disengaged' as const }))
}

export function bottomCoverStlLoadFailureMessage() {
  return 'The supplied Q2 bottom cover.STL could not be loaded. Existing Step 4–9 progress is preserved; retry the source asset before completing Step 10.'
}
