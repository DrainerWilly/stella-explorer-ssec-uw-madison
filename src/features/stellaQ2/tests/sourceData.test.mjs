import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'

import { BUILD_PHOTOS } from '../data/buildPhotos.ts'
import { BUILD_STEPS } from '../data/buildSteps.ts'
import { CONNECTIONS } from '../data/connections.ts'
import {
  EXAMPLE_CSV_COLUMNS,
  EXAMPLE_CSV_SUMMARY,
} from '../data/exampleMeasurements.ts'
import {
  ALL_PARTS,
  PARTS_LIST,
  PARTS_LIST_TOTAL_USD,
  PRINTED_PARTS,
} from '../data/parts.ts'
import {
  SOURCE_REFERENCES,
  SOURCE_ROOT_URL,
  sourceAssetUrl,
} from '../data/sourceReferences.ts'
import { SPECTRAL_CHANNELS } from '../data/spectralChannels.ts'
import { STL_ASSETS } from '../data/stlAssets.ts'
import {
  INITIAL_LAB_STATE,
  labReducer,
  validatePersistedState,
} from '../state/labMachine.ts'

const EXPECTED_BOM = [
  [1, 'Thing Plus RP2040', 1, 'SparkFun', 'DEV-17745', 20, 20],
  [2, 'TRIAD spectral sensor', 1, 'SparkFun', 'SEN-15050', 70, 70],
  [3, 'PCF8523 real time clock', 1, 'Adafruit', '5189', 5, 5],
  [4, 'CR1220 battery for clock module', 1, 'widely available', 'CR1220', 1, 1],
  [5, '128x32 OLED display', 1, 'Adafruit', '4440', 12.5, 12.5],
  [6, 'i2c button', 1, 'SparkFun', 'BOB-16842', 5, 5],
  [7, 'qwiic cables, 100mm', 4, 'Adafruit', '4210', 1, 4],
  [8, 'battery disconnect switch', 1, 'Adafruit', '3064', 3, 3],
  [9, 'cylindrical battery, 2200mAh', 1, 'Adafruit', '1781', 10, 10],
  [10, 'USB C cable', 1, 'SparkFun', 'CAB-16905', 5, 5],
  [11, 'micro SD card', 1, 'Adafruit', '5249', 3.5, 3.5],
  [12, 'micro SD card reader', 1, 'Adafruit', '5212', 7, 7],
  [13, 'Lithium Ion Polymer Battery Ideal For Feathers - 3.7V 400mAh', 1, 'Adafruit', '3898', 7, 7],
]

const EXPECTED_WAVELENGTHS = [
  410, 435, 460, 485, 510, 535, 560, 585, 610,
  645, 680, 705, 730, 760, 810, 860, 900, 940,
]

const EXPECTED_COLORS = [
  '#7e00db', '#2300ff', '#007bff', '#00eaff', '#00ff00', '#70ff00',
  '#c3ff00', '#ffef00', '#ff9b00', '#fe0000', '#df0000', '#c90000',
  '#b10000', '#940000', '#000000', '#000000', '#000000', '#000000',
]

const EXPECTED_FREQUENCIES_THZ = [
  731, 689, 652, 618, 588, 560, 535, 512, 491,
  465, 441, 425, 411, 394, 370, 349, 333, 319,
]

const EXPECTED_ENERGY_JOULES = [
  4.84e-19, 4.57e-19, 4.32e-19, 4.10e-19, 3.89e-19, 3.71e-19,
  3.55e-19, 3.40e-19, 3.26e-19, 3.08e-19, 2.92e-19, 2.82e-19,
  2.72e-19, 2.61e-19, 2.45e-19, 2.31e-19, 2.21e-19, 2.11e-19,
]

const EXPECTED_ENERGY_EV = [
  3.0, 2.9, 2.7, 2.6, 2.4, 2.3, 2.2, 2.1, 2.0,
  1.9, 1.8, 1.8, 1.7, 1.6, 1.5, 1.4, 1.4, 1.3,
]

