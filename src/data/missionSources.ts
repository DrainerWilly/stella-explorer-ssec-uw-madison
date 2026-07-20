// @ts-nocheck
// Source and credit metadata for Mission Control.
//
// Two kinds of sources are tracked:
//   1) DATA_SOURCES: the shared services and datasets used across the feature
//      (orbital elements, propagation math, Earth texture).
//   2) MISSION_SOURCES: the official mission page and credit for each mission's
//      description and instrument list.
//
// Nothing here implies endorsement by NASA, NOAA, ESA, USGS, or any agency.

export const RETRIEVAL_DATE = '2026-07-02'

export const DATA_SOURCES = {
  orbitalElements: {
    name: 'CelesTrak GP orbital elements',
    org: 'CelesTrak (Dr. T.S. Kelso)',
    url: 'https://celestrak.org/NORAD/documentation/gp-data-formats.php',
    credit:
      'Orbital elements (GP/TLE) courtesy of CelesTrak. Retrieved by this project’s server, not by your browser.',
  },
  propagation: {
    name: 'satellite.js (SGP4/SDP4)',
    org: 'satellite.js contributors',
    url: 'https://github.com/shashwatak/satellite-js',
    credit:
      'Satellite positions are propagated in your browser with satellite.js using the SGP4/SDP4 model.',
  },
  earthTexture: {
    name: '8K Earth textures + NASA terrain',
    org: 'Solar System Scope (CC BY 4.0) · NASA/GEBCO',
    url: 'https://www.solarsystemscope.com/textures/',
    credit:
      'Earth textures (8K day, night lights, clouds): Solar System Scope (solarsystemscope.com), derived from NASA imagery, CC BY 4.0. Terrain relief from GEBCO/NASA elevation; ocean specular is derived from the day imagery.',
  },
  spacecraftModels: {
    name: 'NASA-3D-Resources spacecraft models',
    org: 'NASA',
    url: 'https://github.com/nasa/NASA-3D-Resources',
    credit:
      'Spacecraft 3D models: NASA (NASA-3D-Resources). Missions without a published NASA model show a clearly labeled representative model.',
  },
}

