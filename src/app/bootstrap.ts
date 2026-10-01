/**
 * App bootstrap — engine, environment, feature controllers, UI wiring.
 * This is the only place all layers meet (composition root).
 */
import * as THREE from 'three/webgpu';
import type { AppMode, ResortTestApi, Category } from '../shared/domain/types';
import { Engine } from '../core/engine/Engine';
import { CameraRig } from '../core/camera/CameraRig';
import { createEnvironment } from '../core/environment/environment';
import { SUITES } from '../features/showroom/suites';
import { ShowroomController } from '../features/showroom/ShowroomController';
import { LibraryController } from '../features/library/LibraryController';
import { EditorController } from '../features/editor/EditorController';
import { PlacementInput } from '../features/editor/view/input';
import { CATALOG, getEntry, getVariant, categories } from '../catalog';
import { TopNav } from '../ui/nav/TopNav';
import { CatalogBrowser } from '../ui/catalog/CatalogBrowser';
import { SuitePanel } from '../ui/showroom/SuitePanel';
import { SpecPanel } from '../ui/specs/SpecPanel';
import { EditorToolbar } from '../ui/editor/EditorToolbar';
import { el } from '../ui/kit';
import { iconButton, toast } from '../ui/components/atoms';
import { downloadJson } from '../features/specs/export';
import '../ui/styles/tokens.css';
import '../ui/styles/base.css';
import '../ui/styles/components.css';

export interface AppOptions {
  canvas: HTMLCanvasElement;
  splash: HTMLElement;
  statusEl: HTMLElement;
}

export class App {
  readonly engine: Engine;
  readonly rig: CameraRig;
  readonly env: ReturnType<typeof createEnvironment>;
  readonly scene = new THREE.Scene();
  readonly showroom: ShowroomController;
  readonly library: LibraryController;
  readonly editor: EditorController;

  readonly topNav: TopNav;
  readonly suitePanel: SuitePanel;
  readonly specPanel: SpecPanel;
  readonly toolbar: EditorToolbar;
  readonly catalogBrowser: CatalogBrowser;
  readonly libraryBrowser: CatalogBrowser;
  readonly toastHost: HTMLElement;

  private mode: AppMode = 'showroom';
  private placementInput: PlacementInput;
  private modeLayers = new Map<AppMode, THREE.Object3D>();

  constructor(opts: AppOptions) {
    this.engine = new Engine(opts.canvas, {
      onBackend: (label) => {
        this.topNav.setBackend(label);
        opts.statusEl.textContent = `Renderer ready — ${label}`;
      },
    });
    // bind interactions to the stable host so canvas swaps (WebGPU demotion) keep listeners alive
    this.rig = new CameraRig(this.engine.camera!, opts.canvas.parentElement ?? opts.canvas);
    this.env = createEnvironment(this.scene);

    this.showroom = new ShowroomController(this.rig, this.env);
    this.library = new LibraryController(this.rig);
    this.editor = new EditorController(this.rig, this.env);

    this.modeLayers.set('showroom', this.showroom.root);
    this.modeLayers.set('library', this.library.root);
    this.modeLayers.set('editor', this.editor.root);

    this.placementInput = new PlacementInput(opts.canvas.parentElement ?? opts.canvas, this.engine.camera!, this.editor);

    // ------------------------------------------------ UI
    this.topNav = new TopNav(
      SUITES.map((s) => ({ id: s.id, label: s.label, rate: s.rate })),
      {
        onMode: (m) => this.setMode(m),
        onSuite: (id) => this.loadSuite(id),
      },
    );
    this.suitePanel = new SuitePanel({ onZone: (z) => this.showroom.flyToZone(z) });
    this.specPanel = new SpecPanel({
      onQuantity: (m, v, q) => {
        this.editor.setQuantity(m, v, q);
        this.refreshSpec();
      },
      onClearManual: (m, v) => {
        this.editor.clearManual(m, v);
        this.refreshSpec();
      },
      onExport: () => {
        downloadJson('flamingo-room-spec.json', this.editor.exportSpec());
        toast('Specification exported', this.toastHost);
      },
    });
    this.toolbar = new EditorToolbar({
      onRotate: () => {
        if (this.editor.selected) this.editor.rotate(this.editor.selected, 15);
        this.syncToolbar();
      },
      onDelete: () => {
        if (this.editor.selected) this.editor.remove(this.editor.selected);
        this.refreshSpec();
        this.syncToolbar();
      },
      onUndo: () => {
        this.editor.undo();
        this.refreshSpec();
        this.syncToolbar();
      },
      onRedo: () => {
        this.editor.redo();
        this.refreshSpec();
        this.syncToolbar();
      },
      onSnap: (on) => this.editor.setSnapEnabled(on),
    });
    this.catalogBrowser = new CatalogBrowser(CATALOG, {
      onEntry: () => undefined,
      onVariant: (m, v) => {
        if (this.editor.selected) this.editor.switchVariant(this.editor.selected, v);
        this.refreshSpec();
      },
      onPlace: (m, v) => {
        // placing only makes sense in the editor scene — jump modes for the user
        if (this.mode !== 'editor') this.setMode('editor');
        this.editor.beginGhost(m, v);
        toast('Drag on the floor, then release to place', this.toastHost, 3200);
      },
    }, { placeEnabled: true });
    this.libraryBrowser = new CatalogBrowser(CATALOG, {
      onEntry: (m) => this.library.show(m),
      onVariant: (m, v) => {
        void m;
        this.library.switchVariant(v);
        this.updateLibraryInfo();
      },
      onPlace: () => undefined,
    }, { placeEnabled: false });

    this.toastHost = el('div', { class: 'toast-host' });
    this.wireEditorEvents();

    // ------------------------------------------------ shell DOM
    const shell = el('div', { class: 'app-shell' });
    shell.dataset.mode = 'showroom';
    const body = el('div', { class: 'shell-body' });
    const left = el('div', { class: 'shell-left' });
    const right = el('div', { class: 'shell-right' });
    const hud = el('div', { class: 'hud-bottom' });
    hud.append(this.toolbar.root, this.toolbar.hintElement());

    const toggleLeft = iconButton('☰', () => left.classList.toggle('open'), { title: 'Catalog' });
    toggleLeft.id = 'toggle-left';
    toggleLeft.classList.add('panel-toggle');
    const toggleRight = iconButton('≡', () => right.classList.toggle('open'), { title: 'Details' });
    toggleRight.id = 'toggle-right';
    toggleRight.classList.add('panel-toggle');

    shell.append(this.topNav.root, body, toggleLeft, toggleRight);
    body.append(left, hud, right);
    const appRoot = document.getElementById('app')!;
    appRoot.append(shell, this.toastHost);

    // engine loop hooks
    this.engine.addUpdater((dt) => {
      this.rig.update(dt);
      this.library.update(dt);
      this.showroom.update(); // dollhouse wall culling
      this.editor.update(); // dollhouse wall culling
    });
    this.engine.setScene(this.scene);

    // initial state
    this.suitePanel.renderFor(this.showroom.activeSuite);
    this.refreshSpec();
    this.setMode('showroom');
  }

