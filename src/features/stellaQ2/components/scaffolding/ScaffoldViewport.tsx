import { Component, Suspense, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Canvas, useLoader, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import type {
  ScaffoldCameraPreset,
  ScaffoldTarget,
} from '../../types'
import type { ScaffoldingModel } from '../../data/scaffolding'

interface ScaffoldViewportProps {
  model: ScaffoldingModel
  targets: ScaffoldTarget[]
  removedScaffoldIds: string[]
  selectedScaffoldId: string | null
  cameraPreset: ScaffoldCameraPreset
  wireframe: boolean
  xray: boolean
  onSelectTarget: (targetId: string) => void
  onLoadError: (error: Error) => void
  onLoaded: () => void
}

interface LoadBoundaryProps {
  assetUrl: string
  onLoadError: (error: Error) => void
  children: ReactNode
}

interface LoadBoundaryState {
  failed: boolean
}

class StlLoadBoundary extends Component<LoadBoundaryProps, LoadBoundaryState> {
  state: LoadBoundaryState = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error) {
    this.props.onLoadError(error)
  }

  componentDidUpdate(previousProps: LoadBoundaryProps) {
    if (previousProps.assetUrl !== this.props.assetUrl && this.state.failed) {
      this.setState({ failed: false })
    }
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

function LoadingGeometry() {
  return (
    <mesh rotation={[0.4, 0.3, 0]}>
      <boxGeometry args={[0.9, 0.9, 0.9]} />
      <meshStandardMaterial color="#0e7490" wireframe />
    </mesh>
  )
}

function CameraDirector({ preset }: { preset: ScaffoldCameraPreset }) {
  const { camera } = useThree()

  useEffect(() => {
    const positions: Record<ScaffoldCameraPreset, [number, number, number]> = {
      fit: [2.5, 2.3, 3.1],
      front: [0, 0, 3.85],
      back: [0, 0, -3.85],
      top: [0, 3.85, 0.001],
      bottom: [0, -3.85, 0.001],
      left: [-3.85, 0, 0.001],
      right: [3.85, 0, 0.001],
    }
    const [x, y, z] = positions[preset]
    camera.position.set(x, y, z)
    camera.up.set(0, 1, 0)
    camera.lookAt(0, 0, 0)
  }, [camera, preset])

  return null
}

function SourceHousing({
  model,
  targets,
  removedScaffoldIds,
  selectedScaffoldId,
  wireframe,
  xray,
  onSelectTarget,
  onLoaded,
}: Omit<ScaffoldViewportProps, 'cameraPreset' | 'onLoadError'>) {
  const sourceGeometry = useLoader(STLLoader, model.stlUrl) as THREE.BufferGeometry
  const { geometry, center } = useMemo(() => {
    const copy = sourceGeometry.clone()
    copy.computeVertexNormals()
    copy.computeBoundingBox()
    const boxCenter = copy.boundingBox?.getCenter(new THREE.Vector3()) ?? new THREE.Vector3()
    copy.translate(-boxCenter.x, -boxCenter.y, -boxCenter.z)
    return { geometry: copy, center: boxCenter }
  }, [sourceGeometry])
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  useEffect(() => {
    onLoaded()
    return () => geometry.dispose()
  }, [geometry, onLoaded])

  return (
    <group scale={0.01}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          color={xray ? '#5fd4ef' : '#1d5f84'}
          roughness={0.58}
          metalness={0.12}
          wireframe={wireframe}
          transparent={xray}
          opacity={xray ? 0.28 : 1}
          depthWrite={!xray}
          side={THREE.DoubleSide}
        />
      </mesh>

      {targets
        .filter((target) => !removedScaffoldIds.includes(target.id))
        .map((target) => {
          const [targetWidth, targetHeight, targetDepth] = target.interactionSizeMm
          const selected = selectedScaffoldId === target.id
          const hovered = hoveredId === target.id
          const protectedTarget = target.kind === 'permanent'
          const color = protectedTarget ? '#fbbf24' : selected || hovered ? '#67e8f9' : '#38bdf8'
          return (
            <mesh
              key={target.id}
              position={[
                target.interactionAnchorMm[0] - center.x,
                target.interactionAnchorMm[1] - center.y,
                target.interactionAnchorMm[2] - center.z,
              ]}
              onClick={(event) => {
                event.stopPropagation()
                onSelectTarget(target.id)
              }}
              onPointerOver={(event) => {
                event.stopPropagation()
                setHoveredId(target.id)
              }}
              onPointerOut={() => setHoveredId(null)}
            >
              <boxGeometry args={[targetWidth, targetHeight, targetDepth]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={selected || hovered ? 0.44 : 0.18}
                depthWrite={false}
              />
              <lineSegments>
                <edgesGeometry args={[new THREE.BoxGeometry(targetWidth, targetHeight, targetDepth)]} />
                <lineBasicMaterial color={color} transparent opacity={0.92} />
              </lineSegments>
            </mesh>
          )
        })}
    </group>
  )
}

export default function ScaffoldViewport({
  model,
  targets,
  removedScaffoldIds,
  selectedScaffoldId,
  cameraPreset,
  wireframe,
  xray,
  onSelectTarget,
  onLoadError,
  onLoaded,
}: ScaffoldViewportProps) {
  return (
    <div
      role="img"
      aria-label={`${model.label} three-dimensional source-STL view. Use the view controls and scaffold list to inspect documented removal targets.`}
      className="relative h-[25rem] overflow-hidden rounded-sm border border-cyan-300/15 bg-[#020713] sm:h-[34rem]"
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [2.5, 2.3, 3.1], fov: 42, near: 0.01, far: 100 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#020713']} />
        <ambientLight intensity={0.75} />
        <directionalLight castShadow intensity={2.3} position={[4, 5, 4]} color="#dff8ff" />
        <directionalLight intensity={0.65} position={[-3, -1, -4]} color="#6aa9dd" />
        <gridHelper args={[5, 16, '#1a5570', '#0c273b']} position={[0, -1.08, 0]} />
        <CameraDirector preset={cameraPreset} />
        <StlLoadBoundary assetUrl={model.stlUrl} onLoadError={onLoadError}>
          <Suspense fallback={<LoadingGeometry />}>
            <SourceHousing
              model={model}
              targets={targets}
              removedScaffoldIds={removedScaffoldIds}
              selectedScaffoldId={selectedScaffoldId}
              wireframe={wireframe}
              xray={xray}
              onSelectTarget={onSelectTarget}
              onLoaded={onLoaded}
            />
          </Suspense>
        </StlLoadBoundary>
        <OrbitControls
          makeDefault
          enablePan
          enableRotate
          enableZoom
          minDistance={0.65}
          maxDistance={8}
          dampingFactor={0.08}
          enableDamping
        />
      </Canvas>
      <div className="pointer-events-none absolute bottom-3 left-3 rounded-sm border border-white/10 bg-[#030916]/85 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-slate-300">
        Source STL · {model.connectedComponentCount} connected mesh component
      </div>
    </div>
  )
}
