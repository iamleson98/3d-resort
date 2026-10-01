/** Floor / table / wall lighting builders. */
import type { ModelBuilder } from '../shared/context';
import { box, roundedBox, cyl, sphere, group, tube, contactShadow, lampLight } from '../shared/primitives';

export const floorLampArc: ModelBuilder = (ctx) => {
  const body = ctx.get('body');
  const shade = ctx.get('shade');
  const bulb = ctx.get('bulb');
  const g = group([]);
  g.add(cyl(0.16, 0.18, 0.03, body, 0, 0.015, 0, 24));
  // arc stem
  g.add(tube([
    [0, 0.02, 0],
    [0.01, 0.9, 0],
    [0.35, 1.55, 0],
    [0.68, 1.62, 0],
  ], 0.014, body));
  // conical shade at the arc tip
  const shadeMesh = cyl(0.07, 0.16, 0.18, shade, 0.68, 1.52, 0, 20);
  shadeMesh.rotation.z = 0.3;
  g.add(shadeMesh);
  g.add(sphere(0.045, bulb, 0.7, 1.46, 0, 12));
  g.add(lampLight(5, 3.6, 0.7, 1.44, 0));
  g.add(contactShadow(0.4, 0.4, 0, 0, 0.24));
  return g;
};

export const floorLampColumn: ModelBuilder = (ctx) => {
  const body = ctx.get('body');
  const core = ctx.get('core');
  const g = group([]);
  // rectangular lantern with glowing core
  g.add(box(0.35, 1.4, 0.35, core, 0, 0.78, 0));
  for (const sx of [-1, 1] as const) {
    g.add(box(0.02, 1.5, 0.02, body, sx * 0.18, 0.75, 0.18));
    g.add(box(0.02, 1.5, 0.02, body, sx * 0.18, 0.75, -0.18));
    g.add(box(0.4, 0.03, 0.4, body, 0, 1.5, 0));
  }
  g.add(box(0.42, 0.04, 0.42, body, 0, 0.04, 0));
  g.add(lampLight(4.5, 3.4, 0, 0.85, 0));
  g.add(contactShadow(0.5, 0.5, 0, 0, 0.26));
  return g;
};

export const tableLamp: ModelBuilder = (ctx) => {
  const body = ctx.get('body');
  const shade = ctx.get('shade');
  const g = group([]);
  // ceramic base profile
  g.add(cyl(0.05, 0.09, 0.12, body, 0, 0.06, 0, 20));
  g.add(cyl(0.07, 0.05, 0.14, body, 0, 0.19, 0, 20));
  g.add(cyl(0.012, 0.012, 0.14, body, 0, 0.33, 0, 8));
  // tapered linen shade
  g.add(cyl(0.1, 0.14, 0.18, shade, 0, 0.48, 0, 24));
  g.add(lampLight(3, 2.8, 0, 0.46, 0));
  g.add(roundedBox(0.01, 0.01, 0.01, 0.002, body, 0, 0, 0));
  return g;
};

export const wallSconce: ModelBuilder = (ctx) => {
  const body = ctx.get('body');
  const shade = ctx.get('shade');
  const bulb = ctx.get('bulb');
  const g = group([]);
  // wall plate
  g.add(box(0.08, 0.2, 0.02, body, 0, 0.1, 0));
  // arm
  g.add(cyl(0.012, 0.012, 0.16, body, 0.08, 0.16, 0.06, 8));
  // pivoting shade
  const shadeMesh = cyl(0.035, 0.09, 0.14, shade, 0.16, 0.16, 0.1, 16);
  shadeMesh.rotation.z = 0.9;
  g.add(shadeMesh);
  g.add(sphere(0.03, bulb, 0.2, 0.12, 0.1, 10));
  g.add(lampLight(2.4, 2.4, 0.2, 0.14, 0.12));
  return g;
};
