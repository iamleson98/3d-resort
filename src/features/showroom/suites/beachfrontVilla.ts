/** Beachfront Villa — 210 m² estate with terrace. */
import type { Suite } from '../../../shared/domain/types';
import { P } from './place';

export const BEACHFRONT_VILLA: Suite = {
  id: 'beachfront-villa',
  label: 'Beachfront Villa',
  tagline: 'Sand, teak and slow afternoons',
  rate: 2650,
  size: 210,
  room: {
    kind: 'villa',
    width: 13.8,
    depth: 9.4,
    height: 3.4,
    floorMaterial: 'wood_whitewash',
    wallMaterial: 'paint_clay',
    openings: [
      { side: 'north', start: 0.6, len: 12.6 },
      { side: 'east', start: 5.4, len: 3.4 },
    ],
  },
  placements: [
    // open lounge
    P('sofa_3seat', 'blush', 4.2, 6.8, 0),
    P('loveseat', 'boucle', 1.8, 5.4, 60),
    P('coffee_table_round', 'travertine', 4.2, 5.6, 0),
    P('rug_area', 'stripes', 4.2, 6.2, 0),
    P('pouf', 'leather', 5.8, 5.4, 0),
    P('side_table', 'rattan', 2.6, 6.4, 0),
    P('floor_lamp_arc', 'brass_linen', 1.4, 6.6, 0),
    P('tv_console', 'wash', 4.2, 8.9, 180),
    P('partition_screen', 'rattan', 8.6, 7.2, -90),
    P('artwork_large', 'terracotta', 4.2, 9.25, 180),
    P('olive_tree', 'wash', 12.6, 8.2, 0),
    P('basket_weave', 'rattan', 1.0, 8.6, 0),
    // dining
    P('dining_table', 'wash', 8.4, 3.2, 90),
    P('dining_chair', 'wash_sage', 7.4, 2.4, 90),
    P('dining_chair', 'wash_sage', 7.4, 4.0, 90),
    P('dining_chair', 'wash_sage', 9.4, 2.4, -90),
    P('dining_chair', 'wash_sage', 9.4, 4.0, -90),
    P('pendant_dome', 'brass', 8.4, 3.2, 0),
    // master bed
    P('bed_king', 'linen_oak', 3.4, 1.9, 180),
    P('nightstand', 'wash', 2.0, 0.9, 0),
    P('nightstand', 'wash', 4.8, 0.9, 0),
    P('bench_wood', 'wash', 3.4, 3.5, 0),
    P('vanity_table', 'oak_rattan', 6.6, 1.1, 0),
    P('mirror_floor', 'walnut', 7.9, 2.6, 0),
    P('vase_floor', 'terra', 0.9, 2.6, 0),
    P('plant_potted', 'peace', 6.6, 1.1, 0),
    // bath
    P('bathtub_freestanding', 'white', 11.8, 7.9, 0),
    P('vanity_double', 'oak_white', 9.8, 8.9, 180),
    P('shower_glass', 'clear', 12.9, 5.6, -90),
    P('sink_vessel', 'marble', 9.8, 8.9, 0),
    P('towel_rack', 'oak', 13.2, 6.8, -90),
    // terrace spill (inside coords, near the open wall)
    P('lounge_sunbed', 'teak_linen', 1.8, 0.9, 0),
    P('lounge_sunbed', 'teak_linen', 4.0, 0.9, 0),
    P('umbrella_beach', 'flamingo', 2.9, 1.0, 0),
    P('firepit', 'copper', 11.0, 1.6, 0),
    P('daybed_canopy', 'teak_linen', 8.0, 1.2, 0),
    P('planter_large', 'terra', 12.4, 0.8, 0),
    P('plant_hanging', 'pothos', 6.2, 0.7, 0),
  ],
  zones: [
    { id: 'overview', label: 'Overview', target: [6.8, 1.5, 4.8], radius: 11.5, theta: Math.PI * 0.15, phi: Math.PI * 0.36, note: 'Whitewashed oak from wall to sea wall' },
    { id: 'lounge', label: 'Open Lounge', target: [4.2, 1.1, 6.2], radius: 4.8, theta: -Math.PI * 0.08, phi: Math.PI * 0.42, note: 'Blush velvet, rattan, slow light' },
    { id: 'terrace', label: 'Beach Terrace', target: [3.0, 0.8, 1.2], radius: 4.6, theta: Math.PI * 0.5, phi: Math.PI * 0.38, note: 'Flamingo umbrella on the sand line' },
    { id: 'dining', label: 'Dining', target: [8.4, 1.2, 3.2], radius: 3.6, theta: Math.PI * 0.55, phi: Math.PI * 0.42, note: 'Whitewash plank under brass domes' },
    { id: 'bed', label: 'Master Bed', target: [3.4, 0.9, 1.9], radius: 3.4, theta: Math.PI * 0.5, phi: Math.PI * 0.44, note: 'Linen headboard, sea air' },
    { id: 'bath', label: 'Spa Bath', target: [11.6, 0.9, 7.4], radius: 3.8, theta: Math.PI * 0.85, phi: Math.PI * 0.4, note: 'Soaking tub + walk-in rain shower' },
  ],
};
