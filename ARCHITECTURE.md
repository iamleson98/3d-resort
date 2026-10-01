# Architecture — Flamingo Cat Ba 3D Resort

Grounded in **Feature-Sliced Design** (feature-sliced.design) adapted for a GPU-heavy 3D SPA, plus three.js community structure conventions (engine core / assets / content / features / UI separation) and the classic maintainability guideline of **files ≤ ~300 lines, one concern per file**.

## Principles

1. **Feature folders.** Every user-facing capability (`showroom`, `library`, `editor`, `specs`) lives in `src/features/<name>/` with its controller, data and view modules.
2. **Public API per module.** Each folder exposes exactly what other layers need through its `index.ts` — internals stay private.
3. **Dependencies point downward only.**
   `app` → `features` → `catalog` / `core` / `ui` → `assets` / `shared`.
   A feature may never import another feature's internals (only its `index.ts`), and nothing below `app` imports from `app`.
4. **Pure core, tested in Node.** Game/spec math (noise, collisions, history, tracker, pricing, catalog data) has **zero three/DOM imports** → unit-testable without a browser.
5. **Small files, one concern.** Builders are grouped per model family (2–5 models/file), textures per material family, catalog data per category. No file tries to be a dumping ground.
6. **Determinism everywhere.** All randomness flows through seeded PRNG/noise from `shared/math` — textures are stable across reloads and testable.

## Layout

```
src/
├── app/                      # composition root
│   ├── main.ts               # entry: boot, wiring, mode router
│   └── bootstrap.ts          # engine init + app assembly + window.__RESORT__ test harness
├── shared/                   # pure, no three.js / no DOM
│   ├── domain/               # types.ts (contracts used everywhere)
│   └── math/                 # noise.ts (PRNG, fbm, ridged, normals)
├── core/                     # rendering engine, feature-agnostic
│   ├── engine/Engine.ts      # WebGPU→WebGL2 renderer lifecycle
│   ├── camera/CameraRig.ts   # orbit/pan/zoom + eased flyTo tours
│   └── environment/          # lights, sky, shadow tuning (anti-flicker)
├── assets/                   # procedural PBR generation
│   ├── textures/             # wood, stone, fabric, … (12 family files)
│   └── materials/            # Material presets built from texture sets
├── catalog/                  # the model library (content layer)
│   ├── data/                 # 10 category files, pure data
│   ├── builders/             # 3D factories per category folder
│   └── index.ts              # registry lookups (getEntry, categories…)
├── features/
│   ├── showroom/             # suite showcase mode
│   │   ├── suites/           # 5 suite definitions (data)
│   │   ├── RoomShell.ts      # floor/walls/openings architecture
│   │   └── ShowroomController.ts
│   ├── library/              # model browser mode
│   │   ├── podium.ts         # display stage + turntable
│   │   └── LibraryController.ts
│   ├── editor/               # room configurator mode
│   │   ├── logic/            # collisions.ts, history.ts (pure)
│   │   ├── view/             # Ghost.ts, SelectionRing.ts, Grid.ts
│   │   └── EditorController.ts
│   └── specs/                # specification / BOM feature
│       ├── tracker.ts        # pure BOM reducer
│       ├── pricing.ts        # pure pricing math
│       └── export.ts         # JSON download plumbing
└── ui/                       # DOM component kit (no three.js)
    ├── kit.ts                # el() DOM builder helper
    ├── components/           # Button, Panel, Chip, Divider, Toast…
    ├── nav/                  # TopNav, ModeSwitch, SuiteSelect
    ├── catalog/              # CatalogBrowser, VariantPicker, CategoryTabs
    ├── editor/               # EditorToolbar, EditorHints
    ├── specs/                # SpecPanel, SpecRow
    └── styles/               # tokens.css, base.css, components.css
```

## Data flow

- **Catalog** (`catalog/`) is the single source of truth for models/variants/prices. The `editor` feature reads it to build placements; the `specs` feature folds placements into a BOM; the `ui` renders both.
- **Mode router** (`app/main.ts`) swaps active feature controllers; each controller receives `{ scene, cameraRig, engine }` and owns its scene subtree.
- **Test API** (`App.testApi()` in `app/bootstrap.ts`) is the only place that touches `window` — functional tests drive the app through it instead of scraping pixels for logic assertions.

## Dollhouse wall culling

`RoomShell` groups each wall run (segments + glazing + trim) per side. Every frame
`updateWallVisibility()` hides the sides that face the camera while it is outside the
room plan — the classic configurator cutaway. It is a pure function of camera position
(with a hysteresis dead-band), so parked cameras stay pixel-stable and the anti-flicker
guarantees hold. The shell root carries `data-mode`, and the editor HUD is only visible
in editor mode via CSS.

## Rendering-quality invariants (anti-flicker)

Baked into `core/` + `assets/` + builders:
- floors are thick slabs; rugs float 12 mm with `polygonOffset`; contact decals are `depthWrite:false` at fixed `renderOrder`
- PCFSoft shadows, `bias=-0.00035`, `normalBias=0.04`, tight frustum, 2048² map
- near/far = 0.1/140, pixelRatio ≤ 2
- glass = opacity path (no transmission) → no transparent-sort popping

## Testing mirror

`tests/unit` mirrors pure modules; `tests/functional` drives the test API in a real browser; `tests/visual` captures screenshots and asserts pixel statistics (incl. the frame-stability flicker regression).
