/** Catalog browser — category tabs, entry cards, variant picker. */
import { el, clear } from '../kit';
import { chip, badge } from '../components/atoms';
import { CATEGORIES } from '../../shared/domain/types';
import type { Category, CatalogEntry } from '../../shared/domain/types';

export interface CatalogCallbacks {
  onEntry(modelId: string): void;
  onVariant(modelId: string, variantId: string): void;
  onPlace(modelId: string, variantId: string): void;
}

const CAT_LABELS: Record<Category | 'all', string> = {
  all: 'All',
  seating: 'Seating',
  tables: 'Tables',
  bedroom: 'Bedroom',
  storage: 'Storage',
  lighting: 'Lighting',
  decor: 'Decor',
  plants: 'Plants',
  bathroom: 'Bathroom',
  architecture: 'Architecture',
  outdoor: 'Outdoor',
};

export class CatalogBrowser {
  readonly root: HTMLElement;
  private tabsRow: HTMLElement;
  private listEl: HTMLElement;
  private detailEl: HTMLElement;
  private category: Category | 'all' = 'all';
  private selectedModel: string | null = null;

  constructor(
    private readonly entries: readonly CatalogEntry[],
    private readonly cb: CatalogCallbacks,
    private readonly opts: { placeEnabled: boolean },
  ) {
    this.root = el('aside', { class: 'catalog', attrs: { role: 'complementary' } });

    this.tabsRow = el('div', { class: 'cat-tabs' });
    this.renderTabs();

    this.listEl = el('div', { class: 'entry-list', attrs: { role: 'listbox' } });
    this.detailEl = el('div', { class: 'entry-detail' });

    this.root.append(this.tabsRow, this.listEl, this.detailEl);
    this.renderList();
  }

  private renderTabs(): void {
    clear(this.tabsRow);
    const all = chip(CAT_LABELS.all, { active: this.category === 'all', onClick: () => this.setCategory('all'), dataCat: 'all' });
    this.tabsRow.append(all);
    for (const c of CATEGORIES) {
      this.tabsRow.append(chip(CAT_LABELS[c], { active: this.category === c, onClick: () => this.setCategory(c), dataCat: c }));
    }
  }

  setCategory(c: Category | 'all'): void {
    this.category = c;
    this.renderTabs();
    this.renderList();
  }

  get activeCategory(): Category | 'all' {
    return this.category;
  }

  private renderList(): void {
    clear(this.listEl);
    const list = this.category === 'all' ? this.entries : this.entries.filter((e) => e.category === this.category);
    for (const entry of list) {
      const card = el('button', {
        class: `entry-card ${this.selectedModel === entry.id ? 'selected' : ''}`,
        attrs: { type: 'button', role: 'option' },
        dataset: { model: entry.id },
        onClick: () => this.selectEntry(entry.id),
        children: [
          el('div', { class: 'entry-name', children: [el('strong', { text: entry.label })] }),
          el('div', { class: 'entry-meta', children: [
            el('span', { class: 'entry-cat', text: CAT_LABELS[entry.category] }),
            el('span', { class: 'entry-variants', text: `${entry.variants.length} variants` }),
          ] }),
          el('div', { class: 'entry-price', text: `from $${entry.price.toLocaleString()}` }),
        ],
      });
      this.listEl.append(card);
    }
  }

  selectEntry(modelId: string): void {
    this.selectedModel = modelId;
    this.renderList();
    this.renderDetail();
    this.cb.onEntry(modelId);
  }

  private renderDetail(): void {
    clear(this.detailEl);
    const entry = this.entries.find((e) => e.id === this.selectedModel);
    if (!entry) return;
    this.detailEl.append(
      el('h4', { text: entry.label }),
      el('p', { class: 'entry-desc', text: entry.description }),
      el('div', { class: 'dim-row', children: [
        badge(`${entry.dimensions.w.toFixed(2)} × ${entry.dimensions.d.toFixed(2)} m`, 'muted'),
        badge(`H ${entry.dimensions.h.toFixed(2)} m`, 'muted'),
      ] }),
      el('div', { class: 'variant-list', children: entry.variants.map((v) =>
        el('button', {
          class: 'variant-btn',
          attrs: { type: 'button' },
          dataset: { model: entry.id, variant: v.id },
          text: v.label,
          onClick: () => {
            this.cb.onVariant(entry.id, v.id);
            this.markVariant(v.id);
          },
        }),
      ) }),
    );
    if (this.opts.placeEnabled) {
      this.detailEl.append(
        el('button', {
          class: 'btn btn-primary place-btn',
          text: 'Place in room',
          attrs: { type: 'button' },
          dataset: { model: entry.id },
          onClick: () => this.cb.onPlace(entry.id, this.currentVariantId(entry)),
        }),
      );
    }
  }

  currentVariantId(entry: CatalogEntry): string {
    const active = this.detailEl.querySelector('.variant-btn.active') as HTMLElement | null;
    return active?.dataset.variant ?? entry.variants[0]!.id;
  }

  markVariant(variantId: string): void {
    for (const b of this.detailEl.querySelectorAll('.variant-btn')) {
      (b as HTMLElement).classList.toggle('active', (b as HTMLElement).dataset.variant === variantId);
    }
  }

  /** Highlight the entry currently displayed (library mode). */
  highlight(modelId: string, variantId: string): void {
    if (this.selectedModel !== modelId) {
      this.selectedModel = modelId;
      this.renderList();
      this.renderDetail();
    }
    this.markVariant(variantId);
    const card = this.listEl.querySelector(`[data-model="${modelId}"]`);
    card?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}
