// @ts-nocheck
// Spectral band reference data for satellite missions and STELLA field
// instruments, transcribed from the "STELLA Spectral Bands" spreadsheet.
// Wavelengths in nanometers (nm). This powers the Spectral Band Explorer
// (Data & Graphs page): a broad K–12 remote-sensing comparison tool where
// STELLA is one *field instrument* category alongside satellite sensors.

// --- spectral regions -------------------------------------------------------
// Regions align with the chart's view controls. Bands are classified by their
// center wavelength (physical region), independent of the sensor's own label.
export const SPECTRAL_REGIONS = [
  { id: 'visible', label: 'Visible', color: '#4F9DDE', range: [380, 700] },
  { id: 'nir', label: 'Near Infrared', color: '#B14DE0', range: [700, 1000] },
  { id: 'swir', label: 'Shortwave Infrared', color: '#E08A3C', range: [1000, 2500] },
  { id: 'thermal', label: 'Thermal Infrared', color: '#E0533D', range: [2500, 14000] },
]

const regionFor = (centerNm) =>
  centerNm < 700
    ? 'Visible'
    : centerNm < 1000
      ? 'Near Infrared'
      : centerNm < 2500
        ? 'Shortwave Infrared'
        : 'Thermal Infrared'

export const regionMeta = (label) => SPECTRAL_REGIONS.find((r) => r.label === label)
export const regionColor = (label) => regionMeta(label)?.color ?? '#9aa0a6'

const slug = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[()/.]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

