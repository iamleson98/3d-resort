/** Hard-surface materials — metals, painted plaster, tiles, glass, emissives. */
import * as THREE from 'three/webgpu';
import type { TexSet } from '../textures';
import { triMaps, cachedMaterial, texFromCanvas } from './cache';
import { artTex } from '../textures';
import type { ArtStyle } from '../textures';

type SetMap = Record<string, TexSet>;

export function registerMetalMaterials(sets: SetMap): Record<string, THREE.Material> {
  const brushed = (id: string, color: number, roughness: number, metalness = 1) =>
    cachedMaterial(id, () =>
      new THREE.MeshStandardMaterial({
        color, metalness, roughness,
        roughnessMap: texFromCanvas('brushed:r', sets.brushed!.roughness!),
        normalMap: texFromCanvas('brushed:n', sets.brushed!.normal!),
      }),
    );
  return {
    metal_brass: brushed('metal_brass', 0xc9a15a, 0.24),
    metal_brushed_steel: brushed('metal_brushed_steel', 0xb8bcc2, 0.32),
    metal_black: brushed('metal_black', 0x2b2d31, 0.42, 0.9),
    metal_copper: brushed('metal_copper', 0xb0704a, 0.28),
    metal_chrome: cachedMaterial('metal_chrome', () => new THREE.MeshStandardMaterial({ color: 0xd8dde2, metalness: 1, roughness: 0.08 })),
    metal_gold: cachedMaterial('metal_gold', () => new THREE.MeshStandardMaterial({ color: 0xd4af6a, metalness: 1, roughness: 0.15 })),
  };
}

export function registerSurfaceMaterials(sets: SetMap): Record<string, THREE.Material> {
  const out: Record<string, THREE.Material> = {};
  // plasters (used as painted walls)
  for (const id of ['plaster_warm', 'plaster_white', 'plaster_sage', 'plaster_clay']) {
    const paintId = id === 'plaster_white' ? 'paint_white'
      : id === 'plaster_warm' ? 'paint_warm'
        : id === 'plaster_sage' ? 'paint_sage' : 'paint_clay';
    out[paintId] = cachedMaterial(paintId, () =>
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, ...triMaps(sets[id]!, paintId) }));
  }
  // flat paints
  const flat = (id: string, color: number, roughness: number) =>
    cachedMaterial(id, () => new THREE.MeshStandardMaterial({ color, roughness }));
  out.paint_charcoal = flat('paint_charcoal', 0x3a3d42, 0.85);
  out.paint_navy = flat('paint_navy', 0x2a3550, 0.8);
  out.paint_cream = flat('paint_cream', 0xe9e2d2, 0.9);
  // tiles with clearcoat
  const tile = (id: string, roughness: number, clearcoat: number) =>
    cachedMaterial(id, () =>
      new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness, clearcoat, clearcoatRoughness: 0.3, ...triMaps(sets[id]!, id) }));
  out.tile_carrara = tile('tile_carrara', 0.14, 0.4);
  out.tile_white = tile('tile_white', 0.12, 0.4);
  out.tile_green = tile('tile_green', 0.14, 0.35);
  out.tile_blue = tile('tile_blue', 0.14, 0.35);
  out.tile_terracotta = cachedMaterial('tile_terracotta', () =>
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, ...triMaps(sets.tile_terracotta!, 'tile_terracotta') }));
  return out;
}

export function registerNaturalMaterials(sets: SetMap): Record<string, THREE.Material> {
  const out: Record<string, THREE.Material> = {};
  for (const id of ['rattan', 'wicker_dark']) {
    out[id] = cachedMaterial(id, () =>
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, ...triMaps(sets[id]!, id) }));
  }
  const flat = (id: string, color: number, roughness: number) =>
    cachedMaterial(id, () => new THREE.MeshStandardMaterial({ color, roughness }));
  out.ceramic_white = cachedMaterial('ceramic_white', () =>
    new THREE.MeshPhysicalMaterial({ color: 0xf6f4ef, roughness: 0.18, clearcoat: 0.5 }));
  out.ceramic_matte = flat('ceramic_matte', 0xe8e4dc, 0.6);
  out.ceramic_sand = flat('ceramic_sand', 0xcbb59f, 0.55);
  out.ceramic_terra = flat('ceramic_terra', 0xa85f42, 0.5);
  out.ceramic_navy = flat('ceramic_navy', 0x2a3550, 0.45);
  out.ceramic_green = flat('ceramic_green', 0x4a5d4e, 0.5);
  out.stone_rock = flat('stone_rock', 0x8f8d86, 0.98);
  out.stone_rock_dark = flat('stone_rock_dark', 0x5c5a55, 0.98);
  out.rope = flat('rope', 0xb9a583, 1);
  out.cork = flat('cork', 0xb59a72, 0.9);
  out.paper = flat('paper', 0xf1ead9, 0.9);
  out.book_cloth = flat('book_cloth', 0x8a6f52, 0.95);
  out.accent_flamingo = flat('accent_flamingo', 0xd98d7e, 0.7);
  return out;
}

