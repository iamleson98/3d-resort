/** Stone materials — marble with clearcoat, matte aggregates. */
import * as THREE from 'three/webgpu';
import type { TexSet } from '../textures';
import { triMaps, cachedMaterial } from './cache';

type SetMap = Record<string, TexSet>;

export function registerStoneMaterials(sets: SetMap): Record<string, THREE.Material> {
  const out: Record<string, THREE.Material> = {};
  const marble = (id: string, roughness: number, clearcoat: number) =>
    cachedMaterial(id, () =>
      new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness, clearcoat, clearcoatRoughness: 0.25, ...triMaps(sets[id]!, id) }),
    );
  out.marble_white = marble('marble_white', 0.16, 0.55);
  out.marble_emperador = marble('marble_emperador', 0.18, 0.5);
  out.marble_nero = marble('marble_nero', 0.1, 0.7);
  out.marble_carrara = marble('marble_carrara', 0.15, 0.5);
  out.travertine = cachedMaterial('travertine', () =>
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, ...triMaps(sets.travertine!, 'travertine') }));
  out.granite = cachedMaterial('granite', () =>
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, ...triMaps(sets.granite!, 'granite') }));
  out.granite_dark = cachedMaterial('granite_dark', () =>
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, ...triMaps(sets.granite_dark!, 'granite_dark') }));
  out.terrazzo = cachedMaterial('terrazzo', () =>
    new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.22, clearcoat: 0.4, ...triMaps(sets.terrazzo!, 'terrazzo') }));
  return out;
}
