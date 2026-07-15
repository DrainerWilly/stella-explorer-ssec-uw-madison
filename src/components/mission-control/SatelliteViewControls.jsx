import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { EARTH_RADIUS_UNITS, propagateAt, geodeticToVec3 } from '../../utils/orbitMath.js'

// NASA-Eyes-style spacecraft view: while a mission is selected, the camera rides
// with the satellite in its local frame (up = away from Earth's centre), so the
// planet's limb sits below the craft and the ground visibly slides past as it
// flies. Dragging orbits the camera around the SATELLITE, not around Earth; the
// regular OrbitControls are disabled while this view is active.

const WORLD_UP = new THREE.Vector3(0, 1, 0)

// Camera distance from the spacecraft. Fixed: the scroll wheel resizes the
// model instead (see onSceneWheel), so Earth's apparent size stays put.
const VIEW_DIST = 2.1
// Start slightly above the local horizon so Earth fills the lower frame.
const INIT_ELEVATION = 0.32 // rad, about 18 degrees
const MIN_ELEVATION = -0.25
const MAX_ELEVATION = 1.25
const DRAG_RAD_PER_PX = 0.005
const INTRO_SECONDS = 1.4
// Hard floor so a drag can never push the camera into the atmosphere shell.
const MIN_CAM_RADIUS = EARTH_RADIUS_UNITS + 0.18
// How far ahead (sim seconds) to sample the orbit for the motion direction.
const LOOKAHEAD_S = 45

// Scratch objects reused every frame.
const _sat = new THREE.Vector3()
const _ahead = new THREE.Vector3()
const _up = new THREE.Vector3()
const _east = new THREE.Vector3()
const _north = new THREE.Vector3()
const _desired = new THREE.Vector3()
const _look = new THREE.Vector3()
const _upBlend = new THREE.Vector3()
const _h = new THREE.Vector3()

const smoothstep = (t) => t * t * (3 - 2 * t)

// Local east/north/up basis at a point above the globe. East degenerates when
// the point sits over a pole, so fall back to the X axis there.
function localBasis(satPos, up, east, north) {
  up.copy(satPos).normalize()
  east.crossVectors(WORLD_UP, up)
  if (east.lengthSq() < 1e-6) east.set(1, 0, 0)
  east.normalize()
  north.crossVectors(up, east)
}

export default function SatelliteViewControls({ item, clock, exaggeration, reducedMotion, active }) {
  const { camera, gl } = useThree()

  // az/el carry the user's viewpoint around the satellite; `cur` chases
  // `target` for damped, weighty drags.
  const view = useRef({
    az: { cur: 0, target: 0 },
    el: { cur: INIT_ELEVATION, target: INIT_ELEVATION },
    intro: 0, // 0..1 fly-in progress; 1 = fully in spacecraft view
    startPos: new THREE.Vector3(),
    startUp: new THREE.Vector3(0, 1, 0),
    startLook: new THREE.Vector3(),
  })

  // Leaving the spacecraft view: hand OrbitControls a level horizon again.
  useEffect(() => {
    if (!active) camera.up.set(0, 1, 0)
  }, [active, camera])

  // Entering the view (select / switch satellite): aim the camera behind the
  // craft's direction of motion, then fly in from wherever the camera was.
  useEffect(() => {
    if (!active || !item) return
    const v = view.current
    v.el.cur = INIT_ELEVATION
    v.el.target = INIT_ELEVATION
    v.intro = reducedMotion ? 1 : 0
    // Capture the camera as it stands so the fly-in continues the current view
    // seamlessly (also when hopping straight from one satellite to another).
    // Any point along the current gaze ray reproduces the orientation, so one
    // unit ahead serves as the look-from anchor.
    v.startPos.copy(camera.position)
    v.startUp.copy(camera.up)
    camera.getWorldDirection(v.startLook)
    v.startLook.add(camera.position)

    const date = clock.getDate()
    const s = propagateAt(item.satrec, date)
    if (s.ok) {
      _sat.set(...geodeticToVec3(s.latRad, s.lonRad, s.altKm, exaggeration))
      localBasis(_sat, _up, _east, _north)
      // Motion direction over the next few sim seconds, in the horizontal plane.
      const s2 = propagateAt(item.satrec, new Date(date.getTime() + LOOKAHEAD_S * 1000))
      let az = 0
      if (s2.ok) {
        _ahead.set(...geodeticToVec3(s2.latRad, s2.lonRad, s2.altKm, exaggeration)).sub(_sat)
        _h.copy(_ahead).addScaledVector(_up, -_ahead.dot(_up)) // strip radial part
        // Trail the craft: camera sits opposite the motion. Geostationary birds
        // barely move in this Earth-fixed frame; keep az 0 for them.
        if (_h.lengthSq() > 1e-8) az = Math.atan2(-_h.dot(_north), -_h.dot(_east))
      }
      v.az.cur = az
      v.az.target = az
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, item?.id])

  // Drag to orbit around the spacecraft.
  useEffect(() => {
    if (!active) return undefined
    const el = gl.domElement
    let dragging = false
    let lastX = 0
    let lastY = 0

    const down = (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      dragging = true
      lastX = e.clientX
      lastY = e.clientY
      el.setPointerCapture?.(e.pointerId)
    }
    const move = (e) => {
      if (!dragging) return
      const v = view.current
      v.az.target -= (e.clientX - lastX) * DRAG_RAD_PER_PX
      v.el.target = THREE.MathUtils.clamp(
        v.el.target + (e.clientY - lastY) * DRAG_RAD_PER_PX,
        MIN_ELEVATION,
        MAX_ELEVATION,
      )
      lastX = e.clientX
      lastY = e.clientY
    }
    const up = (e) => {
      dragging = false
      el.releasePointerCapture?.(e.pointerId)
    }

    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
    }
  }, [active, gl])

  useFrame((_, delta) => {
    if (!active || !item) return
    const s = propagateAt(item.satrec, clock.getDate())
    if (!s.ok) return // keep the last good framing rather than jump
    _sat.set(...geodeticToVec3(s.latRad, s.lonRad, s.altKm, exaggeration))
    localBasis(_sat, _up, _east, _north)

    const v = view.current
    const k = reducedMotion ? 1 : 1 - Math.exp(-10 * delta)
    v.az.cur += (v.az.target - v.az.cur) * k
    v.el.cur += (v.el.target - v.el.cur) * k

    // Viewpoint in the satellite's local frame: azimuth around local up,
    // elevation above the local horizontal plane.
    const horiz = Math.cos(v.el.cur) * VIEW_DIST
    _desired
      .copy(_sat)
      .addScaledVector(_east, Math.cos(v.az.cur) * horiz)
      .addScaledVector(_north, Math.sin(v.az.cur) * horiz)
      .addScaledVector(_up, Math.sin(v.el.cur) * VIEW_DIST)
    if (_desired.lengthSq() < MIN_CAM_RADIUS * MIN_CAM_RADIUS) _desired.setLength(MIN_CAM_RADIUS)

    if (v.intro < 1) {
      // Fly in: blend position, up vector and look target from the Earth view.
      v.intro = Math.min(1, v.intro + delta / INTRO_SECONDS)
      const e = smoothstep(v.intro)
      camera.position.lerpVectors(v.startPos, _desired, e)
      _upBlend.lerpVectors(v.startUp, _up, e).normalize()
      camera.up.copy(_upBlend)
      _look.lerpVectors(v.startLook, _sat, e)
      camera.lookAt(_look)
    } else {
      camera.position.copy(_desired)
      camera.up.copy(_up)
      camera.lookAt(_sat)
    }
  })

  return null
}