  async start(): Promise<void> {
    await this.engine.init();
    this.engine.start();
  }

  private applyModeLayers(): void {
    for (const [mode, layer] of this.modeLayers) {
      const active = mode === this.mode;
      layer.visible = active;
      if (active && layer.parent !== this.scene) this.scene.add(layer);
      if (!active && layer.parent === this.scene) this.scene.remove(layer);
    }
  }

  setMode(mode: AppMode): void {
    this.mode = mode;
    this.topNav.setMode(mode);
    this.applyModeLayers();
    const shell = document.querySelector('.app-shell') as HTMLElement | null;
    if (shell) shell.dataset.mode = mode;

    const left = document.querySelector('.shell-left') as HTMLElement | null;
    const right = document.querySelector('.shell-right') as HTMLElement | null;
    for (const c of [left, right]) {
      if (!c) continue;
      for (const child of [...c.children]) c.removeChild(child);
    }
    if (left && right) {
      if (mode === 'showroom') {
        left.append(this.catalogBrowser.root);
        right.append(this.suitePanel.root);
      } else if (mode === 'library') {
        left.append(this.libraryBrowser.root);
        right.append(this.buildLibraryInfo());
      } else {
        left.append(this.catalogBrowser.root);
        right.append(this.specPanel.root);
      }
      left.classList.remove('open');
      right.classList.remove('open');
    }
    if (mode === 'showroom') {
      this.showroom.setAutoOrbit(true);
      this.suitePanel.renderFor(this.showroom.activeSuite);
    } else {
      this.showroom.setAutoOrbit(false);
    }
    if (mode === 'editor') {
      this.editor.setSnapEnabled(true);
      this.syncToolbar();
      this.refreshSpec();
    }
  }

