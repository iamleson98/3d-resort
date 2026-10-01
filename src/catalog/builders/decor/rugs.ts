/** Decor builders — rugs + sculpture. */
import type { ModelBuilder } from '../shared/context';
import { box, cyl, sphere, group, mesh } from '../shared/primitives';
import * as THREE from 'three/webgpu';
import { rugMaterial } from '../../../assets/materials';
import type { RugPattern } from '../../../assets/textures';

/**
 * Rug — floats 12 mm above the floor with polygonOffset.
 * (Anti-flicker invariant: never a coplanar plane with the floor slab.)
 */
export const rugArea: ModelBuilder = (ctx) => {
  const pattern = String(ctx.params.rugPattern ?? 'border') as RugPattern;
  const seed = Number(ctx.params.rugSeed ?? 149);
  const mat = rugMaterial({ pattern, seed, repeat: [3, 2] });
  const g = group([]);
  const rug = mesh(new THREE.BoxGeometry(2.6, 0.024, 1.8), mat, 0, 0.012, 0);
  const m = rug.material as THREE.MeshStandardMaterial;
  m.polygonOffset = true;
  m.polygonOffsetFactor = -1;
  m.polygonOffsetUnits = -1;
  rug.receiveShadow = true;
  rug.castShadow = false;
  rug.renderOrder = 1;
  g.add(rug);
  // hand-knotted fringe at both ends
  for (const sz of [-1, 1] as const) {
    const fringe = box(2.56, 0.012, 0.06, mat as THREE.Material, 0, 0.012, sz * 0.92);
    fringe.castShadow = false;
    g.add(fringe);
  }
  return g;
};

export const sculptureObject: ModelBuilder = (ctx) => {
  const body = ctx.get('body');
  const base = ctx.get('base');
  const g = group([]);
  // limestone karst study: stacked offset slabs
  g.add(cyl(0.14, 0.16, 0.04, base, 0, 0.02, 0, 28));
  g.add(box(0.22, 0.18, 0.16, body, 0.02, 0.13, 0));
  g.add(box(0.16, 0.2, 0.12, body, -0.02, 0.32, 0.01));
  g.add(box(0.1, 0.14, 0.09, body, 0.03, 0.49, 0));
  g.add(sphere(0.05, body, 0.03, 0.6, 0));
  return g;
};
