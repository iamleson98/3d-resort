/** Bathroom accessories — towel ladder, vessel basin. */
import type { ModelBuilder } from '../shared/context';
import { box, cyl, roundedBox, group, contactShadow } from '../shared/primitives';
import { mesh } from '../shared/primitives';
import * as THREE from 'three/webgpu';

export const towelRack: ModelBuilder = (ctx) => {
  const frame = ctx.get('frame');
  const towels = ctx.get('towels');
  const g = group([]);
  // leaning ladder
  for (let i = 0; i < 4; i++) {
    const y = 0.3 + i * 0.26;
    const z = -0.05 - i * 0.03;
    g.add(box(0.55, 0.035, 0.035, frame, 0, y, z));
    // rolled towel on each rung
    const towel = cyl(0.045, 0.045, 0.44, towels, 0, y + 0.05, z + 0.06, 14);
    towel.rotation.z = Math.PI / 2;
    g.add(towel);
  }
  for (const sx of [-1, 1] as const) {
    const rail = cyl(0.014, 0.014, 1.1, frame, sx * 0.27, 0.55, -0.02, 8);
    rail.rotation.x = 0.12;
    g.add(rail);
  }
  g.add(contactShadow(0.66, 0.4, 0, 0.08, 0.24));
  return g;
};

export const sinkVessel: ModelBuilder = (ctx) => {
  const body = ctx.get('body');
  const fixture = ctx.get('fixture');
  const g = group([]);
  // artisan bowl
  const bowl = mesh(new THREE.SphereGeometry(0.2, 28, 18, 0, Math.PI * 2, Math.PI * 0.24, Math.PI * 0.5), body, 0, 0.2, 0);
  g.add(bowl);
  g.add(cyl(0.21, 0.21, 0.02, body, 0, 0.21, 0, 28));
  // tall gooseneck tap
  g.add(cyl(0.014, 0.018, 0.3, fixture, 0, 0.15, -0.22, 10));
  const neck = cyl(0.011, 0.011, 0.16, fixture, 0, 0.31, -0.15, 8);
  neck.rotation.x = 0.7;
  g.add(neck);
  void roundedBox;
  return g;
};
