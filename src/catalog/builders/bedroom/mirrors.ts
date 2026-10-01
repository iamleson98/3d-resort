/** Bedroom mirrors + vanity builders. */
import type { ModelBuilder } from '../shared/context';
import { box, cyl, cylZ, torus, group, contactShadow } from '../shared/primitives';
import { mesh } from '../shared/primitives';
import * as THREE from 'three/webgpu';

export const mirrorFloor: ModelBuilder = (ctx) => {
  const frame = ctx.get('frame');
  const mirror = ctx.get('mirror');
  const g = group([]);
  g.add(box(0.7, 1.8, 0.05, frame, 0, 0.9, 0));
  g.add(mesh(new THREE.PlaneGeometry(0.6, 1.7), mirror, 0, 0.9, 0.027));
  // lean angle
  g.rotation.x = 0.0;
  g.add(contactShadow(0.8, 0.35, 0, -0.05, 0.24));
  return g;
};

export const mirrorWall: ModelBuilder = (ctx) => {
  const frame = ctx.get('frame');
  const mirror = ctx.get('mirror');
  const g = group([]);
  // arch: rectangle + half circle top
  g.add(box(0.75, 0.7, 0.05, frame, 0, 0.35, 0));
  g.add(cyl(0.375, 0.375, 0.05, frame, 0, 0.7, 0, 32));
  g.add(mesh(new THREE.PlaneGeometry(0.65, 0.6), mirror, 0, 0.35, 0.027));
  g.add(mesh(new THREE.CircleGeometry(0.325, 32), mirror, 0, 0.7, 0.027));
  return g;
};

export const vanityTable: ModelBuilder = (ctx) => {
  const body = ctx.get('body');
  const top = ctx.get('top');
  const frame = ctx.get('frame');
  const g = group([]);
  g.add(box(1.0, 0.04, 0.45, top, 0, 0.75, 0));
  g.add(box(0.94, 0.18, 0.4, body, 0, 0.64, 0));
  // tilting oval mirror
  const ring = torus(0.3, 0.018, frame, 0, 1.15, 0);
  ring.rotation.y = Math.PI / 2;
  g.add(ring);
  const glass = mesh(new THREE.CircleGeometry(0.285, 32), ctx.get('mirror'), 0, 1.15, 0);
  glass.rotation.y = Math.PI / 2;
  g.add(glass);
  // tripod legs
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    g.add(cyl(0.018, 0.024, 0.58, frame, sx * 0.42, 0.4, sz * 0.14, 10));
  }
  g.add(contactShadow(1.1, 0.55, 0, 0, 0.28));
  void cylZ;
  return g;
};
