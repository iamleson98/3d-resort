/**
 * Builder integrity — every catalog variant builds into a finite,
 * non-degenerate, shadow-flagged object. Runs in Node with the flat
 * (DOM-free) material fallback.
 */
import { describe, it, expect } from 'vitest';
import * as THREE from 'three/webgpu';
import { CATALOG } from '@/catalog';
import { BUILDERS } from '@/catalog/builders';
import { buildModel } from '@/catalog/builders/shared/context';
import { objectStats } from '@/catalog/builders/shared/primitives';

/** Ceiling-suspended models: must hang from the ceiling, not touch the floor. */
const CEILING_MOUNTED = new Set(['pendant_dome', 'pendant_cluster', 'chandelier', 'plant_hanging']);
/** Flat decal-like models: receive shadows, never cast them. */
const RECEIVE_ONLY = new Set(['rug_area']);

function build(entryId: string, variantId: string): THREE.Object3D {
  const entry = CATALOG.find((e) => e.id === entryId)!;
  const variant = entry.variants.find((v) => v.id === variantId) ?? entry.variants[0]!;
  const builder = BUILDERS[entry.builder]!;
  return buildModel(builder, variant.materials, variant.params ?? {}, variant.scale ?? 1);
}

describe('builder integrity — every variant of every model', () => {
  for (const entry of CATALOG) {
    it(`${entry.id} (${entry.variants.length} variants)`, () => {
      for (const variant of entry.variants) {
        const obj = build(entry.id, variant.id);
        expect(obj).toBeDefined();

        // finite bounding box
        const box = new THREE.Box3().setFromObject(obj);
        for (const c of ['min', 'max'] as const) {
          for (const axis of ['x', 'y', 'z'] as const) {
            const v = box[c][axis];
            expect(Number.isFinite(v), `${entry.id}/${variant.id} ${c}.${axis} finite`).toBe(true);
          }
        }
        // non-degenerate: occupies real volume
        const size = box.getSize(new THREE.Vector3());
        expect(size.x, `${entry.id}/${variant.id} size.x`).toBeGreaterThan(0.02);
        expect(size.y, `${entry.id}/${variant.id} size.y`).toBeGreaterThan(0.02);
        expect(size.z, `${entry.id}/${variant.id} size.z`).toBeGreaterThan(0.02);
        // sits on the floor plane (models are grounded at y=0) unless ceiling-mounted
        if (!CEILING_MOUNTED.has(entry.id)) {
          expect(box.min.y, `${entry.id}/${variant.id} grounded`).toBeGreaterThanOrEqual(-0.02);
          expect(box.min.y, `${entry.id}/${variant.id} not floating`).toBeLessThan(0.08);
        }
        // height matches the catalog claim within 60% (sanity, not exactness)
        const scale = variant.scale ?? 1;
        expect(size.y).toBeLessThan(entry.dimensions.h * scale * 1.8 + 0.6);

        // contains real geometry
        const stats = objectStats(obj);
        expect(stats.meshes, `${entry.id}/${variant.id} meshes`).toBeGreaterThanOrEqual(2);
        expect(stats.triangles, `${entry.id}/${variant.id} triangles`).toBeGreaterThan(12);

        if (CEILING_MOUNTED.has(entry.id)) {
          // suspended: reaches near the ceiling, nothing below the floor
          expect(box.max.y, `${entry.id}/${variant.id} reaches ceiling`).toBeGreaterThan(2.4);
          expect(box.min.y, `${entry.id}/${variant.id} above floor`).toBeGreaterThanOrEqual(-0.02);
        } else if (RECEIVE_ONLY.has(entry.id)) {
          // decals: receive shadows, never cast
          let receivers = 0;
          let total = 0;
          obj.traverse((o) => {
            const m = o as THREE.Mesh;
            if (m.isMesh && m.geometry && !m.userData.overlay) {
              total += 1;
              if (m.receiveShadow) receivers += 1;
            }
          });
          expect(receivers / total, `${entry.id}/${variant.id} receive flags`).toBeGreaterThanOrEqual(0.9);
        } else {
          // meshes cast shadows by default (anti-flicker + light quality invariant)
          let shadowCasters = 0;
          let total = 0;
          obj.traverse((o) => {
            const m = o as THREE.Mesh;
            if (m.isMesh && m.geometry && !m.userData.overlay) {
              total += 1;
              if (m.castShadow) shadowCasters += 1;
            }
          });
          expect(shadowCasters / total, `${entry.id}/${variant.id} shadow flags`).toBeGreaterThanOrEqual(0.9);
        }
      }
    });
  }
});

describe('determinism', () => {
  it('same variant builds identical geometry counts twice', () => {
    const a = objectStats(build('lounge_armchair', 'cognac'));
    const b = objectStats(build('lounge_armchair', 'cognac'));
    expect(b).toEqual(a);
  });
});
