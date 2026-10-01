/**
 * Builder contract — how catalog variants resolve into 3D objects.
 * Builders receive a context that resolves named material slots
 * (e.g. "frame", "upholstery") to shared three.js materials.
 */
import * as THREE from 'three/webgpu';
import { getMaterial } from '../../../assets/materials';

export interface BuilderContext {
  /** Resolve a named material slot from the variant, with safe fallback. */
  get(slot: string): THREE.Material;
  /** Variant params (artSeed, compact, palette, …). */
  params: Record<string, string | number | boolean>;
}

export type ModelBuilder = (ctx: BuilderContext) => THREE.Object3D;

export function makeContext(
  materials: Record<string, string>,
  params: Record<string, string | number | boolean> = {},
): BuilderContext {
  return {
    get(slot: string): THREE.Material {
      const id = materials[slot];
      return id ? getMaterial(id) : getMaterial('paint_white');
    },
    params,
  };
}

/** Build a model by catalog id + variant id (used by features and tests). */
export function buildModel(
  builder: ModelBuilder,
  variantMaterials: Record<string, string>,
  params: Record<string, string | number | boolean> = {},
  scale = 1,
): THREE.Object3D {
  const obj = builder(makeContext(variantMaterials, params));
  if (scale !== 1) obj.scale.setScalar(scale);
  return obj;
}