const EXPECTED_CSV_COLUMNS = [
  'iso8601_utc',
  'UID',
  'batch',
  'measurement_number',
  'decimal_hour',
  'gain',
  'integration_time_ms',
  'wavelength_nm',
  'irradiance_uw.per.cm.sq_factory_cal',
  'irradiance.uncertainty_uw.per.cm.sq_factory_cal',
  'raw_counts',
  'detector_chip_number',
  'detector_chip_temperature_C',
  'battery_voltage',
  'battery_percentage',
]

const EXPECTED_STL_FILES = [
  'Q2 battery retainer.STL',
  'Q2 bottom cover.STL',
  'Q2 button retainer.STL',
  'Q2 clock retainer.STL',
  'Q2 display retainer.STL',
  'Q2 processor retainer.STL',
  'Q2 top housing.STL',
  'signal lamp window CC.STL',
]

const EXPECTED_STL_DIMENSIONS = [
  [19.3, 24, 4.8],
  [65.79, 181.945, 11.5],
  [27.8, 20, 7.05],
  [19.53, 14, 5.55],
  [23.29, 20, 9.3],
  [24.9, 14, 5.2],
  [65.79, 181.945, 14.7],
  [12, 12, 4.5],
]

const SOURCE_ROOT = join(
  process.cwd(),
  'public/assets/stella/STELLA-Q2_download_Jan2026/STELLA-Q2_download_Jan2026',
)

test('official BOM preserves all 13 published lines and the $153 total', () => {
  assert.equal(PARTS_LIST.length, 13)
  assert.deepEqual(
    PARTS_LIST.map((part) => [
      part.lineNumber,
      part.officialName,
      part.quantity,
      part.manufacturer,
      part.partNumber,
      part.unitCostUsd,
      part.lineCostUsd,
    ]),
    EXPECTED_BOM,
  )
  assert.equal(PARTS_LIST_TOTAL_USD, 153)
})

test('spectral lookup preserves all 18 ordered channels and black NIR values', () => {
  assert.equal(SPECTRAL_CHANNELS.length, 18)
  assert.deepEqual(SPECTRAL_CHANNELS.map((entry) => entry.channel), Array.from({ length: 18 }, (_, index) => index + 1))
  assert.deepEqual(SPECTRAL_CHANNELS.map((entry) => entry.centerWavelengthNm), EXPECTED_WAVELENGTHS)
  assert.deepEqual(SPECTRAL_CHANNELS.map((entry) => entry.authoritativeHex), EXPECTED_COLORS)
  assert.deepEqual(SPECTRAL_CHANNELS.map((entry) => entry.frequencyThz), EXPECTED_FREQUENCIES_THZ)
  assert.deepEqual(SPECTRAL_CHANNELS.map((entry) => entry.energyJoulesPerPhoton), EXPECTED_ENERGY_JOULES)
  assert.deepEqual(SPECTRAL_CHANNELS.map((entry) => entry.energyElectronVoltsPerPhoton), EXPECTED_ENERGY_EV)

  for (const channel of SPECTRAL_CHANNELS.slice(14)) {
    assert.equal(channel.category, 'near-infrared')
    assert.deepEqual(channel.rgb, [0, 0, 0])
    assert.match(channel.accessibleTreatment, /outlined NIR marker/i)
  }
})

test('build steps retain the complete, ordered 12-step sequence', () => {
  assert.equal(BUILD_STEPS.length, 12)
  assert.deepEqual(BUILD_STEPS.map((step) => step.number), Array.from({ length: 12 }, (_, index) => index + 1))
  assert.equal(new Set(BUILD_STEPS.map((step) => step.id)).size, 12)
  for (const step of BUILD_STEPS) {
    assert.ok(step.title)
    assert.ok(step.instruction)
    assert.ok(step.verify)
    assert.ok(step.commonMistake)
  }
})

