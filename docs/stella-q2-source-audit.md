# STELLA-Q2 source audit

Audit date: 2026-07-22  
Audited package: `public/assets/stella/STELLA-Q2_download_Jan2026/STELLA-Q2_download_Jan2026/`  
Target implementation: ExSTELLA STELLA-Q2 virtual lab, Phase 0 source foundation

## Scope, authority, and inspection method

The directory above is the source of truth for the STELLA-Q2 simulator. This audit records what the delivered package actually contains; it does not silently fill gaps from product pages, generic electronics knowledge, or earlier Device Lab code.

Inspection performed:

- recursively enumerated all 86 files (10,008,065 bytes);
- read and visually rendered all 12 pages across the seven PDFs;
- inspected all ten build photographs at original resolution and reconstructed their intended chronology;
- parsed all cells, formulas, cached values, and export sheets in the three valid workbooks, and identified the fourth `.xlsx` as an Office lock artifact;
- parsed every row and field of the 270-record example CSV;
- parsed all eight binary STL meshes for bounds, triangle count, manifoldness, volume, and visible form;
- read all 1,409 lines of `Software_3_0_1/code.py`, compared its text duplicate byte-for-byte, and inspected the UF2 metadata;
- read all ten test programs;
- inventoried every bundled CircuitPython library. The 35 `.mpy` files are compiled bytecode and were inspected through package/module/version/repository metadata and usage, not decompiled into unprovided source.

The package is internally useful and sufficiently detailed for a guided simulator, but it is not conflict-free. All known conflicts and unresolved questions are collected near the end of this document.

## Package summary

| File kind | Count | Inspection result |
|---|---:|---|
| PDF | 7 | All pages read and visually inspected |
| JPEG | 10 | All viewed at original resolution |
| XLSX | 4 | Three workbooks parsed; one 165-byte lock artifact |
| CSV | 1 | 270 data records parsed and validated |
| STL | 8 | Mesh metadata and geometry inspected |
| Python source | 14 | Main program, ten tests, and three empty package initializers read |
| CircuitPython `.mpy` | 35 | Binary inventory and embedded metadata inspected |
| TXT | 1 | Confirmed byte-identical to main firmware |
| UF2 | 1 | Board/runtime metadata inspected |
| `.DS_Store` | 5 | Finder metadata; no simulator value |
| **Total** | **86** | Complete recursive inventory below |

## Complete recursive categorized file inventory

Every source-relative file appears exactly once in this inventory. Files are grouped by primary function; some spreadsheet files also serve a parts-list or color-table function.

### Build documentation

1. `Build instructions and documentation/STELLA_Q2_Build_Instructions_June2025.pdf` — one-page, official 12-step physical build sequence.
2. `Build instructions and documentation/STELLA-Q2 changes in version 3.0 release.pdf` — one-page software, enclosure, and documentation change summary.

### Assembly diagrams

1. `Build instructions and documentation/STELLA-Q2 flat assembly diagram.pdf` — one-page, 1:1 component-placement and connection guide.

### Photographs

1. `Build instructions and documentation/Build Instructions Photos/4 STELLA-Q2 remove scaffolding bottom.jpg`
2. `Build instructions and documentation/Build Instructions Photos/4 STELLA-Q2 remove scaffolding top.jpg`
3. `Build instructions and documentation/Build Instructions Photos/4 STELLA-Q2 scaffolding removed bottom.jpg`
4. `Build instructions and documentation/Build Instructions Photos/4 STELLA-Q2 scaffolding removed top.jpg`
5. `Build instructions and documentation/Build Instructions Photos/5 STELLA-Q2 build 1.jpg`
6. `Build instructions and documentation/Build Instructions Photos/6 STELLA-Q2 build 2.jpg`
7. `Build instructions and documentation/Build Instructions Photos/7 STELLA-Q2 build 3.jpg`
8. `Build instructions and documentation/Build Instructions Photos/9 STELLA-Q2 build 4.jpg`
9. `Build instructions and documentation/Build Instructions Photos/11 STELLA-Q2 lamp covers loose.jpg`
10. `Build instructions and documentation/Build Instructions Photos/11 STELLA-Q2 lamp covers installed.jpg`

### Operation documentation

1. `Build instructions and documentation/STELLA-Q2 Operation.pdf` — four-page power, charging, MODE, recording, lamp, clock, OLED, and plot instructions.

### Software documentation

1. `Build instructions and documentation/STELLA_Q2_Software_Instructions_June2025.pdf` — two-page UF2/runtime installation and clock-setting guide.

### Parts lists

1. `Build instructions and documentation/SQ2_parts_list.pdf` — official one-page BOM and prices.

### Color tables

1. `Build instructions and documentation/NASA STELLA-Q2 color lookup table.pdf` — two-page 18-channel color/frequency/energy reference and source list.

### Spreadsheets

1. `Build instructions and documentation/NASA STELLA-Q2 color lookup table.xlsx` — authoritative five-sheet structured color/frequency/energy source.
2. `Build instructions and documentation/NASA STELLA-Q2 color lookup table2.xlsx` — damaged one-sheet derivative; 54 calculated cells contain `#REF!`.
3. `Build instructions and documentation/SQ2_parts_list.xlsx` — BOM workbook; agrees with the parts PDF.
4. `Build instructions and documentation/~$NASA STELLA-Q2 color lookup table.xlsx` — 165-byte Office lock artifact, not a usable workbook.

### Example data

1. `Build instructions and documentation/STELLA-Q2_data_20250612-0.csv` — 15 acquisitions × 18 channels = 270 records.

### STL models

1. `Q2 parts STL files/Q2 battery retainer.STL`
2. `Q2 parts STL files/Q2 bottom cover.STL`
3. `Q2 parts STL files/Q2 button retainer.STL`
4. `Q2 parts STL files/Q2 clock retainer.STL`
5. `Q2 parts STL files/Q2 display retainer.STL`
6. `Q2 parts STL files/Q2 processor retainer.STL`
7. `Q2 parts STL files/Q2 top housing.STL`
8. `Q2 parts STL files/signal lamp window CC.STL`

### Firmware and runtime

1. `Software_3_0_1/code.py` — STELLA-Q2 application source, version 3.0.1.
2. `Software_3_0_1/Q2v3.0.1.txt` — byte-identical duplicate of `code.py`.
3. `Software_3_0_1/UF2-file/adafruit-circuitpython-sparkfun_thing_plus_rp2040-en_US-9.2.8.uf2` — Adafruit CircuitPython 9.2.8 for SparkFun Thing Plus RP2040.

### Libraries

