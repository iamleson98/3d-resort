/** Cliffside Penthouse — 160 m² panoramic residence. */
import type { Suite } from '../../../shared/domain/types';
import { P } from './place';

export const CLIFFSIDE_PENTHOUSE: Suite = {
  id: 'cliffside-penthouse',
  label: 'Cliffside Penthouse',
  tagline: 'The whole bay below you',
  rate: 1980,
  size: 160,
  room: {
    kind: 'living',
    width: 12.4,
    depth: 8.6,
    height: 3.4,
    floorMaterial: 'marble_carrara',
    wallMaterial: 'paint_cream',
    openings: [
      { side: 'north', start: 0.6, len: 8.8 },
      { side: 'east', start: 2.0, len: 4.6 },
    ],
  },
  placements: [
    // grand lounge
    P('sofa_3seat', 'cognac', 3.8, 6.6, 0),
    P('loveseat', 'navy', 1.6, 5.0, 70),
    P('coffee_table_rect', 'nero', 3.8, 5.4, 0),
    P('rug_area', 'border', 3.8, 6.0, 0),
    P('chaise_longue', 'walnut_blush', 6.2, 6.8, -105),
    P('side_table', 'brass_marble', 5.2, 6.9, 0),
    P('floor_lamp_column', 'brass_linen', 7.0, 7.4, 0),
    P('sculpture_object', 'brass', 3.8, 5.4, 0),
    P('artwork_large', 'line', 3.8, 8.45, 180),
    // gallery + bar
    P('console_table', 'wenge_marble', 11.5, 4.4, -90),
    P('bar_cabinet', 'wenge_brass', 11.5, 6.6, -90),
    P('tray_decor', 'brass_marble', 11.5, 6.6, 0),
    P('chandelier', 'brass', 5.6, 3.6, 0),
    P('palm_areca', 'tall', 10.9, 7.9, 0),
    P('plant_tall_corner', 'terra', 0.8, 7.6, 0),
    // dining
    P('dining_table', 'walnut', 8.6, 2.8, 90),
    P('dining_chair', 'walnut_cream', 7.6, 2.0, 90),
    P('dining_chair', 'walnut_cream', 7.6, 3.6, 90),
    P('dining_chair', 'wenge_charcoal', 9.6, 2.0, -90),
    P('dining_chair', 'wenge_charcoal', 9.6, 3.6, -90),
    P('pendant_cluster', 'black', 8.6, 2.8, 0),
    // bedroom
    P('bed_king', 'cream', 3.4, 1.9, 180),
    P('nightstand', 'black', 2.0, 0.9, 0),
    P('nightstand', 'black', 4.8, 0.9, 0),
    P('bench_upholstered', 'leather', 3.4, 3.4, 0),
    P('dresser', 'wenge', 6.8, 0.7, 0),
    P('mirror_floor', 'brass', 7.8, 2.4, 0),
    P('vase_floor', 'navy', 0.9, 2.2, 0),
    P('table_lamp', 'terra', 2.0, 0.9, 0),
    P('books_stack', 'navy', 4.8, 0.9, 0),
    P('plant_potted', 'snake', 6.8, 0.7, 0),
  ],
  zones: [
    { id: 'overview', label: 'Overview', target: [6.0, 1.5, 4.4], radius: 10.5, theta: Math.PI * 0.15, phi: Math.PI * 0.36, note: 'Carrara marble, brass, bay light' },
    { id: 'lounge', label: 'Grand Lounge', target: [3.8, 1.1, 6.0], radius: 4.6, theta: -Math.PI * 0.08, phi: Math.PI * 0.42, note: 'Cognac leather under the chandelier' },
    { id: 'bar', label: 'Bar & Gallery', target: [10.6, 1.4, 5.4], radius: 3.8, theta: Math.PI * 0.6, phi: Math.PI * 0.42, note: 'Wenge bar cabinet with mirrored interior' },
    { id: 'dining', label: 'Dining', target: [8.6, 1.2, 2.8], radius: 3.6, theta: Math.PI * 0.55, phi: Math.PI * 0.42, note: 'Walnut plank for six' },
    { id: 'bed', label: 'Master Bed', target: [3.4, 0.9, 1.9], radius: 3.2, theta: Math.PI * 0.5, phi: Math.PI * 0.44, note: 'Cream linen to the horizon' },
  ],
};
