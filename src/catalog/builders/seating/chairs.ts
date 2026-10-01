/** Chair builders — dining chair, bar stool. */
import type { ModelBuilder } from '../shared/context';
import { box, roundedBox, cyl, cylX, group, contactShadow } from '../shared/primitives';

export const diningChair: ModelBuilder = (ctx) => {
  const frame = ctx.get('frame');
  const seat = ctx.get('upholstery');
  const cane = ctx.get('cane');
  const g = group([]);
  // four tapered legs
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    g.add(cyl(0.02, 0.028, 0.46, frame, sx * 0.2, 0.23, sz * 0.21, 10));
  }
  // seat pad
  g.add(roundedBox(0.46, 0.05, 0.48, 0.02, seat, 0, 0.465, 0));
  // woven cane back panel
  g.add(box(0.42, 0.34, 0.02, cane, 0, 0.68, -0.21));
  // back frame
  for (const sx of [-1, 1] as const) {
    g.add(box(0.035, 0.36, 0.035, frame, sx * 0.22, 0.68, -0.21));
  }
  g.add(box(0.47, 0.035, 0.035, frame, 0, 0.85, -0.21));
  g.add(contactShadow(0.56, 0.6, 0, 0, 0.26));
  return g;
};

export const barStool: ModelBuilder = (ctx) => {
  const frame = ctx.get('frame');
  const seat = ctx.get('seat');
  const feet = ctx.get('feet');
  const H = 1.05;
  const g = group([]);
  // legs splayed
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    const leg = cyl(0.018, 0.024, H - 0.06, frame, sx * 0.15, H / 2, sz * 0.15, 10);
    leg.rotation.x = sz * 0.06;
    leg.rotation.z = -sx * 0.06;
    g.add(leg);
  }
  // shaped seat
  g.add(roundedBox(0.38, 0.05, 0.36, 0.03, seat, 0, H, 0));
  // footrest ring
  g.add(cylX(0.012, 0.012, 0.34, feet, 0, 0.28, 0.15));
  g.add(cylX(0.012, 0.012, 0.34, feet, 0, 0.28, -0.15));
  g.add(contactShadow(0.46, 0.46, 0, 0, 0.3));
  return g;
};
