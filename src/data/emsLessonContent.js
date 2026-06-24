// Content for the "What Is the Electromagnetic Spectrum?" lesson.
// Sourced ONLY from NASA, Tour of the Electromagnetic Spectrum, 3rd Ed. (PDF)
// + NASA Science EMS diagram. Direct quotes are verbatim with printed page #s;
// other prose is source-adapted (cited with page ranges in the components).
// Grade-keyed text uses '6-8' and '9-12'.

export const GRADE_BANDS = [
  { id: '6-8', label: 'Grades 6–8' },
  { id: '9-12', label: 'Grades 9–12' },
]
export const GRADE_LABEL = { '6-8': 'Grades 6–8', '9-12': 'Grades 9–12' }

export const SECTIONS = [
  { id: 'around-us', label: 'The spectrum around us' },
  { id: 'waves', label: 'How electromagnetic waves work' },
  { id: 'matter', label: 'Light interacting with matter' },
  { id: 'atmosphere', label: 'Earth’s protective atmosphere' },
  { id: 'energy-image', label: 'From energy to image' },
  { id: 'regions', label: 'Explore each type of electromagnetic energy' },
  { id: 'radiation-budget', label: 'Earth’s radiation budget' },
  { id: 'remote-sensing', label: 'Remote sensing connections' },
  { id: 'review', label: 'Review your understanding' },
  { id: 'sources', label: 'NASA sources and credits' },
]

export const HEADER = {
  title: 'What Is the Electromagnetic Spectrum?',
  subtitle:
    'Light is much more than what human eyes can see. Explore the electromagnetic energy NASA uses to study Earth, space, and the universe.',
  chips: ['Spectrum', 'Deep-dive lesson', 'Grades 6–12', '35–45 min'],
}

// Verified verbatim quotes (exact wording + printed page).
export const QUOTES = {
  fullRange: { text: 'NASA’s scientific instruments use the full range of the electromagnetic spectrum to study the Earth, the solar system, and the universe beyond.', page: 2 },
  windows: { text: 'These regions of the spectrum with wavelengths that can pass through the atmosphere are referred to as “atmospheric windows.”', page: 3 },
  ionizing: { text: 'Gamma rays, x-rays, and some ultraviolet waves are “ionizing,” meaning these waves have such a high energy that they can knock electrons out of atoms.', page: 3 },
  photons: { text: 'Light is made of discrete packets of energy called photons. Photons carry momentum, have no mass, and travel at the speed of light. All light has both particle-like and wave-like properties.', page: 4 },
  fields: { text: 'Electromagnetic waves are formed by the vibrations of electric and magnetic fields. These fields are perpendicular to one another in the direction the wave is traveling.', page: 5 },
  energy: { text: 'Moving along the spectrum from long to short wavelengths, energy increases as the wavelength shortens.', page: 5 },
  behaviors: { text: 'Light can be transmitted, reflected, absorbed, refracted, polarized, diffracted, and scattered.', page: 6 },
  falseColor: { text: 'False color, or representative color, is used to help scientists visualize data from wavelengths beyond the visible spectrum.', page: 8 },
  radioLongest: { text: 'Radio waves have the longest wavelengths in the electromagnetic spectrum.', page: 10 },
  infraredHeat: { text: 'We can sense some infrared energy as heat.', page: 14 },
  visibleSmall: { text: 'All electromagnetic radiation is light, but we can only see a small portion of this radiation—the portion we call visible light.', page: 18 },
  gammaShortest: { text: 'Gamma rays have the smallest wavelengths and the most energy of any wave in the electromagnetic spectrum.', page: 24 },
  skyBlue: { text: 'The sky appears blue because of this scattering behavior.', page: 7 },
}

