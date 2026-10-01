/** Soft materials — fabrics, leathers, rugs. */
import * as THREE from 'three/webgpu';
import type { TexSet } from '../textures';
import { triMaps, cachedMaterial, texFromCanvas } from './cache';
import { rugTex } from '../textures';
import type { RugPattern } from '../textures';

type SetMap = Record<string, TexSet>;

export function registerSoftMaterials(sets: SetMap): Record<string, THREE.Material> {
  const out: Record<string, THREE.Material> = {};
  for (const id of ['linen_natural', 'linen_white', 'boucle_ivory', 'velvet_emerald', 'velvet_navy', 'velvet_blush', 'velvet_charcoal', 'leather_black', 'leather_cognac', 'leather_tan']) {
    out[id] = cachedMaterial(id, () =>
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, ...triMaps(sets[id]!, id) }),
    );
  }
  return out;
}

/** Rugs: procedural pattern material (cached per pattern+seed). Node-safe flat fallback. */
export function rugMaterial(o: { pattern?: RugPattern; base?: number; accent?: number; seed?: number; repeat?: [number, number] } = {}): THREE.Material {
  if (typeof document === 'undefined') {
    return cachedMaterial('rug:flat', () => new THREE.MeshStandardMaterial({ color: o.base ?? 0xd8cfbf, roughness: 1 }));
  }
  const pattern = o.pattern ?? 'border';
  const seed = o.seed ?? 149;
  const key = `rug:${pattern}:${seed}`;
  return cachedMaterial(key, () => {
    const set = rugTex({ pattern, seed, base: o.base, accent: o.accent });
    return new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 1,
      ...triMaps(set, key, { repeat: o.repeat ?? [3, 2] }),
    });
  });
}

/** Foliage-ish flat colors used by plants. */
export function registerPlantMaterials(): Record<string, THREE.Material> {
  const flat = (id: string, color: number, roughness: number) =>
    cachedMaterial(id, () => new THREE.MeshStandardMaterial({ color, roughness }));
  return {
    plant_soil: flat('plant_soil', 0x2e2620, 1),
    leaf_glossy: flat('leaf_glossy', 0x3d6b35, 0.42),
    leaf_palm: flat('leaf_palm', 0x5a8548, 0.5),
    leaf_olive: flat('leaf_olive', 0x7c8f6a, 0.55),
    leaf_monstera: flat('leaf_monstera', 0x2f5c33, 0.4),
    trunk: flat('trunk', 0x6e5138, 0.95),
    trunk_light: flat('trunk_light', 0x9c8468, 0.95),
    bamboo: flat('bamboo', 0xc9b085, 0.7),
    grass: flat('grass', 0x6d7a4f, 1),
    sand: flat('sand', 0xd7c4a0, 1),
  };
}

export { texFromCanvas };