1. `Software_3_0_1/lib/AS7265X_sparkfun/Device.mpy`
2. `Software_3_0_1/lib/AS7265X_sparkfun/__init__.mpy`
3. `Software_3_0_1/lib/adafruit_bus_device/__init__.py`
4. `Software_3_0_1/lib/adafruit_bus_device/i2c_device.mpy`
5. `Software_3_0_1/lib/adafruit_bus_device/spi_device.mpy`
6. `Software_3_0_1/lib/adafruit_display_shapes/__init__.py`
7. `Software_3_0_1/lib/adafruit_display_shapes/arc.mpy`
8. `Software_3_0_1/lib/adafruit_display_shapes/circle.mpy`
9. `Software_3_0_1/lib/adafruit_display_shapes/line.mpy`
10. `Software_3_0_1/lib/adafruit_display_shapes/multisparkline.mpy`
11. `Software_3_0_1/lib/adafruit_display_shapes/polygon.mpy`
12. `Software_3_0_1/lib/adafruit_display_shapes/rect.mpy`
13. `Software_3_0_1/lib/adafruit_display_shapes/roundrect.mpy`
14. `Software_3_0_1/lib/adafruit_display_shapes/sparkline.mpy`
15. `Software_3_0_1/lib/adafruit_display_shapes/triangle.mpy`
16. `Software_3_0_1/lib/adafruit_display_text/__init__.mpy`
17. `Software_3_0_1/lib/adafruit_display_text/bitmap_label.mpy`
18. `Software_3_0_1/lib/adafruit_display_text/label.mpy`
19. `Software_3_0_1/lib/adafruit_display_text/outlined_label.mpy`
20. `Software_3_0_1/lib/adafruit_display_text/scrolling_label.mpy`
21. `Software_3_0_1/lib/adafruit_displayio_ssd1306.mpy`
22. `Software_3_0_1/lib/adafruit_framebuf.mpy`
23. `Software_3_0_1/lib/adafruit_gps.mpy`
24. `Software_3_0_1/lib/adafruit_max1704x.mpy`
25. `Software_3_0_1/lib/adafruit_pcf8523.mpy`
26. `Software_3_0_1/lib/adafruit_pcf8523/clock.mpy`
27. `Software_3_0_1/lib/adafruit_pcf8523/pcf8523.mpy`
28. `Software_3_0_1/lib/adafruit_pcf8523/timer.mpy`
29. `Software_3_0_1/lib/adafruit_register/__init__.py`
30. `Software_3_0_1/lib/adafruit_register/i2c_bcd_alarm.mpy`
31. `Software_3_0_1/lib/adafruit_register/i2c_bcd_datetime.mpy`
32. `Software_3_0_1/lib/adafruit_register/i2c_bit.mpy`
33. `Software_3_0_1/lib/adafruit_register/i2c_bits.mpy`
34. `Software_3_0_1/lib/adafruit_register/i2c_struct.mpy`
35. `Software_3_0_1/lib/adafruit_register/i2c_struct_array.mpy`
36. `Software_3_0_1/lib/adafruit_sdcard.mpy`
37. `Software_3_0_1/lib/i2c_button.mpy`
38. `Software_3_0_1/lib/neopixel.mpy`

### Test code

1. `q2_test_codes/128x32 display test/code.py`
2. `q2_test_codes/AS7265x spectrometer senso/code.py`
3. `q2_test_codes/SD card/code.py`
4. `q2_test_codes/i2c_bus_scan/code.py`
5. `q2_test_codes/i2c_button/code.py`
6. `q2_test_codes/max17048 battery monitor/code.py`
7. `q2_test_codes/on board blue LED/code.py`
8. `q2_test_codes/on board neopixel/code.py`
9. `q2_test_codes/pcf8523 clock_set/code.py`
10. `q2_test_codes/unique identifier/code.py`

### Miscellaneous assets

1. `.DS_Store`
2. `Build instructions and documentation/.DS_Store`
3. `Build instructions and documentation/Build Instructions Photos/.DS_Store`
4. `Software_3_0_1/.DS_Store`
5. `q2_test_codes/.DS_Store`

The Finder metadata and Office lock artifact must not be surfaced as learning materials or included by an automatic source importer.

## Important-source traceability table

