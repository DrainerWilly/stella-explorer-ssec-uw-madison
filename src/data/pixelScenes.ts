// Pixel-art satellite scenes for the Pixel Detective game.
//
// Each scene is a hand-drawn 12×12 grid. The game shows it at three spatial
// resolutions (3×3 → 6×6 → 12×12) by averaging pixel blocks, mimicking how a
// coarser satellite sensor sees the same piece of Earth.

export interface PixelScene {
  id: string
  /** Palette letter → hex color. */
  palette: Record<string, string>
  /** 12 rows × 12 letters. */
  grid: string[]
  answer: string
  options: string[]
  explain: string
}

export const PIXEL_SCENES: PixelScene[] = [
  {
    id: 'hurricane',
    palette: { o: '#1c4d86', w: '#f3f6f8', e: '#0e3564' },
    grid: [
      'oooowwwwoooo',
      'oowwwwwwwwoo',
      'owwwwwwwwwwo',
      'owwwwoowwwwo',
      'wwwwoooowwww',
      'wwwwooeowwww',
      'wwwwoeoowwww',
      'wwwwoooowwww',
      'owwwwoowwwwo',
      'owwwwwwwwwwo',
      'oowwwwwwwwoo',
      'oooowwwwoooo',
    ],
    answer: 'A hurricane over the ocean',
    options: [
      'A hurricane over the ocean',
      'A snowy mountain range',
      'A giant crater',
      'Clouds over a desert',
    ],
    explain:
      'The swirl of white cloud with a dark hole in the middle is the eye of a hurricane. Weather satellites like GOES watch storms like this around the clock.',
  },
  {
    id: 'farms',
    palette: { t: '#c8a76e', g: '#4e9d4e', G: '#2e7a3c', f: '#8f6e45' },
    grid: [
      'ttggttttGGtt',
      'tggggttGGGGt',
      'tggggttGGGGt',
      'ttggttttGGtt',
      'tttttttttttt',
      'tttttttttttt',
      'ttfftttggttt',
      'tffffttggggt',
      'tffffttggggt',
      'ttfftttggttt',
      'tttttttttttt',
      'tttttttttttt',
    ],
    answer: 'Round farm fields in a dry land',
    options: [
      'Round farm fields in a dry land',
      'Lily pads on a pond',
      'A giant pizza',
      'Green planets in space',
    ],
    explain:
      'Those perfect circles are center-pivot irrigation: a long sprinkler arm spins around a well, watering a circle of crops. Landsat sees thousands of them in dry regions.',
  },
  {
    id: 'delta',
    palette: { l: '#a8905f', v: '#3f8f5f', r: '#2e78b0', s: '#14507a' },
    grid: [
      'llllllrlllll',
      'llllllrlllll',
      'lllllrrlllll',
      'lllllrllllll',
      'llllrrrlllll',
      'lllrrlrrllll',
      'llrrvlvrrlll',
      'lvrvvlvvrvll',
      'vvrvvrvvlrvv',
      'ssrssrssrsss',
      'ssssssssssss',
      'ssssssssssss',
    ],
    answer: 'A river splitting into a delta',
    options: [
      'A river splitting into a delta',
      'Lightning in the sky',
      'A crack in a glacier',
      'Tree roots underground',
    ],
    explain:
      'A river slows down when it meets the sea and splits into branching channels: a delta. The green fringe is wetland fed by the river’s fresh water and mud.',
  },
  {
    id: 'city',
    palette: { b: '#8f949c', d: '#6b7078', r: '#464b53', p: '#4e9d4e', w: '#2e78b0' },
    grid: [
      'bbbrbbdbrppp',
      'bdbrbbbbrppp',
      'bbbrdbbbrppp',
      'rrrrrrrrrrrr',
      'bdbrbbdbrbdb',
      'bbbrbdbbrbbb',
      'dbbrbbbbrbdb',
      'rrrrrrrrrrrr',
      'bbdrbdbbrbbw',
      'bdbrbbbdrbww',
      'bbbrbbbbrwww',
      'bbdrbdbrwwww',
    ],
    answer: 'A city with streets and a park',
    options: [
      'A city with streets and a park',
      'A circuit board',
      'A checkerboard farm',
      'A rocky canyon',
    ],
    explain:
      'The straight gray grid is a city: blocks of buildings cut by streets, a green park in the corner, and a river at the bottom edge. Cities look hotter in thermal images too!',
  },
  {
    id: 'volcano',
    palette: { s: '#1b5c8f', f: '#2e7a3c', k: '#6e5a44', c: '#c9cfd4' },
    grid: [
      'ssssssssssss',
      'sssssfffssss',
      'ssssfffffsss',
      'sssffkkfffss',
      'ssffkkkkffss',
      'ssffkcckffss',
      'ssffkcckkfss',
      'ssffkkkkffss',
      'sssffkkfffss',
      'ssssfffffsss',
      'sssssfffssss',
      'ssssssssssss',
    ],
    answer: 'A volcano island',
    options: [
      'A volcano island',
      'An eyeball',
      'A donut on a plate',
      'A crater on the Moon',
    ],
    explain:
      'A cone-shaped volcano rises from the sea: green forest around the base, bare rock up the slopes, and a pale summit crater in the middle.',
  },
]

// ---- resolution helpers --------------------------------------------------------

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/**
 * Downsample the 12×12 scene into an N×N grid of CSS colors by averaging each
 * block of pixels, just like a coarser sensor averaging light over a bigger
 * footprint on the ground.
 */
export function sampleScene(scene: PixelScene, size: 3 | 6 | 12): string[][] {
  const block = 12 / size
  const out: string[][] = []
  for (let by = 0; by < size; by++) {
    const row: string[] = []
    for (let bx = 0; bx < size; bx++) {
      let r = 0
      let g = 0
      let b = 0
      for (let y = 0; y < block; y++) {
        for (let x = 0; x < block; x++) {
          const letter = scene.grid[by * block + y][bx * block + x]
          const [pr, pg, pb] = hexToRgb(scene.palette[letter])
          r += pr
          g += pg
          b += pb
        }
      }
      const n = block * block
      row.push(`rgb(${Math.round(r / n)}, ${Math.round(g / n)}, ${Math.round(b / n)})`)
    }
    out.push(row)
  }
  return out
}

/** Points awarded for a correct guess at each zoom level (coarse → sharp). */
export const PIXEL_LEVEL_POINTS = [3, 2, 1] as const
export const PIXEL_LEVEL_SIZES = [3, 6, 12] as const
export const PIXEL_LEVEL_LABELS = ['Very blurry (big pixels)', 'Getting sharper…', 'Full resolution'] as const
