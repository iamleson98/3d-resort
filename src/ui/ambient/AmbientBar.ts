/**
 * AmbientBar — the "experience the light" control: time-of-day presets,
 * photo capture and render quality. Floating bottom-center, all modes.
 */
import { el } from '../kit';
import { TIME_OF_DAY, TIME_OF_DAY_IDS, type TimeOfDayId } from '../../core/environment/sky';
import type { QualityTier } from '../../core/post/PostFX';

export interface AmbientBarCallbacks {
  onTimeOfDay(id: TimeOfDayId): void;
  onCapture(): void;
  onQuality(tier: QualityTier | 'auto'): void;
}

const CAMERA_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>';

export class AmbientBar {
  readonly root: HTMLElement;
  private readonly chips = new Map<TimeOfDayId, HTMLElement>();
  private readonly qualitySel: HTMLSelectElement;
  private cb: AmbientBarCallbacks;

  constructor(callbacks: AmbientBarCallbacks, current: TimeOfDayId = 'golden') {
    this.cb = callbacks;

    const label = el('span', { class: 'ambient-label', text: 'Light' });
    const chips = el('div', { class: 'ambient-chips', attrs: { role: 'group', 'aria-label': 'Time of day' } });
    for (const id of TIME_OF_DAY_IDS) {
      const c = el('button', {
        class: 'ambient-chip',
        text: TIME_OF_DAY[id].label,
        attrs: { type: 'button', title: `See the suite at ${TIME_OF_DAY[id].label.toLowerCase()}` },
        onClick: () => this.cb.onTimeOfDay(id),
      });
      this.chips.set(id, c);
      chips.append(c);
    }

    const capture = el('button', {
      class: 'ambient-capture',
      attrs: { type: 'button', title: 'Capture a photo of this view' },
      onClick: () => this.cb.onCapture(),
    });
    capture.innerHTML = CAMERA_ICON;

    this.qualitySel = el('select', {
      class: 'ambient-quality',
      attrs: { 'aria-label': 'Render quality', title: 'Render quality' },
    }) as unknown as HTMLSelectElement;
    const tiers: Array<[string, string]> = [
      ['auto', 'Quality · Auto'],
      ['cinematic', 'Quality · Cinematic'],
      ['balanced', 'Quality · Balanced'],
      ['efficient', 'Quality · Efficient'],
    ];
    for (const [v, t] of tiers) {
      const o = el('option', { text: t, attrs: { value: v } }) as unknown as HTMLOptionElement;
      this.qualitySel.append(o);
    }
    this.qualitySel.value = 'auto';
    this.qualitySel.addEventListener('change', () => {
      const v = this.qualitySel.value as QualityTier | 'auto';
      this.cb.onQuality(v);
    });

    this.root = el('div', { class: 'ambient-bar', children: [label, chips, capture, this.qualitySel] });
    this.setTimeOfDay(current);
  }

  setTimeOfDay(id: TimeOfDayId): void {
    for (const [cid, chip] of this.chips) chip.classList.toggle('active', cid === id);
  }

  setQuality(tier: QualityTier | 'auto'): void {
    this.qualitySel.value = tier;
  }

  flash(): void {
    const f = el('div', { class: 'capture-flash' });
    this.root.append(f);
    setTimeout(() => f.remove(), 450);
  }
}
