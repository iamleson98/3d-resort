/** Shared helpers for catalog category files. */
import type { CatalogEntry, ModelVariant } from '../../shared/domain/types';

export const V = (
  id: string,
  label: string,
  materials: Record<string, string>,
  scale?: number,
  params?: Record<string, string | number | boolean>,
): ModelVariant => ({ id, label, materials, scale, params });

export interface DefOptions {
  /** Params merged into every variant (e.g. compact, wide). */
  params?: Record<string, string | number | boolean>;
}

export const def = (
  id: string,
  label: string,
  category: CatalogEntry['category'],
  description: string,
  dims: [number, number, number],
  price: number,
  builder: string,
  variants: ModelVariant[],
  options: DefOptions = {},
): CatalogEntry => {
  const merged = options.params
    ? variants.map((v) => ({ ...v, params: { ...options.params, ...v.params } }))
    : variants;
  return {
    id,
    label,
    category,
    description,
    dimensions: { w: dims[0], d: dims[1], h: dims[2] },
    price,
    defaultMaterials: Object.values(merged[0]!.materials),
    variants: merged,
    builder,
  };
};