test('build photo chronology has 10 unique, valid step and source mappings', () => {
  const stepNumbers = new Set(BUILD_STEPS.map((step) => step.number))
  const photoIds = new Set(BUILD_PHOTOS.map((photo) => photo.id))

  assert.equal(BUILD_PHOTOS.length, 10)
  assert.deepEqual(BUILD_PHOTOS.map((photo) => photo.sequence), Array.from({ length: 10 }, (_, index) => index + 1))
  assert.deepEqual(BUILD_PHOTOS.slice(0, 4).map((photo) => photo.id), [
    'scaffolding-top-before',
    'scaffolding-top-after',
    'scaffolding-bottom-before',
    'scaffolding-bottom-after',
  ])
  assert.equal(photoIds.size, 10)

  for (const photo of BUILD_PHOTOS) {
    assert.ok(stepNumbers.has(photo.buildStepNumber), `${photo.id} maps to a real build step`)
    assert.equal(photo.assetPath.endsWith(photo.filename), true)
    assert.ok(photo.alt)
    assert.ok(photo.caption)
  }

  for (const step of BUILD_STEPS) {
    for (const photoId of step.photoIds) {
      assert.ok(photoIds.has(photoId), `${step.id} references existing photo ${photoId}`)
    }
  }
})

test('all source references and asset paths are deployment-relative', () => {
  assert.equal(SOURCE_ROOT_URL, '/assets/stella/STELLA-Q2_download_Jan2026/STELLA-Q2_download_Jan2026')
  assert.equal(new Set(SOURCE_REFERENCES.map((source) => source.id)).size, SOURCE_REFERENCES.length)

  const relativePaths = [
    ...SOURCE_REFERENCES.map((source) => source.relativePath),
    ...BUILD_PHOTOS.map((photo) => photo.assetPath),
    ...STL_ASSETS.map((asset) => asset.assetPath),
    EXAMPLE_CSV_SUMMARY.relativePath,
  ]

  for (const relativePath of relativePaths) {
    assert.equal(relativePath.startsWith('/'), false, `${relativePath} must be relative`)
    assert.equal(relativePath.includes('\\'), false, `${relativePath} must use URL separators`)
    assert.doesNotMatch(relativePath, /(?:^|\/)home\/|william|Users\/|[A-Za-z]:\\/)
  }

  assert.equal(
    sourceAssetUrl('folder name/file name.pdf'),
    `${SOURCE_ROOT_URL}/folder%20name/file%20name.pdf`,
  )
})

test('source IDs and connection endpoints resolve to authoritative records', () => {
  const sourceIds = new Set(SOURCE_REFERENCES.map((source) => source.id))
  const partIds = new Set(ALL_PARTS.map((part) => part.id))

  const recordsWithSourceIds = [
    ...PARTS_LIST,
    ...BUILD_STEPS,
    ...CONNECTIONS,
    ...STL_ASSETS,
  ]
  for (const record of recordsWithSourceIds) {
    for (const sourceId of record.sourceIds) {
      assert.ok(sourceIds.has(sourceId), `${sourceId} resolves for ${record.id}`)
    }
  }

  for (const step of BUILD_STEPS) {
    for (const partId of step.partIds) {
      assert.ok(partIds.has(partId), `${step.id} references existing part ${partId}`)
    }
  }

  assert.equal(new Set(CONNECTIONS.map((connection) => connection.id)).size, CONNECTIONS.length)
  for (const connection of CONNECTIONS) {
    assert.ok(partIds.has(connection.fromPartId), `${connection.id} from endpoint exists`)
    assert.ok(partIds.has(connection.toPartId), `${connection.id} to endpoint exists`)
    assert.ok(connection.fromConnector)
    assert.ok(connection.toConnector)
    assert.ok(connection.quantity > 0)
  }

  assert.equal(
    CONNECTIONS.filter((connection) => connection.connectionType === 'qwiic').reduce(
      (sum, connection) => sum + connection.quantity,
      0,
    ),
    4,
  )
})

