// @ts-nocheck
import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { EARTH_RADIUS_UNITS, propagateAt, geodeticToVec3 } from '../../utils/orbitMath'
import { ISS_HOST_PLATFORM_ID, isIssHostedMission } from '../../data/missionCatalog'

// Scratch vectors reused across frames (single-threaded, so this is safe).
const _base = new THREE.Vector3()
const _up = new THREE.Vector3()
const _tan = new THREE.Vector3()
const _bit = new THREE.Vector3()
const _toSat = new THREE.Vector3()
const _closest = new THREE.Vector3()
const _ndc = new THREE.Vector3()

// Small visual fan-out so spacecraft that share a host (e.g. ISS instruments)
// are each individually visible instead of overlapping. Purely a display aid;
// the numeric position shown in the panel remains the true (host) position.
const CO_LOCATED_OFFSET = 0.09
const ISS_HOSTED_FOCUS_OFFSET = 0.34

// Legibility shadow so plain white names stay readable over the bright Earth.
const LABEL_SHADOW =
  '0 1px 3px rgba(0,0,0,0.95), 0 0 2px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.6)'

// The label is nudged this far right of its anchor (see translate-x-[10px]).
const LABEL_NUDGE_PX = 10
// Breathing room required between two names before both may stay on screen.
const LABEL_GAP_PX = 4
// The tracker masthead is intentionally transparent. Keep labels out of its
// visual territory so orbiting names never run through the wordmark or nav.
const LABEL_TOP_SAFE_PX = 112

/**
 * True when the solid Earth sits between the camera and this point, i.e. the
 * satellite is round the back of the globe from the current viewpoint.
 *
 * The name labels are DOM (drei <Html>), so they get no depth testing and would
 * otherwise show straight through the planet. Exact segment/sphere test: find
 * where the camera→satellite segment passes closest to Earth's centre; if that
 * point falls inside the globe, it's blocked.
 */
function hiddenBehindEarth(camPos, satPos) {
  _toSat.subVectors(satPos, camPos)
  const lenSq = _toSat.lengthSq()
  if (lenSq === 0) return false
  // Parameter (0..1 along the segment) of closest approach to Earth's centre.
  const t = -camPos.dot(_toSat) / lenSq
  if (t <= 0 || t >= 1) return false // closest approach lies outside the segment
  _closest.copy(camPos).addScaledVector(_toSat, t)
  return _closest.lengthSq() < EARTH_RADIUS_UNITS * EARTH_RADIUS_UNITS
}

// Screen-space overlap test between two measured label boxes.
function labelsCollide(a, b) {
  return (
    Math.abs(a.sx - b.sx) * 2 < a.w + b.w + LABEL_GAP_PX * 2 &&
    Math.abs(a.sy - b.sy) * 2 < a.h + b.h + LABEL_GAP_PX * 2
  )
}

function newEntry() {
  return {
    group: null,
    label: null,
    occluded: false, // Earth is in the way: also blocks hover/click
    show: false, // label actually painted this frame
    onScreen: false,
    rank: 2,
    dist: 0,
    sx: 0,
    sy: 0,
    w: 0,
    h: 0,
    measuredActive: null,
  }
}

