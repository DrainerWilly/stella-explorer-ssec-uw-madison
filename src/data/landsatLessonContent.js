// Grade-adaptive content for the "How Landsat Images Are Made" lesson.
// Grade bands are keyed '6-8' and '9-12'. Landsat 8/9 OLI/TIRS values only.

export const GRADE_BANDS = [
  { id: '6-8', label: 'Grades 6–8' },
  { id: '9-12', label: 'Grades 9–12' },
]

export const HERO = {
  title: 'How Landsat Images Are Made',
  subtitle:
    'Explore how Landsat measures light beyond human vision and turns separate wavelength measurements into satellite images.',
  note: 'Landsat does not simply take one regular photograph. Its instruments measure energy in separate wavelength bands.',
  gradeNote: {
    '6-8': 'Landsat sees different kinds of light, including light that our eyes cannot see.',
    '9-12':
      'Landsat records reflected and emitted electromagnetic energy in discrete spectral bands, which can be processed into scientific image products.',
  },
  pipeline: ['Sunlight', 'Earth surface', 'Landsat sensor', 'Separate bands', 'Color composite'],
}

export const CHAPTERS = [
  { id: 'ch1', num: 1, short: 'Many kinds of light', title: 'Sunlight contains more than visible light' },
  { id: 'ch2', num: 2, short: 'Sunlight meets Earth', title: 'Energy interacts with Earth’s surface' },
  { id: 'ch3', num: 3, short: 'Separate bands', title: 'One scene becomes many measurements' },
  { id: 'ch4', num: 4, short: 'Processing', title: 'Data is processed before it becomes a map' },
  { id: 'ch5', num: 5, short: 'Bands → color', title: 'Three bands can become one color image' },
  { id: 'ch6', num: 6, short: 'Compare imagery', title: 'The same place can reveal different stories' },
]

// Spectrum regions for the Chapter 1 strip (not drawn to scale; visible emphasized).
export const SPECTRUM_REGIONS = [
  { id: 'visible', label: 'Visible', color: '#4caf6b', bands: [1, 2, 3, 4, 8] },
  { id: 'nir', label: 'Near-infrared', color: '#b14de0', bands: [5] },
  { id: 'swir', label: 'Shortwave infrared', color: '#e08a3c', bands: [6, 7, 9] },
  { id: 'thermal', label: 'Thermal infrared', color: '#e0533d', bands: [10, 11] },
]

// Landsat 8/9 OLI/TIRS bands (USGS band designations).
export const LANDSAT_BANDS = [
  { band: 1, name: 'Coastal aerosol', range: '0.43–0.45 µm', region: 'visible', resolution: '30 m',
    observes: 'Shallow water and tiny airborne particles (aerosols).',
    '6-8': 'Sees tiny bits of dust in the air and shallow water near coasts.',
    '9-12': 'Short-wavelength band sensitive to aerosols and coastal/shallow water.' },
  { band: 2, name: 'Blue', range: '0.45–0.51 µm', region: 'visible', resolution: '30 m',
    observes: 'Water, haze, and natural-color blue.',
    '6-8': 'Blue light. Helps us see water and haze.',
    '9-12': 'Blue reflectance; supports bathymetry, aerosol estimation, and natural color.' },
  { band: 3, name: 'Green', range: '0.53–0.59 µm', region: 'visible', resolution: '30 m',
    observes: 'Vegetation vigor and natural-color green.',
    '6-8': 'Green light. Healthy plants look a little brighter here.',
    '9-12': 'Green reflectance peaks for healthy vegetation; aids vigor assessment.' },
  { band: 4, name: 'Red', range: '0.64–0.67 µm', region: 'visible', resolution: '30 m',
    observes: 'Vegetation (chlorophyll absorbs red strongly).',
    '6-8': 'Red light. Plants soak up a lot of this color.',
    '9-12': 'Chlorophyll absorbs strongly in red; a key input to vegetation indices.' },
  { band: 5, name: 'Near-infrared', range: '0.85–0.88 µm', region: 'nir', resolution: '30 m',
    observes: 'Vegetation biomass and shorelines.',
    '6-8': 'Healthy plants reflect lots of near-infrared light, even though our eyes cannot see it.',
    '9-12': 'Healthy vegetation strongly reflects near-infrared energy because of leaf internal structure, making Band 5 useful for vegetation monitoring.' },
  { band: 6, name: 'SWIR 1', range: '1.57–1.65 µm', region: 'swir', resolution: '30 m',
    observes: 'Moisture in soil and vegetation.',
    '6-8': 'Invisible light that shows how wet or dry things are.',
    '9-12': 'Shortwave infrared sensitive to vegetation and soil moisture content.' },
  { band: 7, name: 'SWIR 2', range: '2.11–2.29 µm', region: 'swir', resolution: '30 m',
    observes: 'Dry ground, minerals, and burned areas.',
    '6-8': 'Invisible light that is good for dry ground and burned areas.',
    '9-12': 'Shortwave infrared aiding mineralogy and burned-area mapping.' },
  { band: 8, name: 'Panchromatic', range: '0.50–0.68 µm', region: 'visible', resolution: '15 m',
    observes: 'A sharper black-and-white band for detail.',
    '6-8': 'A sharper black-and-white view that adds detail.',
    '9-12': 'Broad 15 m panchromatic band used for pan-sharpening finer detail.' },
  { band: 9, name: 'Cirrus', range: '1.36–1.38 µm', region: 'swir', resolution: '30 m',
    observes: 'Thin, high cirrus clouds.',
    '6-8': 'Helps spot thin, wispy clouds.',
    '9-12': 'Detects thin high cirrus via a strong water-vapor absorption region.' },
  { band: 10, name: 'Thermal infrared 1', range: '10.6–11.19 µm', region: 'thermal', resolution: '100 m',
    observes: 'Emitted heat from the surface.',
    '6-8': 'Warm things give off thermal energy. Landsat can help scientists study heat.',
    '9-12': 'Thermal infrared bands measure emitted radiance from Earth’s surface and support surface-temperature products.' },
  { band: 11, name: 'Thermal infrared 2', range: '11.5–12.51 µm', region: 'thermal', resolution: '100 m',
    observes: 'A second heat band for temperature.',
    '6-8': 'Another heat band that helps measure temperature.',
    '9-12': 'Second thermal band supporting split-window surface-temperature retrieval.' },
]

