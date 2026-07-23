import type {
  ScaffoldCameraPreset,
  ScaffoldTarget,
  ScaffoldingEnclosurePartId,
} from '../types'
import { sourceAssetUrl } from './sourceReferences'

const STL_ROOT = 'Q2 parts STL files'

export interface ScaffoldingModel {
  id: ScaffoldingEnclosurePartId
  label: string
  stlRelativePath: string
  stlUrl: string
  dimensionsMm: readonly [number, number, number]
  beforePhotoId: string
  afterPhotoId: string
  connectedComponentCount: number
  sourceNote: string
}

export const SCAFFOLDING_MODELS: ScaffoldingModel[] = [
  {
    id: 'top-housing',
    label: 'Top housing',
    stlRelativePath: `${STL_ROOT}/Q2 top housing.STL`,
    stlUrl: sourceAssetUrl(`${STL_ROOT}/Q2 top housing.STL`),
    dimensionsMm: [65.79, 181.945, 14.7],
    beforePhotoId: 'scaffolding-top-before',
    afterPhotoId: 'scaffolding-top-after',
    connectedComponentCount: 1,
    sourceNote: 'The supplied STL is one connected mesh. The before photograph identifies two temporary material groups, but does not provide separable source triangles.',
  },
  {
    id: 'bottom-cover',
    label: 'Bottom cover',
    stlRelativePath: `${STL_ROOT}/Q2 bottom cover.STL`,
    stlUrl: sourceAssetUrl(`${STL_ROOT}/Q2 bottom cover.STL`),
    dimensionsMm: [65.79, 181.945, 11.5],
    beforePhotoId: 'scaffolding-bottom-before',
    afterPhotoId: 'scaffolding-bottom-after',
    connectedComponentCount: 1,
    sourceNote: 'The supplied STL is one connected mesh. The before photograph identifies two sacrificial opening bridges; the large collar remains permanent.',
  },
]

export const SCAFFOLDING_MODEL_BY_ID = new Map(
  SCAFFOLDING_MODELS.map((model) => [model.id, model]),
)

// These are source-photo-supported interaction regions. Their anchors are only
// teaching hitboxes over the source STL: neither STL contains an independently
// extractable scaffold component that can truthfully be deleted as geometry.
export const SCAFFOLD_TARGETS: ScaffoldTarget[] = [
  {
    id: 'top-access-support-inner',
    enclosurePartId: 'top-housing',
    kind: 'removable',
    label: 'Top housing inner access support',
    location: 'Upper-left interior access region in the top-housing before photograph.',
    description: 'Temporary printing material identified by the upper arrow in the official before photograph. Clear this marked access region only.',
    sourcePhotoId: 'scaffolding-top-before',
    meshComponentIndex: 0,
    meshEvidence: 'Part of connected component 0; represented as a photo-supported hitbox, not a separable STL component.',
    interactionAnchorMm: [9, 147, 11],
    interactionSizeMm: [13, 16, 10],
  },
  {
    id: 'top-access-support-front',
    enclosurePartId: 'top-housing',
    kind: 'removable',
    label: 'Top housing front access support',
    location: 'Lower-left/front access region in the top-housing before photograph.',
    description: 'Temporary printing material identified by the lower arrow in the official before photograph. Preserve the surrounding housing wall and latch geometry.',
    sourcePhotoId: 'scaffolding-top-before',
    meshComponentIndex: 0,
    meshEvidence: 'Part of connected component 0; represented as a photo-supported hitbox, not a separable STL component.',
    interactionAnchorMm: [9, 22, 10],
    interactionSizeMm: [17, 18, 10],
  },
  {
    id: 'bottom-opening-bridge-left',
    enclosurePartId: 'bottom-cover',
    kind: 'removable',
    label: 'Bottom cover opening bridge, left',
    location: 'Left side of the small sacrificial bridge group in the bottom-cover before photograph.',
    description: 'One of two photo-identified sacrificial bridges blocking the small bottom-cover access opening.',
    sourcePhotoId: 'scaffolding-bottom-before',
    meshComponentIndex: 0,
    meshEvidence: 'Part of connected component 0; represented as a photo-supported hitbox, not a separable STL component.',
    interactionAnchorMm: [20, 161, 8],
    interactionSizeMm: [10, 9, 8],
  },
  {
    id: 'bottom-opening-bridge-right',
    enclosurePartId: 'bottom-cover',
    kind: 'removable',
    label: 'Bottom cover opening bridge, right',
    location: 'Right side of the small sacrificial bridge group in the bottom-cover before photograph.',
    description: 'One of two photo-identified sacrificial bridges blocking the small bottom-cover access opening.',
    sourcePhotoId: 'scaffolding-bottom-before',
    meshComponentIndex: 0,
    meshEvidence: 'Part of connected component 0; represented as a photo-supported hitbox, not a separable STL component.',
    interactionAnchorMm: [35, 161, 8],
    interactionSizeMm: [10, 9, 8],
  },
  {
    id: 'top-housing-latch-wall',
    enclosurePartId: 'top-housing',
    kind: 'permanent',
    label: 'Top housing wall and latch geometry',
    location: 'Outer shell beside the marked top-housing supports.',
    description: 'Permanent enclosure geometry. The official after photograph retains this wall and latch area.',
    sourcePhotoId: 'scaffolding-top-after',
    meshComponentIndex: 0,
    meshEvidence: 'Permanent area within connected component 0; never eligible for removal.',
    interactionAnchorMm: [27, 24, 10],
    interactionSizeMm: [14, 12, 8],
  },
  {
    id: 'bottom-cover-collar',
    enclosurePartId: 'bottom-cover',
    kind: 'permanent',
    label: 'Bottom cover circular collar',
    location: 'Large circular collar centered in the bottom-cover reference photographs.',
    description: 'Permanent enclosure geometry. The official before-and-after photographs retain the collar.',
    sourcePhotoId: 'scaffolding-bottom-after',
    meshComponentIndex: 0,
    meshEvidence: 'Permanent area within connected component 0; never eligible for removal.',
    interactionAnchorMm: [33, 91, 8],
    interactionSizeMm: [27, 27, 10],
  },
]

export const SCAFFOLD_TARGET_BY_ID = new Map(
  SCAFFOLD_TARGETS.map((target) => [target.id, target]),
)

export const CAMERA_PRESETS: readonly ScaffoldCameraPreset[] = [
  'fit', 'front', 'back', 'top', 'bottom', 'left', 'right',
]

export function targetsForEnclosurePart(partId: ScaffoldingEnclosurePartId) {
  return SCAFFOLD_TARGETS.filter((target) => target.enclosurePartId === partId)
}

export function removableTargetsForEnclosurePart(partId: ScaffoldingEnclosurePartId) {
  return targetsForEnclosurePart(partId).filter((target) => target.kind === 'removable')
}
