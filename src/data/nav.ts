// @ts-nocheck
// Single source of truth for the primary navigation and the editorial home
// cards. Each item carries a real SSEC photo (official sources: NASA/USGS
// imagery, the STELLA project site, and NASA's public Images API).
//
// Non-home items add two fields used by the home page's editorial cards:
//   accent — the colored rule-line color for that card
//   blurb  — a short description written from the section's own content
export const NAV = [
  {
    id: 'home',
    icon: 'home',
    label: 'Home',
    image: 'assets/nasa/earth-day-8k.jpg',
    imageAlt: 'NASA Blue Marble image of Earth from space',
  },
  {
    id: 'mission-control',
    icon: 'tracker',
    label: 'Satellite Tracker',
    image: 'assets/media/landsat-in-orbit.jpg',
    imageAlt: 'Rendered view of a Landsat satellite in orbit above a mountainous coastline',
    accent: '#559af4',
    blurb: 'Follow real Earth-observing satellites in a live 3D orbit view and watch Landsat pass overhead.',
  },
  {
    id: 'animations',
    icon: 'animation',
    label: 'Animations',
    image: 'assets/home/nasa-em-spectrum.jpg',
    imageAlt: 'NASA visualization of the electromagnetic spectrum from radio waves to gamma rays',
    accent: '#ea3a86',
    blurb: 'Interactive explainers for light, waves, and the electromagnetic spectrum that satellites sense.',
  },
  {
    id: 'games',
    icon: 'games',
    label: 'Space Arcade',
    image: 'assets/home/nasa-crop-circles.jpg',
    imageAlt: 'Aerial view of center-pivot agricultural fields used in NASA Landsat education materials',
    accent: '#4ec41b',
    blurb: 'Playful science games that turn remote-sensing ideas into something you can experiment with.',
  },
  {
    id: 'lessons',
    icon: 'lessons',
    label: 'Lessons',
    image: 'assets/home/nasa-stella-field-lesson.jpg',
    imageAlt: 'Students collecting vegetation measurements during a NASA STELLA field campaign',
    accent: '#fca344',
    blurb: 'Classroom-ready activities that connect STELLA field measurements to Landsat imagery.',
  },
  {
    id: 'device',
    icon: 'device',
    label: 'STELLA Device Lab',
    image: 'assets/home/nasa-stella-build.png',
    imageAlt: 'A NASA STELLA intern using a multimeter while building a STELLA instrument',
    imagePosition: '50% 45%',
    accent: '#ffc928',
    blurb: 'Explore, build, and understand your own NASA STELLA hand-held spectrometer.',
  },
  {
    id: 'data-viz',
    icon: 'viz',
    label: 'STELLA Data Visualizer',
    image: 'assets/home/nasa-stella-ndvi-data.png',
    imageAlt: 'NASA STELLA Data Viewer graph comparing NDVI, air temperature, and surface temperature',
    imageFit: 'contain',
    imageBg: '#ffffff',
    accent: '#17b3c9',
    blurb: 'Plot real STELLA spectrometer readings and compare them against your own measurements.',
  },
  {
    id: 'data',
    icon: 'data',
    label: 'Spectral Bands',
    image: 'assets/home/nasa-landsat-next-bands.jpg',
    imageAlt: 'NASA Landsat Next spectral bands visualization labeled Beyond the Visible',
    accent: '#ff2d2d',
    blurb: 'Read Landsat spectral bands and the signatures that reveal our changing planet.',
  },
]

// The seven non-home destinations, in the order shown on the home page.
export const HOME_CARDS = NAV.filter((item) => item.id !== 'home')
