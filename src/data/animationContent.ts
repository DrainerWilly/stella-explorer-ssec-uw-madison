// @ts-nocheck
// Content for the Animations page: grade-level explanations and card metadata
// for each interactive explainer. The actual visuals live in
// src/components/animations/*. Colors map to the pastel tokens already in the
// Tailwind safelist (pink, yellow, lavender, cardmint, blue, coral).

export const GRADE_LEVELS = [
  { id: 'elementary', label: 'Elementary', short: 'Elem' },
  { id: 'middle', label: 'Middle', short: 'Middle' },
  { id: 'high', label: 'High', short: 'High' },
]

export const DEFAULT_GRADE = 'middle'

export const ANIMATIONS = [
  {
    id: 'spectrumSlider',
    title: 'Electromagnetic Spectrum Slider',
    label: 'Spectrum',
    badge: 'Interactive',
    icon: 'spectrum',
    color: 'pink',
    standalone: true, // owns its full detail layout (see AnimationsPage)
    description:
      'Move across radio, microwave, infrared, visible, ultraviolet, X-ray, and gamma ray wavelengths.',
    explain: {
      elementary:
        'Light comes in many types. Some light we can see, and a lot of it is invisible to our eyes!',
      middle:
        'The electromagnetic spectrum is the whole family of light, sorted by wavelength: from long radio waves to tiny gamma rays.',
      high:
        'Across the electromagnetic spectrum, as wavelength decreases, frequency and photon energy increase: from low-energy radio waves to high-energy gamma rays.',
    },
    remoteSensing:
      'Satellites carry sensors tuned to specific parts of this spectrum (visible, infrared, microwave) to study different things about Earth.',
    tryThis:
      "Slide all the way to each end. Where does visible light sit compared to the whole spectrum? (Hint: it's a tiny slice!)",
  },
  {
    id: 'waveAnatomy',
    title: 'Wave Anatomy',
    label: 'Waves',
    badge: 'Grade adaptive',
    icon: 'wave',
    color: 'yellow',
    standalone: true, // owns its full detail layout (see AnimationsPage)
    description: 'Explore wavelength, frequency, amplitude, crests, and troughs.',
    explain: {
      elementary:
        'Waves have high parts called crests and low parts called troughs. Bigger waves carry more energy.',
      middle:
        "A wave's wavelength is the distance between two crests, and its frequency is how many waves pass by each second.",
      high:
        'Photon energy scales with frequency (E = hf). Shorter wavelengths mean higher frequency and more energy.',
    },
    remoteSensing:
      'Sensors measure the wavelength of light coming off Earth to tell apart plants, water, soil, and cities.',
    tryThis:
      'Make the wavelength shorter and watch the frequency and energy climb. What happens to the energy when you stretch the wave out?',
  },
  {
    id: 'waveBehaviors',
    title: 'Wave Behaviors',
    label: 'Light + Matter',
    badge: 'Visual demo',
    icon: 'rays',
    color: 'lavender',
    standalone: true, // owns its full detail layout (see AnimationsPage)
    description:
      'See how light reflects, absorbs, transmits, refracts, scatters, and diffracts.',
    explain: {
      elementary: 'When light hits stuff, it can bounce off, soak in, pass through, or bend.',
      middle:
        'Light can reflect, be absorbed, transmit, refract, scatter, or diffract depending on the material it meets.',
      high:
        "How light interacts with matter (reflection, absorption, transmission, refraction, scattering, and diffraction) depends on wavelength and the material's properties.",
    },
    remoteSensing:
      'Remote sensing works because every surface reflects and absorbs light differently: that pattern is its fingerprint.',
    tryThis:
      'Click through each behavior. Which one explains why the daytime sky is blue? (Scattering!)',
  },
  {
    id: 'visibleInfrared',
    title: 'Visible vs Infrared',
    label: 'Remote sensing',
    badge: 'Toggle',
    icon: 'satellite',
    color: 'blue',
    standalone: true, // owns its full detail layout (see AnimationsPage)
    description: 'Compare what human eyes see with what satellite sensors can detect.',
    explain: {
      elementary:
        "Our eyes only see colors. Satellites can also 'see' invisible light to find healthy plants and water.",
      middle:
        'Satellites detect near-infrared light. Healthy plants reflect a lot of it, so they glow bright in false-color images.',
      high:
        'In the near-infrared, healthy vegetation reflects strongly while water absorbs almost everything: the basis of indices like NDVI.',
    },
    remoteSensing:
      'Switching to the infrared view is exactly what satellites like Landsat do to map vegetation and water.',
    tryThis:
      'Toggle the view. Which surface changes the most? Which one turns dark in infrared? (Water!)',
  },
  {
    id: 'signatureBuilder',
    title: 'Spectral Signature Builder',
    label: 'Data',
    badge: 'Hands-on',
    icon: 'data',
    color: 'cardmint',
    description:
      'Choose objects like leaves, soil, water, and pavement to compare their spectral patterns.',
    explain: {
      elementary: 'Different things reflect light in their own special way. We can draw it as a line!',
      middle:
        'A spectral signature is the pattern of how much light an object reflects at each wavelength.',
      high:
        "Each material has a characteristic reflectance spectrum; vegetation's sharp rise near 700 nm (the 'red edge') is a key diagnostic feature.",
    },
    remoteSensing:
      "Satellites match these signatures to identify what's on the ground without ever touching it.",
    tryThis:
      'Compare a healthy leaf with water. Where does the leaf shoot up while water stays flat? (The near-infrared.)',
  },
  {
    id: 'atmosphericWindows',
    title: 'Atmospheric Windows',
    label: 'Atmosphere',
    badge: 'Space view',
    icon: 'globe',
    color: 'coral',
    description:
      "See which wavelengths pass through Earth's atmosphere and which are blocked.",
    explain: {
      elementary:
        "Earth's air lets some light through and blocks other light, like sunscreen for the whole planet.",
      middle:
        "The atmosphere has 'windows' that let visible light and radio waves through, but it blocks most UV, X-rays, and gamma rays.",
      high:
        'Absorption by ozone, water vapor, and CO₂ creates transmission windows; opaque bands force certain observations to be made from space.',
    },
    remoteSensing:
      'Telescopes for blocked wavelengths (UV, X-ray, gamma) must orbit above the atmosphere to see anything at all.',
    tryThis:
      'Find a wavelength that gets blocked. Why would NASA need to put that kind of telescope in space?',
  },
]

export const getAnimation = (id) => ANIMATIONS.find((a) => a.id === id)
