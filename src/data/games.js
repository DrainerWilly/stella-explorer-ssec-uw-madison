// Educational games catalog + question data for the Games section.
// Content is factual, K-12-oriented science: remote sensing spectral signatures,
// orbit types, the electromagnetic spectrum, and NDVI.

// Pastel accent hexes (mirror tailwind theme) used as glows/tints.
export const GAME_ACCENT = {
  pink: '#F7BFC4',
  yellow: '#FFE2AC',
  lavender: '#D8D2FF',
  cardmint: '#BDEFD8',
  blue: '#CDEBFF',
  coral: '#F7A7A7',
}

export const GAMES = [
  {
    id: 'spectral-detective',
    title: 'Spectral Detective',
    tagline: 'Identify surfaces from their light fingerprint',
    description:
      'Every surface reflects sunlight in its own pattern across the spectrum. Read the reflectance curve and name the surface — just like a satellite scientist.',
    icon: 'spectrum',
    color: 'blue',
    category: 'Remote Sensing',
    difficulty: 'Medium',
    minutes: 5,
  },
  {
    id: 'orbit-architect',
    title: 'Orbit Architect',
    tagline: 'Match each mission to the right orbit',
    description:
      'Different science goals need different orbits. Read the mission brief and choose the orbit that gets the job done.',
    icon: 'orbit',
    color: 'lavender',
    category: 'Orbits & Space',
    difficulty: 'Medium',
    minutes: 5,
  },
  {
    id: 'signal-sort',
    title: 'Signal Sort',
    tagline: 'Put the electromagnetic spectrum in order',
    description:
      'Radio to gamma rays — order the bands of light from the longest wavelength to the shortest and learn what each one reveals about Earth.',
    icon: 'wave',
    color: 'coral',
    category: 'EM Spectrum',
    difficulty: 'Easy',
    minutes: 4,
  },
  {
    id: 'ndvi-ranger',
    title: 'NDVI Ranger',
    tagline: 'Tune the bands to reveal plant health',
    description:
      'Satellites measure plant health with red and near-infrared light. Adjust the reflectance to hit each vegetation target and master the NDVI formula.',
    icon: 'leaf',
    color: 'cardmint',
    category: 'Vegetation',
    difficulty: 'Easy',
    minutes: 4,
  },
]

export function getGame(id) {
  return GAMES.find((g) => g.id === id) || null
}

// --- Spectral Detective ------------------------------------------------------
// Reflectance (0-1) at six representative bands. Order:
//   Blue 480, Green 560, Red 660, NIR 840, SWIR1 1610, SWIR2 2200 (nm)
export const SPECTRAL_BANDS = [
  { label: 'Blue', nm: 480 },
  { label: 'Green', nm: 560 },
  { label: 'Red', nm: 660 },
  { label: 'NIR', nm: 840 },
  { label: 'SWIR1', nm: 1610 },
  { label: 'SWIR2', nm: 2200 },
]

export const SPECTRAL_SURFACES = [
  {
    id: 'vegetation',
    name: 'Healthy vegetation',
    refl: [0.04, 0.1, 0.04, 0.5, 0.24, 0.12],
    tell: 'The green bump, deep red dip, and huge jump into the near-infrared (the “red edge”) are the signature of healthy leaves.',
  },
  {
    id: 'water',
    name: 'Open water',
    refl: [0.06, 0.05, 0.03, 0.012, 0.006, 0.005],
    tell: 'Water absorbs almost all near-infrared and shortwave light, so its curve falls to nearly zero past the red band.',
  },
  {
    id: 'soil',
    name: 'Bare soil',
    refl: [0.1, 0.14, 0.18, 0.26, 0.3, 0.25],
    tell: 'Soil reflectance rises steadily from blue toward the infrared with no red edge — a smooth, gently climbing curve.',
  },
  {
    id: 'snow',
    name: 'Snow & ice',
    refl: [0.92, 0.9, 0.87, 0.72, 0.08, 0.04],
    tell: 'Snow is dazzlingly bright in visible light but drops sharply in the shortwave infrared — that contrast is how satellites map it.',
  },
  {
    id: 'dry-veg',
    name: 'Dry / dead vegetation',
    refl: [0.09, 0.15, 0.18, 0.4, 0.36, 0.26],
    tell: 'Dry plants still reflect some near-infrared but have lost the deep red dip of healthy leaves, so the red edge is weak.',
  },
  {
    id: 'urban',
    name: 'Asphalt / urban',
    refl: [0.1, 0.11, 0.12, 0.13, 0.14, 0.12],
    tell: 'Built surfaces reflect a low, nearly flat amount across all bands — no bumps, no red edge.',
  },
]