// One satellite marker: the plain white name alone marks the spot (NASA-Eyes
// style), over an invisible sphere that gives it a comfortable hit area. All
// per-frame work (position, occlusion, label visibility) is driven centrally by
// SatelliteLayer through `entry`, so markers never re-render as things move.
function SatelliteMarker({ item, entry, active, onHover, onSelect }) {
  const name = item.mission?.displayName || item.id

  return (
    <group
      ref={(o) => {
        entry.group = o
      }}
    >
      {/* larger invisible hit area for easy selection */}
      <mesh
        onPointerOver={(e) => {
          if (entry.occluded) return
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
          if (entry.occluded) return
          e.stopPropagation()
          onSelect(item.id)
        }}
      >
        <sphereGeometry args={[0.13, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* plain white name label, no box. zIndexRange stays below the page's
          floating chrome (z-10+) so panels like the satellite drawer cover it.
          Opacity is driven imperatively from the layer's frame loop, so it is
          deliberately not part of the React style prop. */}
      <Html center zIndexRange={[9, 0]} style={{ pointerEvents: 'none' }}>
        <span
          ref={(o) => {
            entry.label = o
          }}
          className={`block translate-x-[10px] whitespace-nowrap leading-none tracking-wide transition-opacity duration-150 ${
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
  const { camera, size } = useThree()

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

  // Per-marker frame state, carried across renders and pruned when the mission
  // list changes. Markers attach their DOM/scene refs to their own entry.
  const entriesRef = useRef(new Map())
  const entries = useMemo(() => {
    const next = new Map()
    for (const item of list) next.set(item.id, entriesRef.current.get(item.id) || newEntry())
    entriesRef.current = next
    return next
  }, [list])

  // Reused scratch arrays so the declutter pass allocates nothing per frame.
  const candidatesRef = useRef([])
  const placedRef = useRef([])

  useFrame(() => {
    const date = clock.getDate()
    const candidates = candidatesRef.current
    candidates.length = 0

    // Phase 1: propagate and place every marker, and work out what the globe
    // hides. Scene writes only, no DOM touched.
    for (const item of list) {
      const entry = entries.get(item.id)
      const group = entry?.group
      if (!group) continue

      const s = propagateAt(item.satrec, date)
      if (!s.ok) {
        group.visible = false
        entry.occluded = true
        entry.show = false
        continue
      }
      group.visible = true

      const [x, y, z] = geodeticToVec3(s.latRad, s.lonRad, s.altKm, exaggeration)
      const off = offsets[item.id] || { index: 0, count: 1 }
      const selected = item.id === selectedId
      const issHostedFocus = selectedId === ISS_HOST_PLATFORM_ID && isIssHostedMission(item.mission)
      // The selected craft renders as a full 3D model at its true position, so
      // it skips the co-located fan-out (keeps its label aligned with the model).
      if (off.count > 1 && !selected) {
        // Fan co-located spacecraft evenly around their shared point.
        _base.set(x, y, z)
        _up.set(0, 1, 0)
        if (Math.abs(_base.y) > 0.99 * _base.length()) _up.set(1, 0, 0)
        _tan.crossVectors(_base, _up).normalize()
        _bit.crossVectors(_base, _tan).normalize()
        const angle = (off.index / off.count) * Math.PI * 2
        const offset = issHostedFocus ? ISS_HOSTED_FOCUS_OFFSET : CO_LOCATED_OFFSET
        const ca = Math.cos(angle) * offset
        const sa = Math.sin(angle) * offset
        group.position.set(
          x + _tan.x * ca + _bit.x * sa,
          y + _tan.y * ca + _bit.y * sa,
          z + _tan.z * ca + _bit.z * sa,
        )
      } else {
        group.position.set(x, y, z)
      }

      entry.occluded = hiddenBehindEarth(camera.position, group.position)
      entry.show = false
      if (entry.occluded) continue

      const hovered = item.id === hoveredId
      // Once a detailed spacecraft model is selected, DOM labels cannot be
      // depth-tested against that WebGL model. Hide the regular label field in
      // this focused mode so nearby satellite names do not paint over the model;
      // keep hover labels available for interaction feedback. The exception is
      // ISS: when it is selected, reveal the ISS-hosted instruments as a small
      // local cluster so they are discoverable without crowding the default globe.
      if (selectedId && !hovered && !issHostedFocus) continue

      entry.rank = hovered ? 0 : selected || issHostedFocus ? 1 : 2
      candidates.push(entry)
    }

    // Phase 2: project to screen pixels and measure the names. DOM reads only:
    // opacity writes are deferred to phase 4 so this can't thrash layout.
    for (const entry of candidates) {
      _ndc.copy(entry.group.position).project(camera)
      // z > 1 means the point sits behind the camera, where NDC x/y are garbage.
      entry.onScreen = _ndc.z <= 1
      if (!entry.onScreen) continue
      entry.sx = (_ndc.x * 0.5 + 0.5) * size.width + LABEL_NUDGE_PX
      entry.sy = (-_ndc.y * 0.5 + 0.5) * size.height
      entry.dist = camera.position.distanceTo(entry.group.position)

      const label = entry.label
      if (!label) continue
      // Text is static, so measure once per font-size change rather than per
      // frame. A label not laid out yet reports 0 and is retried next frame.
      const active = entry.rank < 2
      if (entry.w === 0 || entry.measuredActive !== active) {
        entry.w = label.offsetWidth
        entry.h = label.offsetHeight
        entry.measuredActive = active
      }
    }

    // Phase 3: declutter. Zooming in on one satellite collapses distant ones
    // into a few pixels, so keep the names that matter most (selected, then
    // hovered, then nearest the camera) and drop any that would collide with a
    // name already kept.
    candidates.sort((a, b) => a.rank - b.rank || a.dist - b.dist)
    const placed = placedRef.current
    placed.length = 0
    for (const entry of candidates) {
      if (!entry.onScreen || entry.w === 0) continue
      if (entry.sy - entry.h / 2 <= LABEL_TOP_SAFE_PX) continue
      let clash = false
      for (const other of placed) {
        if (labelsCollide(entry, other)) {
          clash = true
          break
        }
      }
      if (clash) continue
      entry.show = true
      placed.push(entry)
    }

    // Phase 4: paint. Opacity doesn't invalidate layout, so these writes are
    // safe to batch here after all the reads above.
    for (const entry of entries.values()) {
      if (entry.label) entry.label.style.opacity = entry.show ? '1' : '0'
    }
  })

  return (
    <group>
      {list.map((item) => (
        <SatelliteMarker
          key={item.id}
          item={item}
          entry={entries.get(item.id)}
          active={item.id === selectedId || item.id === hoveredId}
          onHover={onHover}
          onSelect={onSelect}
        />
      ))}
    </group>
  )
}