| Exact relative path | Type | Purpose | Simulator support | Inspected | Unresolved questions |
|---|---|---|---|---|---|
| `Build instructions and documentation/STELLA_Q2_Build_Instructions_June2025.pdf` | PDF, 1 page | Official 12-step build order | Build navigator and instructional copy | Yes, complete and visual | No print settings, tolerances, material, or post-processing tool specified |
| `Build instructions and documentation/STELLA-Q2 flat assembly diagram.pdf` | PDF, 1 page | 1:1 layout and connector topology | Central workbench diagram and wiring validation | Yes, complete and visual | Not a pin-level schematic; final 3D cable bends are absent |
| `Build instructions and documentation/Build Instructions Photos/` | 10 JPEGs | Official visual build evidence | Photo chronology, comparisons, orientation, slot and routing guidance | Yes, all at source resolution | Steps 1–3, 10, and 12 have no dedicated photo; Step 9 routing is approximate |
| `Build instructions and documentation/SQ2_parts_list.pdf` | PDF, 1 page | Official BOM and prices | Parts inventory and procurement context | Yes, complete and visual | $153 includes two configuration-specific battery alternatives |
| `Build instructions and documentation/SQ2_parts_list.xlsx` | XLSX, 1 sheet | Structured BOM | Source-data validation | Yes, all cells/formulas | Same battery-total issue as PDF |
| `Build instructions and documentation/STELLA-Q2 Operation.pdf` | PDF, 4 pages | User operation behavior | Power, charging, recording, MODE, lamps, RTC, OLED states | Yes, every page and visual | MODE timing and integration prose conflict with delivered code/data |
| `Build instructions and documentation/STELLA_Q2_Software_Instructions_June2025.pdf` | PDF, 2 pages | CircuitPython and application install | Program-mode state flow and safety | Yes, every page and visual | Refers to folder `q2-code-and-libraries`, absent from delivered package |
| `Build instructions and documentation/STELLA-Q2 changes in version 3.0 release.pdf` | PDF, 1 page | Version 3 feature delta | Baseline behavior and case-access expectations | Yes, complete and visual | Describes features, not detailed state transitions |
| `Build instructions and documentation/NASA STELLA-Q2 color lookup table.pdf` | PDF, 2 pages | Human-readable 18-channel colors and physics | Spectral presentation and validation | Yes, every page and visual | Display colors are identifiers, not response curves |
| `Build instructions and documentation/NASA STELLA-Q2 color lookup table.xlsx` | XLSX, 5 sheets | Authoritative structured 18-channel data | `spectralChannels` source and integrity tests | Yes, all cells/formulas/sheets | None material; PDF is rounded relative to stored precision |
| `Build instructions and documentation/NASA STELLA-Q2 color lookup table2.xlsx` | XLSX, 1 sheet | Alternate export | Conflict evidence only | Yes, all cells/formulas | All 54 frequency/energy results are broken `#REF!` values |
| `Build instructions and documentation/STELLA-Q2_data_20250612-0.csv` | CSV, 271 lines | Example v3.0.1 output | Exact schema, deterministic sample playback, tests | Yes, all 270 records | A single short sequence cannot define universal target spectra or sensor noise |
| `Q2 parts STL files/Q2 top housing.STL` | Binary STL | Main front shell and internal slots | Future geometry and placement reference | Yes, mesh and renders | Print material/settings, latch-force behavior, and exact interaction tolerances absent |
| `Q2 parts STL files/Q2 bottom cover.STL` | Binary STL | Rear closure | Future closure/orientation simulation | Yes, mesh and renders | No documented installation force or durability limits |
| `Q2 parts STL files/* retainer.STL` | Five binary STLs | Clock/display/processor/button/battery retainers | Future retainer matching | Yes, all meshes and renders | Button STL contains one degenerate triangle; no missing sixth retainer should be invented |
| `Q2 parts STL files/signal lamp window CC.STL` | Binary STL | One lamp-window geometry, printed twice | Final enclosure completion | Yes, mesh and renders | Which of two front windows maps to each indicator is not uniquely proven by assembly photos |
| `Software_3_0_1/code.py` | CircuitPython source, 1,409 lines | Delivered STELLA-Q2 v3.0.1 application | Definitive executable-state study | Yes, line-by-line | Contains parse-blocking leading-zero literals and several documented defects |
| `Software_3_0_1/Q2v3.0.1.txt` | Text | Human-readable firmware duplicate | Cross-check only | Yes; byte-identical to `code.py` | Same defects as `code.py` |
| `Software_3_0_1/UF2-file/adafruit-circuitpython-sparkfun_thing_plus_rp2040-en_US-9.2.8.uf2` | UF2 | Board runtime | Exact installation filename and runtime version | Metadata inspected | Hardware flashing was not performed |
| `Software_3_0_1/lib/` | 35 `.mpy`, 3 empty `.py` | Runtime dependencies | Exact installation payload and dependency inventory | Complete file/metadata inventory | Compiled modules are not source-readable; full license texts are absent |
| `q2_test_codes/` | 10 Python programs | Component-level hardware probes | Fault/state references and later diagnostic lessons | Yes, all source read | Several tests are stale or defective; not a reliable single “all tests pass” suite |

## Chronological Build Instruction Photo map

The directory sort order is not the intended teaching order for Step 4. The pedagogically useful order is **top before → top after → bottom before → bottom after**, followed by Build 1–4 and lamp windows.

| Order | Official build step | Photo | Dimensions | What it establishes |
|---:|---:|---|---:|---|
| 1 | 4 | `Build Instructions Photos/4 STELLA-Q2 remove scaffolding top.jpg` | 928×1234 | Arrows identify temporary material inside the top housing; permanent walls/latch geometry must remain |
| 2 | 4 | `Build Instructions Photos/4 STELLA-Q2 scaffolding removed top.jpg` | 1138×1412 | Correct cleared top-housing openings |
| 3 | 4 | `Build Instructions Photos/4 STELLA-Q2 remove scaffolding bottom.jpg` | 1144×1530 | Two sacrificial support bridges in bottom-cover openings; large collar is permanent |
| 4 | 4 | `Build Instructions Photos/4 STELLA-Q2 scaffolding removed bottom.jpg` | 1138×1452 | Correct cleared bottom-cover openings |
| 5 | 5 | `Build Instructions Photos/5 STELLA-Q2 build 1.jpg` | 1644×1318 | Loose electronics, four Qwiic cables, power parts, coin cell, SD card, and 400 mAh pouch battery laid on the 1:1 diagram |
| 6 | 6 | `Build Instructions Photos/6 STELLA-Q2 build 2.jpg` | 1694×1322 | Completed flat Qwiic chain, CR1220 positive side up, and separate battery/switch power chain |
| 7 | 7–8 | `Build Instructions Photos/7 STELLA-Q2 build 3.jpg` | 1442×1516 | Connected components seated in housing; five named retainers; wires not yet finally routed |
| 8 | 9 | `Build Instructions Photos/9 STELLA-Q2 build 4.jpg` | 1244×1514 | Retainers installed and wires routed through side channels/guide posts below the cover seam |
| 9 | 11 | `Build Instructions Photos/11 STELLA-Q2 lamp covers loose.jpg` | 1108×1250 | Two clear three-tab signal-lamp windows and their keyed front apertures |
| 10 | 11 | `Build Instructions Photos/11 STELLA-Q2 lamp covers installed.jpg` | 1110×1280 | Both signal windows seated in the finished front panel |

No dedicated photographs exist for acquiring files, printing the diagram, printing the plastic parts, installing the bottom cover, or connecting to a computer. Those steps must use documents/STLs or explanatory UI rather than fabricated “official” images.

## Exact official electronic/accessory inventory

The following 13 lines reproduce the PDF/XLSX BOM. The manufacturer field intentionally retains “widely available” for the coin cell because that is how the source presents it.

