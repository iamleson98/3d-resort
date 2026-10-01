/**
 * Minimal DOM kit — typed element builder used by every UI component.
 * Keeps components declarative without a framework.
 */

export type Child = Node | string | null | undefined | false;

export interface ElOptions {
  class?: string;
  classes?: string[];
  id?: string;
  text?: string;
  html?: string;
  children?: Child[];
  attrs?: Record<string, string | number | boolean>;
  dataset?: Record<string, string>;
  onClick?: (e: MouseEvent) => void;
  onPointerDown?: (e: PointerEvent) => void;
  title?: string;
  role?: string;
  ariaLabel?: string;
}

export function el<K extends keyof HTMLElementTagNameMap>(tag: K, o: ElOptions = {}): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (o.id) node.id = o.id;
  if (o.class) node.className = o.class;
  if (o.classes?.length) node.classList.add(...o.classes);
  if (o.title) node.title = o.title;
  if (o.role) node.setAttribute('role', o.role);
  if (o.ariaLabel) node.setAttribute('aria-label', o.ariaLabel);
  if (o.text !== undefined) node.textContent = o.text;
  if (o.html !== undefined) node.innerHTML = o.html;
  for (const [k, v] of Object.entries(o.attrs ?? {})) {
    if (v === true) node.setAttribute(k, '');
    else if (v !== false) node.setAttribute(k, String(v));
  }
  for (const [k, v] of Object.entries(o.dataset ?? {})) {
    node.dataset[k] = v;
  }
  if (o.onClick) node.addEventListener('click', o.onClick as EventListener);
  if (o.onPointerDown) node.addEventListener('pointerdown', o.onPointerDown as EventListener);
  for (const c of o.children ?? []) {
    if (c === null || c === undefined || c === false) continue;
    node.append(c);
  }
  return node;
}

export function clear(node: HTMLElement): void {
  while (node.firstChild) node.removeChild(node.firstChild);
}

export function icon(svg: string, size = 18): HTMLElement {
  const span = el('span', { class: 'ic', ariaLabel: 'icon' });
  span.innerHTML = svg
    .replace(/\{s\}/g, String(size))
    .replace(/\{c\}/g, 'currentColor');
  return span;
}
