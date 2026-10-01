/** Top navigation — brand, mode switch, suite select, backend badge. */
import { el, clear } from '../kit';
import { badge } from '../components/atoms';
import type { AppMode } from '../../shared/domain/types';

export interface TopNavCallbacks {
  onMode(mode: AppMode): void;
  onSuite(suiteId: string): void;
}

const MODES: Array<{ id: AppMode; label: string }> = [
  { id: 'showroom', label: 'Showroom' },
  { id: 'library', label: 'Model Library' },
  { id: 'editor', label: 'Room Editor' },
];

export class TopNav {
  readonly root: HTMLElement;
  private suiteSelect: HTMLSelectElement;
  private modeButtons = new Map<AppMode, HTMLElement>();
  private backendBadge: HTMLElement;

  constructor(private readonly suites: Array<{ id: string; label: string; rate: number }>, private readonly cb: TopNavCallbacks) {
    this.root = el('nav', { class: 'topnav', attrs: { role: 'navigation' } });
    const brand = el('div', { class: 'brand', children: [
      el('span', { class: 'brand-mark', text: 'F' }),
      el('div', { class: 'brand-text', children: [
        el('strong', { text: 'Flamingo Cat Ba' }),
        el('small', { text: 'LUXURY RESORT · 3D' }),
      ] }),
    ] });

    const modeSwitch = el('div', { class: 'mode-switch', attrs: { role: 'tablist' } });
    for (const m of MODES) {
      const btn = el('button', {
        class: 'mode-btn',
        text: m.label,
        attrs: { type: 'button', role: 'tab' },
        onClick: () => this.cb.onMode(m.id),
      });
      this.modeButtons.set(m.id, btn);
      modeSwitch.append(btn);
    }

    this.suiteSelect = el('select', { class: 'suite-select', attrs: { 'aria-label': 'Suite' } }) as unknown as HTMLSelectElement;
    for (const s of suites) {
      const opt = el('option', { text: `${s.label} — $${s.rate}/night`, attrs: { value: s.id } }) as unknown as HTMLOptionElement;
      this.suiteSelect.append(opt);
    }
    this.suiteSelect.addEventListener('change', () => this.cb.onSuite(this.suiteSelect.value));

    this.backendBadge = badge('…', 'muted');

    const right = el('div', { class: 'nav-right', children: [this.suiteSelect, this.backendBadge] });
    this.root.append(brand, modeSwitch, right);
    this.setMode('showroom');
  }

  setMode(mode: AppMode): void {
    for (const [id, btn] of this.modeButtons) btn.classList.toggle('active', id === mode);
    this.suiteSelect.parentElement?.classList.toggle('hidden', mode !== 'showroom');
  }

  setBackend(label: string): void {
    clear(this.backendBadge);
    this.backendBadge.textContent = label;
    this.backendBadge.className = `badge badge-${label === 'WebGPU' ? 'green' : 'gold'}`;
  }

  setSuite(id: string): void {
    this.suiteSelect.value = id;
  }

  get suiteSelectVisible(): boolean {
    return !this.suiteSelect.parentElement?.classList.contains('hidden');
  }
}
