/** Lounge seating builders — armchair, slipper chair, chaise, pouf. */
import type { ModelBuilder } from '../shared/context';
import { box, roundedBox, cyl, group, contactShadow } from '../shared/primitives';

export const loungeArmchair: ModelBuilder = (ctx) => {
  const frame = ctx.get('frame');
  const up = ctx.get('upholstery');
  const feet = ctx.get('feet');
  const W = 0.86;
  const D = 0.9;
  const g = group([]);
  // legs
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    g.add(cyl(0.025, 0.03, 0.16, feet, (sx * W) / 2 - 0.06 * sx, 0.08, (sz * D) / 2 - 0.06 * sz, 10));
  }
  // base frame + seat
  g.add(box(W - 0.1, 0.08, D - 0.12, frame, 0, 0.2, 0));
  g.add(roundedBox(W - 0.12, 0.14, D - 0.16, 0.05, up, 0, 0.31, 0.02));
  // curved back (stacked segments)
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    const wq = (W - 0.12) * (0.62 + 0.38 * Math.sin(t * Math.PI * 0.55));
    g.add(roundedBox(wq, 0.1, 0.1, 0.045, up, 0, 0.4 + i * 0.085, -D / 2 + 0.09 + t * 0.08));
  }
  // armrests
  for (const sx of [-1, 1] as const) {
    g.add(roundedBox(0.09, 0.06, D - 0.2, 0.03, up, (sx * (W - 0.1)) / 2, 0.43, 0.04));
    g.add(box(0.05, 0.1, 0.05, frame, (sx * (W - 0.1)) / 2, 0.36, 0.2));
    g.add(box(0.05, 0.1, 0.05, frame, (sx * (W - 0.1)) / 2, 0.36, -0.15));
  }
  g.add(contactShadow(W + 0.1, D + 0.1));
  return g;
};

export const slipperChair: ModelBuilder = (ctx) => {
  const frame = ctx.get('frame');
  const up = ctx.get('upholstery');
  const W = 0.62;
  const D = 0.66;
  const g = group([]);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    g.add(cyl(0.02, 0.026, 0.14, frame, (sx * W) / 2 + 0.02 * -sx, 0.07, (sz * D) / 2 + 0.02 * -sz, 10));
  }
  g.add(box(W - 0.08, 0.07, D - 0.1, frame, 0, 0.18, 0));
  g.add(roundedBox(W - 0.1, 0.13, D - 0.14, 0.05, up, 0, 0.28, 0.01));
  // tight back
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    g.add(roundedBox((W - 0.1) * (0.8 + 0.2 * Math.sin(t * 1.4)), 0.09, 0.09, 0.04, up, 0, 0.36 + i * 0.075, -D / 2 + 0.08));
  }
  g.add(contactShadow(W + 0.08, D + 0.08, 0, 0, 0.28));
  return g;
};

export const chaiseLongue: ModelBuilder = (ctx) => {
  const frame = ctx.get('frame');
  const up = ctx.get('upholstery');
  const g = group([]);
  // reclining base
  g.add(box(0.72, 0.06, 1.65, frame, 0, 0.24, 0));
  g.add(roundedBox(0.7, 0.12, 1.3, 0.05, up, 0, 0.33, 0.14));
  // tilted backrest
  const back = group([roundedBox(0.7, 0.12, 0.6, 0.05, up, 0, 0, 0)], 0, 0.34, -0.6);
  back.rotation.x = -0.5;
  g.add(back);
  // legs
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    g.add(box(0.05, 0.22, 0.05, frame, sx * 0.31, 0.11, sz * 0.72));
  }
  g.add(contactShadow(0.9, 1.8, 0, 0, 0.3));
  return g;
};

export const pouf: ModelBuilder = (ctx) => {
  const up = ctx.get('upholstery');
  const g = group([]);
  g.add(roundedBox(0.6, 0.34, 0.6, 0.12, up, 0, 0.18, 0));
  // knitted seam band
  g.add(box(0.62, 0.05, 0.62, up, 0, 0.18, 0));
  g.add(contactShadow(0.7, 0.7, 0, 0, 0.26));
  return g;
};
