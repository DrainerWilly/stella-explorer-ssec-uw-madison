// Official NASA / USGS sources for the "How Landsat Images Are Made" lesson.
// Imagery is public domain (NASA media guidelines / USGS as U.S. government
// works) but must stay credited. IMAGES entries are read by ImageWithAttribution;
// files live in /public/landsat/ and gracefully fall back to a labeled
// placeholder if a file has not been downloaded yet.

export const SOURCES = [
  {
    id: 'usgs-landsat8',
    group: 'Mission & band data',
    title: 'Landsat 8',
    organization: 'USGS',
    url: 'https://www.usgs.gov/landsat-missions/landsat-8',
    credit: 'U.S. Geological Survey, Landsat 8 mission.',
    note: 'USGS content is generally public domain (U.S. government work).',
  },
  {
    id: 'usgs-landsat9',
    group: 'Mission & band data',
    title: 'Landsat 9',
    organization: 'USGS',
    url: 'https://www.usgs.gov/landsat-missions/landsat-9',
    credit: 'U.S. Geological Survey, Landsat 9 mission.',
    note: 'USGS content is generally public domain (U.S. government work).',
  },
  {
    id: 'usgs-band-designations',
    group: 'Mission & band data',
    title: 'What are the band designations for the Landsat satellites?',
    organization: 'USGS',
    url: 'https://www.usgs.gov/faqs/what-are-band-designations-landsat-satellites',
    credit: 'U.S. Geological Survey, Landsat band designations.',
    note: 'Band wavelengths and resolutions used throughout this lesson.',
  },
  {
    id: 'usgs-band-combinations',
    group: 'RGB composite references',
    title: 'Common Landsat band combinations',
    organization: 'USGS',
    url: 'https://www.usgs.gov/media/images/common-landsat-band-combinations',
    credit: 'U.S. Geological Survey.',
    note: 'Reference graphic for natural-color and false-color band combinations.',
  },
  {
    id: 'usgs-rgb-composites',
    group: 'RGB composite references',
    title: 'Common Landsat RGB composites',
    organization: 'USGS',
    url: 'https://www.usgs.gov/media/images/common-landsat-rgb-composites',
    credit: 'U.S. Geological Survey.',
    note: 'Reference graphic for RGB composite assignments.',
  },
  {
    id: 'usgs-surface-reflectance',
    group: 'Surface reflectance',
    title: 'Landsat Surface Reflectance',
    organization: 'USGS',
    url: 'https://www.usgs.gov/landsat-missions/landsat-surface-reflectance',
    credit: 'U.S. Geological Survey, Landsat Collection surface reflectance.',
    note: 'Basis for the processing / atmospheric-correction chapter.',
  },
  {
    id: 'nasa-landsat',
    group: 'Mission & band data',
    title: 'Landsat mission overview',
    organization: 'NASA',
    url: 'https://science.nasa.gov/mission/landsat/',
    credit: 'NASA Landsat Science.',
    note: 'NASA imagery is generally free to use with credit (NASA media guidelines).',
  },
  {
    id: 'nasa-false-color',
    group: 'Natural-color & false-color imagery',
    title: 'How to Interpret a False-Color Satellite Image',
    organization: 'NASA Earth Observatory',
    url: 'https://science.nasa.gov/earth/earth-observatory/how-to-interpret-a-false-color-satellite-image/',
    credit: 'NASA Earth Observatory.',
    note: 'Source of the natural-color / false-color example explanation.',
  },
  {
    id: 'nasa-data-overview',
    group: 'Mission & band data',
    title: 'Landsat data overview',
    organization: 'NASA',
    url: 'https://science.nasa.gov/mission/landsat/data-overview/',
    credit: 'NASA Landsat Science.',
    note: 'Overview of Landsat data products.',
  },
  {
    id: 'nasa-earthdata-l8',
    group: 'RGB composite references',
    title: 'Access Landsat 8 surface reflectance (AppEEARS tutorial)',
    organization: 'NASA Earthdata',
    url: 'https://www.earthdata.nasa.gov/learn/tutorials/access-landsat-8-surface-reflectance-point-data-appeears',
    credit: 'NASA Earthdata.',
    note: 'Band-combination reference for Landsat 8 surface reflectance.',
  },
  {
    id: 'usgs-landsat-scene-016042',
    group: 'Band-measurement scene',
    title: 'Landsat 8 scene LC08_L2SP_016042_20240222 (Collection 2 Level-2)',
    organization: 'USGS / NASA',
    url: 'https://planetarycomputer.microsoft.com/api/stac/v1/collections/landsat-c2-l2/items/LC08_L2SP_016042_20240222_02_T1',
    credit: 'USGS/NASA Landsat 8, Collection 2 Level-2 (Surface Reflectance & Surface Temperature).',
    note: 'Real per-band grayscale crops in the band-measurement activity are rendered from this single verified scene (acquired 2024-02-22, 0.04% cloud cover, over Cape Coral–Fort Myers, Florida), accessed via Microsoft Planetary Computer’s public STAC catalog of the USGS/NASA Landsat Collection 2 archive.',
  },
]

