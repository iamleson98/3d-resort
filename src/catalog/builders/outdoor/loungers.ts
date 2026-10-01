/** Outdoor builders — sun lounger, canopy daybed, beach umbrella. */
import type { ModelBuilder } from '../shared/context';
import { box, roundedBox, cyl, group, contactShadow } from '../shared/primitives';
export const loungeSunbed: ModelBuilder = (ctx) => {
  const frame = ctx.get('frame');
  const up = ctx.get('upholstery');
  const g = group([]);
  // teak frame
  g.add(box(0.72, 0.05, 1.95, frame, 0, 0.3, 0));
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    g.add(box(0.05, 0.28, 0.05, frame, sx * 0.32, 0.14, sz * 0.85));
  }
  // cushion + backrest tilt
  g.add(roundedBox(0.66, 0.09, 1.2, 0.04, up, 0, 0.37, 0.3));
  const back = group([roundedBox(0.66, 0.09, 0.62, 0.04, up, 0, 0, 0)], 0, 0.37, -0.62);
  back.rotation.x = -0.6;
  g.add(back);
  // pull-out side tray
  g.add(box(0.28, 0.03, 0.4, frame, 0.45, 0.32, 0.45));
  g.add(contactShadow(0.95, 2.1, 0, 0, 0.3));
  return g;
};

export const daybedCanopy: ModelBuilder = (ctx) => {
  const frame = ctx.get('frame');
  const up = ctx.get('upholstery');
  const canopy = ctx.get('canopy');
  const g = group([]);
  // curved daybed base
  g.add(roundedBox(2.1, 0.32, 1.1, 0.08, up, 0, 0.3, 0));
  for (let i = 0; i < 5; i++) {
    g.add(cyl(0.03, 0.03, 0.1, frame, -0.8 + i * 0.4, 0.05, 0.45, 10));
    g.add(cyl(0.03, 0.03, 0.1, frame, -0.8 + i * 0.4, 0.05, -0.45, 10));
  }
  // scatter cushions
  g.add(roundedBox(0.45, 0.4, 0.14, 0.06, up, -0.7, 0.62, -0.32));
  g.add(roundedBox(0.45, 0.4, 0.14, 0.06, up, 0.6, 0.62, -0.32));
  // canopy posts + hoisted drape
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    g.add(cyl(0.025, 0.03, 1.55, frame, sx * 0.95, 0.8, sz * 0.5, 10));
  }
  const drape = roundedBox(2.3, 0.02, 1.3, 0.01, canopy, 0, 1.58, 0);
  drape.rotation.z = 0.06;
  g.add(drape);
  g.add(contactShadow(2.2, 1.2, 0, 0, 0.3));
  return g;
};

export const umbrellaBeach: ModelBuilder = (ctx) => {
  const canopy = ctx.get('canopy');
  const pole = ctx.get('pole');
  const g = group([]);
  // tilted mast
  const mast = cyl(0.035, 0.045, 2.4, pole, 0.1, 1.2, 0, 12);
  mast.rotation.z = -0.12;
  g.add(mast);
  // ribbed canopy
  const top = cyl(0.03, 1.0, 0.45, canopy, 0.1, 2.2, 0, 16);
  top.rotation.z = -0.12;
  g.add(top);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const rib = cyl(0.012, 0.012, 0.9, pole, 0.1 + Math.cos(a) * 0.42, 2.1, Math.sin(a) * 0.42, 6);
    rib.rotation.z = -0.12;
    rib.rotation.y = -a;
    g.add(rib);
  }
  // weighted base
  g.add(cyl(0.22, 0.28, 0.08, pole, 0.25, 0.04, 0, 20));
  g.add(contactShadow(0.7, 0.7, 0.15, 0, 0.3));
  return g;
};
