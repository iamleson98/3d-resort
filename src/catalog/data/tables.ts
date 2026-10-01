/** Tables — coffee, side, dining, console, desk, bar. */
import type { CatalogEntry } from '../../shared/domain/types';
import { V, def } from './define';

export const TABLES: CatalogEntry[] = [
  def('coffee_table_rect', 'Elevate Coffee Table', 'tables',
    'Rectangular cocktail table with a stone slab top on a tapered timber base.',
    [1.3, 0.7, 0.4], 2280, 'coffee_table_rect', [
      V('nero', 'Nero Marquina Top', { top: 'marble_nero', frame: 'wood_walnut' }),
      V('travertine', 'Travertine Top', { top: 'travertine', frame: 'wood_oak' }),
      V('brass', 'Brass & Wenge', { top: 'metal_brass', frame: 'wood_wenge' }),
    ]),
  def('coffee_table_round', 'Atoll Coffee Table', 'tables',
    'Round drum table — carved stone or timber, gallery-grade finish.',
    [0.9, 0.9, 0.42], 1950, 'coffee_table_round', [
      V('white_brass', 'Carrara & Brass', { top: 'marble_white', frame: 'metal_brass' }),
      V('emperador', 'Emperador & Black', { top: 'marble_emperador', frame: 'metal_black' }),
      V('travertine', 'Travertine Monolith', { top: 'travertine', frame: 'travertine' }),
    ]),
  def('side_table', 'Pebble Side Table', 'tables',
    'Compact drum side table for sofas and bedsides.',
    [0.45, 0.45, 0.55], 640, 'side_table', [
      V('brass_marble', 'Brass & Marble', { top: 'marble_white', frame: 'metal_brass' }),
      V('black_oak', 'Black & Oak', { top: 'wood_oak', frame: 'metal_black' }),
      V('rattan', 'Rattan Weave', { top: 'rattan', frame: 'rattan' }),
    ]),
  def('dining_table', 'Harvest Dining Table', 'tables',
    'Ten-seat plank table with breadboard ends and a hand-planed top.',
    [2.6, 1.1, 0.76], 5900, 'dining_table', [
      V('walnut', 'American Walnut', { top: 'wood_walnut', frame: 'wood_walnut' }),
      V('oak', 'Golden Oak', { top: 'wood_oak', frame: 'wood_oak' }),
      V('wenge', 'Ebonized', { top: 'wood_wenge', frame: 'metal_black' }),
      V('wash', 'Whitewash', { top: 'wood_whitewash', frame: 'wood_whitewash' }),
    ]),
  def('console_table', 'Foyer Console', 'tables',
    'Slim hall table sized for entry walls and lamp pairs.',
    [1.4, 0.4, 0.85], 1680, 'console_table', [
      V('wenge_marble', 'Wenge & Marble', { top: 'marble_carrara', frame: 'wood_wenge' }),
      V('oak_rattan', 'Oak & Rattan', { top: 'wood_oak', frame: 'rattan' }),
      V('black_brass', 'Black & Brass', { top: 'metal_brass', frame: 'metal_black' }),
    ]),
  def('desk_writing', 'Correspondence Desk', 'tables',
    'Writing desk with leather inlay and twin utility drawers.',
    [1.35, 0.65, 0.76], 2450, 'desk_writing', [
      V('walnut', 'Walnut & Cognac', { top: 'wood_walnut', frame: 'wood_walnut', accent: 'leather_cognac' }),
      V('oak', 'Oak & Sage', { top: 'wood_oak', frame: 'wood_oak', accent: 'paint_sage' }),
      V('black', 'Ebonized & Brass', { top: 'metal_brass', frame: 'metal_black', accent: 'leather_black' }),
    ]),
  def('bar_cart', 'Trolly Bar Cart', 'tables',
    'Two-tier serving trolley on castored brass frame.',
    [0.8, 0.45, 0.8], 1240, 'bar_cart', [
      V('brass_glass', 'Brass & Glass', { top: 'glass_clear', frame: 'metal_brass' }),
      V('black_marble', 'Black & Marble', { top: 'marble_nero', frame: 'metal_black' }),
      V('walnut_rattan', 'Walnut & Rattan', { top: 'rattan', frame: 'wood_walnut' }),
    ]),
];
