import type { SourceReference } from '../types'

export const SOURCE_ROOT_URL =
  '/assets/stella/STELLA-Q2_download_Jan2026/STELLA-Q2_download_Jan2026'

export function sourceAssetUrl(relativePath: string) {
  const encodedPath = relativePath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')

  return `${SOURCE_ROOT_URL}/${encodedPath}`
}

export const SOURCE_REFERENCES: SourceReference[] = [
  {
    id: 'build-instructions',
    title: 'STELLA-Q2 Build Instructions',
    relativePath: 'Build instructions and documentation/STELLA_Q2_Build_Instructions_June2025.pdf',
    kind: 'pdf',
    purpose: 'Authoritative 12-step physical construction sequence.',
    inspected: true,
  },
  {
    id: 'flat-assembly-diagram',
    title: 'STELLA-Q2 Flat Assembly Diagram',
    relativePath: 'Build instructions and documentation/STELLA-Q2 flat assembly diagram.pdf',
    kind: 'pdf',
    purpose: 'Full-size 1:1 component layout, cable order, and battery polarity reference.',
    inspected: true,
  },
  {
    id: 'build-photos',
    title: 'Build Instruction Photos',
    relativePath: 'Build instructions and documentation/Build Instructions Photos',
    kind: 'photograph',
    purpose: 'Chronological reference for scaffolding, placement, retainers, wiring, and lamp windows.',
    inspected: true,
  },
  {
    id: 'parts-list-pdf',
    title: 'STELLA-Q2 Parts List (PDF)',
    relativePath: 'Build instructions and documentation/SQ2_parts_list.pdf',
    kind: 'pdf',
    purpose: 'Official names, quantities, manufacturers, part numbers, and costs.',
    inspected: true,
  },
  {
    id: 'parts-list-xlsx',
    title: 'STELLA-Q2 Parts List (Spreadsheet)',
    relativePath: 'Build instructions and documentation/SQ2_parts_list.xlsx',
    kind: 'spreadsheet',
    purpose: 'Machine-readable companion to the published parts list.',
    inspected: true,
  },
  {
    id: 'software-instructions',
    title: 'STELLA-Q2 Software Instructions',
    relativePath: 'Build instructions and documentation/STELLA_Q2_Software_Instructions_June2025.pdf',
    kind: 'pdf',
    purpose: 'CircuitPython installation, CIRCUITPY file layout, and clock-setting procedure.',
    inspected: true,
  },
  {
    id: 'operation-guide',
    title: 'STELLA-Q2 Operation',
    relativePath: 'Build instructions and documentation/STELLA-Q2 Operation.pdf',
    kind: 'pdf',
    purpose: 'Charging, MODE button, recording, lamps, clock, and graph behavior.',
    inspected: true,
  },
  {
    id: 'release-notes-3',
    title: 'STELLA-Q2 Version 3.0 Release Changes',
    relativePath: 'Build instructions and documentation/STELLA-Q2 changes in version 3.0 release.pdf',
    kind: 'pdf',
    purpose: 'Documented code, enclosure, and documentation changes in version 3.0.',
    inspected: true,
  },
  {
    id: 'color-table-pdf',
    title: 'NASA STELLA-Q2 Color Lookup Table (PDF)',
    relativePath: 'Build instructions and documentation/NASA STELLA-Q2 color lookup table.pdf',
    kind: 'pdf',
    purpose: 'Published 18-channel wavelength, color, frequency, and photon-energy table.',
    inspected: true,
  },
  {
    id: 'color-table-xlsx',
    title: 'NASA STELLA-Q2 Color Lookup Table (Spreadsheet)',
    relativePath: 'Build instructions and documentation/NASA STELLA-Q2 color lookup table.xlsx',
    kind: 'spreadsheet',
    purpose: 'Spreadsheet values used to validate the published lookup table.',
    inspected: true,
  },
  {
    id: 'color-table-xlsx-2',
    title: 'NASA STELLA-Q2 Color Lookup Table 2 (Spreadsheet)',
    relativePath: 'Build instructions and documentation/NASA STELLA-Q2 color lookup table2.xlsx',
    kind: 'spreadsheet',
    purpose: 'Second supplied lookup-table workbook retained as a separate source for comparison.',
    inspected: true,
  },
  {
    id: 'example-csv',
    title: 'STELLA-Q2 Data, 2025-06-12',
    relativePath: 'Build instructions and documentation/STELLA-Q2_data_20250612-0.csv',
    kind: 'csv',
    purpose: 'Authoritative example output schema and measurement rows.',
    inspected: true,
  },
  {
    id: 'stl-files',
    title: 'STELLA-Q2 STL Files',
    relativePath: 'Q2 parts STL files',
    kind: 'stl',
    purpose: 'Printable housing, cover, retainers, and signal-lamp window geometry.',
    inspected: true,
  },
  {
    id: 'firmware-3-0-1',
    title: 'STELLA-Q2 Software 3.0.1',
    relativePath: 'Software_3_0_1/code.py',
    kind: 'firmware',
    purpose: 'Authoritative runtime constants, state behavior, display pages, and CSV writer.',
    inspected: true,
  },
  {
    id: 'firmware-text-copy',
    title: 'STELLA-Q2 Software 3.0.1 Text Copy',
    relativePath: 'Software_3_0_1/Q2v3.0.1.txt',
    kind: 'firmware',
    purpose: 'Supplied text duplicate of the version 3.0.1 application code.',
    inspected: true,
  },
  {
    id: 'uf2-9-2-8',
    title: 'CircuitPython 9.2.8 UF2',
    relativePath: 'Software_3_0_1/UF2-file/adafruit-circuitpython-sparkfun_thing_plus_rp2040-en_US-9.2.8.uf2',
    kind: 'binary',
    purpose: 'Exact local CircuitPython installer used by the programming procedure.',
    inspected: true,
  },
  {
    id: 'circuitpython-libraries',
    title: 'Bundled CircuitPython Libraries',
    relativePath: 'Software_3_0_1/lib',
    kind: 'library',
    purpose: 'Runtime dependencies copied to CIRCUITPY during programming.',
    inspected: true,
  },
  {
    id: 'hardware-test-code',
    title: 'STELLA-Q2 Hardware Test Code',
    relativePath: 'q2_test_codes',
    kind: 'test-code',
    purpose: 'Module-level tests for the display, spectrometer, SD card, I2C, button, battery, LEDs, clock, and UID.',
    inspected: true,
  },
]

export const SOURCE_REFERENCE_BY_ID = new Map(
  SOURCE_REFERENCES.map((source) => [source.id, source]),
)