| Qty | Official BOM item | Manufacturer | Part no. | Purpose in Q2 | Simulator asset / connector location | Final assembly relation | Supporting source |
|---:|---|---|---|---|---|---|---|
| 1 | Thing Plus RP2040 | SparkFun | DEV-17745 | Main microcontroller; runtime, storage interface, charging, status output | Board record; Qwiic start, battery lead, USB-C, microSD/boot/reset access | Transverse central/lower slot, under `MC` retainer; external access remains clear | BOM; flat diagram; Build 1–4; firmware |
| 1 | TRIAD spectral sensor | SparkFun | SEN-15050 | AS7265x 18-channel visible/NIR measurement | Board record; Qwiic between RTC and OLED | Optical/front end of housing, held by housing geometry | BOM; diagram; Build 1–4; firmware |
| 1 | PCF8523 real time clock | Adafruit | 5189 | Maintains UTC timestamp | Board record; Qwiic between button and TRIAD; CR1220 holder | Near sensor zone, under `CK` retainer, coin-cell face outward | BOM; diagram; Build 1–4; firmware |
| 1 | CR1220 battery for clock module | widely available | CR1220 | RTC backup power | Coin-cell record; no cable; **positive side up** | Inserts into RTC holder before enclosure placement | BOM; diagram; Build 1–2 |
| 1 | 128x32 OLED display | Adafruit | 4440 | Startup/status and spectral graph display | Board record; final Qwiic endpoint (left connector in diagram orientation) | Display faces exterior window, under `DISP` retainer | BOM; diagram; Build 1–4; firmware |
| 1 | i2c button | SparkFun | BOB-16842 | MODE input and detection light | Board record; Qwiic between Thing Plus and RTC | MODE cap aligns with front opening, under `BN` retainer | BOM; diagram; Build 1–4; firmware |
| 4 | qwiic cables, 100mm | Adafruit | 4210 | Shared plug-in I2C chain | Flexible cable assets; join five boards in exact linear order | Routed through side channels/posts; bends are approximate | BOM; diagram; Build 1–4 |
| 1 | battery disconnect switch | Adafruit | 3064 | Inline battery/power disconnect | Power-harness asset between battery and Thing Plus | Horizontal cradle immediately above battery | BOM; diagram; Build 1–4; operation guide |
| 1 | cylindrical battery, 2200mAh | Adafruit | 1781 | Rechargeable power for non-drone configuration | Battery record; power lead via switch | **Not required for 3D-printed drone housing**; no documented slot in photographed Q2 | BOM only |
| 1 | USB C cable | SparkFun | CAB-16905 | Computer/power/program connection | External cable to Thing Plus USB-C | External; Step 12 | BOM; build guide; software guide |
| 1 | micro SD card | Adafruit | 5249 | Measurement-data storage | Removable-card record; inserted at Thing Plus-associated access | Inserted and accessible beside processor | BOM; Build 1, 3, 4; firmware |
| 1 | micro SD card reader | Adafruit | 5212 | Presumed external data transfer accessory | External accessory only; internal location unproven | Do not place inside housing without new evidence | BOM; no unambiguous photo placement |
| 1 | Lithium Ion Polymer Battery Ideal For Feathers - 3.7V 400mAh | Adafruit | 3898 | Rechargeable power for photographed 3D-printed drone housing | Pouch-battery record; connector via inline switch | End battery cradle under `BAT` retainer | BOM; diagram; Build 1–4 |

Official unit prices sum to **$153.00**: $20.00 + $70.00 + $5.00 + $1.00 + $12.50 + $5.00 + $4.00 + $3.00 + $10.00 + $5.00 + $3.50 + $7.00 + $7.00. This total includes both the 2200 mAh cylindrical battery and the 400 mAh pouch battery even though the notes present them as configuration-specific choices; it must not be represented as the minimum cost of one photographed build.

## Printed-part and housing inventory

STL dimensions appear to be millimetres. All eight meshes are closed/manifold at 0.001 mm edge quantization; the button retainer has one degenerate triangle but no open or nonmanifold edges.

| Qty | Printed part / exact STL | Bounds X×Y×Z (mm) | Triangles | Purpose and assembly slot | Source caveat |
|---:|---|---:|---:|---|---|
| 1 | `Q2 top housing.STL` | 65.790×181.945×14.700 | 55,120 | Main front shell with component slots, cable channels, posts, latches, and front openings | Remove only photo-marked scaffolds |
| 1 | `Q2 bottom cover.STL` | 65.790×181.945×11.500 | 3,296 | Rear closure with collar/openings/latches | No source-specified closure force or print settings |
| 1 | `Q2 battery retainer.STL` | 19.300×24.000×4.800 | 668 | `BAT` clip over pouch battery | For photographed 400 mAh configuration |
| 1 | `Q2 button retainer.STL` | 27.800×20.000×7.050 | 2,118 | `BN` clip over I2C button | One degenerate triangle in source mesh |
| 1 | `Q2 clock retainer.STL` | 19.530×14.000×5.550 | 588 | `CK` clip over RTC | Exact force/tolerance undocumented |
| 1 | `Q2 display retainer.STL` | 23.290×20.000×9.300 | 1,084 | `DISP` clip holding OLED against window | Exact force/tolerance undocumented |
| 1 | `Q2 processor retainer.STL` | 24.900×14.000×5.200 | 580 | `MC` clip over Thing Plus while preserving access | Exact force/tolerance undocumented |
| 2 prints | `signal lamp window CC.STL` | 12.000×12.000×4.500 | 2,196 | Three-tab clear window in each front lamp aperture | Same STL printed twice; exact indicator-to-window mapping unresolved |

There is no separate AS7265x retainer or switch retainer STL. Photographs show those elements held by housing geometry. No screw, fastener, or adhesive appears in the archive and none should be invented.

## Wiring and connection map

### Physical assembly topology (flat diagram and Build 2)

```text
Qwiic / I2C data and power chain (four 100 mm cables)

Thing Plus RP2040
  -> I2C pushbutton
  -> PCF8523 RTC (+ CR1220, positive side up)
  -> AS7265x TRIAD spectrometer
  -> 128x32 OLED display

Separate battery path

Rechargeable battery
  -> inline battery disconnect switch
  -> Thing Plus RP2040 battery connector

External/program/data accessories

computer or USB power -> USB-C cable -> Thing Plus RP2040
microSD card -> processor-associated SD access
microSD reader -> external role presumed, not installed internally by evidence
```

The flat diagram defines module order and orientation but is not a pin-level electrical schematic. It does not document voltage rails, individual I2C nets, cable-conductor colors, or electrical test points.

### Firmware-discovered buses and addresses

| Device | Address / bus | Evidence |
|---|---|---|
| MAX17048 battery monitor | I2C `0x36` | Main firmware and bus-scan test |
| SSD1306 OLED | I2C `0x3c` | Main firmware and display test |
| AS7265x TRIAD | I2C `0x49` | Main firmware and bus-scan test; spectrometer test incorrectly reports `0x00` in its wrapper |
| PCF8523 RTC | I2C `0x68` | Main firmware and clock test |
| Qwiic button | I2C `0x6f` | Main firmware and bus-scan test |
| microSD | SPI, mounted at `/sd` | Main firmware; SD test uses a different built-in driver path |

Cable-routing validation should be semantic: endpoints, board orientation, correct side channels, and clearance below the cover seam. Official Step 9 says to route wires **approximately** like Build 4, so pixel-perfect cable curvature would exceed the source.

## Official 12-step physical build map

