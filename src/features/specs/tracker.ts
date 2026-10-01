/**
 * Spec tracker — pure BOM reducer (no three/DOM). Unit tested exhaustively.
 * Folds the placement list into a grouped bill of materials with
 * auto quantities, manual overrides and a procurement JSON export.
 */
import type { SpecLine, SpecSnapshot, Placement, CatalogEntry } from '../../shared/domain/types';

export interface TrackerOptions {
  resortCredit?: number;
  rooms?: number;
}

export class SpecTracker {
  private readonly catalog: Map<string, CatalogEntry>;
  private readonly manual = new Map<string, number>();
  private resortCredit: number;
  private rooms: number;

  constructor(catalog: CatalogEntry[], options: TrackerOptions = {}) {
    this.catalog = new Map(catalog.map((e) => [e.id, e]));
    this.resortCredit = options.resortCredit ?? 0;
    this.rooms = Math.max(1, options.rooms ?? 1);
  }

  private key(modelId: string, variantId: string): string {
    return `${modelId}::${variantId}`;
  }

  compute(placements: Placement[]): SpecSnapshot {
    const grouped = new Map<string, { entry: CatalogEntry; variantId: string; count: number }>();
    for (const p of placements) {
      const entry = this.catalog.get(p.modelId);
      if (!entry) continue;
      const key = this.key(p.modelId, p.variantId);
      const existing = grouped.get(key);
      if (existing) existing.count += 1;
      else grouped.set(key, { entry, variantId: p.variantId, count: 1 });
    }

    const lines: SpecLine[] = [];
    let itemCount = 0;
    let subtotal = 0;

    const entries = [...grouped.values()].sort((a, b) => {
      const cat = a.entry.category.localeCompare(b.entry.category);
      if (cat !== 0) return cat;
      return a.entry.label.localeCompare(b.entry.label);
    });

    for (const g of entries) {
      const variant = g.entry.variants.find((v) => v.id === g.variantId) ?? g.entry.variants[0]!;
      const manualQty = this.manual.get(this.key(g.entry.id, g.variantId));
      const qty = manualQty !== undefined ? manualQty : g.count;
      const variantScale = variant.scale ?? 1;
      const unitPrice = Math.round(g.entry.price * (0.6 + 0.4 * variantScale) * 100) / 100;
      lines.push({
        modelId: g.entry.id,
        variantId: g.variantId,
        label: `${g.entry.label} — ${variant.label}`,
        category: g.entry.category,
        unitPrice,
        quantity: qty,
        manual: manualQty !== undefined && manualQty !== g.count,
        materials: Object.values(variant.materials),
      });
      itemCount += g.count;
      subtotal += unitPrice * qty;
    }

    subtotal = Math.round(subtotal * 100) / 100;
    const total = Math.round((subtotal - this.resortCredit) * 100) / 100;
    return {
      lines,
      itemCount,
      subtotal,
      resortCredit: this.resortCredit,
      total: Math.max(0, total),
      rooms: this.rooms,
    };
  }

  setQuantity(modelId: string, variantId: string, qty: number): boolean {
    if (!Number.isFinite(qty)) return false;
    if (qty <= 0) return this.clearManual(modelId, variantId);
    this.manual.set(this.key(modelId, variantId), Math.round(qty));
    return true;
  }

  clearManual(modelId: string, variantId: string): boolean {
    return this.manual.delete(this.key(modelId, variantId));
  }

  isManual(modelId: string, variantId: string): boolean {
    return this.manual.has(this.key(modelId, variantId));
  }

  exportSpec(placements: Placement[], meta: Record<string, string> = {}): object {
    const snap = this.compute(placements);
    return {
      generated: 'auto',
      currency: 'USD',
      meta,
      rooms: snap.rooms,
      itemCount: snap.itemCount,
      lines: snap.lines.map((l) => ({
        model: l.modelId,
        variant: l.variantId,
        description: l.label,
        category: l.category,
        materials: l.materials,
        unitPrice: l.unitPrice,
        quantity: l.quantity,
        quantitySource: l.manual ? 'manual' : 'auto',
        lineTotal: Math.round(l.unitPrice * l.quantity * 100) / 100,
      })),
      totals: {
        subtotal: snap.subtotal,
        resortCredit: snap.resortCredit,
        total: snap.total,
      },
    };
  }
}

export function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export function formatUSDExact(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}