// ── The spectrum around us ────────────────────────────────────────────────
export const AROUND_US = {
  intro: {
    '6-8': 'When you tune a radio, watch TV, send a text, or pop popcorn in a microwave oven, you are using electromagnetic energy. We use it every hour of every day. This energy travels in waves, from very long radio waves to very short gamma rays — but our eyes only see a small slice called visible light.',
    '9-12': 'Electromagnetic energy is part of daily life — tuning a radio, watching television, sending a text message, running a microwave oven, taking a medical X-ray, or sensing heat with an infrared instrument. It travels in waves spanning a broad spectrum from very long radio waves to very short gamma rays, yet the human eye detects only the narrow band we call visible light. A radio detects one portion; an X-ray machine uses another.',
  },
  pages: '2–3',
}

// hotspots over the NASA diagram (left% / width% across the 2500×1404 image)
export const HOTSPOTS = [
  { id: 'radio', name: 'Radio waves', left: 4, width: 22, region: 'radio', wavelength: 'longest', energy: 'lowest',
    everyday: 'AM/FM radio, television, and cell-phone or Wi-Fi signals.',
    nasaExample: 'Radio telescopes study planets, gas clouds, stars, and galaxies by the radio waves they emit.',
    blurb: { '6-8': 'Radio waves are the longest waves. We use them to send sound and signals through the air.', '9-12': 'Radio waves have the longest wavelengths and lowest energy; NASA uses radio astronomy to observe sources unaffected by sunlight, clouds, or rain.' } },
  { id: 'micro', name: 'Microwaves', left: 27, width: 13, region: 'micro', wavelength: 'long', energy: 'low',
    everyday: 'Microwave ovens, radar, and GPS.',
    nasaExample: 'C-band microwaves penetrate clouds, dust, smoke, and rain to reveal Earth’s surface from space.',
    blurb: { '6-8': 'Microwaves can pass through clouds and smoke, so satellites can “see” the surface even on cloudy days.', '9-12': 'Microwaves sit at the high-frequency end of the radio band; active radar and passive radiometers observe weather, sea ice, and soil moisture.' } },
  { id: 'infrared', name: 'Infrared', left: 42, width: 13, region: 'infrared', wavelength: 'medium', energy: 'medium',
    everyday: 'TV remotes; warm objects like people and animals radiate infrared.',
    nasaExample: 'Infrared lets telescopes see through dust and reveal cool objects hidden in visible light.',
    blurb: { '6-8': 'Some infrared we feel as heat. Special cameras can “see” the heat coming off warm things.', '9-12': 'Infrared lies just beyond red; thermal infrared (≈8–15 µm) is used to study longwave heat radiating from Earth.' } },
  { id: 'visible', name: 'Visible light', left: 56, width: 5, region: 'visible', wavelength: 'short', energy: 'medium',
    everyday: 'The only light human eyes can see — all the colors of the rainbow.',
    nasaExample: 'Instruments capture visible bands to build natural-color images of Earth and space.',
    blurb: { '6-8': 'Visible light is the tiny part of the spectrum our eyes can see.', '9-12': 'Visible light spans roughly 380 nm (violet) to 700 nm (red) — a very narrow band of the full spectrum.' } },
  { id: 'uv', name: 'Ultraviolet', left: 62, width: 11, region: 'uv', wavelength: 'short', energy: 'high',
    everyday: 'UV from the Sun causes sunburn.',
    nasaExample: 'UV observations from space study hot young stars, the Sun, and the ozone layer.',
    blurb: { '6-8': 'Ultraviolet has more energy than visible light. Most of it is blocked by our atmosphere.', '9-12': 'UV (subdivided UV-A/B/C) is largely absorbed by atmospheric ozone; space-based instruments observe solar and stellar UV.' } },
  { id: 'xray', name: 'X-rays', left: 74, width: 12, region: 'xray', wavelength: 'shorter', energy: 'higher',
    everyday: 'Medical X-rays image bones inside the body.',
    nasaExample: 'X-ray telescopes in orbit study million-degree gas, supernova remnants, and matter around black holes.',
    blurb: { '6-8': 'X-rays are high-energy waves that can pass through some materials. Earth’s air blocks most space X-rays.', '9-12': 'X-rays (≈0.03–3 nm) come from objects millions of degrees hot; the atmosphere blocks them, so detectors must orbit above it.' } },
  { id: 'gamma', name: 'Gamma rays', left: 88, width: 10, region: 'gamma', wavelength: 'shortest', energy: 'highest',
    everyday: 'Produced on Earth by nuclear reactions, lightning, and radioactive decay.',
    nasaExample: 'Gamma rays come from the universe’s most energetic objects — neutron stars, pulsars, supernovae, and black holes.',
    blurb: { '6-8': 'Gamma rays have the shortest waves and the most energy of all.', '9-12': 'Gamma rays carry the highest energy in the spectrum; they pass through ordinary mirrors and must be observed above the atmosphere.' } },
]

