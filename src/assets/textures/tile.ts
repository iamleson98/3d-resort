/** Tiles — grout grid, per-tile jitter, beveled edges. */
import { hash2, fbm, clamp01, hexRGB } from '../../shared/math/noise';
import { type TexSet, makeCanvas, normalFromHeight, roughnessFromValues } from './canvasTools';

export function tileTex(o: { size?: number; seed?: number; tiles?: number; base?: number; grout?: number; jitter?: number; gloss?: number; bevel?: number } = {}): TexSet {
  const size = o.size ?? 512;
  const seed = o.seed ?? 131;
  const tiles = o.tiles ?? 4;
  const B = hexRGB(o.base ?? 0xe9e6df);
  const G = hexRGB(o.grout ?? 0xc4bfb4);
  const jitter = o.jitter ?? 0.05;
  const bevel = o.bevel ?? 0.05;
  const [color, cctx] = makeCanvas(size);
  const img = cctx.createImageData(size, size);
  const height = new Float32Array(size * size);
  const rough = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const tx = Math.floor(u * tiles);
      const ty = Math.floor(v * tiles);
      const fx = u * tiles - tx;
      const fy = v * tiles - ty;
      const edge = Math.min(fx, 1 - fx, fy, 1 - fy);
      const inGrout = edge < 0.035;
      const jit = (hash2(tx, ty, seed) - 0.5) * jitter;
      const vein = fbm(u * 6, v * 6, seed + tx * 7 + ty * 13, 3) * 0.06;
      const t = clamp01(1 - vein * 2 + jit);
      const i = (y * size + x) * 4;
      const c = inGrout ? G : B;
      const shade = inGrout ? 0.92 : t;
      img.data[i] = c[0] * shade * 255;
      img.data[i + 1] = c[1] * shade * 255;
      img.data[i + 2] = c[2] * shade * 255;
      img.data[i + 3] = 255;
      const bev = clamp01((edge - 0.035) / bevel);
      height[y * size + x] = inGrout ? 0.35 : 0.55 + bev * 0.45;
      rough[y * size + x] = inGrout ? 0.75 : (o.gloss ?? 0.16) + Math.abs(jit);
    }
  }
  cctx.putImageData(img, 0, 0);
  return { color, roughness: roughnessFromValues(rough, size), normal: normalFromHeight(height, size, 2.2) };
}
