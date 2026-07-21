// @ts-nocheck
// Curated catalog of Earth-observing missions shown in Mission Control.
//
// This is a scalable STARTING collection, not a complete list of every
// Earth-observing satellite ever launched. Add more entries over time.
//
// Each entry is backed by official mission sources (see missionSources.js).
// `expectedObjectName` and `noradId` were verified against CelesTrak's GP
// catalog on 2026-07-02 and are used by the orbit service to fetch and
// validate the correct object (some names, e.g. "PACE", are shared by more
// than one object, so the NORAD id disambiguates).
//
// `markerColor` mirrors the mission's category color (see missionCategories.js)
// so the 3D markers and catalog stay visually consistent.

import { categoryColor } from './missionCategories'

const c = categoryColor

const RAW_MISSIONS = [
  {
    id: 'landsat-8',
    displayName: 'Landsat 8',
    expectedObjectName: 'LANDSAT 8',
    noradId: 39084,
    category: 'Land',
    agency: 'NASA / USGS',
    orbitType: 'Sun-synchronous low Earth orbit (~705 km)',
    launchYear: 2013,
    missionPageUrl: 'https://landsat.gsfc.nasa.gov/satellites/landsat-8/',
    sourceUrl: 'https://www.usgs.gov/landsat-missions/landsat-8',
    shortDescription:
      'Images Earth’s land surface in visible, infrared, and thermal light on a 16-day repeat cycle.',
    longDescription:
      'Landsat 8 continues the longest continuous record of Earth’s land surface from space. Working with Landsat 9, it revisits every location on Earth about every 8 days, supporting studies of agriculture, forests, water use, and urban growth.',
    instruments: [
      'Operational Land Imager (OLI)',
      'Thermal Infrared Sensor (TIRS)',
    ],
    observes: ['Land cover', 'Vegetation', 'Surface water', 'Land surface temperature'],
    markerColor: c('Land'),
    featured: true,
    enabled: true,
  },
  {
    id: 'landsat-9',
    displayName: 'Landsat 9',
    expectedObjectName: 'LANDSAT 9',
    noradId: 49260,
    category: 'Land',
    agency: 'NASA / USGS',
    orbitType: 'Sun-synchronous low Earth orbit (~705 km)',
    launchYear: 2021,
    missionPageUrl: 'https://landsat.gsfc.nasa.gov/satellites/landsat-9/',
    sourceUrl: 'https://www.usgs.gov/landsat-missions/landsat-9',
    shortDescription:
      'The newest Landsat, extending a 50+ year record of moderate-resolution land imaging.',
    longDescription:
      'Landsat 9 flies 8 days out of phase with Landsat 8 so that, together, they image the entire planet roughly every 8 days. Its improved instruments capture more shades of brightness, helping scientists detect subtle changes in land and coastal waters.',
    instruments: [
      'Operational Land Imager 2 (OLI-2)',
      'Thermal Infrared Sensor 2 (TIRS-2)',
    ],
    observes: ['Land cover', 'Vegetation health', 'Coastal water', 'Surface temperature'],
    markerColor: c('Land'),
    featured: true,
    enabled: true,
  },
  {
    id: 'terra',
    displayName: 'Terra',
    expectedObjectName: 'TERRA',
    noradId: 25994,
    category: 'Land',
    agency: 'NASA',
    orbitType: 'Sun-synchronous low Earth orbit (~705 km), morning crossing',
    launchYear: 1999,
    missionPageUrl: 'https://terra.nasa.gov/',
    sourceUrl: 'https://terra.nasa.gov/about',
    shortDescription:
      'A flagship observatory carrying five instruments that view land, atmosphere, and energy together.',
    longDescription:
      'Terra crosses the equator in the morning and carries five instruments that observe the land surface, clouds, aerosols, and Earth’s energy budget at the same time. Its MODIS instrument produces daily global views used across many fields of Earth science.',
    instruments: ['MODIS', 'ASTER', 'CERES', 'MISR', 'MOPITT'],
    observes: ['Land cover', 'Clouds & aerosols', 'Wildfires', 'Energy budget'],
    markerColor: c('Land'),
    featured: true,
    enabled: true,
  },
  {
    id: 'aqua',
    displayName: 'Aqua',
    expectedObjectName: 'AQUA',
    noradId: 27424,
    category: 'Water and Oceans',
    agency: 'NASA',
    orbitType: 'Sun-synchronous low Earth orbit (~705 km), afternoon crossing',
    launchYear: 2002,
    missionPageUrl: 'https://aqua.nasa.gov/',
    sourceUrl: 'https://www.nasa.gov/mission/aqua/',
    shortDescription:
      'Focuses on Earth’s water cycle: evaporation, clouds, precipitation, sea ice, and ocean.',
    longDescription:
      'Aqua crosses the equator in the afternoon and gathers information about Earth’s water in all its forms. Its instruments measure water vapor, clouds, precipitation, sea-surface temperature, and sea ice, complementing Terra’s morning observations.',
    instruments: ['MODIS', 'AIRS', 'AMSU-A', 'CERES'],
    observes: ['Water vapor', 'Clouds', 'Sea-surface temperature', 'Sea ice'],
    markerColor: c('Water and Oceans'),
    featured: false,
    enabled: true,
  },
  {
    id: 'aura',
    displayName: 'Aura',
    expectedObjectName: 'AURA',
    noradId: 28376,
    category: 'Atmosphere',
    agency: 'NASA',
    orbitType: 'Sun-synchronous low Earth orbit (~705 km)',
    launchYear: 2004,
    missionPageUrl: 'https://aura.gsfc.nasa.gov/',
    sourceUrl: 'https://www.nasa.gov/mission/aura/',
    shortDescription:
      'Studies the chemistry of Earth’s atmosphere, including ozone and air quality.',
    longDescription:
      'Aura measures gases and particles in the atmosphere to answer questions about the ozone layer, air quality, and climate. Its instruments track how pollutants and ozone change over time and move around the globe.',
    instruments: ['Ozone Monitoring Instrument (OMI)', 'Microwave Limb Sounder (MLS)'],
    observes: ['Ozone', 'Air quality', 'Atmospheric gases', 'Aerosols'],
    markerColor: c('Atmosphere'),
    featured: false,
    enabled: true,
  },
  {
    id: 'gpm-core',
    displayName: 'GPM Core Observatory',
    expectedObjectName: 'GPM-CORE',
    noradId: 39574,
    category: 'Weather and Precipitation',
    agency: 'NASA / JAXA',
    orbitType: 'Non-Sun-synchronous low Earth orbit (~407 km), 65° inclination',
    launchYear: 2014,
    missionPageUrl: 'https://gpm.nasa.gov/missions/GPM/core-observatory',
    sourceUrl: 'https://www.nasa.gov/mission/global-precipitation-measurement-mission-gpm/',
    shortDescription:
      'Anchors a global network measuring rain and snow, from the tropics toward the poles.',
    longDescription:
      'The GPM Core Observatory carries advanced radar and a microwave imager that measure the size and intensity of rain and snow. Its tilted orbit lets it sample precipitation across most of the populated world and calibrate a fleet of partner satellites.',
    instruments: [
      'GPM Microwave Imager (GMI)',
      'Dual-frequency Precipitation Radar (DPR)',
    ],
    observes: ['Rainfall', 'Snowfall', 'Storm structure', 'Precipitation intensity'],
    markerColor: c('Weather and Precipitation'),
    featured: true,
    enabled: true,
  },
  {
    id: 'icesat-2',
    displayName: 'ICESat-2',
    expectedObjectName: 'ICESAT-2',
    noradId: 43613,
    category: 'Ice and Elevation',
    agency: 'NASA',
    orbitType: 'Near-polar low Earth orbit (~496 km)',
    launchYear: 2018,
    missionPageUrl: 'https://icesat-2.gsfc.nasa.gov/',
    sourceUrl: 'https://www.nasa.gov/mission/icesat-2/',
    shortDescription:
      'Uses a laser altimeter to measure the height of ice, land, and vegetation with great precision.',
    longDescription:
      'ICESat-2 fires a green laser thousands of times per second and times how long the light takes to return. From that it measures the elevation of ice sheets, sea ice thickness, land topography, and even the height of forest canopies.',
    instruments: ['Advanced Topographic Laser Altimeter System (ATLAS)'],
    observes: ['Ice-sheet elevation', 'Sea-ice thickness', 'Land elevation', 'Forest canopy height'],
    markerColor: c('Ice and Elevation'),
    featured: true,
    enabled: true,
  },
  {
    id: 'smap',
    displayName: 'SMAP',
    expectedObjectName: 'SMAP',
    noradId: 40376,
    category: 'Land',
    agency: 'NASA',
    orbitType: 'Sun-synchronous low Earth orbit (~685 km)',
    launchYear: 2015,
    missionPageUrl: 'https://smap.jpl.nasa.gov/',
    sourceUrl: 'https://www.nasa.gov/mission/smap/',
    shortDescription:
      'Maps the moisture in the top layer of soil and whether the ground is frozen or thawed.',
    longDescription:
      'SMAP (Soil Moisture Active Passive) measures how much water is in the top few centimeters of soil across the globe every 2–3 days. Soil moisture links the water, energy, and carbon cycles and helps with drought monitoring and weather forecasting.',
    instruments: ['L-band radiometer'],
    observes: ['Soil moisture', 'Freeze/thaw state', 'Drought conditions'],
    markerColor: c('Land'),
    featured: false,
    enabled: true,
  },
  {
    id: 'swot',
    displayName: 'SWOT',
    expectedObjectName: 'SWOT',
    noradId: 54754,
    category: 'Water and Oceans',
    agency: 'NASA / CNES',
    orbitType: 'Low Earth orbit (~890 km), 77.6° inclination',
    launchYear: 2022,
    missionPageUrl: 'https://swot.jpl.nasa.gov/',
    sourceUrl: 'https://www.nasa.gov/mission/swot/',
    shortDescription:
      'Surveys the height of nearly all of Earth’s surface water: oceans, lakes, and rivers.',
    longDescription:
      'SWOT (Surface Water and Ocean Topography) uses a wide-swath radar interferometer to measure the elevation of water across oceans and fresh water. It reveals ocean features and tracks how much water flows through rivers and is stored in lakes.',
    instruments: [
      'Ka-band Radar Interferometer (KaRIn)',
      'Nadir altimeter',
      'Radiometer',
    ],
    observes: ['Sea-surface height', 'Ocean currents', 'Rivers & lakes', 'Freshwater storage'],
    markerColor: c('Water and Oceans'),
    featured: true,
    enabled: true,
  },
  {
    id: 'pace',
    displayName: 'PACE',
    expectedObjectName: 'PACE',
    noradId: 58928,
    category: 'Water and Oceans',
    agency: 'NASA',
    orbitType: 'Sun-synchronous low Earth orbit (~676 km)',
    launchYear: 2024,
    missionPageUrl: 'https://pace.gsfc.nasa.gov/',
    sourceUrl: 'https://www.nasa.gov/mission/pace/',
    shortDescription:
      'Observes ocean color, tiny plankton, and airborne particles in fine spectral detail.',
    longDescription:
      'PACE (Plankton, Aerosol, Cloud, ocean Ecosystem) measures the color of the ocean across many wavelengths to identify types of phytoplankton, the base of the ocean food web. It also studies aerosols and clouds to improve our understanding of air and climate.',
    instruments: ['Ocean Color Instrument (OCI)', 'SPEXone', 'HARP2'],
    observes: ['Ocean color', 'Phytoplankton', 'Aerosols', 'Clouds'],
    markerColor: c('Water and Oceans'),
    featured: false,
    enabled: true,
  },
  {
    id: 'suomi-npp',
    displayName: 'Suomi NPP',
    expectedObjectName: 'SUOMI NPP',
    noradId: 37849,
    category: 'Weather and Precipitation',
    agency: 'NASA / NOAA',
    orbitType: 'Sun-synchronous low Earth orbit (~824 km)',
    launchYear: 2011,
    missionPageUrl: 'https://www.nasa.gov/mission/suomi-npp/',
    sourceUrl: 'https://www.nesdis.noaa.gov/our-satellites/currently-flying/joint-polar-satellite-system',
    shortDescription:
      'A polar-orbiting weather and climate satellite bridging NASA research and NOAA forecasting.',
    longDescription:
      'Suomi NPP circles Earth from pole to pole about 14 times a day, building a complete global picture of weather, clouds, land, and ocean. Its VIIRS instrument provides the well-known “day-night band” imagery of city lights and storms.',
    instruments: ['VIIRS', 'CrIS', 'ATMS', 'OMPS', 'CERES'],
    observes: ['Clouds & weather', 'Land & ocean imagery', 'Temperature & moisture profiles', 'Ozone'],
    markerColor: c('Weather and Precipitation'),
    featured: false,
    enabled: true,
  },
  {
    id: 'noaa-20',
    displayName: 'NOAA-20',
    expectedObjectName: 'NOAA 20 (JPSS-1)',
    noradId: 43013,
    category: 'Weather and Precipitation',
    agency: 'NOAA / NASA',
    orbitType: 'Sun-synchronous low Earth orbit (~824 km)',
    launchYear: 2017,
    missionPageUrl: 'https://www.nesdis.noaa.gov/our-satellites/currently-flying/joint-polar-satellite-system',
    sourceUrl: 'https://www.jpss.noaa.gov/',
    shortDescription:
      'An operational polar weather satellite (JPSS-1) providing data for global forecasts.',
    longDescription:
      'NOAA-20, the first satellite of the Joint Polar Satellite System, flies in the same orbit as Suomi NPP, half an orbit apart. Together they deliver the global temperature, moisture, and imagery data that feed numerical weather prediction models.',
    instruments: ['VIIRS', 'CrIS', 'ATMS', 'OMPS'],
    observes: ['Weather forecasting', 'Clouds', 'Temperature & moisture profiles', 'Land & ocean imagery'],
    markerColor: c('Weather and Precipitation'),
    featured: false,
    enabled: true,
  },
  {
    id: 'sentinel-6',
    displayName: 'Sentinel-6 Michael Freilich',
    expectedObjectName: 'SENTINEL-6A',
    noradId: 46984,
    category: 'Water and Oceans',
    agency: 'ESA / NASA / NOAA / EUMETSAT',
    orbitType: 'Low Earth orbit (~1336 km), 66° inclination',
    launchYear: 2020,
    missionPageUrl: 'https://www.jpl.nasa.gov/missions/sentinel-6/',
    sourceUrl: 'https://sentinels.copernicus.eu/copernicus/sentinel-6',
    shortDescription:
      'Continues a decades-long record of global sea-level measurements from a reference orbit.',
    longDescription:
      'Sentinel-6 Michael Freilich carries a radar altimeter that measures sea-surface height to within a few centimeters. It extends a continuous record of global sea-level rise begun by the TOPEX/Poseidon and Jason missions in the 1990s.',
    instruments: ['Poseidon-4 radar altimeter', 'AMR-C radiometer', 'GNSS Radio Occultation'],
    observes: ['Sea-surface height', 'Sea-level rise', 'Ocean topography', 'Wave height'],
    markerColor: c('Water and Oceans'),
    featured: true,
    enabled: true,
  },
  {
    id: 'iss',
    displayName: 'International Space Station',
    expectedObjectName: 'ISS (ZARYA)',
    noradId: 25544,
    category: 'Platforms',
    agency: 'NASA / Roscosmos / ESA / JAXA / CSA',
    orbitType: 'Low Earth orbit (~420 km), 51.6° inclination',
    launchYear: 1998,
    missionPageUrl: 'https://www.nasa.gov/international-space-station/',
    sourceUrl: 'https://www.nasa.gov/international-space-station/',
    shortDescription:
      'A crewed orbiting laboratory that also hosts several Earth-observing instruments.',
    longDescription:
      'The International Space Station is a crewed research platform in low Earth orbit. Its 51.6° inclination lets it pass over most of the populated world, and it carries mounted Earth-science instruments such as ECOSTRESS, EMIT, OCO-3, and COWVR/TEMPEST, which share the station’s orbit.',
    instruments: ['ECOSTRESS', 'EMIT', 'OCO-3', 'COWVR/TEMPEST'],
    observes: ['Hosts Earth-science instruments'],
    markerColor: c('Platforms'),
    featured: true,
    enabled: true,
  },
  {
    id: 'ecostress',
    displayName: 'ECOSTRESS',
    expectedObjectName: 'ISS (ZARYA)',
    noradId: 25544,
    hostedOn: 'International Space Station',
    category: 'Land',
    agency: 'NASA / JPL',
    orbitType: 'Aboard the ISS, low Earth orbit (~420 km), 51.6°',
    launchYear: 2018,
    missionPageUrl: 'https://ecostress.jpl.nasa.gov/',
    sourceUrl: 'https://www.jpl.nasa.gov/missions/ecostress/',
    shortDescription:
      'An ISS-mounted thermal radiometer measuring plant temperature and water stress.',
    longDescription:
      'ECOSTRESS (ECOsystem Spaceborne Thermal Radiometer Experiment on Space Station) measures the temperature of plants to reveal how they respond to water stress. Mounted on the ISS, it shares the station’s orbit, so its modeled position is the ISS position.',
    instruments: ['PHyTIR thermal infrared radiometer'],
    observes: ['Evapotranspiration', 'Plant water stress', 'Surface temperature'],
    markerColor: c('Land'),
    featured: false,
    enabled: true,
  },
  {
    id: 'emit',
    displayName: 'EMIT',
    expectedObjectName: 'ISS (ZARYA)',
    noradId: 25544,
    hostedOn: 'International Space Station',
    category: 'Land',
    agency: 'NASA / JPL',
    orbitType: 'Aboard the ISS, low Earth orbit (~420 km), 51.6°',
    launchYear: 2022,
    missionPageUrl: 'https://earth.jpl.nasa.gov/emit/',
    sourceUrl: 'https://www.jpl.nasa.gov/missions/emit/',
    shortDescription:
      'An ISS-mounted imaging spectrometer mapping the mineral composition of dust source regions.',
    longDescription:
      'EMIT (Earth Surface Mineral Dust Source Investigation) is an imaging spectrometer on the ISS that maps the surface mineralogy of arid dust-source regions. Because mineral dust affects heating and cooling of the atmosphere, EMIT improves models of dust’s role in climate. It shares the ISS orbit.',
    instruments: ['Visible-to-shortwave-infrared imaging spectrometer'],
    observes: ['Surface mineralogy', 'Dust sources', 'Aerosol composition'],
    markerColor: c('Land'),
    featured: false,
    enabled: true,
  },
  {
    id: 'oco-3',
    displayName: 'OCO-3',
    expectedObjectName: 'ISS (ZARYA)',
    noradId: 25544,
    hostedOn: 'International Space Station',
    category: 'Climate and Radiation',
    agency: 'NASA / JPL',
    orbitType: 'Aboard the ISS, low Earth orbit (~420 km), 51.6°',
    launchYear: 2019,
    missionPageUrl: 'https://ocov3.jpl.nasa.gov/',
    sourceUrl: 'https://www.jpl.nasa.gov/missions/orbiting-carbon-observatory-3-oco-3/',
    shortDescription:
      'An ISS-mounted spectrometer measuring carbon dioxide, with city-scale snapshot mapping.',
    longDescription:
      'OCO-3 (Orbiting Carbon Observatory-3) measures atmospheric carbon dioxide from the ISS using a spare instrument built alongside OCO-2. Its pointing mirror lets it make “snapshot” maps of CO₂ over cities and power plants. It shares the ISS orbit.',
    instruments: ['Three-channel imaging grating spectrometer'],
    observes: ['Carbon dioxide', 'Solar-induced fluorescence'],
    markerColor: c('Climate and Radiation'),
    featured: false,
    enabled: true,
  },
  {
    id: 'cowvr-tempest',
    displayName: 'COWVR / TEMPEST',
    expectedObjectName: 'ISS (ZARYA)',
    noradId: 25544,
    hostedOn: 'International Space Station',
    category: 'Weather and Precipitation',
    agency: 'NASA / JPL / U.S. Space Force',
    orbitType: 'Aboard the ISS, low Earth orbit (~420 km), 51.6°',
    launchYear: 2021,
    missionPageUrl: 'https://www.jpl.nasa.gov/missions/compact-ocean-wind-vector-radiometer-cowvr/',
    sourceUrl: 'https://weather.ndc.nasa.gov/cowvr/',
    shortDescription:
      'Two ISS-mounted microwave radiometers demonstrating low-cost ocean-wind and storm sensing.',
    longDescription:
      'COWVR (Compact Ocean Wind Vector Radiometer) and TEMPEST (Temporal Experiment for Storms and Tropical Systems) are microwave radiometers on the ISS. Together they demonstrate compact, low-cost measurement of ocean surface winds, water vapor, and precipitation. They share the ISS orbit.',
    instruments: ['COWVR radiometer', 'TEMPEST-D radiometer'],
    observes: ['Ocean surface wind', 'Water vapor', 'Precipitation'],
    markerColor: c('Weather and Precipitation'),
    featured: false,
    enabled: true,
  },
  {
    id: 'grace-fo-1',
    displayName: 'GRACE-FO 1',
    expectedObjectName: 'GRACE-FO 1',
    noradId: 43476,
    constellation: 'GRACE-FO',
    category: 'Water and Oceans',
    agency: 'NASA / GFZ',
    orbitType: 'Near-polar low Earth orbit (~490 km)',
    launchYear: 2018,
    missionPageUrl: 'https://gracefo.jpl.nasa.gov/',
    sourceUrl: 'https://www.jpl.nasa.gov/missions/gravity-recovery-and-climate-experiment-follow-on-grace-fo/',
    shortDescription:
      'The lead of two twin satellites that track water movement by measuring Earth’s gravity.',
    longDescription:
      'GRACE-FO (Gravity Recovery and Climate Experiment Follow-On) is a pair of satellites flying about 220 km apart. By measuring minute changes in the distance between them, they map month-to-month changes in Earth’s gravity caused by moving water. GRACE-FO 1 is the leading satellite of the pair.',
    instruments: ['Microwave ranging system', 'Laser Ranging Interferometer', 'Accelerometers'],
    observes: ['Groundwater', 'Ice mass', 'Sea level', 'Water storage'],
    markerColor: c('Water and Oceans'),
    featured: true,
    enabled: true,
  },
  {
    id: 'grace-fo-2',
    displayName: 'GRACE-FO 2',
    expectedObjectName: 'GRACE-FO 2',
    noradId: 43477,
    constellation: 'GRACE-FO',
    category: 'Water and Oceans',
    agency: 'NASA / GFZ',
    orbitType: 'Near-polar low Earth orbit (~490 km)',
    launchYear: 2018,
    missionPageUrl: 'https://gracefo.jpl.nasa.gov/',
    sourceUrl: 'https://www.jpl.nasa.gov/missions/gravity-recovery-and-climate-experiment-follow-on-grace-fo/',
    shortDescription:
      'The trailing twin, flying ~220 km behind GRACE-FO 1 to sense Earth’s changing gravity.',
    longDescription:
      'GRACE-FO 2 trails about 220 km behind GRACE-FO 1. A microwave link continuously measures the tiny changes in the distance between the two satellites as they pass over regions of stronger or weaker gravity, revealing how water moves across the planet.',
    instruments: ['Microwave ranging system', 'Laser Ranging Interferometer', 'Accelerometers'],
    observes: ['Groundwater', 'Ice mass', 'Sea level', 'Water storage'],
    markerColor: c('Water and Oceans'),
    featured: false,
    enabled: true,
  },
  {
    id: 'jason-3',
    displayName: 'Jason-3',
    expectedObjectName: 'JASON-3',
    noradId: 41240,
    category: 'Water and Oceans',
    agency: 'NOAA / NASA / CNES / EUMETSAT',
    orbitType: 'Low Earth orbit (~1336 km), 66° inclination',
    launchYear: 2016,
    missionPageUrl: 'https://www.jpl.nasa.gov/missions/jason-3/',
    sourceUrl: 'https://www.nesdis.noaa.gov/jason-3',
    shortDescription:
      'A radar altimeter continuing the long-term record of global sea-surface height.',
    longDescription:
      'Jason-3 measures sea-surface height with a radar altimeter, continuing a record begun by TOPEX/Poseidon and the earlier Jason missions and now carried forward by Sentinel-6. Its data support sea-level-rise monitoring, ocean-current mapping, and hurricane forecasting.',
    instruments: ['Poseidon-3B radar altimeter', 'Advanced Microwave Radiometer'],
    observes: ['Sea-surface height', 'Ocean currents', 'Sea-level rise'],
    markerColor: c('Water and Oceans'),
    featured: false,
    enabled: true,
  },
  {
    id: 'nisar',
    displayName: 'NISAR',
    expectedObjectName: 'NISAR',
    noradId: 65053,
    category: 'Land',
    agency: 'NASA / ISRO',
    orbitType: 'Sun-synchronous low Earth orbit (~747 km)',
    launchYear: 2025,
    missionPageUrl: 'https://nisar.jpl.nasa.gov/',
    sourceUrl: 'https://www.jpl.nasa.gov/missions/nisar/',
    shortDescription:
      'A dual-frequency radar that maps tiny movements of land and ice across the whole planet.',
    longDescription:
      'NISAR (NASA-ISRO Synthetic Aperture Radar) uses L-band (NASA) and S-band (ISRO) radar to measure centimeter-scale changes in Earth’s land and ice surfaces. It observes earthquakes, volcanoes, landslides, ice-sheet motion, and changing ecosystems, day or night and through clouds.',
    instruments: ['L-band SAR (NASA)', 'S-band SAR (ISRO)'],
    observes: ['Surface deformation', 'Ice motion', 'Ecosystems', 'Natural hazards'],
    markerColor: c('Land'),
    featured: true,
    enabled: true,
  },
  {
    id: 'noaa-21',
    displayName: 'NOAA-21',
    expectedObjectName: 'NOAA 21 (JPSS-2)',
    noradId: 54234,
    category: 'Weather and Precipitation',
    agency: 'NOAA / NASA',
    orbitType: 'Sun-synchronous low Earth orbit (~824 km)',
    launchYear: 2022,
    missionPageUrl: 'https://www.jpss.noaa.gov/',
    sourceUrl: 'https://www.nesdis.noaa.gov/our-satellites/currently-flying/joint-polar-satellite-system',
    shortDescription:
      'The latest JPSS operational polar weather satellite, joining NOAA-20 and Suomi NPP.',
    longDescription:
      'NOAA-21 (JPSS-2) is the third satellite of the Joint Polar Satellite System. It shares an orbit plane with NOAA-20 and Suomi NPP to provide frequent global measurements of temperature, moisture, clouds, and imagery that feed weather-prediction models.',
    instruments: ['VIIRS', 'CrIS', 'ATMS', 'OMPS'],
    observes: ['Weather forecasting', 'Clouds', 'Temperature & moisture profiles', 'Imagery'],
    markerColor: c('Weather and Precipitation'),
    featured: false,
    enabled: true,
  },
  {
    id: 'oco-2',
    displayName: 'OCO-2',
    expectedObjectName: 'OCO 2',
    noradId: 40059,
    category: 'Climate and Radiation',
    agency: 'NASA / JPL',
    orbitType: 'Sun-synchronous low Earth orbit (~705 km)',
    launchYear: 2014,
    missionPageUrl: 'https://ocov2.jpl.nasa.gov/',
    sourceUrl: 'https://www.jpl.nasa.gov/missions/orbiting-carbon-observatory-2-oco-2/',
    shortDescription:
      'A dedicated spectrometer measuring atmospheric carbon dioxide with high precision.',
    longDescription:
      'OCO-2 (Orbiting Carbon Observatory-2) measures the concentration of carbon dioxide in the atmosphere by observing sunlight reflected off Earth’s surface. Its precise, global measurements help scientists understand the natural processes that add and remove CO₂ from the air.',
    instruments: ['Three-channel imaging grating spectrometer'],
    observes: ['Carbon dioxide', 'Solar-induced fluorescence'],
    markerColor: c('Climate and Radiation'),
    featured: false,
    enabled: true,
  },
  {
    id: 'prefire-1',
    displayName: 'PREFIRE-1',
    expectedObjectName: 'PREFIRE-1',
    noradId: 59965,
    category: 'Climate and Radiation',
    agency: 'NASA / UW–Madison',
    orbitType: 'Near-polar low Earth orbit (~525 km), CubeSat',
    launchYear: 2024,
    missionPageUrl: 'https://science.nasa.gov/mission/prefire/',
    sourceUrl: 'https://prefire.ssec.wisc.edu/',
    shortDescription:
      'A CubeSat measuring far-infrared heat lost to space from the Arctic and Antarctic.',
    longDescription:
      'PREFIRE (Polar Radiant Energy in the Far-InfraRed Experiment) is a pair of CubeSats (this is the first) that measure far-infrared radiation escaping to space from the polar regions, a key but poorly measured part of Earth’s energy budget. PREFIRE is led by the University of Wisconsin–Madison.',
    instruments: ['Thermal Infrared Spectrometer (TIRS)'],
    observes: ['Far-infrared radiation', 'Polar heat loss', 'Energy budget'],
    markerColor: c('Climate and Radiation'),
    featured: true,
    enabled: true,
  },
  {
    id: 'prefire-2',
    displayName: 'PREFIRE-2',
    expectedObjectName: 'PREFIRE-2',
    noradId: 59881,
    category: 'Climate and Radiation',
    agency: 'NASA / UW–Madison',
    orbitType: 'Near-polar low Earth orbit (~525 km), CubeSat',
    launchYear: 2024,
    missionPageUrl: 'https://science.nasa.gov/mission/prefire/',
    sourceUrl: 'https://prefire.ssec.wisc.edu/',
    shortDescription:
      'The second PREFIRE CubeSat, measuring polar far-infrared energy loss.',
    longDescription:
      'PREFIRE-2 is the second of the two PREFIRE CubeSats. Flying in a different orbit from PREFIRE-1, it helps capture how quickly conditions in the Arctic and Antarctic change. PREFIRE is led by the University of Wisconsin–Madison.',
    instruments: ['Thermal Infrared Spectrometer (TIRS)'],
    observes: ['Far-infrared radiation', 'Polar heat loss', 'Energy budget'],
    markerColor: c('Climate and Radiation'),
    featured: false,
    enabled: true,
  },
  {
    id: 'sentinel-6b',
    displayName: 'Sentinel-6B',
    expectedObjectName: 'SENTINEL-6B',
    noradId: 66514,
    category: 'Water and Oceans',
    agency: 'ESA / NASA / NOAA / EUMETSAT',
    orbitType: 'Low Earth orbit (~1336 km), 66° inclination',
    launchYear: 2025,
    missionPageUrl: 'https://www.jpl.nasa.gov/missions/sentinel-6/',
    sourceUrl: 'https://sentinels.copernicus.eu/copernicus/sentinel-6',
    shortDescription:
      'The twin of Sentinel-6 Michael Freilich, extending the global sea-level record.',
    longDescription:
      'Sentinel-6B is the twin of Sentinel-6 Michael Freilich. Flying in the same reference orbit, it continues the decades-long, centimeter-accurate record of global sea-surface height used to monitor sea-level rise.',
    instruments: ['Poseidon-4 radar altimeter', 'AMR-C radiometer', 'GNSS Radio Occultation'],
    observes: ['Sea-surface height', 'Sea-level rise', 'Ocean topography'],
    markerColor: c('Water and Oceans'),
    featured: false,
    enabled: true,
  },
  {
    id: 'tempo',
    displayName: 'TEMPO',
    expectedObjectName: 'INTELSAT 40E (IS-40E)',
    noradId: 56174,
    hostedOn: 'Intelsat 40e (geostationary)',
    category: 'Atmosphere',
    agency: 'NASA / SAO',
    orbitType: 'Geostationary orbit (~35,786 km) aboard Intelsat 40e',
    launchYear: 2023,
    missionPageUrl: 'https://science.nasa.gov/mission/tempo/',
    sourceUrl: 'https://tempo.si.edu/',
    shortDescription:
      'A geostationary air-quality spectrometer that scans North America hour by hour.',
    longDescription:
      'TEMPO (Tropospheric Emissions: Monitoring of Pollution) is a UV-visible spectrometer hosted on the geostationary Intelsat 40e satellite. From its fixed vantage over the Americas, it measures air pollutants such as nitrogen dioxide and ozone across North America every daylight hour. Its modeled position is that of its host, Intelsat 40e.',
    instruments: ['UV-visible imaging spectrometer'],
    observes: ['Air quality', 'Nitrogen dioxide', 'Ozone', 'Aerosols'],
    markerColor: c('Atmosphere'),
    featured: true,
    enabled: true,
  },
]