// ── How electromagnetic waves work ────────────────────────────────────────
export const WAVES = {
  mechanicalVsEm: {
    '6-8': 'Sound and water waves are mechanical waves — they need a material, called a medium, to travel through. That is why sound cannot travel through the empty vacuum of space. Electromagnetic waves are different: they do not need a medium, so light from the Sun can cross empty space to reach us.',
    '9-12': 'Mechanical waves (sound, water) are caused by a disturbance in a medium and transfer energy by making molecules bump into one another; they cannot travel through a vacuum. Electromagnetic waves differ in that they require no medium — a changing magnetic field induces a changing electric field and vice-versa, and these linked fields propagate through air, solids, and the vacuum of space.',
  },
  fieldsEnergy: {
    '6-8': 'An electromagnetic wave is made of an electric field and a magnetic field. The distance between two crests is the wavelength, and the number of crests passing a point each second is the frequency. As wavelength gets shorter, the energy gets higher.',
    '9-12': 'Electromagnetic energy can be described by frequency (Hz), wavelength (m), or energy (eV) — all mathematically related. The distance between crests is the wavelength; the number of crests passing a point per second is the frequency (Hertz). Energy increases as wavelength shortens.',
  },
  photonView: {
    '6-8': 'Light also behaves like tiny packets of energy called photons. When photons hit a detector — like the sensor in a digital camera — they free electrons that the instrument turns into picture data.',
    '9-12': 'Light has both wave-like and particle-like properties; which is observed depends on the instrument. A diffraction spectrometer reveals the wave nature, while digital-camera detectors reveal the particle nature — individual photons liberate electrons used to store image data.',
  },
  polarization: {
    '6-8': 'Light can also be polarized, meaning its waves line up in a certain direction. Polarized sunglasses cut glare by blocking light with one alignment.',
    '9-12': 'Polarization measures the alignment of the electromagnetic field. Like a Frisbee passing through a picket fence in only one orientation, polarized sunglasses eliminate glare by absorbing the polarized portion of light.',
  },
  pages: '4–5',
  note: 'This interactive diagram is based on explanations in NASA’s Tour of the Electromagnetic Spectrum. It is a simplified visualization and is not drawn to scale.',
}