| Step | Official action | Direct evidence | Simulator representation | Verification / source-limited caution |
|---:|---|---|---|---|
| 1 | Obtain the latest STELLA-Q2 files ZIP | Build PDF | Source-package readiness | Included package is dated Jan 2026 but build documents are June 2025; version-lock this tutorial |
| 2 | Print the flat assembly diagram full size on ordinary office paper | Build PDF; diagram marked `SCALE 1:1` | Legible 1:1 diagram reference | Browser scaling cannot claim physical 1:1 without print calibration |
| 3 | Print the plastic parts | Build PDF; 8 STLs | Printed-part inventory and STL inspection | Material, layer height, supports, orientation, and printer settings are absent |
| 4 | Remove identified scaffolding | Four before/after photos; v3 notes | Before/after comparison with only marked supports active | Do not remove wall, latch, collar, or keyed aperture geometry |
| 5 | Lay electronics on the diagram | Build 1 photo; flat diagram | Parts identification and face/orientation comparison | No cables connected yet; coin cell is loose in photo |
| 6 | Connect electronics according to diagram | Build 2 photo; flat diagram | Validate four-cable Qwiic chain, coin cell, and separate power chain | Do not invent pin-level wiring or soldering |
| 7 | Place connected parts into housing slots | Build 3 photo | Photo-led slot/orientation shell | Keep sensor, OLED, MODE, SD/USB/boot/reset access aligned |
| 8 | Install retainer clips | Build PDF; Build 3/4 photos; five retainer STLs | Match `CK`, `DISP`, `MC`, `BN`, `BAT` to modules | Do not invent an extra sensor or switch retainer |
| 9 | Route wires approximately like Build 4 | Build 4 photo | Clearance-oriented routing reference | Exact cable bends are explicitly non-authoritative |
| 10 | Install the bottom cover | Build PDF; bottom-cover STL | Cover orientation/check | No dedicated photo, force, or latch procedure is supplied |
| 11 | Install two signal-lamp windows | Loose/installed photos; one STL printed twice | Two-window completion comparison | Call them signal-lamp windows, not sensor optical windows |
| 12 | Connect Q2 to computer and approve Thing Plus connection if prompted | Build PDF; software PDF | Handoff to later Program mode | Exact operating-system prompt is not captured |

## Behavioral map

The documentation and firmware describe the same broad system but disagree on some thresholds. Phase 0 records both. A later simulator decision must disclose which interpretation it uses.

| Topic | Documented behavior | Delivered v3.0.1 code behavior | Simulator/state implication |
|---|---|---|---|
| Power | Inline switch controls operation; initially verify startup disconnected from USB | Initializes hardware and runtime on boot | Separate `powerOff`, `booting`, and running states; switch must not be decorative |
| Charging | Charger works only with battery path connected/switch ON; then attach USB-C | MAX17048 reports voltage/percentage; charger hardware is not software-controlled | Model battery, switch, USB, charging, full, and wiring-fault states separately |
| Charge lamp | Bright orange = charging; off = full; dim/flicker = likely poor battery circuit | Hardware indicator, not main NeoPixel logic | Always pair color with text/icon; do not conflate with REC/status NeoPixel |
| Startup | REC orange with SD, red without; status pages then graph | Initializes SD, I2C devices, battery, clock, sensor; tests all three sensor lamps for one second; shows welcome/date/battery/settings/storage/UID/batch unless quick start | Ordered boot state with module-specific degraded states |
| Continuous recording | Default recording mode; green flash per data point | `burst_mode = False`; repeatedly records default 3-measurement groups at nominal 1 s interval | Initial `continuousRecording`; cadence is approximate due to work/sleeps |
| Burst recording | One click changes mode; later clicks record bursts; blue flash per point | First short click both switches permanently to burst-only session and records immediately; later clicks request more bursts; reboot needed to return continuous | `burstReady`/`burstRecording`; make irreversible-without-reboot behavior explicit if code fidelity chosen |
| MODE detection | Can take about 0.5 s; button light confirms press | Button LED brightness rises while detected | Give perceptible, accessible pressed/status feedback |
| MODE short click | Switch/trigger burst behavior | `<1 s` | Use a deterministic press-duration classifier |
| MODE medium hold | `2–3 s` toggles visible, NIR, and UV lamps | `1–<4 s` toggles all three together | Source conflict; do not implement three independent toggles |
| MODE long hold | More than about 10 s enters clock setting | `>6 s` enters clock setup; observation timeout is 7 s; `4–6 s` is a dead zone | Source conflict requiring an explicit product decision |
| REC indicator | Startup orange/red; continuous green; burst blue | NeoPixel colors implement corresponding states; off after successful sequence | Use label/icon in addition to color |
| Spectrometer lamps | One MODE hold toggles visible, NIR, UV illumination | White/NIR/UV lamps all toggle together; one-second all-lamp startup test | One compound lamp state; repeat Sun safety warning |
| OLED | Startup info, UID/batch, recording/storage/battery, 410–940 nm graph, B/G/R/IR labels | 128×32 status screens and a live 18-point normalized spectrum; `log y` appears only for log mode | Reproduce source display semantics without claiming absolute graph height |
| Plot scale | Linear or logarithmic setting in `code.py` | `logplot = True` default; each spectrum min/max normalized after optional log10 | Preserve raw values and label transform; graph shows shape, not cross-time absolute magnitude |
| Clock setting | Chrome, `code.circuitpython.org`, restart, ~10 s MODE hold, enter UTC year/month/date/hour/min/sec/weekday | Serial prompts are integrated into main code; clock syncs RP2040 from PCF8523 | Later Program/Operate flow with UTC explicit and validation states |
| SD present | Logs data; startup REC orange | Mounts at `/sd`, creates daily files/sidecars, writes 18 rows per acquisition | `sdReady`; track logging separately from sensing/display |
| SD missing/write failure | Startup REC red | Null/failure path allows sensing/display but not persisted logging | `sdCardError` degraded state, not whole-app crash |
| Missing modules | v3.0 says missing-module functions allow continued operation | Broad initialization exceptions substitute null objects | Model individual module warnings and surface which device is absent |
| Battery data | Display/CSV expose voltage and percentage; remaining recording estimate shown | MAX17048 read; storage estimate uses representative file-size assumptions | Values/status should be labeled estimates where applicable |
| Data output | Spectral records on SD | 15-column CSV, one row per wavelength, 18 rows/acquisition; uncertainty fixed at 12% | Preserve exact schema and distinguish measured/calculated/simulated data |
| Quick start | v3.0 feature | `quick_start = False` default; skips most startup screens when enabled | Advanced firmware option, not default Phase 1 behavior |

### Version 3.0 features confirmed by the release note

