/** Spec panel — live bill of materials with manual quantity editing + export. */
import { el, clear } from '../kit';
import { actionButton } from '../components/atoms';
import type { SpecSnapshot } from '../../shared/domain/types';

export interface SpecCallbacks {
  onQuantity(modelId: string, variantId: string, qty: number): void;
  onClearManual(modelId: string, variantId: string): void;
  onExport(): void;
}

export class SpecPanel {
  readonly root: HTMLElement;
  private linesEl: HTMLElement;
  private totalsEl: HTMLElement;

  constructor(private readonly cb: SpecCallbacks) {
    this.root = el('section', { class: 'panel spec-panel' });
    this.root.append(
      el('header', { class: 'panel-head', children: [
        el('h3', { text: 'Specification' }),
        el('span', { class: 'panel-sub', text: 'auto-tracked BOM' }),
      ] }),
    );
    this.linesEl = el('div', { class: 'spec-lines' });
    this.totalsEl = el('div', { class: 'spec-totals' });
    this.root.append(this.linesEl, this.totalsEl);
    this.render({ lines: [], itemCount: 0, subtotal: 0, resortCredit: 0, total: 0, rooms: 1 });
  }

  render(snap: SpecSnapshot): void {
    clear(this.linesEl);
    if (!snap.lines.length) {
      this.linesEl.append(el('p', { class: 'spec-empty', text: 'Nothing placed yet — pick a model from the catalog and place it in the room.' }));
    }
    for (const line of snap.lines) {
      const qtyInput = el('input', {
        class: 'qty-input',
        attrs: { type: 'number', min: '0', step: '1', value: String(line.quantity) },
        dataset: { model: line.modelId, variant: line.variantId },
      }) as unknown as HTMLInputElement;
      qtyInput.addEventListener('change', () => {
        const v = Number(qtyInput.value);
        if (Number.isFinite(v)) this.cb.onQuantity(line.modelId, line.variantId, v);
      });
      const row = el('div', {
        class: `spec-row ${line.manual ? 'manual' : ''}`,
        children: [
          el('div', { class: 'spec-row-main', children: [
            el('span', { class: 'spec-label', text: line.label }),
            el('span', { class: 'spec-cat', text: line.category }),
          ] }),
          el('div', { class: 'spec-row-qty', children: [
            el('span', { class: 'unit-price', text: `$${line.unitPrice.toFixed(2)}` }),
            el('span', { text: '×' }),
            qtyInput,
            el('span', { class: 'line-total', text: `$${(line.unitPrice * line.quantity).toFixed(0)}` }),
            line.manual
              ? el('button', {
                class: 'reset-qty',
                text: '↺',
                title: 'Reset to auto quantity',
                attrs: { type: 'button' },
                onClick: () => this.cb.onClearManual(line.modelId, line.variantId),
              })
              : null,
          ] }),
        ],
      });
      this.linesEl.append(row);
    }

    clear(this.totalsEl);
    this.totalsEl.append(
      el('div', { class: 'total-row', children: [el('span', { text: 'Items placed' }), el('strong', { text: String(snap.itemCount) })] }),
      el('div', { class: 'total-row', children: [el('span', { text: 'Furnishing subtotal' }), el('strong', { text: `$${snap.subtotal.toLocaleString()}` })] }),
      el('div', { class: 'total-row grand', children: [el('span', { text: 'Total (after credit)' }), el('strong', { text: `$${snap.total.toLocaleString()}` })] }),
      actionButton('Export specification (JSON)', () => this.cb.onExport(), { primary: true }),
    );
  }

  setLoading(): void {
    this.linesEl.append(el('p', { class: 'spec-empty', text: 'Recomputing…' }));
  }
}