// The CYGNSS flight models currently tracked by CelesTrak. FM06 (41889) is not
// in CelesTrak's catalog, so it is omitted rather than shown without data.
const CYGNSS_FLEET = [
  { fm: '01', norad: 41887 },
  { fm: '02', norad: 41886 },
  { fm: '03', norad: 41891 },
  { fm: '04', norad: 41885 },
  { fm: '05', norad: 41884 },
  { fm: '07', norad: 41890 },
  { fm: '08', norad: 41888 },
].map(({ fm, norad }) => ({
  id: `cygnss-fm${fm}`,
  displayName: `CYGNSS FM${fm}`,
  expectedObjectName: `CYGFM${fm}`,
  noradId: norad,
  constellation: 'CYGNSS',
  category: 'Weather and Precipitation',
  agency: 'NASA',
  orbitType: 'Low Earth orbit (~520 km), 35° inclination',
  launchYear: 2016,
  launchDate: '2016-12-15',
  missionPageUrl: 'https://www.nasa.gov/mission/cygnss/',
  sourceUrl: 'https://clasp-research.engin.umich.edu/missions/cygnss/',
  shortDescription: `One of eight CYGNSS microsatellites measuring ocean-surface winds inside tropical cyclones.`,
  longDescription: `CYGNSS (Cyclone Global Navigation Satellite System) is a constellation of eight small satellites that measure ocean-surface wind speed from GPS signals reflected off the sea, even through the heavy rain of a hurricane. This is flight model FM${fm} of the eight.`,
  instruments: ['Delay Doppler Mapping Instrument (DDMI)'],
  observes: ['Ocean surface wind', 'Tropical cyclones', 'Hurricane intensity'],
  markerColor: c('Weather and Precipitation'),
  featured: fm === '01',
  enabled: true,
}))

