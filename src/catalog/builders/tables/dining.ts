/** Dining, console and desk builders. */
import type { ModelBuilder } from '../shared/context';
import { box, roundedBox, cyl, group, contactShadow } from '../shared/primitives';

export const diningTable: ModelBuilder = (ctx) => {
  const top = ctx.get('top');
  const frame = ctx.get('frame');
  const g = group([]);
  g.add(roundedBox(2.6, 0.06, 1.1, 0.02, top, 0, 0.74, 0));
  // breadboard ends hint
  g.add(box(2.62, 0.03, 0.06, frame, 0, 0.73, 0.5));
  g.add(box(2.62, 0.03, 0.06, frame, 0, 0.73, -0.5));
  // trestle legs
  for (const sx of [-1, 1] as const) {
    g.add(box(0.1, 0.68, 0.9, frame, sx * 1.0, 0.36, 0));
    g.add(box(0.3, 0.06, 1.0, frame, sx * 1.0, 0.03, 0));
  }
  g.add(contactShadow(2.72, 1.2, 0, 0, 0.3));
  return g;
};

export const consoleTable: ModelBuilder = (ctx) => {
  const top = ctx.get('top');
  const frame = ctx.get('frame');
  const g = group([]);
  g.add(roundedBox(1.4, 0.045, 0.4, 0.012, top, 0, 0.83, 0));
  g.add(box(1.2, 0.28, 0.04, frame, 0, 0.66, -0.12));
  for (const sx of [-1, 1] as const) {
    g.add(box(0.05, 0.8, 0.05, frame, sx * 0.62, 0.4, 0.14));
    g.add(box(0.05, 0.8, 0.05, frame, sx * 0.62, 0.4, -0.14));
  }
  g.add(contactShadow(1.5, 0.5, 0, 0, 0.28));
  return g;
};

export const deskWriting: ModelBuilder = (ctx) => {
  const top = ctx.get('top');
  const frame = ctx.get('frame');
  const accent = ctx.get('accent');
  const g = group([]);
  g.add(roundedBox(1.35, 0.05, 0.65, 0.015, top, 0, 0.74, 0));
  // leather inlay
  g.add(box(1.0, 0.008, 0.4, accent, 0, 0.766, 0.02));
  // twin drawers
  for (const sx of [-1, 1] as const) {
    g.add(box(0.42, 0.16, 0.55, frame, sx * 0.4, 0.62, 0));
    g.add(cyl(0.012, 0.012, 0.03, ctx.get('accent'), sx * 0.4, 0.62, 0.3, 10));
  }
  // legs
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    g.add(cyl(0.026, 0.034, 0.58, frame, sx * 0.6, 0.32, sz * 0.26, 10));
  }
  g.add(contactShadow(1.45, 0.75, 0, 0, 0.3));
  return g;
};