export const SOURCE_GROUPS = [
  'Mission & band data',
  'Natural-color & false-color imagery',
  'Surface reflectance',
  'RGB composite references',
  'Image credits & licenses',
]

// Real-image slots. `file` is resolved against the app base URL at runtime; if
// the file is missing, ImageWithAttribution shows an attributed placeholder.
export const IMAGES = {
  hero: {
    file: 'landsat/hero.jpg',
    org: 'NASA Earth Observatory',
    credit: 'Image: NASA Earth Observatory (Landsat 8 OLI).',
    sourceUrl:
      'https://science.nasa.gov/earth/earth-observatory/how-to-interpret-a-false-color-satellite-image/',
    sourceId: 'nasa-false-color',
    alt: 'Landsat 8 OLI false-color image of lakes in Algeria; vegetation appears red and water turquoise.',
  },
  naturalColor: {
    file: 'landsat/natural-color.jpg',
    org: 'NASA Earth Observatory',
    credit: 'Image: NASA Earth Observatory (Landsat).',
    sourceUrl:
      'https://science.nasa.gov/earth/earth-observatory/how-to-interpret-a-false-color-satellite-image/',
    sourceId: 'nasa-false-color',
    alt: 'Natural-color Landsat image of southeast Florida showing fields, wetlands, and city.',
  },
  falseColor: {
    file: 'landsat/false-color.jpg',
    org: 'NASA Earth Observatory',
    credit: 'Image: NASA Earth Observatory (Landsat).',
    sourceUrl:
      'https://science.nasa.gov/earth/earth-observatory/how-to-interpret-a-false-color-satellite-image/',
    sourceId: 'nasa-false-color',
    alt: 'Near-infrared false-color Landsat image of the same southeast Florida scene; vegetation appears red.',
  },
  bandCombinations: {
    file: 'landsat/usgs-band-combinations.png',
    org: 'USGS',
    credit: 'Image: U.S. Geological Survey (public domain).',
    sourceUrl: 'https://www.usgs.gov/media/images/common-landsat-band-combinations',
    sourceId: 'usgs-band-combinations',
    alt: 'USGS graphic of common Landsat band combinations, including Landsat 8/9 OLI band numbers for natural color, color infrared, and false color.',
  },
  rgbComposites: {
    file: 'landsat/usgs-rgb-composites.png',
    org: 'USGS',
    credit: 'Image: U.S. Geological Survey (public domain).',
    sourceUrl: 'https://www.usgs.gov/media/images/common-landsat-rgb-composites',
    sourceId: 'usgs-rgb-composites',
    alt: 'USGS graphic of common Landsat RGB composites.',
  },
}

// Real per-band grayscale crops for the band-measurement activity — all seven
// rendered from ONE verified Landsat 8 Collection 2 Level-2 scene
// (LC08_L2SP_016042_20240222_02_T1, acquired 2024-02-22, 0.04% cloud cover,
// over Cape Coral–Fort Myers, Florida, on the Caloosahatchee River). Each crop
// is that band's real reflectance (or, for Band 10, surface-temperature) data
// stretched to an 8-bit grayscale image — not an illustration and not a channel
// split of an RGB composite.
const BAND_SCENE_CREDIT =
  'Image: USGS/NASA Landsat 8 (Collection 2 Level-2), scene LC08_L2SP_016042_20240222, 2024-02-22.'
