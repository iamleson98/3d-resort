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
- **Rendering quality** — PCF soft shadows with tuned bias, thick floor slabs and lifted rugs to
  eliminate z-fighting shimmer, capped pixel ratio, tone-mapped ACES output.
- **Real-room photo library** — `public/rooms/` holds **77 high-resolution photographs** of the
  actual **14 accommodation types** published on flamingoresorts.vn (hotel rooms, residences and
  the Imperial Suite), organized one folder per room — see
  [public/rooms/README.md](./public/rooms/README.md).

## Rendering note

The app boots `WebGPURenderer` and falls back to WebGL2 (`forceWebGL: true`) where WebGPU is
unavailable — headless/CI environments included. `window.__RESORT__.backend()` reports which one is live.

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
