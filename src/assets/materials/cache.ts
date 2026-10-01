/**
 * Material cache — texture wrapping + material instantiation helpers.
 * One three.js material per id, shared across every mesh that uses it.
 */
import * as THREE from 'three/webgpu';
import type { TexSet } from '../textures';

const texCache = new Map<string, THREE.Texture>();

export function texFromCanvas(
  key: string,
  canvas: HTMLCanvasElement,
  { srgb = false, repeat }: { srgb?: boolean; repeat?: [number, number] } = {},
): THREE.Texture {
  const cached = texCache.get(key);
  if (cached) return cached;
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  if (repeat) t.repeat.set(repeat[0], repeat[1]);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 16;
  texCache.set(key, t);
  return t;
}

/** Wrap a TexSet into map / roughnessMap / normalMap params. */
export function triMaps(
  set: TexSet,
  key: string,
  { srgb = true, repeat = [1, 1] as [number, number] } = {},
): {
  map: THREE.Texture | null;
  roughnessMap: THREE.Texture | null;
  normalMap: THREE.Texture | null;
} {
  return {
    map: set.color ? texFromCanvas(`${key}:c`, set.color, { srgb, repeat }) : null,
    roughnessMap: set.roughness ? texFromCanvas(`${key}:r`, set.roughness, { repeat }) : null,
    normalMap: set.normal ? texFromCanvas(`${key}:n`, set.normal, { repeat }) : null,
  };
}

const matCache = new Map<string, THREE.Material>();

export function cachedMaterial<T extends THREE.Material>(id: string, make: () => T): T {
  const hit = matCache.get(id);
  if (hit) return hit as T;
  const m = make();
  m.name = id;
  matCache.set(id, m);
  return m;
}

export function materialStats(): { materials: number; textures: number } {
  return { materials: matCache.size, textures: texCache.size };
}
