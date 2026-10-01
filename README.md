# Flamingo Cat Ba Luxury Resort — 3D Experience

An immersive, fully **procedural** 3D resort experience for Flamingo Cat Ba (Cát Bà Island, Vietnam):
showcase five luxury suites, browse a complete resort model library, and configure your own room —
with a live specification (bill of materials) you can export as procurement JSON.

Built with **TypeScript**, **three.js 0.186 (WebGPU renderer with automatic WebGL2 fallback)** and **Vite**.
Every model, texture and material is generated in code — **zero external 3D/texture assets**.

---

## Highlights

- **Showroom** — five signature suites (Deluxe King, Ocean Suite, Garden Villa, Cliffside Penthouse,
  Beachfront Villa), each with named camera zones (bed · lounge · dining · bath · terrace…) and eased
  cinematic fly-to tours.
- **Model Library** — 10 categories · ~60 models · 180+ variants (seating, tables, bedroom, storage,
  lighting, decor, plants, bathroom, architecture, outdoor). Every variant is a real procedural mesh,
  previewable on a turntable podium.
- **Room Editor** — place any catalog item into a room shell, drag/rotate with snapping and collision
  footprints, undo/redo, and a live **spec tracker** with manual quantity overrides and JSON export.
- **Procedural PBR material workbench** — wood, marble, granite, terrazzo, travertine, bouclé, velvet,
  leather, brushed metal, plaster, tile, rattan, rugs, canvas art and a procedural sky — all painted
  at runtime into color / roughness / normal maps with seeded, deterministic noise.
- **Photoreal lighting (tidewater-inspired)** — a physically based Preetham sky drives everything:
  the visible sky through the glazing, a PMREM-baked IBL environment for every PBR material, and a
  sun that really shines **through the window** — mullion shadows rake across the floor. Four
  time-of-day presets (**Dawn · Midday · Golden Hour · Dusk**) transition the whole rig — sun, sky,
  exposure, ground bounce — over 1.6 s; at dusk the interior lamps take over as real warm point lights.
- **Cinematic post chain** — GTAO ambient occlusion (half-res, temporal) → TRAA/SMAA anti-aliasing →
  HDR bloom → filmic grade (saturation · contrast · warmth · vignette · grain) → RCAS-style sharpen,
  with three quality tiers and a frame-time governor that steps down automatically on slow GPUs.
- **Room Editor, furnished** — the configurator opens on the staged suite baseline ("configure what
  you saw"), with Clear room / Restore suite controls.
- **Photo mode** — the camera button captures a high-resolution PNG of the current view.
- **Sunbeam dust motes** — a drifting mote field appears when the sun is low (dawn/golden/dusk).
- **Rendering quality** — PCF soft shadows with tuned bias, thick floor slabs and lifted rugs to
  eliminate z-fighting shimmer, capped pixel ratio, tone-mapped ACES output.

## Rendering note

The app boots `WebGPURenderer` and falls back to WebGL2 (`forceWebGL: true`) where WebGPU is
unavailable — headless/CI environments included. `window.__RESORT__.backend()` reports which one is live.
On WebGPU the post chain uses temporal TRAA + 16-tap GTAO ("cinematic" tier); on WebGL2 it uses
SMAA + 8-tap GTAO ("balanced"). A frame-time governor drops tiers automatically below ~30 fps.

Dev-server URL params (also used by the test suites): `?fx=off` disables the post chain,
`?grain=0` pins film grain to zero (pixel-stability tests), `?seed=0` boots the editor empty,
`?tier=cinematic|balanced|efficient` forces a quality tier, `?shadows=off` disables shadow mapping.

See `RESEARCH-PHOTOREAL.md` for the technique mapping from `dgreenheck/tidewater` and the
tuning war stories (why ambient must sit far below the key light — the ACES-shoulder lesson).

## Getting started

```bash
npm install
npm run dev          # http://localhost:5173
```

| Script                     | Purpose                                            |
| -------------------------- | -------------------------------------------------- |
| `npm run build`            | Type-check + production bundle (`dist/`)           |
| `npm run typecheck`        | `tsc --noEmit`                                     |
| `npm run test:unit`        | Vitest — pure logic (noise, catalog, spec, editor)  |
| `npm run test:functional`  | Playwright — real-browser behavior (needs dev server) |
| `npm run test:visual`      | Playwright — pixel-statistics & anti-flicker checks  |
| `npm test`                 | everything above in sequence                       |

Extra dev QA scripts live in `scripts/` (screenshot capture, luminance heatmaps, shadow A/B).

Browser tests need a dev server on `http://localhost:5173` (or set `RESORT_URL`).
Headless CI uses SwiftShader flags — see `playwright.config.ts`.

## Testing philosophy

Three independent layers, mirroring the architecture:

1. **Unit (Vitest, Node)** — everything pure: noise/PRNG determinism, catalog integrity
   (every variant resolvable, footprints positive, price sanity), suite zone wiring, spec tracker
   math, editor collision/snap/clamp logic.
2. **Functional (Playwright)** — boots the real app in Chromium, drives the public test API
   `window.__RESORT__` plus real DOM clicks: mode switching, suite loading, library browsing,
   editor place/select/rotate/move/delete, undo/redo, quantity edits, JSON export.
3. **Visual inspection (Playwright + pngjs)** — not golden files (3D output legitimately varies
   per GPU/driver) but **statistical invariants** per screenshot: mean luminance bounds, contrast,
   black/white ratios, color diversity, floor-region texture variance — plus **frame-stability
   (anti-flicker)** tests that compare consecutive parked-camera frames pixel-by-pixel to catch
   z-fighting and shadow shimmer regressions.

## Project structure

Feature-Sliced-inspired layout — see [ARCHITECTURE.md](./ARCHITECTURE.md) for the full document.

```
src/
├── app/          # composition root: bootstrap, mode router, test API
├── features/     # showroom | library | editor | specs (controller + logic + view)
├── catalog/      # model library: pure data (10 categories) + builder factories
├── core/         # engine, camera rig, environment (feature-agnostic)
├── assets/       # procedural textures & material presets
├── ui/           # DOM panels, nav, toolbar, styles
└── shared/       # pure domain types & math (no three.js, no DOM)
```

Dependencies point strictly downward: `app → features → {catalog, core, ui} → {assets, shared}`.
Pure logic has zero three/DOM imports, which is what makes the unit layer fast and deterministic.

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — layering rules, module boundaries, determinism strategy
- [RESEARCH.md](./RESEARCH.md) — rendering/testing research notes that drove the technical choices

---

© Flamingo Cat Ba Luxury Resort · Educational showcase built with three.js.
