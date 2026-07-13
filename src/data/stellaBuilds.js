// STELLA device lab: instruments, parts, build steps, and simulator specs.
//
// Everything here is drawn from NASA Goddard's official STELLA project pages
// (science.gsfc.nasa.gov/stella, retrieved 2026-07-10): the STELLA-1.2 base
// platform build guide and the STELLA-RS / STELLA-AA1 / Prototyping module
// pages. Costs are NASA's published approximate part costs. Instrument photos
// are NASA images from those pages (U.S. government works). This is an
// independent educational project; no NASA endorsement is implied.

export const STELLA_SOURCE = {
  indexUrl: 'https://science.gsfc.nasa.gov/stella/instruments/',
  baseUrl: 'https://science.gsfc.nasa.gov/stella/instruments/stella-1-2/',
  buildVideoUrl: 'https://youtu.be/ZaAOqSWlaVw',
  credit:
    'Instrument designs, parts lists, and photos courtesy of NASA Goddard Space Flight Center, STELLA project (science.gsfc.nasa.gov/stella). Retrieved 2026-07-10.',
}

// AS7265x "Triad" spectral band centers (nm) used by the RS module and the
// STELLA-Q2: 18 channels from 410 nm (violet) to 940 nm (NIR).
export const RS_BANDS = [
  410, 435, 460, 485, 510, 535, 560, 585, 610, 645, 680, 705, 730, 760, 810, 860, 900, 940,
]

// STELLA-1.1 band centers: AS7262 visible (V450-R650) + AS7263 NIR (610-860).
export const S11_BANDS = [450, 500, 550, 570, 600, 610, 650, 680, 730, 760, 810, 860]

// Interpolate a target's spectrum (defined on RS_BANDS) at any wavelength, so
// instruments with different band sets share the same "point at" targets.
export function spectrumAt(target, nm) {
  const bands = RS_BANDS
  if (nm <= bands[0]) return target.spectrum[0]
  for (let i = 1; i < bands.length; i++) {
    if (nm <= bands[i]) {
      const f = (nm - bands[i - 1]) / (bands[i] - bands[i - 1])
      return target.spectrum[i - 1] + (target.spectrum[i] - target.spectrum[i - 1]) * f
    }
  }
  return target.spectrum[bands.length - 1]
}

// The real STELLA-1.2 screen colors spectral bars by wavelength and draws NIR
// bands in black. This mirrors that convention on the simulated display.
export function bandColor(nm) {
  if (nm > 750) return '#1c1c22' // NIR: shown black, like the real device
  if (nm < 450) return '#7b2fbe'
  if (nm < 485) return '#3b4fd8'
  if (nm < 500) return '#1e7fd0'
  if (nm < 565) return '#27a04a'
  if (nm < 590) return '#c9c92a'
  if (nm < 625) return '#e08a1e'
  return '#d0342c'
}

// ---- shared STELLA-1.2 base platform parts (order = build order) ------------
// Each step's `callout` describes the part by FUNCTION. Builders pick the
// matching part from the tray, the same way the real guide walks you through.

