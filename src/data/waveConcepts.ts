// @ts-nocheck
// Content + presets for the Wave Anatomy animation module.

export const waveConcepts = {
  amplitude: {
    label: 'Amplitude',
    whatToLookAt: 'Watch how tall the wave becomes above and below the middle line.',
    elementary: 'Amplitude is how tall the wave is.',
    middle: 'Amplitude is the distance from the middle line to the top of the wave.',
    high: 'Amplitude is the maximum displacement from equilibrium. In sensing systems, amplitude can relate to signal strength or intensity.',
  },
  wavelength: {
    label: 'Wavelength',
    whatToLookAt: 'Look at the distance from one crest to the next crest.',
    elementary: 'Wavelength is the distance from one wave top to the next wave top.',
    middle: 'Wavelength is the distance between matching points on a wave, such as crest to crest.',
    high: 'Wavelength is the spatial period of a wave. In remote sensing, sensors are designed to detect specific wavelength ranges.',
  },
  frequency: {
    label: 'Frequency',
    whatToLookAt: 'Watch how often wave crests pass the detector.',
    elementary: 'Frequency tells how often waves pass by.',
    middle: 'Frequency is how many wave cycles pass a point in a certain amount of time.',
    high: 'Frequency is cycles per second. For electromagnetic waves, frequency increases as wavelength decreases.',
  },
  crest: {
    label: 'Crest',
    whatToLookAt: 'Find the highest point of the wave.',
    elementary: 'A crest is the top of a wave.',
    middle: 'A crest is the highest point in one wave cycle.',
    high: 'A crest is a point of maximum positive displacement.',
  },
  trough: {
    label: 'Trough',
    whatToLookAt: 'Find the lowest point of the wave.',
    elementary: 'A trough is the bottom of a wave.',
    middle: 'A trough is the lowest point in one wave cycle.',
    high: 'A trough is a point of maximum negative displacement.',
  },
  equilibrium: {
    label: 'Equilibrium',
    whatToLookAt: 'Look at the center line the wave moves around.',
    elementary: 'The middle line is where the wave rests.',
    middle: 'The equilibrium line is the center position of the wave.',
    high: 'Equilibrium is the reference level from which displacement is measured.',
  },
  direction: {
    label: 'Wave direction',
    whatToLookAt: 'Look at the arrow showing where the wave travels.',
    elementary: 'The wave moves this way.',
    middle: 'Wave direction shows how the wave travels through space.',
    high: 'Wave direction represents propagation direction. In diagrams, the wave shape moves while energy travels forward.',
  },
}

// Remote-sensing connection line shown for relevant concepts.
export const CONCEPT_RS = {
  amplitude: 'Stronger signals (larger amplitude) are easier for a sensor to detect.',
  wavelength: 'Each satellite band is tuned to a specific wavelength range.',
  frequency: 'Higher-frequency waves carry more energy per photon.',
  direction: 'Energy travels forward even though the wave shape oscillates up and down.',
}

export const CONCEPT_ORDER = ['amplitude', 'wavelength', 'frequency', 'crest', 'trough', 'equilibrium', 'direction']

// Amplitude: 20–90 px · Wavelength: 80–280 px
export const WAVE_LIMITS = { ampMin: 20, ampMax: 90, wlMin: 80, wlMax: 280 }
export const WAVE_DEFAULTS = { amplitude: 50, wavelength: 180 }

export const WAVE_PRESETS = {
  longWave: { label: 'Long wave', amplitude: 45, wavelength: 270 },
  balanced: { label: 'Balanced wave', amplitude: 55, wavelength: 180 },
  shortWave: { label: 'Short wave', amplitude: 35, wavelength: 95 },
  custom: { label: 'Custom' },
}
export const PRESET_ORDER = ['longWave', 'balanced', 'shortWave', 'custom']

export const TRY_THIS = {
  elementary: 'Make the wave taller. What changed?',
  middle: 'Make the wavelength shorter. What happens to the number of waves on the screen?',
  high: 'Shorten the wavelength. How does the frequency meter change? How does this connect to wave speed = wavelength × frequency?',
}

export const GRADE_LABEL = { elementary: 'Elementary', middle: 'Middle', high: 'High' }

// Derived frequency (0..1): shorter wavelength → higher frequency.
export const frequencyNormalized = (wavelength) =>
  1 - (wavelength - WAVE_LIMITS.wlMin) / (WAVE_LIMITS.wlMax - WAVE_LIMITS.wlMin)
