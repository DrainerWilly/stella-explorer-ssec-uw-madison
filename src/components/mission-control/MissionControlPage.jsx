import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import Icon from '../Icon.jsx'
import useOrbitData from '../../hooks/useOrbitData.js'
import useOrbitPropagation from '../../hooks/useOrbitPropagation.js'
import useReducedMotion from '../../hooks/useReducedMotion.js'
import { MISSIONS } from '../../data/missionCatalog.js'
import { RAD2DEG, propagateAt, normalizeLonRad } from '../../utils/orbitMath.js'
import { createSimClock } from './simClock'
import {
  cacheStatusInfo,
  isStale,
  formatUtc,
  MODELED_POSITION_DISCLAIMER,
} from './orbitStatus'
import { PANEL, LABEL, GHOST_BTN, CHIP } from './mcStyles.js'

import MissionCatalog from './MissionCatalog.jsx'
import MissionPanel from './MissionPanel.jsx'
import TimeControlBar from './TimeControlBar.jsx'
import SceneControls from './SceneControls.jsx'
import MethodologyPanel from './MethodologyPanel.jsx'
import EducationalOverlays from './EducationalOverlays.jsx'
import AccessibleMissionList from './AccessibleMissionList.jsx'
import OrbitLoadingState from './OrbitLoadingState.jsx'
import OrbitErrorState from './OrbitErrorState.jsx'
import useAutoHide from './useAutoHide.js'

// Lazy-load the heavy Three.js scene so it downloads only when the 3D view is
// actually shown (skipped entirely in the WebGL fallback).
const OrbitScene = lazy(() => import('./OrbitScene.jsx'))

const DEFAULT_SETTINGS = {
  quality: 'balanced',
  stars: true,
  trails: true,
  groundTrack: true,
  grid: false,
  earthRotation: false,
  exaggeration: 2,
  showAllLabels: false,
  cities: false,
}

function detectWebGL() {
  if (typeof window === 'undefined') return true
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl2') || canvas.getContext('webgl')),
    )
  } catch {
    return false
  }
}

function isDesktopWidth() {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(min-width: 1024px)').matches
}

// Lower-powered devices (narrow screens or few CPU cores) start at low quality.
function lowPowerDevice() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(max-width: 1023px)').matches ||
    (navigator.hardwareConcurrency || 8) <= 4
  )
}

function toDegPosition(satrec, date) {
  const s = propagateAt(satrec, date)
  if (!s.ok) return null
  return {
    latDeg: s.latRad * RAD2DEG,
    lonDeg: normalizeLonRad(s.lonRad) * RAD2DEG,
    altKm: s.altKm,
    speedKmS: s.speedKmS,
  }
}

