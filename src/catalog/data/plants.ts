/** Plants — palms, trees, potted, hanging, bamboo. */
import type { CatalogEntry } from '../../shared/domain/types';
import { V, def } from './define';

export const PLANTS: CatalogEntry[] = [
  def('palm_areca', 'Areca Palm', 'plants',
    'Full areca palm in a stoneware planter — instant jungle.',
    [1.1, 1.1, 2.1], 780, 'palm_areca', [
      V('standard', 'Celadon Planter', { pot: 'ceramic_green', trunk: 'trunk', foliage: 'leaf_palm' }),
      V('terra', 'Terracotta Planter', { pot: 'ceramic_terra', trunk: 'trunk', foliage: 'leaf_palm' }),
      V('tall', 'Grand Scale', { pot: 'ceramic_sand', trunk: 'trunk', foliage: 'leaf_palm' }, 1.2),
    ]),
  def('monstera', 'Monstera Deliciosa', 'plants',
    'Split-leaf monstera, the resort lobby favorite.',
    [0.9, 0.9, 1.4], 460, 'monstera', [
      V('standard', 'Sand Planter', { pot: 'ceramic_sand', soil: 'plant_soil', foliage: 'leaf_monstera' }),
      V('white', 'White Planter', { pot: 'ceramic_matte', soil: 'plant_soil', foliage: 'leaf_monstera' }),
      V('grand', 'Grand Scale', { pot: 'ceramic_green', soil: 'plant_soil', foliage: 'leaf_monstera' }, 1.25),
    ]),
  def('ficus_tree', 'Ficus Lyrata', 'plants',
    'Fiddle-leaf fig with a braided trunk.',
    [0.8, 0.8, 1.8], 520, 'ficus_tree', [
      V('standard', 'Clay Planter', { pot: 'ceramic_terra', trunk: 'trunk_light', foliage: 'leaf_glossy' }),
      V('black', 'Black Planter', { pot: 'ceramic_navy', trunk: 'trunk_light', foliage: 'leaf_glossy' }),
      V('sand', 'Sand Planter', { pot: 'ceramic_sand', trunk: 'trunk_light', foliage: 'leaf_glossy' }),
    ]),
  def('olive_tree', 'Mediterranean Olive', 'plants',
    'Gnarled olive in a raw clay pot — sunroom energy.',
    [0.9, 0.9, 1.7], 690, 'olive_tree', [
      V('standard', 'Raw Clay', { pot: 'ceramic_terra', trunk: 'trunk', foliage: 'leaf_olive' }),
      V('wash', 'Whitewashed Pot', { pot: 'ceramic_matte', trunk: 'trunk', foliage: 'leaf_olive' }),
      V('grand', 'Grand Scale', { pot: 'ceramic_terra', trunk: 'trunk', foliage: 'leaf_olive' }, 1.15),
    ]),
  def('plant_potted', 'Tableside Greenery', 'plants',
    'Compact potted plant for nightstands and vanities.',
    [0.3, 0.3, 0.5], 140, 'plant_potted', [
      V('fern', 'Boston Fern', { pot: 'ceramic_matte', soil: 'plant_soil', foliage: 'leaf_glossy' }, 1, { form: 'fern' }),
      V('snake', 'Snake Plant', { pot: 'ceramic_sand', soil: 'plant_soil', foliage: 'leaf_monstera' }, 1, { form: 'snake' }),
      V('peace', 'Peace Lily', { pot: 'ceramic_white', soil: 'plant_soil', foliage: 'leaf_glossy' }, 1, { form: 'peace' }),
    ]),
  def('plant_hanging', 'Hanging Pothos', 'plants',
    'Trailing pothos from a woven ceiling basket.',
    [0.45, 0.45, 0.9], 210, 'plant_hanging', [
      V('pothos', 'Rattan Basket', { basket: 'rattan', foliage: 'leaf_glossy' }),
      V('fern', 'Smoked Basket', { basket: 'wicker_dark', foliage: 'leaf_olive' }),
      V('ivy', 'Rope Basket', { basket: 'rope', foliage: 'leaf_glossy' }),
    ]),
  def('plant_tall_corner', 'Corner Bamboo', 'plants',
    'Slender bamboo cluster that softens room corners.',
    [0.5, 0.5, 1.9], 380, 'plant_tall_corner', [
      V('standard', 'Celadon Pot', { pot: 'ceramic_green', foliage: 'bamboo' }),
      V('terra', 'Terracotta Pot', { pot: 'ceramic_terra', foliage: 'bamboo' }),
      V('sand', 'Sand Glaze Pot', { pot: 'ceramic_sand', foliage: 'bamboo' }),
    ]),
];