export function registerGlassMaterials(): Record<string, THREE.Material> {
  const glass = (id: string, color: number, roughness: number, opacity: number, envMapIntensity: number) =>
    cachedMaterial(id, () =>
      new THREE.MeshPhysicalMaterial({ color, roughness, opacity, transparent: true, envMapIntensity, depthWrite: false }));
  return {
    glass_clear: glass('glass_clear', 0xdce8ea, 0.05, 0.16, 1.4),
    glass_tinted: glass('glass_tinted', 0x9fb2ae, 0.08, 0.3, 1.2),
    glass_frosted: glass('glass_frosted', 0xdfe5e2, 0.4, 0.55, 0.8),
    mirror: cachedMaterial('mirror', () =>
      new THREE.MeshStandardMaterial({ color: 0xf2f4f5, metalness: 1, roughness: 0.04, envMapIntensity: 1.5 })),
  };
}

export function registerEmissiveMaterials(): Record<string, THREE.Material> {
  const em = (id: string, color: number, emissive: number, intensity: number, roughness = 0.4) =>
    cachedMaterial(id, () =>
      new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity: intensity, roughness }));
  return {
    bulb_warm: em('bulb_warm', 0xfff4dd, 0xffdca8, 2.2),
    bulb_dim: em('bulb_dim', 0xfff4dd, 0xffdca8, 1.1),
    tv_screen: em('tv_screen', 0x0a0d12, 0x2a3d55, 0.8, 0.15),
    fire_glow: em('fire_glow', 0xffb35c, 0xff9a3c, 2.6, 0.6),
  };
}

export function registerMiscMaterials(): Record<string, THREE.Material> {
  const flat = (id: string, color: number, roughness: number) =>
    cachedMaterial(id, () => new THREE.MeshStandardMaterial({ color, roughness }));
  const dbl = (id: string, color: number, roughness: number) =>
    cachedMaterial(id, () => new THREE.MeshStandardMaterial({ color, roughness, side: THREE.DoubleSide }));
  return {
    mattress: flat('mattress', 0xf2eee6, 0.95),
    sheet_white: flat('sheet_white', 0xfaf7f0, 0.9),
    sheet_sand: flat('sheet_sand', 0xe6d9c3, 0.9),
    towel_white: flat('towel_white', 0xf4f1ea, 1),
    towel_sand: flat('towel_sand', 0xd8c5a5, 1),
    shade_linen: dbl('shade_linen', 0xf2ead8, 0.85),
    shade_black: dbl('shade_black', 0x2c2c30, 0.8),
    brass_shade: cachedMaterial('brass_shade', () =>
      new THREE.MeshStandardMaterial({ color: 0xc9a15a, metalness: 1, roughness: 0.3, side: THREE.DoubleSide })),
    water_pool: cachedMaterial('water_pool', () =>
      new THREE.MeshPhysicalMaterial({
        color: 0x3d8d96, roughness: 0.06, metalness: 0,
        transparent: true, opacity: 0.72, envMapIntensity: 1.6,
      })),
  };
}

/** Artwork canvas material — unique generative composition per seed+style. Node-safe fallback. */
export function artMaterial(o: { seed?: number; palette?: string[]; style?: ArtStyle } = {}): THREE.Material {
  if (typeof document === 'undefined') {
    return cachedMaterial('art:flat', () => new THREE.MeshStandardMaterial({ color: 0xf4efe6, roughness: 0.55 }));
  }
  const seed = o.seed ?? 157;
  const style = o.style ?? 'arc';
  const key = `art:${seed}:${style}`;
  return cachedMaterial(key, () => {
    const set = artTex({ seed, palette: o.palette, style });
    return new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.55,
      map: set.color ? texFromCanvas(`${key}:c`, set.color, { srgb: true }) : null,
    });
  });
}
