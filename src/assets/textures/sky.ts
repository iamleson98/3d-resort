/** Sky gradient with sun hotspot — feeds the environment map. */
import { mulberry32 } from '../../shared/math/noise';
import { makeCanvas } from './canvasTools';

export function skyTex(o: { size?: number } = {}): HTMLCanvasElement {
  const size = o.size ?? 1024;
  const [c, ctx] = makeCanvas(size);
  const g = ctx.createLinearGradient(0, 0, 0, size);
  g.addColorStop(0, '#cfe3f2');
  g.addColorStop(0.42, '#eef2ec');
  g.addColorStop(0.5, '#f2ece0');
  g.addColorStop(0.62, '#e8dfd0');
  g.addColorStop(1, '#b9aa96');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const sx = size * 0.72;
  const sy = size * 0.18;
  const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, size * 0.22);
  sg.addColorStop(0, 'rgba(255,244,220,0.95)');
  sg.addColorStop(0.4, 'rgba(255,238,205,0.35)');
  sg.addColorStop(1, 'rgba(255,238,205,0)');
  ctx.fillStyle = sg;
  ctx.fillRect(0, 0, size, size);
  const rnd = mulberry32(5);
  for (let i = 0; i < 30; i++) {
    const y = size / 2 + rnd() * (size / 2) * 0.4;
    ctx.fillStyle = `rgba(255,255,255,${rnd() * 0.05})`;
    ctx.fillRect(0, y, size, 2 + rnd() * 6);
  }
  return c;
}
