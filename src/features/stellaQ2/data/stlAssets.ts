import type { StlAsset } from '../types'

const STL_ROOT = 'Q2 parts STL files'

export const STL_ASSETS: StlAsset[] = [
  { id: 'battery-retainer', filename: 'Q2 battery retainer.STL', assetPath: `${STL_ROOT}/Q2 battery retainer.STL`, quantity: 1, role: 'Secures the documented pouch-battery position in the supplied printed housing.', dimensionsMm: [19.3, 24, 4.8], sourceIds: ['stl-files', 'build-photos'] },
  { id: 'bottom-cover', filename: 'Q2 bottom cover.STL', assetPath: `${STL_ROOT}/Q2 bottom cover.STL`, quantity: 1, role: 'Closes the back of the enclosure after wire routing.', dimensionsMm: [65.79, 181.945, 11.5], sourceIds: ['stl-files', 'build-instructions', 'build-photos'] },
  { id: 'button-retainer', filename: 'Q2 button retainer.STL', assetPath: `${STL_ROOT}/Q2 button retainer.STL`, quantity: 1, role: 'Secures the MODE button module.', dimensionsMm: [27.8, 20, 7.05], sourceIds: ['stl-files', 'build-photos'] },
  { id: 'clock-retainer', filename: 'Q2 clock retainer.STL', assetPath: `${STL_ROOT}/Q2 clock retainer.STL`, quantity: 1, role: 'Secures the real-time clock module.', dimensionsMm: [19.53, 14, 5.55], sourceIds: ['stl-files', 'build-photos'] },
  { id: 'display-retainer', filename: 'Q2 display retainer.STL', assetPath: `${STL_ROOT}/Q2 display retainer.STL`, quantity: 1, role: 'Secures the 128x32 OLED display.', dimensionsMm: [23.29, 20, 9.3], sourceIds: ['stl-files', 'build-photos'] },
  { id: 'processor-retainer', filename: 'Q2 processor retainer.STL', assetPath: `${STL_ROOT}/Q2 processor retainer.STL`, quantity: 1, role: 'Secures the Thing Plus RP2040.', dimensionsMm: [24.9, 14, 5.2], sourceIds: ['stl-files', 'build-photos'] },
  { id: 'top-housing', filename: 'Q2 top housing.STL', assetPath: `${STL_ROOT}/Q2 top housing.STL`, quantity: 1, role: 'Main enclosure with module slots and front-panel openings.', dimensionsMm: [65.79, 181.945, 14.7], sourceIds: ['stl-files', 'build-photos', 'release-notes-3'] },
  { id: 'lamp-window', filename: 'signal lamp window CC.STL', assetPath: `${STL_ROOT}/signal lamp window CC.STL`, quantity: 2, role: 'Two translucent windows for the front-panel signal lamps.', dimensionsMm: [12, 12, 4.5], sourceIds: ['stl-files', 'build-instructions', 'build-photos'] },
]
