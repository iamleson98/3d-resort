/**
 * Material library — public API.
 * Builds all texture sets once, registers every family, exposes `get(id)`.
 */
import * as THREE from 'three/webgpu';
import { MATERIAL_IDS } from './materialIds';
import { buildTextureSets } from './textureSets';
import { registerWoodMaterials } from './wood';
import { registerStoneMaterials } from './stone';
import { registerSoftMaterials, rugMaterial, registerPlantMaterials } from './soft';
import {
  registerMetalMaterials,
  registerSurfaceMaterials,
  registerNaturalMaterials,
  registerGlassMaterials,
  registerEmissiveMaterials,
  registerMiscMaterials,
  artMaterial,
} from './hard';

export type MaterialMap = Record<string, THREE.Material>;

let built: MaterialMap | null = null;
let testMode: MaterialMap | null = null;

/**
 * In non-DOM environments (Node unit tests) the material library runs in
 * "flat" mode: plain colored MeshStandardMaterials, no canvas textures.
 * Builders then remain fully constructible in Node for integrity tests.
 */
function flatMaterials(): MaterialMap {
  if (testMode) return testMode;
  const out: MaterialMap = {};
  const PALETTE = [0xd8cfc0, 0x8a5d33, 0x3a2314, 0xc9a15a, 0x2b2d31, 0xf2efe9, 0x6f7d72, 0x3d6b35];
  let i = 0;
  for (const id of MATERIAL_IDS) {
    out[id] = new THREE.MeshStandardMaterial({ color: PALETTE[i % PALETTE.length]!, roughness: 0.8 });
    i++;
  }
  testMode = out;
  return out;
}

export function buildMaterials(): MaterialMap {
  if (built) return built;
  if (typeof document === 'undefined') return flatMaterials();
  const sets = buildTextureSets() as unknown as Record<string, import('../textures').TexSet>;
  const families: MaterialMap[] = [
    registerWoodMaterials(sets),
    registerStoneMaterials(sets),
    registerSoftMaterials(sets),
    registerMetalMaterials(sets),
    registerSurfaceMaterials(sets),
    registerNaturalMaterials(sets),
    registerGlassMaterials(),
    registerEmissiveMaterials(),
    registerMiscMaterials(),
    registerPlantMaterials(),
  ];
  built = Object.assign({}, ...families) as MaterialMap;
  return built;
}

export function getMaterial(id: string): THREE.Material {
  const lib = buildMaterials();
  const m = lib[id];
  if (!m) {
    console.warn(`[materials] unknown material "${id}" — falling back to paint_white`);
    return lib['paint_white']!;
  }
  return m;
}

export function hasMaterial(id: string): boolean {
  return Boolean(buildMaterials()[id]);
}

export function materialIds(): string[] {
  return [...MATERIAL_IDS];
}

export { rugMaterial, artMaterial };

/** Floor material with per-room repeat so grain scale stays physical (~1.4 m/tile). */
export function floorMaterial(id: string, w: number, d: number): THREE.Material {
  const base = getMaterial(id);
  const rx = Math.max(1, Math.round(w / 1.4));
  const ry = Math.max(1, Math.round(d / 1.4));
  const b = base as THREE.MeshStandardMaterial;
  if (!b.map) return base;
  const m = b.clone();
  const cloneMap = (src: THREE.Texture | null): THREE.Texture | null => {
    if (!src) return null;
    const t = src.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rx, ry);
    t.needsUpdate = true;
    return t;
  };
  m.map = cloneMap(b.map);
  m.roughnessMap = cloneMap(b.roughnessMap);
  m.normalMap = cloneMap(b.normalMap);
  return m;
}
