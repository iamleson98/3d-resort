/** Architecture — screens, glazing, doors, columns, arches, fireplace. */
import type { CatalogEntry } from '../../shared/domain/types';
import { V, def } from './define';

export const ARCHITECTURE: CatalogEntry[] = [
  def('partition_screen', 'Lattice Room Screen', 'architecture',
    'Three-panel divider with a woven lattice core.',
    [1.6, 0.06, 1.85], 1240, 'partition_screen', [
      V('rattan', 'Rattan & Teak', { frame: 'wood_teak', panel: 'rattan' }),
      V('walnut', 'Walnut Slats', { frame: 'wood_walnut', panel: 'wood_walnut' }),
      V('linen', 'Linen Screen', { frame: 'metal_brass', panel: 'shade_linen' }),
    ]),
  def('window_wall', 'Curtain Wall Panel', 'architecture',
    'Floor-to-ceiling glazing with slim mullions — the sea view.',
    [2.4, 0.12, 2.6], 4400, 'window_wall', [
      V('clear', 'Clear Glazing', { glass: 'glass_clear', frame: 'metal_black' }),
      V('tinted', 'Bronze Glazing', { glass: 'glass_tinted', frame: 'metal_brass' }),
      V('frosted', 'Frosted Glazing', { glass: 'glass_frosted', frame: 'metal_brushed_steel' }),
    ]),
  def('door_panel', 'Vault Door', 'architecture',
    'Full-height solid door with a brass pull.',
    [1.0, 0.08, 2.3], 1850, 'door_panel', [
      V('oak', 'Golden Oak', { body: 'wood_oak', pull: 'metal_brass' }),
      V('walnut', 'Walnut', { body: 'wood_walnut', pull: 'metal_brass' }),
      V('wash', 'Whitewash', { body: 'wood_whitewash', pull: 'metal_black' }),
    ]),
  def('column_classic', 'Colonnade Column', 'architecture',
    'Fluted column with a carved capital.',
    [0.5, 0.5, 2.8], 2300, 'column_classic', [
      V('travertine', 'Travertine', { body: 'travertine', base: 'travertine' }),
      V('white', 'Limewash White', { body: 'paint_white', base: 'paint_white' }),
      V('sand', 'Sandstone', { body: 'stone_rock', base: 'stone_rock' }),
    ]),
  def('arch_way', 'Gallery Arch', 'architecture',
    'Sculptural pass-through arch framing suite transitions.',
    [1.4, 0.3, 2.5], 3100, 'arch_way', [
      V('travertine', 'Travertine', { body: 'travertine' }),
      V('wash', 'Whitewash', { body: 'paint_warm' }),
      V('sage', 'Sage Lime', { body: 'paint_sage' }),
    ]),
  def('fireplace', 'Hearth Fireplace', 'architecture',
    'Stone fireplace with a floating mantel and glowing embers.',
    [1.6, 0.5, 1.4], 5600, 'fireplace', [
      V('travertine', 'Travertine', { body: 'travertine', mantel: 'wood_walnut', fire: 'fire_glow' }),
      V('marble', 'Carrara', { body: 'marble_carrara', mantel: 'metal_brass', fire: 'fire_glow' }),
      V('stone', 'Fieldstone', { body: 'stone_rock', mantel: 'wood_oak', fire: 'fire_glow' }),
    ]),
];
