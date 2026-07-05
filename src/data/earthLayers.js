// Science-layer registry for the Mission Control globe.
//
// Only ONE layer is active today: the base Earth texture. Everything else is a
// metadata placeholder describing a layer that could be added later. Placeholder
// layers are marked `available: false` and must never render as if they were on.
//
// When real layers are added, NASA GIBS is the intended source — but only after
// verifying each layer's identifier, available dates, legend, and usage terms:
// https://www.earthdata.nasa.gov/engage/open-data-services-software/earthdata-developer-portal/gibs-api

export const BASE_EARTH_LAYER = {
  id: 'base-earth',
  label: 'Earth texture',
  available: true,
  active: true,
  // Loaded lazily by EarthGlobe; served from /public. If the file is missing or
  // fails to decode, the globe falls back to a clean procedural material.
  file: 'assets/nasa/blue-marble.jpg',
  source: 'NASA Earth Observatory, Blue Marble: Next Generation',
  sourceUrl: 'https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/',
  credit: 'Earth texture: NASA Earth Observatory, Blue Marble: Next Generation.',
}

// Future layers — descriptive placeholders only. `available: false` everywhere.
export const FUTURE_LAYERS = [
  { id: 'natural-color', label: 'Natural-color imagery', available: false, plannedSource: 'NASA GIBS' },
  { id: 'cloud-cover', label: 'Cloud cover', available: false, plannedSource: 'NASA GIBS' },
  { id: 'precipitation', label: 'Precipitation', available: false, plannedSource: 'NASA GIBS / IMERG' },
  { id: 'sea-surface-temp', label: 'Sea-surface temperature', available: false, plannedSource: 'NASA GIBS' },
  { id: 'vegetation', label: 'Vegetation (NDVI)', available: false, plannedSource: 'NASA GIBS' },
  { id: 'wildfire-smoke', label: 'Wildfire & smoke', available: false, plannedSource: 'NASA GIBS / FIRMS' },
  { id: 'sea-ice', label: 'Sea ice', available: false, plannedSource: 'NASA GIBS' },
  { id: 'carbon-dioxide', label: 'Carbon dioxide', available: false, plannedSource: 'NASA GIBS / OCO' },
]

export const EARTH_LAYERS = [BASE_EARTH_LAYER, ...FUTURE_LAYERS]

export const SCIENCE_LAYERS_NOTE = 'Science layers coming later.'
