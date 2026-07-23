# STELLA-Q2 Phase 2G — bottom-cover geometry and closure analysis

## Scope and authoritative evidence

This analysis is limited to documented Build Step 10, **“Install the bottom
cover.”** It does not infer or implement the two signal-lamp windows from Step
11 or the USB/programming work from Step 12.

The primary geometric sources are the supplied, cleaned meshes:

- `Q2 parts STL files/Q2 bottom cover.STL`
- `Q2 parts STL files/Q2 top housing.STL`

The supporting sources inspected were:

- `Build instructions and documentation/STELLA_Q2_Build_Instructions_June2025.pdf`
- `Build instructions and documentation/Build Instructions Photos/9 STELLA-Q2 build 4.jpg`
- the top/bottom scaffolding before-and-after photographs in the same photo directory
- `Build instructions and documentation/STELLA-Q2 changes in version 3.0 release.pdf`
- the supplied retainer STLs
- the Phase 2A, 2D, 2E, and 2F analysis documents
- the existing millimetre-to-scene calibration and production component, connection, retainer, and route definitions

Build 4 is the authoritative open-case routing reference. It does **not** show
a completed closed case. There is no dedicated Step 10 installation photograph
and no documented latch order, closure force, or flexure deflection.

## Mesh audit

The binary STL files were parsed as indexed triangle soups, with vertices
rounded to 1 µm for connectivity analysis.

| mesh | triangles | unique rounded vertices | connected components | raw bounds (mm) | dimensions (mm) |
|---|---:|---:|---:|---|---|
| `Q2 bottom cover.STL` | 3,296 | 1,658 | 1 | X 0–65.790; Y 0–181.945; Z 0–11.500 | **65.790 × 181.945 × 11.500** |
| `Q2 top housing.STL` | 55,120 | 27,540 | 1 | X 0–65.790; Y 0–181.945; Z 0.001–14.701 | **65.790 × 181.945 × 14.700** |

Both files share the same uncentred authoring axes: +X crosses the 65.79 mm
case width, +Y follows the 181.945 mm case length, and +Z follows enclosure
depth. The simulator translates X/Y into the existing centred Step 7–10
coordinate frame and preserves the physical `1 mm = 0.01 scene unit` scale.
The mesh is not resized to make it fit.

The bottom cover and top housing each form one watertight connected assembly in
the supplied file. Separate latch features are therefore not treated as
detachable meshes.

## Mating perimeter, contact surfaces, and final transform

The matching 65.79 × 181.945 mm footprints establish a rectangular mating
perimeter around the long case. Phase 2F’s four contact bands remain the
conservative cable-clearance boundary: left, right, front, and rear. The
interior-facing cover surface closes toward the populated housing along the
shared Z/depth axis.

The production target is serializable:

- staged position: `[95, 0, 45] mm`
- pre-seat aligned position: `[0, 0, 52] mm`
- final calibrated position: `[0, 0, 26] mm`
- final rotation: `[0, 0, 0]°`
- guided insertion vector: `[0, 0, -1]`
- translation distance from aligned to seated: 26 mm
- XY alignment tolerance: 3 mm
- rotation tolerance: 8°

These transforms reuse the existing enclosure coordinate calibration and
Phase 2F bottom-cover ghost relationship. The common footprint and Z-facing
mating surfaces are high-confidence findings. The exact approach distance and
simulator target origin are **medium confidence** because the source package
contains no metrology drawing or assembly transform.

The source geometry does not establish a hinge, screw, magnet, edge-first
sequence, or required latch order. It also does not uniquely prove a manual
motion more specific than bringing the two matching parts together. Phase 2G
therefore uses a clearly disclosed, deterministic **guided align-and-seat
translation along −Z**. It never presents that convenience as an official
mechanical sequence.

## Latch and flexure audit

Matched boundary features in both meshes establish four paired corner
latch/flexure regions. Raw STL bounds were converted to centred coordinates by
subtracting 32.895 mm from X and 90.9725 mm from Y.

