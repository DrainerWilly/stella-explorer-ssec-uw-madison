# STELLA-Q2 Device Lab — Phase 2C connection evidence

## Sources inspected

- `STELLA-Q2 flat assembly diagram.pdf`
- `STELLA_Q2_Build_Instructions_June2025.pdf` — Step 6: “Connect them with cables to match the diagram.”
- `Build Instructions Photos/6 STELLA-Q2 build 2.jpg` (primary photographic evidence)
- `Build Instructions Photos/5 STELLA-Q2 build 1.jpg`
- `SQ2_parts_list.pdf` and `SQ2_parts_list.xlsx`
- `STELLA-Q2 Operation.pdf`
- `Software_3_0_1/code.py` (firmware confirms one shared I2C bus initializes the display, button, PCF8523 clock, and AS7265x TRIAD)
- Existing Phase 2B analysis and `src/features/stellaQ2/data/connections.ts`

## Verified Step 6 graph

| Stable ID | Type | Source connector | Destination connector | Appearance | Evidence / confidence |
| --- | --- | --- | --- | --- | --- |
| `qwiic-processor-button` | 100 mm Qwiic | RP2040 Qwiic | Button Qwiic A | black sleeve with multicolor leads | Flat diagram + Build 2 — high |
| `qwiic-button-clock` | 100 mm Qwiic | Button Qwiic B | RTC Qwiic A | black sleeve with multicolor leads | Flat diagram + Build 2 — high |
| `qwiic-clock-triad` | 100 mm Qwiic | RTC Qwiic B | TRIAD Qwiic A | black sleeve with multicolor leads | Flat diagram + Build 2 — high |
| `qwiic-triad-display` | 100 mm Qwiic | TRIAD Qwiic B | OLED Qwiic | black sleeve with multicolor leads | Flat diagram + Build 2 — high |
| `power-battery-switch` | battery lead | 400 mAh pouch battery lead | switch battery input | red/black two-conductor lead | Flat diagram + Build 2 — high |
| `power-switch-rp2040` | switched power lead | switch output | RP2040 battery connector | red/black two-conductor lead | Flat diagram + Build 2 — high |

The Qwiic cable identities are intentionally interchangeable; Phase 2C checks
the six physical endpoint pairs rather than assigning a special identity to a
visually identical 100 mm cable.

## Connector orientation and coordinate method

Connector positions are normalized to their component footprint, not browser
pixels. Build 2 visibly establishes the left/right Qwiic chain direction and
the inline order of the battery/switch/RP2040 path. Hit targets are enlarged
only invisibly for accessibility; no decorative board feature is an endpoint.

## CR1220 decision

Build 2 visibly shows the coin cell in the RTC holder and repeats the printed
callout “+ side up.” Phase 2C therefore moves the coin from loose Step 5
staging to an installed RTC state only when the saved Step 5 coin face is
positive-up. It may be removed and reinserted for correction.

## MicroSD decision

The firmware and operation materials establish that a microSD card is used for
logging, but neither Build 1, Build 2, nor the flat assembly diagram provides a
source-supported Step 6 insertion state or an unambiguous installation view.
MicroSD insertion is deliberately deferred; Phase 2C does not invent it.

## Unresolved ambiguity

The source photo confirms endpoints and physical order, but does not provide
manufacturer-grade pinout drawings or a unique cable serial order. The phase
records that limitation and validates only source-visible ports and topology.
