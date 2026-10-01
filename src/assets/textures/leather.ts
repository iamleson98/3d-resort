/** Leather — Worley-cell grain with fbm soften. */
import { hash2, fbm, clamp01, hexRGB } from '../../shared/math/noise';
import { type TexSet, makeCanvas, normalFromHeight, roughnessFromValues } from './canvasTools';

export function leatherTex(o: { size?: number; seed?: number; base?: number; cells?: number; gloss?: number } = {}): TexSet {
  const size = o.size ?? 512;
  const seed = o.seed ?? 103;
  const B = hexRGB(o.base ?? 0x3a2e26);
  const cells = o.cells ?? 90;
  const cell = size / cells;
  const [color, cctx] = makeCanvas(size);
  const img = cctx.createImageData(size, size);
  const height = new Float32Array(size * size);
  const rough = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const gx = Math.floor(x / cell);
      const gy = Math.floor(y / cell);
      let d1 = 1e9;
      let d2 = 1e9;
      for (let oy = -1; oy <= 1; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          const cx = (gx + ox) * cell + hash2(gx + ox, gy + oy, seed) * cell;
          const cy = (gy + oy) * cell + hash2(gx + ox, gy + oy, seed + 7) * cell;
          const d = (x - cx) * (x - cx) + (y - cy) * (y - cy);
          if (d < d1) {
            d2 = d1;
            d1 = d;
          } else if (d < d2) d2 = d;
        }
      }
      const edge = clamp01((Math.sqrt(d2) - Math.sqrt(d1)) / (cell * 0.35));
      const n = fbm(x / 60, y / 60, seed + 13, 3);
      const t = 0.78 + (1 - edge) * 0.35 + n * 0.18;
      const i = (y * size + x) * 4;
      img.data[i] = B[0] * t * 255;
      img.data[i + 1] = B[1] * t * 255;
      img.data[i + 2] = B[2] * t * 255;
      img.data[i + 3] = 255;
      height[y * size + x] = edge * 0.8 + n * 0.2;
      rough[y * size + x] = (o.gloss ?? 0.4) + fbm(x / 50, y / 50, seed + 3, 3) * 0.18;
    }
  }
  cctx.putImageData(img, 0, 0);
  return { color, roughness: roughnessFromValues(rough, size), normal: normalFromHeight(height, size, 1.2) };
}
