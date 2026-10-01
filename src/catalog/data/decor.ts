/** Decor — artwork, vases, trays, books, rugs, sculpture, candle, basket. */
import type { CatalogEntry } from '../../shared/domain/types';
import { V, def } from './define';

export const DECOR: CatalogEntry[] = [
  def('artwork_large', 'Cat Ba Landscape Triptych', 'decor',
    'Large-format mixed-media canvas on a floating frame.',
    [1.5, 0.08, 1.0], 2200, 'artwork_large', [
      V('abstract', 'Dawn over Lan Ha', { canvas: 'paper', frame: 'wood_oak' }, 1, { artSeed: 11, artStyle: 'abstract' }),
      V('arc', 'Karst Formations', { canvas: 'paper', frame: 'wood_walnut' }, 1, { artSeed: 23, artStyle: 'arc' }),
      V('line', 'Tide Lines', { canvas: 'paper', frame: 'metal_brass' }, 1, { artSeed: 37, artStyle: 'line' }),
      V('terracotta', 'Fisherman Dusk', { canvas: 'paper', frame: 'wood_teak' }, 1, { artSeed: 41, artStyle: 'terracotta' }),
    ]),
  def('artwork_pair', 'Gallery Print Pair', 'decor',
    'Two companion prints hung side by side.',
    [1.1, 0.06, 0.8], 980, 'artwork_pair', [
      V('blocks', 'Harbor Blocks', { canvas: 'paper', frame: 'wood_oak' }, 1, { artSeed: 53, artStyle: 'blocks' }),
      V('line', 'Reed Study', { canvas: 'paper', frame: 'metal_black' }, 1, { artSeed: 59, artStyle: 'line' }),
      V('arc', 'Moon Arcs', { canvas: 'paper', frame: 'metal_brass' }, 1, { artSeed: 67, artStyle: 'arc' }),
    ]),
  def('vase_floor', 'Monolith Floor Vase', 'decor',
    'Waisted floor vase, hand-thrown at scale.',
    [0.4, 0.4, 1.1], 520, 'vase_floor', [
      V('terra', 'Terracotta', { body: 'ceramic_terra' }),
      V('sand', 'Sand Glaze', { body: 'ceramic_sand' }),
      V('green', 'Celadon', { body: 'ceramic_green' }),
      V('navy', 'Ink Navy', { body: 'ceramic_navy' }),
    ]),
  def('vase_table', 'Bud Vase Trio', 'decor',
    'Three small vases for stems and grasses.',
    [0.36, 0.2, 0.28], 180, 'vase_table', [
      V('white', 'Matte White', { body: 'ceramic_matte' }),
      V('terra', 'Terracotta', { body: 'ceramic_terra' }),
      V('sand', 'Sand Glaze', { body: 'ceramic_sand' }),
    ]),
  def('tray_decor', 'Servicing Tray', 'decor',
    'Butler tray with raised handles for minibar styling.',
    [0.45, 0.32, 0.06], 210, 'tray_decor', [
      V('brass_marble', 'Brass & Marble', { body: 'metal_brass', top: 'marble_white' }),
      V('walnut_leather', 'Walnut & Leather', { body: 'wood_walnut', top: 'leather_cognac' }),
      V('black_brass', 'Black & Brass', { body: 'metal_black', top: 'metal_brass' }),
    ]),
  def('books_stack', 'Folios Stack', 'decor',
    'Coffee-table book stack — art direction constant.',
    [0.35, 0.28, 0.16], 120, 'books_stack', [
      V('cognac', 'Warm Palette', { body: 'book_cloth', accent: 'leather_cognac' }, 1, { palette: 'warm' }),
      V('sage', 'Botanical Palette', { body: 'book_cloth', accent: 'paint_sage' }, 1, { palette: 'botanical' }),
      V('navy', 'Marine Palette', { body: 'book_cloth', accent: 'paint_navy' }, 1, { palette: 'marine' }),
    ]),
  def('rug_area', 'Lagoon Area Rug', 'decor',
    'Hand-knotted wool rug with a resort-exclusive pattern.',
    [2.6, 1.8, 0.02], 3400, 'rug_area', [
      V('border', 'Ivory Border', { body: 'rug_border', trim: 'rattan' }, 1, { rugPattern: 'border', rugSeed: 149 }),
      V('stripes', 'Sunset Stripes', { body: 'rug_stripes', trim: 'rope' }, 1, { rugPattern: 'stripes', rugSeed: 151 }),
      V('abstract', 'Reed Abstract', { body: 'rug_abstract', trim: 'rope' }, 1, { rugPattern: 'abstract', rugSeed: 157 }),
      V('diamond', 'Karst Diamond', { body: 'rug_diamond', trim: 'rattan' }, 1, { rugPattern: 'diamond', rugSeed: 163 }),
    ]),
  def('sculpture_object', 'Karst Sculpture', 'decor',
    'Cast-bronze stone study for consoles and plinths.',
    [0.3, 0.3, 0.55], 1650, 'sculpture_object', [
      V('brass', 'Cast Bronze', { body: 'metal_brass', base: 'marble_nero' }),
      V('stone', 'Limestone', { body: 'stone_rock', base: 'marble_white' }),
      V('ceramic', 'Stoneware', { body: 'ceramic_matte', base: 'wood_walnut' }),
    ]),
  def('candle_holder', 'Taper Trio', 'decor',
    'Brass taper holders for evening styling.',
    [0.3, 0.12, 0.35], 160, 'candle_holder', [
      V('brass', 'Antique Brass', { body: 'metal_brass', candle: 'paper' }),
      V('black', 'Matte Black', { body: 'metal_black', candle: 'paper' }),
      V('copper', 'Hammered Copper', { body: 'metal_copper', candle: 'paper' }),
    ]),
  def('basket_weave', 'Linen Basket', 'decor',
    'Woven storage basket for throws and firewood.',
    [0.42, 0.42, 0.45], 190, 'basket_weave', [
      V('rattan', 'Natural Rattan', { body: 'rattan' }),
      V('dark', 'Smoked Wicker', { body: 'wicker_dark' }),
      V('rope', 'Rope Weave', { body: 'rope' }),
    ]),
];
