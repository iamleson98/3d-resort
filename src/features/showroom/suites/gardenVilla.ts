/** Garden Villa — 105 m² with bath suite. */
import type { Suite } from '../../../shared/domain/types';
import { P } from './place';

export const GARDEN_VILLA: Suite = {
  id: 'garden-villa',
  label: 'Garden Villa',
  tagline: 'A private garden, a stone bath',
  rate: 1120,
  size: 105,
  room: {
    kind: 'villa',
    width: 10.4,
    depth: 7.6,
    height: 3.2,
    floorMaterial: 'travertine',
    wallMaterial: 'paint_sage',
    openings: [
      { side: 'north', start: 0.8, len: 7.6 },
      { side: 'west', start: 4.6, len: 2.4 },
    ],
  },
  placements: [
    // living
    P('sofa_3seat', 'emerald', 3.4, 5.8, 0),
    P('coffee_table_round', 'white_brass', 3.4, 4.6, 0),
    P('rug_area', 'diamond', 3.4, 5.2, 0),
    P('chaise_longue', 'teak_linen', 6.4, 5.6, -110),
    P('console_table', 'black_brass', 1.0, 6.9, 90),
    P('floor_lamp_arc', 'black_linen', 1.2, 5.2, 0),
    P('monstera', 'grand', 9.2, 6.3, 0),
    P('olive_tree', 'standard', 0.9, 3.4, 0),
    P('artwork_pair', 'blocks', 1.06, 3.0, 90),
    P('fireplace', 'travertine', 5.4, 7.3, 180),
    // dining
    P('dining_table', 'oak', 7.6, 3.0, 90),
    P('dining_chair', 'oak_cognac', 6.6, 2.2, 90),
    P('dining_chair', 'oak_cognac', 6.6, 3.8, 90),
    P('dining_chair', 'walnut_cream', 8.6, 2.2, -90),
    P('dining_chair', 'walnut_cream', 8.6, 3.8, -90),
    P('pendant_dome', 'linen', 7.6, 3.0, 0),
    // bedroom
    P('bed_king', 'emerald', 2.8, 1.6, 180),
    P('nightstand', 'wash', 1.5, 0.7, 0),
    P('nightstand', 'wash', 4.1, 0.7, 0),
    P('wardrobe', 'sage', 8.9, 0.9, -90),
    P('mirror_floor', 'black', 5.6, 1.4, 0),
    P('plant_tall_corner', 'standard', 9.4, 1.6, 0),
    // bath
    P('bathtub_freestanding', 'stone', 7.9, 6.4, 0),
    P('vanity_double', 'wash_green', 5.6, 6.9, 180),
    P('towel_rack', 'brass', 9.6, 4.4, -90),
    P('plant_potted', 'peace', 6.7, 6.6, 0),
  ],
  zones: [
    { id: 'overview', label: 'Overview', target: [5.0, 1.4, 4.0], radius: 9.0, theta: Math.PI * 0.15, phi: Math.PI * 0.38, note: 'Travertine floors, sage lime walls' },
    { id: 'living', label: 'Fireplace Lounge', target: [3.6, 1.1, 5.4], radius: 4.2, theta: -Math.PI * 0.1, phi: Math.PI * 0.42, note: 'Emerald velvet by the hearth' },
    { id: 'dining', label: 'Dining Nook', target: [7.6, 1.2, 3.0], radius: 3.4, theta: Math.PI * 0.55, phi: Math.PI * 0.42, note: 'Oak plank table for six' },
    { id: 'bed', label: 'Garden Bed', target: [2.8, 0.9, 1.6], radius: 3.2, theta: Math.PI * 0.5, phi: Math.PI * 0.44, note: 'Emerald velvet, garden view' },
    { id: 'bath', label: 'Stone Bath', target: [7.6, 0.9, 6.2], radius: 3.4, theta: Math.PI * 0.85, phi: Math.PI * 0.4, note: 'Travertine soaking tub' },
  ],
};
