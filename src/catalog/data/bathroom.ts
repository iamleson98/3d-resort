/** Bathroom — tub, vanity, shower, WC, towels, vessel sink. */
import type { CatalogEntry } from '../../shared/domain/types';
import { V, def } from './define';

export const BATHROOM: CatalogEntry[] = [
  def('bathtub_freestanding', 'Island Stone Tub', 'bathroom',
    'Freestanding soaking tub with a matte island-stone finish.',
    [1.75, 0.85, 0.62], 8900, 'bathtub_freestanding', [
      V('white', 'Matte White', { body: 'ceramic_white', fixture: 'metal_brass' }),
      V('stone', 'Travertine', { body: 'travertine', fixture: 'metal_brass' }),
      V('black', 'Ink Black', { body: 'ceramic_navy', fixture: 'metal_brushed_steel' }),
    ]),
  def('vanity_double', 'Twin Vanity', 'bathroom',
    'Double-sink vanity with a stone counter and mirror pair.',
    [1.8, 0.6, 1.3], 5200, 'vanity_double', [
      V('walnut_marble', 'Walnut & Carrara', { body: 'wood_walnut', top: 'marble_carrara', basin: 'ceramic_white', mirror: 'mirror' }),
      V('oak_white', 'Oak & White', { body: 'wood_oak', top: 'ceramic_matte', basin: 'ceramic_white', mirror: 'mirror' }),
      V('wash_green', 'Whitewash & Celadon', { body: 'wood_whitewash', top: 'tile_green', basin: 'ceramic_green', mirror: 'mirror' }),
    ]),
  def('shower_glass', 'Walk-in Shower Screen', 'bathroom',
    'Fixed single-panel shower screen with a brass stabilizer bar.',
    [1.2, 0.04, 2.0], 2100, 'shower_glass', [
      V('clear', 'Low-iron Clear', { glass: 'glass_clear', frame: 'metal_brass' }),
      V('tinted', 'Bronze Tint', { glass: 'glass_tinted', frame: 'metal_black' }),
      V('frosted', 'Frosted Privacy', { glass: 'glass_frosted', frame: 'metal_brushed_steel' }),
    ]),
  def('toilet', 'Wall-Hung WC', 'bathroom',
    'Rimless wall-hung toilet with a soft-close seat.',
    [0.38, 0.55, 0.85], 1180, 'toilet', [
      V('white', 'Gloss White', { body: 'ceramic_white', seat: 'ceramic_matte', button: 'metal_brass' }),
      V('cream', 'Soft Cream', { body: 'ceramic_matte', seat: 'ceramic_matte', button: 'metal_brushed_steel' }),
      V('sand', 'Sand Tone', { body: 'ceramic_sand', seat: 'ceramic_matte', button: 'metal_black' }),
    ]),
  def('towel_rack', 'Ladder Towel Rack', 'bathroom',
    'Wall-mounted ladder in solid brass or oak.',
    [0.6, 0.08, 1.1], 420, 'towel_rack', [
      V('brass', 'Solid Brass', { frame: 'metal_brass', towels: 'towel_white' }),
      V('black', 'Matte Black', { frame: 'metal_black', towels: 'towel_sand' }),
      V('oak', 'Golden Oak', { frame: 'wood_oak', towels: 'towel_white' }),
    ]),
  def('sink_vessel', 'Vessel Basin', 'bathroom',
    'Countertop vessel sink, artisan-thrown.',
    [0.45, 0.45, 0.35], 760, 'sink_vessel', [
      V('white', 'Gloss White', { body: 'ceramic_white', fixture: 'metal_brass' }),
      V('marble', 'Carrara Carved', { body: 'marble_carrara', fixture: 'metal_brass' }),
      V('copper', 'Hammered Copper', { body: 'metal_copper', fixture: 'metal_copper' }),
    ]),
];
