// Electromagnetic spectrum regions, ordered long-wavelength/low-energy →
// short-wavelength/high-energy. colorClass strings are standard Tailwind
// gradient utilities (written as literals here so Tailwind's scanner generates
// them). Used by the Electromagnetic Spectrum Slider animation module.

export const SPECTRUM_REGIONS = [
  {
    id: 'radio',
    name: 'Radio',
    wavelengthLabel: 'Longer than 1 meter',
    approxRange: '> 1 m',
    energyLevel: 1,
    frequencyLevel: 1,
    colorClass: 'from-slate-300 to-blue-200',
    example: 'Radio communication',
    remoteSensingUse: 'Used in radio astronomy and communication.',
    simpleText: 'Radio waves are very long waves used for communication.',
    middleText:
      'Radio waves have the longest wavelengths and lowest energy in the electromagnetic spectrum.',
    highText:
      'Radio waves have wavelengths longer than about 1 meter and are useful for communication, radar systems, and radio astronomy.',
  },
  {
    id: 'microwave',
    name: 'Microwave',
    wavelengthLabel: '1 meter to 1 millimeter',
    approxRange: '1 m – 1 mm',
    energyLevel: 2,
    frequencyLevel: 2,
    colorClass: 'from-cyan-200 to-teal-200',
    example: 'Radar and microwave ovens',
    remoteSensingUse: 'Used by radar satellites to observe Earth through clouds.',
    simpleText: 'Microwaves can help satellites see through clouds.',
    middleText: 'Microwaves are used in radar, weather observations, GPS, and some satellite sensors.',
    highText:
      'Microwave remote sensing can be active, such as radar, or passive, detecting natural microwave energy from Earth.',
  },
  {
    id: 'infrared',
    name: 'Infrared',
    wavelengthLabel: '1 millimeter to 700 nanometers',
    approxRange: '1 mm – 700 nm',
    energyLevel: 3,
    frequencyLevel: 3,
    colorClass: 'from-orange-200 to-red-200',
    example: 'Heat and thermal cameras',
    remoteSensingUse: 'Used to study vegetation, heat, fires, clouds, and surface temperature.',
    simpleText: 'Infrared light is invisible to our eyes, but we can feel some of it as heat.',
    middleText:
      'Infrared wavelengths help scientists study plant health, heat, and Earth’s surface.',
    highText:
      'Near-infrared is useful for vegetation studies, while thermal infrared helps measure emitted heat from surfaces.',
  },
  {
    id: 'visible',
    name: 'Visible',
    wavelengthLabel: '700 to 400 nanometers',
    approxRange: '700–400 nm',
    energyLevel: 4,
    frequencyLevel: 4,
    colorClass: 'from-red-300 via-green-200 to-violet-300',
    example: 'Human vision',
    remoteSensingUse: 'Used in natural-color satellite images.',
    simpleText: 'Visible light is the small part of the spectrum that human eyes can see.',
    middleText: 'Visible light includes the colors red, orange, yellow, green, blue, indigo, and violet.',
    highText:
      'Visible wavelengths are commonly used in natural-color imagery, but they represent only a small part of the full electromagnetic spectrum.',
  },
  {
    id: 'ultraviolet',
    name: 'Ultraviolet',
    wavelengthLabel: '400 to 10 nanometers',
    approxRange: '400–10 nm',
    energyLevel: 5,
    frequencyLevel: 5,
    colorClass: 'from-purple-200 to-fuchsia-300',
    example: 'Sunburn and young stars',
    remoteSensingUse: 'Used to study the Sun, atmosphere, and energetic objects in space.',
    simpleText: 'Ultraviolet light has more energy than visible light and can cause sunburn.',
    middleText: 'Ultraviolet light is invisible and has shorter wavelengths than visible light.',
    highText:
      'Ultraviolet observations help scientists study solar activity, atmospheric chemistry, and hot young stars.',
  },
  {
    id: 'xray',
    name: 'X-ray',
    wavelengthLabel: '10 to 0.01 nanometers',
    approxRange: '10–0.01 nm',
    energyLevel: 6,
    frequencyLevel: 6,
    colorClass: 'from-indigo-300 to-blue-400',
    example: 'Medical imaging',
    remoteSensingUse: 'Used in astronomy to study very hot and energetic objects.',
    simpleText: 'X-rays are high-energy waves that can pass through some materials.',
    middleText: 'X-rays have much shorter wavelengths and higher energy than ultraviolet light.',
    highText:
      'X-ray astronomy reveals energetic phenomena such as black holes, neutron stars, and supernova remnants.',
  },
  {
    id: 'gamma',
    name: 'Gamma Ray',
    wavelengthLabel: 'Shorter than 0.01 nanometers',
    approxRange: '< 0.01 nm',
    energyLevel: 7,
    frequencyLevel: 7,
    colorClass: 'from-violet-500 to-slate-900',
    example: 'Extreme space events',
    remoteSensingUse: 'Used to study the most energetic events in the universe.',
    simpleText: 'Gamma rays are the highest-energy waves in the electromagnetic spectrum.',
    middleText: 'Gamma rays have the shortest wavelengths and the highest energy.',
    highText:
      'Gamma-ray observations help scientists study extreme events such as gamma-ray bursts, supernovae, and active galactic nuclei.',
  },
]

// Map the shared grade level to the right explanation field.
export function gradeText(region, grade) {
  if (grade === 'elementary') return region.simpleText
  if (grade === 'high') return region.highText
  return region.middleText
}

// Short symbol per region for the info card.
export const REGION_SYMBOL = {
  radio: '📻',
  microwave: '📡',
  infrared: '🔥',
  visible: '🌈',
  ultraviolet: '🌞',
  xray: '🦴',
  gamma: '☢️',
}