// ── Light interacting with matter (Wave Behaviors) ────────────────────────
export const BEHAVIORS = [
  { id: 'reflection', name: 'Reflection',
    explain: { '6-8': 'Light can bounce off a surface. Very smooth surfaces like mirrors reflect almost all the light that hits them.', '9-12': 'When incident light hits an object and bounces off, that is reflected energy; very smooth surfaces such as mirrors reflect almost all incident light.' },
    nasaExample: 'Lasers on NASA’s Lunar Reconnaissance Orbiter time how long a pulse takes to return, mapping the Moon’s topography by reflection.',
    why: 'Reflection timing reveals distance and elevation.', remoteSensing: 'Most of what satellites measure is reflected sunlight from Earth’s surface.', page: 6 },
  { id: 'absorption', name: 'Absorption',
    explain: { '6-8': 'Some light is taken in by an object instead of bouncing off. Dark pavement absorbs more energy than light concrete, so it gets hotter — and later gives that heat off as infrared.', '9-12': 'Absorption occurs when photons hit atoms and molecules and make them vibrate; the more they vibrate, the hotter the object becomes. Black pavement absorbs most visible and UV energy and re-radiates it as longer-wavelength infrared.' },
    nasaExample: 'Thermal radiation from asphalt and roofs can raise a city’s surface temperature by as much as 10 °C — the “urban heat island” effect, seen in a Landsat 7 image of Atlanta.',
    why: 'Absorbed energy becomes heat that can be measured.', remoteSensing: 'Thermal infrared sensors detect this emitted heat to compare surfaces.', page: 6 },
  { id: 'transmission', name: 'Transmission',
    explain: { '6-8': 'Some light passes straight through a material, like sunlight through clear air or water.', '9-12': 'Transmission occurs when electromagnetic energy passes through a material; whether light is transmitted, reflected, or absorbed depends on the object’s composition and the wavelength of the light.' },
    nasaExample: 'Visible light is largely transmitted through the atmosphere — an “atmospheric window.”',
    why: 'Transmission lets energy reach a sensor through a medium.', remoteSensing: 'Atmospheric windows determine which wavelengths satellites can use.', page: 6 },
  { id: 'refraction', name: 'Refraction',
    explain: { '6-8': 'Light bends when it moves from one material into another, like air into glass or water. Different colors bend by different amounts.', '9-12': 'Refraction is the change in direction as light passes between media; it travels slower in denser media, and different wavelengths slow at different rates, bending at different angles.' },
    nasaExample: 'A prism separates white light into the colors of the rainbow; natural rainbows form from refraction and reflection.',
    why: 'Different wavelengths separate, revealing composition.', remoteSensing: 'Refraction underlies how prisms and gratings split light for analysis.', page: 7 },
  { id: 'scattering', name: 'Scattering',
    explain: { '6-8': 'Light can bounce off tiny particles in many directions. Shorter blue and violet waves scatter the most in our air, which is why the sky looks blue.', '9-12': 'Scattering redirects light in many directions depending on wavelength and particle size; shorter (blue/violet) wavelengths scatter strongly off nitrogen and oxygen, illuminating the sky with blue light.' },
    nasaExample: 'NASA’s CALIPSO satellite observes scattering of laser pulses to map aerosols such as dust, smoke, and volcanic ash — for example, ash from Iceland’s Eyjafjallajökull in 2010.',
    why: 'Scattering reveals particles in the atmosphere.', remoteSensing: 'Aerosol, smoke, and ash distributions can be tracked from space.', page: 7 },
  { id: 'diffraction', name: 'Diffraction',
    explain: { '6-8': 'Waves bend and spread when they pass an edge or a narrow opening. Instruments use this to split light into a rainbow of wavelengths.', '9-12': 'Diffraction is the bending and spreading of waves around an obstacle, most pronounced when the obstacle is comparable to the wavelength; a spectrometer uses diffraction to separate light into a spectrum.' },
    nasaExample: 'A graph of separated wavelengths is a spectral signature; patterns help scientists identify the condition and composition of matter.',
    why: 'Spectral signatures act like fingerprints for materials.', remoteSensing: 'Spectrometers identify materials by their spectral signatures.', page: 7 },
  { id: 'polarization', name: 'Polarization',
    explain: { '6-8': 'Light waves can line up in one direction. Polarized sunglasses block the aligned glare bouncing off roads and water.', '9-12': 'Polarization measures the alignment of the electromagnetic field; polarized sunglasses eliminate glare by absorbing the polarized portion of light.' },
    nasaExample: 'Polarized sunglasses reduce glare by absorbing one alignment of light.',
    why: 'Polarization carries information about surfaces and scattering.', remoteSensing: 'Polarization measurements help characterize aerosols and surfaces.', page: 5 },
]

