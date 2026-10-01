/** Storage — shelving, cabinets, credenzas, bookcases, media, bar. */
import type { CatalogEntry } from '../../shared/domain/types';
import { V, def } from './define';

export const STORAGE: CatalogEntry[] = [
  def('shelf_open', 'Studio Open Shelf', 'storage',
    'Five-tier open shelving for books and objects.',
    [1.1, 0.34, 1.9], 1250, 'shelf_open', [
      V('oak', 'Golden Oak', { frame: 'wood_oak', shelves: 'wood_oak' }),
      V('walnut', 'Walnut', { frame: 'wood_walnut', shelves: 'wood_walnut' }),
      V('wash', 'Whitewash', { frame: 'wood_whitewash', shelves: 'wood_whitewash' }),
    ]),
  def('cabinet_side', 'Curio Side Cabinet', 'storage',
    'Two-door cabinet with stone top and tambour detailing.',
    [1.2, 0.45, 0.85], 2180, 'cabinet_side', [
      V('wenge_marble', 'Wenge & Marble', { body: 'wood_wenge', top: 'marble_carrara', panel: 'wood_wenge' }),
      V('oak_rattan', 'Oak & Rattan', { body: 'wood_oak', top: 'rattan', panel: 'rattan' }),
      V('black_brass', 'Black & Brass', { body: 'metal_black', top: 'metal_brass', panel: 'metal_black' }),
    ]),
  def('credenza', 'Lobby Credenza', 'storage',
    'Long, low credenza with sliding doors — lounge scale.',
    [2.0, 0.5, 0.72], 3450, 'cabinet_side', [
      V('walnut', 'Walnut', { body: 'wood_walnut', top: 'wood_walnut', panel: 'wood_walnut' }),
      V('oak', 'Oak & Cane', { body: 'wood_oak', top: 'wood_oak', panel: 'rattan' }),
      V('black', 'Ebonized', { body: 'wood_wenge', top: 'marble_nero', panel: 'wood_wenge' }),
    ], { params: { wide: true } }),
  def('bookcase_tall', 'Library Bookcase', 'storage',
    'Tall case with adjustable shelves and a ladder rail.',
    [0.9, 0.38, 2.2], 1890, 'bookcase_tall', [
      V('oak', 'Golden Oak', { frame: 'wood_oak', shelves: 'wood_oak' }),
      V('walnut', 'Walnut', { frame: 'wood_walnut', shelves: 'wood_walnut' }),
      V('sage', 'Sage Lacquer', { frame: 'paint_sage', shelves: 'paint_sage' }),
    ]),
  def('tv_console', 'Media Console', 'storage',
    'Low console with rattan doors and cable management.',
    [1.8, 0.42, 0.5], 1490, 'tv_console', [
      V('walnut', 'Walnut & Cane', { body: 'wood_walnut', panel: 'rattan', top: 'wood_walnut' }),
      V('black', 'Ebonized', { body: 'wood_wenge', panel: 'wicker_dark', top: 'wood_wenge' }),
      V('wash', 'Whitewash', { body: 'wood_whitewash', panel: 'rattan', top: 'wood_whitewash' }),
    ]),
  def('bar_cabinet', 'Spirits Cabinet', 'storage',
    'Drop-front bar with bottle rails and a mirrored interior.',
    [1.0, 0.42, 1.25], 2540, 'bar_cabinet', [
      V('wenge_brass', 'Wenge & Brass', { body: 'wood_wenge', accent: 'metal_brass', mirror: 'mirror' }),
      V('walnut_marble', 'Walnut & Marble', { body: 'wood_walnut', accent: 'marble_carrara', mirror: 'mirror' }),
      V('oak_rattan', 'Oak & Rattan', { body: 'wood_oak', accent: 'rattan', mirror: 'mirror' }),
    ]),
];
