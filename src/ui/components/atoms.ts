/** Small shared UI atoms — panel, chip, button, divider, badge. */
import { el } from '../kit';

export function panel(title: string, body: HTMLElement, opts: { id?: string; className?: string } = {}): HTMLElement {
  return el('section', {
    class: `panel ${opts.className ?? ''}`.trim(),
    children: [
      el('header', { class: 'panel-head', children: [el('h3', { text: title })] }),
      body,
    ],
  });
}

export function chip(text: string, opts: { active?: boolean; onClick?: () => void; dataCat?: string } = {}): HTMLElement {
  return el('button', {
    class: `chip ${opts.active ? 'active' : ''}`.trim(),
    text,
    onClick: () => opts.onClick?.(),
    attrs: { type: 'button' },
    dataset: opts.dataCat ? { cat: opts.dataCat } : undefined,
  });
}

export function actionButton(text: string, onClick: () => void, opts: { primary?: boolean; disabled?: boolean; title?: string; icon?: string } = {}): HTMLElement {
  const btn = el('button', {
    class: `btn ${opts.primary ? 'btn-primary' : ''}`.trim(),
    text,
    onClick: () => {
      if (!btn.classList.contains('disabled')) onClick();
    },
    attrs: { type: 'button' },
    title: opts.title,
  });
  if (opts.disabled) btn.classList.add('disabled');
  if (opts.icon) btn.prepend(document.createTextNode(opts.icon + ' '));
  return btn;
}

export function iconButton(label: string, onClick: () => void, opts: { title?: string; disabled?: boolean } = {}): HTMLElement {
  const btn = el('button', {
    class: 'icon-btn',
    text: label,
    onClick: () => {
      if (!btn.classList.contains('disabled')) onClick();
    },
    attrs: { type: 'button' },
    title: opts.title ?? label,
    ariaLabel: opts.title ?? label,
  });
  if (opts.disabled) btn.classList.add('disabled');
  return btn;
}

export function divider(): HTMLElement {
  return el('div', { class: 'divider' });
}

export function badge(text: string, tone: 'gold' | 'muted' | 'green' = 'muted'): HTMLElement {
  return el('span', { class: `badge badge-${tone}`, text });
}

export function statRow(label: string, value: string): HTMLElement {
  return el('div', { class: 'stat-row', children: [el('span', { class: 'stat-label', text: label }), el('span', { class: 'stat-value', text: value })] });
}

export function toast(message: string, container: HTMLElement, ttl = 2600): void {
  const t = el('div', { class: 'toast', text: message });
  container.append(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 400);
  }, ttl);
}
