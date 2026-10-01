# Deep Research — Flamingo Cat Ba 3D Resort (v2, TypeScript)

Date: 2026-10-01 · Method: web research (7 queries across renderer tech, TS tooling, testing strategy, rendering artifacts, PBR generation, configurator UX, performance) + prior session learnings.

## 1. Renderer strategy

**Findings**
- Three.js `WebGPURenderer` (r171+) is the recommended forward path and includes an **automatic WebGL 2 fallback**; migration is essentially a one-line swap from `WebGLRenderer`, and `forceWebGL: true` exists specifically to exercise the fallback path.
- Community guidance (discourse, migration guides 2025–2026): ship WebGPU with the built-in WebGL2 backend as the safety net; **test the fallback explicitly** because most CI/headless environments still render through ANGLE/SwiftShader.
- As of r176+ `WebGLRenderer` can still outperform `WebGPURenderer` in some scenes — so the fallback is not a degraded mode, it is a peer path.

**Decisions**
- Use `three@0.186.1`, import from the `three/webgpu` entry (single instance of the library app-wide).
- Engine flow: probe `navigator.gpu` → `WebGPURenderer` → on any failure construct with `forceWebGL: true` → report backend label in UI and to the test harness.
- Functional/visual tests assert the app reaches an interactive state on **either** backend (headless Chromium typically gives us WebGL2 via SwiftShader).

## 2. TypeScript + Vite architecture

**Findings**
- Vite + TypeScript is the community-standard scaffold for Three.js SPAs in 2025/26; no framework overhead, native ESM, first-class `three` types via `@types/three`.
- Best practice for large 3D codebases: strict `tsconfig`, **pure-logic modules kept free of DOM/three imports** so they stay unit-testable in Node, and a thin rendering layer on top.

**Decisions**
- Strict TypeScript (`strict`, `noUncheckedIndexedAccess` where practical), typed public surfaces for every module.
- Layering (dependency direction strictly downward):
  - `src/lib/noise.ts` — pure math (no imports)
  - `src/lib/registry.ts`, `src/spec/*`, `src/editor/collisions.ts`, `src/editor/history.ts` — pure logic (no three/DOM)
  - `src/lib/textures.ts` — DOM canvas
  - `src/lib/materials.ts` — three + textures
  - `src/lib/builders/*`, `src/scenes/*`, `src/editor/editor.ts` — three + materials
  - `src/core/*` — renderer lifecycle
  - `src/ui/*`, `src/main.ts` — app shell
- `window.__RESORT__` test hook exposing typed app state for functional tests (no screenshot-scraping for logic assertions).

## 3. Testing strategy (the pyramid)

**Findings**
- Consensus stack for graphics-heavy web apps: **Vitest for pure logic** + **Playwright for E2E/functional** + **Playwright screenshots for visual regression**. Headless Chromium renders WebGL through SwiftShader (software rasterizer) which is exactly how CI pipelines test WebGL apps.
- Canvas/WebGL apps can't be meaningfully unit-tested through jsdom (no real 2D/GL context); the right split is: pure logic in Node, rendering verified in a real browser.

**Decisions — three test tiers**
1. **Unit (Vitest, Node env)** — deterministic, fast, exhaustive:
   - noise math (range, determinism, continuity, distribution)
   - catalog/registry integrity (unique IDs, valid dimensions/prices, every model has ≥3 variants, ≥60 models, ≥180 variants, builder coverage)
   - **builder integrity**: mock the material layer → build *every* variant → finite non-degenerate bounding boxes, shadow flags, mesh counts
   - spec tracker (BOM aggregation, manual overrides, JSON export)
   - pricing (totals, formatting, suite bundle math)
   - collision math (AABB overlap, grid snap, bounds containment)
   - history (undo/redo caps, selection restore)
   - suite definitions (placements inside room bounds, zones reference real objects)
2. **Functional (Playwright)** — real browser, real renderer:
   - boot without console errors/pageerrors, splash → app transition
   - backend reported (WebGPU or WebGL2), first frame rendered
   - mode switching (Showroom / Library / Editor)
   - suite loading + zone camera tours
   - catalog browsing, category filtering, variant switching
   - editor: place / select / rotate / move / delete / undo via test API + real DOM events
   - spec tracker live updates + export JSON download
3. **Visual inspection (Playwright + pngjs pixel analysis)**:
   - capture each suite/zone view → PNG statistics: luminance mean within sane band, **std-dev above floor** (not a flat wash), color diversity ≥ threshold, black-pixel ratio bounded
   - **frame-stability (flicker regression)** — the v1 floor-flicker bug gets a dedicated test: capture N consecutive frames, assert per-pixel temporal variance stays below threshold
   - region check: floor area must show texture variance (wood grain reads as mid-frequency detail)
   - screenshots archived under `tests/__screenshots__/` for human review

