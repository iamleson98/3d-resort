/**
 * Texture set registry — every procedural texture generated exactly once,
 * then shared by all materials. Family modules stay data-only.
 */
import { woodTex, marbleTex, graniteTex, terrazzoTex, travertineTex, fabricTex, boucleTex, velvetTex, leatherTex, brushedTex, plasterTex, tileTex, rattanTex } from '../textures';
import type { TexSet } from '../textures';

export interface TextureSets {
  wood_oak: TexSet;
  wood_walnut: TexSet;
  wood_teak: TexSet;
  wood_whitewash: TexSet;
  wood_wenge: TexSet;
  wood_cherry: TexSet;
  marble_white: TexSet;
  marble_emperador: TexSet;
  marble_nero: TexSet;
  marble_carrara: TexSet;
  travertine: TexSet;
  granite: TexSet;
  granite_dark: TexSet;
  terrazzo: TexSet;
  linen_natural: TexSet;
  linen_white: TexSet;
  boucle_ivory: TexSet;
  velvet_emerald: TexSet;
  velvet_navy: TexSet;
  velvet_blush: TexSet;
  velvet_charcoal: TexSet;
  leather_black: TexSet;
  leather_cognac: TexSet;
  leather_tan: TexSet;
  brushed: TexSet;
  plaster_warm: TexSet;
  plaster_white: TexSet;
  plaster_sage: TexSet;
  plaster_clay: TexSet;
  tile_carrara: TexSet;
  tile_white: TexSet;
  tile_green: TexSet;
  tile_terracotta: TexSet;
  tile_blue: TexSet;
  rattan: TexSet;
  wicker_dark: TexSet;
}

export function buildTextureSets(): TextureSets {
  return {
    wood_oak: woodTex({ light: 0xc99a63, dark: 0x8a5d33, rings: 8, seed: 3 }),
    wood_walnut: woodTex({ light: 0x7a4f30, dark: 0x3a2314, rings: 10, seed: 8 }),
    wood_teak: woodTex({ light: 0xb08050, dark: 0x6e4a28, rings: 7, seed: 12 }),
    wood_whitewash: woodTex({ light: 0xe8e2d5, dark: 0xb9ac93, rings: 8, turbulence: 0.2, seed: 21 }),
    wood_wenge: woodTex({ light: 0x4a382a, dark: 0x1c130c, rings: 12, seed: 26 }),
    wood_cherry: woodTex({ light: 0xa05c38, dark: 0x5c2f1a, rings: 9, seed: 33 }),
    marble_white: marbleTex({ base: 0xf1eee8, vein: 0x8f8c80, vein2: 0xc4bfae, seed: 11 }),
    marble_emperador: marbleTex({ base: 0x8a6a4a, vein: 0xe8dcc8, vein2: 0x5c4128, seed: 17, threshold: 0.7 }),
    marble_nero: marbleTex({ base: 0x22242a, vein: 0xc9a15a, vein2: 0x6a6458, seed: 23, threshold: 0.76, gloss: 0.06 }),
    marble_carrara: marbleTex({ base: 0xf4f2ee, vein: 0x9aa0a8, vein2: 0xd8d4c8, seed: 29, scale: 4 }),
    travertine: travertineTex({}),
    granite: graniteTex({ base: 0x8d939c }),
    granite_dark: graniteTex({ base: 0x4a4d55, seed: 55 }),
    terrazzo: terrazzoTex({}),
    linen_natural: fabricTex({ base: 0xd9d2c4, thread: 46 }),
    linen_white: fabricTex({ base: 0xefece4, thread: 44, seed: 76 }),
    boucle_ivory: boucleTex({}),
    velvet_emerald: velvetTex({ base: 0x1f4636 }),
    velvet_navy: velvetTex({ base: 0x24304a }),
    velvet_blush: velvetTex({ base: 0xb08a80 }),
    velvet_charcoal: velvetTex({ base: 0x3a3a40 }),
    leather_black: leatherTex({ base: 0x2a2622 }),
    leather_cognac: leatherTex({ base: 0x8a5230, gloss: 0.32 }),
    leather_tan: leatherTex({ base: 0xb98a5c, gloss: 0.3 }),
    brushed: brushedTex({}),
    plaster_warm: plasterTex({ base: 0xece7dd }),
    plaster_white: plasterTex({ base: 0xf2efe9, blotch: 0.22 }),
    plaster_sage: plasterTex({ base: 0xb7bfae }),
    plaster_clay: plasterTex({ base: 0xcbb59f }),
    tile_carrara: tileTex({ tiles: 3, gloss: 0.1 }),
    tile_white: tileTex({ tiles: 4, base: 0xf0eee8, grout: 0xcfcac0 }),
    tile_green: tileTex({ tiles: 3, base: 0x6f7d72, grout: 0x9aa096, gloss: 0.12, seed: 61 }),
    tile_terracotta: tileTex({ tiles: 2, base: 0xb26a48, grout: 0xd8cdbb, gloss: 0.3, jitter: 0.08 }),
    tile_blue: tileTex({ tiles: 4, base: 0x7d95a8, grout: 0xc9c4b8, gloss: 0.12, seed: 71 }),
    rattan: rattanTex({}),
    wicker_dark: rattanTex({ base: 0x8a6844, weave: 20, seed: 141 }),
  };
}
