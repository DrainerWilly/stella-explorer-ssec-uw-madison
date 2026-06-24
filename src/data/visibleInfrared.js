// Content + palettes for the Visible vs Infrared module. Relative bar values
// and colors are simplified classroom approximations, not calibrated data.

export const visibleInfraredText = {
  overview: {
    elementary: 'Our eyes see only some kinds of light. Satellites can see invisible light too.',
    middle:
      'Visible light is the part of the spectrum human eyes detect. Infrared wavelengths are invisible to us but useful for studying Earth.',
    high: 'Remote sensing instruments measure reflected and emitted electromagnetic energy across visible, near-infrared, and thermal infrared bands.',
  },
  nir: {
    elementary: 'Healthy plants bounce back a lot of invisible infrared light.',
    middle:
      'Healthy vegetation reflects strongly in near-infrared wavelengths, while water absorbs much of it.',
    high: 'Near-infrared reflectance is high for healthy vegetation due to leaf internal structure and low for water due to absorption.',
  },
  thermal: {
    elementary: 'Thermal infrared helps us see which surfaces are warmer.',
    middle: 'Thermal infrared sensors detect energy emitted by warm surfaces.',
    high: 'Thermal infrared observations estimate surface temperature and support studies of urban heat, fires, clouds, and land-atmosphere interactions.',
  },
  falseColor: {
    elementary: 'False color uses special colors to show invisible information.',
    middle:
      'False-color images assign invisible wavelengths to visible colors so patterns are easier to see.',
    high: 'False-color composites map non-visible bands, such as near-infrared, into RGB channels to highlight vegetation, water, or surface differences.',
  },
}

// mode id → its explanation + legend. textKey points into visibleInfraredText.
export const VIEW_MODES = [
  {
    id: 'visible',
    label: 'Human eyes',
    textKey: 'overview',
    explanation:
      'Human eyes see visible light: red, green, and blue. This is only a small part of the electromagnetic spectrum.',
    legend: [
      { swatch: '#e0533d', label: 'Red' },
      { swatch: '#4caf6b', label: 'Green' },
      { swatch: '#3b7fd6', label: 'Blue' },
      { swatch: 'linear-gradient(90deg,#e0533d,#4caf6b,#3b7fd6)', label: 'Natural color' },
    ],
  },
  {
    id: 'nir',
    label: 'Near-infrared',
    textKey: 'nir',
    explanation:
      'Near-infrared is invisible to human eyes, but sensors can detect it. Healthy plants reflect strongly in near-infrared light.',
    legend: [
      { swatch: '#eef7c4', label: 'Bright = high NIR reflectance' },
      { swatch: '#11151c', label: 'Dark = low NIR reflectance' },
    ],
  },
  {
    id: 'thermal',
    label: 'Thermal infrared',
    textKey: 'thermal',
    explanation:
      'Thermal infrared helps sensors detect heat. It can reveal hot pavement, rooftops, fires, and surface temperature differences.',
    legend: [
      { swatch: '#1d3a6b', label: 'Dark / cool = lower temperature' },
      { swatch: '#ff5e3a', label: 'Bright / warm = higher temperature' },
    ],
  },
  {
    id: 'false',
    label: 'False-color satellite',
    textKey: 'falseColor',
    explanation:
      'False-color images assign invisible wavelengths to visible colors so humans can see patterns that would otherwise be hidden.',
    legend: [
      { swatch: '#ff4d6d', label: 'Red / pink = vegetation' },
      { swatch: '#0b1f3a', label: 'Dark = water' },
      { swatch: '#7fb0b8', label: 'Gray / cyan = urban' },
      { swatch: '#c8a06a', label: 'Tan / brown = soil' },
    ],
  },
]
export const MODE_ORDER = VIEW_MODES.map((m) => m.id)
export const getMode = (id) => VIEW_MODES.find((m) => m.id === id)

