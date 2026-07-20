// @ts-nocheck
// Spacecraft 3D models shown in the mission panel when a satellite is selected.
//
// All .glb files are official NASA models downloaded from NASA's public
// NASA-3D-Resources repository (github.com/nasa/NASA-3D-Resources), the same
// spacecraft NASA's own visualizations depict. NASA-produced models are U.S.
// government works; credit is given and no NASA endorsement is implied.
//
// Where NASA has not published a model for a specific spacecraft, we either
// show the model of its design twin / host platform (disclosed in `note`) or
// fall back to a clearly-labeled stylized representative model (file: null).

const REPO = 'https://github.com/nasa/NASA-3D-Resources'
const CREDIT = 'Model: NASA (NASA-3D-Resources)'

const M = (file, note = null) => ({
  file: file ? `assets/models/${file}` : null,
  official: Boolean(file),
  credit: file ? CREDIT : 'Stylized representative model (not a NASA model)',
  sourceUrl: REPO,
  note,
})

const REPRESENTATIVE_NOTE =
  'NASA has not published a 3D model of this spacecraft in NASA-3D-Resources yet, so a stylized representative model is shown.'

export const SATELLITE_MODELS = {
  'landsat-8': M('landsat-8.glb'),
  'landsat-9': M(
    'landsat-8.glb',
    'Landsat 9 shares the Landsat 8 spacecraft design, so the official Landsat 8 model is shown.',
  ),
  terra: M('terra.glb'),
  aqua: M('aqua.glb'),
  aura: M('aura.glb'),
  'gpm-core': M('gpm.glb'),
  'icesat-2': M('icesat-2.glb'),
  'suomi-npp': M('suomi-npp.glb'),
  'noaa-20': M(
    'suomi-npp.glb',
    'NOAA-20 shares the JPSS-series spacecraft design, so the official Suomi NPP model is shown.',
  ),
  'noaa-21': M(
    'suomi-npp.glb',
    'NOAA-21 shares the JPSS-series spacecraft design, so the official Suomi NPP model is shown.',
  ),
  'sentinel-6': M('sentinel-6.glb'),
  'sentinel-6b': M('sentinel-6.glb', 'Sentinel-6B is the twin of Sentinel-6 Michael Freilich.'),
  'jason-3': M(
    'jason-2.glb',
    'Jason-3 continues the Jason altimetry series, so the official OSTM/Jason-2 model is shown.',
  ),
  'grace-fo-1': M(
    'grace.glb',
    'GRACE-FO follows the original GRACE twin-satellite design, so the official GRACE model is shown.',
  ),
  'grace-fo-2': M(
    'grace.glb',
    'GRACE-FO follows the original GRACE twin-satellite design, so the official GRACE model is shown.',
  ),
  'oco-2': M('oco-2.glb'),
  iss: M('iss.glb'),
  ecostress: M('iss.glb', 'ECOSTRESS is an instrument aboard the ISS, so the host platform is shown.'),
  emit: M('iss.glb', 'EMIT is an instrument aboard the ISS, so the host platform is shown.'),
  'oco-3': M('iss.glb', 'OCO-3 is an instrument aboard the ISS, so the host platform is shown.'),
  'cowvr-tempest': M(
    'iss.glb',
    'COWVR/TEMPEST are instruments aboard the ISS, so the host platform is shown.',
  ),
  // Missions without a published NASA model → representative fallback.
  smap: M(null, REPRESENTATIVE_NOTE),
  swot: M(null, REPRESENTATIVE_NOTE),
  pace: M(null, REPRESENTATIVE_NOTE),
  nisar: M(null, REPRESENTATIVE_NOTE),
  'prefire-1': M(null, REPRESENTATIVE_NOTE),
  'prefire-2': M(null, REPRESENTATIVE_NOTE),
  tempo: M(
    'tempo.glb',
    'TEMPO rides on the commercial Intelsat 40e satellite, a Maxar/SSL-1300-class comms bus, shown here.',
  ),
}

// All CYGNSS flight models share the official CYGNSS model.
for (const fm of ['01', '02', '03', '04', '05', '07', '08']) {
  SATELLITE_MODELS[`cygnss-fm${fm}`] = M('cygnss.glb')
}

export function getSatelliteModel(missionId) {
  return SATELLITE_MODELS[missionId] ?? M(null, REPRESENTATIVE_NOTE)
}
