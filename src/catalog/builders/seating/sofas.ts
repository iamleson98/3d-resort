/** Sofa builders — 3-seat, compact love seat (same silhouette, scaled). */
import type { ModelBuilder } from '../shared/context';
import { box, roundedBox, cyl, group, contactShadow } from '../shared/primitives';

export const sofa3Seat: ModelBuilder = (ctx) => {
  const compact = ctx.params.compact === true;
  const frame = ctx.get('frame');
  const up = ctx.get('upholstery');
  const feet = ctx.get('feet');
  const W = compact ? 1.55 : 2.3;
  const D = 0.95;
  const seatH = 0.34;
  const g = group([]);

  // timber plinth + legs
  g.add(box(W - 0.12, 0.1, D - 0.14, frame, 0, 0.16, 0));
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    g.add(cyl(0.03, 0.036, 0.12, feet, (sx * (W - 0.3)) / 2, 0.06, (sz * (D - 0.3)) / 2, 12));
  }
  // seat cushions
  const seats = compact ? 2 : 3;
  const seatW = (W - 0.16) / seats;
  for (let i = 0; i < seats; i++) {
    const x = -W / 2 + 0.08 + seatW / 2 + i * seatW;
    g.add(roundedBox(seatW - 0.02, 0.16, D - 0.24, 0.055, up, x, seatH, 0.03));
  }
  // back cushions
  for (let i = 0; i < seats; i++) {
    const x = -W / 2 + 0.08 + seatW / 2 + i * seatW;
    const back = group([roundedBox(seatW - 0.03, 0.42, 0.14, 0.06, up, 0, 0, 0)], x, 0.5, -D / 2 + 0.18);
    back.rotation.x = -0.12;
    g.add(back);
  }
  // frame arms
  for (const sx of [-1, 1] as const) {
    g.add(roundedBox(0.14, 0.4, D - 0.16, 0.05, up, (sx * (W - 0.14)) / 2, 0.44, 0.02));
    g.add(box(0.16, 0.05, D - 0.2, frame, (sx * (W - 0.12)) / 2, 0.26, 0.02));
  }
  g.add(contactShadow(W + 0.14, D + 0.12));
  return g;
};

export const benchUpholstered: ModelBuilder = (ctx) => {
  const frame = ctx.get('frame');
  const up = ctx.get('upholstery');
  const g = group([]);
  g.add(roundedBox(1.5, 0.14, 0.45, 0.05, up, 0, 0.42, 0));
  for (const sx of [-1, 1] as const) {
    g.add(box(0.06, 0.36, 0.4, frame, sx * 0.66, 0.18, 0));
  }
  g.add(contactShadow(1.62, 0.56, 0, 0, 0.3));
  return g;
};

export const benchWood: ModelBuilder = (ctx) => {
  const frame = ctx.get('frame');
  const g = group([]);
  for (let i = 0; i < 5; i++) {
    g.add(box(1.6, 0.035, 0.07, frame, 0, 0.44, -0.16 + i * 0.08));
  }
  for (const sx of [-1, 1] as const) {
    g.add(box(0.05, 0.08, 0.34, frame, sx * 0.7, 0.4, 0));
    for (let i = 0; i < 2; i++) {
      g.add(box(0.05, 0.44, 0.05, frame, sx * 0.7, 0.22, -0.13 + i * 0.26));
    }
  }
  g.add(contactShadow(1.7, 0.5, 0, 0, 0.28));
  return g;
};
