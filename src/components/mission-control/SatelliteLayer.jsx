import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { propagateAt, geodeticToVec3 } from '../../utils/orbitMath.js'

// Scratch vectors reused across frames (single-threaded, so this is safe).
const _base = new THREE.Vector3()
const _up = new THREE.Vector3()
const _tan = new THREE.Vector3()
const _bit = new THREE.Vector3()

// Small visual fan-out so spacecraft that share a host (e.g. ISS instruments)
// are each individually visible instead of overlapping. Purely a display aid;
// the numeric position shown in the panel remains the true (host) position.
const CO_LOCATED_OFFSET = 0.09

// Legibility shadow so plain white names stay readable over the bright Earth.
const LABEL_SHADOW =
  '0 1px 3px rgba(0,0,0,0.95), 0 0 2px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.6)'

// One satellite marker: a tiny white anchor dot plus a plain white name label
// (NASA-Eyes style). Position updates every frame via refs (no React state), so
// movement stays smooth without re-rendering the tree.
function SatelliteMarker({
  item,
  clock,
  exaggeration,
  selected,
  hovered,
  onHover,
  onSelect,
  offsetIndex = 0,
  offsetCount = 1,
}) {
  const groupRef = useRef()

  useFrame(() => {
    const group = groupRef.current
    if (!group) return
    const s = propagateAt(item.satrec, clock.getDate())
    if (!s.ok) {
      group.visible = false
      return
    }
    group.visible = true
    const [x, y, z] = geodeticToVec3(s.latRad, s.lonRad, s.altKm, exaggeration)
    // The selected craft renders as a full 3D model at its true position, so it
    // skips the co-located fan-out (keeps its label aligned with the model).
    if (offsetCount > 1 && !selected) {
      // Fan co-located spacecraft evenly around their shared point.
      _base.set(x, y, z)
      _up.set(0, 1, 0)
      if (Math.abs(_base.y) > 0.99 * _base.length()) _up.set(1, 0, 0)
      _tan.crossVectors(_base, _up).normalize()
      _bit.crossVectors(_base, _tan).normalize()
      const angle = (offsetIndex / offsetCount) * Math.PI * 2
      const ca = Math.cos(angle) * CO_LOCATED_OFFSET
      const sa = Math.sin(angle) * CO_LOCATED_OFFSET
      group.position.set(
        x + _tan.x * ca + _bit.x * sa,
        y + _tan.y * ca + _bit.y * sa,
        z + _tan.z * ca + _bit.z * sa,
      )
    } else {
      group.position.set(x, y, z)
    }
  })

  const name = item.mission?.displayName || item.id
  const active = selected || hovered

  return (
    <group ref={groupRef}>
      {/* larger invisible hit area for easy selection */}
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover(item.id)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          onHover(null)
          document.body.style.cursor = 'auto'
        }}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(item.id)
        }}
      >
        <sphereGeometry args={[0.13, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* tiny white anchor dot (hidden when selected: the 3D model marks it) */}
      {!selected && (
        <mesh scale={hovered ? 1.6 : 1}>
          <sphereGeometry args={[0.016, 12, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      )}

      {/* plain white name label, no box */}
      <Html center zIndexRange={[16, 0]} style={{ pointerEvents: 'none' }}>
        <span
          className={`block translate-x-[10px] whitespace-nowrap leading-none tracking-wide transition-all duration-150 ${
            active ? 'text-[12px] font-bold text-white' : 'text-[11px] font-semibold text-white/85'
          }`}
          style={{ textShadow: LABEL_SHADOW }}
        >
          {name}
        </span>
      </Html>
    </group>
  )
}

// Renders all valid mission markers. `items` should already be validated.
export default function SatelliteLayer({
  items,
  clock,
  exaggeration,
  selectedId,
  onSelect,
  hoveredId,
  onHover,
}) {
  // Stable list so markers aren't recreated every render.
  const list = useMemo(() => items.filter((i) => i.valid), [items])

  // Group markers that share an orbital object (e.g. ISS-hosted instruments) so
  // each can be fanned out slightly and remain individually visible.
  const offsets = useMemo(() => {
    const groups = {}
    for (const i of list) {
      const key = i.orbit?.noradCatalogNumber ?? i.id
      ;(groups[key] ||= []).push(i.id)
    }
    const map = {}
    for (const ids of Object.values(groups)) {
      ids.forEach((id, idx) => {
        map[id] = { index: idx, count: ids.length }
      })
    }
    return map
  }, [list])

  return (
    <group>
      {list.map((item) => {
        const selected = item.id === selectedId
        const hovered = item.id === hoveredId
        const off = offsets[item.id] || { index: 0, count: 1 }
        return (
          <SatelliteMarker
            key={item.id}
            item={item}
            clock={clock}
            exaggeration={exaggeration}
            selected={selected}
            hovered={hovered}
            onHover={onHover}
            onSelect={onSelect}
            offsetIndex={off.index}
            offsetCount={off.count}
          />
        )
      })}
    </group>
  )
}