// ── Earth’s protective atmosphere ─────────────────────────────────────────
export const ATMOSPHERE = {
  intro: {
    '6-8': 'The Sun sends energy across the whole spectrum toward Earth. Our atmosphere lets some of it through and blocks a lot of the dangerous, high-energy kinds. Visible light mostly passes through, and some microwaves even pass through clouds.',
    '9-12': 'Electromagnetic radiation is reflected or absorbed mainly by water vapor, carbon dioxide, and ozone. Visible light is largely transmitted; some microwaves even pass through clouds, making them ideal for satellite communication. The atmosphere shields life from much high-energy radiation but also blocks wavelengths scientists want to study.',
  },
  paths: [
    { id: 'transmitted', label: 'Transmitted', kind: 'pass', text: 'Visible light and some microwaves pass through.' },
    { id: 'absorbed', label: 'Absorbed', kind: 'partial', text: 'Water vapor, CO₂, and ozone absorb certain wavelengths.' },
    { id: 'reflected', label: 'Reflected', kind: 'partial', text: 'Some energy is reflected by the atmosphere and surface.' },
    { id: 'blocked', label: 'Blocked', kind: 'blocked', text: 'Most UV, X-rays, and gamma rays are blocked before the surface.' },
  ],
  spaceNote: {
    '6-8': 'Because the atmosphere blocks high-energy light, NASA puts telescopes in space to “see” ultraviolet, X-rays, and gamma rays. Very low-energy radio waves can also be affected by the upper atmosphere.',
    '9-12': 'Sensitive instruments are positioned above the energy-absorbing atmosphere to observe energetic UV, X-ray, and gamma-ray sources. The upper atmosphere also reflects very low-energy radio waves coming from space.',
  },
  pages: '2–3',
}

// ── From energy to image ──────────────────────────────────────────────────
export const ENERGY_IMAGE = {
  pipeline: [
    'Electromagnetic energy',
    'Instrument / detector',
    'Photons free electrons',
    'Numerical data',
    'Transmitted to Earth',
    'Processed into images',
    'Natural- or false-color',
  ],
  intro: {
    '6-8': 'A scientific instrument aims energy onto a detector, where photons free electrons. That becomes numbers — “data” — that are sent to Earth and processed into images.',
    '9-12': 'Instruments direct electromagnetic energy onto a detector where individual photons yield electrons related to the incoming energy. The energy is now “data,” which can be transmitted to Earth and processed into images.',
  },
  camera: {
    '6-8': 'A digital camera measures the brightness of red, green, and blue light as numbers, then combines those three channels into a color picture.',
    '9-12': 'A camera sensor captures the brightness of red, green, and blue light as numbers; the three data sets are combined in the red, green, and blue channels of a display to create a color image.',
  },
  natural: {
    '6-8': 'Natural color puts the real red, green, and blue measurements into the matching display colors, so the image looks close to what your eyes would see from space.',
    '9-12': 'Natural-color images composite visible-light bands into their respective red, green, and blue display channels, simulating the colors the eye would see from the spacecraft’s vantage point.',
  },
  false: {
    '6-8': 'False color puts invisible wavelengths into visible display colors so we can spot patterns we could never see directly.',
    '9-12': 'False (representative) color assigns non-visible wavelengths to display colors, revealing compositional or structural patterns that would otherwise be invisible.',
  },
  themis: 'NASA’s Mars Odyssey THEMIS camera uses false-color infrared to reveal differences in the mineralogy, composition, and structure of the Martian surface.',
  pages: '8–9',
}

