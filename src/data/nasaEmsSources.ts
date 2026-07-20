// @ts-nocheck
// NASA sources for the "What Is the Electromagnetic Spectrum?" lesson.
// Only two sources are used: NASA's Tour of the Electromagnetic Spectrum
// (Third Edition) PDF, and NASA Science's official EMS diagram.

export const PDF_URL =
  'https://science.nasa.gov/wp-content/uploads/2023/08/tour-of-the-ems-tagged-v7-0.pdf'

export const DIAGRAM_URL =
  'https://assets.science.nasa.gov/dynamicimage/assets/science/cds/learn/images/ems/EMS_Diagram_09172025.jpg?w=2500&h=1406&fit=clip&crop=faces%2Cfocalpoint'

// Consistent citation strings used across the page.
export const CITATION = {
  quote: (page) =>
    `Direct quotation from NASA, Tour of the Electromagnetic Spectrum, Third Edition, p. ${page}.`,
  adapted: (pages) =>
    `Content adapted from NASA, Tour of the Electromagnetic Spectrum, Third Edition, pp. ${pages}.`,
}

// The hero diagram, served locally from /public/assets/nasa/.
export const DIAGRAM = {
  file: 'assets/nasa/ems-diagram-09172025.jpg',
  alt:
    'NASA diagram "The Electromagnetic Spectrum" showing wavelength and frequency from radio waves through gamma waves, the atmospheric opacity curve with the radio and optical windows, and everyday examples such as AM radio, microwave ovens, infrared from human bodies, visible light, sunburn from ultraviolet, medical X-rays, and nuclear power.',
  credit: 'Diagram: NASA Science, “The Electromagnetic Spectrum.”',
  creditUrl: DIAGRAM_URL,
}

export const SOURCES = [
  {
    id: 'tour-pdf',
    title: 'NASA, Tour of the Electromagnetic Spectrum, Third Edition',
    organization: 'NASA',
    url: PDF_URL,
    credits: [
      'Ginger Butcher, Author (Science Systems and Applications, Inc.)',
      'Jenny Mottar, Graphic Design and Layout (Digital Management, Inc.)',
      'Dr. Claire L. Parkinson, Editor and Science Advisor (NASA Goddard Space Flight Center)',
      'Dr. Edward J. Wollack, Editor and Science Advisor (NASA Goddard Space Flight Center)',
    ],
    pub: 'Third edition, 2016 · NP-2016-05-2159-HQ · ISBN 978-0-9967780-2-2',
    usedIn:
      'Every explanatory section: the spectrum overview, wave anatomy, wave behaviors, the atmosphere, energy-to-image, each spectral region, Earth’s radiation budget, and the remote-sensing connections.',
  },
  {
    id: 'ems-diagram',
    title: 'NASA Science: “The Electromagnetic Spectrum” diagram',
    organization: 'NASA Science',
    url: DIAGRAM_URL,
    credits: ['NASA Science (science.nasa.gov)'],
    pub: 'Official NASA Science learning resource.',
    usedIn: 'The lesson hero and the interactive spectrum explorer.',
  },
]
