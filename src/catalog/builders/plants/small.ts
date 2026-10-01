/** Plant builders — tabletop, hanging, bamboo corner. */
import type { ModelBuilder } from '../shared/context';
import { cyl, lathe, group, contactShadow, leafShape } from '../shared/primitives';
import { mesh } from '../shared/primitives';
import * as THREE from 'three/webgpu';

export const plantPotted: ModelBuilder = (ctx) => {
  const pot = ctx.get('pot');
  const soil = ctx.get('soil');
  const foliage = ctx.get('foliage');
  const form = String(ctx.params.form ?? 'fern');
  const g = group([]);
  g.add(lathe([[0.001, 0], [0.11, 0], [0.12, 0.05], [0.1, 0.16]], pot, 24));
  g.add(cyl(0.1, 0.1, 0.02, soil, 0, 0.15, 0, 20));
  if (form === 'snake') {
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const h = 0.24 + (i % 3) * 0.08;
      const leaf = leafShape(h, 0.09, foliage);
      leaf.position.set(Math.cos(a) * 0.03, 0.16, Math.sin(a) * 0.03);
      leaf.rotation.set(-0.1, -a, 0, 'YXZ');
      g.add(leaf);
    }
  } else if (form === 'peace') {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const leaf = leafShape(0.3, 0.14, foliage);
      leaf.position.set(Math.cos(a) * 0.05, 0.18, Math.sin(a) * 0.05);
      leaf.rotation.set(-0.9 + (i % 2) * 0.3, -a, 0, 'YXZ');
      g.add(leaf);
    }
  } else {
    // fern: drooping fronds
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const leaf = leafShape(0.34, 0.1, foliage);
      leaf.position.set(Math.cos(a) * 0.07, 0.22, Math.sin(a) * 0.07);
      leaf.rotation.set(-1.35, -a, 0, 'YXZ');
      g.add(leaf);
    }
  }
  g.add(contactShadow(0.28, 0.28, 0, 0, 0.24));
  return g;
};

export const plantHanging: ModelBuilder = (ctx) => {
  const basket = ctx.get('basket');
  const foliage = ctx.get('foliage');
  const g = group([]);
  // ceiling mount + cords down to the basket
  const CEIL = 2.78;
  g.add(cyl(0.03, 0.03, 0.02, basket, 0, CEIL, 0, 12));
  const BASKET_Y = 0.85;
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    g.add(cyl(0.004, 0.004, CEIL - BASKET_Y - 0.1, basket, Math.cos(a) * 0.12, (CEIL + BASKET_Y) / 2, Math.sin(a) * 0.12, 6));
  }
  // woven basket
  g.add(lathe([[0.001, 0], [0.16, 0], [0.19, 0.12], [0.13, 0.24]], basket, 24, 0, BASKET_Y - 0.24, 0));
  // trailing vines (droop sideways, tips stay above the floor)
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const y = BASKET_Y - 0.24 + 0.12 + (i % 3) * 0.07;
    const leaf = leafShape(0.42, 0.1, foliage);
    leaf.position.set(Math.cos(a) * 0.14, y, Math.sin(a) * 0.14);
    leaf.rotation.set(-0.85, -a, 0, 'YXZ');
    g.add(leaf);
  }
  return g;
};

export const plantTallCorner: ModelBuilder = (ctx) => {
  const pot = ctx.get('pot');
  const bamboo = ctx.get('foliage');
  const g = group([]);
  g.add(lathe([[0.001, 0], [0.15, 0], [0.16, 0.06], [0.14, 0.34]], pot, 24));
  // slender bamboo canes
  const canes: Array<[number, number]> = [[0, 1.6], [0.08, 1.3], [-0.07, 1.45], [0.03, 1.1]];
  for (const [x, h] of canes) {
    g.add(cyl(0.012, 0.016, h, bamboo, x, 0.34 + h / 2, x * 0.7, 8));
    // node leaves
    for (let j = 0; j < 3; j++) {
      const y = 0.34 + h * (0.55 + j * 0.15);
      const leaf = leafShape(0.3, 0.05, bamboo);
      leaf.position.set(x + 0.03, y, x * 0.7);
      leaf.rotation.set(-1.5, j * 2.1, 0, 'YXZ');
      g.add(leaf);
    }
  }
  g.add(contactShadow(0.4, 0.4, 0, 0, 0.26));
  void mesh;
  void THREE;
  return g;
};
