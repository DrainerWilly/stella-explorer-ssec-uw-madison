import type { LayoutPartId } from '../types'

export type ConnectorType = 'qwiic' | 'battery-lead' | 'switch-input' | 'switch-output' | 'processor-battery'

export interface ConnectorDefinition {
  id: string
  partId: LayoutPartId
  type: ConnectorType
  normalizedX: number
  normalizedY: number
  orientation: 'left' | 'right' | 'top' | 'bottom'
  accepts: readonly ConnectorType[]
  required: boolean
  label: string
  sourceReference: string
}

export interface RequiredConnectionDefinition {
  id: string
  kind: 'qwiic' | 'power'
  endpointA: string
  endpointB: string
  label: string
  sourceReference: string
  cableAppearance: string
  confidence: 'high'
}

// Positions are normalized to each Phase 2B component footprint, not to page
// pixels. Qwiic order and power endpoints were checked against Build 2 and the
// printed flat assembly diagram.
export const CONNECTORS: readonly ConnectorDefinition[] = [
  { id: 'rp2040-qwiic', partId: 'thing-plus-rp2040', type: 'qwiic', normalizedX: 0.96, normalizedY: 0.30, orientation: 'right', accepts: ['qwiic'], required: true, label: 'RP2040 Qwiic', sourceReference: 'Build 2 lower-left board; flat assembly diagram.' },
  { id: 'rp2040-battery', partId: 'thing-plus-rp2040', type: 'processor-battery', normalizedX: 0.96, normalizedY: 0.70, orientation: 'right', accepts: ['switch-output'], required: true, label: 'RP2040 battery connector', sourceReference: 'Build 2 switched power lead into lower-left Thing Plus.' },
  { id: 'button-qwiic-left', partId: 'i2c-button', type: 'qwiic', normalizedX: 0.03, normalizedY: 0.50, orientation: 'left', accepts: ['qwiic'], required: true, label: 'Button Qwiic A', sourceReference: 'Build 2 cable from RP2040 to pushbutton.' },
  { id: 'button-qwiic-right', partId: 'i2c-button', type: 'qwiic', normalizedX: 0.97, normalizedY: 0.50, orientation: 'right', accepts: ['qwiic'], required: true, label: 'Button Qwiic B', sourceReference: 'Build 2 cable from pushbutton to RTC.' },
  { id: 'rtc-qwiic-left', partId: 'pcf8523-clock', type: 'qwiic', normalizedX: 0.03, normalizedY: 0.58, orientation: 'left', accepts: ['qwiic'], required: true, label: 'RTC Qwiic A', sourceReference: 'Build 2 cable from button to RTC.' },
  { id: 'rtc-qwiic-right', partId: 'pcf8523-clock', type: 'qwiic', normalizedX: 0.97, normalizedY: 0.58, orientation: 'right', accepts: ['qwiic'], required: true, label: 'RTC Qwiic B', sourceReference: 'Build 2 cable from RTC to TRIAD.' },
  { id: 'triad-qwiic-left', partId: 'triad-spectral-sensor', type: 'qwiic', normalizedX: 0.03, normalizedY: 0.50, orientation: 'left', accepts: ['qwiic'], required: true, label: 'TRIAD Qwiic A', sourceReference: 'Build 2 cable from RTC to TRIAD.' },
  { id: 'triad-qwiic-right', partId: 'triad-spectral-sensor', type: 'qwiic', normalizedX: 0.97, normalizedY: 0.50, orientation: 'right', accepts: ['qwiic'], required: true, label: 'TRIAD Qwiic B', sourceReference: 'Build 2 cable from TRIAD to OLED.' },
  { id: 'oled-qwiic', partId: 'oled-display', type: 'qwiic', normalizedX: 0.03, normalizedY: 0.58, orientation: 'left', accepts: ['qwiic'], required: true, label: 'OLED Qwiic', sourceReference: 'Build 2 cable from TRIAD to OLED.' },
  { id: 'battery-lead', partId: 'battery-400', type: 'battery-lead', normalizedX: 0.02, normalizedY: 0.32, orientation: 'left', accepts: ['switch-input'], required: true, label: '400 mAh battery lead', sourceReference: 'Build 2 pouch-battery plug into the switch input.' },
  { id: 'switch-input', partId: 'power-switch', type: 'switch-input', normalizedX: 0.05, normalizedY: 0.50, orientation: 'left', accepts: ['battery-lead'], required: true, label: 'Power-switch battery input', sourceReference: 'Build 2 battery side of inline switch.' },
  { id: 'switch-output', partId: 'power-switch', type: 'switch-output', normalizedX: 0.95, normalizedY: 0.50, orientation: 'right', accepts: ['processor-battery'], required: true, label: 'Power-switch output', sourceReference: 'Build 2 microcontroller side of inline switch.' },
] as const

export const CONNECTOR_BY_ID = new Map(CONNECTORS.map((connector) => [connector.id, connector]))

export const REQUIRED_CONNECTIONS: readonly RequiredConnectionDefinition[] = [
  { id: 'qwiic-processor-button', kind: 'qwiic', endpointA: 'rp2040-qwiic', endpointB: 'button-qwiic-left', label: 'RP2040 ↔ button', sourceReference: 'Flat assembly diagram and Build 2.', cableAppearance: 'Black-sleeved 100 mm Qwiic cable with multicolor leads.', confidence: 'high' },
  { id: 'qwiic-button-clock', kind: 'qwiic', endpointA: 'button-qwiic-right', endpointB: 'rtc-qwiic-left', label: 'Button ↔ RTC', sourceReference: 'Flat assembly diagram and Build 2.', cableAppearance: 'Black-sleeved 100 mm Qwiic cable with multicolor leads.', confidence: 'high' },
  { id: 'qwiic-clock-triad', kind: 'qwiic', endpointA: 'rtc-qwiic-right', endpointB: 'triad-qwiic-left', label: 'RTC ↔ TRIAD', sourceReference: 'Flat assembly diagram and Build 2.', cableAppearance: 'Black-sleeved 100 mm Qwiic cable with multicolor leads.', confidence: 'high' },
  { id: 'qwiic-triad-display', kind: 'qwiic', endpointA: 'triad-qwiic-right', endpointB: 'oled-qwiic', label: 'TRIAD ↔ OLED', sourceReference: 'Flat assembly diagram and Build 2.', cableAppearance: 'Black-sleeved 100 mm Qwiic cable with multicolor leads.', confidence: 'high' },
  { id: 'power-battery-switch', kind: 'power', endpointA: 'battery-lead', endpointB: 'switch-input', label: 'Battery ↔ switch input', sourceReference: 'Flat assembly diagram and Build 2.', cableAppearance: 'Red/black two-conductor battery lead.', confidence: 'high' },
  { id: 'power-switch-rp2040', kind: 'power', endpointA: 'switch-output', endpointB: 'rp2040-battery', label: 'Switch output ↔ RP2040', sourceReference: 'Flat assembly diagram and Build 2.', cableAppearance: 'Red/black two-conductor switched lead.', confidence: 'high' },
] as const

export const QWIIC_CABLE_IDS = ['qwiic-cable-1', 'qwiic-cable-2', 'qwiic-cable-3', 'qwiic-cable-4'] as const
export const POWER_CONNECTION_IDS = ['power-battery-switch', 'power-switch-rp2040'] as const
