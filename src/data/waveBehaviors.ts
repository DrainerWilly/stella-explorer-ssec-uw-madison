// @ts-nocheck
// Content + simplified relative-value tables for the Wave Behaviors module.
// Metric values are classroom approximations (relative 0–10), not real physics.

export const WAVE_BEHAVIORS = [
  {
    id: 'reflection',
    name: 'Reflection',
    short: 'Light bounces off a surface.',
    def: {
      elementary: 'Reflection happens when light bounces off a surface.',
      middle: 'Reflection happens when a wave hits a surface and bounces away.',
      high: 'Reflection occurs when electromagnetic radiation changes direction at a boundary. For a smooth surface, the angle of incidence equals the angle of reflection.',
    },
    whatToWatch: 'Watch the beam hit the surface and bounce away at a matching angle.',
    remoteSensing:
      'Satellites often measure sunlight reflected from Earth’s surface. Different surfaces reflect different wavelengths.',
    tryThis: {
      elementary: 'Choose a surface. Which one bounces more light?',
      middle: 'Compare smooth and rough surfaces. How does the reflected beam change?',
      high: 'How might reflected energy help identify land cover from a satellite image?',
    },
    advanced: 'For a smooth surface, the angle of incidence equals the angle of reflection.',
  },
  {
    id: 'absorption',
    name: 'Absorption',
    short: 'Light energy is taken in and becomes heat.',
    def: {
      elementary: 'Absorption happens when light is taken in by an object.',
      middle: 'When light is absorbed, its energy can warm the material.',
      high: 'Absorption occurs when electromagnetic energy is taken up by matter and converted into internal energy, often increasing temperature.',
    },
    whatToWatch: 'Watch photons disappear into the surface as heat rises from it.',
    remoteSensing:
      'Dark surfaces like asphalt absorb more sunlight and can become hotter. Thermal sensors can detect emitted heat.',
    tryThis: {
      elementary: 'Which surface gets warmer?',
      middle: 'Why does dark pavement absorb more energy than light concrete?',
      high: 'How does absorption connect to thermal infrared remote sensing?',
    },
    advanced: 'Absorbed electromagnetic energy can increase a material’s internal energy and temperature.',
  },
  {
    id: 'transmission',
    name: 'Transmission',
    short: 'Light passes through a material.',
    def: {
      elementary: 'Transmission happens when light passes through something.',
      middle: 'Transmission means a wave moves through a material instead of being blocked or reflected.',
      high: 'Transmission occurs when electromagnetic radiation passes through a medium. The amount transmitted depends on wavelength and material properties.',
    },
    whatToWatch: 'Watch photons travel through the material and continue out the other side.',
    remoteSensing:
      'Some wavelengths pass through the atmosphere, while others are blocked. Satellites use wavelengths that can reach their sensors.',
    tryThis: {
      elementary: 'Change the material. Which one lets more light through?',
      middle: 'Which materials block more light, and why might that matter for a satellite?',
      high: 'How does wavelength-dependent transmission shape which bands satellites use?',
    },
    advanced: 'Transmission depends on wavelength and material properties.',
  },
  {
    id: 'refraction',
    name: 'Refraction',
    short: 'Light bends entering a new material.',
    def: {
      elementary: 'Refraction happens when light bends as it moves into a new material.',
      middle: 'Refraction occurs because light changes speed when it enters a different material.',
      high: 'Refraction is the change in direction of a wave as it passes between media with different refractive indices.',
    },
    whatToWatch: 'Watch the beam bend at the boundary and slow down in the denser material.',
    remoteSensing:
      'Refraction affects how light travels through the atmosphere and water before reaching a sensor.',
    tryThis: {
      elementary: 'Change the material. Does the beam bend more or less?',
      middle: 'Which material bends the light the most? What does that tell you?',
      high: 'How could atmospheric refraction affect the geometry of a satellite measurement?',
    },
    advanced: 'Bending occurs because the wave speed changes in a new medium.',
  },
  {
    id: 'scattering',
    name: 'Scattering',
    short: 'Light spreads in many directions.',
    def: {
      elementary: 'Scattering happens when light bounces in many directions.',
      middle: 'Scattering occurs when light interacts with small particles and spreads out.',
      high: 'Scattering redirects electromagnetic radiation. Shorter visible wavelengths scatter more strongly in Earth’s atmosphere, helping make the sky appear blue.',
    },
    whatToWatch: 'Watch the beam break into many directions as it meets the particles.',
    remoteSensing:
      'Scattering by aerosols, smoke, dust, and clouds affects satellite images and can also be used to study the atmosphere.',
    tryThis: {
      elementary: 'Add more particles. What happens to the light?',
      middle: 'Why might smoke or haze make satellite images harder to read?',
      high: 'How can scattering both interfere with and reveal atmospheric conditions?',
    },
    advanced: 'Shorter wavelengths can scatter more strongly in the atmosphere.',
  },
  {
    id: 'diffraction',
    name: 'Diffraction',
    short: 'Waves bend around edges and through openings.',
    def: {
      elementary: 'Diffraction happens when waves bend around edges or spread through openings.',
      middle: 'Diffraction is wave bending and spreading when a wave passes an edge or opening.',
      high: 'Diffraction occurs when a wave encounters an obstacle or aperture. The amount of spreading depends on wavelength compared with the size of the opening.',
    },
    whatToWatch: 'Watch the wavefront spread out after passing through the narrow opening.',
    remoteSensing:
      'Diffraction is important in optical instruments and spectrometers, which separate light into wavelengths.',
    tryThis: {
      elementary: 'Make the opening smaller. What happens to the wave spreading?',
      middle: 'How does the opening size change how much the wave spreads?',
      high: 'How does the wavelength-to-aperture ratio limit an instrument’s resolution?',
    },
    advanced: 'Spreading depends on the relationship between wavelength and aperture size.',
  },
]

