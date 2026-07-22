// @ts-nocheck
import { useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Approximately 4–5× the former drei <Stars> counts. A single Points draw call
// keeps even the high-density field inexpensive.
const COUNTS = {
  low: 6000,
  balanced: 17500,
  high: 30000,
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
    gl_PointSize = clamp(starSize * pixelRatio, 0.85 * pixelRatio, 4.2 * pixelRatio);
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

    // Keep the stellar disc visible at one-to-few-pixel sizes. The previous
    // falloff was too steep, leaving mostly subpixel centers after alpha blend.
    float disc = 1.0 - smoothstep(0.72, 1.0, radius);
    float core = 1.0 - smoothstep(0.0, 0.38, radius);
    float halo = vGlow * (1.0 - smoothstep(0.24, 1.0, radius)) * 0.3;
    float alpha = clamp(vOpacity * max(disc, core * 0.95) + halo, 0.0, 1.0);

    vec3 color = vColor * (1.0 + vGlow * 0.55);
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
  if (roll < 0.72) return [1.0, 0.98, 0.94] // neutral white
  if (roll < 0.9) return [0.82, 0.9, 1.0] // cool white
  if (roll < 0.96) return [1.0, 0.87, 0.7] // occasional warm star
  return [0.69, 0.83, 1.0] // occasional pale blue
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
    if (population < 0.78) {
      // Most stars: tiny but no longer subpixel-invisible.
      size = 0.85 + random() * 0.45
      opacity = 0.48 + random() * 0.26
      intensity = 0.82 + random() * 0.34
      glow = 0
    } else if (population < 0.96) {
      // Medium population: noticeable, but still pinpoints rather than discs.
      size = 1.45 + random() * 0.75
      opacity = 0.68 + random() * 0.24
      intensity = 1.0 + random() * 0.32
      glow = random() * 0.12
    } else {
      // A sparse bright population gets a small soft edge, not a flare.
      size = 2.45 + random() * 1.05
      opacity = 0.86 + random() * 0.14
      intensity = 1.18 + random() * 0.5
      glow = 0.45 + random() * 0.45
    }

    const temperature = starTemperature(random)
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
