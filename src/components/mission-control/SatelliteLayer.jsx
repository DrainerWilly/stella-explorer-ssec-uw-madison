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
// are each individually visible instead of overlapping. Purely a display aid —
// the numeric position shown in the panel remains the true (host) position.
const CO_LOCATED_OFFSET = 0.09

// One satellite marker. Position updates every frame via refs (no React state),
// so movement stays smooth without re-rendering the tree.
function SatelliteMarker({
  item,
  clock,
  exaggeration,
  selected,
  showLabel,
  hovered,
  onHover,
  onSelect,
  offsetIndex = 0,
  offsetCount = 1,
}) {
  const groupRef = useRef()
  const ringRef = useRef()
  const { camera } = useThree()
  const color = item.mission?.markerColor || '#cbd5e1'

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
    // skips the co-located fan-out (keeps its ring/label aligned with the model).
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
    // Keep the selection ring facing the camera.
    if (ringRef.current) ringRef.current.quaternion.copy(camera.quaternion)
  })

  const dotScale = selected ? 1.9 : hovered ? 1.4 : 1

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
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* dot + halo — hidden when selected (the 3D model provides the body) */}
      {!selected && (
        <>
          {/* soft halo */}
          <mesh scale={dotScale * 2.2}>
            <sphereGeometry args={[0.03, 12, 12]} />
            <meshBasicMaterial color={color} transparent opacity={0.22} depthWrite={false} />
          </mesh>

          {/* the glowing marker */}
          <mesh scale={dotScale}>
            <sphereGeometry args={[0.03, 14, 14]} />
            <meshBasicMaterial color={color} />
          </mesh>
        </>
      )}

      {/* selection focus ring */}
      {selected && (
        <mesh ref={ringRef}>
          <ringGeometry args={[0.075, 0.095, 40]} />
          <meshBasicMaterial color={color} transparent opacity={0.9} side={THREE.DoubleSide} />
        </mesh>
      )}

      {showLabel && (
        <Html center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <div
            className="translate-y-[-18px] whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-bold"
            style={{
              background: 'rgba(10,14,25,0.82)',
              color: '#e6edf7',
              border: `1px solid ${color}`,
            }}
          >
            {item.mission?.displayName || item.id}
          </div>
        </Html>
      )}
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
  showAllLabels,
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
            showLabel={showAllLabels || hovered}
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
