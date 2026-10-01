/** Marble — ridged multifractal veins over a clouded base. */
import { fbm, ridged, clamp01, mix, hexRGB } from '../../shared/math/noise';
import { type TexSet, makeCanvas, normalFromHeight, roughnessFromValues } from './canvasTools';

export interface MarbleOptions {
  size?: number;
  seed?: number;
  base?: number;
  vein?: number;
  vein2?: number;
  scale?: number;
  threshold?: number;
  gloss?: number;
}

export function marbleTex(o: MarbleOptions = {}): TexSet {
  const size = o.size ?? 512;
  const seed = o.seed ?? 11;
  const C = hexRGB(o.base ?? 0xf2efe9);
  const V = hexRGB(o.vein ?? 0x8a8578);
  const V2 = hexRGB(o.vein2 ?? 0xb5ad9c);
  const scale = o.scale ?? 3.2;
  const threshold = o.threshold ?? 0.74;
  const gloss = o.gloss ?? 0.08;

  const [color, cctx] = makeCanvas(size);
  const img = cctx.createImageData(size, size);
  const height = new Float32Array(size * size);
  const rough = new Float32Array(size * size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const r1 = ridged(u * scale, v * scale, seed, 5);
      const r2 = ridged(u * scale * 1.7 + 5, v * scale * 1.7, seed + 5, 4);
      const cloud = fbm(u * 2.2, v * 2.2, seed + 21, 4);
      const t = clamp01((r1 - threshold) / (1 - threshold));
      const t2 = clamp01((r2 - threshold - 0.06) / (1 - threshold));
      const shade = cloud * 0.08;
      const i = (y * size + x) * 4;
      let R = C[0] * (1 - shade);
      let G = C[1] * (1 - shade);
      let Bl = C[2] * (1 - shade);
      R = mix(R, V2[0], t2 * 0.5);
      G = mix(G, V2[1], t2 * 0.5);
      Bl = mix(Bl, V2[2], t2 * 0.5);
      R = mix(R, V[0], t);
      G = mix(G, V[1], t);
      Bl = mix(Bl, V[2], t);
      img.data[i] = R * 255;
      img.data[i + 1] = G * 255;
      img.data[i + 2] = Bl * 255;
      img.data[i + 3] = 255;
      height[y * size + x] = 1 - t * 0.7 - t2 * 0.2;
      rough[y * size + x] = gloss + t * 0.22 + cloud * 0.1;
    }
  }
  cctx.putImageData(img, 0, 0);
  return { color, roughness: roughnessFromValues(rough, size), normal: normalFromHeight(height, size, 0.7) };
}
