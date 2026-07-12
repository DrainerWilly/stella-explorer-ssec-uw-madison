// Data + color math for the False-Color Painter game.
//
// The player assigns satellite bands to the display's R, G, and B channels and
// the landscape re-renders live, exactly how real composites (natural color,
// color-infrared, SWIR fire mapping) are built from Landsat-style bands.
// Reflectance values follow the same teaching set used across the site.

export type BandId = 'blue' | 'green' | 'red' | 'nir' | 'swir1' | 'swir2'
export type Channel = 'r' | 'g' | 'b'

export interface Band {
  id: BandId
  label: string
  nm: number
  /** Chip color in the picker (visible bands show their color; IR bands are dark). */
  chip: string
  invisible?: boolean
}

export const FC_BANDS: Band[] = [
  { id: 'blue', label: 'Blue', nm: 480, chip: '#4f8fe0' },
  { id: 'green', label: 'Green', nm: 560, chip: '#4eb265' },
  { id: 'red', label: 'Red', nm: 660, chip: '#d95545' },
  { id: 'nir', label: 'NIR', nm: 840, chip: '#8c4a5e', invisible: true },
  { id: 'swir1', label: 'SWIR-1', nm: 1610, chip: '#7a5b3a', invisible: true },
  { id: 'swir2', label: 'SWIR-2', nm: 2200, chip: '#5c4a33', invisible: true },
]

export type Reflectance = Record<BandId, number>

export interface FcRegion {
  id: string
  name: string
  refl: Reflectance
}

// Reflectance per band for every paintable region of the scene.
export const FC_REGIONS: FcRegion[] = [
  {
    id: 'forest',
    name: 'Forest',
    refl: { blue: 0.04, green: 0.1, red: 0.04, nir: 0.5, swir1: 0.24, swir2: 0.12 },
  },
  {
    id: 'crops',
    name: 'Crop fields',
    refl: { blue: 0.05, green: 0.13, red: 0.06, nir: 0.56, swir1: 0.28, swir2: 0.14 },
  },
  {
    id: 'dryfield',
    name: 'Dry field',
    refl: { blue: 0.09, green: 0.15, red: 0.19, nir: 0.38, swir1: 0.36, swir2: 0.27 },
  },
  {
    id: 'water',
    name: 'Lake & river',
    refl: { blue: 0.07, green: 0.055, red: 0.03, nir: 0.012, swir1: 0.006, swir2: 0.005 },
  },
  {
    id: 'city',
    name: 'Town',
    refl: { blue: 0.14, green: 0.14, red: 0.15, nir: 0.17, swir1: 0.18, swir2: 0.16 },
  },
  {
    id: 'burn',
    name: 'Burn scar',
    refl: { blue: 0.05, green: 0.06, red: 0.07, nir: 0.09, swir1: 0.2, swir2: 0.27 },
  },
  {
    id: 'cloud',
    name: 'Cloud',
    refl: { blue: 0.86, green: 0.86, red: 0.85, nir: 0.83, swir1: 0.68, swir2: 0.58 },
  },
]

export type Assignment = Record<Channel, BandId | null>

// Brightness stretch: gain then a gamma lift so dark scenes stay readable,
// the same idea as the contrast stretch applied to real satellite imagery.
function stretch(v: number): number {
  return Math.round(255 * Math.min(1, Math.sqrt(v * 2.2)))
}

/** Display color of a region under the current channel assignment. */
export function displayColor(refl: Reflectance, a: Assignment): string {
  const ch = (band: BandId | null) => (band ? stretch(refl[band]) : 18)
  return `rgb(${ch(a.r)}, ${ch(a.g)}, ${ch(a.b)})`
}

export interface FcMission {
  id: string
  title: string
  brief: string
  /** The classic band combo the mission asks for. */
  target: Record<Channel, BandId>
  hint: string
  explain: string
}

export const FC_MISSIONS: FcMission[] = [
  {
    id: 'natural',
    title: 'Natural color',
    brief: 'Make the scene look the way your own eyes would see it from space.',
    target: { r: 'red', g: 'green', b: 'blue' },
    hint: 'Match like with like: the red band belongs in the red channel…',
    explain:
      'Red→R, Green→G, Blue→B is a natural-color composite. Forests look green, water looks dark blue, exactly like a photo.',
  },
  {
    id: 'cir',
    title: 'Plant-health goggles',
    brief: 'Scientists’ favorite trick: make healthy plants glow bright red.',
    target: { r: 'nir', g: 'red', b: 'green' },
    hint: 'Healthy leaves reflect near-infrared the strongest. Put NIR where your eyes notice it most: the red channel.',
    explain:
      'NIR→R, Red→G, Green→B is a color-infrared composite. Healthy vegetation reflects so much invisible NIR that it blazes red, and the brighter the red, the healthier the plants.',
  },
  {
    id: 'burn',
    title: 'Fire mapper',
    brief: 'Make the burn scar pop out red-brown while living forest stays green.',
    target: { r: 'swir2', g: 'nir', b: 'red' },
    hint: 'Burned ground reflects shortwave infrared strongly. Load SWIR-2 into the red channel and NIR into green.',
    explain:
      'SWIR-2→R, NIR→G, Red→B is the combo fire teams use. Burn scars shine red-brown (high SWIR, low NIR) while healthy plants stay bright green.',
  },
]

/** True when the player's assignment matches the mission's classic combo. */
export function matchesTarget(a: Assignment, m: FcMission): boolean {
  return a.r === m.target.r && a.g === m.target.g && a.b === m.target.b
}
