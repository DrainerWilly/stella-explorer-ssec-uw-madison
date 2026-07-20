// @ts-nocheck
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { sampleGroundPath, splitAtAntimeridian, surfaceVec3 } from '../../utils/orbitMath'

const SURFACE_LIFT = 0.01 // sit just above the globe so the line isn't hidden

function buildSegmentGeometries(satrec, centerDate) {
  const samples = sampleGroundPath(satrec, centerDate, 220)
  if (samples.length < 2) return []
  // Split where the path crosses the antimeridian so it never streaks across
  // the entire globe.
  const segments = splitAtAntimeridian(samples)
  return segments
    .map((seg) => {
      const arr = new Float32Array(seg.length * 3)
      for (let i = 0; i < seg.length; i++) {
        const [x, y, z] = surfaceVec3(seg[i].latRad, seg[i].lonRad, SURFACE_LIFT)
        arr[i * 3] = x
        arr[i * 3 + 1] = y
        arr[i * 3 + 2] = z
      }
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', new THREE.BufferAttribute(arr, 3))
      return g
    })
    .filter(Boolean)
}

// The selected mission's ground track: its path projected onto Earth's surface.
export default function GroundTrackLayer({ selected, clock, show }) {
  const geometries = useMemo(() => {
    if (!show || !selected?.valid) return []
    return buildSegmentGeometries(selected.satrec, clock.getDate())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id, show])

  useEffect(
    () => () => geometries.forEach((g) => g.dispose()),
    [geometries],
  )

  if (!geometries.length) return null
  const color = selected?.mission?.markerColor || '#ffd27f'

  return (
    <group>
      {geometries.map((g, i) => (
        <line key={i} geometry={g}>
          <lineBasicMaterial color={color} transparent opacity={0.95} depthWrite={false} />
        </line>
      ))}
    </group>
  )
}
