/**
 * Deterministic noise math — pure module (no DOM / three imports).
 * Every texture generator in the app is built on these primitives,
 * so they get exhaustive unit tests.
 */

/** Deterministic PRNG in [0,1). Same seed → same sequence, forever. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Integer lattice hash → [0,1). Stable across x/y/seed. */
export function hash2(x: number, y: number, seed: number): number {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 2654435761);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Smoothstep-style hermite fade. */
export function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

/** Bilinear interpolated value noise on the integer lattice. Output [0,1). */
export function valueNoise(x: number, y: number, seed: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const a = hash2(xi, yi, seed);
  const b = hash2(xi + 1, yi, seed);
  const c = hash2(xi, yi + 1, seed);
  const d = hash2(xi + 1, yi + 1, seed);
  const u = smooth(xf);
  const v = smooth(yf);
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}

/** Fractal Brownian motion — normalized to [0,1). */
export function fbm(x: number, y: number, seed: number, octaves = 4, lacunarity = 2, gain = 0.5): number {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * valueNoise(x * freq, y * freq, seed + i * 101);
    norm += amp;
    amp *= gain;
    freq *= lacunarity;
  }
  return sum / norm;
}

/** Ridged multifractal — sharp creases in [0,1]. Used for marble veins. */
export function ridged(x: number, y: number, seed: number, octaves = 5): number {
  const n = fbm(x, y, seed, octaves);
  return 1 - Math.abs(2 * n - 1);
}

/** Clamp to [0,1]. */
export function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/** Linear interpolation. */
export function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Unpack 0xRRGGBB into linear-ish [r,g,b] floats (no gamma applied). */
export function hexRGB(hex: number): [number, number, number] {
  const r = (hex >> 16) & 255;
  const g = (hex >> 8) & 255;
  const b = hex & 255;
  return [r / 255, g / 255, b / 255];
}

/** CSS rgb() string from 0xRRGGBB with brightness multiplier. */
export function cssRGB(hex: number, mult = 1): string {
  const r = Math.min(255, Math.round(((hex >> 16) & 255) * mult));
  const g = Math.min(255, Math.round(((hex >> 8) & 255) * mult));
  const b = Math.min(255, Math.round((hex & 255) * mult));
  return `rgb(${r},${g},${b})`;
}

/**
 * Sobel height-field → tangent-space normal packed as RGB bytes.
 * `height` is a square Float32Array; `size` its edge length.
 * Mirrored-edge sampling keeps the result tileable.
 */
export function heightToNormalBytes(height: Float32Array, size: number, strength = 1): Uint8ClampedArray {
  const out = new Uint8ClampedArray(size * size * 4);
  const H = (x: number, y: number): number => height[(y & (size - 1)) * size + (x & (size - 1))] ?? 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (H(x + 1, y) - H(x - 1, y)) * strength;
      const dy = (H(x, y + 1) - H(x, y - 1)) * strength;
      const len = Math.sqrt(dx * dx + dy * dy + 1);
      const nx = -dx / len;
      const ny = -dy / len;
      const nz = 1 / len;
      const i = (y * size + x) * 4;
      out[i] = (nx * 0.5 + 0.5) * 255;
      out[i + 1] = (ny * 0.5 + 0.5) * 255;
      out[i + 2] = (nz * 0.5 + 0.5) * 255;
      out[i + 3] = 255;
    }
  }
  return out;
}
