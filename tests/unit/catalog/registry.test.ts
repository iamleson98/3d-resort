/** Catalog integrity — ids, variants, materials, dimensions, builders. */
import { describe, it, expect } from 'vitest';
import { CATALOG, getEntry, categories, getVariant, variantCount, referencedMaterialIds, entriesByCategory } from '@/catalog';
import { BUILDERS } from '@/catalog/builders';
import { MATERIAL_ID_SET } from '@/assets/materials/materialIds';
import { CATEGORIES } from '@/shared/domain/types';

describe('catalog registry', () => {
  it('has ≥ 60 models', () => {
    expect(CATALOG.length).toBeGreaterThanOrEqual(60);
  });
  it('has ≥ 180 variants', () => {
    expect(variantCount()).toBeGreaterThanOrEqual(180);
  });
  it('all ids unique', () => {
    const ids = CATALOG.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('every model has ≥ 3 variants', () => {
    for (const e of CATALOG) {
      expect(e.variants.length, `${e.id} variants`).toBeGreaterThanOrEqual(3);
    }
  });
  it('variant ids unique within a model', () => {
    for (const e of CATALOG) {
      const ids = e.variants.map((v) => v.id);
      expect(new Set(ids).size, `${e.id} variant ids`).toBe(ids.length);
    }
  });
  it('all 10 categories populated', () => {
    for (const c of CATEGORIES) {
      expect(entriesByCategory(c).length, `category ${c}`).toBeGreaterThanOrEqual(5);
    }
    expect(categories().length).toBe(CATEGORIES.length);
  });
  it('sane dimensions & prices', () => {
    for (const e of CATALOG) {
      expect(e.dimensions.w).toBeGreaterThan(0.01);
      expect(e.dimensions.d).toBeGreaterThan(0.01);
      expect(e.dimensions.h).toBeGreaterThan(0.01);
      expect(e.dimensions.w).toBeLessThan(4.5);
      expect(e.dimensions.h).toBeLessThan(4.0);
      expect(e.price).toBeGreaterThan(0);
      expect(e.label.length).toBeGreaterThan(3);
      expect(e.description.length).toBeGreaterThan(20);
    }
  });
  it('every model references a registered builder', () => {
    for (const e of CATALOG) {
      expect(BUILDERS[e.builder], `builder for ${e.id}`).toBeDefined();
    }
  });
  it('every builder id is used by some model', () => {
    const used = new Set(CATALOG.map((e) => e.builder));
    for (const id of Object.keys(BUILDERS)) {
      expect(used.has(id), `orphan builder ${id}`).toBe(true);
    }
  });
  it('every referenced material id exists in the material registry', () => {
    const refs = referencedMaterialIds();
    const unknown = [...refs].filter((m) => !MATERIAL_ID_SET.has(m));
    expect(unknown, `unknown materials: ${unknown.join(', ')}`).toEqual([]);
  });
  it('variant scales are positive and sane', () => {
    for (const e of CATALOG) {
      for (const v of e.variants) {
        const s = v.scale ?? 1;
        expect(s).toBeGreaterThan(0.3);
        expect(s).toBeLessThan(2.0);
      }
    }
  });
});

describe('catalog lookups', () => {
  it('getEntry finds and misses', () => {
    expect(getEntry('bed_king')?.label).toBe('Sanctuary King Bed');
    expect(getEntry('does-not-exist')).toBeUndefined();
  });
  it('getVariant falls back to default', () => {
    const e = getEntry('bed_king')!;
    expect(getVariant(e, 'linen_oak').id).toBe('linen_oak');
    expect(getVariant(e, 'nope').id).toBe(e.variants[0]!.id);
  });
  it('defaultMaterials mirrors first variant', () => {
    for (const e of CATALOG) {
      expect(e.defaultMaterials).toEqual(Object.values(e.variants[0]!.materials));
    }
  });
});
