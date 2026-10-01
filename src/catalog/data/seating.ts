/** Seating — lounge chairs, sofas, dining & accent seating, benches, poufs. */
import type { CatalogEntry } from '../../shared/domain/types';
import { V, def } from './define';

export const SEATING: CatalogEntry[] = [
  def('lounge_armchair', 'Riviera Lounge Armchair', 'seating',
    'Deep-seated club chair with a curved back and hand-stitched upholstery over kiln-dried hardwood.',
    [0.86, 0.9, 0.78], 1890, 'lounge_armchair', [
      V('cognac', 'Walnut & Cognac Leather', { frame: 'wood_walnut', upholstery: 'leather_cognac', feet: 'metal_brass' }),
      V('ivory', 'Oak & Ivory Bouclé', { frame: 'wood_oak', upholstery: 'boucle_ivory', feet: 'metal_brushed_steel' }),
      V('emerald', 'Brass & Emerald Velvet', { frame: 'metal_brass', upholstery: 'velvet_emerald', feet: 'metal_brass' }),
      V('charcoal', 'Ebonized & Charcoal', { frame: 'wood_wenge', upholstery: 'velvet_charcoal', feet: 'metal_black' }),
    ]),
  def('sofa_3seat', 'Lan Bay Three-Seat Sofa', 'seating',
    'Low-slung resort sofa with feather-blend cushions and a solid timber base.',
    [2.3, 0.95, 0.82], 4650, 'sofa_3seat', [
      V('cognac', 'Cognac Leather', { frame: 'wood_walnut', upholstery: 'leather_cognac', feet: 'metal_brass' }),
      V('linen', 'Natural Linen', { frame: 'wood_oak', upholstery: 'linen_natural', feet: 'wood_oak' }),
      V('emerald', 'Emerald Velvet', { frame: 'wood_wenge', upholstery: 'velvet_emerald', feet: 'metal_black' }),
      V('blush', 'Blush Velvet', { frame: 'metal_brass', upholstery: 'velvet_blush', feet: 'metal_brass' }),
    ]),
  def('loveseat', 'Sunset Love Seat', 'seating',
    'Intimate two-seat sofa sized for terraces and reading nooks.',
    [1.55, 0.9, 0.8], 3180, 'sofa_3seat', [
      V('boucle', 'Ivory Bouclé', { frame: 'wood_oak', upholstery: 'boucle_ivory', feet: 'wood_oak' }, 0.68),
      V('linen', 'White Linen', { frame: 'wood_whitewash', upholstery: 'linen_white', feet: 'wood_whitewash' }, 0.68),
      V('navy', 'Midnight Velvet', { frame: 'wood_wenge', upholstery: 'velvet_navy', feet: 'metal_black' }, 0.68),
    ], { params: { compact: true } }),
  def('dining_chair', 'Gia Dining Chair', 'seating',
    'Sculptural dining chair with a woven cane back and tailored seat pad.',
    [0.5, 0.52, 0.85], 620, 'dining_chair', [
      V('oak_cognac', 'Oak & Cognac', { frame: 'wood_oak', upholstery: 'leather_cognac', cane: 'rattan' }),
      V('walnut_cream', 'Walnut & Cream', { frame: 'wood_walnut', upholstery: 'linen_white', cane: 'rattan' }),
      V('wash_sage', 'Whitewash & Sage', { frame: 'wood_whitewash', upholstery: 'paint_sage', cane: 'rattan' }),
      V('wenge_charcoal', 'Ebonized & Charcoal', { frame: 'wood_wenge', upholstery: 'velvet_charcoal', cane: 'wicker_dark' }),
    ]),
  def('bar_stool', 'Marina Bar Stool', 'seating',
    'Counter-height stool with a shaped seat and brass footrest.',
    [0.42, 0.42, 1.05], 480, 'bar_stool', [
      V('walnut', 'Walnut & Brass', { frame: 'wood_walnut', seat: 'leather_cognac', feet: 'metal_brass' }),
      V('black', 'Matte Black', { frame: 'metal_black', seat: 'leather_black', feet: 'metal_black' }),
      V('rattan', 'Rattan & Rope', { frame: 'rattan', seat: 'rattan', feet: 'wood_teak' }),
    ]),
  def('slipper_chair', 'Boudoir Slipper Chair', 'seating',
    'Armless accent chair with a tight back — ideal beside a vanity.',
    [0.62, 0.66, 0.72], 780, 'slipper_chair', [
      V('blush', 'Blush Velvet', { frame: 'metal_brass', upholstery: 'velvet_blush' }),
      V('ivory', 'Ivory Bouclé', { frame: 'wood_oak', upholstery: 'boucle_ivory' }),
      V('sage', 'Sage Linen', { frame: 'wood_whitewash', upholstery: 'linen_natural' }),
    ]),
  def('bench_upholstered', 'Lagoon Upholstered Bench', 'seating',
    'Cushioned bench for foot-of-bed seating and gallery walls.',
    [1.5, 0.45, 0.48], 1120, 'bench_upholstered', [
      V('linen', 'Natural Linen', { frame: 'wood_oak', upholstery: 'linen_natural' }),
      V('boucle', 'Ivory Bouclé', { frame: 'metal_brass', upholstery: 'boucle_ivory' }),
      V('leather', 'Saddle Leather', { frame: 'wood_walnut', upholstery: 'leather_tan' }),
    ]),
  def('bench_wood', 'Teak Promenade Bench', 'seating',
    'Solid slatted bench with a hand-rubbed oil finish.',
    [1.6, 0.42, 0.45], 960, 'bench_wood', [
      V('oak', 'Golden Oak', { frame: 'wood_oak' }),
      V('wenge', 'Ebonized Oak', { frame: 'wood_wenge' }),
      V('wash', 'Whitewash', { frame: 'wood_whitewash' }),
    ]),
  def('pouf', 'Coral Pouf', 'seating',
    'Knitted floor cushion — extra seating that doubles as an ottoman.',
    [0.6, 0.6, 0.4], 340, 'pouf', [
      V('boucle', 'Ivory Bouclé', { upholstery: 'boucle_ivory' }),
      V('navy', 'Midnight Velvet', { upholstery: 'velvet_navy' }),
      V('leather', 'Tan Leather', { upholstery: 'leather_tan' }),
    ]),
  def('chaise_longue', 'Cat Ba Chaise Longue', 'seating',
    'Reclining chaise with a tilted backrest — the resort signature piece.',
    [1.65, 0.72, 0.9], 3480, 'chaise_longue', [
      V('teak_linen', 'Teak & Natural Linen', { frame: 'wood_teak', upholstery: 'linen_natural' }),
      V('rattan_linen', 'Rattan & White Linen', { frame: 'rattan', upholstery: 'linen_white' }),
      V('walnut_blush', 'Walnut & Blush Velvet', { frame: 'wood_walnut', upholstery: 'velvet_blush' }),
    ]),
];
