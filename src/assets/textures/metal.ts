/** Metals — brushed streak height field (color supplied by the material). */
import { mulberry32, fbm } from '../../shared/math/noise';
import { type TexSet, makeCanvas, normalFromHeight, roughnessFromValues, fieldFromCanvas } from './canvasTools';

export function brushedTex(o: { size?: number; seed?: number; streaks?: number; gloss?: number } = {}): TexSet {
  const size = o.size ?? 512;
  const seed = o.seed ?? 113;
  const rnd = mulberry32(seed);
  const [hCanvas, hctx] = makeCanvas(size);
  hctx.fillStyle = '#888888';
  hctx.fillRect(0, 0, size, size);
  const streaks = o.streaks ?? 380;
  for (let i = 0; i < streaks; i++) {
    const y = rnd() * size;
    const v = Math.floor(100 + rnd() * 120);
    hctx.strokeStyle = `rgb(${v},${v},${v})`;
    hctx.lineWidth = 0.7 + rnd() * 1.4;
    hctx.beginPath();
    hctx.moveTo(0, y);
    hctx.lineTo(size, y + (rnd() - 0.5) * 6);
    hctx.stroke();
  }
  const { field: height } = fieldFromCanvas(hCanvas);
  const rough = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      rough[y * size + x] = (o.gloss ?? 0.28) + (Math.sin(y * 1.7) * 0.5 + 0.5) * 0.06 + fbm(x / 30, y / 30, seed, 2) * 0.05;
    }
  }
  return { color: hCanvas, roughness: roughnessFromValues(rough, size), normal: normalFromHeight(height, size, 0.8) };
}
