/**
 * Catalog — the model library registry. Pure data, no three/DOM.
 */
import type { CatalogEntry, Category } from '../shared/domain/types';
import { SEATING } from './data/seating';
import { TABLES } from './data/tables';
import { BEDROOM } from './data/bedroom';
import { STORAGE } from './data/storage';
import { LIGHTING } from './data/lighting';
import { DECOR } from './data/decor';
import { PLANTS } from './data/plants';
import { BATHROOM } from './data/bathroom';
import { ARCHITECTURE } from './data/architecture';
import { OUTDOOR } from './data/outdoor';

export const CATALOG: readonly CatalogEntry[] = Object.freeze([
  ...SEATING, ...TABLES, ...BEDROOM, ...STORAGE, ...LIGHTING,
  ...DECOR, ...PLANTS, ...BATHROOM, ...ARCHITECTURE, ...OUTDOOR,
]);

const byId = new Map<string, CatalogEntry>(CATALOG.map((e) => [e.id, e]));
const byCategory = new Map<Category, CatalogEntry[]>();
for (const e of CATALOG) {
  const list = byCategory.get(e.category) ?? [];
  list.push(e);
  byCategory.set(e.category, list);
}

export function getEntry(id: string): CatalogEntry | undefined {
  return byId.get(id);
}

export function entriesByCategory(category: Category): readonly CatalogEntry[] {
  return byCategory.get(category) ?? [];
}

export function categories(): Array<{ name: Category; count: number }> {
  return [...byCategory.entries()]
    .map(([name, list]) => ({ name, count: list.length }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getVariant(entry: CatalogEntry, variantId: string) {
  return entry.variants.find((v) => v.id === variantId) ?? entry.variants[0]!;
}

export function variantCount(): number {
  return CATALOG.reduce((sum, e) => sum + e.variants.length, 0);
}

/** All material ids referenced by any variant (validator + spec docs). */
export function referencedMaterialIds(): Set<string> {
  const ids = new Set<string>();
  for (const e of CATALOG) {
    for (const v of e.variants) {
      for (const m of Object.values(v.materials)) ids.add(m);
    }
  }
  return ids;
}