| stable ID | location | owning relationship | bottom-cover bounds (mm) | top-housing bounds (mm) | engagement direction | expected final relationship | represented travel | confidence |
|---|---|---|---|---|---|---|---:|---|
| `front-left-latch` | X− / Y− corner | top-housing flexure + cover catch | X −32.895…−31.145; Y −88.973…−72.973; Z 4.90…8.00 | X −32.895…−31.020; Y −88.973…−73.473; Z 5.25…12.77 | inward +X | paired boundary features engaged after full seating | **0 mm** | high |
| `front-right-latch` | X+ / Y− corner | top-housing flexure + cover catch | X 31.145…32.895; Y −88.973…−72.973; Z 4.90…8.00 | X 31.020…32.895; Y −88.973…−73.473; Z 5.25…12.77 | inward −X | paired boundary features engaged after full seating | **0 mm** | high |
| `rear-left-latch` | X− / Y+ corner | top-housing flexure + cover catch | X −32.895…−31.145; Y 72.972…88.972; Z 4.90…8.00 | X −32.895…−31.020; Y 73.472…88.972; Z 5.25…12.77 | inward +X | paired boundary features engaged after full seating | **0 mm** | high |
| `rear-right-latch` | X+ / Y+ corner | top-housing flexure + cover catch | X 31.145…32.895; Y 72.972…88.972; Z 4.90…8.00 | X 31.020…32.895; Y 73.472…88.972; Z 5.25…12.77 | inward −X | paired boundary features engaged after full seating | **0 mm** | high |

The Version 3.0 release note says the latch flexures have shorter travel to
reduce the likelihood of breakage. It does not provide material, stiffness,
force, travel, fatigue, or stress data. Consequently the simulation stores only
`disengaged`, `aligned`, `engaging`, and `engaged` state. It does not deform the
source STL, calculate stress, animate a fabricated travel distance, or claim a
failure probability. Any engagement order is explicitly labelled a simulator
convenience because no order is documented.

All four latch volumes are collision regions. A routed lead occupying one is a
blocking fault, not something the cover interaction silently moves.

## Interior clearance and pinch strategy

Step 10 consumes the actual central state from Steps 4–9. It does not construct
a fake completed interior. Before alignment, seating, or latch engagement it
reruns:

1. component layout, electrical topology, CR1220, enclosure placement, microSD,
   retainer, and six-route prerequisite validation;
2. dense segment sampling along all four Qwiic leads and both power leads;
3. contact-edge intersection tests;
4. intersection tests against all four latch envelopes;
5. an interior cover-clearance ceiling test;
6. seated component-height and retainer-height tests.

The current conservative interior clearance ceiling is **28 mm in the existing
centred assembly frame**. It is a collision envelope derived from the physical
enclosure calibration, not a claim that the printed cover has 28 mm of uniform
free internal depth. It covers the battery, switch, microcontroller/microSD,
OLED, clock, spectrometer, pushbutton, connector exits, and installed retainers
because those objects remain the production Step 7–9 transforms tested against
the closure volume.

Potential pinch regions are:

- all four perimeter contact bands;
- all four corner latch regions;
- any sampled cable point above the available interior envelope;
- the permanent top-housing boundary;
- every seated component and installed retainer volume.

Clearance failures identify the affected route or part and link back to Step 9,
8, or 7. No route, component, connection, CR1220, microSD, or retainer transform
is auto-corrected during closure.

## Alignment and completion rules

The cover can become aligned only when its interior faces the electronics, all
three rotations are within tolerance, X/Y are within tolerance of the mating
perimeter, Step 9 remains valid, and the closure volume is clear. Reversed and
wrong-rotation cases receive separate statuses.

Completion requires:

- valid Steps 4–9 state and unchanged electrical endpoints;
- correct face, rotation, alignment, and full seating;
- all four individual latches engaged;
- no route, contact, latch, component, retainer, or housing collision.

Aligned and half-seated states cannot complete Step 10. Reopening disengages
the latches and moves the cover to the aligned state while preserving every
internal route and all earlier progress. Signal-lamp windows and USB state are
deliberately absent from the Phase 2G schema.

## Confidence and unresolved ambiguity

High confidence:

- exact source mesh filenames, bounds, triangle/component counts, and scale;
- shared footprint and four paired corner latch regions;
- Build 4 as the required pre-closure routing reference;
- Step 10 ending with the bottom cover installed;
- Version 3.0’s qualitative shorter-travel latch change.

Medium confidence:

- the calibrated scene-space final Z origin and chosen pre-seat distance;
- the guided straight seating transition as the safest neutral representation;
- the conservative aggregate interior clearance ceiling.

Unresolved and therefore not simulated as physical truth:

- whether a technician normally starts one edge before another;
- a preferred or required latch engagement order;
- exact flexure deflection, force, material, stress, fatigue, or failure;
- a separate alignment tab sequence;
- exact closure speed.

No hinge, fastener, magnet, or permanent cover deformation was found or
invented.