  private buildLibraryInfo(): HTMLElement {
    const entry = this.library.activeEntry;
    const variant = getVariant(entry, this.library.activeVariantId);
    const info = el('section', { class: 'panel' });
    info.append(el('header', { class: 'panel-head', children: [el('h3', { text: 'Model' })] }));
    const body = el('div', { class: 'suite-info' });
    body.append(
      el('h2', { class: 'suite-title', text: entry.label }),
      el('p', { class: 'suite-tagline', text: variant.label }),
      el('div', { class: 'suite-stats', children: [
        el('div', { class: 'stat-row', children: [el('span', { class: 'stat-label', text: 'Category' }), el('span', { class: 'stat-value', text: entry.category })] }),
        el('div', { class: 'stat-row', children: [el('span', { class: 'stat-label', text: 'Footprint' }), el('span', { class: 'stat-value', text: `${entry.dimensions.w.toFixed(2)} × ${entry.dimensions.d.toFixed(2)} m` })] }),
        el('div', { class: 'stat-row', children: [el('span', { class: 'stat-label', text: 'Unit price' }), el('span', { class: 'stat-value', text: `$${entry.price.toLocaleString()}` })] }),
      ] }),
      el('p', { class: 'zone-note', text: entry.description }),
    );
    info.append(body);
    return info;
  }

  private updateLibraryInfo(): void {
    const right = document.querySelector('.shell-right');
    if (right && this.mode === 'library') {
      for (const child of [...right.children]) right.removeChild(child);
      right.append(this.buildLibraryInfo());
    }
  }

  loadSuite(id: string): void {
    if (this.showroom.loadSuite(id)) {
      this.suitePanel.renderFor(this.showroom.activeSuite);
      this.topNav.setSuite(id);
    }
  }

  refreshSpec(): void {
    this.specPanel.render(this.editor.spec());
  }

  syncToolbar(): void {
    this.toolbar.setStates(this.editor.selected !== null, this.editor.canUndo, this.editor.canRedo);
  }

  wireEditorEvents(): void {
    this.editor.onEvent(() => {
      this.refreshSpec();
      this.syncToolbar();
    });
  }

  testApi(): ResortTestApi {
    const self = this;
    return {
      ready: () => self.engine.frameCount > 0,
      backend: () => self.engine.backendLabel,
      mode: () => self.mode,
      setMode: (m) => self.setMode(m),
      activeSuite: () => self.showroom.activeSuite.id,
      loadSuite: async (id) => self.loadSuite(id),
      zones: () => self.showroom.zoneList(),
      flyToZone: (z, instant) => self.showroom.flyToZone(z, instant),
      catalog: () => ({ count: CATALOG.length, categories: categories() }),
      selectCategory: (c) => {
        self.catalogBrowser.setCategory(c);
        self.libraryBrowser.setCategory(c);
        return c === 'all' ? CATALOG.length : CATALOG.filter((e) => e.category === c).length;
      },
      libraryEntries: () => [...self.catalogBrowser.root.querySelectorAll('.entry-card')].map((n) => ({
        id: (n as HTMLElement).dataset.model ?? '',
        label: (n.querySelector('.entry-name strong')?.textContent ?? ''),
        variants: Number((n.querySelector('.entry-variants')?.textContent ?? '0').replace(/[^0-9]/g, '')),
      })),
      switchVariant: (m, v) => {
        self.libraryBrowser.highlight(m, v);
        if (self.mode === 'library') {
          self.library.show(m, v);
          self.updateLibraryInfo();
        }
      },
      place: (m, v, x, z, r) => self.editor.place(m, v, x, z, r),
      placements: () => self.editor.list().map((p) => ({ id: p.id, modelId: p.modelId, variantId: p.variantId, x: p.x, z: p.z, rotation: p.rotation })),
      select: (id) => {
        self.editor.select(id);
        self.syncToolbar();
      },
      rotate: (id, deg) => {
        self.editor.rotate(id, deg);
        self.refreshSpec();
      },
      move: (id, x, z) => {
        const ok = self.editor.move(id, x, z);
        self.refreshSpec();
        return ok;
      },
      remove: (id) => {
        const ok = self.editor.remove(id);
        self.refreshSpec();
        return ok;
      },
      undo: () => {
        const ok = self.editor.undo();
        self.refreshSpec();
        return ok;
      },
      redo: () => {
        const ok = self.editor.redo();
        self.refreshSpec();
        return ok;
      },
      spec: () => self.editor.spec(),
      setQuantity: (m, v, q) => {
        const ok = self.editor.setQuantity(m, v, q);
        self.refreshSpec();
        return ok;
      },
      clearManual: (m, v) => {
        const ok = self.editor.clearManual(m, v);
        self.refreshSpec();
        return ok;
      },
      exportSpec: () => self.editor.exportSpec(),
      stats: () => {
        const s = self.mode === 'showroom' ? self.showroom.stats() : self.mode === 'library' ? self.library.stats() : self.editor.stats();
        const r = self.engine.stats();
        return { meshes: s.meshes, drawCalls: r.drawCalls, triangles: Math.round(s.triangles) };
      },
      frameCount: () => self.engine.frameCount,
    };
  }
}

export function catalogCount(): number {
  return CATALOG.length;
}

export function entryExists(id: string): boolean {
  return getEntry(id) !== undefined;
}

export type { Category };
