export interface ExampleCsvColumn {
  name: string
  valueType: 'timestamp' | 'integer' | 'number'
  unit?: string
  grouping: 'measurement' | 'spectral-channel' | 'instrument-status'
}

export const EXAMPLE_CSV_COLUMNS: ExampleCsvColumn[] = [
  { name: 'iso8601_utc', valueType: 'timestamp', grouping: 'measurement' },
  { name: 'UID', valueType: 'integer', grouping: 'measurement' },
  { name: 'batch', valueType: 'integer', grouping: 'measurement' },
  { name: 'measurement_number', valueType: 'integer', grouping: 'measurement' },
  { name: 'decimal_hour', valueType: 'number', unit: 'UTC hour', grouping: 'measurement' },
  { name: 'gain', valueType: 'number', unit: 'ratio', grouping: 'spectral-channel' },
  { name: 'integration_time_ms', valueType: 'integer', unit: 'ms', grouping: 'spectral-channel' },
  { name: 'wavelength_nm', valueType: 'integer', unit: 'nm', grouping: 'spectral-channel' },
  { name: 'irradiance_uw.per.cm.sq_factory_cal', valueType: 'number', unit: 'µW/cm²', grouping: 'spectral-channel' },
  { name: 'irradiance.uncertainty_uw.per.cm.sq_factory_cal', valueType: 'number', unit: 'µW/cm²', grouping: 'spectral-channel' },
  { name: 'raw_counts', valueType: 'integer', grouping: 'spectral-channel' },
  { name: 'detector_chip_number', valueType: 'integer', grouping: 'spectral-channel' },
  { name: 'detector_chip_temperature_C', valueType: 'number', unit: '°C', grouping: 'spectral-channel' },
  { name: 'battery_voltage', valueType: 'number', unit: 'V', grouping: 'instrument-status' },
  { name: 'battery_percentage', valueType: 'number', unit: '%', grouping: 'instrument-status' },
]

export const EXAMPLE_CSV_SUMMARY = {
  relativePath: 'Build instructions and documentation/STELLA-Q2_data_20250612-0.csv',
  dataRows: 270,
  channelsPerMeasurement: 18,
  measurementGroups: 15,
  sourceIds: ['example-csv', 'firmware-3-0-1'],
} as const

