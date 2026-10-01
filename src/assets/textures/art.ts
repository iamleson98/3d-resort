/** Generative artwork — seeded compositions for framed canvases. */
import { mulberry32 } from '../../shared/math/noise';
import { type TexSet, makeCanvas } from './canvasTools';

export type ArtStyle = 'arc' | 'blocks' | 'line' | 'terracotta' | 'abstract';

export function artTex(o: { size?: number; seed?: number; palette?: string[]; style?: ArtStyle } = {}): TexSet {
  const size = o.size ?? 512;
  const seed = o.seed ?? 157;
  const palette = o.palette ?? ['#c9a15a', '#274a3d', '#efe7d8', '#8c5a3c', '#2e3138'];
  const [c, ctx] = makeCanvas(size);
  const rnd = mulberry32(seed);
  ctx.fillStyle = '#f4efe6';
  ctx.fillRect(0, 0, size, size);
  const style = o.style ?? 'arc';
  if (style === 'arc' || style === 'abstract') {
    const n = style === 'abstract' ? 5 : 3;
    for (let i = 0; i < n; i++) {
      ctx.strokeStyle = palette[Math.floor(rnd() * palette.length)] ?? '#c9a15a';
      ctx.lineWidth = size * (0.02 + rnd() * 0.05);
      ctx.beginPath();
      ctx.arc(size * (0.3 + rnd() * 0.4), size * (0.3 + rnd() * 0.4), size * (0.12 + rnd() * 0.3), rnd() * 6, rnd() * 6 + 2 + rnd() * 3);
      ctx.stroke();
    }
  } else if (style === 'blocks') {
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = palette[Math.floor(rnd() * palette.length)] ?? '#274a3d';
      ctx.globalAlpha = 0.85;
      ctx.fillRect(rnd() * size * 0.7, rnd() * size * 0.7, size * (0.1 + rnd() * 0.3), size * (0.08 + rnd() * 0.4));
    }
    ctx.globalAlpha = 1;
  } else if (style === 'line') {
    ctx.strokeStyle = palette[0] ?? '#c9a15a';
    ctx.lineWidth = size * 0.008;
    for (let i = 0; i < 9; i++) {
      ctx.beginPath();
      ctx.moveTo(size * 0.15, size * (0.2 + i * 0.07));
      ctx.lineTo(size * 0.85, size * (0.2 + i * 0.07) + Math.sin(i) * size * 0.05);
      ctx.stroke();
    }
    ctx.fillStyle = palette[1] ?? '#274a3d';
    ctx.beginPath();
    ctx.arc(size * 0.68, size * 0.34, size * 0.09, 0, 7);
    ctx.fill();
  } else {
    ctx.fillStyle = palette[0] ?? '#c9a15a';
    ctx.beginPath();
    ctx.moveTo(size * 0.5, size * 0.2);
    ctx.lineTo(size * 0.8, size * 0.8);
    ctx.lineTo(size * 0.2, size * 0.8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = palette[2] ?? '#efe7d8';
    ctx.fillRect(size * 0.2, size * 0.82, size * 0.6, size * 0.05);
  }
  return { color: c, roughness: null, normal: null };
}
