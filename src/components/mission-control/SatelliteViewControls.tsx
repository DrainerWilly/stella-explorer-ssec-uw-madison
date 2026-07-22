// @ts-nocheck
import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { EARTH_RADIUS_UNITS, propagateAt, geodeticToVec3 } from '../../utils/orbitMath'

// NASA Eyes keeps two independent parts of the selected-spacecraft composition
// stable: the Earth limb and the model's screen-space bounds. The old camera
// derived one distance from orbital altitude, which made different GLTF shapes
// (and even different orbit heights) frame very differently. This controller
// measures the loaded model and solves both constraints together.

const DEFAULT_FOV = 42
const SPACECRAFT_FOV = 24
const TARGET_HORIZON_Y = 0.445
const TARGET_MODEL_WIDTH = 0.22
const TARGET_MODEL_HEIGHT = 0.18
const FIT_MARGIN = 1.015
const MIN_VIEW_DIST = 0.18
const MAX_VIEW_DIST = 1.15
const MIN_CAM_RADIUS = EARTH_RADIUS_UNITS + 0.035
const BASE_THREE_QUARTER_YAW = THREE.MathUtils.degToRad(9)
const INIT_ELEVATION = 0
const MIN_ELEVATION = -0.34
const MAX_ELEVATION = 0.56
const DRAG_RAD_PER_PX = 0.0045
const INTRO_SECONDS = 1.35
const LOOKAHEAD_S = 45

const _sat = new THREE.Vector3()
const _ahead = new THREE.Vector3()
const _radialUp = new THREE.Vector3()
const _tangentForward = new THREE.Vector3()
const _tangentRight = new THREE.Vector3()
const _tangentBack = new THREE.Vector3()
const _offsetUnit = new THREE.Vector3()
const _desired = new THREE.Vector3()
const _target = new THREE.Vector3()
const _viewForward = new THREE.Vector3()
const _screenUp = new THREE.Vector3()
const _screenRight = new THREE.Vector3()
const _cornerWorld = new THREE.Vector3()
const _upBlend = new THREE.Vector3()
const _lookBlend = new THREE.Vector3()

const smoothstep = (t) => t * t * (3 - 2 * t)

function clampUnit(value) {
  return THREE.MathUtils.clamp(value, -1, 1)
}

// Keep the along-track frame continuous at the poles. Projecting the prior
// forward vector into the new tangent plane is a stable fallback; the sign
// check prevents an equivalent-but-reversed basis from producing a 180° roll.
function updateOrbitalFrame(current, next, previousForward, hasPrevious) {
  _radialUp.copy(current).normalize()
  _tangentForward.subVectors(next, current)
  _tangentForward.addScaledVector(
    _radialUp,
    -_tangentForward.dot(_radialUp),
  )

  if (_tangentForward.lengthSq() < 1e-10 && hasPrevious) {
    _tangentForward.copy(previousForward)
    _tangentForward.addScaledVector(
      _radialUp,
      -_tangentForward.dot(_radialUp),
    )
  }
  if (_tangentForward.lengthSq() < 1e-10) {
    const fallback = Math.abs(_radialUp.y) < 0.9
      ? new THREE.Vector3(0, 1, 0)
      : new THREE.Vector3(1, 0, 0)
    _tangentForward.crossVectors(fallback, _radialUp)
  }
  _tangentForward.normalize()

  if (hasPrevious && _tangentForward.dot(previousForward) < 0) {
    _tangentForward.negate()
  }
  _tangentRight.crossVectors(_tangentForward, _radialUp).normalize()
  _tangentForward.crossVectors(_radialUp, _tangentRight).normalize()
  previousForward.copy(_tangentForward)
}

