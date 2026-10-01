/** Bathroom builders — tub, twin vanity, shower screen, WC. */
import type { ModelBuilder } from '../shared/context';
import { box, roundedBox, cyl, sphere, group, contactShadow } from '../shared/primitives';
import { mesh } from '../shared/primitives';
import * as THREE from 'three/webgpu';

export const bathtubFreestanding: ModelBuilder = (ctx) => {
  const body = ctx.get('body');
  const fixture = ctx.get('fixture');
  const g = group([]);
  // oval island tub
  const tub = mesh(new THREE.CylinderGeometry(0.42, 0.36, 0.6, 32), body, 0, 0.3, 0);
  tub.scale.set(1.9, 1, 0.95);
  g.add(tub);
  // inner cavity
  const inner = mesh(new THREE.CylinderGeometry(0.36, 0.32, 0.56, 28), body, 0, 0.33, 0);
  inner.scale.set(1.82, 1, 0.88);
  g.add(inner);
  // floor-standing tap
  g.add(cyl(0.02, 0.025, 0.95, fixture, -0.66, 0.475, 0, 12));
  const spout = cyl(0.012, 0.012, 0.22, fixture, -0.56, 0.95, 0, 8);
  spout.rotation.z = Math.PI / 2;
  g.add(spout);
  g.add(contactShadow(1.95, 1.0, 0, 0, 0.3));
  return g;
};

export const vanityDouble: ModelBuilder = (ctx) => {
  const body = ctx.get('body');
  const top = ctx.get('top');
  const basin = ctx.get('basin');
  const g = group([]);
  g.add(box(1.8, 0.62, 0.55, body, 0, 0.51, 0));
  g.add(box(1.86, 0.05, 0.6, top, 0, 0.85, 0));
  // twin vessel basins + taps
  for (const sx of [-1, 1] as const) {
    const b = mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.13, 24), basin, sx * 0.5, 0.94, 0);
    g.add(b);
    g.add(cyl(0.012, 0.012, 0.24, ctx.get('mirror'), sx * 0.5, 1.0, -0.2, 8));
    g.add(cyl(0.008, 0.008, 0.12, ctx.get('mirror'), sx * 0.5, 1.1, -0.16, 6));
    // mirror pair
    g.add(mesh(new THREE.PlaneGeometry(0.55, 0.75), ctx.get('mirror'), sx * 0.5, 1.55, -0.29));
  }
  g.add(contactShadow(1.9, 0.66, 0, 0, 0.3));
  return g;
};

export const showerGlass: ModelBuilder = (ctx) => {
  const glass = ctx.get('glass');
  const frame = ctx.get('frame');
  const g = group([]);
  // fixed screen panel
  const panel = mesh(new THREE.BoxGeometry(1.2, 2.0, 0.02), glass, 0, 1.0, 0);
  g.add(panel);
  // stabilizer bar
  const bar = cyl(0.014, 0.014, 0.5, frame, 0.62, 1.85, 0, 8);
  bar.rotation.z = Math.PI / 2;
  g.add(bar);
  // wall channel
  g.add(box(0.04, 2.0, 0.05, frame, -0.61, 1.0, 0));
  return g;
};

export const toilet: ModelBuilder = (ctx) => {
  const body = ctx.get('body');
  const seat = ctx.get('seat');
  const button = ctx.get('button');
  const g = group([]);
  // wall-hung bowl
  const bowl = roundedBox(0.38, 0.5, 0.55, 0.1, body, 0, 0.45, 0.05);
  bowl.rotation.x = 0.12;
  g.add(bowl);
  // seat lid
  g.add(roundedBox(0.36, 0.03, 0.42, 0.02, seat, 0, 0.72, 0.02));
  // flush plate
  g.add(box(0.2, 0.1, 0.03, button, 0, 1.0, -0.16));
  g.add(contactShadow(0.5, 0.66, 0, 0.04, 0.22));
  void sphere;
  return g;
};