- clock setup incorporated into the main program;
- clearer CSV/header labels;
- fallback operation when modules are missing;
- full-screen spectral graph;
- blue record light in batch/burst mode;
- large batch and UID screen at batch start;
- estimated remaining storage display;
- optional quick-start mode;
- front access to boot/reset;
- easier-to-identify scaffolding;
- clearer front-cover information;
- reduced latch travel.

## Software installation map

This is the source-backed sequence for a later Program mode. Exact filenames come from the delivered archive.

| Step | Action and expected state | Validation / error state |
|---:|---|---|
| 1 | Make short, blunt, **non-metal** access rods (document suggests broken toothpick sections) | Metal tool is unsafe/unsupported by source guidance |
| 2 | Put rods into front `b` (boot) and `r` (reset) access holes | Correct access points must be identified, not guessed |
| 3 | Hold boot, press/release reset, then release boot | Wrong order does not enter bootloader |
| 4 | Wait for USB volume `RP1-RP2` | Missing volume means bootloader sequence/USB connection failed |
| 5 | Extract the delivered STELLA-Q2 package | PDF calls it `q2-code-and-libraries`; actual folder is `Software_3_0_1` |
| 6 | Copy `Software_3_0_1/UF2-file/adafruit-circuitpython-sparkfun_thing_plus_rp2040-en_US-9.2.8.uf2` to `RP1-RP2` | Wrong UF2 must be rejected; do not invent a generic filename |
| 7 | Observe `RP1-RP2` eject and `CIRCUITPY` mount | Disconnecting early is a failure state |
| 8 | Confirm `boot_out.txt`; ensure an empty root directory exactly named `sd` | Missing/renamed/non-root `sd` blocks intended logging workflow |
| 9 | Copy `Software_3_0_1/code.py` and the complete `Software_3_0_1/lib/` tree to `CIRCUITPY` | Missing code or libraries is an error; choose **Replace**, not Merge |
| 10 | Let CircuitPython run `code.py` automatically and verify startup | Delivered source must be syntax/hardware-tested before being represented as guaranteed flash-ready |

### RTC / clock-setting continuation

1. Use desktop Chrome as specified by the June 2025 document and open `https://code.circuitpython.org/`.
2. Choose the Thing Plus RP2040 USB serial device and grant CIRCUITPY volume access.
3. Open Serial and restart the program.
4. Hold MODE until the `long_press` path appears.
5. Enter year, month, day, **UTC** hour, minute, second, and three-letter weekday.
6. Return to normal operation and verify the display/clock.

Chrome is a requirement of the supplied instructions, not a claim that no other current Web Serial-capable workflow exists.

## Spectral channel source map

The primary workbook is authoritative for structured values. The PDF shows rounded presentation values. Channels 15–18 intentionally have black source swatches because they are outside human vision; black must be preserved in data but given an accessible outlined/patterned UI treatment.

| Ch | nm | Source name | Hex | RGB | THz | J/photon | eV/photon | Source category |
|---:|---:|---|---|---|---:|---:|---:|---|
| 1 | 410 | Blueviolet | `#7e00db` | 126, 0, 219 | 731.201117073171 | 4.84498989548519e-19 | 3.02400483983415 | Visible |
| 2 | 435 | Blue | `#2300ff` | 35, 0, 255 | 689.178064367816 | 4.56654220034236e-19 | 2.85021145823449 | Visible |
| 3 | 460 | Royalblue | `#007bff` | 0, 123, 255 | 651.722734782609 | 4.31836055901941e-19 | 2.69530866159131 | Visible |
| 4 | 485 | Darkturquoise | `#00eaff` | 0, 234, 255 | 618.128779381443 | 4.09576465391531e-19 | 2.55637522542681 | Visible |
| 5 | 510 | Lime | `#00ff00` | 0, 255, 0 | 587.828349019608 | 3.89499187676261e-19 | 2.43106271437648 | Visible |
| 6 | 535 | Chartreuse | `#70ff00` | 112, 255, 0 | 560.359734579439 | 3.71298291055874e-19 | 2.31746165295701 | Visible |
| 7 | 560 | Greenyellow | `#c3ff00` | 195, 255, 0 | 535.343675 | 3.5472247449088e-19 | 2.214003543450 | Visible |
| 8 | 585 | Yellow | `#ffef00` | 255, 239, 0 | 512.465740170940 | 3.39563394384432e-19 | 2.11938800740513 | Visible |
| 9 | 610 | Orange | `#ff9b00` | 255, 155, 0 | 491.463045901639 | 3.25646861827693e-19 | 2.03252784316722 | Visible |
| 10 | 645 | Red | `#fe0000` | 254, 0, 0 | 464.794508527132 | 3.07976101883555e-19 | 1.92223563462326 | Visible |
| 11 | 680 | Red | `#df0000` | 223, 0, 0 | 440.871261764706 | 2.92124390757195e-19 | 1.82329703578235 | Visible |
| 12 | 705 | Red | `#c90000` | 201, 0, 0 | 425.237529078014 | 2.81765369808359e-19 | 1.75864111252767 | Visible / red edge |
| 13 | 730 | Firebrick | `#b10000` | 177, 0, 0 | 410.6746 | 2.72115870842319e-19 | 1.69841367716713 | Visible / red edge |
| 14 | 760 | Darkred | `#940000` | 148, 0, 0 | 394.463760526316 | 2.61374454888017e-19 | 1.63137103201579 | Visible / red edge |
| 15 | 810 | Near Infrared | `#000000` | 0, 0, 0 | 370.114145679012 | 2.45240229277645e-19 | 1.53066911645926 | Near infrared |
| 16 | 860 | Near Infrared | `#000000` | 0, 0, 0 | 348.595881395349 | 2.30982076412666e-19 | 1.44167672596744 | Near infrared |
| 17 | 900 | Near Infrared | `#000000` | 0, 0, 0 | 333.102731111111 | 2.20716206349881e-19 | 1.37760220481334 | Near infrared |
| 18 | 940 | Near Infrared | `#000000` | 0, 0, 0 | 318.928146808511 | 2.11324027356269e-19 | 1.31898083439575 | Near infrared |

Primary constants: `c = 299792458 m/s`, `h = 6.62607015e-34 J·s`, and `1 eV = 1.602176634e-19 J`. Frequency and energy are calculated as `f = c / wavelength`, `E(J) = h f`, and `E(eV) = E(J)/(J/eV)`.

## Exact example-data schema

Source: `Build instructions and documentation/STELLA-Q2_data_20250612-0.csv`.

The file contains one header plus 270 complete data rows. There are 15 acquisitions, each represented by 18 rows in the exact wavelength order `410, 435, 460, 485, 510, 535, 560, 585, 610, 645, 680, 705, 730, 760, 810, 860, 900, 940` nm.

