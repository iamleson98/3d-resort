/** Rattan / wicker — woven ribbon grid. */
import { fbm, clamp01, hexRGB } from '../../shared/math/noise';
import { type TexSet, makeCanvas, normalFromHeight, roughnessFromValues } from './canvasTools';

export function rattanTex(o: { size?: number; seed?: number; base?: number; weave?: number; gloss?: number } = {}): TexSet {
  const size = o.size ?? 512;
  const seed = o.seed ?? 139;
  const B = hexRGB(o.base ?? 0xc9a06a);
  const weave = o.weave ?? 26;
  const [color, cctx] = makeCanvas(size);
  const img = cctx.createImageData(size, size);
  const height = new Float32Array(size * size);
  const rough = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const cx = Math.floor(u * weave);
      const cy = Math.floor(v * weave);
      const fx = u * weave - cx;
      const fy = v * weave - cy;
      const over = (cx + cy) % 2 === 0;
      const ribbon = over ? Math.sin(fx * Math.PI) : Math.sin(fy * Math.PI);
      const gap = Math.max(Math.abs(fx - 0.5), Math.abs(fy - 0.5)) > 0.46 ? 1 : 0;
      const n = fbm(u * 30, v * 30, seed, 2) * 0.16;
      const t = clamp01(0.62 + ribbon * 0.34 - gap * 0.5 + n);
      const i = (y * size + x) * 4;
      img.data[i] = B[0] * t * 255;
      img.data[i + 1] = B[1] * t * 255;
      img.data[i + 2] = B[2] * t * 255;
      img.data[i + 3] = 255;
      height[y * size + x] = ribbon * 0.75 * (1 - gap) + 0.15;
      rough[y * size + x] = o.gloss ?? 0.55;
    }
  }
  cctx.putImageData(img, 0, 0);
  return { color, roughness: roughnessFromValues(rough, size), normal: normalFromHeight(height, size, 2.6) };
}