test('example measurement metadata preserves the exact 15-column CSV schema', () => {
  assert.equal(EXAMPLE_CSV_COLUMNS.length, 15)
  assert.deepEqual(EXAMPLE_CSV_COLUMNS.map((column) => column.name), EXPECTED_CSV_COLUMNS)
  assert.equal(EXAMPLE_CSV_SUMMARY.dataRows, 270)
  assert.equal(EXAMPLE_CSV_SUMMARY.channelsPerMeasurement, 18)
  assert.equal(EXAMPLE_CSV_SUMMARY.measurementGroups, 15)
  assert.equal(
    EXAMPLE_CSV_SUMMARY.measurementGroups * EXAMPLE_CSV_SUMMARY.channelsPerMeasurement,
    EXAMPLE_CSV_SUMMARY.dataRows,
  )
})

test('print inventory preserves the exact eight supplied STL files', () => {
  assert.equal(STL_ASSETS.length, 8)
  assert.deepEqual(STL_ASSETS.map((asset) => asset.filename), EXPECTED_STL_FILES)
  assert.deepEqual(STL_ASSETS.map((asset) => asset.dimensionsMm), EXPECTED_STL_DIMENSIONS)
  assert.equal(new Set(STL_ASSETS.map((asset) => asset.id)).size, 8)
  assert.equal(STL_ASSETS.find((asset) => asset.id === 'lamp-window')?.quantity, 2)
  assert.equal(PRINTED_PARTS.find((part) => part.id === 'lamp-window')?.quantity, 2)
})

test('every modeled source points to an existing authoritative local asset', () => {
  assert.ok(existsSync(SOURCE_ROOT), 'authoritative source root exists')
  for (const source of SOURCE_REFERENCES) {
    assert.ok(
      existsSync(join(SOURCE_ROOT, source.relativePath)),
      `${source.id} resolves to ${source.relativePath}`,
    )
  }
  for (const photo of BUILD_PHOTOS) {
    assert.ok(existsSync(join(SOURCE_ROOT, photo.assetPath)), `${photo.filename} exists`)
  }
  for (const stl of STL_ASSETS) {
    assert.ok(existsSync(join(SOURCE_ROOT, stl.assetPath)), `${stl.filename} exists`)
  }

  const diagramPreview = join(process.cwd(), 'public/assets/stella-q2/flat-assembly-diagram.webp')
  assert.ok(existsSync(diagramPreview), 'derived flat-diagram preview exists')
  assert.ok(statSync(diagramPreview).size > 100_000, 'derived diagram is a legible, non-thumbnail asset')
})

test('authoritative photo and STL directories match the modeled inventories', () => {
  const actualPhotos = readdirSync(join(SOURCE_ROOT, 'Build instructions and documentation/Build Instructions Photos'))
    .filter((name) => name.toLowerCase().endsWith('.jpg'))
    .sort()
  const actualStls = readdirSync(join(SOURCE_ROOT, 'Q2 parts STL files'))
    .filter((name) => name.toLowerCase().endsWith('.stl'))
    .sort()

  assert.deepEqual(actualPhotos, BUILD_PHOTOS.map((photo) => photo.filename).sort())
  assert.deepEqual(actualStls, EXPECTED_STL_FILES)
})

