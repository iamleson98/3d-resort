/** Storage builders — shelving + bookcases. */
import type { ModelBuilder } from '../shared/context';
import { box, group, contactShadow } from '../shared/primitives';

export const shelfOpen: ModelBuilder = (ctx) => {
  const frame = ctx.get('frame');
  const shelves = ctx.get('shelves');
  const g = group([]);
  const H = 1.9;
  const W = 1.1;
  const D = 0.34;
  for (let i = 0; i < 5; i++) {
    g.add(box(W, 0.035, D, shelves, 0, 0.25 + i * 0.4, 0));
  }
  for (const sx of [-1, 1] as const) {
    g.add(box(0.05, H, D, frame, (sx * W) / 2, H / 2, 0));
  }
  g.add(box(W, 0.05, D, frame, 0, H, 0));
  g.add(contactShadow(W + 0.1, D + 0.12, 0, 0, 0.28));
  return g;
};

export const bookcaseTall: ModelBuilder = (ctx) => {
  const frame = ctx.get('frame');
  const shelves = ctx.get('shelves');
  const g = group([]);
  const H = 2.2;
  const W = 0.9;
  const D = 0.38;
  for (let i = 0; i < 6; i++) {
    g.add(box(W, 0.035, D, shelves, 0, 0.2 + i * 0.38, 0));
  }
  for (const sx of [-1, 1] as const) {
    g.add(box(0.05, H, D, frame, (sx * W) / 2, H / 2, 0));
  }
  g.add(box(W, 0.05, D, frame, 0, H, 0));
  // ladder rail
  g.add(box(W * 0.8, 0.03, 0.03, frame, 0, H + 0.06, 0.1));
  g.add(contactShadow(W + 0.1, D + 0.12, 0, 0, 0.28));
  return g;
};
