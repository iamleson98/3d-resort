/** Soft goods — plain weave linen, bouclé loops, velvet pile. */
import { mulberry32, fbm, clamp01, hexRGB, cssRGB } from '../../shared/math/noise';
import { type TexSet, makeCanvas, normalFromHeight, roughnessFromValues, fieldFromCanvas } from './canvasTools';

export function fabricTex(o: { size?: number; seed?: number; base?: number; thread?: number; weave?: number; gloss?: number } = {}): TexSet {
  const size = o.size ?? 512;
  const seed = o.seed ?? 71;
  const B = hexRGB(o.base ?? 0xe6e0d4);
  const thread = o.thread ?? 42;
  const weave = o.weave ?? 0.5;
  const [color, cctx] = makeCanvas(size);
  const img = cctx.createImageData(size, size);
  const height = new Float32Array(size * size);
  const rough = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const wx = Math.sin(u * Math.PI * thread);
      const wy = Math.sin(v * Math.PI * thread);
      const over = ((Math.floor((u * thread) / 2) + Math.floor((v * thread) / 2)) % 2) * 2 - 1;
      const w = wx * wy * weave * over;
      const n = fbm(u * 22, v * 22, seed, 3) * 0.25;
      const t = clamp01(0.5 + w * 0.28 + n - 0.12);
      const i = (y * size + x) * 4;
      const l = 0.82 + t * 0.36;
      img.data[i] = B[0] * l * 255;
      img.data[i + 1] = B[1] * l * 255;
      img.data[i + 2] = B[2] * l * 255;
      img.data[i + 3] = 255;
      height[y * size + x] = 0.5 + w * 0.3 + n * 0.3;
      rough[y * size + x] = (o.gloss ?? 0.72) + fbm(x / 18, y / 18, seed + 2, 2) * 0.14;
    }
  }
  cctx.putImageData(img, 0, 0);
  return { color, roughness: roughnessFromValues(rough, size), normal: normalFromHeight(height, size, 1.1) };
}

export function boucleTex(o: { size?: number; seed?: number; base?: number; gloss?: number } = {}): TexSet {
  const size = o.size ?? 512;
  const seed = o.seed ?? 83;
  const base = o.base ?? 0xefeae0;
  const [color, cctx] = makeCanvas(size);
  const [hCanvas, hctx] = makeCanvas(size);
  cctx.fillStyle = cssRGB(base, 0.78);
  cctx.fillRect(0, 0, size, size);
  hctx.fillStyle = '#6a6a6a';
  hctx.fillRect(0, 0, size, size);
  const rnd = mulberry32(seed);
  const loops = 1900;
  for (let i = 0; i < loops; i++) {
    const x = rnd() * size;
    const y = rnd() * size;
    const r = 2.2 + rnd() * 2.8;
    const l = 0.75 + rnd() * 0.5;
    cctx.strokeStyle = cssRGB(base, l);
    cctx.lineWidth = 1.6;
    cctx.beginPath();
    cctx.arc(x, y, r, rnd() * 6, rnd() * 6 + 4);
    cctx.stroke();
    hctx.strokeStyle = 'rgba(200,200,200,0.8)';
    hctx.beginPath();
    hctx.arc(x, y, r, 0, 5);
    hctx.stroke();
  }
  const { field: height } = fieldFromCanvas(hCanvas);
  const rough = new Float32Array(size * size).fill(o.gloss ?? 0.78);
  return { color, roughness: roughnessFromValues(rough, size), normal: normalFromHeight(height, size, 1.6) };
}

export function velvetTex(o: { size?: number; seed?: number; base?: number; gloss?: number } = {}): TexSet {
  const size = o.size ?? 512;
  const seed = o.seed ?? 97;
  const B = hexRGB(o.base ?? 0x274a3d);
  const [color, cctx] = makeCanvas(size);
  const img = cctx.createImageData(size, size);
  const height = new Float32Array(size * size);
  const rough = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const sheen = fbm(u * 3 + 2, v * 3, seed, 4);
      const pile = fbm(u * 90, v * 90, seed + 1, 2) * 0.14;
      const t = 0.55 + sheen * 0.55 + pile;
      const i = (y * size + x) * 4;
      img.data[i] = B[0] * t * 255;
      img.data[i + 1] = B[1] * t * 255;
      img.data[i + 2] = B[2] * t * 255;
      img.data[i + 3] = 255;
      height[y * size + x] = 0.5 + fbm(x / 80, y / 80, seed + 9, 2) * 0.1;
      rough[y * size + x] = (o.gloss ?? 0.42) + fbm(x / 60, y / 60, seed + 5, 3) * 0.3;
    }
  }
  cctx.putImageData(img, 0, 0);
  return { color, roughness: roughnessFromValues(rough, size), normal: normalFromHeight(height, size, 0.35) };
}
