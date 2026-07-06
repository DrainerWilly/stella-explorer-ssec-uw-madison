import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { EARTH_RADIUS_UNITS, surfaceVec3, DEG2RAD, sunDirectionUnitVec } from '../../utils/orbitMath.js'
import { BASE_EARTH_LAYER } from '../../data/earthLayers.js'

// Greenwich meridian is placed at +Z so the texture aligns with the same
// lon→+Z convention used for satellites and ground tracks.
const TEXTURE_ROTATION_Y = -Math.PI / 2

// Top of the scattering atmosphere relative to the surface (visually exaggerated
// ~2× so the blue shell reads clearly at globe scale, like NASA's Earth views).
const ATMO_FACTOR = 1.035

const BASE = import.meta.env.BASE_URL
const DAY_MAP = `${BASE}${BASE_EARTH_LAYER.file}`
const NIGHT_MAP = `${BASE}assets/nasa/earth-night-8k.jpg`
const CLOUD_MAP = `${BASE}assets/nasa/earth-clouds-8k.jpg`
const TOPO_MAP = `${BASE}assets/nasa/earth-topo.jpg`

// Build a single LineSegments buffer for the lat/lon grid (one draw call).
function buildGridSegments() {
  const pts = []
  const push = (a, b) => pts.push(a[0], a[1], a[2], b[0], b[1], b[2])
  const lift = 0.004
  for (const latDeg of [-60, -30, 0, 30, 60]) {
    const lat = latDeg * DEG2RAD
    for (let i = 0; i < 96; i++) {
      const lon0 = (i / 96) * 2 * Math.PI - Math.PI
      const lon1 = ((i + 1) / 96) * 2 * Math.PI - Math.PI
      push(surfaceVec3(lat, lon0, lift), surfaceVec3(lat, lon1, lift))
    }
  }
  for (let m = 0; m < 12; m++) {
    const lon = (m / 12) * 2 * Math.PI - Math.PI
    for (let i = 0; i < 96; i++) {
      const lat0 = (i / 96) * Math.PI - Math.PI / 2
      const lat1 = ((i + 1) / 96) * Math.PI - Math.PI / 2
      push(surfaceVec3(lat0, lon, lift), surfaceVec3(lat1, lon, lift))
    }
  }
  return new Float32Array(pts)
}

function canvasTextureFrom(data, w, h) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  c.getContext('2d').putImageData(new ImageData(data, w, h), 0, 0)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.NoColorSpace // data maps are linear, not color
  return t
}

// Derive an ocean-specular (roughness) map and a land-only relief (bump) map
// from the NASA day image + GEBCO elevation. Oceans become glossy so the Sun
// glints off water; land stays matte; ocean elevation is flattened so only land
// gets bump relief. Runs once when textures are ready.
function deriveSurfaceMaps(dayImg, topoImg) {
  const W = 2048
  const H = 1024
  const draw = (img) => {
    const c = document.createElement('canvas')
    c.width = W
    c.height = H
    const ctx = c.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(img, 0, 0, W, H)
    return ctx.getImageData(0, 0, W, H).data
  }
  const day = draw(dayImg)
  const topo = topoImg ? draw(topoImg) : null

  const rough = new Uint8ClampedArray(W * H * 4)
  const bump = topo ? new Uint8ClampedArray(W * H * 4) : null

  for (let i = 0; i < W * H; i++) {
    const p = i * 4
    const r = day[p]
    const g = day[p + 1]
    const b = day[p + 2]
    const lum = 0.299 * r + 0.587 * g + 0.114 * b
    const water = b >= r && b >= g // blue-dominant ≈ ocean
    // roughness: water glossy (sun glint), snow/ice semi, land matte
    const rv = water ? 34 : lum > 200 ? 140 : 224
    rough[p] = rough[p + 1] = rough[p + 2] = rv
    rough[p + 3] = 255
    if (bump) {
      const elev = water ? 128 : topo[p] // flatten oceans, keep land relief
      bump[p] = bump[p + 1] = bump[p + 2] = elev
      bump[p + 3] = 255
    }
  }
  return {
    roughness: canvasTextureFrom(rough, W, H),
    bump: bump ? canvasTextureFrom(bump, W, H) : null,
  }
}