// --- band tables (terse rows expanded below) --------------------------------
// Row tuple: [band, colorOrPurpose, minNm, maxNm, centerNm, widthNm, resolutionMeters, resolutionNote]
const DATA = [
  {
    id: 'landsat-7',
    displayName: 'Landsat 7',
    mission: 'Landsat 7',
    instrument: 'ETM+',
    platformType: 'Satellite',
    bands: [
      ['Band 1', 'Blue', 450, 520, 485, 70, 30],
      ['Band 2', 'Green', 520, 600, 560, 80, 30],
      ['Band 3', 'Red', 630, 690, 660, 60, 30],
      ['Band 4', 'Near Infrared (NIR)', 770, 900, 835, 130, 30],
      ['Band 5', 'Shortwave Infrared (SWIR) 1', 1550, 1750, 1650, 200, 30],
      ['Band 6', 'Thermal', 10400, 12500, 11450, 2100, 60, 'resampled to 30 m'],
      ['Band 7', 'Shortwave Infrared (SWIR) 2', 2090, 2350, 2220, 260, 30],
      ['Band 8', 'Panchromatic', 520, 900, 710, 380, 15],
    ],
  },
  {
    id: 'landsat-8-9',
    displayName: 'Landsat 8/9 OLI/TIRS',
    mission: 'Landsat 8/9',
    instrument: 'OLI/TIRS',
    platformType: 'Satellite',
    bands: [
      ['Band 1', 'Coastal aerosol', 430, 450, 440, 20, 30],
      ['Band 2', 'Blue', 450, 510, 480, 60, 30],
      ['Band 3', 'Green', 530, 590, 560, 60, 30],
      ['Band 4', 'Red', 640, 670, 655, 30, 30],
      ['Band 5', 'Near Infrared (NIR)', 850, 880, 865, 30, 30],
      ['Band 6', 'Shortwave Infrared (SWIR) 1', 1570, 1650, 1610, 80, 30],
      ['Band 7', 'Shortwave Infrared (SWIR) 2', 2110, 2290, 2200, 180, 30],
      ['Band 8', 'Panchromatic', 500, 680, 590, 180, 15],
      ['Band 9', 'Cirrus', 1360, 1380, 1370, 20, 30],
      ['Band 10', 'Thermal Infrared (TIRS) 1', 10600, 11190, 10895, 590, 100, 'resampled to 30 m'],
      ['Band 11', 'Thermal Infrared (TIRS) 2', 11500, 12510, 12005, 1010, 100, 'resampled to 30 m'],
    ],
  },
  {
    id: 'sentinel-2a',
    displayName: 'Sentinel-2A MSI',
    mission: 'Sentinel-2A',
    instrument: 'MSI',
    platformType: 'Satellite',
    bands: [
      ['Band 1', 'Aerosol', 433, 533, 443, 20, 60],
      ['Band 2', 'Blue', 457.5, 522.5, 490, 65, 10],
      ['Band 3', 'Green', 542.5, 577.5, 560, 35, 10],
      ['Band 4', 'Red', 650, 680, 665, 30, 10],
      ['Band 5', 'Vegetation red edge', 697.5, 712.5, 705, 15, 20],
      ['Band 6', 'Vegetation red edge', 732.5, 747.5, 740, 15, 20],
      ['Band 7', 'Vegetation red edge', 773, 793, 783, 20, 20],
      ['Band 8', 'NIR', 784.5, 899.5, 842, 115, 10],
      ['Band 8a', 'Narrow NIR', 855, 875, 865, 20, 20],
      ['Band 9', 'Water vapour', 935, 955, 945, 20, 60],
      ['Band 10', 'SWIR / Cirrus', 1360, 1390, 1375, 30, 60],
      ['Band 11', 'SWIR', 1565, 1655, 1610, 90, 20],
      ['Band 12', 'SWIR', 2100, 2280, 2190, 180, 20],
    ],
  },
  {
    id: 'sentinel-2b',
    displayName: 'Sentinel-2B MSI',
    mission: 'Sentinel-2B',
    instrument: 'MSI',
    platformType: 'Satellite',
    bands: [
      ['Band 1', 'Aerosol', 432.2, 452.2, 442.2, 20, 60],
      ['Band 2', 'Blue', 459.8, 524.8, 492.3, 65, 10],
      ['Band 3', 'Green', 541.4, 576.4, 558.9, 35, 10],
      ['Band 4', 'Red', 649.4, 680.4, 664.9, 31, 10],
      ['Band 5', 'Vegetation red edge', 696.3, 711.3, 703.8, 15, 20],
      ['Band 6', 'Vegetation red edge', 732.1, 746.1, 739.1, 14, 20],
      ['Band 7', 'Vegetation red edge', 769.7, 789.7, 779.7, 20, 20],
      ['Band 8', 'NIR', 775.4, 890.4, 832.9, 115, 10],
      ['Band 8a', 'Narrow NIR', 854, 874, 864, 20, 20],
      ['Band 9', 'Water vapour', 933.2, 953.2, 943.2, 20, 60],
      ['Band 10', 'SWIR / Cirrus', 1361.9, 1391.9, 1376.9, 30, 60],
      ['Band 11', 'SWIR', 1563.9, 1656.9, 1610.4, 93, 20],
      ['Band 12', 'SWIR', 2095.2, 2276.2, 2185.7, 181, 20],
    ],
  },
  {
    id: 'noaa-viirs',
    displayName: 'NOAA-20/21 VIIRS',
    mission: 'NOAA-20/21',
    instrument: 'VIIRS',
    platformType: 'Satellite',
    bands: [
      ['M1', 'Ocean Color / Aerosol', 405, 425, 415, 20, 750],
      ['M2', 'Ocean Color / Aerosol', 435, 455, 445, 20, 750],
      ['M3', 'Ocean Color / Aerosol', 480, 500, 490, 20, 750],
      ['M4', 'Ocean Color / Aerosol', 545, 565, 555, 20, 750],
      ['I1', 'Imagery band', 602.5, 677.5, 640, 75, 375],
      ['M5', 'Ocean Color / Aerosol', 662.5, 683.5, 673, 21, 750],
      ['DNB', 'Day/Night Band', 500, 900, 700, 400, 750],
      ['M6', 'Atmospheric Correction', 735.5, 756.5, 746, 21, 750],
      ['I2', 'NDVI', 845.5, 884.5, 865, 39, 375],
      ['M7', 'Ocean Color / Aerosol', 845.5, 884.5, 865, 39, 750],
      ['M8', 'Cloud Particle Size', 1230, 1250, 1240, 20, 750],
      ['M9', 'Cirrus Cloud Cover', 1368, 1388, 1378, 20, 750],
      ['I3', 'Binary Snow Map', 1580, 1640, 1610, 60, 375],
      ['M10', 'Snow Fraction', 1580, 1640, 1610, 60, 750],
      ['M11', 'Clouds', 2225, 2275, 2250, 50, 750],
      ['I4', 'Imagery band / Clouds', 3550, 3930, 3740, 380, 375],
      ['M12', 'Sea Surface Temperature', 3610, 3790, 3700, 180, 750],
      ['M13', 'Sea Surface Temperature / Fires', 3972.5, 4127.4, 4050, 155, 750],
      ['M14', 'Cloud Top Properties', 8400, 8700, 8550, 300, 750],
      ['M15', 'Sea Surface Temperature', 10263, 11263, 10763, 1000, 750],
      ['I5', 'Imagery band / Clouds', 10500, 12400, 11450, 1900, 375],
      ['M16', 'Sea Surface Temperature', 11538, 12488, 12013, 950, 750],
    ],
  },
  {
    id: 'goes-r-abi',
    displayName: 'GOES-R ABI',
    mission: 'GOES-R Series',
    instrument: 'ABI',
    platformType: 'Satellite',
    bands: [
      ['Band 1', 'Blue', 450, 490, 470, 40, 1000],
      ['Band 2', 'Red', 590, 690, 640, 100, 500],
      ['Band 3', 'NIR (Veggie)', 845.5, 884.5, 865, 39, 1000],
      ['Band 4', 'NIR (Cirrus)', 1370.5, 1385.5, 1378, 15, 2000],
      ['Band 5', 'NIR (Snow/Ice)', 1580, 1640, 1610, 60, 1000],
      ['Band 6', 'NIR (Cloud Phase)', 2225, 2275, 2250, 50, 2000],
      ['Band 7', 'IR (SWIR Window)', 3800, 4000, 3900, 200, 2000],
      ['Band 8', 'IR (Upper-level tropospheric water vapor)', 5775, 6605, 6190, 830, 2000],
      ['Band 9', 'IR (Mid-level tropospheric water vapor)', 6750, 7150, 6950, 400, 2000],
      ['Band 10', 'IR (Lower-level tropospheric water vapor)', 7240, 7440, 7340, 200, 2000],
      ['Band 11', 'IR (Cloud-Top Phase)', 8300, 8700, 8500, 400, 2000],
      ['Band 12', 'IR (Ozone)', 9420, 9800, 9610, 380, 2000],
      ['Band 13', 'IR (Clean Longwave Window)', 10100, 10600, 10350, 500, 2000],
      ['Band 14', 'IR (Longwave Window)', 10800, 11600, 11200, 800, 2000],
      ['Band 15', 'IR (Dirty Longwave Window)', 11800, 12800, 12300, 1000, 2000],
      ['Band 16', 'IR (CO2 Longwave)', 13000, 13600, 13300, 600, 2000],
    ],
  },
  {
    id: 'stella-q2',
    displayName: 'STELLA Q-2',
    mission: 'STELLA Q-2',
    instrument: 'Field spectrometer',
    platformType: 'Field Instrument',
    bands: [
      ['Band 1', 'Violet', 400, 420, 410, 20],
      ['Band 2', 'Blue-violet', 425, 445, 435, 20],
      ['Band 3', 'Blue', 450, 470, 460, 20],
      ['Band 4', 'Cyan / blue-green', 475, 495, 485, 20],
      ['Band 5', 'Green', 500, 520, 510, 20],
      ['Band 6', 'Yellow-green', 525, 545, 535, 20],
      ['Band 7', 'Yellow', 550, 570, 560, 20],
      ['Band 8', 'Orange', 575, 595, 585, 20],
      ['Band 9', 'Red-orange', 600, 620, 610, 20],
      ['Band 10', 'Deep red', 635, 655, 645, 20],
      ['Band 11', 'Far red / edge of visibility', 670, 690, 680, 20],
      ['Band 12', 'Just into Near-Infrared (NIR)', 695, 715, 705, 20],
      ['Band 13', 'NIR', 720, 740, 730, 20],
      ['Band 14', 'NIR', 750, 770, 760, 20],
      ['Band 15', 'NIR', 800, 820, 810, 20],
      ['Band 16', 'NIR', 850, 870, 860, 20],
      ['Band 17', 'NIR', 890, 910, 900, 20],
      ['Band 18', 'NIR', 930, 950, 940, 20],
    ],
  },
  {
    id: 'stella-q',
    displayName: 'STELLA Q',
    mission: 'STELLA Q',
    instrument: 'Field spectrometer',
    platformType: 'Field Instrument',
    bands: [
      ['Band 1', 'Blue', 430, 470, 450, 40],
      ['Band 2', 'Cyan / Blue-Green', 480, 520, 500, 40],
      ['Band 3', 'Green', 530, 570, 550, 40],
      ['Band 4', 'Yellow', 550, 590, 570, 40],
      ['Band 5', 'Orange', 580, 620, 600, 40],
      ['Band 6', 'Red', 630, 670, 650, 40],
      ['Band 7', 'NIR (Near infrared)', 600, 620, 610, 20],
      ['Band 8', 'Edge of red, NIR (not visible)', 670, 690, 680, 20],
      ['Band 9', 'Just beyond red, NIR', 720, 740, 730, 20],
      ['Band 10', 'NIR', 750, 770, 760, 20],
      ['Band 11', 'NIR', 800, 820, 810, 20],
      ['Band 12', 'NIR', 850, 870, 860, 20],
    ],
  },
  {
    id: 'stella-1-1',
    displayName: 'STELLA-1.1',
    mission: 'STELLA-1.1',
    instrument: 'Field spectrometer',
    platformType: 'Field Instrument',
    bands: [
      ['Band 1 (VIS)', 'Violet–Blue', 430, 470, 450, 40],
      ['Band 2 (VIS)', 'Blue–Cyan', 480, 520, 500, 40],
      ['Band 3 (VIS)', 'Green', 530, 570, 550, 40],
      ['Band 4 (VIS)', 'Yellow–Green', 550, 590, 570, 40],
      ['Band 5 (VIS)', 'Orange–Yellow', 580, 620, 600, 40],
      ['Band 6 (VIS)', 'Red', 630, 670, 650, 40],
      ['Band 7 (NIR)', 'Orange–Red', 600, 620, 610, 20],
      ['Band 8 (NIR)', 'Far Red', 670, 690, 680, 20],
      ['Band 9 (NIR)', 'Near-Infrared', 720, 740, 730, 20],
      ['Band 10 (NIR)', 'Near-Infrared', 750, 770, 760, 20],
      ['Band 11 (NIR)', 'Near-Infrared', 800, 820, 810, 20],
      ['Band 12 (NIR)', 'Near-Infrared', 850, 870, 860, 20],
    ],
  },
]

