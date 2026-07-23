# STELLA-Q2 Phase 2E — retainer-clip installation evidence

Phase 2E is intentionally limited to Step 8. It uses the five supplied retainer STL files and Build 3/Build 4 photographs. Step 9 cable routing and the bottom cover are not implemented here.

| STL / label | documented secured module | source STL dimensions (mm) | installed coordinate (mm) | insertion / evidence |
| --- | --- | ---: | ---: | --- |
| `Q2 clock retainer.STL` / CK | PCF8523 clock | 19.53 × 14 × 5.55 | (0, 34, 12.3) | Down onto clock-bay rails; Build 3 loose CK and Build 4 seated CK. |
| `Q2 display retainer.STL` / DISP | OLED display | 23.29 × 20 × 9.3 | (0, 10, 12.8) | Down onto display-bay rails; preserve OLED Qwiic clearance. |
| `Q2 processor retainer.STL` / MC | Thing Plus RP2040 | 24.9 × 14 × 5.2 | (0, -25, 12.2) | Down onto processor rails; preserve Qwiic, battery, USB-C, and microSD access. |
| `Q2 button retainer.STL` / BN | I2C button | 27.8 × 20 × 7.05 | (0, -55, 12.7) | Down onto button rails while preserving cap travel and Qwiic leads. |
| `Q2 battery retainer.STL` / BAT | 400 mAh battery | 19.3 × 24 × 4.8 | (0, -82, 13.1) | Down into the lower battery cradle; preserve red/black lead clearance. |

The five mappings are high confidence: their names, Build 3 loose labels, and Build 4 installed positions agree. No TRIAD retainer STL is included in the supplied source package, so TRIAD is retained directly by the top housing rather than invented as a sixth clip.

The source package does not provide measured latch flexure or force values. The simulator therefore represents the documented rail-alignment and snap state, not an unsupported finite-element deflection model. Incorrect rotation, target, seating, collisions, and cable pinch states are separately validated. The original Step 6 cable graph is preserved; clearance testing never changes cable endpoints.
