/** Plaster / limewash — soft blotchy mineral walls. */
import { fbm, hexRGB } from '../../shared/math/noise';
import { type TexSet, makeCanvas, normalFromHeight, roughnessFromValues } from './canvasTools';

export function plasterTex(o: { size?: number; seed?: number; base?: number; blotch?: number; gloss?: number } = {}): TexSet {
  const size = o.size ?? 512;
  const seed = o.seed ?? 127;
  const B = hexRGB(o.base ?? 0xeeeae2);
  const [color, cctx] = makeCanvas(size);
  const img = cctx.createImageData(size, size);
  const height = new Float32Array(size * size);
  const rough = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const n = fbm(u * 5, v * 5, seed, 5) * (o.blotch ?? 0.35);
      const t = 1 - n;
      const i = (y * size + x) * 4;
      img.data[i] = B[0] * t * 255;
      img.data[i + 1] = B[1] * t * 255;
      img.data[i + 2] = B[2] * t * 255;
      img.data[i + 3] = 255;
      height[y * size + x] = 0.5 + fbm(x / 90, y / 90, seed + 2, 3) * 0.12;
      rough[y * size + x] = o.gloss ?? 0.9;
    }
  }
  cctx.putImageData(img, 0, 0);
  return { color, roughness: roughnessFromValues(rough, size), normal: normalFromHeight(height, size, 0.5) };
}