export const OBJECTS = [
  {
    id: 'vegHealthy',
    name: 'Healthy vegetation',
    classKey: 'vegHealthy',
    visible: 'Green',
    nearInfrared: 'Very high reflectance',
    thermal: 'Cooler than pavement',
    bars: { visible: 6, nir: 9, thermal: 3 },
    explanation:
      'Healthy leaves reflect a lot of near-infrared light. This helps satellites measure plant health.',
  },
  {
    id: 'vegDry',
    name: 'Dry vegetation',
    classKey: 'vegDry',
    visible: 'Yellow / brown',
    nearInfrared: 'Lower than healthy vegetation',
    thermal: 'Warmer than healthy vegetation',
    bars: { visible: 6, nir: 5, thermal: 5 },
    explanation: 'Dry or stressed plants usually reflect less near-infrared than healthy plants.',
  },
  {
    id: 'water',
    name: 'Water',
    classKey: 'water',
    visible: 'Blue / dark',
    nearInfrared: 'Very low reflectance',
    thermal: 'Often cooler / slower to change',
    bars: { visible: 4, nir: 1, thermal: 2 },
    explanation: 'Water absorbs much near-infrared light, so it often appears dark in NIR images.',
  },
  {
    id: 'soil',
    name: 'Soil',
    classKey: 'soil',
    visible: 'Brown',
    nearInfrared: 'Moderate',
    thermal: 'Depends on moisture and sunlight',
    bars: { visible: 5, nir: 5, thermal: 6 },
    explanation: 'Soil reflectance changes with moisture, texture, and composition.',
  },
  {
    id: 'pavement',
    name: 'Pavement',
    classKey: 'pavement',
    visible: 'Gray / dark',
    nearInfrared: 'Moderate / low',
    thermal: 'High',
    bars: { visible: 3, nir: 3, thermal: 8 },
    explanation: 'Pavement absorbs sunlight and can become hot, which thermal sensors can detect.',
  },
  {
    id: 'roof',
    name: 'Roof / building',
    classKey: 'roof',
    visible: 'Artificial colors',
    nearInfrared: 'Variable',
    thermal: 'Often warm',
    bars: { visible: 5, nir: 4, thermal: 8 },
    explanation: 'Urban materials can heat up and show strongly in thermal views.',
  },
]
export const getObject = (id) => OBJECTS.find((o) => o.id === id)

// Per-mode fills, keyed by classKey (+ sky/sun/grass scenery).
export const MODE_COLORS = {
  visible: {
    sky: '#cdebff', sun: '#ffd76a', grass: '#5cb978', vegHealthy: '#3f9e5b', vegDry: '#c2a14a',
    water: '#3b7fd6', soil: '#b07a45', pavement: '#6b7280', roof: '#c95b5b', wall: '#e3e6ea',
  },
  nir: {
    sky: '#0c1422', sun: '#dfe6ef', grass: '#dff0a8', vegHealthy: '#eef7c4', vegDry: '#c9cfa0',
    water: '#0f1a2b', soil: '#9a8f7a', pavement: '#5b6168', roof: '#8a8f96', wall: '#aeb4bb',
  },
  thermal: {
    sky: '#20242c', sun: '#ffd2a6', grass: '#4f8f7a', vegHealthy: '#3f6f8f', vegDry: '#c98a5a',
    water: '#1d3a6b', soil: '#e8915a', pavement: '#ff5e3a', roof: '#ff7849', wall: '#f0a26a',
  },
  false: {
    sky: '#06121f', sun: '#dfe6ef', grass: '#ff4d6d', vegHealthy: '#ff4d6d', vegDry: '#ff9e80',
    water: '#0b1f3a', soil: '#c8a06a', pavement: '#7fb0b8', roof: '#5fa8b8', wall: '#9fd0d8',
  },
}

// in-scene callout labels per mode (shown when labels are on)
export const MODE_NOTES = {
  visible: [],
  nir: [
    'Healthy vegetation reflects strongly in NIR',
    'Water absorbs much NIR',
    'Dry vegetation reflects less',
  ],
  thermal: ['Hotter surfaces emit more thermal infrared energy'],
  false: ['False color uses visible colors to show invisible data'],
}

export const RS_HEADLINE =
  'Satellites do more than take pictures. They measure specific wavelengths of energy. Visible bands show natural color, near-infrared bands reveal vegetation and water differences, and thermal infrared bands show heat. Comparing these views helps scientists study plant health, water, cities, fires, and land-cover change.'

export const TRY_THIS = {
  elementary: 'Switch between Human eyes and Near-infrared. Which objects change the most?',
  middle: 'Click healthy vegetation and water. How are their near-infrared signals different?',
  high: 'Compare near-infrared and thermal infrared views. Which one is better for vegetation health? Which one is better for surface heat?',
}

export const ADVANCED = [
  'Visible light: approximately 400–700 nm',
  'Near-infrared: roughly 700–1000 nm for this simplified lesson',
  'Thermal infrared: longer wavelengths emitted by warm surfaces',
  'Reflectance: fraction of incoming light that bounces off a surface',
  'Emitted energy: energy released by warm objects',
]
export const ADVANCED_NOTE =
  'This animation is a simplified classroom model. Actual satellite sensors measure specific wavelength bands, and real images require calibration and processing.'

export const GRADE_LABEL = { elementary: 'Elementary', middle: 'Middle', high: 'High' }
