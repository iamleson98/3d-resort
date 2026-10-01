/**
 * Canvas toolkit for the procedural texture atelier.
 * Shared by every texture family module.
 */
import { clamp01, heightToNormalBytes } from '../../shared/math/noise';

export interface TexSet {
  color: HTMLCanvasElement;
  roughness: HTMLCanvasElement | null;
  normal: HTMLCanvasElement | null;
}

type Ctx2D = CanvasRenderingContext2D;

export function makeCanvas(size: number): [HTMLCanvasElement, Ctx2D] {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  return [c, c.getContext('2d') as Ctx2D];
}

/** Height field (Float32, 0..1) → tangent-space normal map canvas. */
export function normalFromHeight(height: Float32Array, size: number, strength: number): HTMLCanvasElement {
  const bytes = heightToNormalBytes(height, size, strength);
  const [c, ctx] = makeCanvas(size);
  const img = ctx.createImageData(size, size);
  img.data.set(bytes);
  ctx.putImageData(img, 0, 0);
  return c;
}

/** Roughness field (Float32, 0..1) → grayscale canvas. */
export function roughnessFromValues(values: Float32Array, size: number): HTMLCanvasElement {
  const [c, ctx] = makeCanvas(size);
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    const v = clamp01(values[i] ?? 0) * 255;
    img.data[i * 4] = v;
    img.data[i * 4 + 1] = v;
    img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

/** Read a canvas's red channel into a Float32 field (0..1). */
export function fieldFromCanvas(c: HTMLCanvasElement): { field: Float32Array; size: number } {
  const size = c.width;
  const ctx = c.getContext('2d') as Ctx2D;
  const data = ctx.getImageData(0, 0, size, size).data;
  const field = new Float32Array(size * size);
  for (let i = 0; i < size * size; i++) field[i] = (data[i * 4] ?? 0) / 255;
  return { field, size };
}
