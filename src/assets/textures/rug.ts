/** Rugs — patterned knotted wool with fiber noise. */
import { mulberry32, clamp01, cssRGB } from '../../shared/math/noise';
import { type TexSet, makeCanvas, normalFromHeight, roughnessFromValues } from './canvasTools';

export type RugPattern = 'border' | 'stripes' | 'abstract' | 'diamond';

export function rugTex(o: { size?: number; seed?: number; base?: number; accent?: number; pattern?: RugPattern; gloss?: number } = {}): TexSet {
  const size = o.size ?? 512;
  const seed = o.seed ?? 149;
  const base = o.base ?? 0xd8cfbf;
  const accent = o.accent ?? 0x8d7355;
  const [color, cctx] = makeCanvas(size);
  const rnd = mulberry32(seed);
  cctx.fillStyle = cssRGB(base);
  cctx.fillRect(0, 0, size, size);
  const a = cssRGB(accent);
  const s = size;
  const pattern = o.pattern ?? 'border';
  if (pattern === 'border') {
    cctx.strokeStyle = a;
    cctx.lineWidth = s * 0.018;
    cctx.strokeRect(s * 0.08, s * 0.08, s * 0.84, s * 0.84);
    cctx.lineWidth = s * 0.008;
    cctx.strokeRect(s * 0.14, s * 0.14, s * 0.72, s * 0.72);
    cctx.fillStyle = a;
    cctx.fillRect(s * 0.5 - s * 0.004, s * 0.14, s * 0.008, s * 0.72);
    cctx.fillRect(s * 0.14, s * 0.5 - s * 0.004, s * 0.72, s * 0.008);
  } else if (pattern === 'stripes') {
    for (let i = 0; i < 9; i++) {
      cctx.fillStyle = i % 2 ? a : cssRGB(base);
      cctx.globalAlpha = i % 2 ? 0.85 : 1;
      cctx.fillRect(0, (i / 9) * s, s, s / 9);
    }
    cctx.globalAlpha = 1;
  } else if (pattern === 'abstract') {
    cctx.strokeStyle = a;
    for (let i = 0; i < 6; i++) {
      cctx.lineWidth = s * (0.01 + rnd() * 0.03);
      cctx.beginPath();
      cctx.moveTo(rnd() * s, rnd() * s);
      cctx.bezierCurveTo(rnd() * s, rnd() * s, rnd() * s, rnd() * s, rnd() * s, rnd() * s);
      cctx.stroke();
    }
    cctx.fillStyle = a;
    cctx.globalAlpha = 0.6;
    cctx.beginPath();
    cctx.arc(s * 0.72, s * 0.3, s * 0.06, 0, 7);
    cctx.fill();
    cctx.globalAlpha = 1;
  } else {
    cctx.strokeStyle = a;
    cctx.lineWidth = s * 0.006;
    for (let i = -8; i < 16; i++) {
      cctx.beginPath();
      cctx.moveTo((i * s) / 8, 0);
      cctx.lineTo((i * s) / 8 + s / 2, s / 2);
      cctx.lineTo((i * s) / 8, s);
      cctx.stroke();
      cctx.beginPath();
      cctx.moveTo((i * s) / 8, 0);
      cctx.lineTo((i * s) / 8 - s / 2, s / 2);
      cctx.lineTo((i * s) / 8, s);
      cctx.stroke();
    }
  }
  // fiber noise over the pattern
  const img = cctx.getImageData(0, 0, size, size);
  const hRnd = mulberry32(seed + 1);
  const height = new Float32Array(size * size);
  for (let i = 0; i < size * size; i++) {
    const n = (hRnd() - 0.5) * 26;
    img.data[i * 4] = clamp01((img.data[i * 4] ?? 0) / 255 + n / 255) * 255;
    img.data[i * 4 + 1] = clamp01((img.data[i * 4 + 1] ?? 0) / 255 + n / 255) * 255;
    img.data[i * 4 + 2] = clamp01((img.data[i * 4 + 2] ?? 0) / 255 + n / 255) * 255;
    height[i] = 0.5 + hRnd() * 0.5;
  }
  cctx.putImageData(img, 0, 0);
  const rough = new Float32Array(size * size).fill(o.gloss ?? 0.94);
  return { color, roughness: roughnessFromValues(rough, size), normal: normalFromHeight(height, size, 1.3) };
}