// ── Explore each region in detail ─────────────────────────────────────────
export const REGIONS = [
  { id: 'radio', name: 'Radio waves', page: 10,
    distinct: { '6-8': 'The longest waves in the spectrum — from the size of a football to bigger than our planet.', '9-12': 'The longest wavelengths in the spectrum, described in terms of frequency (Hertz).' },
    uses: 'Communication, television, and radio astronomy.',
    nasaExample: 'The Very Large Array combines 27 antennas to make sharp radio images; radio astronomy is not affected by sunlight, clouds, or rain.',
    atmosphere: 'The upper atmosphere can reflect very low-energy radio waves from space.',
    remoteSensing: 'Radio reveals objects hidden by dust and the motion and composition of distant sources.',
    learnMore: 'Heinrich Hertz proved radio waves exist in the late 1880s. Because radio waves are long, radio telescopes must be large to match the resolution of optical telescopes.' },
  { id: 'micro', name: 'Microwaves', page: 12,
    distinct: { '6-8': 'A band at the high-frequency end of radio. They can pass through clouds, smoke, rain, and snow.', '9-12': 'A high-frequency portion of the radio band, distinguished by the technology used to access it; sub-bands carry different information.' },
    uses: 'Communication, GPS, radar, and microwave ovens.',
    nasaExample: 'NASA’s SMAP and AMSR instruments map soil moisture and sea ice; radar altimeters measure sea-surface height to within centimeters.',
    atmosphere: 'C-band microwaves penetrate clouds, dust, smoke, snow, and rain to reveal the surface.',
    remoteSensing: 'Active (radar) and passive (radiometer) microwave sensing support weather, sea-ice, and soil-moisture study.',
    learnMore: 'In 1965 Penzias and Wilson detected the cosmic microwave background — a clue to the Big Bang — later mapped in detail by WMAP.' },
  { id: 'infrared', name: 'Infrared waves', page: 14,
    distinct: { '6-8': 'Light just beyond red that we often feel as heat.', '9-12': 'Divided into near-, mid-, and far-infrared; the 8–15 µm thermal-infrared region studies longwave heat radiating from Earth.' },
    uses: 'TV remotes; thermal/night-vision cameras; studying heat.',
    nasaExample: 'The Spitzer Space Telescope detected ~2,300 planet-forming disks in the Orion nebula by their warm dust; MODIS uses infrared to pinpoint forest fires.',
    atmosphere: 'Infrared can pass through gas and dust with less scattering than visible light.',
    remoteSensing: 'Earth-observing satellites sense emitted infrared to study land and sea surface temperatures.',
    learnMore: 'William Herschel discovered infrared in 1800 when a thermometer just beyond red read warmer than the visible colors.' },
  { id: 'nearIr', name: 'Reflected near-infrared waves', page: 16,
    distinct: { '6-8': 'Near-infrared is just past visible light. Plants reflect a lot of it — even though we can’t see it.', '9-12': 'Rather than emitted heat, near-infrared studies how surfaces reflect, transmit, and absorb the Sun’s near-infrared radiation.' },
    uses: 'Studying vegetation health and soil composition.',
    nasaExample: 'Landsat 7 near-infrared images of Minnesota help farmers assess crop health; USDA uses Landsat to forecast agricultural productivity.',
    atmosphere: 'Reflected near-infrared sunlight can be sensed by satellites to study vegetation from space.',
    remoteSensing: 'A healthier plant with more chlorophyll reflects more near-infrared than a stressed plant.',
    learnMore: 'A leaf looks green because green is reflected while other visible wavelengths are absorbed; its near-infrared response carries extra information our eyes miss.' },
  { id: 'visible', name: 'Visible light', page: 18,
    distinct: { '6-8': 'The small band of light our eyes can see, from violet to red.', '9-12': 'The narrow band our cone cells detect; violet is ~380 nm and red ~700 nm.' },
    uses: 'Natural-color imaging of Earth and space.',
    nasaExample: 'The HiRISE camera on Mars Reconnaissance Orbiter captured a visible-light image of Victoria Crater; the Sun’s corona is visible during a total eclipse.',
    atmosphere: 'Visible light largely passes through the atmosphere (the optical window).',
    remoteSensing: 'Visible bands build natural-color imagery and support spectral signatures of Earth features.',
    learnMore: 'Dark absorption lines in a star’s visible spectrum act like fingerprints for the elements present.' },
  { id: 'uv', name: 'Ultraviolet waves', page: 20,
    distinct: { '6-8': 'Shorter waves than visible light, with more energy. We can’t see UV, but some insects can.', '9-12': 'Higher-energy than visible light, subdivided into UV-A, UV-B, and UV-C; most is absorbed by atmospheric ozone.' },
    uses: 'Studying the Sun, hot young stars, and the ozone layer.',
    nasaExample: 'NASA’s GALEX revealed young stars in galaxy M81; the OMI instrument on Aura maps atmospheric ozone.',
    atmosphere: 'About 95% of UV-B is absorbed by ozone; most high-energy UV is blocked.',
    remoteSensing: 'UV instruments above the atmosphere observe solar and stellar UV and monitor ozone.',
    learnMore: 'Johann Ritter proved ultraviolet exists in 1801 using light-sensitive paper beyond the violet end of the spectrum.' },
  { id: 'xray', name: 'X-rays', page: 22,
    distinct: { '6-8': 'High-energy waves that can pass through some materials. Earth’s air blocks most X-rays from space.', '9-12': 'Much higher energy and shorter wavelength than UV (≈0.03–3 nm); usually described by energy rather than wavelength.' },
    uses: 'Medical imaging; studying extremely hot, energetic objects.',
    nasaExample: 'The Chandra X-ray Observatory images million-degree gas, supernova remnants, and matter around black holes.',
    atmosphere: 'Earth’s atmosphere blocks X-rays, so detectors must be above it.',
    remoteSensing: 'X-ray telescopes use grazing-incidence mirrors to focus photons onto detectors.',
    learnMore: 'Wilhelm Roentgen first documented X-rays in 1895; bones absorb more X-rays than skin, leaving shadows on film.' },
  { id: 'gamma', name: 'Gamma rays', page: 24,
    distinct: { '6-8': 'The shortest waves and the most energy of all.', '9-12': 'The smallest wavelengths and highest energy in the spectrum.' },
    uses: 'Studying the universe’s most energetic objects and events.',
    nasaExample: 'NASA’s Fermi telescope maps the gamma-ray sky; the Swift satellite recorded a gamma-ray burst from a black hole forming 12.8 billion light-years away.',
    atmosphere: 'Must be observed from above much of Earth’s protective atmosphere.',
    remoteSensing: 'MESSENGER’s gamma-ray spectrometer identified elements on Mercury; Mars Odyssey mapped hydrogen on Mars.',
    learnMore: 'Gamma rays pass through ordinary mirrors; detectors use dense crystals where gamma rays collide with electrons (Compton scattering).' },
]

