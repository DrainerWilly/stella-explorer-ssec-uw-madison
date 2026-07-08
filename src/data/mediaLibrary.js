// Educational video library. All clips are public-domain NASA / NASA-SVS /
// NASA-NOAA productions, served from /public/assets/videos and credited on
// playback. Files are large, so the player only downloads a clip when the user
// presses play (a poster frame stands in until then).

export const VIDEOS = {
  'landsat-orbits': {
    file: 'assets/videos/landsat-orbits.mp4',
    poster: 'assets/videos/posters/landsat-orbits.jpg',
    title: 'How Landsat orbits Earth',
    blurb:
      'Follow Landsat along its near-polar, Sun-synchronous path as it images the planet in swaths while Earth turns beneath it.',
    credit: 'Video: NASA’s Scientific Visualization Studio.',
    sourceUrl: 'https://svs.gsfc.nasa.gov/',
  },
  'electromagnetic-spectrum': {
    file: 'assets/videos/electromagnetic-spectrum.mp4',
    poster: 'assets/videos/posters/electromagnetic-spectrum.jpg',
    title: 'The electromagnetic spectrum',
    blurb:
      'A tour from radio waves to gamma rays — how wavelength and energy change across the spectrum, and what each region reveals.',
    credit: 'Video: NASA’s Scientific Visualization Studio.',
    sourceUrl: 'https://svs.gsfc.nasa.gov/',
  },
  'urban-heat-islands': {
    file: 'assets/videos/urban-heat-islands.mp4',
    poster: 'assets/videos/posters/urban-heat-islands.jpg',
    title: 'Urban heat islands',
    blurb:
      'Why cities run hotter than the green land around them — and how satellites measure the difference from space.',
    credit: 'Video: NASA.',
    sourceUrl: 'https://svs.gsfc.nasa.gov/',
  },
  'goes-east-west': {
    file: 'assets/videos/goes-east-west.mp4',
    poster: 'assets/videos/posters/goes-east-west.jpg',
    title: 'GOES-East & GOES-West',
    blurb:
      'How two geostationary weather satellites park over fixed points to watch the Americas around the clock.',
    credit: 'Video: NASA / NOAA.',
    sourceUrl: 'https://svs.gsfc.nasa.gov/',
  },
  'tdrs-fleet-360': {
    file: 'assets/videos/tdrs-fleet-360.mp4',
    poster: 'assets/videos/posters/tdrs-fleet-360.jpg',
    title: 'The TDRS communications fleet',
    blurb:
      'A 360° look at the relay-satellite network that keeps Earth-observing missions connected to the ground.',
    credit: 'Video: NASA.',
    sourceUrl: 'https://svs.gsfc.nasa.gov/',
  },
}

export function getVideo(id) {
  return VIDEOS[id] ?? null
}
