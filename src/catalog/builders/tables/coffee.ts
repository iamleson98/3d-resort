/** Coffee & side table builders — rect stone top, round drum, pebble. */
import type { ModelBuilder } from '../shared/context';
import { box, roundedBox, cyl, group, contactShadow } from '../shared/primitives';

export const coffeeTableRect: ModelBuilder = (ctx) => {
  const top = ctx.get('top');
  const frame = ctx.get('frame');
  const g = group([]);
  g.add(roundedBox(1.3, 0.05, 0.7, 0.015, top, 0, 0.38, 0));
  // tapered timber base
  g.add(box(1.0, 0.06, 0.5, frame, 0, 0.08, 0));
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    g.add(cyl(0.03, 0.045, 0.26, frame, sx * 0.44, 0.25, sz * 0.2, 12));
  }
  g.add(contactShadow(1.4, 0.8, 0, 0, 0.3));
  return g;
};

export const coffeeTableRound: ModelBuilder = (ctx) => {
  const top = ctx.get('top');
  const frame = ctx.get('frame');
  const g = group([]);
  g.add(cyl(0.45, 0.45, 0.05, top, 0, 0.4, 0, 40));
  g.add(cyl(0.3, 0.38, 0.34, frame, 0, 0.2, 0, 32));
  g.add(cyl(0.36, 0.36, 0.03, frame, 0, 0.02, 0, 32));
  g.add(contactShadow(1.0, 1.0, 0, 0, 0.3));
  return g;
};

export const sideTable: ModelBuilder = (ctx) => {
  const top = ctx.get('top');
  const frame = ctx.get('frame');
  const g = group([]);
  g.add(cyl(0.225, 0.225, 0.04, top, 0, 0.53, 0, 32));
  g.add(cyl(0.16, 0.2, 0.48, frame, 0, 0.27, 0, 28));
  g.add(contactShadow(0.55, 0.55, 0, 0, 0.28));
  return g;
};

export const barCart: ModelBuilder = (ctx) => {
  const top = ctx.get('top');
  const frame = ctx.get('frame');
  const g = group([]);
  // two glass/marble shelves
  g.add(box(0.8, 0.02, 0.45, top, 0, 0.76, 0));
  g.add(box(0.8, 0.02, 0.45, top, 0, 0.36, 0));
  // brass frame + castors
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    g.add(cyl(0.012, 0.012, 0.76, frame, sx * 0.37, 0.38, sz * 0.2, 8));
    g.add(cyl(0.03, 0.03, 0.04, frame, sx * 0.37, 0.02, sz * 0.2, 10));
  }
  g.add(contactShadow(0.9, 0.55, 0, 0, 0.26));
  return g;
};
