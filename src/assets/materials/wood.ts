/** Wood materials — plank, veneer and timber surfaces. */
import * as THREE from 'three/webgpu';
import type { TexSet } from '../textures';
import { triMaps, cachedMaterial } from './cache';

type SetMap = Record<string, TexSet>;

export function registerWoodMaterials(sets: SetMap): Record<string, THREE.Material> {
  const out: Record<string, THREE.Material> = {};
  for (const [id, set] of Object.entries(sets)) {
    if (!id.startsWith('wood_')) continue;
    out[id] = cachedMaterial(id, () =>
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, ...triMaps(set, id) }),
    );
  }
  return out;
}