// For a camera C looking at spacecraft S, alpha is Earth's apparent angular
// radius and gamma is the angle between the camera's nadir and the S ray. Their
// difference is exactly the vertical angular overlap between S and the upper
// limb. Solving it puts the horizon at a stable screen-space y independent of
// the model-fit distance.
function horizonGapAtElevation(shellRadius, distance, elevation) {
  const radialOffset = Math.sin(elevation) * distance
  const cameraRadiusSq =
    shellRadius * shellRadius +
    distance * distance +
    2 * shellRadius * radialOffset
  const cameraRadius = Math.sqrt(Math.max(0, cameraRadiusSq))
  if (cameraRadius <= MIN_CAM_RADIUS) return null

  const alpha = Math.asin(clampUnit(EARTH_RADIUS_UNITS / cameraRadius))
  const cosGamma =
    (cameraRadiusSq - shellRadius * shellRadius + distance * distance) /
    (2 * cameraRadius * distance)
  const gamma = Math.acos(clampUnit(cosGamma))
  return alpha - gamma
}

function solveHorizonElevation(shellRadius, distance, verticalFov) {
  const halfFov = verticalFov / 2
  const desiredGap = Math.atan(
    2 * (0.5 - TARGET_HORIZON_Y) * Math.tan(halfFov),
  )
  const low = -0.45
  const high = 1.15
  const samples = 64
  let bestElevation = 0.46
  let bestError = Infinity
  let previousElevation = low
  let previousValue = horizonGapAtElevation(shellRadius, distance, low)
  const roots = []

  for (let i = 0; i <= samples; i += 1) {
    const elevation = THREE.MathUtils.lerp(low, high, i / samples)
    const value = horizonGapAtElevation(shellRadius, distance, elevation)
    if (value != null) {
      const error = Math.abs(value - desiredGap)
      if (error < bestError) {
        bestError = error
        bestElevation = elevation
      }
    }

    if (
      i > 0 &&
      previousValue != null &&
      value != null &&
      (previousValue - desiredGap) * (value - desiredGap) <= 0
    ) {
      let a = previousElevation
      let b = elevation
      for (let step = 0; step < 32; step += 1) {
        const mid = (a + b) / 2
        const aValue = horizonGapAtElevation(shellRadius, distance, a)
        const midValue = horizonGapAtElevation(shellRadius, distance, mid)
        if (aValue == null || midValue == null) break
        if ((aValue - desiredGap) * (midValue - desiredGap) <= 0) b = mid
        else a = mid
      }
      roots.push((a + b) / 2)
    }
    previousElevation = elevation
    previousValue = value
  }

  // The outer/high-camera solution keeps Earth behind the spacecraft. An inner
  // solution can put the camera almost on the surface and occlude the model.
  return roots.length ? Math.max(...roots) : bestElevation
}

function buildCameraBasis(distance, elevation, azimuth) {
  const yaw = BASE_THREE_QUARTER_YAW + azimuth
  _tangentBack
    .copy(_tangentForward)
    .multiplyScalar(-Math.cos(yaw))
    .addScaledVector(_tangentRight, Math.sin(yaw))
    .normalize()
  _offsetUnit
    .copy(_tangentBack)
    .multiplyScalar(Math.cos(elevation))
    .addScaledVector(_radialUp, Math.sin(elevation))
    .normalize()
  _viewForward.copy(_offsetUnit).negate()
  _screenUp
    .copy(_radialUp)
    .addScaledVector(_viewForward, -_radialUp.dot(_viewForward))
    .normalize()
  _screenRight.crossVectors(_viewForward, _screenUp).normalize()
}

function cleanCorners(frame) {
  return frame?.corners?.length === 8 ? frame.corners : null
}

// Exact perspective fit for the eight measured model corners. Depth is part of
// each constraint, so long antennas and a three-quarter view cannot slip past a
// simple orthographic width/height approximation.
function fitDistanceForCorners(corners, verticalFov, aspect) {
  const tanVertical = Math.tan(verticalFov / 2)
  const tanHorizontal = tanVertical * aspect
  let required = MIN_VIEW_DIST

  for (const corner of corners) {
    _cornerWorld
      .set(0, 0, 0)
      .addScaledVector(_tangentForward, corner.x)
      .addScaledVector(_radialUp, corner.y)
      .addScaledVector(_tangentRight, corner.z)
    const forwardOffset = _cornerWorld.dot(_viewForward)
    const horizontal = Math.abs(_cornerWorld.dot(_screenRight))
    const vertical = Math.abs(_cornerWorld.dot(_screenUp))
    required = Math.max(
      required,
      horizontal / (TARGET_MODEL_WIDTH * tanHorizontal) - forwardOffset,
      vertical / (TARGET_MODEL_HEIGHT * tanVertical) - forwardOffset,
    )
  }
  return THREE.MathUtils.clamp(required * FIT_MARGIN, MIN_VIEW_DIST, MAX_VIEW_DIST)
}