// Chapter 2: surface interactions
export const SURFACES = [
  {
    id: 'vegetation', name: 'Healthy vegetation', color: '#4caf6b',
    reflected: 8, absorbed: 5, emitted: 3,
    '6-8': 'Plants soak up red light and bounce back a lot of invisible near-infrared light. In daytime they stay cooler than hot pavement.',
    '9-12': 'Strong red absorption (chlorophyll) and high near-infrared reflectance; generally cooler than pavement in daytime thermal scenes.',
    key: 'Absorbs red, reflects near-infrared strongly.',
  },
  {
    id: 'water', name: 'Water', color: '#3b7fd6',
    reflected: 2, absorbed: 8, emitted: 2,
    '6-8': 'Water absorbs most near-infrared light, so it often looks dark to a satellite. It can stay cooler than pavement.',
    '9-12': 'Absorbs most near-infrared energy (often dark in NIR) and changes temperature slowly relative to pavement.',
    key: 'Absorbs near-infrared: often dark in NIR.',
  },
  {
    id: 'soil', name: 'Soil', color: '#b07a45',
    reflected: 5, absorbed: 5, emitted: 5,
    '6-8': 'Soil can be bright or dark depending on how wet it is and what it is made of.',
    '9-12': 'Reflectance varies with moisture, texture, and composition across visible–SWIR.',
    key: 'Reflectance varies with moisture and texture.',
  },
  {
    id: 'pavement', name: 'Pavement', color: '#6b7280',
    reflected: 3, absorbed: 7, emitted: 8,
    '6-8': 'Pavement soaks up sunlight, gets hot, and gives off heat that thermal bands can detect.',
    '9-12': 'Absorbs incoming sunlight, heats up, and emits strongly in thermal infrared.',
    key: 'Absorbs sunlight, heats up, emits thermal energy.',
  },
]

export const SURFACE_NOTE = 'Landsat can tell surfaces apart because they interact with light differently.'

// Chapter 3: illustrative band tiles
export const BAND_TILES = [
  { band: 2, name: 'Blue', brightness: 0.45, use: 'Useful for coastal and aerosol studies.' },
  { band: 3, name: 'Green', brightness: 0.5, use: 'Helps emphasize vegetation vigor.' },
  { band: 4, name: 'Red', brightness: 0.32, use: 'Vegetation absorbs red light strongly.' },
  { band: 5, name: 'Near-infrared', brightness: 0.82, use: 'Useful for vegetation biomass and shoreline boundaries.' },
  { band: 6, name: 'SWIR 1', brightness: 0.6, use: 'Useful for moisture and fire-related land-surface differences.' },
  { band: 7, name: 'SWIR 2', brightness: 0.5, use: 'Useful for moisture and fire-related land-surface differences.' },
  { band: 10, name: 'Thermal', brightness: 0.66, use: 'Useful for studying emitted thermal energy and surface temperature products.' },
]

