/** Editor HUD — toolbar (rotate / delete / undo / redo / snap) + hint line. */
import { el, clear } from '../kit';
import { actionButton, iconButton } from '../components/atoms';

export interface EditorToolbarCallbacks {
  onRotate(): void;
  onDelete(): void;
  onUndo(): void;
  onRedo(): void;
  onSnap(on: boolean): void;
}

export class EditorToolbar {
  readonly root: HTMLElement;
  private undoBtn: HTMLElement;
  private redoBtn: HTMLElement;
  private rotateBtn: HTMLElement;
  private deleteBtn: HTMLElement;
  private snapBtn: HTMLElement;
  private hintEl: HTMLElement;

  constructor(private readonly cb: EditorToolbarCallbacks) {
    this.undoBtn = iconButton('↶', () => this.cb.onUndo(), { title: 'Undo' });
    this.redoBtn = iconButton('↷', () => this.cb.onRedo(), { title: 'Redo' });
    this.rotateBtn = iconButton('⟳', () => this.cb.onRotate(), { title: 'Rotate 15°' });
    this.deleteBtn = iconButton('✕', () => this.cb.onDelete(), { title: 'Delete selected' });
    this.snapBtn = actionButton('Snap: on', () => {
      const on = this.snapBtn.textContent?.includes('off');
      this.setSnap(on !== false);
      this.cb.onSnap(on !== false);
    }, { title: 'Toggle 10 cm snap' });

    this.root = el('div', { class: 'editor-toolbar', children: [
      this.rotateBtn, this.deleteBtn, this.undoBtn, this.redoBtn, this.snapBtn,
    ] });
    this.hintEl = el('div', { class: 'hint-line', text: 'Select an object to rotate or delete it · drag on the floor to look around' });
    this.setStates(false, false, false);
  }

  hintElement(): HTMLElement {
    return this.hintEl;
  }

  setStates(hasSelection: boolean, canUndo: boolean, canRedo: boolean): void {
    this.rotateBtn.classList.toggle('disabled', !hasSelection);
    this.deleteBtn.classList.toggle('disabled', !hasSelection);
    this.undoBtn.classList.toggle('disabled', !canUndo);
    this.redoBtn.classList.toggle('disabled', !canRedo);
  }

  setSnap(on: boolean): void {
    this.snapBtn.textContent = on ? 'Snap: on' : 'Snap: off';
    this.snapBtn.classList.toggle('btn-primary', on);
  }

  setHint(text: string): void {
    clear(this.hintEl);
    this.hintEl.textContent = text;
  }
}
