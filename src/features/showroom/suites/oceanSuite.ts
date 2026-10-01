/** Ocean Suite — 72 m² living + sleeping. */
import type { Suite } from '../../../shared/domain/types';
import { P } from './place';

export const OCEAN_SUITE: Suite = {
  id: 'ocean-suite',
  label: 'Ocean Suite',
  tagline: 'Where the karsts meet the water',
  rate: 760,
  size: 72,
  room: {
    kind: 'living',
    width: 8.2,
    depth: 6.8,
    height: 3.0,
    floorMaterial: 'wood_teak',
    wallMaterial: 'paint_white',
    openings: [
      { side: 'north', start: 1.0, len: 6.2 },
      { side: 'east', start: 4.2, len: 2.0 },
    ],
  },
  placements: [
    // living half (south)
    P('sofa_3seat', 'linen', 3.0, 5.3, 0),
    P('coffee_table_rect', 'travertine', 3.0, 4.1, 0),
    P('rug_area', 'abstract', 3.0, 4.7, 0),
    P('lounge_armchair', 'ivory', 5.4, 5.1, -120),
    P('lounge_armchair', 'ivory', 0.9, 5.0, 120),
    P('side_table', 'black_oak', 5.6, 5.9, 0),
    P('floor_lamp_column', 'black_linen', 6.9, 5.6, 0),
    P('tv_console', 'walnut', 3.0, 6.5, 180),
    P('pouf', 'boucle', 4.4, 4.0, 0),
    P('artwork_large', 'abstract', 3.0, 6.62, 180),
    P('palm_areca', 'terra', 7.3, 5.9, 0),
    P('pendant_cluster', 'brass', 3.0, 4.1, 0),
    // sleeping half (north, by the window)
    P('bed_king', 'blush', 3.0, 1.9, 180),
    P('nightstand', 'walnut', 1.6, 0.9, 0),
    P('nightstand', 'walnut', 4.4, 0.9, 0),
    P('bench_upholstered', 'boucle', 3.0, 3.3, 0),
    P('mirror_floor', 'brass', 7.2, 2.6, 0),
    P('vase_floor', 'sand', 0.7, 2.9, 0),
    P('plant_potted', 'fern', 0.6, 0.8, 0),
    P('table_lamp', 'green', 1.6, 0.9, 0),
    P('books_stack', 'sage', 4.4, 0.9, 0),
  ],
  zones: [
    { id: 'overview', label: 'Overview', target: [4.0, 1.3, 3.6], radius: 7.6, theta: Math.PI * 0.15, phi: Math.PI * 0.4, note: 'One continuous volume, two moods' },
    { id: 'living', label: 'Lounge', target: [3.4, 1.0, 4.8], radius: 3.8, theta: -Math.PI * 0.15, phi: Math.PI * 0.43, note: 'Feather-blend sofa over teak floors' },
    { id: 'sleep', label: 'Sleep Bay', target: [3.0, 0.9, 1.9], radius: 3.2, theta: Math.PI * 0.5, phi: Math.PI * 0.44, note: 'Blush velvet against the sea glass' },
    { id: 'window', label: 'Sea Window', target: [4.2, 1.4, 0.7], radius: 3.0, theta: Math.PI * 0.9, phi: Math.PI * 0.46, note: 'Six meters of Lan Ha Bay' },
  ],
};
