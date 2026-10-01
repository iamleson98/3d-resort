/** Outdoor builders — patio table & chair, grand planter, fire pit. */
import type { ModelBuilder } from '../shared/context';
import { box, roundedBox, cyl, sphere, group, contactShadow } from '../shared/primitives';
import { lathe } from '../shared/primitives';

export const outdoorTable: ModelBuilder = (ctx) => {
  const top = ctx.get('top');
  const frame = ctx.get('frame');
  const g = group([]);
  // slatted top
  for (let i = 0; i < 7; i++) {
    g.add(box(1.8, 0.04, 0.1, top, 0, 0.74, -0.4 + i * 0.135));
  }
  // pedestal base
  g.add(cyl(0.06, 0.08, 0.66, frame, 0, 0.37, 0, 16));
  g.add(cyl(0.3, 0.34, 0.05, frame, 0, 0.025, 0, 24));
  g.add(contactShadow(1.9, 1.0, 0, 0, 0.3));
  return g;
};

export const outdoorChair: ModelBuilder = (ctx) => {
  const frame = ctx.get('frame');
  const weave = ctx.get('weave');
  const g = group([]);
  // frame legs + arms
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    g.add(cyl(0.02, 0.026, 0.45, frame, sx * 0.26, 0.23, sz * 0.27, 10));
  }
  for (const sx of [-1, 1] as const) {
    g.add(cyl(0.02, 0.02, 0.34, frame, sx * 0.26, 0.56, -0.27, 10));
  }
  // rope-weave seat + back
  for (let i = 0; i < 5; i++) {
    g.add(box(0.5, 0.018, 0.05, weave, 0, 0.45, -0.18 + i * 0.09));
  }
  for (let j = 0; j < 3; j++) {
    g.add(box(0.5, 0.06, 0.02, weave, 0, 0.56 + j * 0.09, -0.26));
  }
  g.add(contactShadow(0.62, 0.66, 0, 0, 0.28));
  return g;
};

export const planterLarge: ModelBuilder = (ctx) => {
  const body = ctx.get('body');
  const soil = ctx.get('soil');
  const g = group([]);
  g.add(lathe([[0.001, 0], [0.37, 0], [0.38, 0.1], [0.33, 0.62], [0.36, 0.68]], body, 32));
  g.add(cyl(0.31, 0.31, 0.03, soil, 0, 0.6, 0, 28));
  return g;
};

export const firepit: ModelBuilder = (ctx) => {
  const body = ctx.get('body');
  const fire = ctx.get('fire');
  const g = group([]);
  // low bowl
  g.add(lathe([[0.001, 0], [0.45, 0], [0.48, 0.08], [0.42, 0.36], [0.46, 0.4]], body, 32));
  // fire bed + flames
  g.add(cyl(0.36, 0.36, 0.04, fire, 0, 0.28, 0, 28));
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const flame = sphere(0.07 + (i % 2) * 0.03, fire, Math.cos(a) * 0.12, 0.38, Math.sin(a) * 0.12, 10);
    flame.scale.y = 1.8;
    g.add(flame);
  }
  g.add(contactShadow(1.1, 1.1, 0, 0, 0.3));
  void roundedBox;
  return g;
};
