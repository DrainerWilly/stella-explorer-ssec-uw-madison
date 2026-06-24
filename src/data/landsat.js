// Landsat 8 & 9 OLI/TIRS band reference data.
// Center wavelengths and ranges are the published USGS spec for the
// Operational Land Imager (OLI) and Thermal Infrared Sensor (TIRS).
// Wavelengths in nanometers (nm). Landsat 8 and 9 carry near-identical sensors.

export const LANDSAT_BANDS = [
  { band: 1, name: 'Coastal aerosol', center: 443, range: [430, 450], group: 'visible', swatch: '#7fb2e6' },
  { band: 2, name: 'Blue', center: 482, range: [450, 510], group: 'visible', swatch: '#4a78d6' },
  { band: 3, name: 'Green', center: 561, range: [530, 590], group: 'visible', swatch: '#4caf6b' },
  { band: 4, name: 'Red', center: 655, range: [640, 670], group: 'visible', swatch: '#e0533d' },
  { band: 5, name: 'NIR', center: 865, range: [850, 880], group: 'infrared', swatch: '#b14de0' },
  { band: 6, name: 'SWIR-1', center: 1609, range: [1570, 1650], group: 'infrared', swatch: '#d68b3c' },
  { band: 7, name: 'SWIR-2', center: 2201, range: [2110, 2290], group: 'infrared', swatch: '#a9662b' },
  { band: 8, name: 'Panchromatic', center: 590, range: [500, 680], group: 'visible', swatch: '#9aa0a6' },
  { band: 9, name: 'Cirrus', center: 1373, range: [1360, 1380], group: 'infrared', swatch: '#c9d1d9' },
  { band: 10, name: 'TIRS-1 (thermal)', center: 10895, range: [10600, 11190], group: 'thermal', swatch: '#e06b6b' },
  { band: 11, name: 'TIRS-2 (thermal)', center: 12005, range: [11500, 12510], group: 'thermal', swatch: '#c94f4f' },
]

// The reflective bands STELLA-style activities compare most often.
export const LANDSAT_REFLECTIVE = LANDSAT_BANDS.filter((b) =>
  ['Coastal aerosol', 'Blue', 'Green', 'Red', 'NIR', 'SWIR-1', 'SWIR-2'].includes(b.name),
)

export const LANDSAT_FACTS = {
  l8Launch: '2013',
  l9Launch: '2021',
  revisit: '8 days combined',
  resolution: '30 m (reflective bands)',
}