// Chapter 4: processing pipeline
export const PIPELINE = [
  { id: 'measure', label: 'Satellite measurement', icon: 'satellite' },
  { id: 'dn', label: 'Digital numbers', icon: 'data' },
  { id: 'cal', label: 'Calibrated data', icon: 'settings' },
  { id: 'product', label: 'Reflectance / temperature', icon: 'spectrum' },
  { id: 'map', label: 'Map or image', icon: 'globe' },
]
export const PIPELINE_TEXT = {
  '6-8': 'Scientists clean up and organize the measurements so they can compare places fairly.',
  '9-12':
    'Landsat data can be calibrated and processed into products such as surface reflectance and surface temperature. Surface reflectance accounts for atmospheric effects so repeated observations can be compared more reliably.',
}
export const ATMOSPHERE_NOTE =
  'Atmospheric scattering and thin clouds can affect observations. Surface-reflectance processing corrects for much of the atmosphere, but not every image is automatically cloud-free.'

// Chapter 5: RGB composite presets (Landsat 8/9)
export const RGB_PRESETS = [
  {
    id: 'natural', label: 'Natural color', r: 4, g: 3, b: 2,
    explain: 'Natural-color images assign red, green, and blue measurements to the matching display channels. The result looks similar to what human eyes see.',
  },
  {
    id: 'colorIr', label: 'Color infrared', r: 5, g: 4, b: 3,
    explain: 'Color-infrared images assign near-infrared data to red. Healthy vegetation often appears red because it reflects strongly in near-infrared wavelengths.',
  },
  {
    id: 'swir', label: 'SWIR false color', r: 7, g: 5, b: 4,
    explain: 'Shortwave-infrared combinations can help reveal moisture, burned areas, and other land-surface differences.',
  },
]
// band → representative display color used by the mixer preview
export const BAND_PREVIEW_COLOR = {
  2: '#3b6fd6', 3: '#3fae5e', 4: '#e0533d', 5: '#b14de0', 6: '#e08a3c', 7: '#a9662b',
}

// Chapter 6: comparison callouts
export const COMPARISON = {
  natural: { label: 'Natural color', bands: '4 · 3 · 2' },
  false: { label: 'Color infrared', bands: '5 · 4 · 3' },
  callouts: [
    { id: 'vegetation', label: 'Vegetation', natural: 'Green', false: 'Bright red / pink',
      text: 'Vegetation reflects strongly in near-infrared, so it appears bright red in a color-infrared image.' },
    { id: 'water', label: 'Water', natural: 'Blue / dark', false: 'Very dark',
      text: 'Water absorbs near-infrared, so it appears very dark in color-infrared.' },
    { id: 'urban', label: 'Urban surface', natural: 'Gray', false: 'Gray / cyan',
      text: 'Built surfaces reflect differently from plants, so cities stand out from vegetation.' },
    { id: 'soil', label: 'Bare soil', natural: 'Brown / tan', false: 'Tan / muted',
      text: 'Bare soil reflectance depends on moisture and composition.' },
  ],
}

// Knowledge check
export const QUIZ = [
  {
    id: 'q1',
    question: 'Which Landsat band is commonly used with red and green bands to create a color-infrared vegetation image?',
    options: ['Band 2: Blue', 'Band 4: Red', 'Band 5: Near-infrared', 'Band 10: Thermal infrared'],
    answer: 2,
    feedback: 'Band 5 (near-infrared) is assigned to red in color-infrared images: healthy vegetation reflects NIR strongly, so it appears red.',
  },
  {
    id: 'q2',
    question: 'In a Landsat 8/9 natural-color image, which bands are usually assigned to the red, green, and blue display channels?',
    options: ['Bands 5, 4, 3', 'Bands 4, 3, 2', 'Bands 7, 5, 4', 'Bands 3, 2, 1'],
    answer: 1,
    feedback: 'Natural color uses Band 4 → red, Band 3 → green, Band 2 → blue, matching what our eyes see.',
  },
  {
    id: 'q3',
    question: 'Why can a false-color image be useful?',
    options: [
      'It makes images look more colorful for fun',
      'It can display wavelengths humans cannot see, helping reveal patterns such as vegetation health, water, fire scars, or moisture',
      'It is always cloud-free',
      'It uses fewer bands than natural color',
    ],
    answer: 1,
    feedback: 'False color assigns invisible wavelengths to visible display colors, revealing patterns our eyes could not see directly.',
  },
]

export const GRADE_LABEL = { '6-8': 'Grades 6–8', '9-12': 'Grades 9–12' }