const BASE_PARTS = [
  {
    id: 'esp32',
    name: 'Feather ESP32-S3',
    kind: 'Microcontroller',
    cost: 18,
    icon: 'chip',
    callout: 'Every instrument starts with a brain. Find the microcontroller that will run CircuitPython and read every sensor.',
    note: 'Runs the CircuitPython firmware. You drag a .uf2 file onto it like a USB drive.',
  },
  {
    id: 'proto',
    name: 'Perma-proto board',
    kind: 'Backbone board',
    cost: 7,
    icon: 'board',
    callout: 'The brain needs a spine. Pick the solderable board every other component wires into.',
    note: 'Full-size perma-proto board. Real builders cut traces and solder here, using lead-free solder at 290 °C.',
  },
  {
    id: 'tft',
    name: '2.8″ touch TFT display',
    kind: 'Display',
    cost: 30,
    icon: 'screen',
    callout: 'Scientists need to SEE their data in the field. Choose the 320×240 capacitive touchscreen.',
    note: 'Connects over an EYESPI ribbon cable. Shows the spectral plot, menus, and battery state.',
  },
  {
    id: 'encoder',
    name: 'Rotary encoder + knob',
    kind: 'Control',
    cost: 5,
    icon: 'knob',
    callout: 'Touchscreens are hard with gloves on. Add the twist-and-click knob for menu navigation.',
    note: 'Turn to highlight, press to select. It’s the same knob you see bottom-right on the real device.',
  },
  {
    id: 'gps',
    name: 'Ultimate GPS breakout',
    kind: 'Positioning',
    cost: 30,
    icon: 'gps',
    callout: 'Field data is useless without knowing WHERE it was taken. Install the satellite positioning module.',
    note: 'Stamps every measurement with lat/lon/altitude and syncs the clock once a minute.',
  },
  {
    id: 'rtc',
    name: 'PCF8523 clock + coin cell',
    kind: 'Timekeeping',
    cost: 7,
    icon: 'clock',
    callout: 'And WHEN it was taken. Add the real-time clock that keeps ticking even when power is off.',
    note: 'Drifts only ±2-3 s/day between GPS syncs. All timestamps are UTC.',
  },
  {
    id: 'sd',
    name: 'SD module + 8 GB card',
    kind: 'Data logging',
    cost: 14,
    icon: 'sd',
    callout: 'Measurements need a home. Install the storage that logs every reading as a CSV file.',
    note: 'The same CSV files you can drop into this site’s Data Visualizer.',
  },
  {
    id: 'boost',
    name: 'TPS61023 5 V boost converter',
    kind: 'Power',
    cost: 4,
    icon: 'bolt',
    callout: 'Sensors want a steady 5 volts. Pick the converter that boosts the battery to a clean supply.',
    note: 'Regulated 5 V / 1 A rail for the sensor modules.',
  },
  {
    id: 'battery',
    name: '6600 mAh lithium battery',
    kind: 'Power',
    cost: 25,
    icon: 'battery',
    callout: 'A full day in the field takes serious energy. Choose the battery pack (charged over USB-C).',
    note: 'NASA’s primary choice. Smaller 2200-4400 mAh packs also fit.',
  },
  {
    id: 'housing',
    name: '3D-printed housing (12 parts)',
    kind: 'Structure',
    cost: 0,
    icon: 'shell',
    callout: 'Finally, protect it all. Print and fit the 12-part housing: upper, lower, windows, and the SD swing door.',
    note: 'Printable at home or school. Strap loops and a standard ¼-20 tripod mount are built in.',
  },
]

// ---- the instruments (choose one, build it, then fly it) ---------------------

