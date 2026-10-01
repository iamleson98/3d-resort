/** Pendant builders — dome, cluster, chandelier (ceiling-drop mounted). */
import type { ModelBuilder } from '../shared/context';
import { cyl, sphere, halfSphere, torus, group, tube, lampLight } from '../shared/primitives';

const CEILING = 2.78;

export const pendantDome: ModelBuilder = (ctx) => {
  const shade = ctx.get('shade');
  const body = ctx.get('body');
  const bulb = ctx.get('bulb');
  const g = group([]);
  // drop cord from ceiling to the shade
  g.add(cyl(0.006, 0.006, CEILING - 1.95, body, 0, (CEILING + 1.95) / 2, 0, 6));
  // dome shade (open bottom) at sitting height
  const dome = halfSphere(0.22, shade, 0, 1.95, 0, 28);
  dome.rotation.x = Math.PI;
  g.add(dome);
  // socket + bulb
  g.add(cyl(0.02, 0.02, 0.08, body, 0, 2.07, 0, 12));
  g.add(sphere(0.055, bulb, 0, 1.99, 0, 14));
  g.add(lampLight(5, 4.2, 0, 1.9, 0));
  return g;
};

export const pendantCluster: ModelBuilder = (ctx) => {
  const body = ctx.get('body');
  const shade = ctx.get('shade');
  const bulb = ctx.get('bulb');
  const g = group([]);
  // ceiling canopy
  g.add(cyl(0.07, 0.07, 0.02, body, 0, CEILING, 0, 20));
  const drops: Array<[number, number, number]> = [
    [-0.16, 1.85, -0.1],
    [0.14, 2.05, 0.08],
    [0.02, 1.65, -0.14],
  ];
  for (const [x, y, z] of drops) {
    g.add(cyl(0.005, 0.005, CEILING - y, body, x, (CEILING + y) / 2, z, 6));
    g.add(sphere(0.07, shade, x, y, z, 16));
    g.add(sphere(0.05, bulb, x, y - 0.01, z, 12));
    g.add(lampLight(2.6, 3.2, x, y - 0.04, z));
  }
  return g;
};

export const chandelier: ModelBuilder = (ctx) => {
  const body = ctx.get('body');
  const crystal = ctx.get('crystal');
  const bulb = ctx.get('bulb');
  const g = group([]);
  // stem from ceiling
  g.add(cyl(0.03, 0.03, CEILING - 2.0, body, 0, (CEILING + 2.0) / 2, 0, 10));
  // two rings
  const r1 = torus(0.4, 0.018, body, 0, 2.0, 0);
  r1.rotation.x = Math.PI / 2;
  g.add(r1);
  const r2 = torus(0.22, 0.014, body, 0, 1.76, 0);
  r2.rotation.x = Math.PI / 2;
  g.add(r2);
  // bulbs around rings
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    g.add(sphere(0.035, bulb, Math.cos(a) * 0.4, 2.0, Math.sin(a) * 0.4, 10));
  }
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    g.add(sphere(0.03, bulb, Math.cos(a) * 0.22, 1.76, Math.sin(a) * 0.22, 10));
  }
  // crystal drops
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    g.add(tube([[Math.cos(a) * 0.4, 1.99, Math.sin(a) * 0.4], [Math.cos(a) * 0.42, 1.86, Math.sin(a) * 0.42]], 0.008, crystal));
  }
  // connect rings
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    g.add(tube([[Math.cos(a) * 0.4, 2.0, Math.sin(a) * 0.4], [Math.cos(a + 1) * 0.22, 1.77, Math.sin(a + 1) * 0.22]], 0.006, body));
  }
  // real candle-glow light — the room's evening centerpiece
  g.add(lampLight(9, 5.5, 0, 1.95, 0));
  return g;
};
