/** Bedroom builders — Sanctuary bed (king/queen), nightstand. */
import type { ModelBuilder } from '../shared/context';
import { box, roundedBox, cyl, group, contactShadow } from '../shared/primitives';

export const bedKing: ModelBuilder = (ctx) => {
  const compact = ctx.params.compact === true;
  const frame = ctx.get('frame');
  const up = ctx.get('upholstery');
  const bedding = ctx.get('bedding');
  const W = compact ? 1.6 : 2.0;
  const D = compact ? 2.1 : 2.15;
  const g = group([]);
  // floating plinth
  g.add(box(W - 0.18, 0.14, D - 0.24, frame, 0, 0.16, 0.02));
  // mattress + sheets
  g.add(roundedBox(W - 0.24, 0.22, D - 0.34, 0.06, bedding === undefined ? ctx.get('sheet_white') : bedding, 0, 0.35, 0.03));
  // duvet fold
  g.add(roundedBox(W - 0.26, 0.1, D * 0.55, 0.05, bedding, 0, 0.45, 0.35));
  // pillows
  for (const sx of compact ? [-0.5, 0.5] : [-0.75, -0.25, 0.25, 0.75]) {
    g.add(roundedBox(W * 0.22, 0.12, 0.42, 0.05, ctx.get('mattress'), sx * W * 0.98, 0.47, -D / 2 + 0.42));
  }
  // channel headboard
  const hbH = 1.15;
  g.add(box(W, 0.08, 0.08, frame, 0, 0.05, -D / 2 + 0.02));
  for (let i = 0; i < 7; i++) {
    const x = -W / 2 + 0.12 + (i * (W - 0.24)) / 6;
    for (let j = 0; j < 5; j++) {
      g.add(roundedBox((W - 0.24) / 7 - 0.02, 0.14, 0.07, 0.03, up, x, 0.5 + j * 0.15, -D / 2 + 0.06));
    }
  }
  void hbH;
  g.add(contactShadow(W + 0.12, D + 0.12, 0, 0, 0.32));
  return g;
};

export const nightstand: ModelBuilder = (ctx) => {
  const body = ctx.get('body');
  const top = ctx.get('top');
  const knob = ctx.get('knob');
  const g = group([]);
  g.add(box(0.55, 0.5, 0.42, body, 0, 0.33, 0));
  g.add(box(0.57, 0.03, 0.44, top, 0, 0.585, 0));
  for (let i = 0; i < 2; i++) {
    g.add(box(0.5, 0.006, 0.38, knob, 0, 0.24 + i * 0.2, 0.215));
    g.add(cyl(0.014, 0.014, 0.026, knob, 0, 0.24 + i * 0.2, 0.23, 10));
  }
  // splayed legs
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    g.add(cyl(0.016, 0.02, 0.09, body, sx * 0.22, 0.045, sz * 0.16, 8));
  }
  g.add(contactShadow(0.64, 0.5, 0, 0, 0.28));
  return g;
};