export const INSTRUMENTS = [
  {
    id: 's11',
    name: 'STELLA-1.1',
    fullName: 'Spectral · 12-band handheld',
    group: 'spectral',
    chassis: 's11',
    buildTag: 'Solder + 3D print',
    tagline: 'The classic handheld: 12 spectral bands plus a thermal eye, under 100 g.',
    photo: 'assets/stella/stella-1-1.png',
    photoAlt: 'The STELLA-1.1 handheld showing its color screen with a live band table (V450 to 860 nm), surface temperature, and control buttons',
    accent: '#3fa7a0',
    measures: ['12 spectral bands · 450-860 nm', 'Surface temperature (thermal IR)', 'Air temp · humidity · pressure', 'Drone-mountable · <100 g'],
    science:
      'Six visible and six near-infrared channels plus a no-touch thermal sensor are enough to measure NDVI, surface heat, and even liquids in a cuvette.',
    specs: ['Feather RP2040', '12 bands · 450-860 nm', 'Thermal IR', '2200 mAh · 13 h runtime', 'micro SD', 'Snap-fit housing'],
    sourceUrl: 'https://science.gsfc.nasa.gov/stella/instruments/spectral/stella-1-1/',
    ownParts: [
      {
        id: 'feather11',
        name: 'Feather RP2040',
        kind: 'Microcontroller',
        cost: 0,
        icon: 'chip',
        callout: 'Every instrument starts with a brain. Find the microcontroller that reads all six sensors.',
        note: 'Battery charging and health circuitry ride along on this board.',
      },
      {
        id: 'as7262',
        name: 'AS7262 visible sensor',
        kind: 'Spectral sensor',
        cost: 0,
        icon: 'spectrum',
        callout: 'First half of the spectrometer: the six VISIBLE channels, violet 450 to red 650 nm.',
        note: 'V450 · B500 · G550 · Y570 · O600 · R650, with a 40° field of view.',
      },
      {
        id: 'as7263',
        name: 'AS7263 near-infrared sensor',
        kind: 'Spectral sensor',
        cost: 0,
        icon: 'spectrum',
        callout: 'Second half: the six NEAR-INFRARED channels plants reflect so strongly, 610 to 860 nm.',
        note: 'Red and NIR together are exactly what NDVI needs.',
      },
      {
        id: 'thermal11',
        name: 'MLX90614 thermal IR sensor',
        kind: 'Thermal sensor',
        cost: 0,
        icon: 'heat',
        callout: 'Surface temperature without touching. Add the thermal infrared thermometer.',
        note: 'The “Surface:” number on the screen comes from here.',
      },
      {
        id: 'bme11',
        name: 'BME280 + air-temp sensor',
        kind: 'Weather sensors',
        cost: 0,
        icon: 'thermo',
        callout: 'Context matters: add the air temperature, humidity, and pressure sensors.',
        note: 'Comparing air vs surface temperature is a lesson in itself.',
      },
      {
        id: 'adalogger',
        name: 'Adalogger + micro SD',
        kind: 'Data logging',
        cost: 0,
        icon: 'sd',
        callout: 'Every reading gets saved. Add the datalogger wing with its micro SD card.',
        note: 'Timestamped CSVs with batch numbers, ready for the Data Visualizer.',
      },
      {
        id: 'tft11',
        name: 'Color TFT display',
        kind: 'Display',
        cost: 0,
        icon: 'screen',
        callout: 'Live numbers in the field: add the little color screen with its touch-response zones.',
        note: 'Yellow, blue, and green screen zones switch sampling modes.',
      },
      {
        id: 'batt11',
        name: '2200 mAh battery',
        kind: 'Power',
        cost: 0,
        icon: 'battery',
        callout: 'Thirteen hours of field time. Add the rechargeable battery.',
        note: 'Recharges over USB through the Feather.',
      },
      {
        id: 'housing',
        name: '3D-printed snap-fit housing',
        kind: 'Structure',
        cost: 0,
        icon: 'shell',
        callout: 'Close it up: the snap-joint housing needs no glue, tape, or screws.',
        note: 'Seven printed parts, including an optional cuvette mount for liquids.',
      },
    ],
  },
  {
    id: 'stella12',
    name: 'STELLA-1.2',
    fullName: 'STELLA-1.2 · Base platform',
    group: 'platform',
    chassis: 'platform',
    buildTag: 'The whole device',
    tagline: 'The flagship: GPS, touchscreen, data logging, and a bay that accepts any sensor module.',
    photo: 'assets/stella/stella-1-2.png',
    photoAlt: 'The white 3D-printed STELLA-1.2 with its touchscreen showing the STELLA boot screen, GPS button, and rotary knob',
    accent: '#59b95f',
    measures: ['GPS + UTC timestamping', '2.8″ touchscreen + rotary knob', 'SD data logging (CSV)', 'Swappable sensor modules'],
    science:
      'One base, many instruments. Swap the magnetic sensor modules and the same device becomes a spectrometer, an air analyzer, or your own invention.',
    specs: ['ESP32-S3', '2.8″ 320×240 touch', 'GPS + RTC', '6600 mAh', '8 GB SD', '~90 build steps'],
    sourceUrl: 'https://science.gsfc.nasa.gov/stella/instruments/stella-1-2/',
    moduleParts: [],
  },
  {
    id: 'rs',
    name: 'STELLA-1.2-RS',
    fullName: 'STELLA-1.2 · Remote Sensing module',
    group: 'platform',
    chassis: 'platform',
    buildTag: 'Base + snap-on module',
    tagline: 'An 18-band field spectrometer that sees leaves the way Landsat does.',
    photo: 'assets/stella/rs-module.png',
    photoAlt: 'NASA render of the STELLA-RS sensor board with the red Triad spectral sensor',
    accent: '#3e9d6b',
    measures: ['18 spectral bands · 410-940 nm', 'Surface temperature (thermal IR)', 'Standoff distance (ultrasonic)', 'Air temp & humidity'],
    science:
      'Point it at vegetation and compare red vs near-infrared light to compute NDVI, the same greenness index Landsat measures from orbit.',
    specs: ['ESP32-S3', '2.8″ 320×240 touch', '18 bands · 410-940 nm', 'Thermal IR', 'Ultrasonic rangefinder', 'GPS + SD'],
    sourceUrl: 'https://science.gsfc.nasa.gov/stella/instruments/stella-1-2/stella-rs-module/',
    moduleParts: [
      {
        id: 'triad',
        name: 'AS7265x Triad spectral sensor',
        kind: 'Spectral sensor',
        cost: 65,
        icon: 'spectrum',
        callout: 'The heart of a spectrometer: the sensor that splits light into 18 wavelength bands, violet to near-infrared.',
        note: 'Three sensor chips under one lens: VIS, IR, and UV-side channels from 410 to 940 nm.',
      },
      {
        id: 'thermal',
        name: 'MLX90614 thermal IR sensor',
        kind: 'Thermal sensor',
        cost: 15,
        icon: 'heat',
        callout: 'Satellites also measure surface temperature. Add the no-touch thermal infrared sensor.',
        note: 'Reads the temperature of whatever the instrument points at, with no contact needed.',
      },
      {
        id: 'range',
        name: 'Ultrasonic rangefinder',
        kind: 'Rangefinder',
        cost: 4,
        icon: 'sonar',
        callout: 'Distance changes the measurement. Add the sensor that reports how far the target is (0.3-2.5 m).',
        note: 'The “standoff” number on the display comes from this.',
      },
      {
        id: 'magnets',
        name: 'Magnetic connector pair',
        kind: 'Module coupler',
        cost: 6,
        icon: 'magnet',
        callout: 'Modules snap on and off the base. Add the magnetic connectors that carry power and data.',
        note: 'Push the side clips to swap modules in seconds. That’s the 1.2 platform’s superpower.',
      },
    ],
  },
  {
    id: 'q2',
    name: 'STELLA-Q2',
    fullName: 'Spectral · pocket spectrometer',
    group: 'spectral',
    chassis: 'q2',
    buildTag: 'No-solder build',
    tagline: 'The friendliest STELLA: seven parts, four cables, zero soldering.',
    photo: 'assets/stella/stella-q2.png',
    photoAlt: 'The white STELLA-Q2 pocket spectrometer with its OLED showing battery voltage, two buttons, and a green status LED',
    accent: '#4cae3d',
    measures: ['18 spectral bands · 410-940 nm', 'Irradiance vs wavelength graph', 'Built-in reference lamps', 'Just 33 g (108 g cased)'],
    science:
      'The most accessible entry into NASA remote sensing. Everything plugs together with Qwiic cables, and the OLED draws a live spectrum you can read in sunlight.',
    specs: ['RP2040', '128×32 OLED', '18 bands · 410-940 nm', '400 mAh LiPo', 'One MODE button', 'No soldering'],
    sourceUrl: 'https://science.gsfc.nasa.gov/stella/instruments/spectral/stella-q2/',
    ownParts: [
      {
        id: 'rp2040q',
        name: 'Thing Plus RP2040',
        kind: 'Microcontroller',
        cost: 0,
        icon: 'chip',
        callout: 'Every instrument starts with a brain. Find the microcontroller that runs the whole spectrometer.',
        note: 'No soldering anywhere in this build. Every part plugs together.',
      },
      {
        id: 'triadq',
        name: 'AS7265x Triad spectral sensor',
        kind: 'Spectral sensor',
        cost: 0,
        icon: 'spectrum',
        callout: 'The heart of a spectrometer: the sensor that splits light into 18 wavelength bands, violet to near-infrared.',
        note: 'The same Triad used in the big STELLA-RS module, from 410 to 940 nm.',
      },
      {
        id: 'oled',
        name: '128×32 OLED display',
        kind: 'Display',
        cost: 0,
        icon: 'screen',
        callout: 'Tiny instrument, tiny screen. Add the OLED strip that graphs irradiance against wavelength.',
        note: 'The case is embossed “410 … 940” right around this window.',
      },
      {
        id: 'rtcq',
        name: 'PCF8523 clock + coin cell',
        kind: 'Timekeeping',
        cost: 0,
        icon: 'clock',
        callout: 'Science data needs timestamps. Add the real-time clock that keeps ticking with the power off.',
        note: 'Set it once over USB and it remembers.',
      },
      {
        id: 'modebtn',
        name: 'Qwiic MODE button',
        kind: 'Control',
        cost: 0,
        icon: 'knob',
        callout: 'One button does everything. Add the MODE button: click for burst/continuous, hold for lamps.',
        note: 'Click switches recording mode, hold 2 s toggles lamps, hold 10 s sets the clock.',
      },
      {
        id: 'switch',
        name: 'Battery disconnect switch',
        kind: 'Power',
        cost: 0,
        icon: 'bolt',
        callout: 'Field instruments need a hard off. Add the battery disconnect switch.',
        note: 'Protects the battery in storage between field days.',
      },
      {
        id: 'lipo',
        name: '400 mAh LiPo battery',
        kind: 'Power',
        cost: 0,
        icon: 'battery',
        callout: 'Light enough to hang from a lanyard. Add the little lithium-polymer battery.',
        note: 'The whole instrument weighs 33 grams before the case.',
      },
      {
        id: 'qwiicq',
        name: 'Qwiic cable set (×4)',
        kind: 'Connectors',
        cost: 0,
        icon: 'cable',
        callout: 'Now connect everything: seven components, four small plug-in cables, no solder.',
        note: 'This is the entire wiring job. Really.',
      },
      {
        id: 'housing',
        name: '3D-printed case + lamp covers',
        kind: 'Structure',
        cost: 0,
        icon: 'shell',
        callout: 'Snap it all into the bright green case with the embossed labels and reference-lamp windows.',
        note: 'Prints without supports; the lamp covers twist into place.',
      },
    ],
  },
]