function solveFramingDistance(frame, shellRadius, verticalFov, aspect, azimuth, seed) {
  const corners = cleanCorners(frame)
  if (!corners) return null
  let distance = THREE.MathUtils.clamp(seed || 0.32, MIN_VIEW_DIST, MAX_VIEW_DIST)
  let elevation = 0.46

  // Elevation changes the projected model height, while model-fit distance
  // changes the horizon solution. A handful of inexpensive iterations over
  // eight corners converges tightly and runs only simple vector arithmetic.
  for (let i = 0; i < 5; i += 1) {
    elevation = solveHorizonElevation(shellRadius, distance, verticalFov)
    buildCameraBasis(distance, elevation, azimuth)
    const next = fitDistanceForCorners(corners, verticalFov, aspect)
    if (Math.abs(next - distance) < 1e-4) {
      distance = next
      break
    }
    distance = THREE.MathUtils.lerp(distance, next, 0.72)
  }
  elevation = solveHorizonElevation(shellRadius, distance, verticalFov)
  return { distance, elevation }
}

export default function SatelliteViewControls({
  item,
  clock,
  exaggeration,
  reducedMotion,
  active,
  framingRef,
}) {
  const { camera, gl, size } = useThree()
  const view = useRef({
    az: { cur: 0, target: 0 },
    el: { cur: INIT_ELEVATION, target: INIT_ELEVATION },
    intro: 0,
    startPos: new THREE.Vector3(),
    startUp: new THREE.Vector3(0, 1, 0),
    startLook: new THREE.Vector3(),
    startFov: DEFAULT_FOV,
    priorForward: new THREE.Vector3(),
    hasPriorForward: false,
    fitDistance: 0.32,
    fitRevision: -1,
    fitAspect: 0,
  })

  useEffect(() => {
    if (!active) {
      camera.up.set(0, 1, 0)
      if (camera.fov !== DEFAULT_FOV) {
        camera.fov = DEFAULT_FOV
        camera.updateProjectionMatrix()
      }
    }
  }, [active, camera])

  useEffect(() => {
    if (!active || !item) return
    const state = view.current
    state.az.cur = 0
    state.az.target = 0
    state.el.cur = INIT_ELEVATION
    state.el.target = INIT_ELEVATION
    state.intro = reducedMotion ? 1 : 0
    state.fitRevision = -1
    state.fitAspect = 0
    state.hasPriorForward = false
    state.startPos.copy(camera.position)
    state.startUp.copy(camera.up)
    state.startFov = camera.fov
    camera.getWorldDirection(state.startLook)
    state.startLook.add(camera.position)
  }, [active, item?.id, camera, reducedMotion])

  useEffect(() => {
    if (!active) return undefined
    const element = gl.domElement
    let dragging = false
    let lastX = 0
    let lastY = 0

    const onPointerDown = (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return
      dragging = true
      lastX = event.clientX
      lastY = event.clientY
      element.setPointerCapture?.(event.pointerId)
    }
    const onPointerMove = (event) => {
      if (!dragging) return
      const state = view.current
      state.az.target -= (event.clientX - lastX) * DRAG_RAD_PER_PX
      state.el.target = THREE.MathUtils.clamp(
        state.el.target + (event.clientY - lastY) * DRAG_RAD_PER_PX,
        MIN_ELEVATION,
        MAX_ELEVATION,
      )
      lastX = event.clientX
      lastY = event.clientY
    }
    const onPointerUp = (event) => {
      dragging = false
      element.releasePointerCapture?.(event.pointerId)
    }

    element.addEventListener('pointerdown', onPointerDown)
    element.addEventListener('pointermove', onPointerMove)
    element.addEventListener('pointerup', onPointerUp)
    element.addEventListener('pointercancel', onPointerUp)
    return () => {
      element.removeEventListener('pointerdown', onPointerDown)
      element.removeEventListener('pointermove', onPointerMove)
      element.removeEventListener('pointerup', onPointerUp)
      element.removeEventListener('pointercancel', onPointerUp)
    }
  }, [active, gl])

  useFrame((_, delta) => {
    if (!active || !item) return
    const frame = framingRef?.current
    if (!frame || frame.id !== item.id || !cleanCorners(frame)) return

    const date = clock.getDate()
    const position = propagateAt(item.satrec, date)
    const next = propagateAt(item.satrec, new Date(date.getTime() + LOOKAHEAD_S * 1000))
    if (!position.ok || !next.ok) return

    _sat.set(...geodeticToVec3(position.latRad, position.lonRad, position.altKm, exaggeration))
    _ahead.set(...geodeticToVec3(next.latRad, next.lonRad, next.altKm, exaggeration))

    const state = view.current
    updateOrbitalFrame(
      _sat,
      _ahead,
      state.priorForward,
      state.hasPriorForward,
    )
    state.hasPriorForward = true

    const damping = reducedMotion ? 1 : 1 - Math.exp(-10 * delta)
    state.az.cur += (state.az.target - state.az.cur) * damping
    state.el.cur += (state.el.target - state.el.cur) * damping

    const aspect = size.width / Math.max(1, size.height)
    const verticalFov = THREE.MathUtils.degToRad(SPACECRAFT_FOV)
    const solved = solveFramingDistance(
      frame,
      _sat.length(),
      verticalFov,
      aspect,
      state.az.cur,
      state.fitDistance,
    )
    if (!solved) return

    const framingChanged =
      state.fitRevision !== frame.revision ||
      Math.abs(state.fitAspect - aspect) > 1e-4
    if (framingChanged || reducedMotion) state.fitDistance = solved.distance
    else state.fitDistance += (solved.distance - state.fitDistance) * damping
    state.fitRevision = frame.revision
    state.fitAspect = aspect

    const baseElevation = solveHorizonElevation(
      _sat.length(),
      state.fitDistance,
      verticalFov,
    )
    const safeSine =
      (MIN_CAM_RADIUS * MIN_CAM_RADIUS -
        _sat.lengthSq() -
        state.fitDistance * state.fitDistance) /
      (2 * _sat.length() * state.fitDistance)
    const safeElevation = Math.asin(clampUnit(safeSine)) + 0.005
    const elevation = THREE.MathUtils.clamp(
      baseElevation + state.el.cur,
      Math.max(-1.2, safeElevation),
      1.3,
    )
    buildCameraBasis(state.fitDistance, elevation, state.az.cur)

    _desired
      .copy(_sat)
      .addScaledVector(_offsetUnit, state.fitDistance)
    _target.copy(_sat)

    if (state.intro < 1) {
      state.intro = Math.min(1, state.intro + delta / INTRO_SECONDS)
      const eased = smoothstep(state.intro)
      camera.position.lerpVectors(state.startPos, _desired, eased)
      _upBlend.lerpVectors(state.startUp, _screenUp, eased).normalize()
      camera.up.copy(_upBlend)
      _lookBlend.lerpVectors(state.startLook, _target, eased)
      camera.lookAt(_lookBlend)
      camera.fov = THREE.MathUtils.lerp(state.startFov, SPACECRAFT_FOV, eased)
      camera.updateProjectionMatrix()
    } else {
      camera.position.copy(_desired)
      camera.up.copy(_screenUp)
      camera.lookAt(_target)
      if (Math.abs(camera.fov - SPACECRAFT_FOV) > 0.01) {
        camera.fov = SPACECRAFT_FOV
        camera.updateProjectionMatrix()
      }
    }
  })

  return null
}
