/** Aggregate stones — granite speckle, terrazzo chips, travertine bands. */
import { mulberry32, fbm, hexRGB, cssRGB } from '../../shared/math/noise';
import { type TexSet, makeCanvas, normalFromHeight, roughnessFromValues, fieldFromCanvas } from './canvasTools';

export function graniteTex(o: { size?: number; seed?: number; base?: number; speckles?: number; gloss?: number } = {}): TexSet {
  const size = o.size ?? 512;
  const seed = o.seed ?? 31;
  const rnd = mulberry32(seed);
  const [color, cctx] = makeCanvas(size);
  cctx.fillStyle = cssRGB(o.base ?? 0x9aa0a8);
  cctx.fillRect(0, 0, size, size);
  const height = new Float32Array(size * size).fill(0.5);
  const tones = [
    [255, 255, 255], [30, 32, 38], [120, 110, 100], [70, 78, 90], [200, 205, 215],
  ];
  const speckles = o.speckles ?? 2600;
  for (let i = 0; i < speckles; i++) {
    const tone = tones[Math.floor(rnd() * tones.length)]!;
    const x = Math.floor(rnd() * size);
    const y = Math.floor(rnd() * size);
    const r = 0.6 + rnd() * 2.6;
    cctx.globalAlpha = 0.25 + rnd() * 0.5;
    cctx.fillStyle = `rgb(${tone[0]},${tone[1]},${tone[2]})`;
    cctx.beginPath();
    cctx.arc(x, y, r, 0, 7);
    cctx.fill();
    height[y * size + x] = 0.5 + (rnd() - 0.5) * 0.3;
  }
  cctx.globalAlpha = 1;
  const rough = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      rough[y * size + x] = (o.gloss ?? 0.22) + fbm(x / 40, y / 40, seed, 3) * 0.2;
    }
  }
  return { color, roughness: roughnessFromValues(rough, size), normal: normalFromHeight(height, size, 0.9) };
}

export function terrazzoTex(o: { size?: number; seed?: number; base?: number; chips?: number; chipColors?: number[] } = {}): TexSet {
  const size = o.size ?? 512;
  const seed = o.seed ?? 47;
  const rnd = mulberry32(seed);
  const [color, cctx] = makeCanvas(size);
  cctx.fillStyle = cssRGB(o.base ?? 0xe8e4dc);
  cctx.fillRect(0, 0, size, size);
  const height = new Float32Array(size * size).fill(0.5);
  const chipColors = o.chipColors ?? [0xc98d6b, 0x2e3138, 0xa4ab9a, 0xd9c8a9, 0x8c5a3c];
  const chips = o.chips ?? 300;
  for (let i = 0; i < chips; i++) {
    const t = chipColors[Math.floor(rnd() * chipColors.length)]!;
    const x = rnd() * size;
    const y = rnd() * size;
    const r = 3 + rnd() * 9;
    const a = rnd() * Math.PI;
    cctx.fillStyle = cssRGB(t);
    cctx.save();
    cctx.translate(x, y);
    cctx.rotate(a);
    cctx.beginPath();
    cctx.ellipse(0, 0, r, r * (0.4 + rnd() * 0.5), 0, 0, 7);
    cctx.fill();
    cctx.restore();
    const xi = Math.min(size - 1, Math.floor(x));
    const yi = Math.min(size - 1, Math.floor(y));
    height[yi * size + xi] = 0.62;
  }
  const rough = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      rough[y * size + x] = 0.14 + fbm(x / 30, y / 30, seed, 3) * 0.1;
    }
  }
  return { color, roughness: roughnessFromValues(rough, size), normal: normalFromHeight(height, size, 0.8) };
}

export function travertineTex(o: { size?: number; seed?: number; base?: number; band?: number; gloss?: number } = {}): TexSet {
  const size = o.size ?? 512;
  const seed = o.seed ?? 61;
  const B = hexRGB(o.base ?? 0xd9cfbc);
  const D = hexRGB(o.band ?? 0xbfb19a);
  const [color, cctx] = makeCanvas(size);
  const img = cctx.createImageData(size, size);
  const height = new Float32Array(size * size);
  const rough = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const bands = Math.sin(v * 34 + fbm(u * 3, v * 6, seed, 3) * 5) * 0.5 + 0.5;
      const pits = fbm(u * 14, v * 26, seed + 3, 4);
      const pit = pits > 0.62 ? (pits - 0.62) / 0.38 : 0;
      const t = Math.min(1, Math.max(0, bands * 0.55 + pit * 0.4));
      const i = (y * size + x) * 4;
      img.data[i] = (B[0] + (D[0] - B[0]) * t) * 255;
      img.data[i + 1] = (B[1] + (D[1] - B[1]) * t) * 255;
      img.data[i + 2] = (B[2] + (D[2] - B[2]) * t) * 255;
      img.data[i + 3] = 255;
      height[y * size + x] = 1 - pit * 0.85 - bands * 0.1;
      rough[y * size + x] = (o.gloss ?? 0.3) + fbm(x / 25, y / 25, seed + 8, 3) * 0.25;
    }
  }
  cctx.putImageData(img, 0, 0);
  return { color, roughness: roughnessFromValues(rough, size), normal: normalFromHeight(height, size, 1.8) };
}

export { fieldFromCanvas };
