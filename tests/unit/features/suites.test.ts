/** Suite definitions — placements in bounds, zones valid, references resolve. */
import { describe, it, expect } from 'vitest';
import { SUITES, getSuite } from '@/features/showroom/suites';
import { getEntry, getVariant } from '@/catalog';
import { MATERIAL_ID_SET } from '@/assets/materials/materialIds';

describe('suite registry', () => {
  it('has exactly 5 suites in ascending rate order', () => {
    expect(SUITES.length).toBe(5);
    const rates = SUITES.map((s) => s.rate);
    expect([...rates].sort((a, b) => a - b)).toEqual(rates);
    expect(rates[0]!).toBeGreaterThanOrEqual(400);
  });
  it('unique ids and labels', () => {
    expect(new Set(SUITES.map((s) => s.id)).size).toBe(SUITES.length);
    expect(new Set(SUITES.map((s) => s.label)).size).toBe(SUITES.length);
  });
  it('rooms have sane dimensions', () => {
    for (const s of SUITES) {
      expect(s.room.width).toBeGreaterThan(4);
      expect(s.room.width).toBeLessThan(16);
      expect(s.room.depth).toBeGreaterThan(4);
      expect(s.room.depth).toBeLessThan(11);
      expect(s.room.height).toBeGreaterThanOrEqual(2.8);
      expect(s.room.height).toBeLessThanOrEqual(3.5);
    }
  });
  it('floor and wall materials exist', () => {
    for (const s of SUITES) {
      expect(MATERIAL_ID_SET.has(s.room.floorMaterial), `${s.id} floor ${s.room.floorMaterial}`).toBe(true);
      expect(MATERIAL_ID_SET.has(s.room.wallMaterial), `${s.id} wall ${s.room.wallMaterial}`).toBe(true);
    }
  });
});

describe('suite placements', () => {
  it('every placement references a real model + variant', () => {
    for (const s of SUITES) {
      for (const p of s.placements) {
        const entry = getEntry(p.modelId);
        expect(entry, `${s.id}:${p.id} model`).toBeDefined();
        const variant = entry!.variants.find((v) => v.id === p.variantId);
        expect(variant, `${s.id}:${p.id} variant ${p.variantId}`).toBeDefined();
      }
    }
  });
  it('placements sit inside the room bounds (with footprint margin)', () => {
    for (const s of SUITES) {
      for (const p of s.placements) {
        const entry = getEntry(p.modelId)!;
        const variant = getVariant(entry, p.variantId);
        const scale = variant.scale ?? 1;
        const hw = (entry.dimensions.w * scale) / 2;
        const hd = (entry.dimensions.d * scale) / 2;
        expect(p.x, `${s.id}:${p.id} x`).toBeGreaterThanOrEqual(-0.35);
        expect(p.x, `${s.id}:${p.id} x`).toBeLessThanOrEqual(s.room.width + 0.35);
        expect(p.z, `${s.id}:${p.id} z`).toBeGreaterThanOrEqual(-0.35);
        expect(p.z, `${s.id}:${p.id} z`).toBeLessThanOrEqual(s.room.depth + 0.35);
        // footprint centers shouldn't be absurdly outside even with margin
        expect(Math.abs(p.x - s.room.width / 2)).toBeLessThan(s.room.width / 2 + hw + 0.5);
        expect(Math.abs(p.z - s.room.depth / 2)).toBeLessThan(s.room.depth / 2 + hd + 0.5);
      }
    }
  });
  it('each suite furnishes ≥ 12 models', () => {
    for (const s of SUITES) {
      expect(s.placements.length, `${s.id} furnished`).toBeGreaterThanOrEqual(12);
    }
  });
  it('contains beds and lighting in every suite', () => {
    for (const s of SUITES) {
      const cats = s.placements.map((p) => getEntry(p.modelId)!.category);
      expect(cats).toContain('bedroom');
      expect(cats).toContain('lighting');
    }
  });
});

describe('suite zones', () => {
  it('every suite has an overview zone + ≥ 4 zones', () => {
    for (const s of SUITES) {
      expect(s.zones.length).toBeGreaterThanOrEqual(4);
      expect(s.zones[0]!.id).toBe('overview');
    }
  });
  it('zone camera targets look inside the room', () => {
    for (const s of SUITES) {
      for (const z of s.zones) {
        expect(z.target[0]).toBeGreaterThanOrEqual(0);
        expect(z.target[0]).toBeLessThanOrEqual(s.room.width);
        expect(z.target[2]).toBeGreaterThanOrEqual(0);
        expect(z.target[2]).toBeLessThanOrEqual(s.room.depth);
        expect(z.radius).toBeGreaterThan(1.5);
        expect(z.radius).toBeLessThan(15);
        if (z.phi !== undefined) {
          expect(z.phi).toBeGreaterThan(0.1);
          expect(z.phi).toBeLessThan(Math.PI / 2);
        }
      }
    }
  });
  it('getSuite finds and misses', () => {
    expect(getSuite('deluxe-king')?.label).toBe('Deluxe King');
    expect(getSuite('nope')).toBeUndefined();
  });
});