test('example CSV file itself preserves header, row groups, and wavelength order', () => {
  const csvPath = join(SOURCE_ROOT, EXAMPLE_CSV_SUMMARY.relativePath)
  const lines = readFileSync(csvPath, 'utf8').trim().split(/\r?\n/)
  const rawHeader = lines[0].split(',')
  const header = rawHeader.map((name) => name.trim())
  const rows = lines.slice(1).map((line) => line.split(','))

  assert.deepEqual(header, EXPECTED_CSV_COLUMNS)
  assert.deepEqual(rawHeader, EXPECTED_CSV_COLUMNS.map((name, index) => index === 0 ? name : ` ${name}`))
  assert.equal(rows.length, 270)
  assert.ok(rows.every((row) => row.length === EXPECTED_CSV_COLUMNS.length))

  for (let offset = 0; offset < rows.length; offset += 18) {
    assert.deepEqual(
      rows.slice(offset, offset + 18).map((row) => Number(row[7])),
      EXPECTED_WAVELENGTHS,
    )
  }
})

test('lab state validates persisted IDs and reducer progress is deterministic', () => {
  assert.deepEqual(validatePersistedState(structuredClone(INITIAL_LAB_STATE)), INITIAL_LAB_STATE)

  assert.equal(validatePersistedState({ ...INITIAL_LAB_STATE, activeBuildStepId: 'not-a-step' }), null)
  assert.equal(validatePersistedState({ ...INITIAL_LAB_STATE, selectedPartId: 'not-a-part' }), null)
  assert.equal(validatePersistedState({ ...INITIAL_LAB_STATE, selectedPhotoId: 'not-a-photo' }), null)
  assert.equal(validatePersistedState({ ...INITIAL_LAB_STATE, workspaceView: 'unknown' }), null)
  assert.equal(validatePersistedState({ ...INITIAL_LAB_STATE, completedBuildStepIds: ['not-a-step'] }), null)
  assert.equal(
    validatePersistedState({
      ...INITIAL_LAB_STATE,
      completedBuildStepIds: [BUILD_STEPS[0].id, BUILD_STEPS[0].id],
    }),
    null,
  )

  const actions = [
    { type: 'START_BUILD' },
    { type: 'COMPLETE_BUILD_STEP', stepId: BUILD_STEPS[0].id },
    { type: 'COMPLETE_BUILD_STEP', stepId: BUILD_STEPS[0].id },
    { type: 'NEXT_BUILD_STEP' },
    { type: 'COMPLETE_BUILD_STEP', stepId: BUILD_STEPS[1].id },
    { type: 'SELECT_PART', partId: PARTS_LIST[2].id },
    { type: 'SELECT_PHOTO', photoId: BUILD_PHOTOS[4].id },
  ]

  const reduceActions = () => actions.reduce(
    (state, action) => labReducer(state, action),
    structuredClone(INITIAL_LAB_STATE),
  )
  const first = reduceActions()
  const second = reduceActions()

  assert.deepEqual(first, second)
  assert.deepEqual(first.completedBuildStepIds, [BUILD_STEPS[0].id, BUILD_STEPS[1].id])
  assert.equal(first.activeBuildStepId, BUILD_STEPS[1].id)
  assert.equal(first.selectedPartId, PARTS_LIST[2].id)
  assert.equal(first.selectedPhotoId, BUILD_PHOTOS[4].id)
  assert.equal(first.workspaceView, 'photos')
  assert.deepEqual(validatePersistedState(first), first)

  const printedPartState = labReducer(first, {
    type: 'SELECT_PART',
    partId: PRINTED_PARTS[0].id,
  })
  assert.equal(printedPartState.selectedPartId, PRINTED_PARTS[0].id)

  const invalidActionState = labReducer(first, { type: 'SELECT_BUILD_STEP', stepId: 'not-a-step' })
  assert.equal(invalidActionState, first)

  const atLastStep = { ...first, activeBuildStepId: BUILD_STEPS.at(-1).id }
  assert.equal(labReducer(atLastStep, { type: 'NEXT_BUILD_STEP' }).activeBuildStepId, BUILD_STEPS.at(-1).id)

  const reset = labReducer(first, { type: 'RESET_PROGRESS' })
  assert.equal(reset.mode, first.mode)
  assert.equal(reset.guidance, first.guidance)
  assert.deepEqual(reset.completedBuildStepIds, [])
})
