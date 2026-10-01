/** Outdoor — sunbeds, daybed, umbrella, patio table/chair, planters, fire pit. */
import type { CatalogEntry } from '../../shared/domain/types';
import { V, def } from './define';

export const OUTDOOR: CatalogEntry[] = [
  def('lounge_sunbed', 'Sun Deck Lounger', 'outdoor',
    'Adjustable teak sun lounger with a pull-out tray.',
    [1.95, 0.75, 0.9], 1890, 'lounge_sunbed', [
      V('teak_linen', 'Teak & Linen', { frame: 'wood_teak', upholstery: 'linen_white' }),
      V('rattan_white', 'Rattan & Canvas', { frame: 'rattan', upholstery: 'linen_natural' }),
      V('teak_sand', 'Teak & Sand', { frame: 'wood_teak', upholstery: 'towel_sand' }),
    ]),
  def('daybed_canopy', 'Shade Canopy Daybed', 'outdoor',
    'Curved daybed with a hoisted canopy — poolside centerpiece.',
    [2.1, 1.1, 1.9], 4200, 'daybed_canopy', [
      V('teak_linen', 'Teak & Linen', { frame: 'wood_teak', upholstery: 'linen_white', canopy: 'shade_linen' }),
      V('teak_blush', 'Teak & Blush', { frame: 'wood_teak', upholstery: 'velvet_blush', canopy: 'shade_linen' }),
      V('rattan_linen', 'Rattan & Linen', { frame: 'rattan', upholstery: 'linen_natural', canopy: 'shade_linen' }),
    ]),
  def('umbrella_beach', 'Flamingo Beach Umbrella', 'outdoor',
    'Tilt umbrella with the resort monogram canopy.',
    [2.0, 2.0, 2.5], 680, 'umbrella_beach', [
      V('flamingo', 'Flamingo Sand', { canopy: 'accent_flamingo', pole: 'wood_teak' }),
      V('sand', 'Natural Sand', { canopy: 'linen_natural', pole: 'wood_teak' }),
      V('navy', 'Deep Navy', { canopy: 'velvet_navy', pole: 'metal_black' }),
    ]),
  def('outdoor_table', 'Patio Dining Table', 'outdoor',
    'Weatherproof outdoor table with a slatted top.',
    [1.8, 0.95, 0.75], 1650, 'outdoor_table', [
      V('teak', 'Teak Slat', { top: 'wood_teak', frame: 'wood_teak' }),
      V('stone', 'Stone Top', { top: 'stone_rock', frame: 'metal_black' }),
      V('wash', 'Whitewash Slat', { top: 'wood_whitewash', frame: 'wood_whitewash' }),
    ]),
  def('outdoor_chair', 'Lawn Terrace Chair', 'outdoor',
    'Rope-weave outdoor chair on a powder-coated frame.',
    [0.62, 0.65, 0.82], 540, 'outdoor_chair', [
      V('teak_rope', 'Teak & Rope', { frame: 'wood_teak', weave: 'rope' }),
      V('rattan', 'All Rattan', { frame: 'rattan', weave: 'rattan' }),
      V('black_rope', 'Black & Rope', { frame: 'metal_black', weave: 'rope' }),
    ]),
  def('planter_large', 'Grand Planter', 'outdoor',
    'Oversized planter for palms and olive trees.',
    [0.75, 0.75, 0.7], 480, 'planter_large', [
      V('terra', 'Terracotta', { body: 'ceramic_terra', soil: 'plant_soil' }),
      V('stone', 'Cast Stone', { body: 'stone_rock', soil: 'plant_soil' }),
      V('black', 'Ink Glaze', { body: 'ceramic_navy', soil: 'plant_soil' }),
    ]),
  def('firepit', 'Sunset Fire Pit', 'outdoor',
    'Low fire bowl with a hammered copper or stone basin.',
    [1.0, 1.0, 0.45], 1250, 'firepit', [
      V('stone', 'Cast Stone', { body: 'stone_rock', fire: 'fire_glow' }),
      V('copper', 'Hammered Copper', { body: 'metal_copper', fire: 'fire_glow' }),
      V('black', 'Black Steel', { body: 'metal_black', fire: 'fire_glow' }),
    ]),
];
