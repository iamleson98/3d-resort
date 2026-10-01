/** Architecture builders — screens, glazing, doors, columns, arches. */
import type { ModelBuilder } from '../shared/context';
import { box, cyl, group, contactShadow } from '../shared/primitives';
import { mesh } from '../shared/primitives';
import * as THREE from 'three/webgpu';

export const partitionScreen: ModelBuilder = (ctx) => {
  const frame = ctx.get('frame');
  const panel = ctx.get('panel');
  const g = group([]);
  for (let i = 0; i < 3; i++) {
    const x = -0.52 + i * 0.52;
    const hinge = group([
      box(0.5, 1.85, 0.03, frame, 0, 0.92, 0),
      box(0.42, 1.55, 0.012, panel, 0, 0.92, 0.02),
    ], x, 0, 0);
    hinge.rotation.y = (i - 1) * -0.28;
    g.add(hinge);
  }
  g.add(contactShadow(1.75, 0.5, 0, 0, 0.26));
  return g;
};

export const windowWall: ModelBuilder = (ctx) => {
  const glass = ctx.get('glass');
  const frame = ctx.get('frame');
  const g = group([]);
  const W = 2.4;
  const H = 2.6;
  // slim mullion grid + glazing
  g.add(mesh(new THREE.BoxGeometry(W, H, 0.02), glass, 0, H / 2, 0));
  g.add(box(W, 0.07, 0.08, frame, 0, 0.035, 0));
  g.add(box(W, 0.07, 0.08, frame, 0, H - 0.035, 0));
  for (const sx of [-1, 1] as const) {
    g.add(box(0.07, H, 0.08, frame, (sx * W) / 2, H / 2, 0));
  }
  for (const sx of [-0.6, 0.6]) {
    g.add(box(0.05, H, 0.06, frame, sx, H / 2, 0));
  }
  g.add(box(W, 0.05, 0.06, frame, 0, H * 0.62, 0));
  return g;
};

export const doorPanel: ModelBuilder = (ctx) => {
  const body = ctx.get('body');
  const pull = ctx.get('pull');
  const g = group([]);
  const H = 2.3;
  g.add(box(1.0, H, 0.06, body, 0, H / 2, 0));
  // long brass pull
  g.add(box(0.03, 0.8, 0.03, pull, 0.38, H / 2, 0.06));
  g.add(box(0.03, 0.8, 0.03, pull, 0.38, H / 2, -0.06));
  return g;
};

export const columnClassic: ModelBuilder = (ctx) => {
  const body = ctx.get('body');
  const g = group([]);
  const H = 2.8;
  g.add(box(0.5, 0.1, 0.5, body, 0, 0.05, 0));
  // fluted shaft (thin cylinders around core)
  g.add(cyl(0.18, 0.2, H - 0.4, body, 0, H / 2, 0, 20));
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const flute = cyl(0.015, 0.015, H - 0.45, body, Math.cos(a) * 0.2, H / 2, Math.sin(a) * 0.2, 6);
    g.add(flute);
  }
  // capital
  g.add(cyl(0.24, 0.18, 0.14, body, 0, H - 0.14, 0, 20));
  g.add(box(0.52, 0.08, 0.52, body, 0, H - 0.04, 0));
  return g;
};

export const archWay: ModelBuilder = (ctx) => {
  const body = ctx.get('body');
  const g = group([]);
  const W = 1.4;
  const H = 2.5;
  for (const sx of [-1, 1] as const) {
    g.add(box(0.3, H - 0.7, 0.3, body, (sx * W) / 2, (H - 0.7) / 2, 0));
  }
  // arched header — extruded shape with circular top
  const shape = new THREE.Shape();
  const hw = W / 2;
  shape.moveTo(-hw, 0);
  shape.lineTo(-hw, 0.35);
  shape.absarc(0, 0.35, hw, Math.PI, 0, true);
  shape.lineTo(hw, 0);
  shape.lineTo(hw, -0.12);
  shape.lineTo(-hw, -0.12);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.3, bevelEnabled: false });
  geo.translate(0, 0, -0.15);
  g.add(mesh(geo, body, 0, H - 0.7, 0));
  return g;
};
