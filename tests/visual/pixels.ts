/** Visual pixel analysis — read PNG stats from a Playwright screenshot. */
import { PNG } from 'pngjs';

export interface ImageStats {
  width: number;
  height: number;
  /** mean luminance 0..255 */
  meanLuma: number;
  /** luminance standard deviation 0..255 */
  stdLuma: number;
  /** fraction of near-black pixels */
  blackRatio: number;
  /** fraction of near-white pixels */
  whiteRatio: number;
  /** number of distinct quantized colors (32 levels per channel) */
  colorDiversity: number;
}

export function analyzeBuffer(buf: Buffer): ImageStats {
  const png = PNG.sync.read(buf);
  const { width, height, data } = png;
  let sum = 0;
  let sumSq = 0;
  let black = 0;
  let white = 0;
  const colors = new Set<number>();
  const n = width * height;
  for (let i = 0; i < n; i++) {
    const r = data[i * 4]!;
    const g = data[i * 4 + 1]!;
    const b = data[i * 4 + 2]!;
    const a = data[i * 4 + 3]!;
    const luma = a === 0 ? 0 : 0.2126 * r + 0.7152 * g + 0.0722 * b;
    sum += luma;
    sumSq += luma * luma;
    if (luma < 12) black += 1;
    if (luma > 246) white += 1;
    colors.add(((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3));
  }
  const meanLuma = sum / n;
  const variance = Math.max(0, sumSq / n - meanLuma * meanLuma);
  return {
    width,
    height,
    meanLuma,
    stdLuma: Math.sqrt(variance),
    blackRatio: black / n,
    whiteRatio: white / n,
    colorDiversity: colors.size,
  };
}

/** Mean signed difference between two same-size screenshots (0..255). */
export function frameDifference(a: Buffer, b: Buffer): number {
  const pa = PNG.sync.read(a);
  const pb = PNG.sync.read(b);
  if (pa.width !== pb.width || pa.height !== pb.height) throw new Error('frame size mismatch');
  const n = pa.width * pa.height;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const la = 0.2126 * pa.data[i * 4]! + 0.7152 * pa.data[i * 4 + 1]! + 0.0722 * pa.data[i * 4 + 2]!;
    const lb = 0.2126 * pb.data[i * 4]! + 0.7152 * pb.data[i * 4 + 1]! + 0.0722 * pb.data[i * 4 + 2]!;
    sum += Math.abs(la - lb);
  }
  return sum / n;
}

/** Luminance variance inside a rectangular region (texture detail check). */
export function regionStd(buf: Buffer, x0: number, y0: number, x1: number, y1: number): number {
  const png = PNG.sync.read(buf);
  let sum = 0;
  let sumSq = 0;
  let n = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * png.width + x) * 4;
      const luma = 0.2126 * png.data[i]! + 0.7152 * png.data[i + 1]! + 0.0722 * png.data[i + 2]!;
      sum += luma;
      sumSq += luma * luma;
      n += 1;
    }
  }
  if (n === 0) return 0;
  const mean = sum / n;
  return Math.sqrt(Math.max(0, sumSq / n - mean * mean));
}
