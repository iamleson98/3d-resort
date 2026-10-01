/** Deluxe King Room — 46 m² entry suite. */
import type { Suite } from '../../../shared/domain/types';
import { P } from './place';

export const DELUXE_KING: Suite = {
  id: 'deluxe-king',
  label: 'Deluxe King',
  tagline: 'Quiet mornings over the bay',
  rate: 480,
  size: 46,
  room: {
    kind: 'bedroom',
    width: 6.5,
    depth: 5.5,
    height: 2.9,
    floorMaterial: 'wood_oak',
    wallMaterial: 'paint_warm',
    openings: [{ side: 'north', start: 1.4, len: 3.6 }],
  },
  placements: [
    P('bed_king', 'linen_oak', 3.25, 2.3, 180),
    P('nightstand', 'oak', 1.9, 1.1, 0),
    P('nightstand', 'oak', 4.6, 1.1, 0),
    P('rug_area', 'border', 3.25, 3.6, 0),
    P('lounge_armchair', 'cognac', 1.2, 4.2, 135),
    P('side_table', 'brass_marble', 2.05, 4.5, 0),
    P('floor_lamp_arc', 'brass_linen', 1.0, 3.3, 0),
    P('console_table', 'oak_rattan', 5.6, 4.6, -90),
    P('table_lamp', 'sand', 5.6, 4.6, 0),
    P('artwork_large', 'arc', 5.55, 2.2, -90),
    P('plant_potted', 'snake', 5.7, 1.0, 0),
    P('vanity_table', 'oak_rattan', 1.1, 1.0, 90),
    P('mirror_wall', 'brass', 0.2, 1.6, 90, 'bath'),
    P('wardrobe', 'wash', 0.8, 4.4, 90),
    P('pendant_dome', 'brass', 3.25, 1.2, 0),
    P('bench_upholstered', 'linen', 3.25, 4.4, 0),
    P('books_stack', 'cognac', 5.6, 4.6, 0),
    P('vase_table', 'terra', 2.05, 4.5, 0),
  ],
  zones: [
    { id: 'overview', label: 'Overview', target: [3.2, 1.2, 3], radius: 6.2, theta: Math.PI * 0.15, phi: Math.PI * 0.4, note: 'The complete suite at a glance' },
    { id: 'bed', label: 'Sanctuary Bed', target: [3.2, 0.9, 2.3], radius: 3.4, theta: Math.PI * 0.5, phi: Math.PI * 0.44, note: 'Channel-tufted headboard in natural linen' },
    { id: 'lounge', label: 'Reading Corner', target: [1.6, 0.9, 4.1], radius: 2.6, theta: -Math.PI * 0.2, phi: Math.PI * 0.42, note: 'Cognac leather + brass arc lamp' },
    { id: 'bath', label: 'Vanity', target: [1.2, 1.2, 1.2], radius: 2.2, theta: Math.PI * 0.8, phi: Math.PI * 0.4, note: 'Oak vanity with rattan detailing' },
  ],
};
