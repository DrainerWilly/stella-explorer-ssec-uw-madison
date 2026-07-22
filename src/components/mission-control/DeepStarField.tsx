// @ts-nocheck
import { useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Dense NASA Eyes-style point field. A single Points draw call keeps the larger
// population inexpensive while still giving the camera cone enough stars.
const COUNTS = {
  low: 18000,
  balanced: 62000,
  high: 90000,
}

const STAR_VERTEX_SHADER = /* glsl */ `
  attribute vec3 starColor;
  attribute float starSize;
  attribute float starOpacity;
  attribute float starGlow;

  uniform float pixelRatio;

  varying vec3 vColor;
  varying float vOpacity;
  varying float vGlow;

  void main() {
    vColor = starColor;
    vOpacity = starOpacity;
    vGlow = starGlow;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    // starSize is authored in CSS pixels. gl_PointSize is physical pixels, so
    // the DPR multiply keeps stars from shrinking on high-density displays.
    gl_PointSize = clamp(starSize * pixelRatio, 0.72 * pixelRatio, 3.8 * pixelRatio);
  }
`

const STAR_FRAGMENT_SHADER = /* glsl */ `
  varying vec3 vColor;
  varying float vOpacity;
  varying float vGlow;

  void main() {
    vec2 point = gl_PointCoord * 2.0 - vec2(1.0);
    float radius = length(point);
    if (radius > 1.0) discard;

    float disc = 1.0 - smoothstep(0.78, 1.0, radius);
    float core = 1.0 - smoothstep(0.0, 0.46, radius);
    float halo = vGlow * (1.0 - smoothstep(0.18, 1.0, radius)) * 0.22;
    float alpha = clamp(vOpacity * max(disc, core * 0.82) + halo, 0.0, 1.0);

    vec3 color = vColor * (1.0 + vGlow * 0.42);
    gl_FragColor = vec4(color, alpha);
  }
`

// Small deterministic PRNG: stable stars across renders and page visits, with
// none of the repeated tiles or seams of a background texture.
function mulberry32(seed) {
  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function starTemperature(random) {
  const roll = random()
  if (roll < 0.58) return [1.0, 0.98, 0.94] // neutral white
  if (roll < 0.78) return [0.84, 0.92, 1.0] // cool white
  if (roll < 0.9) return [1.0, 0.91, 0.74] // warm yellow-white
  if (roll < 0.97) return [0.68, 0.82, 1.0] // pale blue
  return [1.0, 0.66, 0.52] // rare soft red-orange
}

function accentTemperature(random) {
  const roll = random()
  if (roll < 0.38) return [0.58, 0.76, 1.0] // blue-white
  if (roll < 0.72) return [1.0, 0.78, 0.42] // amber
  if (roll < 0.88) return [1.0, 0.56, 0.44] // subtle red
  return [1.0, 0.98, 0.9]
}

function buildStarGeometry(count, seed) {
  const random = mulberry32(seed)
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const opacities = new Float32Array(count)
  const glows = new Float32Array(count)

  for (let i = 0; i < count; i += 1) {
    // Uniform random direction on a sphere, with randomized astronomical depth.
    // The 260–520 unit shell is far relative to the 2-unit Earth, so spacecraft
    // camera motion creates no perceptible attachment or near-field parallax.
    const z = random() * 2 - 1
    const azimuth = random() * Math.PI * 2
    const radial = Math.sqrt(Math.max(0, 1 - z * z))
    const depth = 260 + random() * 260
    const p = i * 3
    positions[p] = Math.cos(azimuth) * radial * depth
    positions[p + 1] = z * depth
    positions[p + 2] = Math.sin(azimuth) * radial * depth

    const population = random()
    let size
    let opacity
    let intensity
    let glow
    let temperature
    if (population < 0.46) {
      // Fine-grain background texture. These are dim, but intentionally remain
      // above the practical one-pixel visibility threshold after DPR scaling.
      size = 0.72 + random() * 0.34
      opacity = 0.25 + random() * 0.24
      intensity = 0.72 + random() * 0.34
      glow = 0
      temperature = starTemperature(random)
    } else if (population < 0.86) {
      // Main visible field: many crisp tiny stars across the whole viewport.
      size = 0.95 + random() * 0.55
      opacity = 0.42 + random() * 0.34
      intensity = 0.9 + random() * 0.45
      glow = 0
    } else if (population < 0.96) {
      // Medium points add depth without turning into large discs.
      size = 1.45 + random() * 0.72
      opacity = 0.6 + random() * 0.28
      intensity = 1.06 + random() * 0.5
      glow = random() * 0.08
      temperature = starTemperature(random)
    } else if (population < 0.993) {
      // Bright but restrained pinpoints, mostly white/cool-white.
      size = 2.05 + random() * 0.88
      opacity = 0.78 + random() * 0.18
      intensity = 1.35 + random() * 0.75
      glow = 0.18 + random() * 0.28
      temperature = starTemperature(random)
    } else {
      // Rare colored accents, matching the blue and warm highlights in NASA Eyes.
      size = 2.45 + random() * 1.05
      opacity = 0.86 + random() * 0.12
      intensity = 1.85 + random() * 0.95
      glow = 0.34 + random() * 0.36
      temperature = accentTemperature(random)
    }

    temperature = temperature ?? starTemperature(random)
    colors[p] = temperature[0] * intensity
    colors[p + 1] = temperature[1] * intensity
    colors[p + 2] = temperature[2] * intensity
    sizes[i] = size
    opacities[i] = opacity
    glows[i] = glow
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('starColor', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('starSize', new THREE.BufferAttribute(sizes, 1))
  geometry.setAttribute('starOpacity', new THREE.BufferAttribute(opacities, 1))
  geometry.setAttribute('starGlow', new THREE.BufferAttribute(glows, 1))
  geometry.computeBoundingSphere()
  return geometry
}

export default function DeepStarField({ quality = 'balanced' }) {
  const gl = useThree((state) => state.gl)
  const size = useThree((state) => state.size)
  const count = COUNTS[quality] ?? COUNTS.balanced
  const geometry = useMemo(
    () => buildStarGeometry(count, 0x5ecca11a + count),
    [count],
  )
  const uniforms = useMemo(
    () => ({ pixelRatio: { value: Math.max(1, Math.min(gl.getPixelRatio(), 2)) } }),
    [gl],
  )

  useEffect(() => {
    uniforms.pixelRatio.value = Math.max(1, Math.min(gl.getPixelRatio(), 2))
  }, [gl, size.width, size.height, uniforms])

  return (
    <points geometry={geometry} frustumCulled={false} renderOrder={-100}>
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={STAR_VERTEX_SHADER}
        fragmentShader={STAR_FRAGMENT_SHADER}
        blending={THREE.AdditiveBlending}
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  )
}
