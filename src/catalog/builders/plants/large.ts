/** Plant builders — large statement greenery. */
import type { ModelBuilder } from '../shared/context';
import { cyl, lathe, group, contactShadow, leafShape } from '../shared/primitives';
import { mesh } from '../shared/primitives';
import * as THREE from 'three/webgpu';

function planter(g: THREE.Group, r: number, h: number, mat: THREE.Material): void {
  g.add(lathe([[0.001, 0], [r, 0], [r * 1.02, h * 0.1], [r * 0.92, h]], mat, 28));
}

/** Radial fan of leaf planes around a trunk top. */
function leafFan(g: THREE.Group, mat: THREE.Material, y: number, count: number, len: number, width: number, tilt: number): void {
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const leaf = leafShape(len, width, mat);
    leaf.position.set(Math.cos(a) * len * 0.18, y, Math.sin(a) * len * 0.18);
    leaf.rotation.set(-tilt, -a, 0, 'YXZ');
    g.add(leaf);
  }
}

export const palmAreca: ModelBuilder = (ctx) => {
  const pot = ctx.get('pot');
  const trunk = ctx.get('trunk');
  const foliage = ctx.get('foliage');
  const g = group([]);
  planter(g, 0.24, 0.5, pot);
  g.add(cyl(0.24, 0.24, 0.03, ctx.get('plant_soil'), 0, 0.48, 0, 24));
  // cluster of stems
  const stems: Array<[number, number]> = [[0, 1.35], [0.1, 1.15], [-0.08, 1.25], [0.04, 0.95]];
  for (const [x, h] of stems) {
    const stem = cyl(0.018, 0.026, h, trunk, x, 0.5 + h / 2, x * 0.6, 8);
    stem.rotation.z = -x * 0.8;
    g.add(stem);
    leafFan(g, foliage, 0.5 + h, 7, 0.55, 0.16, 0.5 + x);
  }
  g.add(contactShadow(0.6, 0.6, 0, 0, 0.3));
  return g;
};

export const monstera: ModelBuilder = (ctx) => {
  const pot = ctx.get('pot');
  const soil = ctx.get('soil');
  const foliage = ctx.get('foliage');
  const g = group([]);
  planter(g, 0.26, 0.42, pot);
  g.add(cyl(0.26, 0.26, 0.03, soil, 0, 0.4, 0, 24));
  // split leaves at staggered heights/angles
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.5;
    const r = 0.18 + (i % 3) * 0.08;
    const y = 0.55 + (i % 4) * 0.22;
    const leaf = leafShape(0.55, 0.34, foliage);
    leaf.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
    leaf.rotation.set(-1.1 + (i % 3) * 0.18, -a, 0, 'YXZ');
    g.add(leaf);
    // stem
    const stem = cyl(0.012, 0.014, y - 0.4, ctx.get('trunk'), Math.cos(a) * r * 0.5, (y + 0.4) / 2, Math.sin(a) * r * 0.5, 6);
    stem.rotation.z = -Math.cos(a) * 0.4;
    g.add(stem);
  }
  g.add(contactShadow(0.62, 0.62, 0, 0, 0.3));
  return g;
};

export const ficusTree: ModelBuilder = (ctx) => {
  const pot = ctx.get('pot');
  const trunk = ctx.get('trunk');
  const foliage = ctx.get('foliage');
  const g = group([]);
  planter(g, 0.23, 0.4, pot);
  // braided trunk
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const braid = cyl(0.02, 0.03, 1.1, trunk, Math.cos(a) * 0.035, 0.95, Math.sin(a) * 0.035, 8);
    braid.rotation.z = Math.cos(a) * 0.06;
    g.add(braid);
  }
  // canopy of leaf fans
  leafFan(g, foliage, 1.55, 9, 0.5, 0.18, 0.7);
  leafFan(g, foliage, 1.35, 7, 0.42, 0.15, 0.9);
  g.add(contactShadow(0.6, 0.6, 0, 0, 0.3));
  return g;
};

export const oliveTree: ModelBuilder = (ctx) => {
  const pot = ctx.get('pot');
  const trunk = ctx.get('trunk');
  const foliage = ctx.get('foliage');
  const g = group([]);
  planter(g, 0.25, 0.38, pot);
  // gnarled trunk
  const t1 = cyl(0.045, 0.075, 0.8, trunk, 0, 0.75, 0, 10);
  t1.rotation.z = 0.08;
  g.add(t1);
  const t2 = cyl(0.03, 0.045, 0.55, trunk, 0.1, 1.3, 0.05, 8);
  t2.rotation.z = -0.25;
  g.add(t2);
  // airy olive canopy
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 4;
    const r = 0.15 + (i % 5) * 0.07;
    const y = 1.45 + (i % 6) * 0.08;
    const leaf = leafShape(0.34, 0.1, foliage);
    leaf.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
    leaf.rotation.set(-1.35, -a, 0, 'YXZ');
    g.add(leaf);
  }
  g.add(contactShadow(0.62, 0.62, 0, 0, 0.3));
  void mesh;
  return g;
};