// canonical longest→shortest order (for the ordering activity)
export const WAVELENGTH_ORDER = ['radio', 'micro', 'infrared', 'visible', 'uv', 'xray', 'gamma']

// ── Earth’s radiation budget ──────────────────────────────────────────────
export const RADIATION_BUDGET = {
  intro: {
    '6-8': 'Earth’s radiation budget is the balance between energy coming in from the Sun and energy going back out to space. Earth reflects some sunlight, absorbs some (warming the land, ocean, and air), and then emits that heat as infrared. When the budget is out of balance, temperatures can rise or fall.',
    '9-12': 'The energy entering, reflected, absorbed, and emitted by the Earth system makes up Earth’s radiation budget. Based on conservation of energy, it balances incoming (mostly solar) radiation against outgoing radiation — partly reflected sunlight and partly infrared emitted by the Earth system. An imbalance can change atmospheric temperature and, eventually, climate.',
  },
  parts: [
    { id: 'incoming', label: 'Incoming solar', text: 'Ultraviolet, visible, and some infrared “shortwave” energy arrives from the Sun.' },
    { id: 'reflected', label: 'Reflected', text: 'Some energy is reflected by clouds, aerosols, and bright surfaces like snow and ice.' },
    { id: 'absorbed', label: 'Absorbed', text: 'Some passes through and is absorbed by the surface and atmosphere, warming the planet.' },
    { id: 'emitted', label: 'Emitted longwave', text: 'The warmed Earth emits longwave infrared; some escapes to space, some warms the lower atmosphere.' },
  ],
  cityCallout: {
    '6-8': 'Darker city surfaces absorb more incoming energy and then give it off as heat. Thermal images can reveal which surfaces are warmer.',
    '9-12': 'Darker urban surfaces absorb more incoming energy and re-emit it as thermal infrared; thermal observations reveal surface-temperature differences (the urban heat island).',
  },
  pages: '26–27',
}