The raw CSV writes a single space after each comma, including in the header. The field names below are the whitespace-trimmed keys used by the simulator; integrity tests also preserve and verify the source's comma-space formatting.

| # | Exact column name | Type | Meaning / unit |
|---:|---|---|---|
| 1 | `iso8601_utc` | string | Compact UTC timestamp `YYYYMMDDTHHMMSSZ` |
| 2 | `UID` | integer | RP2040 CPU UID reduced modulo 10,000; not globally unique |
| 3 | `batch` | integer | Daily burst grouping counter; continuous acquisitions can share batch 0 |
| 4 | `measurement_number` | integer | Zero-based acquisition index within configured group/burst |
| 5 | `decimal_hour` | float | UTC hour + minute/60 + second/3600 |
| 6 | `gain` | number | AS7265x gain ratio; sample value 16x |
| 7 | `integration_time_ms` | integer | Programmed integration duration; sample value 168 ms |
| 8 | `wavelength_nm` | integer | Nominal channel center wavelength |
| 9 | `irradiance_uw.per.cm.sq_factory_cal` | float | Factory-calibrated irradiance in µW/cm² |
| 10 | `irradiance.uncertainty_uw.per.cm.sq_factory_cal` | float | Firmware-calculated 12% uncertainty, same unit |
| 11 | `raw_counts` | integer | Detector raw counts |
| 12 | `detector_chip_number` | integer | AS7265x triad chip number 1, 2, or 3 |
| 13 | `detector_chip_temperature_C` | numeric | Detector chip temperature in °C |
| 14 | `battery_voltage` | float | Cell voltage in volts |
| 15 | `battery_percentage` | float | MAX17048 state of charge in percent |

Observed sample invariants and grouping:

- timestamps: `20250612T132529Z` through `20250612T132557Z`;
- UID `7890`, gain `16`, integration `168 ms`, battery percentage `93.4%` throughout;
- batches 0, 1, and 2; each configured group uses measurement numbers 0, 1, and 2;
- `(batch, measurement_number)` is not unique because batch 0 contains multiple continuous groups;
- safe row identity: `(iso8601_utc, wavelength_nm)`; acquisition identity can include `(iso8601_utc, UID, batch, measurement_number)`;
- irradiance range `2.94012–43.9285 µW/cm²`; uncertainty `0.352815–5.27141 µW/cm²`; raw counts `3–77`; detector temperature `22–24 °C`; battery voltage `4.11625–4.12625 V`;
- chip 3 maps to 410–535 nm; chip 2 maps to 560, 585, 645, 705, 900, 940 nm; chip 1 maps to 610, 680, 730, 760, 810, 860 nm;
- uncertainty is not independently measured: firmware writes irradiance × 0.12;
- the filename suffix `-0` does not constrain row batches: the same open file contains batches 0, 1, and 2.

The sample is authoritative for format and this recorded sequence only. It is insufficient to define general spectra for vegetation, water, snow, or other targets; any such generated values must be labeled simulated.

## Firmware/runtime and test-code findings

### Delivered application defaults

- application: `STELLA-Q2`, version `3.0.1`;
- runtime: Adafruit CircuitPython `9.2.8`, build date 2025-05-28, board `sparkfun_thing_plus_rp2040`;
- `quick_start = False`;
- `sample_interval_s = 1.0`;
- `burst_count = 3` (minimum one);
- `logplot = True`;
- `screen_wait_s = 2`;
- gain selector 2 = 16x;
- integration cycles 59, computed by code and recorded data as 168 ms;
- source field: 20 nm FWHM and approximately 41° full angular field of view;
- source copies have identical SHA-256: `44a60b77bf0ddf915163144e5e7f08716d6244e47d7c5ebc498e7c95e03a49e8`.

### Library inventory conclusions

Main app dependencies include AS7265x, Adafruit display text/SSD1306, MAX17048, PCF8523, SD card, I2C button, and NeoPixel support. `adafruit_gps` is imported but otherwise unused; `adafruit_framebuf` and most display-shape modules appear unused by the main app. Both a legacy root `adafruit_pcf8523.mpy` (1.5.15) and a newer package form (2.0.1) are bundled; the main import uses the package form.

No LICENSE/COPYING files are delivered. Adafruit module metadata includes upstream repository/version strings where available, but the AS7265x bundle has no embedded repository/version/license marker and the NASA source comments provide only the phrase “NASA open source software license.” Redistribution requires a separate license/source review.

### Ten test programs

| Test | Useful evidence | Limitation/defect |
|---|---|---|
| 128×32 display | OLED address/size and basic display output | Uses legacy `displayio.I2CDisplay`, likely stale for supplied CircuitPython 9.2.8 |
| AS7265x sensor | 16x gain, 59 cycles, all three lamps, calibrated channels | Reports wrapper address `0x00`; builds a 36-element list by appending zero and value per channel; older API names |
| SD card | Mount/read/write at `/sd` | Uses built-in `sdcardio`, unlike main app's bundled `adafruit_sdcard` path |
| I2C bus scan | Expected addresses `0x36/0x3c/0x49/0x68/0x6f` | Mentions rotary-encoder conflict even though no encoder is in Q2 BOM |
| I2C button | Firmware/debounce/status/LED behavior | Hold transition toggles on alternating polls; unused variables; probe, not canonical UX |
| MAX17048 | Voltage and percentage readout | Single-purpose probe only |
| Onboard blue LED | Basic one-second LED blink | No Q2 state semantics |
| Onboard NeoPixel | GRB-order red/green/blue cycle | Test-only colors; main app state logic differs |
| PCF8523 clock set | Full serial RTC input sequence | Repeats invalid boundary-range defects from main app |
| Unique identifier | `cpu.uid % 10000` behavior | Four-digit value can collide |

## Conflicts, defects, and unresolved uncertainties

These items must remain visible in engineering decisions and source references. “Recommended handling” is an audit recommendation, not a silent correction of the source.

