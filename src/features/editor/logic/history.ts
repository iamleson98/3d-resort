/**
 * Undo/redo history — generic capped stack. Unit tested.
 */
export interface HistoryEntry<T> {
  label: string;
  state: T;
}

export class History<T> {
  private past: HistoryEntry<T>[] = [];
  private future: HistoryEntry<T>[] = [];
  private readonly cap: number;
  private currentLabel: string;
  private current: T;

  constructor(initial: T, cap = 100, label = 'init') {
    this.cap = Math.max(2, cap);
    this.currentLabel = label;
    this.current = initial;
  }

  get label(): string {
    return this.currentLabel;
  }

  get state(): T {
    return this.current;
  }

  get canUndo(): boolean {
    return this.past.length > 0;
  }

  get canRedo(): boolean {
    return this.future.length > 0;
  }

  /** Push a new state; anything after the current point is discarded. */
  push(next: T, label: string): void {
    this.past.push({ label: this.currentLabel, state: this.current });
    if (this.past.length > this.cap) this.past.shift();
    this.future.length = 0;
    this.current = next;
    this.currentLabel = label;
  }

  undo(): T | null {
    const entry = this.past.pop();
    if (!entry) return null;
    this.future.push({ label: this.currentLabel, state: this.current });
    this.current = entry.state;
    this.currentLabel = entry.label;
    return this.current;
  }

  redo(): T | null {
    const entry = this.future.pop();
    if (!entry) return null;
    this.past.push({ label: this.currentLabel, state: this.current });
    this.current = entry.state;
    this.currentLabel = entry.label;
    return this.current;
  }

  reset(state: T, label = 'reset'): void {
    this.past.length = 0;
    this.future.length = 0;
    this.current = state;
    this.currentLabel = label;
  }
}
