import { RETAINERS, RETAINER_BY_ID, RETAINER_TARGET_BY_ID } from '../data/retainers'
import { validateEnclosure } from './enclosure'
import type { CableConnectionState, ComponentPlacement, EnclosurePlacement, RetainerId, RetainerInstallation, RetainerValidationStatus } from '../types'

const close = (a: number, b: number, tolerance: number) => Math.abs(a - b) <= tolerance
const rotationClose = (a: number, b: number, tolerance: number) => {
  const delta = Math.abs(((a - b) % 360 + 360) % 360)
  return Math.min(delta, 360 - delta) <= tolerance
}
const distance = (a: readonly number[], b: readonly number[]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])

export function isRetainerId(value: string | null): value is RetainerId {
  return Boolean(value && RETAINER_BY_ID.has(value as RetainerId))
}

export function createInitialRetainerInstallations(): RetainerInstallation[] {
  return RETAINERS.map((retainer) => ({ retainerId: retainer.id, targetId: null, positionMm: retainer.trayPositionMm, rotation: [0, 0, 0], installationState: 'tray' }))
}

export function isValidRetainerInstallation(value: unknown): value is RetainerInstallation {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<RetainerInstallation>
  return isRetainerId(item.retainerId ?? null)
    && (item.targetId === null || (typeof item.targetId === 'string' && RETAINER_TARGET_BY_ID.has(item.targetId)))
    && Array.isArray(item.positionMm) && item.positionMm.length === 3 && item.positionMm.every((coordinate) => typeof coordinate === 'number' && Number.isFinite(coordinate))
    && Array.isArray(item.rotation) && item.rotation.length === 3 && item.rotation.every((coordinate) => typeof coordinate === 'number' && Number.isFinite(coordinate))
    && ['tray', 'aligned', 'installing', 'installed'].includes(item.installationState ?? '')
}

export function retainerStlLoadFailureMessage(filename: string) {
  return `The supplied ${filename} could not be loaded. Check that exact source STL and retry; the remaining retainer progress is preserved.`
}

export function validateRetainers(
  layout: ComponentPlacement[], connections: CableConnectionState[], coinInstalled: boolean,
  placements: EnclosurePlacement[], microSdInstalled: boolean, installations: RetainerInstallation[], blocked: RetainerId[],
): { status: RetainerValidationStatus; messages: string[] } {
  const enclosure = validateEnclosure(layout, connections, coinInstalled, placements, microSdInstalled)
  if (enclosure.status !== 'valid') return { status: 'enclosure-incomplete', messages: ['Complete valid Step 7 component placement before retainers can be seated. Return to Step 7 to repair the listed component or cable issue.'] }
  const occupied = new Set<string>()
  for (const installation of installations) {
    if (!installation.targetId) continue
    if (occupied.has(installation.targetId)) return { status: 'target-occupied', messages: ['One retainer target contains more than one clip. Remove the extra clip before checking Step 8.'] }
    occupied.add(installation.targetId)
  }
  for (const retainer of RETAINERS) {
    const installed = installations.find((item) => item.retainerId === retainer.id)
    if (!installed || installed.installationState !== 'installed') return { status: 'incomplete', messages: [`${retainer.label} is still in the tray or not fully seated.`] }
    const expectedTarget = `${retainer.id}-target`
    if (installed.targetId !== expectedTarget) return { status: 'wrong-target', messages: [`${retainer.label} belongs at its matching ${retainer.securedComponentId} housing feature, not ${installed.targetId ?? 'the tray'}.`] }
    if (installed.positionMm[2] < retainer.installedPositionMm[2] - 3) return { status: 'component-collision', messages: [`${retainer.label} intersects the ${retainer.securedComponentId}; lift it and align it with the documented rails.`] }
    if (Math.abs(installed.positionMm[0]) > 29 || Math.abs(installed.positionMm[1]) > 89 || installed.positionMm[2] > 20) return { status: 'housing-collision', messages: [`${retainer.label} crosses the supplied top-housing boundary.`] }
    if (!installed.rotation.every((angle, index) => rotationClose(angle, retainer.installedRotation[index], retainer.rotationToleranceDegrees))) return { status: 'wrong-orientation', messages: [`${retainer.label} is rotated away from its rail-and-latch direction.`] }
    if (distance(installed.positionMm, retainer.installedPositionMm) > retainer.positionToleranceMm) return { status: 'not-seated', messages: [`${retainer.label} is aligned but has not snapped down onto its contact surface.`] }
    if (blocked.includes(retainer.id)) return { status: 'cable-pinched', messages: [`${retainer.label} traps a cable in its clearance path. Clear the cable route without changing the Step 6 endpoints.`] }
  }
  return { status: 'valid', messages: ['All five supplied retainer clips are seated on their documented rails. Step 9 wire routing and the bottom cover remain intentionally unavailable.'] }
}

export function retainerInstallationFor(retainerId: RetainerId): RetainerInstallation {
  const retainer = RETAINER_BY_ID.get(retainerId)!
  return { retainerId, targetId: `${retainerId}-target`, positionMm: retainer.installedPositionMm, rotation: retainer.installedRotation, installationState: 'installed' }
}