// --- normalize --------------------------------------------------------------
export const SPECTRAL_BANDS = DATA.flatMap((inst) =>
  inst.bands.map(([band, purpose, minNm, maxNm, centerNm, widthNm, res, note]) => ({
    id: `${inst.id}-${slug(band)}`,
    instrumentId: inst.id,
    mission: inst.mission,
    instrument: inst.instrument,
    displayName: inst.displayName,
    band,
    colorOrPurpose: purpose,
    minNm,
    maxNm,
    centerNm,
    centerUm: +(centerNm / 1000).toFixed(4),
    widthNm,
    resolutionMeters: inst.platformType === 'Field Instrument' ? null : (res ?? null),
    resolutionNote: note ?? null,
    spectralRegion: regionFor(centerNm),
    platformType: inst.platformType,
  })),
)

// Dropdown / summary metadata, in spreadsheet order, grouped by platform type.
export const INSTRUMENTS = DATA.map((inst) => {
  const bands = SPECTRAL_BANDS.filter((b) => b.instrumentId === inst.id)
  return {
    id: inst.id,
    displayName: inst.displayName,
    platformType: inst.platformType,
    bandCount: bands.length,
    minNm: Math.min(...bands.map((b) => b.minNm)),
    maxNm: Math.max(...bands.map((b) => b.maxNm)),
  }
})

export const getBandsForInstrument = (id) =>
  SPECTRAL_BANDS.filter((b) => b.instrumentId === id)

export const getInstrument = (id) => INSTRUMENTS.find((i) => i.id === id)

export const DEFAULT_INSTRUMENT_ID = 'landsat-8-9'
