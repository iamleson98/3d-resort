/**
 * Material id registry — pure list shared by the material library and the
 * catalog validator. `materials.ts` must implement every id here; unit tests
 * enforce catalog entries only reference ids from this list.
 */
export const MATERIAL_IDS = [
  // woods
  'wood_oak', 'wood_walnut', 'wood_teak', 'wood_whitewash', 'wood_wenge', 'wood_cherry',
  // stones
  'marble_white', 'marble_emperador', 'marble_nero', 'marble_carrara',
  'travertine', 'granite', 'granite_dark', 'terrazzo',
  // fabrics
  'linen_natural', 'linen_white', 'boucle_ivory',
  'velvet_emerald', 'velvet_navy', 'velvet_blush', 'velvet_charcoal',
  // leathers
  'leather_black', 'leather_cognac', 'leather_tan',
  // metals
  'metal_brass', 'metal_brushed_steel', 'metal_black', 'metal_chrome', 'metal_copper', 'metal_gold',
  // paints
  'paint_white', 'paint_warm', 'paint_sage', 'paint_clay', 'paint_charcoal', 'paint_navy', 'paint_cream',
  // tiles
  'tile_carrara', 'tile_white', 'tile_green', 'tile_terracotta', 'tile_blue',
  // naturals
  'rattan', 'wicker_dark', 'ceramic_white', 'ceramic_matte', 'ceramic_sand',
  'ceramic_terra', 'ceramic_navy', 'ceramic_green', 'plant_soil',
  // glass
  'glass_clear', 'glass_tinted', 'glass_frosted', 'mirror',
  // emissives
  'bulb_warm', 'bulb_dim', 'tv_screen', 'fire_glow',
  // misc
  'bamboo', 'rope', 'cork', 'paper', 'book_cloth',
  'water_pool', 'grass', 'sand',
  'leaf_glossy', 'leaf_palm', 'leaf_olive', 'leaf_monstera',
  'trunk', 'trunk_light', 'stone_rock', 'stone_rock_dark', 'accent_flamingo',
  'mattress', 'sheet_white', 'sheet_sand', 'towel_white', 'towel_sand',
  'shade_linen', 'shade_black', 'brass_shade',
  // rug program materials (procedural pattern sets)
  'rug_border', 'rug_stripes', 'rug_abstract', 'rug_diamond',
] as const;

export type MaterialId = (typeof MATERIAL_IDS)[number];

export const MATERIAL_ID_SET: ReadonlySet<string> = new Set(MATERIAL_IDS);
