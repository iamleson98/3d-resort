/** Bedroom case goods — dresser, wardrobe. */
import type { ModelBuilder } from '../shared/context';
import { box, cyl, group, contactShadow } from '../shared/primitives';

export const dresser: ModelBuilder = (ctx) => {
  const body = ctx.get('body');
  const top = ctx.get('top');
  const knob = ctx.get('knob');
  const g = group([]);
  g.add(box(1.6, 0.72, 0.5, body, 0, 0.44, 0));
  g.add(box(1.64, 0.04, 0.54, top, 0, 0.82, 0));
  // six fluted drawers
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 2; col++) {
      const x = -0.4 + col * 0.8;
      const y = 0.18 + row * 0.22;
      for (let f = 0; f < 6; f++) {
        g.add(box(0.68, 0.012, 0.02, knob, x + f * 0.006, y + f * 0.006 - 0.03, 0.255));
      }
      g.add(cyl(0.012, 0.012, 0.03, knob, x, y, 0.27, 10));
    }
  }
  // legs
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    g.add(cyl(0.02, 0.026, 0.1, body, sx * 0.7, 0.05, sz * 0.18, 8));
  }
  g.add(contactShadow(1.7, 0.6, 0, 0, 0.3));
  return g;
};

export const wardrobe: ModelBuilder = (ctx) => {
  const body = ctx.get('body');
  const panel = ctx.get('panel');
  const knob = ctx.get('knob');
  const H = 2.1;
  const g = group([]);
  g.add(box(1.5, H - 0.06, 0.62, body, 0, H / 2, 0));
  // cane doors
  for (const sx of [-1, 1] as const) {
    g.add(box(0.68, H - 0.3, 0.015, panel, sx * 0.36, H / 2, 0.32));
    g.add(cyl(0.014, 0.014, 0.22, knob, sx * 0.05, H / 2, 0.335, 10));
  }
  // interior light rail glow line
  g.add(box(1.3, 0.015, 0.02, ctx.get('knob'), 0, H - 0.1, 0.315));
  g.add(box(1.56, 0.05, 0.66, body, 0, 0.025, 0));
  g.add(contactShadow(1.6, 0.7, 0, 0, 0.3));
  return g;
};
