/** Lighting — pendants, chandelier, floor, table, sconce. */
import type { CatalogEntry } from '../../shared/domain/types';
import { V, def } from './define';

export const LIGHTING: CatalogEntry[] = [
  def('pendant_dome', 'Harbor Dome Pendant', 'lighting',
    'Spun-metal dome pendant with a warm frosted bulb.',
    [0.45, 0.45, 0.4], 560, 'pendant_dome', [
      V('brass', 'Antique Brass', { shade: 'brass_shade', body: 'metal_brass', bulb: 'bulb_warm' }),
      V('black', 'Matte Black', { shade: 'shade_black', body: 'metal_black', bulb: 'bulb_warm' }),
      V('linen', 'Washed Linen', { shade: 'shade_linen', body: 'metal_brushed_steel', bulb: 'bulb_warm' }),
    ]),
  def('pendant_cluster', 'Constellation Cluster', 'lighting',
    'Three hand-blown globes at staggered drops on a brass canopy.',
    [0.6, 0.6, 0.9], 1480, 'pendant_cluster', [
      V('brass', 'Brass Canopy', { body: 'metal_brass', shade: 'glass_clear', bulb: 'bulb_warm' }),
      V('black', 'Black Canopy', { body: 'metal_black', shade: 'glass_tinted', bulb: 'bulb_dim' }),
      V('steel', 'Steel Canopy', { body: 'metal_brushed_steel', shade: 'glass_frosted', bulb: 'bulb_warm' }),
    ]),
  def('chandelier', 'Grand Foyer Chandelier', 'lighting',
    'Two-tier ring chandelier with crystal drops.',
    [0.9, 0.9, 0.7], 3800, 'chandelier', [
      V('brass', 'Brass & Crystal', { body: 'metal_brass', crystal: 'glass_clear', bulb: 'bulb_warm' }),
      V('black', 'Black & Smoke Glass', { body: 'metal_black', crystal: 'glass_tinted', bulb: 'bulb_dim' }),
      V('gold', 'Gold & Crystal', { body: 'metal_gold', crystal: 'glass_clear', bulb: 'bulb_warm' }),
    ]),
  def('floor_lamp_arc', 'Reading Arc Lamp', 'lighting',
    'Arched floor lamp that reaches over lounge chairs.',
    [1.4, 0.5, 1.9], 1180, 'floor_lamp_arc', [
      V('brass_linen', 'Brass & Linen', { body: 'metal_brass', shade: 'shade_linen', bulb: 'bulb_warm' }),
      V('black_linen', 'Black & Linen', { body: 'metal_black', shade: 'shade_linen', bulb: 'bulb_warm' }),
      V('steel_black', 'Steel & Black Shade', { body: 'metal_brushed_steel', shade: 'shade_black', bulb: 'bulb_warm' }),
    ]),
  def('floor_lamp_column', 'Column Lantern', 'lighting',
    'Tall rectangular lantern with a glowing linen core.',
    [0.35, 0.35, 1.55], 890, 'floor_lamp_column', [
      V('black_linen', 'Black & Linen', { body: 'metal_black', core: 'shade_linen', bulb: 'bulb_warm' }),
      V('brass_linen', 'Brass & Linen', { body: 'metal_brass', core: 'shade_linen', bulb: 'bulb_warm' }),
      V('black_black', 'Black & Charcoal', { body: 'metal_black', core: 'shade_black', bulb: 'bulb_dim' }),
    ]),
  def('table_lamp', 'Cove Table Lamp', 'lighting',
    'Ceramic base with a tapered linen shade.',
    [0.32, 0.32, 0.55], 420, 'table_lamp', [
      V('sand', 'Sand Ceramic', { body: 'ceramic_sand', shade: 'shade_linen', bulb: 'bulb_warm' }),
      V('green', 'Celadon Ceramic', { body: 'ceramic_green', shade: 'shade_linen', bulb: 'bulb_warm' }),
      V('terra', 'Terracotta Ceramic', { body: 'ceramic_terra', shade: 'shade_linen', bulb: 'bulb_warm' }),
    ]),
  def('wall_sconce', 'Pier Sconce', 'lighting',
    'Articulating wall light with a pivoting shade.',
    [0.16, 0.3, 0.22], 310, 'wall_sconce', [
      V('brass', 'Antique Brass', { body: 'metal_brass', shade: 'brass_shade', bulb: 'bulb_warm' }),
      V('black', 'Matte Black', { body: 'metal_black', shade: 'shade_black', bulb: 'bulb_warm' }),
      V('steel', 'Brushed Steel', { body: 'metal_brushed_steel', shade: 'shade_linen', bulb: 'bulb_warm' }),
    ]),
];
