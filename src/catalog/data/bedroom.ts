/** Bedroom — beds, nightstands, case goods, mirrors, vanity. */
import type { CatalogEntry } from '../../shared/domain/types';
import { V, def } from './define';

export const BEDROOM: CatalogEntry[] = [
  def('bed_king', 'Sanctuary King Bed', 'bedroom',
    'Upholstered king bed with a tall channel headboard and floating base.',
    [2.0, 2.15, 1.15], 6900, 'bed_king', [
      V('linen_oak', 'Natural Linen & Oak', { frame: 'wood_oak', upholstery: 'linen_natural', bedding: 'sheet_white' }),
      V('blush', 'Blush Velvet & Brass', { frame: 'metal_brass', upholstery: 'velvet_blush', bedding: 'sheet_white' }),
      V('emerald', 'Emerald Velvet & Wenge', { frame: 'wood_wenge', upholstery: 'velvet_emerald', bedding: 'sheet_sand' }),
      V('cream', 'Cream Linen & Whitewash', { frame: 'wood_whitewash', upholstery: 'linen_white', bedding: 'sheet_sand' }),
    ]),
  def('bed_queen', 'Sanctuary Queen Bed', 'bedroom',
    'The Sanctuary silhouette, sized for closer quarters.',
    [1.6, 2.1, 1.15], 5400, 'bed_king', [
      V('linen_oak', 'Natural Linen & Oak', { frame: 'wood_oak', upholstery: 'linen_natural', bedding: 'sheet_white' }, 0.9),
      V('navy', 'Navy Velvet & Brass', { frame: 'metal_brass', upholstery: 'velvet_navy', bedding: 'sheet_white' }, 0.9),
      V('walnut', 'Walnut & Sand', { frame: 'wood_walnut', upholstery: 'linen_natural', bedding: 'sheet_sand' }, 0.9),
    ], { params: { compact: true } }),
  def('nightstand', 'Dock Nightstand', 'bedroom',
    'Two-drawer bedside with a USB-ready charging tray top.',
    [0.55, 0.42, 0.58], 780, 'nightstand', [
      V('oak', 'Golden Oak', { body: 'wood_oak', top: 'wood_oak', knob: 'metal_brass' }),
      V('walnut', 'Walnut & Brass', { body: 'wood_walnut', top: 'wood_walnut', knob: 'metal_brass' }),
      V('wash', 'Whitewash & Rattan', { body: 'wood_whitewash', top: 'rattan', knob: 'rattan' }),
      V('black', 'Ebonized & Steel', { body: 'wood_wenge', top: 'wood_wenge', knob: 'metal_brushed_steel' }),
    ]),
  def('dresser', 'Atelier Dresser', 'bedroom',
    'Six-drawer wide dresser with fluted fronts.',
    [1.6, 0.5, 0.8], 2890, 'dresser', [
      V('walnut', 'Walnut', { body: 'wood_walnut', top: 'marble_carrara', knob: 'metal_brass' }),
      V('oak', 'Oak', { body: 'wood_oak', top: 'wood_oak', knob: 'metal_brass' }),
      V('wenge', 'Ebonized', { body: 'wood_wenge', top: 'marble_nero', knob: 'metal_brushed_steel' }),
    ]),
  def('wardrobe', 'Voyage Wardrobe', 'bedroom',
    'Two-door wardrobe with cane panels and an interior lighting rail.',
    [1.5, 0.62, 2.1], 4600, 'wardrobe', [
      V('wash', 'Whitewash & Cane', { body: 'wood_whitewash', panel: 'rattan', knob: 'metal_brass' }),
      V('walnut', 'Walnut & Cane', { body: 'wood_walnut', panel: 'rattan', knob: 'metal_brass' }),
      V('sage', 'Sage & Rattan', { body: 'paint_sage', panel: 'rattan', knob: 'wood_oak' }),
    ]),
  def('mirror_floor', 'Gallery Floor Mirror', 'bedroom',
    'Lean-to full mirror with a slim metal frame.',
    [0.7, 0.06, 1.8], 1350, 'mirror_floor', [
      V('brass', 'Antique Brass', { frame: 'metal_brass', mirror: 'mirror' }),
      V('black', 'Matte Black', { frame: 'metal_black', mirror: 'mirror' }),
      V('walnut', 'Walnut', { frame: 'wood_walnut', mirror: 'mirror' }),
    ]),
  def('mirror_wall', 'Sun Arch Mirror', 'bedroom',
    'Arched wall mirror with rounded-corner frame.',
    [0.75, 0.06, 1.1], 890, 'mirror_wall', [
      V('brass', 'Antique Brass', { frame: 'metal_brass', mirror: 'mirror' }),
      V('black', 'Matte Black', { frame: 'metal_black', mirror: 'mirror' }),
      V('walnut', 'Walnut', { frame: 'wood_walnut', mirror: 'mirror' }),
    ]),
  def('vanity_table', 'Boudoir Vanity', 'bedroom',
    'Tripod vanity with a tilting oval mirror and drawers.',
    [1.0, 0.45, 1.35], 2100, 'vanity_table', [
      V('walnut_brass', 'Walnut & Brass', { body: 'wood_walnut', top: 'marble_carrara', mirror: 'mirror', frame: 'metal_brass' }),
      V('oak_rattan', 'Oak & Rattan', { body: 'wood_oak', top: 'wood_oak', mirror: 'mirror', frame: 'rattan' }),
      V('wash_brass', 'Whitewash & Brass', { body: 'wood_whitewash', top: 'marble_carrara', mirror: 'mirror', frame: 'metal_brass' }),
    ]),
];
