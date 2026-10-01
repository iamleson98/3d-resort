/** Decor builders — artwork, vases, small accessories. */
import type { ModelBuilder } from '../shared/context';
import { box, cyl, lathe, sphere, group, contactShadow } from '../shared/primitives';
import { mesh } from '../shared/primitives';
import * as THREE from 'three/webgpu';
import { artMaterial } from '../../../assets/materials';
import type { ArtStyle } from '../../../assets/textures';

export const artworkLarge: ModelBuilder = (ctx) => {
  const frame = ctx.get('frame');
  const seed = Number(ctx.params.artSeed ?? 11);
  const style = String(ctx.params.artStyle ?? 'abstract') as ArtStyle;
  const g = group([]);
  g.add(box(1.5, 1.0, 0.05, frame, 0, 0.5, 0));
  g.add(mesh(new THREE.PlaneGeometry(1.38, 0.88), artMaterial({ seed, style }), 0, 0.5, 0.028));
  return g;
};

export const artworkPair: ModelBuilder = (ctx) => {
  const frame = ctx.get('frame');
  const seed = Number(ctx.params.artSeed ?? 53);
  const style = String(ctx.params.artStyle ?? 'blocks') as ArtStyle;
  const g = group([]);
  for (const sx of [-1, 1] as const) {
    g.add(box(0.52, 0.8, 0.04, frame, sx * 0.28, 0.4, 0));
    g.add(mesh(new THREE.PlaneGeometry(0.44, 0.72), artMaterial({ seed: seed + (sx === 1 ? 1 : 0), style }), sx * 0.28, 0.4, 0.024));
  }
  return g;
};

export const vaseFloor: ModelBuilder = (ctx) => {
  const body = ctx.get('body');
  const g = group([]);
  // waisted monolith profile
  g.add(lathe([
    [0.001, 0], [0.13, 0.02], [0.17, 0.2], [0.13, 0.55],
    [0.15, 0.85], [0.11, 1.05], [0.09, 1.1],
  ], body, 36));
  // dry-branch arrangement
  for (let i = 0; i < 3; i++) {
    const stem = cyl(0.006, 0.004, 0.55, ctx.get('trunk'), (i - 1) * 0.03, 1.35, (i - 1) * 0.02, 6);
    stem.rotation.z = (i - 1) * 0.12;
    g.add(stem);
  }
  return g;
};

export const vaseTable: ModelBuilder = (ctx) => {
  const body = ctx.get('body');
  const g = group([]);
  for (let i = 0; i < 3; i++) {
    const x = -0.12 + i * 0.12;
    const s = 0.9 + i * 0.12;
    g.add(lathe([
      [0.001, 0], [0.05 * s, 0.01], [0.07 * s, 0.1], [0.035 * s, 0.2], [0.04 * s, 0.26 * s],
    ], body, 24, x, 0, (i - 1) * 0.05));
  }
  return g;
};

export const trayDecor: ModelBuilder = (ctx) => {
  const body = ctx.get('body');
  const top = ctx.get('top');
  const g = group([]);
  g.add(box(0.45, 0.02, 0.32, top, 0, 0.012, 0));
  for (const sz of [-1, 1] as const) {
    g.add(box(0.45, 0.03, 0.02, body, 0, 0.025, sz * 0.16));
  }
  for (const sx of [-1, 1] as const) {
    g.add(box(0.02, 0.03, 0.32, body, sx * 0.22, 0.025, 0));
  }
  // decanter + glasses
  g.add(lathe([[0.001, 0], [0.05, 0], [0.05, 0.06], [0.02, 0.12], [0.018, 0.2]], body, 20, -0.1, 0.02, 0));
  g.add(cyl(0.025, 0.025, 0.05, top, 0.08, 0.045, 0.04, 16));
  g.add(cyl(0.025, 0.025, 0.05, top, 0.14, 0.045, -0.04, 16));
  return g;
};

export const booksStack: ModelBuilder = (ctx) => {
  const body = ctx.get('body');
  const accent = ctx.get('accent');
  const g = group([]);
  const heights = [0.05, 0.04, 0.045];
  const dims: Array<[number, number]> = [[0.34, 0.26], [0.3, 0.24], [0.26, 0.2]];
  let y = 0;
  for (let i = 0; i < 3; i++) {
    const [w, d] = dims[i]!;
    const mat = i === 1 ? accent : body;
    const b = box(w, heights[i]!, d, mat, (i % 2) * 0.012, y + heights[i]! / 2, 0);
    b.rotation.y = (i - 1) * 0.09;
    g.add(b);
    y += heights[i]!;
  }
  return g;
};

export const candleHolder: ModelBuilder = (ctx) => {
  const body = ctx.get('body');
  const candle = ctx.get('candle');
  const g = group([]);
  for (let i = 0; i < 3; i++) {
    const x = -0.09 + i * 0.09;
    const h = 0.12 + (i === 1 ? 0.06 : 0);
    g.add(cyl(0.02, 0.028, 0.02, body, x, 0.01, 0, 12));
    g.add(cyl(0.011, 0.011, h, candle, x, h / 2 + 0.02, 0, 10));
    g.add(sphere(0.006, ctx.get('bulb_warm'), x, h + 0.03, 0, 6));
  }
  g.add(contactShadow(0.3, 0.14, 0, 0, 0.2));
  return g;
};

export const basketWeave: ModelBuilder = (ctx) => {
  const body = ctx.get('body');
  const g = group([]);
  // tapered basket with rim
  g.add(lathe([
    [0.001, 0], [0.19, 0], [0.21, 0.06], [0.17, 0.42], [0.2, 0.45],
  ], body, 28));
  // rope drop handles
  for (const sx of [-1, 1] as const) {
    const handle = cyl(0.008, 0.008, 0.16, ctx.get('rope'), sx * 0.2, 0.3, 0, 8);
    handle.rotation.z = Math.PI / 2;
    g.add(handle);
  }
  return g;
};
