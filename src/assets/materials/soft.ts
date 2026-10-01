/** Soft materials — fabrics, leathers, rugs. */
import * as THREE from 'three/webgpu';
import type { TexSet } from '../textures';
import { triMaps, cachedMaterial, texFromCanvas } from './cache';
import { rugTex } from '../textures';
import type { RugPattern } from '../textures';

type SetMap = Record<string, TexSet>;

export function registerSoftMaterials(sets: SetMap): Record<string, THREE.Material> {
  const out: Record<string, THREE.Material> = {};
  // Fabric sheen (tidewater's clearcoat/sheen IBL lesson): linen/boucle get a
  // soft grazed-angle sheen, velvet gets the full retro-reflective nap.
  const fabric = (id: string, sheen: number, sheenRoughness: number, sheenColor = 0xfff2df) =>
    cachedMaterial(id, () =>
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff, roughness: 1,
        sheen, sheenRoughness, sheenColor,
        ...triMaps(sets[id]!, id),
      }));
  const linen = (id: string) => fabric(id, 0.35, 0.68);
  const velvet = (id: string) => fabric(id, 1.0, 0.33);
  out.linen_natural = linen('linen_natural');
  out.linen_white = linen('linen_white');
  out.boucle_ivory = linen('boucle_ivory');
  out.velvet_emerald = velvet('velvet_emerald');
  out.velvet_navy = velvet('velvet_navy');
  out.velvet_blush = velvet('velvet_blush');
  out.velvet_charcoal = velvet('velvet_charcoal');
  // Leather — a whisper of clearcoat gives the polished grain a grazing highlight
  const leather = (id: string) =>
    cachedMaterial(id, () =>
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff, roughness: 1, clearcoat: 0.08, clearcoatRoughness: 0.5,
        ...triMaps(sets[id]!, id),
      }));
  out.leather_black = leather('leather_black');
  out.leather_cognac = leather('leather_cognac');
  out.leather_tan = leather('leather_tan');
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
