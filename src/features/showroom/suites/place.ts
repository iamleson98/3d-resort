/** Suite definitions — shared placement helper. */
import type { Suite, SuitePlacement } from '../../../shared/domain/types';

let seq = 0;
export function P(modelId: string, variantId: string, x: number, z: number, rotationDeg = 0, zone?: string): SuitePlacement {
  seq += 1;
  return {
    id: `sp-${modelId}-${seq}`,
    modelId,
    variantId,
    x,
    z,
    rotation: (rotationDeg * Math.PI) / 180,
    zone,
  };
}
export type { Suite };
