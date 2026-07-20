// @ts-nocheck
import { Component } from 'react'
import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react'

// Animated dark shader-gradient field used behind the Satellite Tracker loading
// screen. Colors are a deep NASA-navy → indigo → teal blend so it reads as
// "deep space with a faint aurora" while staying dark enough for white text.
//
// Uses control="props" (no query string) so it renders fully offline. The
// gradient is purely decorative, so a WebGL failure must never take down the
// loading screen — the boundary below swaps in a static CSS gradient instead.

const CSS_FALLBACK =
  'radial-gradient(120% 120% at 50% 15%, #12224d 0%, #0a1636 45%, #050b1f 100%)'

class ShaderBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (this.state.failed) {
      return <div aria-hidden="true" className="absolute inset-0" style={{ background: CSS_FALLBACK }} />
    }
    return this.props.children
  }
}

export default function ShaderGradientBackground() {
  return (
    <ShaderBoundary>
      {/* Static gradient shows instantly under the canvas, so first paint is
          never a black flash while WebGL warms up. */}
      <div aria-hidden="true" className="absolute inset-0" style={{ background: CSS_FALLBACK }} />
      <ShaderGradientCanvas
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        pixelDensity={1}
        fov={40}
        pointerEvents="none"
      >
        <ShaderGradient
          control="props"
          type="waterPlane"
          animate="on"
          uSpeed={0.2}
          uStrength={1.6}
          uDensity={1.4}
          uFrequency={5.5}
          color1="#060e26"
          color2="#3a2d7c"
          color3="#0e4a6e"
          brightness={1.1}
          grain="on"
          reflection={0.1}
          cDistance={3.2}
          cPolarAngle={115}
          cAzimuthAngle={180}
          positionX={0}
          positionY={0}
          positionZ={0}
          rotationX={0}
          rotationY={0}
          rotationZ={0}
        />
      </ShaderGradientCanvas>
    </ShaderBoundary>
  )
}