const BAND_SCENE_ALT_PLACE = 'Cape Coral–Fort Myers, Florida, on the Caloosahatchee River'

export const BAND_TILE_IMAGES = {
  2: {
    file: 'landsat/bands/band-2.jpg',
    org: 'USGS / NASA',
    credit: BAND_SCENE_CREDIT,
    sourceUrl:
      'https://planetarycomputer.microsoft.com/api/stac/v1/collections/landsat-c2-l2/items/LC08_L2SP_016042_20240222_02_T1',
    sourceId: 'usgs-landsat-scene-016042',
    alt: `Real Landsat 8 Band 2 (Blue) grayscale image of ${BAND_SCENE_ALT_PLACE}.`,
  },
  3: {
    file: 'landsat/bands/band-3.jpg',
    org: 'USGS / NASA',
    credit: BAND_SCENE_CREDIT,
    sourceUrl:
      'https://planetarycomputer.microsoft.com/api/stac/v1/collections/landsat-c2-l2/items/LC08_L2SP_016042_20240222_02_T1',
    sourceId: 'usgs-landsat-scene-016042',
    alt: `Real Landsat 8 Band 3 (Green) grayscale image of ${BAND_SCENE_ALT_PLACE}.`,
  },
  4: {
    file: 'landsat/bands/band-4.jpg',
    org: 'USGS / NASA',
    credit: BAND_SCENE_CREDIT,
    sourceUrl:
      'https://planetarycomputer.microsoft.com/api/stac/v1/collections/landsat-c2-l2/items/LC08_L2SP_016042_20240222_02_T1',
    sourceId: 'usgs-landsat-scene-016042',
    alt: `Real Landsat 8 Band 4 (Red) grayscale image of ${BAND_SCENE_ALT_PLACE}.`,
  },
  5: {
    file: 'landsat/bands/band-5.jpg',
    org: 'USGS / NASA',
    credit: BAND_SCENE_CREDIT,
    sourceUrl:
      'https://planetarycomputer.microsoft.com/api/stac/v1/collections/landsat-c2-l2/items/LC08_L2SP_016042_20240222_02_T1',
    sourceId: 'usgs-landsat-scene-016042',
    alt: `Real Landsat 8 Band 5 (Near-infrared) grayscale image of ${BAND_SCENE_ALT_PLACE}; water is nearly black and vegetation is bright.`,
  },
  6: {
    file: 'landsat/bands/band-6.jpg',
    org: 'USGS / NASA',
    credit: BAND_SCENE_CREDIT,
    sourceUrl:
      'https://planetarycomputer.microsoft.com/api/stac/v1/collections/landsat-c2-l2/items/LC08_L2SP_016042_20240222_02_T1',
    sourceId: 'usgs-landsat-scene-016042',
    alt: `Real Landsat 8 Band 6 (SWIR 1) grayscale image of ${BAND_SCENE_ALT_PLACE}.`,
  },
  7: {
    file: 'landsat/bands/band-7.jpg',
    org: 'USGS / NASA',
    credit: BAND_SCENE_CREDIT,
    sourceUrl:
      'https://planetarycomputer.microsoft.com/api/stac/v1/collections/landsat-c2-l2/items/LC08_L2SP_016042_20240222_02_T1',
    sourceId: 'usgs-landsat-scene-016042',
    alt: `Real Landsat 8 Band 7 (SWIR 2) grayscale image of ${BAND_SCENE_ALT_PLACE}.`,
  },
  10: {
    file: 'landsat/bands/band-10.jpg',
    org: 'USGS / NASA',
    credit: BAND_SCENE_CREDIT,
    sourceUrl:
      'https://planetarycomputer.microsoft.com/api/stac/v1/collections/landsat-c2-l2/items/LC08_L2SP_016042_20240222_02_T1',
    sourceId: 'usgs-landsat-scene-016042',
    alt: `Real Landsat 8 Band 10 (Thermal) surface-temperature image of ${BAND_SCENE_ALT_PLACE}. Small dark patches (mostly over large flat rooftops) are pixels the surface-temperature algorithm could not confidently retrieve.`,
  },
}