// Full ordered build: fixed instruments have their own part list; modular
// instruments share the STELLA-1.2 base, then add their module's parts.
export function buildSteps(instrument) {
  if (instrument.ownParts) return instrument.ownParts
  return [...BASE_PARTS, ...(instrument.moduleParts ?? [])]
}

// Simulator "point-at" targets: plausible relative spectra (0-1 per RS band)
// and air readings, so the demo reacts like the real instrument would.
export const RS_TARGETS = [
  {
    id: 'lawn',
    label: 'Healthy lawn',
    // chlorophyll: green bump, deep red absorption, strong NIR plateau
    spectrum: [0.10, 0.12, 0.16, 0.22, 0.34, 0.42, 0.38, 0.30, 0.22, 0.15, 0.10, 0.24, 0.55, 0.78, 0.85, 0.87, 0.86, 0.84],
    surfaceTempC: 24,
    note: 'Low red and high NIR mean high NDVI. This is what a “healthy plant” looks like to a satellite.',
  },
  {
    id: 'soil',
    label: 'Bare soil',
    // gently rising with wavelength, no red edge
    spectrum: [0.12, 0.14, 0.17, 0.20, 0.24, 0.28, 0.32, 0.36, 0.40, 0.44, 0.47, 0.50, 0.52, 0.54, 0.56, 0.57, 0.58, 0.58],
    surfaceTempC: 33,
    note: 'Reflectance climbs smoothly with wavelength, with no chlorophyll red edge.',
  },
  {
    id: 'sky',
    label: 'Open sky',
    // blue-heavy Rayleigh scattering, fading through red and NIR
    spectrum: [0.88, 0.82, 0.74, 0.66, 0.57, 0.49, 0.42, 0.36, 0.30, 0.25, 0.21, 0.18, 0.15, 0.12, 0.09, 0.07, 0.06, 0.05],
    surfaceTempC: -18,
    note: 'Blue light scatters most (Rayleigh scattering). That’s why the sky is blue.',
  },
]

export const AA1_TARGETS = [
  {
    id: 'fresh',
    label: 'Park air',
    co2: 421, ch4: 1.9, pm25: 6, pm10: 11, rh: 46, tempC: 22, hpa: 1014,
    note: 'Baseline outdoor air is about 420 ppm CO₂, already roughly 50% above pre-industrial levels.',
  },
  {
    id: 'street',
    label: 'Busy street',
    co2: 540, ch4: 2.1, pm25: 38, pm10: 61, rh: 41, tempC: 27, hpa: 1013,
    note: 'Traffic adds CO₂ and particulates. PM2.5 above 35 µg/m³ is “unhealthy for sensitive groups”.',
  },
  {
    id: 'exhale',
    label: 'Your exhale',
    co2: 28000, ch4: 7.2, pm25: 9, pm10: 14, rh: 88, tempC: 34, hpa: 1013,
    note: 'Breath is about 4% CO₂, tens of thousands of ppm. Sensors saturate fast up close!',
  },
]
