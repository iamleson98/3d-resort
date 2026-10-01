# Photoreal Rendering Overhaul — Research (tidewater → Flamingo 3D)

Source: `dgreenheck/tidewater` (MIT) — a WebGPU island/ocean game with a hand-rolled engine.
Its rendering quality is the target aesthetic: *golden-hour tropical light, soft shadows,
filmic grade, tactile materials*. This doc maps each tidewater technique to our stack
(three r186 `WebGPURenderer` + TSL, WebGPU→WebGL2 fallback) and records what we ship.

## Technique mapping

| Tidewater (WGSL, custom engine) | Ours (three r186) | Decision |
|---|---|---|
| Hillaire 2020 physical atmosphere, sun/moon/stars | `SkyMesh` (Preetham analytic sky, TSL) rendered as backdrop **and** baked to PMREM for IBL | ✅ ship — Preetham at room scale is visually equivalent; PMREM gives every PBR material a real sky to reflect |
| IBL + `sunIlluminance` driving light intensity | `scene.environment` = PMREM(sky) + `DirectionalLight` whose color/intensity/azimuth/elevation are derived from the same sun vector as the sky | ✅ ship — single source of truth for sun |
| Cascaded shadows, contact-hardening penumbrae | Single tight PCFSoft frustum fitted to the room (2048², bias −0.00035, normalBias 0.04) | keep (room fits one cascade) |
| Screen-space contact shadows | GTAO covers contact darkening; existing `contactShadow()` blob primitives stay | ✅ |
| GTAO (half-res, temporal, spatial denoise, radius 2.2 / thickness 2.0 / exp 1.4 / scale 1.6, 12 taps) | `ao()` GTAONode: radius/thickness/scale tuned for metres-scale rooms, `useTemporalFiltering` on, half resolution | ✅ ship |
| TAAU temporal upscale + RCAS sharpen 0.45 | `traa()` on WebGPU backend; `smaa()` on WebGL2 backend; `sharpen()` 0.4 last | ✅ ship |
| Bloom 0.05 (13-tap tent chain) | `bloom()` low strength ~0.12, threshold ~1.0 (HDR-only highlights: lamps, sun disc, speculars) | ✅ ship |
| Grading: saturation 1.06, contrast 1.04, warmth 0.02, vignette 0.28, grain 0.012, ACES | Custom TSL grading Fn with the same five knobs; ACES stays on renderer | ✅ ship — grain gated for pixel-stability tests |
| Auto exposure (eye adaptation, refLum 0.25, 0.6–6.0, rates 1.6/1.1) | Preset exposure per time-of-day, smoothly lerped during transition (controlled interior scenes; avoids readback stalls on SwiftShader) | ✅ simplified |
| Ground bounce light (baked 512² bounce map) | `HemisphereLight` with warm sand ground color, tiny ambient — the IBL ground hemisphere carries the rest | ✅ simplified |
| Local lights: lanterns, windows, boat lights | Real `PointLight`s (2700 K, decay 2) attached to lamp/pendant builders; intensity coupled to time-of-day (dusk/night ramps up) | ✅ ship |
| God rays + aerial haze | `godrays()` evaluated behind "cinematic" quality tier (WebGPU only) — sun shaft through glazing | ⚠️ experimental, cut if QA fails |
| Air motes / marine snow | Dust-mote particle field drifting in the sun shaft, additive, quality-gated | ✅ ship |
| Lens flare w/ occlusion | skip — interiors don't sell it; vignette + bloom suffice | ❌ |
| Volumetric clouds | `SkyMesh` built-in procedural clouds (coverage/density/speed uniforms) | ✅ free |
| Dynamic resolution scaling | FPS governor: drops pixelRatio → disables GTAO temporal → drops AA tier → disables motes/godrays | ✅ ship |
| Photo mode | "Capture" button: renders a frame at 2× resolution and downloads PNG | ✅ ship |
| Settings panel (H) | Quality selector (Cinematic / Balanced / Efficient / Auto) + time-of-day chips in UI | ✅ ship |

