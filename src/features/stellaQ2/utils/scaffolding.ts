import {
  removableTargetsForEnclosurePart,
  SCAFFOLD_TARGET_BY_ID,
} from '../data/scaffolding'
import type {
  ScaffoldingEnclosurePartId,
  ScaffoldingValidationStatus,
} from '../types'

export function missingScaffoldIds(
  enclosurePartId: ScaffoldingEnclosurePartId,
  removedScaffoldIds: string[],
) {
  return removableTargetsForEnclosurePart(enclosurePartId)
    .filter((target) => !removedScaffoldIds.includes(target.id))
    .map((target) => target.id)
}

export function scaffoldPartIsComplete(
  enclosurePartId: ScaffoldingEnclosurePartId,
  removedScaffoldIds: string[],
) {
  return missingScaffoldIds(enclosurePartId, removedScaffoldIds).length === 0
}

export function scaffoldingIsComplete(removedScaffoldIds: string[]) {
  return scaffoldPartIsComplete('top-housing', removedScaffoldIds)
    && scaffoldPartIsComplete('bottom-cover', removedScaffoldIds)
}

export function validationStatusForScaffolding(
  selectedEnclosurePart: ScaffoldingEnclosurePartId,
  removedScaffoldIds: string[],
): ScaffoldingValidationStatus {
  const topComplete = scaffoldPartIsComplete('top-housing', removedScaffoldIds)
  const bottomComplete = scaffoldPartIsComplete('bottom-cover', removedScaffoldIds)
  if (topComplete && bottomComplete) return 'complete'
  if (selectedEnclosurePart === 'top-housing') return topComplete ? 'top-complete' : 'top-incomplete'
  return bottomComplete ? 'bottom-complete' : 'bottom-incomplete'
}

export function scaffoldTargetIsRemovable(scaffoldId: string) {
  return SCAFFOLD_TARGET_BY_ID.get(scaffoldId)?.kind === 'removable'
}

export function stlLoadFailureMessage(label: string) {
  return `${label} could not be loaded. Check that the supplied STL file is available, then try loading the STL again.`
}
