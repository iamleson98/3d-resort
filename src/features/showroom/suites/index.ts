/** Suite registry — all showcase suites. */
import type { Suite } from '../../../shared/domain/types';
import { DELUXE_KING } from './deluxeKing';
import { OCEAN_SUITE } from './oceanSuite';
import { GARDEN_VILLA } from './gardenVilla';
import { CLIFFSIDE_PENTHOUSE } from './cliffsidePenthouse';
import { BEACHFRONT_VILLA } from './beachfrontVilla';

export const SUITES: readonly Suite[] = Object.freeze([
  DELUXE_KING,
  OCEAN_SUITE,
  GARDEN_VILLA,
  CLIFFSIDE_PENTHOUSE,
  BEACHFRONT_VILLA,
]);

export function getSuite(id: string): Suite | undefined {
  return SUITES.find((s) => s.id === id);
}
