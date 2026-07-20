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
    image: 'assets/nasa/ems-diagram-09172025.jpg',
    imageAlt: 'NASA diagram of the electromagnetic spectrum from radio waves to gamma rays',
    accent: '#ea3a86',
    blurb: 'Interactive explainers for light, waves, and the electromagnetic spectrum that satellites sense.',
  },
  {
    id: 'games',
    icon: 'games',
    label: 'Space Arcade',
    image: 'assets/home/pillars-of-creation.jpg',
    imageAlt: 'The Pillars of Creation, imaged by the Hubble Space Telescope',
    accent: '#4ec41b',
    blurb: 'Playful science games that turn remote-sensing ideas into something you can experiment with.',
  },
  {
    id: 'lessons',
    icon: 'lessons',
    label: 'Lessons',
    image: 'assets/home/stella-field-lesson.jpg',
    imageAlt: 'Students and an educator examining vegetation during a STELLA field session',
    accent: '#fca344',
    blurb: 'Classroom-ready activities that connect STELLA field measurements to Landsat imagery.',
  },
  {
    id: 'device',
    icon: 'device',
    label: 'STELLA Device Lab',
    image: 'assets/stella/stella-1-2.png',
    imageAlt: 'The white 3D-printed STELLA-1.2 instrument with its touchscreen and rotary knob',
    accent: '#ffc928',
    blurb: 'Explore, build, and understand your own NASA STELLA hand-held spectrometer.',
  },
  {
    id: 'data-viz',
    icon: 'viz',
    label: 'Data Visualizer',
    image: 'assets/stella/stella-q2.png',
    imageAlt: 'The STELLA-Q2 pocket spectrometer with a live spectrum on its display',
    accent: '#17b3c9',
    blurb: 'Plot real STELLA spectrometer readings and compare them against your own measurements.',
  },
  {
    id: 'data',
    icon: 'data',
    label: 'Spectral Bands',
    image: 'landsat/false-color.jpg',
    imageAlt: 'Near-infrared false-color Landsat image of Florida with vegetation shown in red',
    accent: '#ff2d2d',
    blurb: 'Read Landsat spectral bands and the signatures that reveal our changing planet.',
  },
]

// The seven non-home destinations, in the order shown on the home page.
export const HOME_CARDS = NAV.filter((item) => item.id !== 'home')