## Time-of-day presets (the flagship look)

Room orientation fact: glazing faces +Z (ocean). Sun presets keep the sun **low and outside
the window** so mullion shadows rake across the floor — the "golden hour hotel suite" shot.

| Preset | Sun elev | Sun azimuth (toward window) | Turbidity | Rayleigh | Sun color | Sun I | Exposure | Lamps |
|---|---|---|---|---|---|---|---|---|
| Dawn | 8° | 105° | 2.6 | 2.2 | 0xffd9b0 | 2.6 | 1.15 | 0.55 |
| Noon | 62° | 150° | 3.2 | 1.2 | 0xfff4e6 | 3.4 | 1.0 | 0.0 |
| **Golden (default)** | 13° | 78° | 6.5 | 2.8 | 0xffb163 | 3.0 | 1.06 | 0.22 |
| Dusk | 2° | 72° | 11 | 3.4 | 0xff8f4d | 1.2 | 1.24 | 1.0 |

Sun azimuth measured so that light enters through the +Z glazing at a raking angle
(mullion shadows visible in the default camera framing).

## Anti-flicker invariants preserved

- PCFSoft, bias −0.00035, normalBias 0.04, 2048², capped pixelRatio ≤ 2 — unchanged.
- Post chain adds **no per-frame jitter** to the scene pass (TRAA's internal jitter is
  resolved by its own reprojection; SwiftShader/WebGL2 path uses SMAA which is static).
- Film grain is a uniform amplitude; tests pin it to 0 (pixel-stability invariant).

## Files added/changed

- `src/core/environment/sky.ts` — SkyMesh + PMREM + presets (new)
- `src/core/environment/environment.ts` — rewritten rig (same public surface + timeOfDay)
- `src/core/post/PostFX.ts` — cinematic chain + quality governor (new)
- `src/core/engine/Engine.ts` — renders through PostFX when active
- `src/catalog/builders/lighting/*` — real point lights in fixtures
- `src/assets/materials/*` — sheen fabrics, clearcoat stone
- `src/features/showroom/sunbeam.ts` — dust motes (new)
- UI: time-of-day chips, capture button, quality menu, editor grid

---

## War stories (what the QA loop actually caught)

1. **Sun azimuth vs window jamb.** All five suites glaze the north wall with window runs
   left-of-center (deluxe-king x∈[1.4, 5]). An azimuth of +35° put the sun behind the solid east
   half of the wall — every beam blocked. Fix: the sun must sit WEST of due north (negative
   azimuth) so beams clear the window's east jamb and land diagonally on the floor.
2. **The ACES-shoulder trap (the big one).** Symptoms: "shadows don't render", "the sun does
   nothing" — toggling `shadowMap.enabled` changed 0.07 % of pixels. Isolation (fresh-light test,
   strip-everything test, module-import bisect page) proved the sun, the shadow map and the light
   path all worked. The real culprit: the golden-hour PMREM ambient was so bright the floor sat at
   ~200/255 sRGB — deep inside the ACES tone-mapping shoulder, where a ±0.3-linear direct-light
   difference compresses to ±1.5 sRGB. Invisible contrast, not broken shadows.
   **Lesson: ambient (sky IBL) must sit well below the key light — `environmentIntensity` 0.3-0.4
   with sun 3.4 — so lit/shadow floor lands in the tone-curve's mid-tones where differences read.**
   This is exactly why tidewater keeps `sunIlluminance` 11 with a dim multiply-scattered sky.
3. **PCFSoft was silently removed** in three r186's node renderer ("Using PCFShadowMap instead") —
   harmless, but it explains `shadowMap.type === 1` in diagnostics.
4. **Bloom + sun disc = glow sprite.** The visible sun disc through the glazing bloomed into a
   flat white blob across the whole window band. Fix: no disc anywhere (`showSunDisc = 0` on both
   SkyMesh instances) + bloom threshold 1.5 / strength 0.1 so only true HDR peaks bloom.
