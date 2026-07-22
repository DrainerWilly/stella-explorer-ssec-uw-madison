// @ts-nocheck
// Official mission geometry used by NASA Eyes on the Earth. These are the exact
// public NASA/JPL glTF packages served to Eyes, including their authored PBR
// textures and mission-specific hardware. Keeping the URLs at NASA's asset CDN
// avoids shipping stale duplicate models and lets relative .bin/texture files
// resolve from their original package directories.

const EYES_ROOT = 'https://eyes.nasa.gov/assets/static/models'
const EYES_APP = 'https://eyes.nasa.gov/apps/earth/'
const CREDIT = '3D model: NASA/JPL-Caltech, NASA Eyes on the Earth'

const M = (path, note = null, options = {}) => ({
  file: `${EYES_ROOT}/${path}`,
  official: true,
  credit: CREDIT,
  sourceUrl: EYES_APP,
  note,
  ...options,
})

const ISS = (note = null) =>
  M('sc_iss/ISS_stationary.gltf', note, {
    targetSize: 0.2,
  })

export const SATELLITE_MODELS = {
  'landsat-8': M('sc_landsat_8/LandSat8.gltf'),
  'landsat-9': M('sc_landsat_9/Landsat9.gltf'),
  terra: M('sc_terra/Terra.gltf'),
  aqua: M('sc_aqua/Aqua.gltf'),
  aura: M('sc_aura/Aura.gltf'),
  'gpm-core': M('sc_gpm/GPM.gltf'),
  'icesat-2': M('sc_icesatii/ICESat2.gltf'),
  smap: M('sc_smap/SMAP.gltf'),
  swot: M('sc_swot_v2/swot.gltf'),
  pace: M('sc_pace/pace.gltf'),
  'suomi-npp': M('sc_npp/NPP.gltf'),
  'noaa-20': M('sc_noaa_20/noaa20.gltf'),
  'noaa-21': M('sc_noaa_21/noaa21.gltf'),
  'sentinel-6': M('sc_sentinel_6/Sentinel6.gltf'),
  'sentinel-6b': M(
    'sc_sentinel_6/Sentinel6.gltf',
    'Sentinel-6B uses the same official mission design as Sentinel-6 Michael Freilich.',
  ),
  'jason-3': M(
    'sc_ostm/ostm.gltf',
    'NASA Eyes uses the official Ocean Surface Topography Mission spacecraft model for the Jason series.',
  ),
  'grace-fo-1': M('sc_grace_fo/graceFO.gltf'),
  'grace-fo-2': M(
    'sc_grace_fo/graceFO.gltf',
    'Both GRACE-FO spacecraft use the same official NASA Eyes model.',
  ),
  'oco-2': M('sc_oco_2/oco2.gltf'),
  nisar: M('sc_nisar/Nisar.gltf'),
  'prefire-1': M('sc_prefire/prefire.gltf'),
  'prefire-2': M(
    'sc_prefire/prefire.gltf',
    'The PREFIRE CubeSats share the same official spacecraft design.',
  ),
  tempo: M('sc_tempo/tempo.gltf'),
  iss: ISS(),
  ecostress: ISS('ECOSTRESS is mounted on the International Space Station, so its official host model is shown.'),
  emit: ISS('EMIT is mounted on the International Space Station, so its official host model is shown.'),
  'oco-3': ISS('OCO-3 is mounted on the International Space Station, so its official host model is shown.'),
  'cowvr-tempest': ISS(
    'COWVR/TEMPEST are mounted on the International Space Station; the NASA Eyes ISS package includes hosted payload detail.',
  ),
}

// Every CYGNSS observatory uses the official NASA Eyes CYGNSS flight model.
for (const fm of ['01', '02', '03', '04', '05', '07', '08']) {
  SATELLITE_MODELS[`cygnss-fm${fm}`] = M('sc_cygnss/CYGNSS.gltf')
}

export function getSatelliteModel(missionId) {
  return SATELLITE_MODELS[missionId] ?? null
}

export const PRIORITY_MODEL_URLS = [SATELLITE_MODELS.iss.file]
