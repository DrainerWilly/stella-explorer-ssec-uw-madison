export type OperationStateId =
  | 'powerOff'
  | 'booting'
  | 'continuousRecording'
  | 'burstReady'
  | 'burstRecording'
  | 'clockSet'
  | 'charging'
  | 'fullyCharged'
  | 'moduleWarning'
  | 'sdCardError'

export interface OperationStateDefinition {
  id: OperationStateId
  description: string
  indicator: string
  sourceIds: string[]
}

export const OPERATION_STATES: OperationStateDefinition[] = [
  { id: 'powerOff', description: 'Battery path is disconnected and the instrument is not running.', indicator: 'Power off', sourceIds: ['operation-guide'] },
  { id: 'booting', description: 'Startup pages initialize storage, modules, battery, time, identifiers, and the graph.', indicator: 'Orange REC indicator when the SD card is available; red when unavailable.', sourceIds: ['operation-guide', 'firmware-3-0-1'] },
  { id: 'continuousRecording', description: 'The default recording state writes a burst_count group at each sample interval.', indicator: 'Green flash for each written data point.', sourceIds: ['operation-guide', 'firmware-3-0-1'] },
  { id: 'burstReady', description: 'After a normal MODE click, automatic continuous recording stops and the next click triggers one burst.', indicator: 'Burst ready', sourceIds: ['operation-guide', 'firmware-3-0-1'] },
  { id: 'burstRecording', description: 'One configured burst of measurements is acquired and written.', indicator: 'Blue flash for each burst data point.', sourceIds: ['operation-guide', 'release-notes-3', 'firmware-3-0-1'] },
  { id: 'clockSet', description: 'A long MODE hold enters the serial date-and-time entry procedure.', indicator: 'Serial output begins with long_press.', sourceIds: ['software-instructions', 'operation-guide', 'firmware-3-0-1'] },
  { id: 'charging', description: 'USB power charges the battery only while the switched battery path is connected.', indicator: 'Orange battery indicator at full brightness.', sourceIds: ['operation-guide'] },
  { id: 'fullyCharged', description: 'The charging circuit has completed charging.', indicator: 'Orange battery indicator turns off.', sourceIds: ['operation-guide'] },
  { id: 'moduleWarning', description: 'Version 3.0 uses null-device fallbacks so operation can continue when supported modules are unavailable.', indicator: 'Module-specific values may be unavailable.', sourceIds: ['release-notes-3', 'firmware-3-0-1'] },
  { id: 'sdCardError', description: 'Measurement data cannot be written because the SD card or required mount is unavailable.', indicator: 'Red REC indicator and a storage error message.', sourceIds: ['operation-guide', 'firmware-3-0-1'] },
]

export const DOCUMENTED_MODE_TIMING = {
  normalClick: 'less than 1 second in version 3.0.1 code',
  lampHold: '1 to under 4 seconds in version 3.0.1 code; documentation describes 2–3 seconds',
  clockHold: 'over 6 seconds in version 3.0.1 code; documentation describes greater than about 10 seconds',
  sourceIds: ['operation-guide', 'software-instructions', 'firmware-3-0-1'],
} as const

