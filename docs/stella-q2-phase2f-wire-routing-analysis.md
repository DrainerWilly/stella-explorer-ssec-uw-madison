# STELLA-Q2 Phase 2F — Build 4 wire-routing analysis

## Sources inspected

- `STELLA_Q2_Build_Instructions_June2025.pdf`, especially Step 9: “Route the wires to approximate the photograph.”
- `Build Instructions Photos/7 STELLA-Q2 build 3.jpg` (loose before-routing state)
- `Build Instructions Photos/9 STELLA-Q2 build 4.jpg` (primary routing target)
- `STELLA-Q2 flat assembly diagram.pdf` and `SQ2_parts_list.pdf`
- `Q2 top housing.STL`, `Q2 bottom cover.STL`, and all five supplied retainer STLs
- Phase 2C connection, Phase 2D enclosure-placement, and Phase 2E retainer analyses
- Existing central connector, cable, enclosure, and retainer state

Build 4 is a photographic organization target, not an engineering drawing. The corridors below are intentionally broad. The simulator validates safe function, available length, cover clearance, and approximate organization rather than demanding one exact spline.

## Six source-supported routes

| stable route | type | fixed endpoints | Build 4 finding / corridor | critical clearance | confidence / ambiguity |
| --- | --- | --- | --- | --- | --- |
| Qwiic cable assigned to RP2040 ↔ button | 100 mm Qwiic | `rp2040-qwiic` ↔ `button-qwiic-left` | Short link at the right of the processor/button region | MC and BN retainers; right cover edge | Medium: exact slack loop is partly obscured |
| Qwiic cable assigned to button ↔ RTC | 100 mm Qwiic | `button-qwiic-right` ↔ `rtc-qwiic-left` | Long rise along the left interior past DISP | CK/DISP/BN retainers and left latches | Medium: several bundled conductors overlap visually |
| Qwiic cable assigned to RTC ↔ TRIAD | 100 mm Qwiic | `rtc-qwiic-right` ↔ `triad-qwiic-left` | Short upper-left service loop | CK retainer and upper cover edge | Medium |
| Qwiic cable assigned to TRIAD ↔ OLED | 100 mm Qwiic | `triad-qwiic-right` ↔ `oled-qwiic` | Upper-right descent beside TRIAD and display | DISP retainer and upper/right edges | Medium |
| `power-battery-switch` | red/black battery lead | `battery-lead` ↔ `switch-input` | Lower-left turn beside BAT and the inline switch | BAT retainer, lower edge, battery cradle | Medium: lead length is not specified in the BOM |
| `power-switch-rp2040` | red/black switched lead | `switch-output` ↔ `rp2040-battery` | Rises on the right past button to the processor | BN/MC retainers, right latch, microSD access | Medium |

No seventh wire was added. Other visible colored conductors belong to these Qwiic sleeves or the two-conductor power path; the package provides no additional independent connection.

Cable identity and connector topology remain fixed from Step 6. The four visually interchangeable Qwiic cable IDs retain whichever validated endpoint pair the student used. Routing never reassigns endpoints.

## Routing corridors

The simulator models six broad, optional source-supported regions: upper-left service, upper-right service, mid-left service, mid-right service, lower-left power, and center-open. Preferred nodes are teaching suggestions derived from Build 4, not measured waypoints. A route may vary within the enclosure if it remains safe and uses a compatible corridor.

The suggested order—short internal Qwiic links, longer Qwiic links, then power—is an explicitly labeled simulator inference from the photograph, not an official NASA instruction.

## Bottom-cover clearance audit

The supplied bottom cover is one connected STL measuring 65.79 × 181.945 × 11.5 mm. It is rendered only as a transparent, wireframe ghost labeled “Installed in Step 10.” It has no installation action in Phase 2F.

The analysis defines four perimeter contact bands, left/right latch regions, and a conservative interior safe volume. These use the source STL bounds plus visible housing latch geometry. They are collision envelopes, not claims of manufacturing-grade tolerance. A cable entering a contact or latch band is rejected because it could prevent Step 10 closure.

## Length, slack, and bend assumptions

- Qwiic cables use the parts-list value of 100 mm.
- Route rendering/photograph uncertainty permits 8 mm beyond that nominal value before an obvious overlength failure.
- The two power leads keep Phase 2D’s conservative 165 mm visual allowance because the source does not publish individual lead lengths. The UI calls this an allowance, not a specification.
- Routes shorter than 103.5% of straight connector separation are treated as implausibly taut.
- Smooth centripetal Catmull–Rom rendering avoids sharp visual corners; validation uses complete endpoint-to-control-point segments at whole-millimetre display precision.
- The source does not provide bend-radius, strain-relief, or exact connector-height metrology, so the simulator avoids unsupported decimal precision.

## Collision and pinch strategy

Sampled route segments are tested against permanent housing bounds, component footprints, installed retainer bounds, cover perimeter bands, and latch envelopes. The first and last 14 mm near fixed connectors are excluded from solid-body tests so a legitimate cable can leave its own connector and pass beside its matching clip. Phase 2E’s explicit per-retainer clearance state remains authoritative for a cable trapped under its own clip; unrelated retainers remain solid collision bodies. Messages identify the affected class or source-backed region rather than rejecting small visual differences from Build 4.

## Scope boundary

Phase 2F stops after successful internal routing. It does not install or latch the bottom cover, install lamp windows, connect USB-C, program CircuitPython, operate the device, or perform measurements.
