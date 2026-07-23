# STELLA-Q2 Device Lab — Phase 2B component-layout evidence

## Scope

Phase 2B implements only Build Step 5: staging loose electronics on the supplied
flat assembly diagram. It does not create cables, connections, enclosure
installation, programming, measurement, or later-step interactions.

## Primary sources inspected

- `Build instructions and documentation/STELLA-Q2 flat assembly diagram.pdf`
- `Build Instructions Photos/5 STELLA-Q2 build 1.jpg`
- Official Q2 parts list PDF and spreadsheet entries for component identity.

The application renders the supplied rasterized flat diagram as the interactive
surface without altering its printed labels, cable paths, or scale claims. The
Build 1 photograph is available as a separate comparison or an explicitly
transparent visual overlay. Its photographic perspective is not treated as a
coordinate system.

## Supported Step 5 components

| Component | Source-backed visual treatment | Documented placement / orientation |
| --- | --- | --- |
| SparkFun Thing Plus RP2040 | Simplified red narrow board with USB-C and pin details | Lower-left processor outline; USB-C toward the top |
| SparkFun I2C Button | Simplified red board and central button | Left-side pushbutton outline, upright |
| Adafruit PCF8523 RTC | Simplified dark board and coin holder | Upper-left clock outline, holder upward |
| CR1220 coin cell | Simplified metallic positive/negative face | Loose staging location beside the clock; **positive side up**, not inserted |
| SparkFun TRIAD / AS7265x | Simplified red board and circular optical assembly | Central spectrometer outline; optical face / IR marking upright |
| Adafruit 128×32 OLED | Simplified blue board and dark screen | Upper-right display outline; screen up, connector right |
| Adafruit 3.7 V 400 mAh pouch battery | Simplified silver pouch and lead | Lower-right battery outline; lead toward switch path |
| Adafruit battery disconnect switch | Simplified black inline switch | Lower-center switch outline, horizontal |

The supplied documents do not provide separate product photographs positioned
for all eight items. The teaching visuals are therefore labelled **accurate
simplified representations**, derived from the original Build 1 photograph and
the corresponding flat-diagram outlines; they are not presented as new NASA
photography or exact product renders.

## Deliberate exclusions

- The four Qwiic cables are visible in Build 1 but are locked until Step 6.
- The microSD card is visible in the broader source materials but has no
  documented loose Step 5 target on the flat diagram, so it is not a layout
  target.
- No cable endpoints or electrical connections are accepted by Phase 2B.

## Interaction and validation

All target centers and footprints are stored as normalized coordinates, so the
diagram preserves its aspect ratio on responsive layouts and does not claim a
physical on-screen scale. Validation checks component identity, documented
target, orientation, occupancy, and the CR1220 positive face. Undo, redo, reset
and keyboard-accessible target placement operate on the same persisted state.

Existing Phase 2A browser-session data is migrated from schema version 2 to
version 3 with an empty layout, preserving the prior scaffolding activity.