## 4. Rendering artifacts — root causes of the v1 "flickering floor"

**Findings**
- Two classic culprits, both matching the reported symptom:
  1. **Z-fighting** from coplanar or nearly-coplanar geometry (rug plane on floor plane, decal on wall) — fixes: never stack coplanar planes, use real thickness + vertical offsets, `polygonOffset` for unavoidable overlays.
  2. **Shadow acne / stripe shimmer** — large receivers lit by low-resolution shadow maps: bias too small or normalBias zero, shadow camera frustum too large. Canonical fixes: `PCFSoftShadowMap`, `shadow.bias ≈ -0.0002…-0.0005`, `shadow.normalBias ≈ 0.02–0.05`, tight shadow-camera bounds, cap `shadow.mapSize` at 2048.
- Also implicated: uncapped device pixel ratio, huge far/near ratios destabilizing depth precision, and transmission materials causing sort popping.

**Decisions (baked into `core/engine.ts`, `core/environment.ts`, `lib/primitives.ts`)**
- Floors are 12 cm-thick slabs (not planes); rugs float 12 mm above with `polygonOffset(-1,-1)`; contact-shadow decals render `depthWrite:false` at fixed `renderOrder`.
- Shadow: PCFSoft, directional light with tight orthographic shadow frustum sized to the active room, `bias=-0.00035`, `normalBias=0.04`, 2048² map.
- Camera: near 0.1 / far 140 (1400:1 ratio, stable depth precision for room scale), pixel ratio capped at 2.
- Glass: opacity-based `MeshPhysicalMaterial` with `depthWrite:false` — no `transmission` (avoids transparent-sort popping entirely).
- Every mesh: `castShadow && receiveShadow` defaults in the primitive factory.

## 5. Procedural PBR materials

**Findings**
- PBR map generators (playtex, aitextured, cgaxis…) all derive **normal + roughness + AO** from an albedo/height source — Sobel-of-height → tangent-space normal is the standard technique.
- Procedural generation keeps the repo asset-free (no licensing, no binary bloat) and gives per-variant uniqueness via seeds.

**Decisions**
- `textures.ts` generates color/roughness/normal canvas sets per material family: 6 woods (ring-warped fbm), 4 marbles (ridged fbm veins), granite/terrazzo/travertine, 2 weaves + bouclé + 4 velvets, 3 leathers (Worley cells), brushed metal, plasters, 5 tiles (grout+bevel), rattan weave, rugs, generative art, sky gradient.
- All textures `RepeatWrapping`, `SRGBColorSpace` for color maps only, anisotropy 8, shared/cached per key; floors get per-room repeat cloning so grain scale stays physical (≈1.4 m per tile).

## 6. Configurator UX (editor + specs)

**Findings**
- Room-planner patterns: drag from catalog → **raycast onto floor plane** for placement, footprint AABBs for collision feedback, grid snapping, select-then-transform (rotate/translate/delete), undo stack.
- Product configurators derive a **live bill of materials** from scene state; quantity edits round-trip back into the scene.

**Decisions**
- Placement: pointer raycast to floor → ghost preview → confirm; footprint AABB overlap → red tint hint (non-blocking, luxury-feel soft constraint).
- Snap: 10 cm grid (toggle), 15° rotation increments.
- `spec/tracker.ts`: pure reducer over placement list → grouped BOM by category with counts; manual quantity override marks entries; JSON export mirrors the file the sales team would hand to procurement.

## 7. Performance

**Findings**
- Merge static geometry (`BufferGeometryUtils`) and instance repeats; share materials; keep per-frame allocations out of the render loop.

**Decisions**
- Shared cached materials/textures across all instances; models built from primitive meshes (no merge needed at these counts — <4 k draw calls worst case; editor suites sit ≈600–900 meshes); render loop performs zero allocations; updaters registered as a Set; pixel ratio cap 2.

## 8. Scope commitments (from the guest requirements)

- 5 showcase suites (Deluxe King → Beachfront Villa) with camera zone tours
- Model library: ≥60 models / ≥180 variants across 10 categories, browsable in Library mode
- Room editor with drag-and-drop, rotate, delete, undo/redo, snap
- Auto spec (BOM) with manual quantity editing and JSON export
- No network assets — everything procedural (fast loads, offline-capable, license-clean)