export const BEHAVIOR_ORDER = WAVE_BEHAVIORS.map((b) => b.id)
export const getBehavior = (id) => WAVE_BEHAVIORS.find((b) => b.id === id)

// --- behavior-specific control option tables (relative 0–10) ---------------
export const SURFACES = {
  mirror: { label: 'Smooth mirror', color: '#cbd5e1', reflected: 9, absorbed: 1, transmitted: 0 },
  leaf: { label: 'Leaf', color: '#4caf6b', reflected: 4, absorbed: 5, transmitted: 1 },
  water: { label: 'Water', color: '#3b7fd6', reflected: 2, absorbed: 3, transmitted: 5 },
  pavement: { label: 'Pavement', color: '#8a8f96', reflected: 3, absorbed: 7, transmitted: 0 },
}
export const SURFACE_ORDER = ['mirror', 'leaf', 'water', 'pavement']

export const MATERIALS = {
  pavement: { label: 'Dark pavement', color: '#2a2d34', absorbed: 8, heat: 9, reflected: 2 },
  concrete: { label: 'Light concrete', color: '#d6d3cb', absorbed: 4, heat: 4, reflected: 6 },
  water: { label: 'Water', color: '#3b7fd6', absorbed: 6, heat: 3, reflected: 1 },
  vegetation: { label: 'Vegetation', color: '#4caf6b', absorbed: 6, heat: 4, reflected: 3 },
}
export const MATERIAL_ORDER = ['pavement', 'concrete', 'water', 'vegetation']

export const MEDIA = {
  air: { label: 'Clear air', color: '#eaf4ff', transmitted: 10, blocked: 0 },
  glass: { label: 'Glass', color: '#d3ebf5', transmitted: 8, blocked: 2 },
  water: { label: 'Water', color: '#bfe0f5', transmitted: 6, blocked: 4 },
  cloud: { label: 'Cloud', color: '#e9edf2', transmitted: 3, blocked: 7 },
  smoke: { label: 'Smoke', color: '#b9bcc2', transmitted: 2, blocked: 8 },
}
export const MEDIUM_ORDER = ['air', 'glass', 'water', 'cloud', 'smoke']

export const PAIRS = {
  water: { label: 'Air → water', color: '#bfe0f5', bend: 6 },
  glass: { label: 'Air → glass', color: '#d3ebf5', bend: 8 },
  atmosphere: { label: 'Air → atmosphere', color: '#eaf4ff', bend: 2 },
}
export const PAIR_ORDER = ['water', 'glass', 'atmosphere']

export const ATMOSPHERES = {
  clear: { label: 'Clear', density: 3 },
  hazy: { label: 'Hazy', density: 6 },
  smoky: { label: 'Smoky', density: 9 },
}
export const ATMOSPHERE_ORDER = ['clear', 'hazy', 'smoky']

export const RS_HEADLINE =
  'Remote sensing depends on how electromagnetic energy interacts with Earth’s surface and atmosphere. Satellites detect reflected, emitted, transmitted, or scattered energy. By studying these interactions, scientists can identify vegetation, water, clouds, smoke, heat, soil, pavement, and other surface or atmospheric features.'

export const ADVANCED_NOTE =
  'These animations are simplified classroom models. Real electromagnetic interactions depend on wavelength, material properties, surface texture, atmosphere, and instrument design.'

export const GRADE_LABEL = { elementary: 'Elementary', middle: 'Middle', high: 'High' }
