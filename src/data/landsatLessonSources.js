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
