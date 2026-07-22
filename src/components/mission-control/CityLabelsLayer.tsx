// @ts-nocheck
import { useMemo, useRef } from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { surfaceVec3, DEG2RAD } from '../../utils/orbitMath'
import { NASA_EYES_CITIES } from '../../data/topCities'

const SURFACE_LIFT = 0.014
const HORIZON_CUTOFF = 0.045
const EDGE_PADDING = 18
const TOP_SAFE_AREA = 82
const BOTTOM_SAFE_AREA = 78
const COLLISION_GAP = 5

const _toCamera = new THREE.Vector3()
const _projected = new THREE.Vector3()

function CityPin() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 32"
      className="mx-auto block h-7 w-[21px] drop-shadow-[0_1px_1px_rgba(0,0,0,0.85)]"
    >
      <path
        fill="#f2381f"
        d="M12 0C5.37 0 0 5.26 0 11.75 0 20.48 12 32 12 32s12-11.52 12-20.25C24 5.26 18.63 0 12 0Z"
      />
      <circle cx="12" cy="11.5" r="4.25" fill="#9d1a10" />
    </svg>
  )
}

function boxesOverlap(a, b) {
  return !(
    a.right + COLLISION_GAP < b.left ||
    a.left > b.right + COLLISION_GAP ||
    a.bottom + COLLISION_GAP < b.top ||
    a.top > b.bottom + COLLISION_GAP
  )
}

// NASA Eyes-style city labels are projected into one screen-space overlay.
// Keeping one DOM root avoids dozens of competing Drei Html occlusion raycasts;
// the front hemisphere and label collisions are handled explicitly instead.
export default function CityLabelsLayer({ show }) {
  const markerRefs = useRef([])
  const cities = useMemo(
    () =>
      NASA_EYES_CITIES.map((city) => ({
        ...city,
        position: new THREE.Vector3(
          ...surfaceVec3(city.lat * DEG2RAD, city.lon * DEG2RAD, SURFACE_LIFT),
        ),
      })),
    [],
  )

  useFrame(({ camera, size }) => {
    if (!show) return

    const candidates = []
    for (let index = 0; index < cities.length; index += 1) {
      const city = cities[index]
      const node = markerRefs.current[index]
      if (!node) continue

      node.style.display = 'none'

      // A surface point is visible only when its outward normal faces the
      // camera. The small cutoff prevents pins flickering directly on the limb.
      _toCamera.copy(camera.position).sub(city.position).normalize()
      const facing = city.position.clone().normalize().dot(_toCamera)
      if (facing <= HORIZON_CUTOFF) continue

      _projected.copy(city.position).project(camera)
      if (_projected.z < -1 || _projected.z > 1) continue

      const x = (_projected.x * 0.5 + 0.5) * size.width
      const y = (-_projected.y * 0.5 + 0.5) * size.height
      const width = Math.max(48, city.name.length * 6.4 + 8)
      const box = {
        left: x - width / 2,
        right: x + width / 2,
        top: y - 30,
        bottom: y + 14,
      }

      if (
        box.left < EDGE_PADDING ||
        box.right > size.width - EDGE_PADDING ||
        box.top < TOP_SAFE_AREA ||
        box.bottom > size.height - BOTTOM_SAFE_AREA
      ) {
        continue
      }

      candidates.push({ index, x, y, facing, box })
    }

    // Prefer cities nearest the center of the visible globe, then hide only
    // labels whose actual screen rectangles collide with a higher-priority one.
    candidates.sort((a, b) => b.facing - a.facing)
    const accepted = []
    for (const candidate of candidates) {
      if (accepted.some((box) => boxesOverlap(candidate.box, box))) continue
      accepted.push(candidate.box)

      const node = markerRefs.current[candidate.index]
      node.style.display = 'flex'
      node.style.transform = `translate3d(${candidate.x}px, ${candidate.y}px, 0) translate(-50%, -27px)`
    }
  })

  if (!show) return null

  return (
    <Html fullscreen zIndexRange={[18, 0]} style={{ pointerEvents: 'none' }}>
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {cities.map((city, index) => (
          <div
            key={city.name}
            ref={(node) => {
              markerRefs.current[index] = node
            }}
            className="absolute left-0 top-0 hidden flex-col items-center whitespace-nowrap will-change-transform"
          >
            <CityPin />
            <span
              className="-mt-px text-[11px] font-medium leading-none text-white"
              style={{
                fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                textShadow:
                  '-1px -1px 0 rgba(0,0,0,.9), 1px -1px 0 rgba(0,0,0,.9), -1px 1px 0 rgba(0,0,0,.9), 1px 1px 0 rgba(0,0,0,.9), 0 2px 3px rgba(0,0,0,.95)',
              }}
            >
              {city.name}
            </span>
          </div>
        ))}
      </div>
    </Html>
  )
}