export default function MissionControlPage({ onNavigate }) {
  const { status, data, error, refetch } = useOrbitData()
  const prop = useOrbitPropagation(data)
  const reducedMotion = useReducedMotion()
  // Auto-hides the floating time bar after mouse/keyboard inactivity, and
  // brings it back on the next pointer/key event — like a video player's
  // control bar. Only used on the desktop floating overlay layout.
  const controlsActive = useAutoHide(5000)

  const [webglOk] = useState(detectWebGL)
  const [isDesktop, setIsDesktop] = useState(isDesktopWidth)

  const clockRef = useRef(createSimClock())
  const clock = clockRef.current

  // --- UI state ---
  const [selectedId, setSelectedId] = useState(null)
  const [hoveredId, setHoveredId] = useState(null)
  const [settings, setSettings] = useState(() => ({
    ...DEFAULT_SETTINGS,
    quality: lowPowerDevice() ? 'low' : 'balanced',
  }))
  const [follow, setFollow] = useState(false)
  const [focusSignal, setFocusSignal] = useState(null)
  const [resetSignal, setResetSignal] = useState(0)
  // While a satellite is selected, the scroll wheel resizes ITS model instead of
  // dollying the camera, so the Earth's apparent size never changes.
  const [modelScale, setModelScale] = useState(1)
  const [showMethodology, setShowMethodology] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)
  const [railOpen, setRailOpen] = useState(true)
  const [mobilePanel, setMobilePanel] = useState('catalog') // catalog | mission

  // simulation transport (mirrored into the clock object) — defaults to Live
  const [playing, setPlaying] = useState(true)
  const [speed, setSpeed] = useState(1)
  const [following, setFollowing] = useState(true)

  const [positions, setPositions] = useState({})
  const [simTimeMs, setSimTimeMs] = useState(clock.time)
  const livePosition = selectedId ? positions[selectedId] : null

  const cacheStatus = data?.cacheStatus
  const statusInfo = cacheStatusInfo(cacheStatus)

  // Keep the clock in sync with transport state.
  useEffect(() => {
    clock.playing = playing
    clock.speed = speed
    clock.following = following
  }, [clock, playing, speed, following])

  // Responsive breakpoint.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const on = () => setIsDesktop(mq.matches)
    on()
    mq.addEventListener?.('change', on)
    return () => mq.removeEventListener?.('change', on)
  }, [])

  // First-visit educational overlay.
  useEffect(() => {
    try {
      if (!localStorage.getItem('mc-overlay-seen')) setShowOverlay(true)
    } catch {
      /* ignore */
    }
  }, [])
  const closeOverlay = () => {
    setShowOverlay(false)
    try {
      localStorage.setItem('mc-overlay-seen', '1')
    } catch {
      /* ignore */
    }
  }

  // Clock driver for the WebGL fallback (the 3D scene advances it otherwise).
  useEffect(() => {
    if (webglOk) return
    let raf
    let last = performance.now()
    const tick = (t) => {
      const dt = (t - last) / 1000
      last = t
      clock.advance(dt)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [webglOk, clock])

  // Update modeled positions a few times per second (not every frame).
  useEffect(() => {
    const compute = () => {
      const date = clock.getDate()
      const next = {}
      for (const item of prop.valid) {
        const p = toDegPosition(item.satrec, date)
        if (p) next[item.id] = p
      }
      setPositions(next)
      setSimTimeMs(date.getTime())
    }
    compute()
    const id = setInterval(compute, 400)
    return () => clearInterval(id)
  }, [prop.valid, clock])

  // Follow mode: gently re-frame the selected mission as it moves.
  useEffect(() => {
    if (!follow || !selectedId || reducedMotion) return
    const id = setInterval(() => setFocusSignal({ id: selectedId, ts: Date.now() }), 2600)
    return () => clearInterval(id)
  }, [follow, selectedId, reducedMotion])

  // --- handlers ---
  function selectMission(id) {
    setSelectedId(id)
    setModelScale(1) // start each mission at its default model size
    setFocusSignal({ id, ts: Date.now() })
    if (!isDesktop) setMobilePanel('mission')
  }
  const changeSetting = (key, value) => setSettings((s) => ({ ...s, [key]: value }))

  // Scroll wheel over the globe: when a satellite is selected, grow/shrink its
  // model rather than zooming the camera (keeps the Earth the same size).
  const onSceneWheel = (e) => {
    if (!selectedId) return // no selection → let the camera zoom normally
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12
    setModelScale((s) => Math.min(8, Math.max(0.25, s * factor)))
  }

  const cycle = (dir) => {
    const ids = MISSIONS.map((m) => m.id)
    const idx = ids.indexOf(selectedId)
    const nextIdx = (idx + dir + ids.length) % ids.length
    selectMission(ids[nextIdx])
  }

  const onPlayPause = () => setPlaying((p) => !p)
  const onSpeed = (s) => {
    setSpeed(s)
    setFollowing(false)
    setPlaying(true)
  }
  const onLive = () => {
    clock.time = Date.now()
    setFollowing(true)
    setSpeed(1)
    setPlaying(true)
  }
  const onReset = () => {
    clock.time = Date.now()
    setFollowing(false)
  }
  const onScrub = (t) => {
    clock.time = t
    setPlaying(false)
    setFollowing(false)
  }

  const missionToggles = {
    follow,
    trail: settings.trails,
    groundTrack: settings.groundTrack,
  }
  const onMissionToggle = (key, value) => {
    if (key === 'follow') setFollow(value)
    else if (key === 'trail') changeSetting('trails', value)
    else if (key === 'groundTrack') changeSetting('groundTrack', value)
  }

  const selectedItem = selectedId ? prop.byId[selectedId] : null

  // --- reusable pieces ---
  const sceneEl = webglOk ? (
    <Suspense fallback={<OrbitLoadingState label="Preparing the globe…" />}>
      <OrbitScene
        key={settings.quality}
        items={prop.items}
        clock={clock}
        settings={settings}
        selectedId={selectedId}
        onSelect={selectMission}
        hoveredId={hoveredId}
        onHover={setHoveredId}
        theme="dark"
        reducedMotion={reducedMotion}
        focusSignal={focusSignal}
        resetSignal={resetSignal}
        modelScale={modelScale}
        maxDpr={isDesktop ? 2 : 1.5}
      />
    </Suspense>
  ) : null

  const catalogEl = (
    <MissionCatalog
      missions={MISSIONS}
      byId={prop.byId}
      cacheStatus={cacheStatus}
      selectedId={selectedId}
      onSelect={selectMission}
    />
  )

  const panelEl = selectedItem ? (
    <MissionPanel
      item={selectedItem}
      livePosition={livePosition}
      orbit={data}
      simTimeMs={simTimeMs}
      toggles={missionToggles}
      onToggle={onMissionToggle}
      onOpenLesson={(page) => onNavigate?.(page)}
      onOpenSource={() => setShowMethodology(true)}
      onClose={() => (isDesktop ? setSelectedId(null) : setMobilePanel('catalog'))}
    />
  ) : (
    <div className="grid h-full place-items-center p-6 text-center">
      <p className="text-[13px] text-white/45">
        Select a mission to see its modeled position, instruments, and orbit.
      </p>
    </div>
  )

  const timeBarEl = (
    <TimeControlBar
      clock={clock}
      playing={playing}
      speed={speed}
      following={following}
      onPlayPause={onPlayPause}
      onSpeed={onSpeed}
      onLive={onLive}
      onReset={onReset}
      onScrub={onScrub}
    />
  )

  // --- full-screen loading / error (no usable data) ---
  if (status === 'loading' && !data) {
    return (
      <div className="order-1 flex-1">
        <OrbitLoadingState />
      </div>
    )
  }
  if (status === 'error' && !data) {
    return (
      <div className="order-1 flex-1">
        <OrbitErrorState error={error} onRetry={refetch} />
      </div>
    )
  }

  // --- title block + top-right cluster (shared) ---
  const titleBlock = (
    <div className="pointer-events-none">
      <div className={LABEL}>SSEC · Earth Science</div>
      <h1 className="mt-0.5 text-xl font-light uppercase tracking-[0.18em] text-white sm:text-2xl">
        Satellite Tracker
      </h1>
      <p className="mt-1 hidden max-w-sm text-[11px] leading-snug text-white/45 sm:block">
        Explore modeled satellite orbits and discover how Earth-observing missions study our
        changing planet.
      </p>
    </div>
  )

  const topRightCluster = (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <span className={CHIP}>
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            statusInfo.tone === 'ok' ? 'bg-emerald-400' : 'bg-amber-400'
          }`}
        />
        <span className="hidden sm:inline">Orbit data updated:&nbsp;</span>
        {formatUtc(data?.generatedAt)}
      </span>
      <button
        onClick={refetch}
        title="Refresh orbital data"
        aria-label="Refresh orbital data"
        className={GHOST_BTN}
      >
        <Icon name="reset" className="h-4 w-4" />
      </button>
      <button
        onClick={() => setShowOverlay(true)}
        title="How to use"
        aria-label="How to use Satellite Tracker"
        className={GHOST_BTN}
      >
        <Icon name="book" className="h-4 w-4" />
      </button>
      <SceneControls
        settings={settings}
        onChange={changeSetting}
        reducedMotion={reducedMotion}
        onResetCamera={() => setResetSignal((n) => n + 1)}
      />
    </div>
  )

  const staleBanner = isStale(cacheStatus) && (
    <div className="pointer-events-auto flex items-center gap-3 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-[11px] text-amber-100 backdrop-blur-md">
      <span>
        <strong className="font-bold uppercase tracking-wider">{statusInfo.label}</strong> —{' '}
        {statusInfo.note}
      </span>
      <button
        onClick={refetch}
        className="rounded-md bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider hover:bg-amber-400/30"
      >
        Retry
      </button>
    </div>
  )

  const modals = (
    <>
      <MethodologyPanel open={showMethodology} onClose={() => setShowMethodology(false)} orbit={data} />
      <EducationalOverlays open={showOverlay} onClose={closeOverlay} onOpenLesson={(p) => onNavigate?.(p)} />
    </>
  )

  // --- WebGL fallback (no canvas) ---
  if (!webglOk) {
    return (
      <div className="scroll-soft order-1 min-h-0 flex-1 overflow-y-auto bg-[#050b1f] text-white">
        <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
          {titleBlock}
          {topRightCluster}
        </div>
        {staleBanner && <div className="px-5 pb-2">{staleBanner}</div>}
        <div className="mx-5 mb-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-[13px] text-white/60">
          The 3D Earth requires WebGL, which isn’t available in this browser. You can still explore
          every mission and its modeled position below.
        </div>
        <p className="mx-5 mb-3 text-[11px] text-white/35">{MODELED_POSITION_DISCLAIMER}</p>
        <div className="mx-5 mb-6 grid gap-4 lg:grid-cols-2">
          <div className={`${PANEL} p-4`}>
            <AccessibleMissionList
              missions={MISSIONS}
              byId={prop.byId}
              selectedId={selectedId}
              onSelect={selectMission}
              onPrev={() => cycle(-1)}
              onNext={() => cycle(1)}
              livePosition={livePosition}
              simTimeMs={simTimeMs}
              positions={positions}
              showTable
              heading="Missions & modeled positions"
            />
          </div>
          <div className={`${PANEL} p-4`}>{panelEl}</div>
        </div>
        <div className="mx-5 mb-6">{timeBarEl}</div>
        {modals}
      </div>
    )
  }

  // --- Desktop: full-bleed immersive stage with floating panels ---
  if (isDesktop) {
    return (
      <div className="order-1 relative h-screen min-w-0 flex-1 overflow-hidden bg-[#050b1f] text-white">
        {/* the globe IS the page */}
        <div className="absolute inset-0" onWheel={onSceneWheel}>
          {sceneEl}
        </div>

        {/* cinematic vignette + top legibility gradient (never intercept input) */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_58%,rgba(0,0,0,0.55)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/70 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/70 to-transparent" />

        {/* title */}
        <div className="absolute left-5 top-4 z-10">{titleBlock}</div>

        {/* top-right cluster */}
        <div className="absolute right-4 top-4 z-20">{topRightCluster}</div>

        {/* stale banner */}
        {staleBanner && (
          <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2">{staleBanner}</div>
        )}

        {/* left mission rail */}
        {railOpen ? (
          <div className={`absolute bottom-32 left-4 top-28 z-10 flex w-[280px] flex-col ${PANEL} p-3`}>
            <div className="mb-2 flex items-center justify-between">
              <span className={LABEL}>Missions</span>
              <button
                onClick={() => setRailOpen(false)}
                aria-label="Collapse mission list"
                className="grid h-7 w-7 place-items-center rounded-md bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              >
                <Icon name="back" className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1">{catalogEl}</div>
          </div>
        ) : (
          <button
            onClick={() => setRailOpen(true)}
            className={`absolute left-4 top-28 z-10 ${PANEL} flex items-center gap-2 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.15em] text-white/70 hover:text-white`}
          >
            <Icon name="orbit" className="h-4 w-4" />
            Missions
            <Icon name="chevron" className="h-3.5 w-3.5" />
          </button>
        )}

        {/* mission info card */}
        {selectedItem && (
          <div className={`absolute bottom-32 right-4 top-28 z-10 flex w-[340px] flex-col ${PANEL} p-4`}>
            {panelEl}
          </div>
        )}

        {/* sources & methodology */}
        <button
          onClick={() => setShowMethodology(true)}
          className={`absolute bottom-4 left-4 z-10 ${PANEL} flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-white/60 hover:text-white`}
        >
          <Icon name="book" className="h-3.5 w-3.5" />
          Sources & methodology
        </button>

        {/* time bar — auto-hides after inactivity, returns on mouse/key activity */}
        <div
          className={`absolute bottom-4 left-1/2 z-10 w-[min(680px,calc(100%-380px))] -translate-x-1/2 ${
            reducedMotion ? '' : 'transition-all duration-500 ease-out'
          } ${
            controlsActive
              ? 'pointer-events-auto opacity-100 translate-y-0'
              : 'pointer-events-none opacity-0 translate-y-3'
          }`}
        >
          {timeBarEl}
        </div>

        {modals}
      </div>
    )
  }

  // --- Mobile / tablet: dark stacked layout, no horizontal scroll ---
  return (
    <div className="scroll-soft order-1 min-h-0 flex-1 overflow-y-auto bg-[#050b1f] text-white">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
        {titleBlock}
        {topRightCluster}
      </div>
      {staleBanner && <div className="px-4 pb-2">{staleBanner}</div>}

      {/* globe */}
      <div
        className="relative mx-3 h-[52vh] overflow-hidden rounded-2xl border border-white/10"
        onWheel={onSceneWheel}
      >
        {sceneEl}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(0,0,0,0.5)_100%)]" />
      </div>

      {/* time bar */}
      <div className="mx-3 mt-3">{timeBarEl}</div>

      {/* catalog / mission tabs */}
      <div className="mx-3 mt-3 flex gap-1">
        {[
          { id: 'catalog', label: 'Missions' },
          { id: 'mission', label: 'Details' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setMobilePanel(t.id)}
            aria-pressed={mobilePanel === t.id}
            className={`flex-1 rounded-lg px-3 py-2 text-[11px] font-bold uppercase tracking-[0.15em] transition-colors ${
              mobilePanel === t.id
                ? 'bg-white text-[#0b1a3d]'
                : 'border border-white/10 bg-white/5 text-white/50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={`mx-3 mt-3 ${PANEL} p-3`}>
        {mobilePanel === 'mission' ? (
          <div className="min-h-[40vh]">{panelEl}</div>
        ) : (
          <div className="h-[52vh]">{catalogEl}</div>
        )}
      </div>

      {/* accessible companion always available */}
      <div className={`mx-3 mb-4 mt-3 ${PANEL} p-3`}>
        <AccessibleMissionList
          missions={MISSIONS}
          byId={prop.byId}
          selectedId={selectedId}
          onSelect={selectMission}
          onPrev={() => cycle(-1)}
          onNext={() => cycle(1)}
          livePosition={livePosition}
          simTimeMs={simTimeMs}
          positions={positions}
        />
      </div>

      {/* sources */}
      <div className="mx-3 mb-6">
        <button
          onClick={() => setShowMethodology(true)}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white/60"
        >
          <Icon name="book" className="h-3.5 w-3.5" />
          Sources & methodology
        </button>
      </div>

      {modals}
    </div>
  )
}