| Area | Conflict or uncertainty | Evidence | Recommended handling |
|---|---|---|---|
| Color workbook | `color lookup table2.xlsx` has 54 `#REF!` calculated cells | OOXML formulas/values | Use primary workbook/PDF; retain alternate only as recorded damaged export |
| PDF vs workbook precision | PDF rounds frequency/energy while primary workbook stores higher precision | Both color sources | Use workbook structured values and explain PDF rounding |
| Spectral display color | NIR channels are black swatches | Color PDF/workbook | Preserve black as source value; use accessible outline/pattern/secondary false-color presentation |
| Procurement total | $153 includes both 2200 mAh and 400 mAh battery alternatives | Parts PDF/XLSX notes and sum | Show official total with configuration explanation; never install both by implication |
| Battery geometry | Photographed housing uses 400 mAh pouch; standard/cylindrical slot is not documented here | BOM + Build photos | Use photographed configuration for build; keep other battery external/unplaced until evidenced |
| SD reader | BOM lists a microSD reader but no internal role/location is visually proven | BOM vs photos | Treat as external accessory; do not invent an enclosure slot |
| Signal windows | Two windows are clear, but exact left/right REC vs charge function is not uniquely established by assembly photos | Lamp photos/operation guide | Avoid hard-coded mapping until face labeling/electronics placement is independently verified |
| Retainer count | Archive has five retainer STLs/names; some photo interpretations can appear to show an additional loose piece | STLs and Build 3 photo | Model only `CK`, `DISP`, `MC`, `BN`, `BAT`; do not invent geometry |
| Cable routing | Build Step 9 says approximately; exact curves are incidental | Build PDF and Build 4 | Validate endpoints and clearance, not pixel curves |
| Mechanical detail | Print settings, materials, tolerances, scaffold tools, latch force, adhesives, fasteners absent | Build sources | Do not simulate exact forces or fabricate procedures; label general safety advice separately |
| Photo coverage | No official photos for Steps 1–3, 10, 12 | Photo inventory | Use diagram/STLs/text; do not create fake “official” photographs |
| Package chronology | Jan 2026 package contains June 2025 build docs and requests “latest ZIP” | Directory/package names and PDF | Version-lock audit/tutorial to included source set |
| Package folder name | PDF says `q2-code-and-libraries`; actual folder is `Software_3_0_1` | Software PDF vs tree | Use exact delivered paths and note document terminology |
| MODE medium hold | Docs: 2–3 s; code: 1–<4 s | Operation/software PDFs vs `code.py` | Choose deliberately in Phase 2; disclose both |
| MODE long hold | Docs: >10 s; code: >6 s with 7 s timeout; code dead zone 4–6 s | PDFs vs `code.py` | Choose deliberately; do not claim both are identical |
| Integration time | Comments/PDF: about 166 ms; code formula/CSV: 168 ms | Firmware and CSV | Treat 168 ms as delivered executable/data value; retain 166 ms as stale prose conflict |
| Clock validation | Code rejects month 12, hour 23, minute/second 59 | `range()` bounds in main and clock test | Simulate valid civil time, but mark as a correction if not reproducing defect |
| Clock invalid-weekday path | Uses undefined `null_time` instead of `self.null_time` | Main firmware | Record a source defect; do not reproduce an avoidable crash without an explicit lesson mode |
| Firmware syntax | Both source copies contain Python/CircuitPython-invalid leading-zero decimal literals (e.g. `01`, `00`) | Main source lines 648, 1038, 1222 | Do not offer source as verified flash-ready until corrected package is syntax- and hardware-tested |
| Filename/batch | Open filename suffix can remain `-0` while data rows advance to batches 1 and 2 | Firmware and supplied CSV | Preserve schema behavior or label any corrected exporter as simulator behavior |
| Storage percentage | One free-percentage formula divides block count by block size and is dimensionally wrong; later byte estimate is better | Firmware | Do not expose the defective unused percent as authoritative |
| Missing-module diagnostics | Broad exception handling hides exact causes | Firmware | Simulator should show which module is missing while preserving degraded operation |
| Cadence | Nominal 1 s loop also graphs/reads/sleeps, so wall-clock cadence is not exact | Firmware control flow | Label interval as configured/nominal |
| UID | UID reduced modulo 10,000 | Firmware/test | Call it a four-digit device display ID, not globally unique identity |
| Graph semantics | Every live spectrum is independently min/max normalized, optionally after log10 | Firmware | Explain graph as relative within-spectrum shape, not absolute comparative axis |
| Sensor test | Standalone test produces 36 entries and reports conflicting address | Test code | Do not use it as canonical data model without correction |
| Display test | Uses a legacy API relative to bundled runtime | Test code and UF2 version | Update/test on hardware before promising one-click diagnostics |
| Libraries | 35 `.mpy` files cannot be source-audited from this archive; licenses absent | Library tree | Obtain matching upstream source and exact license texts before redistribution |
| Hardware validation | Audit did not flash or operate a physical Q2 | Audit scope | Do not claim hardware-verified installation, timing, force, or electrical behavior |

## Source-supported safety guidance

The source explicitly supports these instructions:

- use short **non-metal** rods for the recessed boot/reset access points;
- insert the CR1220 with positive side up;
- connect/enable the battery path through the power switch for charging;
- never point the spectrometer directly at the Sun because the signal is too bright and is likely to damage the detector.

Lithium-battery handling, ESD, 3D-printer, and cutting-tool safety are sensible platform concerns but are not specified by these files. If added, they must be labeled as ExSTELLA/platform safety guidance rather than attributed to the NASA build guide.

## Phase 0 source-fidelity decisions

1. Use the one-page build guide as the canonical **order**, the flat diagram as the canonical **connection topology**, Build 1–4 photographs as the canonical **orientation/placement/routing evidence**, and the STL meshes as the canonical **printed geometry**.
2. Use `SQ2_parts_list.pdf` and `.xlsx` together for the exact 13 BOM lines; retain the official $153 total but explain the battery alternatives.
3. Use the primary five-sheet color workbook plus PDF for all 18 channel definitions. Never import calculated fields from `table2.xlsx`.
4. Use the CSV exactly for schema and sample playback, not as a general material-spectrum model.
5. Treat delivered firmware v3.0.1 as evidence of intended executable behavior, while openly recording its timing conflicts, syntax defects, and validation bugs.
6. Keep Phase 1 non-interactive where exact connector hitboxes, board geometry, placement tolerances, or force behavior are not established. Do not replace missing source detail with invented circuit boards or physics.
7. Attribute the source materials to NASA Goddard Space Flight Center without implying NASA endorsement of ExSTELLA.

## Phase 0 completion status

- [x] Complete recursive file inventory
- [x] All relevant PDF pages read and visually inspected
- [x] All ten photographs inspected and chronologically mapped
- [x] All workbooks parsed and cross-validated
- [x] Example CSV parsed and exact schema recorded
- [x] All eight STL meshes inspected
- [x] Main firmware and duplicate read and compared
- [x] UF2 metadata inspected
- [x] All ten test programs read
- [x] Library inventory and binary-source/license limits documented
- [x] Exact component inventory recorded
- [x] Wiring, build, behavior, software-install, and data maps recorded
- [x] Conflicts and uncertainties retained rather than silently resolved
