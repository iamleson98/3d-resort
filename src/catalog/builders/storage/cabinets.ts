/** Storage builders — cabinets (side/credenza), media console, bar cabinet. */
import type { ModelBuilder } from '../shared/context';
import { box, cyl, group, contactShadow } from '../shared/primitives';

export const cabinetSide: ModelBuilder = (ctx) => {
  const wide = ctx.params.wide === true;
  const body = ctx.get('body');
  const top = ctx.get('top');
  const panel = ctx.get('panel');
  const g = group([]);
  const W = wide ? 2.0 : 1.2;
  const H = wide ? 0.72 : 0.85;
  const D = wide ? 0.5 : 0.45;
  g.add(box(W, H - 0.06, D, body, 0, H / 2, 0));
  g.add(box(W + 0.04, 0.05, D + 0.04, top, 0, H - 0.03, 0));
  // tambour / cane doors
  const doors = wide ? 3 : 2;
  for (let i = 0; i < doors; i++) {
    const x = -W / 2 + 0.06 + (i * (W - 0.12)) / doors + (W - 0.12) / doors / 2 - (W - 0.12) / doors / 2;
    g.add(box((W - 0.16) / doors - 0.02, H - 0.22, 0.015, panel, x, H / 2, D / 2));
  }
  // brass pulls
  for (let i = 0; i < doors; i++) {
    const x = -W / 2 + 0.08 + (i * (W - 0.12)) / doors + (W - 0.12) / doors / 2 - (W - 0.12) / doors / 2;
    g.add(cyl(0.01, 0.01, 0.14, top, x, H / 2, D / 2 + 0.02, 8));
  }
  // legs
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    g.add(cyl(0.018, 0.024, 0.08, body, (sx * (W - 0.2)) / 2, 0.04, (sz * (D - 0.2)) / 2, 8));
  }
  g.add(contactShadow(W + 0.12, D + 0.12, 0, 0, 0.3));
  return g;
};

export const tvConsole: ModelBuilder = (ctx) => {
  const body = ctx.get('body');
  const panel = ctx.get('panel');
  const top = ctx.get('top');
  const g = group([]);
  const W = 1.8;
  const H = 0.5;
  const D = 0.42;
  g.add(box(W, H - 0.08, D, body, 0, H / 2, 0));
  g.add(box(W + 0.02, 0.04, D + 0.02, top, 0, H - 0.04, 0));
  for (const sx of [-1, 1] as const) {
    g.add(box(0.78, H - 0.2, 0.015, panel, sx * 0.42, H / 2, D / 2));
  }
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    g.add(cyl(0.016, 0.022, 0.1, body, (sx * (W - 0.24)) / 2, 0.05, (sz * (D - 0.2)) / 2, 8));
  }
  g.add(contactShadow(W + 0.12, D + 0.12, 0, 0, 0.28));
  return g;
};

export const barCabinet: ModelBuilder = (ctx) => {
  const body = ctx.get('body');
  const accent = ctx.get('accent');
  const g = group([]);
  const W = 1.0;
  const H = 1.25;
  const D = 0.42;
  g.add(box(W, H - 0.1, D, body, 0, H / 2, 0));
  // mirrored back + drop front
  g.add(box(W - 0.14, H - 0.4, 0.012, ctx.get('mirror'), 0, H / 2 + 0.06, -D / 2 + 0.03));
  g.add(box(W - 0.1, 0.05, 0.02, accent, 0, H - 0.16, D / 2));
  // bottle rails
  for (let i = 0; i < 2; i++) {
    g.add(cyl(0.008, 0.008, W - 0.2, accent, 0, 0.5 + i * 0.3, 0, 8));
  }
  g.add(contactShadow(W + 0.1, D + 0.12, 0, 0, 0.3));
  return g;
};
