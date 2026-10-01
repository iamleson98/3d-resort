/** Wood grain — ring-warped fbm with fine streaks. */
import { fbm, clamp01, mix, hexRGB } from '../../shared/math/noise';
import { type TexSet, makeCanvas, normalFromHeight, roughnessFromValues } from './canvasTools';

export interface WoodOptions {
  size?: number;
  seed?: number;
  light?: number;
  dark?: number;
  rings?: number;
  turbulence?: number;
  streak?: number;
  gloss?: number;
}

export function woodTex(o: WoodOptions = {}): TexSet {
  const size = o.size ?? 512;
  const seed = o.seed ?? 7;
  const A = hexRGB(o.light ?? 0xb98a56);
  const B = hexRGB(o.dark ?? 0x6b4423);
  const rings = o.rings ?? 9;
  const turbulence = o.turbulence ?? 0.35;
  const streak = o.streak ?? 0.12;
  const gloss = o.gloss ?? 0.35;

  const [color, cctx] = makeCanvas(size);
  const img = cctx.createImageData(size, size);
  const height = new Float32Array(size * size);
  const rough = new Float32Array(size * size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const warp = fbm(u * 3, v * 0.6, seed, 4) * turbulence;
      const g = Math.sin((v * rings + warp) * Math.PI * 2);
      const fine = fbm(u * 60, v * 8, seed + 9, 2) * streak;
      let t = clamp01(g * 0.5 + 0.5 + fine);
      t = Math.pow(t, 1.25);
      const i = (y * size + x) * 4;
      img.data[i] = mix(A[0], B[0], t) * 255;
      img.data[i + 1] = mix(A[1], B[1], t) * 255;
      img.data[i + 2] = mix(A[2], B[2], t) * 255;
      img.data[i + 3] = 255;
      height[y * size + x] = t * 0.55 + fbm(u * 90, v * 12, seed + 31, 2) * 0.45;
      rough[y * size + x] = gloss + (1 - t) * 0.18 + fine * 0.5;
    }
  }
  cctx.putImageData(img, 0, 0);
  return { color, roughness: roughnessFromValues(rough, size), normal: normalFromHeight(height, size, 1.4) };
}
