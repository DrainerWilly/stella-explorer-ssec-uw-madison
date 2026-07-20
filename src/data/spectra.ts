// @ts-nocheck
// Representative spectral reflectance signatures (percent reflectance vs.
// wavelength in nm). Curves follow the well-established shapes published in
// USGS / ECOSTRESS-style spectral libraries: used here as accurate teaching
// references, not a single field measurement.
//
// Each point: { w: wavelength_nm, r: reflectance_percent }

export const SIGNATURES = {
  vegetation: {
    label: 'Healthy vegetation',
    short: 'Leaf / grass',
    color: '#3fae5e',
    points: [
      { w: 450, r: 4 },
      { w: 500, r: 6 },
      { w: 550, r: 13 }, // green peak (chlorophyll)
      { w: 600, r: 9 },
      { w: 650, r: 5 }, // red chlorophyll absorption
      { w: 700, r: 22 }, // red edge
      { w: 750, r: 46 },
      { w: 800, r: 49 },
      { w: 865, r: 50 }, // NIR plateau (Landsat band 5)
      { w: 950, r: 47 },
      { w: 1100, r: 45 },
      { w: 1300, r: 38 },
      { w: 1500, r: 24 }, // leaf-water absorption
      { w: 1609, r: 27 }, // SWIR-1 (Landsat band 6)
      { w: 2000, r: 16 },
      { w: 2201, r: 14 }, // SWIR-2 (Landsat band 7)
    ],
  },
  soil: {
    label: 'Dry bare soil',
    short: 'Soil',
    color: '#b07a45',
    points: [
      { w: 450, r: 9 },
      { w: 500, r: 12 },
      { w: 550, r: 15 },
      { w: 600, r: 18 },
      { w: 650, r: 21 },
      { w: 700, r: 24 },
      { w: 750, r: 27 },
      { w: 800, r: 29 },
      { w: 865, r: 31 },
      { w: 950, r: 33 },
      { w: 1100, r: 35 },
      { w: 1300, r: 36 },
      { w: 1500, r: 34 },
      { w: 1609, r: 35 },
      { w: 2000, r: 30 },
      { w: 2201, r: 28 },
    ],
  },
  water: {
    label: 'Clear water',
    short: 'Water',
    color: '#3b7fd6',
    points: [
      { w: 450, r: 6 },
      { w: 500, r: 6 },
      { w: 550, r: 5 },
      { w: 600, r: 4 },
      { w: 650, r: 3 },
      { w: 700, r: 2 },
      { w: 750, r: 1 },
      { w: 800, r: 1 },
      { w: 865, r: 1 }, // water absorbs almost all NIR
      { w: 950, r: 0 },
      { w: 1100, r: 0 },
      { w: 1300, r: 0 },
      { w: 1500, r: 0 },
      { w: 1609, r: 0 },
      { w: 2000, r: 0 },
      { w: 2201, r: 0 },
    ],
  },
  pavement: {
    label: 'Pavement / concrete',
    short: 'Pavement',
    color: '#8a8f96',
    points: [
      { w: 450, r: 14 },
      { w: 500, r: 16 },
      { w: 550, r: 18 },
      { w: 600, r: 19 },
      { w: 650, r: 20 },
      { w: 700, r: 21 },
      { w: 750, r: 22 },
      { w: 800, r: 22 },
      { w: 865, r: 23 }, // fairly flat: no red edge, no NIR jump
      { w: 950, r: 23 },
      { w: 1100, r: 24 },
      { w: 1300, r: 24 },
      { w: 1500, r: 23 },
      { w: 1609, r: 23 },
      { w: 2000, r: 22 },
      { w: 2201, r: 21 },
    ],
  },
}

// STELLA-Q2 style channels. The DIY spectrometer (NASA STELLA) uses an
// AMS AS7341 11-channel sensor for the visible range plus a dedicated NIR
// photodiode: these are the wavelengths students actually read in the field.
export const STELLA_CHANNELS = [
  { w: 415, band: 'Violet', color: '#7d5bd6' },
  { w: 445, band: 'Blue', color: '#4a6fe0' },
  { w: 480, band: 'Blue-cyan', color: '#3f9bd6' },
  { w: 515, band: 'Cyan-green', color: '#3fbf9b' },
  { w: 555, band: 'Green', color: '#46c25a' },
  { w: 590, band: 'Yellow', color: '#d6c23f' },
  { w: 630, band: 'Orange', color: '#e08a3f' },
  { w: 680, band: 'Red', color: '#e0533d' },
  { w: 910, band: 'Near-infrared', color: '#a14de0' },
]

// Visible-light cutoff used by the "what your eyes see" vs "what satellites
// see" toggle. Wavelengths above this are invisible to the human eye.
export const VISIBLE_MAX_NM = 700

// Helper: NDVI from red & NIR reflectance, the workhorse vegetation index.
export function ndvi(redPct, nirPct) {
  const red = redPct / 100
  const nir = nirPct / 100
  if (nir + red === 0) return 0
  return (nir - red) / (nir + red)
}
