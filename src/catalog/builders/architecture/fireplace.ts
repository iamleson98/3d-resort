/** Architecture builders — fireplace with glowing embers. */
import type { ModelBuilder } from '../shared/context';
import { box, roundedBox, cyl, group, contactShadow } from '../shared/primitives';

export const fireplace: ModelBuilder = (ctx) => {
  const body = ctx.get('body');
  const mantel = ctx.get('mantel');
  const fire = ctx.get('fire');
  const g = group([]);
  const W = 1.6;
  const H = 1.4;
  // stone surround
  g.add(box(W, H, 0.5, body, 0, H / 2, 0));
  // firebox opening
  g.add(box(0.9, 0.7, 0.4, ctx.get('paint_charcoal'), 0, 0.45, 0.06));
  // glowing embers
  g.add(box(0.8, 0.06, 0.3, fire, 0, 0.14, 0.1));
  for (let i = 0; i < 5; i++) {
    const ember = cyl(0.02, 0.03, 0.1 + (i % 3) * 0.05, fire, -0.3 + i * 0.15, 0.2, 0.1, 6);
    ember.rotation.z = 0.6;
    g.add(ember);
  }
  // floating mantel
  g.add(roundedBox(W + 0.2, 0.08, 0.6, 0.02, mantel, 0, H + 0.04, 0.04));
  // hearth stone
  g.add(box(W - 0.2, 0.04, 0.8, body, 0, 0.02, 0.2));
  g.add(contactShadow(W + 0.2, 1.0, 0, 0.1, 0.32));
  return g;
};