// --- Orbit Architect ---------------------------------------------------------
export const ORBIT_TYPES = [
  { id: 'sso', name: 'Sun-synchronous orbit', short: 'Sun-synchronous LEO' },
  { id: 'geo', name: 'Geostationary orbit', short: 'Geostationary (GEO)' },
  { id: 'polar', name: 'Polar orbit', short: 'Polar LEO' },
  { id: 'inclined-leo', name: 'Inclined low Earth orbit', short: 'Inclined LEO' },
  { id: 'molniya', name: 'Highly elliptical orbit', short: 'Highly elliptical' },
]

export const ORBIT_QUESTIONS = [
  {
    brief:
      'Image the same location at the same local sun-time every day, so lighting stays consistent for comparing images over the years.',
    answer: 'sso',
    explain:
      'A sun-synchronous orbit is tuned so the satellite crosses each latitude at the same local solar time — perfect for consistent land imaging (Landsat, Terra).',
  },
  {
    brief:
      'Watch a developing hurricane continuously, keeping the same face of Earth in view all day and night.',
    answer: 'geo',
    explain:
      'A geostationary orbit (~35,786 km) circles Earth once per day, so the satellite appears fixed over one spot — ideal for weather watch (GOES).',
  },
  {
    brief:
      'Map sea ice and get complete global coverage as the planet rotates beneath the spacecraft.',
    answer: 'polar',
    explain:
      'A near-polar orbit passes close to both poles; as Earth turns underneath, the satellite eventually sees the entire surface.',
  },
  {
    brief:
      'Measure sea-surface height along repeating ground tracks, revisiting the same oceans every few days without needing polar coverage.',
    answer: 'inclined-leo',
    explain:
      'An inclined (non-polar) low Earth orbit trades polar coverage for a tighter revisit of mid-latitude oceans — the choice for altimetry missions like Jason.',
  },
  {
    brief:
      'Give long, lingering coverage over far-northern latitudes, where a geostationary satellite sits too low on the horizon.',
    answer: 'molniya',
    explain:
      'A highly elliptical (Molniya-type) orbit moves slowly near its far point (apogee), dwelling for hours over high latitudes that GEO can’t serve well.',
  },
]

// --- Signal Sort (EM spectrum, longest → shortest wavelength) -----------------
export const EM_REGIONS = [
  {
    id: 'radio',
    name: 'Radio',
    fact: 'Longest waves. Satellites use radio to send their data down to ground stations and for radar altimetry.',
  },
  {
    id: 'microwave',
    name: 'Microwave',
    fact: 'Passes through clouds and rain, so radar and microwave sensors can see the surface day or night, in any weather.',
  },
  {
    id: 'infrared',
    name: 'Infrared',
    fact: 'Carries heat. Thermal-infrared sensors map surface temperature; near-infrared reveals plant health.',
  },
  {
    id: 'visible',
    name: 'Visible',
    fact: 'The narrow band our eyes see. Used for natural-color imagery of Earth.',
  },
  {
    id: 'ultraviolet',
    name: 'Ultraviolet',
    fact: 'Higher energy than visible light. Used to study ozone and atmospheric gases.',
  },
  {
    id: 'xray',
    name: 'X-ray',
    fact: 'Very short, high-energy waves — mostly used to observe the Sun and the high-energy universe.',
  },
]

// --- NDVI Ranger -------------------------------------------------------------
// NDVI = (NIR - Red) / (NIR + Red). Targets the player must hit by tuning bands.
export const NDVI_TARGETS = [
  {
    id: 'water',
    label: 'Open water',
    min: -1,
    max: 0,
    hint: 'Water reflects a little red but almost no near-infrared, giving a negative NDVI.',
  },
  {
    id: 'soil',
    label: 'Bare soil',
    min: 0.05,
    max: 0.2,
    hint: 'Bare ground reflects red and NIR fairly evenly, so NDVI stays low and positive.',
  },
  {
    id: 'sparse',
    label: 'Grass & shrubs',
    min: 0.25,
    max: 0.5,
    hint: 'Some leaves means NIR climbs above red — a moderate NDVI.',
  },
  {
    id: 'healthy',
    label: 'Healthy crops',
    min: 0.55,
    max: 0.8,
    hint: 'Lots of healthy leaves reflect strong NIR and absorb red, pushing NDVI high.',
  },
  {
    id: 'forest',
    label: 'Dense forest',
    min: 0.8,
    max: 1,
    hint: 'A thick canopy reflects near-infrared powerfully while soaking up red light — the highest NDVI.',
  },
]

export function ndvi(red, nir) {
  const denom = nir + red
  if (denom <= 0) return 0
  return (nir - red) / denom
}
