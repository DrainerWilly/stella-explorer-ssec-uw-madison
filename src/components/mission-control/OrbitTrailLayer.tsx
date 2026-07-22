// @ts-nocheck
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { sampleGroundPath, geodeticToVec3 } from '../../utils/orbitMath'

const WHITE = new THREE.Color('#ffffff')

function vividTrailColor(color) {
  return new THREE.Color(color || '#8aa').lerp(WHITE, 0.18)
}

function buildTrailGeometry(satrec, centerDate, exaggeration, count) {
  const samples = sampleGroundPath(satrec, centerDate, count)
  if (samples.length < 2) return null
  const positions = new Float32Array(samples.length * 3)
  for (let i = 0; i < samples.length; i += 1) {
    const [x, y, z] = geodeticToVec3(
      samples[i].latRad,
      samples[i].lonRad,
      samples[i].altKm,
      exaggeration,
    )
    positions[i * 3] = x
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = z
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  return geometry
}

function TrailLine({ geometry, color, opacity }) {
  if (!geometry) return null
  return (
    <line geometry={geometry}>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </line>
  )
}

/**
 * Orbit trails. Faint loops for every mission plus a stronger loop for the
 * selected mission. Trails are cached (useMemo) and recomputed only when the
 * mission set, the selection, or the exaggeration changes, never per frame.
 */
export default function OrbitTrailLayer({
  items,
  clock,
  exaggeration,
  selectedId,
  showFaintTrails,
  showSelectedTrail,
}) {
  const valid = useMemo(() => items.filter((i) => i.valid), [items])
  // Reference time captured once, so faint loops don't rebuild as time advances.
  const refDate = useRef(clock.getDate())

  const faintGeoms = useMemo(() => {
    if (!showFaintTrails) return []
    return valid.map((item) => ({
      id: item.id,
      color: vividTrailColor(item.mission?.markerColor || '#8aa'),
      geometry: buildTrailGeometry(item.satrec, refDate.current, exaggeration, 96),
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valid, exaggeration, showFaintTrails])

  const selectedGeom = useMemo(() => {
    if (!showSelectedTrail || !selectedId) return null
    const item = valid.find((i) => i.id === selectedId)
    if (!item) return null
    return {
      color: vividTrailColor(item.mission?.markerColor || '#9cf'),
      // Center on the current sim time when (re)selected.
      geometry: buildTrailGeometry(item.satrec, clock.getDate(), exaggeration, 160),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valid, selectedId, exaggeration, showSelectedTrail])

  // Dispose geometries when they change/unmount.
  useEffect(
    () => () => {
      faintGeoms.forEach((f) => f.geometry?.dispose())
    },
    [faintGeoms],
  )
  useEffect(() => () => selectedGeom?.geometry?.dispose(), [selectedGeom])

  return (
    <group>
      {faintGeoms.map((f) =>
        f.id === selectedId ? null : (
          <TrailLine key={f.id} geometry={f.geometry} color={f.color} opacity={0.34} />
        ),
      )}
      {selectedGeom && (
        <TrailLine geometry={selectedGeom.geometry} color={selectedGeom.color} opacity={1} />
      )}
    </group>
  )
}