// ── Remote sensing connections — "choose the best wavelength" ─────────────
export const SCENARIOS = [
  { id: 's1', prompt: 'Study healthy versus stressed vegetation', answer: 'nearIr',
    feedback: 'Near-infrared. Healthier plants with more chlorophyll reflect more near-infrared, so the response separates healthy from stressed vegetation.', page: 16 },
  { id: 's2', prompt: 'Observe surface heat in a city', answer: 'infrared',
    feedback: 'Thermal infrared. Warm surfaces emit infrared; dark pavement that absorbed sunlight emits more, revealing urban heat.', page: 14 },
  { id: 's3', prompt: 'Observe through clouds or smoke', answer: 'micro',
    feedback: 'Microwaves. C-band microwaves penetrate clouds, dust, smoke, snow, and rain to reveal the surface.', page: 12 },
  { id: 's4', prompt: 'Study aerosols or volcanic ash', answer: 'visible',
    feedback: 'Visible/near-visible scattering. NASA’s CALIPSO observes scattering of laser pulses to map dust, smoke, and volcanic ash.', page: 7 },
  { id: 's5', prompt: 'Make a natural-color Earth image', answer: 'visible',
    feedback: 'Visible light. Visible bands are composited into red, green, and blue display channels to approximate what eyes would see.', page: 8 },
  { id: 's6', prompt: 'Observe high-energy sources in space', answer: 'xray',
    feedback: 'X-rays (or gamma rays). Energetic objects like black-hole accretion disks emit X-rays, observed by telescopes above the atmosphere.', page: 22 },
]
export const SCENARIO_OPTIONS = [
  { id: 'micro', label: 'Microwaves' },
  { id: 'infrared', label: 'Thermal infrared' },
  { id: 'nearIr', label: 'Near-infrared' },
  { id: 'visible', label: 'Visible' },
  { id: 'uv', label: 'Ultraviolet' },
  { id: 'xray', label: 'X-rays' },
]

// ── Review ────────────────────────────────────────────────────────────────
export const REVIEW = {
  matching: [
    { region: 'Radio waves', use: 'Radio astronomy & communication' },
    { region: 'Microwaves', use: 'See through clouds; soil moisture & sea ice' },
    { region: 'Thermal infrared', use: 'Measure emitted surface heat' },
    { region: 'Near-infrared', use: 'Assess vegetation health' },
    { region: 'Visible light', use: 'Natural-color imagery' },
    { region: 'X-rays', use: 'Study million-degree cosmic sources' },
  ],
  quiz: [
    { id: 'r1', question: 'Which part of the spectrum can human eyes detect?',
      options: ['Infrared', 'Visible light', 'Microwaves', 'Gamma rays'], answer: 1,
      feedback: 'Human eyes detect only visible light — a small portion of the full spectrum.', page: 18 },
    { id: 'r2', question: 'Why do scientists use false color?',
      options: [
        'To make images more colorful',
        'To represent invisible wavelengths using visible display colors and reveal hidden patterns',
        'Because cameras cannot record visible light',
        'To reduce file size',
      ], answer: 1,
      feedback: 'False color assigns non-visible wavelengths to display colors, revealing patterns not obvious in natural-color imagery.', page: 8 },
    { id: 'r3', question: 'Why do some instruments need to operate above Earth’s atmosphere?',
      options: [
        'To get closer to the Sun',
        'The atmosphere absorbs or blocks much ultraviolet, X-ray, and gamma-ray energy',
        'To avoid clouds only',
        'Because radio waves cannot reach space',
      ], answer: 1,
      feedback: 'The atmosphere blocks much high-energy radiation, so UV, X-ray, and gamma-ray instruments must orbit above it.', page: 3 },
    { id: 'r4', question: 'Why might pavement look hotter than nearby vegetation in a thermal image?',
      options: [
        'Pavement reflects more visible light',
        'Dark pavement absorbs more incoming energy and later emits thermal infrared',
        'Vegetation blocks all infrared',
        'Pavement is closer to the Sun',
      ], answer: 1,
      feedback: 'Dark pavement absorbs more incoming energy and re-radiates it as thermal infrared, so it appears warmer.', page: 6 },
  ],
  reflection: 'In your own words: explain how a single beam of sunlight could end up as a false-color satellite image. Mention at least one wave behavior and one part of the spectrum.',
}