// Verified launch dates (UTC), used to compute each spacecraft's "time in
// orbit". Hosted instruments carry their OWN date (when installed on the host),
// which is why co-located instruments still show different times in orbit.
// A mission with no precise date here falls back to its launchYear.
const LAUNCH_DATES = {
  'landsat-8': '2013-02-11',
  'landsat-9': '2021-09-27',
  terra: '1999-12-18',
  aqua: '2002-05-04',
  aura: '2004-07-15',
  'gpm-core': '2014-02-27',
  'icesat-2': '2018-09-15',
  smap: '2015-01-31',
  swot: '2022-12-16',
  pace: '2024-02-08',
  'suomi-npp': '2011-10-28',
  'noaa-20': '2017-11-18',
  'sentinel-6': '2020-11-21',
  iss: '1998-11-20',
  ecostress: '2018-06-29',
  emit: '2022-07-14',
  'oco-3': '2019-05-04',
  'cowvr-tempest': '2021-12-21',
  'grace-fo-1': '2018-05-22',
  'grace-fo-2': '2018-05-22',
  'jason-3': '2016-01-17',
  nisar: '2025-07-30',
  'noaa-21': '2022-11-10',
  'oco-2': '2014-07-02',
  'prefire-1': '2024-06-05',
  'prefire-2': '2024-05-25',
  tempo: '2023-04-07',
  // CYGNSS flight models carry their launchDate inline (all 2016-12-15).
  // sentinel-6b: precise date not confirmed, so falls back to launchYear (2025)
}

export const MISSIONS = [...RAW_MISSIONS, ...CYGNSS_FLEET].map((m) => ({
  ...m,
  launchDate: LAUNCH_DATES[m.id] ?? m.launchDate ?? null,
}))

// Missions the orbit service should try to fetch/propagate.
export const ENABLED_MISSIONS = MISSIONS.filter((m) => m.enabled)

export const MISSION_BY_ID = Object.fromEntries(MISSIONS.map((m) => [m.id, m]))

export const ISS_HOST_PLATFORM_ID = 'iss'
export const ISS_HOST_PLATFORM_NAME = 'International Space Station'
export const ISS_HOSTED_MISSION_IDS = new Set(
  MISSIONS.filter((m) => m.hostedOn === ISS_HOST_PLATFORM_NAME).map((m) => m.id),
)

export function isIssHostedMission(mission) {
  return mission?.hostedOn === ISS_HOST_PLATFORM_NAME
}

export function isIssHostedMissionId(id) {
  return ISS_HOSTED_MISSION_IDS.has(id)
}

export function getMission(id) {
  return MISSION_BY_ID[id] ?? null
}