// Per-mission credits. `descriptionSource` and `instrumentSource` name where the
// mission summary and instrument list were drawn from (official agency pages).
export const MISSION_SOURCES = {
  'landsat-8': {
    org: 'NASA / USGS',
    officialMissionPage: 'https://landsat.gsfc.nasa.gov/satellites/landsat-8/',
    credit: 'Landsat 8: NASA Goddard Space Flight Center and U.S. Geological Survey.',
    descriptionSource: 'https://www.usgs.gov/landsat-missions/landsat-8',
    instrumentSource: 'https://landsat.gsfc.nasa.gov/satellites/landsat-8/spacecraft-instruments/',
    retrievalNote: `Mission details from official NASA/USGS Landsat pages; retrieved ${RETRIEVAL_DATE}.`,
  },
  'landsat-9': {
    org: 'NASA / USGS',
    officialMissionPage: 'https://landsat.gsfc.nasa.gov/satellites/landsat-9/',
    credit: 'Landsat 9: NASA Goddard Space Flight Center and U.S. Geological Survey.',
    descriptionSource: 'https://www.usgs.gov/landsat-missions/landsat-9',
    instrumentSource: 'https://landsat.gsfc.nasa.gov/satellites/landsat-9/spacecraft-instruments/',
    retrievalNote: `Mission details from official NASA/USGS Landsat pages; retrieved ${RETRIEVAL_DATE}.`,
  },
  terra: {
    org: 'NASA',
    officialMissionPage: 'https://terra.nasa.gov/',
    credit: 'Terra: NASA.',
    descriptionSource: 'https://terra.nasa.gov/about',
    instrumentSource: 'https://terra.nasa.gov/about/terra-instruments',
    retrievalNote: `Mission details from the official NASA Terra site; retrieved ${RETRIEVAL_DATE}.`,
  },
  aqua: {
    org: 'NASA',
    officialMissionPage: 'https://aqua.nasa.gov/',
    credit: 'Aqua: NASA.',
    descriptionSource: 'https://www.nasa.gov/mission/aqua/',
    instrumentSource: 'https://aqua.nasa.gov/content/instruments',
    retrievalNote: `Mission details from official NASA Aqua pages; retrieved ${RETRIEVAL_DATE}.`,
  },
  aura: {
    org: 'NASA',
    officialMissionPage: 'https://aura.gsfc.nasa.gov/',
    credit: 'Aura: NASA.',
    descriptionSource: 'https://www.nasa.gov/mission/aura/',
    instrumentSource: 'https://aura.gsfc.nasa.gov/instruments.html',
    retrievalNote: `Mission details from official NASA Aura pages; retrieved ${RETRIEVAL_DATE}.`,
  },
  'gpm-core': {
    org: 'NASA / JAXA',
    officialMissionPage: 'https://gpm.nasa.gov/missions/GPM/core-observatory',
    credit: 'GPM Core Observatory: NASA and JAXA.',
    descriptionSource: 'https://www.nasa.gov/mission/global-precipitation-measurement-mission-gpm/',
    instrumentSource: 'https://gpm.nasa.gov/missions/GPM/core-observatory',
    retrievalNote: `Mission details from official NASA GPM pages; retrieved ${RETRIEVAL_DATE}.`,
  },
  'icesat-2': {
    org: 'NASA',
    officialMissionPage: 'https://icesat-2.gsfc.nasa.gov/',
    credit: 'ICESat-2: NASA.',
    descriptionSource: 'https://www.nasa.gov/mission/icesat-2/',
    instrumentSource: 'https://icesat-2.gsfc.nasa.gov/space-lasers',
    retrievalNote: `Mission details from official NASA ICESat-2 pages; retrieved ${RETRIEVAL_DATE}.`,
  },
  smap: {
    org: 'NASA / JPL',
    officialMissionPage: 'https://smap.jpl.nasa.gov/',
    credit: 'SMAP: NASA Jet Propulsion Laboratory.',
    descriptionSource: 'https://www.nasa.gov/mission/smap/',
    instrumentSource: 'https://smap.jpl.nasa.gov/observatory/instrument/',
    retrievalNote: `Mission details from official NASA/JPL SMAP pages; retrieved ${RETRIEVAL_DATE}.`,
  },
  swot: {
    org: 'NASA / JPL / CNES',
    officialMissionPage: 'https://swot.jpl.nasa.gov/',
    credit: 'SWOT: NASA Jet Propulsion Laboratory and CNES.',
    descriptionSource: 'https://www.nasa.gov/mission/swot/',
    instrumentSource: 'https://swot.jpl.nasa.gov/mission/spacecraft/',
    retrievalNote: `Mission details from official NASA/JPL SWOT pages; retrieved ${RETRIEVAL_DATE}.`,
  },
  pace: {
    org: 'NASA',
    officialMissionPage: 'https://pace.gsfc.nasa.gov/',
    credit: 'PACE: NASA Goddard Space Flight Center.',
    descriptionSource: 'https://www.nasa.gov/mission/pace/',
    instrumentSource: 'https://pace.gsfc.nasa.gov/instruments.html',
    retrievalNote: `Mission details from official NASA PACE pages; retrieved ${RETRIEVAL_DATE}.`,
  },
  'suomi-npp': {
    org: 'NASA / NOAA',
    officialMissionPage: 'https://www.nasa.gov/mission/suomi-npp/',
    credit: 'Suomi NPP: NASA and NOAA.',
    descriptionSource: 'https://www.nasa.gov/mission/suomi-npp/',
    instrumentSource: 'https://www.jpss.noaa.gov/mission_and_instruments.html',
    retrievalNote: `Mission details from official NASA/NOAA JPSS pages; retrieved ${RETRIEVAL_DATE}.`,
  },
  'noaa-20': {
    org: 'NOAA / NASA',
    officialMissionPage: 'https://www.jpss.noaa.gov/',
    credit: 'NOAA-20 (JPSS-1): NOAA and NASA.',
    descriptionSource: 'https://www.nesdis.noaa.gov/our-satellites/currently-flying/joint-polar-satellite-system',
    instrumentSource: 'https://www.jpss.noaa.gov/mission_and_instruments.html',
    retrievalNote: `Mission details from official NOAA/NASA JPSS pages; retrieved ${RETRIEVAL_DATE}.`,
  },
  'sentinel-6': {
    org: 'ESA / NASA / NOAA / EUMETSAT',
    officialMissionPage: 'https://www.jpl.nasa.gov/missions/sentinel-6/',
    credit: 'Sentinel-6 Michael Freilich: ESA, NASA, NOAA, EUMETSAT, and CNES.',
    descriptionSource: 'https://sentinels.copernicus.eu/copernicus/sentinel-6',
    instrumentSource: 'https://www.jpl.nasa.gov/missions/sentinel-6/',
    retrievalNote: `Mission details from official NASA/ESA Sentinel-6 pages; retrieved ${RETRIEVAL_DATE}.`,
  },
  iss: {
    org: 'NASA and international partners',
    officialMissionPage: 'https://www.nasa.gov/international-space-station/',
    credit: 'International Space Station: NASA, Roscosmos, ESA, JAXA, and CSA.',
    descriptionSource: 'https://www.nasa.gov/international-space-station/',
    instrumentSource: 'https://www.nasa.gov/international-space-station/space-station-research-and-technology/',
    retrievalNote: `Platform details from official NASA ISS pages; retrieved ${RETRIEVAL_DATE}.`,
  },
  ecostress: {
    org: 'NASA / JPL',
    officialMissionPage: 'https://ecostress.jpl.nasa.gov/',
    credit: 'ECOSTRESS: NASA Jet Propulsion Laboratory (instrument aboard the ISS).',
    descriptionSource: 'https://www.jpl.nasa.gov/missions/ecostress/',
    instrumentSource: 'https://ecostress.jpl.nasa.gov/mission',
    retrievalNote: `Instrument details from official NASA/JPL ECOSTRESS pages; retrieved ${RETRIEVAL_DATE}.`,
  },
  emit: {
    org: 'NASA / JPL',
    officialMissionPage: 'https://earth.jpl.nasa.gov/emit/',
    credit: 'EMIT: NASA Jet Propulsion Laboratory (instrument aboard the ISS).',
    descriptionSource: 'https://www.jpl.nasa.gov/missions/emit/',
    instrumentSource: 'https://earth.jpl.nasa.gov/emit/instrument/overview/',
    retrievalNote: `Instrument details from official NASA/JPL EMIT pages; retrieved ${RETRIEVAL_DATE}.`,
  },
  'oco-3': {
    org: 'NASA / JPL',
    officialMissionPage: 'https://ocov3.jpl.nasa.gov/',
    credit: 'OCO-3: NASA Jet Propulsion Laboratory (instrument aboard the ISS).',
    descriptionSource: 'https://www.jpl.nasa.gov/missions/orbiting-carbon-observatory-3-oco-3/',
    instrumentSource: 'https://ocov3.jpl.nasa.gov/',
    retrievalNote: `Instrument details from official NASA/JPL OCO-3 pages; retrieved ${RETRIEVAL_DATE}.`,
  },
  'cowvr-tempest': {
    org: 'NASA / JPL',
    officialMissionPage: 'https://www.jpl.nasa.gov/missions/compact-ocean-wind-vector-radiometer-cowvr/',
    credit: 'COWVR/TEMPEST: NASA JPL and U.S. Space Force (instruments aboard the ISS).',
    descriptionSource: 'https://www.jpl.nasa.gov/missions/compact-ocean-wind-vector-radiometer-cowvr/',
    instrumentSource: 'https://weather.ndc.nasa.gov/cowvr/',
    retrievalNote: `Instrument details from official NASA/JPL COWVR pages; retrieved ${RETRIEVAL_DATE}.`,
  },
  'grace-fo': {
    org: 'NASA / JPL / GFZ',
    officialMissionPage: 'https://gracefo.jpl.nasa.gov/',
    credit: 'GRACE-FO: NASA Jet Propulsion Laboratory and GFZ (Germany).',
    descriptionSource: 'https://www.jpl.nasa.gov/missions/gravity-recovery-and-climate-experiment-follow-on-grace-fo/',
    instrumentSource: 'https://gracefo.jpl.nasa.gov/mission/spacecraft/',
    retrievalNote: `Mission details from official NASA/JPL GRACE-FO pages; retrieved ${RETRIEVAL_DATE}.`,
  },
  'jason-3': {
    org: 'NOAA / NASA / CNES / EUMETSAT',
    officialMissionPage: 'https://www.jpl.nasa.gov/missions/jason-3/',
    credit: 'Jason-3: NOAA, NASA, CNES, and EUMETSAT.',
    descriptionSource: 'https://www.nesdis.noaa.gov/jason-3',
    instrumentSource: 'https://www.jpl.nasa.gov/missions/jason-3/',
    retrievalNote: `Mission details from official NOAA/NASA Jason-3 pages; retrieved ${RETRIEVAL_DATE}.`,
  },
  nisar: {
    org: 'NASA / ISRO',
    officialMissionPage: 'https://nisar.jpl.nasa.gov/',
    credit: 'NISAR: NASA Jet Propulsion Laboratory and ISRO.',
    descriptionSource: 'https://www.jpl.nasa.gov/missions/nisar/',
    instrumentSource: 'https://nisar.jpl.nasa.gov/mission/quick-facts/',
    retrievalNote: `Mission details from official NASA/JPL NISAR pages; retrieved ${RETRIEVAL_DATE}.`,
  },
  'noaa-21': {
    org: 'NOAA / NASA',
    officialMissionPage: 'https://www.jpss.noaa.gov/',
    credit: 'NOAA-21 (JPSS-2): NOAA and NASA.',
    descriptionSource: 'https://www.nesdis.noaa.gov/our-satellites/currently-flying/joint-polar-satellite-system',
    instrumentSource: 'https://www.jpss.noaa.gov/mission_and_instruments.html',
    retrievalNote: `Mission details from official NOAA/NASA JPSS pages; retrieved ${RETRIEVAL_DATE}.`,
  },
  'oco-2': {
    org: 'NASA / JPL',
    officialMissionPage: 'https://ocov2.jpl.nasa.gov/',
    credit: 'OCO-2: NASA Jet Propulsion Laboratory.',
    descriptionSource: 'https://www.jpl.nasa.gov/missions/orbiting-carbon-observatory-2-oco-2/',
    instrumentSource: 'https://ocov2.jpl.nasa.gov/',
    retrievalNote: `Mission details from official NASA/JPL OCO-2 pages; retrieved ${RETRIEVAL_DATE}.`,
  },
  'prefire-1': {
    org: 'NASA / University of Wisconsin–Madison',
    officialMissionPage: 'https://science.nasa.gov/mission/prefire/',
    credit: 'PREFIRE: NASA, led by the University of Wisconsin–Madison (JPL manages the mission).',
    descriptionSource: 'https://science.nasa.gov/mission/prefire/',
    instrumentSource: 'https://prefire.ssec.wisc.edu/',
    retrievalNote: `Mission details from official NASA and UW–Madison PREFIRE pages; retrieved ${RETRIEVAL_DATE}.`,
  },
  'prefire-2': {
    org: 'NASA / University of Wisconsin–Madison',
    officialMissionPage: 'https://science.nasa.gov/mission/prefire/',
    credit: 'PREFIRE: NASA, led by the University of Wisconsin–Madison (JPL manages the mission).',
    descriptionSource: 'https://science.nasa.gov/mission/prefire/',
    instrumentSource: 'https://prefire.ssec.wisc.edu/',
    retrievalNote: `Mission details from official NASA and UW–Madison PREFIRE pages; retrieved ${RETRIEVAL_DATE}.`,
  },
  'sentinel-6b': {
    org: 'ESA / NASA / NOAA / EUMETSAT',
    officialMissionPage: 'https://www.jpl.nasa.gov/missions/sentinel-6/',
    credit: 'Sentinel-6B: ESA, NASA, NOAA, EUMETSAT, and CNES.',
    descriptionSource: 'https://sentinels.copernicus.eu/copernicus/sentinel-6',
    instrumentSource: 'https://www.jpl.nasa.gov/missions/sentinel-6/',
    retrievalNote: `Mission details from official NASA/ESA Sentinel-6 pages; retrieved ${RETRIEVAL_DATE}.`,
  },
  tempo: {
    org: 'NASA / Smithsonian Astrophysical Observatory',
    officialMissionPage: 'https://science.nasa.gov/mission/tempo/',
    credit: 'TEMPO: NASA and the Smithsonian Astrophysical Observatory (payload aboard Intelsat 40e).',
    descriptionSource: 'https://tempo.si.edu/',
    instrumentSource: 'https://tempo.si.edu/instrument.html',
    retrievalNote: `Mission details from official NASA and SAO TEMPO pages; retrieved ${RETRIEVAL_DATE}.`,
  },
  cygnss: {
    org: 'NASA / University of Michigan',
    officialMissionPage: 'https://www.nasa.gov/mission/cygnss/',
    credit: 'CYGNSS: NASA, University of Michigan, and Southwest Research Institute.',
    descriptionSource: 'https://clasp-research.engin.umich.edu/missions/cygnss/',
    instrumentSource: 'https://clasp-research.engin.umich.edu/missions/cygnss/',
    retrievalNote: `Mission details from official NASA/University of Michigan CYGNSS pages; retrieved ${RETRIEVAL_DATE}.`,
  },
}

// CYGNSS flight models and the GRACE-FO twins reuse their program's credit.
for (let i = 1; i <= 8; i++) {
  MISSION_SOURCES[`cygnss-fm0${i}`] = MISSION_SOURCES.cygnss
}
MISSION_SOURCES['grace-fo-1'] = MISSION_SOURCES['grace-fo']
MISSION_SOURCES['grace-fo-2'] = MISSION_SOURCES['grace-fo']

export function getMissionSource(id) {
  return MISSION_SOURCES[id] ?? null
}
