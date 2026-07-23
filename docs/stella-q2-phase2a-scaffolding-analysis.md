# STELLA-Q2 Phase 2A: scaffolding-removal source analysis

Date: 2026-07-22  
Scope: **Phase 2A only** — the Step 4 `Remove Scaffolding` interaction. No component placement, wiring, programming, operation, or measurement simulation is included here.

## Sources used

| Source-relative path | Phase 2A use |
|---|---|
| `Q2 parts STL files/Q2 top housing.STL` | Source-faithful top-housing 3D inspection model |
| `Q2 parts STL files/Q2 bottom cover.STL` | Source-faithful bottom-cover 3D inspection model |
| `Build instructions and documentation/Build Instructions Photos/4 STELLA-Q2 remove scaffolding top.jpg` | Identifies two top-housing temporary-material regions |
| `Build instructions and documentation/Build Instructions Photos/4 STELLA-Q2 scaffolding removed top.jpg` | Confirms the cleared top-housing result |
| `Build instructions and documentation/Build Instructions Photos/4 STELLA-Q2 remove scaffolding bottom.jpg` | Identifies two sacrificial bridges in the bottom-cover opening |
| `Build instructions and documentation/Build Instructions Photos/4 STELLA-Q2 scaffolding removed bottom.jpg` | Confirms the cleared bottom-cover result and retained collar |
| `Build instructions and documentation/STELLA_Q2_Build_Instructions_June2025.pdf` | Confirms Step 4 belongs in the official physical-build sequence |

## Geometry audit and limitation

The supplied enclosure meshes are not delivered as a housing mesh plus independently removable support meshes:

| STL | Bounds (mm) | Triangles | Connected mesh components |
|---|---:|---:|---:|
| `Q2 top housing.STL` | 65.790 × 181.945 × 14.700 | 55,120 | 1 |
| `Q2 bottom cover.STL` | 65.790 × 181.945 × 11.500 | 3,296 | 1 |

Because each source STL is a single connected component and no slicer support file, support-only mesh, print setting, or triangle-selection map is supplied, Phase 2A does **not** pretend to delete arbitrary triangles or fabricate a separable support model. The interactive view always renders the original source STL unchanged.

Instead, the simulator has four explicitly photo-supported teaching hitboxes over the original model:

1. Top housing — inner access support (upper arrow in the official before photo).
2. Top housing — front access support (lower arrow in the official before photo).
3. Bottom cover — left sacrificial opening bridge.
4. Bottom cover — right sacrificial opening bridge.

The retained top wall/latch region and large bottom circular collar are represented as **permanent protected geometry**. Selecting one produces a clear explanation and can never advance progress.

## Interaction model

The shared, serializable lab state records selected enclosure part, selected target, removed target IDs, camera preset, hint visibility, validation state, and undo/redo snapshots. It is persisted locally using the Phase 2A session key and is strictly validated before it is restored.

The 3D workspace provides orbit, pan, zoom, fit and six orientation presets, wireframe and X-ray inspection, deterministic target selection, Undo, Redo, Reset part, hint and explicit Check step controls. Removed targets move into a discarded-material tray with a restrained confirmation animation. The same targets have keyboard-accessible Select and Remove controls.

The official photo comparison offers Before, After, Side-by-side, Overlay, and an explicit link to enlarge each original image. Overlay is labeled as visual comparison only because the supplied photographs have different framing.

## Verification and unresolved questions

Automated tests verify the exact two STL sources, four removable targets, two protected targets, Step 4 photo mappings, permanent-geometry rejection, undo/redo/reset behavior, explicit completion validation, persisted-state rejection of invalid removals, and recoverable load-error copy.

The source package does not establish the exact triangle membership, physical shape, print material, removal tool, removal force, or safe removal sequence for each individual support region. These remain intentionally out of scope rather than inferred.
