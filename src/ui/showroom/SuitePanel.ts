/** Showroom side panel — suite details + zone tour buttons + quote. */
import { el, clear } from '../kit';
import { statRow, actionButton, badge } from '../components/atoms';
import type { Suite } from '../../shared/domain/types';
import { quoteSuite } from '../../features/specs/pricing';
import { formatUSD } from '../../features/specs/tracker';

export interface SuitePanelCallbacks {
  onZone(zoneId: string): void;
}

export class SuitePanel {
  readonly root: HTMLElement;
  private infoEl: HTMLElement;
  private zonesEl: HTMLElement;
  private currentSuite: Suite | null = null;

  constructor(private readonly cb: SuitePanelCallbacks) {
    this.root = el('section', { class: 'panel suite-panel' });
    this.root.append(el('header', { class: 'panel-head', children: [el('h3', { text: 'Suite' })] }));
    this.infoEl = el('div', { class: 'suite-info' });
    this.zonesEl = el('div', { class: 'zone-list' });
    this.root.append(this.infoEl, this.zonesEl);
  }

  renderFor(suite: Suite): void {
    this.currentSuite = suite;
    this.render(suite, 'overview');
  }

  render(suite: Suite, activeZone: string): void {
    clear(this.infoEl);
    const quote = quoteSuite(suite, 5);
    this.infoEl.append(
      el('h2', { class: 'suite-title', text: suite.label }),
      el('p', { class: 'suite-tagline', text: suite.tagline }),
      el('div', { class: 'suite-stats', children: [
        statRow('Nightly rate', formatUSD(suite.rate)),
        statRow('Interior', `${suite.size} m²`),
        statRow('5-night stay', formatUSD(quote.grandTotal)),
      ] }),
      badge('Taxes & amenity credit included', 'muted'),
    );

    clear(this.zonesEl);
    this.zonesEl.append(el('h4', { text: 'Camera tour' }));
    for (const z of suite.zones) {
      this.zonesEl.append(actionButton(z.label, () => this.cb.onZone(z.id), { primary: z.id === activeZone }));
      if (z.note) this.zonesEl.append(el('p', { class: 'zone-note', text: z.note }));
    }
  }

  setActiveZone(zoneId: string): void {
    const zones = this.currentSuite?.zones ?? [];
    const buttons = this.zonesEl.querySelectorAll('.btn');
    buttons.forEach((b, i) => {
      (b as HTMLElement).classList.toggle('btn-primary', zones[i]?.id === zoneId);
    });
  }
}
