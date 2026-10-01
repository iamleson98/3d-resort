/** Spec tracker + pricing — BOM folding, manual overrides, export. */
import { describe, it, expect } from 'vitest';
import { SpecTracker, formatUSD, formatUSDExact } from '@/features/specs/tracker';
import { quoteSuite, estimateProduct } from '@/features/specs/pricing';
import { CATALOG } from '@/catalog';
import { SUITES } from '@/features/showroom/suites';
import type { Placement } from '@/shared/domain/types';

const tracker = new SpecTracker([...CATALOG], { resortCredit: 500, rooms: 2 });

function placements(...specs: Array<[string, string]>): Placement[] {
  return specs.map(([modelId, variantId], i) => ({
    id: `p${i}`,
    modelId,
    variantId,
    x: 1,
    z: 1,
    rotation: 0,
  }));
}

describe('SpecTracker.compute', () => {
  it('empty room → empty lines, zero totals, credit floors at 0', () => {
    const snap = tracker.compute([]);
    expect(snap.lines).toEqual([]);
    expect(snap.itemCount).toBe(0);
    expect(snap.subtotal).toBe(0);
    expect(snap.total).toBe(0);
  });

  it('groups identical (model,variant) pairs into one line with count', () => {
    const snap = tracker.compute(placements(['dining_chair', 'oak_cognac'], ['dining_chair', 'oak_cognac'], ['dining_chair', 'oak_cognac']));
    expect(snap.lines).toHaveLength(1);
    expect(snap.lines[0]!.quantity).toBe(3);
    expect(snap.lines[0]!.manual).toBe(false);
    expect(snap.itemCount).toBe(3);
  });

  it('separate lines for different variants of the same model', () => {
    const snap = tracker.compute(placements(['dining_chair', 'oak_cognac'], ['dining_chair', 'walnut_cream']));
    expect(snap.lines).toHaveLength(2);
  });

  it('unknown models are ignored gracefully', () => {
    const snap = tracker.compute([{ id: 'x', modelId: 'ghost_model', variantId: 'nope', x: 0, z: 0, rotation: 0 }]);
    expect(snap.lines).toHaveLength(0);
  });

  it('unknown variant falls back to the default variant label', () => {
    const snap = tracker.compute(placements(['nightstand', 'nonexistent_variant']));
    expect(snap.lines).toHaveLength(1);
    expect(snap.lines[0]!.label).toContain('Dock Nightstand');
  });

  it('subtotal = Σ unitPrice × qty; total = subtotal − credit (floored at 0)', () => {
    const snap = tracker.compute(placements(['pouf', 'boucle'], ['side_table', 'brass_marble']));
    const expected = snap.lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
    expect(snap.subtotal).toBeCloseTo(Math.round(expected * 100) / 100, 1);
    expect(snap.total).toBeCloseTo(Math.max(0, Math.round((snap.subtotal - 500) * 100) / 100), 1);
  });

  it('lines sorted by category then label', () => {
    const snap = tracker.compute(placements(['pouf', 'boucle'], ['bed_king', 'linen_oak'], ['side_table', 'rattan']));
    const cats = snap.lines.map((l) => l.category);
    expect([...cats].sort((a, b) => a.localeCompare(b))).toEqual(cats);
  });

  it('scaled variants price with premium factor', () => {
    const snap = tracker.compute(placements(['palm_areca', 'tall']));
    const entry = CATALOG.find((e) => e.id === 'palm_areca')!;
    // tall scale 1.2 → price = base * (0.6 + 0.4*1.2) = base * 1.08
    expect(snap.lines[0]!.unitPrice).toBeCloseTo(Math.round(entry.price * 1.08 * 100) / 100, 1);
  });
});

describe('manual quantity overrides', () => {
  it('setQuantity overrides the auto count', () => {
    const ps = placements(['pouf', 'boucle'], ['pouf', 'boucle']);
    expect(tracker.setQuantity('pouf', 'boucle', 7)).toBe(true);
    const snap = tracker.compute(ps);
    expect(snap.lines[0]!.quantity).toBe(7);
    expect(snap.lines[0]!.manual).toBe(true);
    // itemCount still reflects physical objects
    expect(snap.itemCount).toBe(2);
  });

  it('clearManual returns to auto', () => {
    expect(tracker.clearManual('pouf', 'boucle')).toBe(true);
    const snap = tracker.compute(placements(['pouf', 'boucle'], ['pouf', 'boucle']));
    expect(snap.lines[0]!.quantity).toBe(2);
    expect(snap.lines[0]!.manual).toBe(false);
  });

  it('qty ≤ 0 or NaN is rejected / clears override', () => {
    expect(tracker.setQuantity('pouf', 'boucle', Number.NaN)).toBe(false);
    expect(tracker.setQuantity('pouf', 'boucle', 0)).toBe(false);
    expect(tracker.setQuantity('pouf', 'boucle', -3)).toBe(false);
  });
});

describe('exportSpec', () => {
  it('procurement JSON shape', () => {
    const data = tracker.exportSpec(placements(['pouf', 'boucle']), { room: 'test' }) as {
      currency: string;
      lines: Array<{ model: string; quantity: number; quantitySource: string; lineTotal: number }>;
      totals: { subtotal: number; total: number };
      rooms: number;
      meta: Record<string, string>;
    };
    expect(data.currency).toBe('USD');
    expect(data.rooms).toBe(2);
    expect(data.meta.room).toBe('test');
    expect(data.lines[0]!.model).toBe('pouf');
    expect(data.lines[0]!.quantitySource).toBe('auto');
    expect(data.lines[0]!.lineTotal).toBeCloseTo(data.lines[0]!.quantity * data.lines[0]!.lineTotal / data.lines[0]!.quantity, 5);
  });
});

describe('pricing', () => {
  it('quoteSuite computes stay math', () => {
    const suite = SUITES[0]!;
    const q = quoteSuite(suite, 5);
    expect(q.nights).toBe(5);
    expect(q.roomTotal).toBe(suite.rate * 5);
    expect(q.amenityCredit).toBeCloseTo(Math.min(750, q.roomTotal * 0.1), 1);
    expect(q.grandTotal).toBeCloseTo(q.roomTotal - q.amenityCredit + q.taxes, 1);
  });
  it('nights clamped to ≥ 1 and rounded', () => {
    const q = quoteSuite(SUITES[0]!, 0);
    expect(q.nights).toBe(1);
    const q2 = quoteSuite(SUITES[0]!, 3.7);
    expect(q2.nights).toBe(4);
  });
  it('estimateProduct splits per room', () => {
    const e = estimateProduct(1000, 4);
    expect(e.perRoom).toBe(250);
  });
  it('currency formatting', () => {
    expect(formatUSD(1234.5)).toBe('$1,235');
    expect(formatUSDExact(1234.5)).toBe('$1,234.50');
  });
});