export default function EarthGlobe({ quality = 'balanced', showGrid = false, clock, reducedMotion }) {
  const { camera, gl } = useThree()
  const earthRef = useRef()
  const cloudRef = useRef()
  const [tex, setTex] = useState({ day: null, night: null, clouds: null, roughness: null, bump: null })

  // Sun direction, shared into the night-lights + atmosphere shaders.
  const sunViewUniform = useRef({ value: new THREE.Vector3(1, 0, 0) })
  const sunWorldUniform = useRef({ value: new THREE.Vector3(1, 0, 0) })
  const _sunWorld = useRef(new THREE.Vector3()).current
  const _sunView = useRef(new THREE.Vector3()).current

  const withExtras = quality !== 'low' // night lights, clouds, specular, bump

  // Load textures with the canonical TextureLoader, then derive surface maps.
  useEffect(() => {
    const loader = new THREE.TextureLoader()
    const maxAniso = gl.capabilities.getMaxAnisotropy?.() ?? 8
    const aniso = Math.min(16, maxAniso)
    let disposed = false
    const created = []
    const load = (url, color) =>
      new Promise((resolve) => {
        if (!url) return resolve(null)
        loader.load(
          url,
          (t) => {
            t.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace
            t.anisotropy = aniso
            created.push(t)
            resolve(t)
          },
          undefined,
          () => resolve(null),
        )
      })

    Promise.all([
      load(DAY_MAP, true),
      withExtras ? load(NIGHT_MAP, true) : null,
      withExtras ? load(CLOUD_MAP, true) : null,
      withExtras ? load(TOPO_MAP, false) : null,
    ]).then(([day, night, clouds, topo]) => {
      if (disposed) {
        ;[day, night, clouds, topo].forEach((t) => t && t.dispose())
        return
      }
      let roughness = null
      let bump = null
      if (day?.image) {
        try {
          const derived = deriveSurfaceMaps(day.image, topo?.image)
          roughness = derived.roughness
          bump = derived.bump
          roughness && (roughness.anisotropy = aniso)
          bump && (bump.anisotropy = aniso)
        } catch {
          /* fall back to uniform roughness */
        }
      }
      topo?.dispose() // only needed for derivation
      setTex({ day, night, clouds, roughness, bump })
    })

    return () => {
      disposed = true
      created.forEach((t) => t.dispose())
    }
  }, [withExtras, gl])

  // Earth material: PBR day map, ocean-specular roughness map, land relief bump,
  // and night-side city lights (via a small shader injection).
  const earthMaterial = useMemo(() => {
    if (!tex.day) return null
    const mat = new THREE.MeshStandardMaterial({
      map: tex.day,
      metalness: 0.0,
      roughness: tex.roughness ? 1.0 : 0.9,
      roughnessMap: tex.roughness || null,
      bumpMap: tex.bump || null,
      bumpScale: tex.bump ? 2.2 : 0,
    })
    if (tex.night) {
      mat.emissiveMap = tex.night
      mat.emissive = new THREE.Color(0xffffff)
      mat.emissiveIntensity = 1.0
      mat.onBeforeCompile = (shader) => {
        shader.uniforms.uSunViewDir = sunViewUniform.current
        shader.fragmentShader =
          'uniform vec3 uSunViewDir;\n' +
          shader.fragmentShader.replace(
            '#include <emissivemap_fragment>',
            `#include <emissivemap_fragment>
             float _sun = dot(normalize(vNormal), normalize(uSunViewDir));
             float _night = smoothstep(0.06, -0.20, _sun);
             totalEmissiveRadiance *= _night * 1.2;`,
          )
      }
    }
    return mat
  }, [tex])

  useEffect(() => () => earthMaterial?.dispose(), [earthMaterial])
  // Derived textures live inside the material; dispose when it changes.
  useEffect(
    () => () => {
      tex.roughness?.dispose()
      tex.bump?.dispose()
    },
    [tex.roughness, tex.bump],
  )

  const cloudMaterial = useMemo(() => {
    if (!tex.clouds) return null
    return new THREE.MeshStandardMaterial({
      color: 0xffffff,
      alphaMap: tex.clouds,
      transparent: true,
      opacity: 0.96,
      depthWrite: false,
      roughness: 1,
      metalness: 0,
    })
  }, [tex])
  useEffect(() => () => cloudMaterial?.dispose(), [cloudMaterial])

  // Atmosphere: raymarched single-scattering (Rayleigh + Mie). This is what
  // produces the bright blue haze wrapping the whole disc and the thick glowing
  // limb (the NASA-Eyes look) — not just a rim highlight. Deliberately
  // perf-heavy: ~16 view samples × 8 light samples per pixel of the shell.
  const atmosphereMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.FrontSide,
        depthWrite: false,
        uniforms: {
          uSunDir: sunWorldUniform.current,
          uPlanetR: { value: EARTH_RADIUS_UNITS },
          uAtmoR: { value: EARTH_RADIUS_UNITS * ATMO_FACTOR },
          uHR: { value: 0.016 }, // Rayleigh scale height (scene units, exaggerated for look)
          uHM: { value: 0.0045 }, // Mie scale height
          uBetaR: { value: new THREE.Vector3(0.9, 2.1, 5.2) }, // Rayleigh scattering (blue-heavy)
          uBetaM: { value: 0.9 }, // Mie scattering
          uG: { value: 0.78 }, // Mie anisotropy (forward)
          uSunI: { value: 15.0 }, // sun intensity
        },
        vertexShader: `
          varying vec3 vWorldPos;
          varying vec3 vCenter;
          varying float vScale;
          void main() {
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vWorldPos = wp.xyz;
            vCenter = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
            vScale = length(modelMatrix[0].xyz);
            gl_Position = projectionMatrix * viewMatrix * wp;
          }
        `,
        fragmentShader: `
          const float PI = 3.141592653589793;
          const int VIEW_STEPS = 16;
          const int LIGHT_STEPS = 8;
          uniform vec3 uSunDir;
          uniform float uPlanetR;
          uniform float uAtmoR;
          uniform float uHR;
          uniform float uHM;
          uniform vec3 uBetaR;
          uniform float uBetaM;
          uniform float uG;
          uniform float uSunI;
          varying vec3 vWorldPos;
          varying vec3 vCenter;
          varying float vScale;

          // Ray/sphere (centered at origin). Returns entry/exit distances.
          vec2 raySphere(vec3 ro, vec3 rd, float r) {
            float b = dot(ro, rd);
            float c = dot(ro, ro) - r * r;
            float d = b * b - c;
            if (d < 0.0) return vec2(1e9, -1e9);
            float sd = sqrt(d);
            return vec2(-b - sd, -b + sd);
          }

          void main() {
            // Work in the globe's local (unscaled) frame so this also works when
            // the globe is placed/scaled inside a parent group (home page).
            vec3 ro = (cameraPosition - vCenter) / vScale;
            vec3 rd = normalize(vWorldPos - cameraPosition);
            vec3 sun = normalize(uSunDir);

            vec2 tA = raySphere(ro, rd, uAtmoR);
            float t0 = max(tA.x, 0.0);
            float t1 = tA.y;
            vec2 tP = raySphere(ro, rd, uPlanetR);
            if (tP.x > 0.0) t1 = min(t1, tP.x); // stop at the ground
            if (t1 <= t0) discard;

            float ds = (t1 - t0) / float(VIEW_STEPS);
            float t = t0 + ds * 0.5;
            vec3 sumR = vec3(0.0);
            vec3 sumM = vec3(0.0);
            float odR = 0.0;
            float odM = 0.0;

            for (int i = 0; i < VIEW_STEPS; i++) {
              vec3 p = ro + rd * t;
              float h = length(p) - uPlanetR;
              float hr = exp(-h / uHR) * ds;
              float hm = exp(-h / uHM) * ds;
              odR += hr;
              odM += hm;

              // optical depth toward the sun
              vec2 tL = raySphere(p, sun, uAtmoR);
              float dsl = tL.y / float(LIGHT_STEPS);
              float tl = dsl * 0.5;
              float odlR = 0.0;
              float odlM = 0.0;
              bool shadowed = false;
              for (int j = 0; j < LIGHT_STEPS; j++) {
                vec3 pl = p + sun * tl;
                float hl = length(pl) - uPlanetR;
                if (hl < 0.0) { shadowed = true; break; }
                odlR += exp(-hl / uHR) * dsl;
                odlM += exp(-hl / uHM) * dsl;
                tl += dsl;
              }
              if (!shadowed) {
                vec3 tau = uBetaR * (odR + odlR) + vec3(uBetaM) * 1.1 * (odM + odlM);
                vec3 attn = exp(-tau);
                sumR += attn * hr;
                sumM += attn * hm;
              }
              t += ds;
            }

            float mu = dot(rd, sun);
            float phR = 3.0 / (16.0 * PI) * (1.0 + mu * mu);
            float g2 = uG * uG;
            float phM = 3.0 / (8.0 * PI) * ((1.0 - g2) * (1.0 + mu * mu)) /
                        ((2.0 + g2) * pow(1.0 + g2 - 2.0 * uG * mu, 1.5));

            vec3 col = (sumR * uBetaR * phR + sumM * vec3(uBetaM) * phM) * uSunI;
            gl_FragColor = vec4(col, 1.0);
          }
        `,
      }),
    [],
  )
  useEffect(() => () => atmosphereMaterial.dispose(), [atmosphereMaterial])

  const gridGeometry = useMemo(() => {
    if (!showGrid) return null
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(buildGridSegments(), 3))
    return g
  }, [showGrid])
  useEffect(() => () => gridGeometry?.dispose(), [gridGeometry])

  const segments = quality === 'high' ? 128 : quality === 'low' ? 64 : 96

  // Drive the day/night terminator + drift the clouds.
  useFrame((_, delta) => {
    if (clock) {
      const [sx, sy, sz] = sunDirectionUnitVec(clock.getDate())
      _sunWorld.set(sx, sy, sz)
      sunWorldUniform.current.value.copy(_sunWorld)
      _sunView.copy(_sunWorld).transformDirection(camera.matrixWorldInverse)
      sunViewUniform.current.value.copy(_sunView)
    }
    if (cloudRef.current && !reducedMotion) cloudRef.current.rotation.y += delta * 0.005
  })

  return (
    <group>
      {/* Earth */}
      <mesh ref={earthRef} rotation={[0, TEXTURE_ROTATION_Y, 0]}>
        <sphereGeometry args={[EARTH_RADIUS_UNITS, segments, segments]} />
        {earthMaterial ? (
          <primitive object={earthMaterial} attach="material" />
        ) : (
          // Clean procedural ocean-blue fallback (NOT satellite imagery).
          <meshStandardMaterial color="#16324f" roughness={0.8} metalness={0.05} />
        )}
      </mesh>

      {/* Clouds */}
      {cloudMaterial && (
        <mesh ref={cloudRef} rotation={[0, TEXTURE_ROTATION_Y, 0]} scale={1.01}>
          <sphereGeometry args={[EARTH_RADIUS_UNITS, segments, segments]} />
          <primitive object={cloudMaterial} attach="material" />
        </mesh>
      )}

      {/* Atmosphere (raymarched scattering shell) */}
      <mesh scale={ATMO_FACTOR}>
        <sphereGeometry args={[EARTH_RADIUS_UNITS, segments, segments]} />
        <primitive object={atmosphereMaterial} attach="material" />
      </mesh>

      {/* Optional lat/lon grid */}
      {gridGeometry && (
        <lineSegments geometry={gridGeometry}>
          <lineBasicMaterial color="#7fb4ff" transparent opacity={0.25} />
        </lineSegments>
      )}
    </group>
  )
}
