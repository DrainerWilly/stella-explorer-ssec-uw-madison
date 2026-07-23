# STELLA-Q2 Phase 2D — Step 7 enclosure-placement analysis

## Scope and source audit

Phase 2D implements only Build Step 7: “Place the connected parts in their
respective slots to match the photograph.” The authoritative step sequence in
`STELLA_Q2_Build_Instructions_June2025.pdf` separates this from Step 8
(retainer clips) and Step 9 (wire routing). The primary visual target is
`Build Instructions Photos/7 STELLA-Q2 build 3.jpg`; Build 2 was used to
preserve the pre-existing cable topology, and Build 4 was inspected only to
avoid treating later routing as a Step 7 requirement.

The supplied `Q2 top housing.STL` is used directly in the 3D workspace. Its
published source dimensions in the project inventory are 65.79 × 181.945 ×
14.7 mm. Retainer STL files were inspected only as clearance evidence and
remain unavailable for installation.

## Build 3 visible inventory

| Item | Build 3 representation | Step 7 slot | Orientation / insertion | Evidence | Confidence |
| --- | --- | --- | --- | --- | --- |
| AS7265x TRIAD | Red square board at the upper housing | `triad-optical-bay` | Optical face upward; lower into upper bay | Build 3; 1:1 diagram | High |
| PCF8523 RTC | Black board below TRIAD | `rtc-bay` | Coin-cell holder upward; lower vertically | Build 3; diagram | High |
| CR1220 | Installed state is retained in RTC | RTC holder, not a loose Step 7 slot | Positive side up remains from Step 6 | Build 2, diagram, Build 3 | High |
| 0.91-inch OLED | Blue board under RTC | `oled-bay` | Screen upward; connector toward cable side | Build 3; diagram | High |
| Thing Plus RP2040 | Red SparkFun board below OLED | `rp2040-bay` | Board face upward; storage edge accessible | Build 3; diagram | High |
| microSD card | SanDisk card visibly seated at the RP2040 edge | `micro-sd-reader` | Label upward; insert laterally into integrated reader | Build 3 | High |
| Pushbutton module | Red board below RP2040 | `pushbutton-bay` | Board/button side upward | Build 3; diagram | High |
| Power switch | Black inline body immediately above battery area | `power-switch-bay` | Horizontal; loose lead slack remains | Build 3 | Medium |
| 400 mAh battery | Silver pouch in lower recess | `battery-bay` | Flat; lead toward switch path | Build 3; diagram | High |
| Four Qwiic cables | Attached multicolor/black-sleeved leads | Derived from Step 6 endpoints | Curves update while boards move | Build 2, Build 3 | High |
| Two power leads | Attached red/black leads | Derived from Step 6 endpoints | Curves update while boards move | Build 2, Build 3 | High |

### microSD decision

Build 3 clearly shows a microSD card seated in the Thing Plus RP2040’s
integrated reader. The simulator therefore adds a Step 7 `micro-sd-card`
placement state and reader slot; it does **not** invent a separate reader
board or an earlier unsupported installation step. Phase 2C sessions migrate
safely with the card uninstalled until the student completes its supported
Step 7 placement.

## Physical model and constraints

All enclosure transforms are serializable millimetre coordinates in a centred
top-housing frame: x is its 65.79 mm short axis, y its 181.945 mm long axis,
and +z points out of the open housing. Slot centres are photo/diagram-derived
approximations with explicit 6–7 mm placement tolerances and 18–25° rotation
tolerances; they are not falsely claimed as measured manufacturing values.

The real housing STL is the scene geometry. Boards use restrained 2.5D
proxies based on the source photographs and validated Phase 2B footprints:
source-coloured upper board faces, neutral thickness, and recognizable OLED,
TRIAD, RTC, button, processor, switch, battery, and microSD details. No
unrelated internet model is used.

The four documented 100 mm Qwiic cables are validated with a conservative
130 mm temporary reach allowance to support loose Step 7 curves. The two
photographed power leads receive a 165 mm allowance. The simulator validates
endpoint preservation and implausible stretch, but intentionally does not
score Step 9’s final cable routing.

## Known ambiguity and deliberate limits

Build 3 already shows loose retainer clips beside the housing, but the
official instructions assign their installation to Step 8. They are reference
context only. Build 3 shows the switch placement less distinctly than the
boards, so its bay and orientation are medium confidence. The source does not
provide electronic-board CAD, exact connector heights, or cable bend radii;
the visual proxies and temporary curves are documented approximations.

No Step 8 retainers, Step 9 cable routing, bottom cover, lamp windows,
programming, runtime operation, or measurements are implemented here.
