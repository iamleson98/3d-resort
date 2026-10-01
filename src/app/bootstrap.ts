/**
 * App bootstrap — engine, environment, feature controllers, UI wiring.
 * This is the only place all layers meet (composition root).
 *
 * Photoreal pipeline (tidewater-inspired): after the renderer initializes,
 * the sky bakes a PMREM environment for IBL, the exposure follows the
 * time-of-day preset, interior lamps glow with real point lights, and the
 * frame renders through the cinematic PostFX chain (GTAO → AA → bloom →
 * grade → sharpen).
 */
import * as THREE from 'three/webgpu';
import type { AppMode, ResortTestApi, Category } from '../shared/domain/types';
import { Engine } from '../core/engine/Engine';
import { CameraRig } from '../core/camera/CameraRig';
import { createEnvironment } from '../core/environment/environment';
import type { TimeOfDayId } from '../core/environment/sky';
import { TIME_OF_DAY_IDS } from '../core/environment/sky';
import { PostFX, type QualityTier } from '../core/post/PostFX';
import { SunbeamMotes } from '../features/showroom/sunbeam';
import { SUITES } from '../features/showroom/suites';
import { ShowroomController } from '../features/showroom/ShowroomController';
import { LibraryController } from '../features/library/LibraryController';
import { EditorController } from '../features/editor/EditorController';
import { PlacementInput } from '../features/editor/view/input';
import { CATALOG, getEntry, getVariant, categories } from '../catalog';
import { applyLampLevel } from '../catalog/builders/shared/primitives';
import { setLampEmissiveLevel } from '../assets/materials';
import { TopNav } from '../ui/nav/TopNav';
import { AmbientBar } from '../ui/ambient/AmbientBar';
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
  readonly ambientBar: AmbientBar;
  readonly toastHost: HTMLElement;
  readonly motes: SunbeamMotes;
  postfx: PostFX | null = null;

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

    // sunbeam dust motes — float over the whole scene, bounds follow the active room
    this.motes = new SunbeamMotes();
    this.scene.add(this.motes.root);

    // sky-driven exposure and lamp glow
    this.env.onExposure((e) => {
      const r = this.engine.renderer;
      if (r) r.toneMappingExposure = e;
    });
    this.env.onLampLevel((level) => {
      applyLampLevel(this.scene, level);
      setLampEmissiveLevel(level);
    });

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
      onClear: () => {
        this.editor.clearRoom();
        this.refreshSpec();
        this.syncToolbar();
        toast('Room cleared', this.toastHost);
      },
      onRestore: () => {
        this.editor.clearRoom();
        this.editor.seedSuiteBaseline();
        this.refreshSpec();
        this.syncToolbar();
        toast('Suite baseline restored', this.toastHost);
      },
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

    // ambient bar — time of day, capture, quality (all modes)
    this.ambientBar = new AmbientBar({
      onTimeOfDay: (id) => this.setTimeOfDay(id),
      onCapture: () => void this.capture(),
      onQuality: (t) => this.setQuality(t),
    });

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
    appRoot.append(shell, this.ambientBar.root, this.toastHost);

    // engine loop hooks
    this.engine.addUpdater((dt) => {
      this.rig.update(dt);
      this.library.update(dt);
      this.showroom.update(); // dollhouse wall culling
      this.editor.update(); // dollhouse wall culling
      this.env.update(dt); // sky transitions (sun, IBL rebake, exposure, lamps)
      this.motes.update(dt, this.env.sky.state.elevation);
    });
    this.engine.setScene(this.scene);

    // initial state
    this.suitePanel.renderFor(this.showroom.activeSuite);
    this.refreshSpec();
    this.setMode('showroom');
  }

  async start(): Promise<void> {
    await this.engine.init();
    const params = new URLSearchParams(window.location.search);
    // debug toggles (QA experiments): ?shadows=off
    if (params.get('shadows') === 'off' && this.engine.renderer) {
      this.engine.renderer.shadowMap.enabled = false;
    }
    // photoreal pipeline: bake the sky IBL, then attach the post chain
    this.env.attachRenderer(this.engine.renderer!);
    // the configurator opens on the furnished suite ("configure what you saw");
    // tests opt out with ?seed=0 to exercise the empty-room flows
    if (this.editor.list().length === 0 && params.get('seed') !== '0') this.editor.seedSuiteBaseline();
    this.refreshSpec();
    const fxOff = params.get('fx') === 'off';
    const grainOverride = params.get('grain') !== null ? Number(params.get('grain')) : undefined;
    const tierParam = params.get('tier') as QualityTier | null;
    if (!fxOff) {
      const tier: QualityTier = tierParam ?? (this.engine.backendLabel === 'WebGPU' ? 'cinematic' : 'balanced');
      this.postfx = new PostFX(this.engine.renderer!, this.scene, this.engine.camera!, {
        tier,
        webgpu: this.engine.backendLabel === 'WebGPU',
        ...(grainOverride !== undefined && Number.isFinite(grainOverride) ? { grainOverride } : {}),
      });
      this.engine.setPostFX(this.postfx);
    }
    applyLampLevel(this.scene, this.env.sky.state.lampLevel);
    setLampEmissiveLevel(this.env.sky.state.lampLevel);
    this.engine.start();
  }

  /** Time-of-day preset — smooth 1.6 s transition of the whole lighting rig. */
  setTimeOfDay(id: TimeOfDayId): void {
    if (!TIME_OF_DAY_IDS.includes(id)) return;
    this.env.setTimeOfDay(id);
    this.ambientBar.setTimeOfDay(id);
  }

  setQuality(tier: QualityTier | 'auto'): void {
    if (!this.postfx) return;
    if (tier === 'auto') {
      this.postfx.autoQuality = true;
      return;
    }
    this.postfx.setTier(tier);
  }

  /** Photo mode — high-res PNG of the current frame. */
  async capture(): Promise<void> {
    this.ambientBar.flash();
    const blob = await this.engine.capture();
    if (!blob) {
      toast('Capture failed', this.toastHost);
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `flamingo-${this.mode}-${this.env.timeOfDay}-${Date.now()}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    toast('Photograph saved', this.toastHost);
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
    // newly mounted fixtures pick up the current lamp level; motes follow the active room
    applyLampLevel(this.scene, this.env.sky.state.lampLevel);
    this.syncMoteBounds();
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
      applyLampLevel(this.scene, this.env.sky.state.lampLevel);
      this.syncMoteBounds();
    }
  }

  /** Keep the dust-mote volume over whichever room is on stage. */
  private syncMoteBounds(): void {
    const suite = this.mode === 'editor' ? this.editor.roomBounds : this.showroom.activeRoomBounds;
    if (suite) {
      this.motes.setBounds({ x0: 0, x1: suite.width, z0: 0, z1: suite.depth, height: suite.height ?? 2.6 });
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
      // --- photoreal pipeline
      timeOfDay: () => self.env.timeOfDay,
      setTimeOfDay: (id) => self.setTimeOfDay(id as TimeOfDayId),
      setQuality: (tier) => self.setQuality(tier as QualityTier | 'auto'),
      quality: () => (self.postfx ? self.postfx.describe() : 'off'),
      postEnabled: () => self.postfx?.isEnabled === true,
      setPostEnabled: (on) => self.postfx?.setEnabled(on),
      debugShadow: () => {
        const r = self.engine.renderer as any;
        const sun = self.env.sun;
        const cam = sun.shadow.camera;
        let castShadowCount = 0;
        let pointLights = 0;
        self.scene.traverse((o: any) => {
          if (o.isMesh && o.castShadow) castShadowCount++;
          if (o.isPointLight) pointLights++;
        });
        return {
          shadowMapEnabled: r?.shadowMap?.enabled ?? null,
          shadowMapType: r?.shadowMap?.type ?? null,
          sunPos: sun.position.toArray().map((n: number) => +n.toFixed(2)),
          sunTarget: sun.target.position.toArray().map((n: number) => +n.toFixed(2)),
          sunIntensity: +sun.intensity.toFixed(2),
          sunColor: '#' + sun.color.getHexString(),
          shadowCam: { l: cam.left, r: cam.right, t: cam.top, b: cam.bottom, near: cam.near, far: cam.far, mapSize: sun.shadow.mapSize.x },
          bias: sun.shadow.bias, normalBias: sun.shadow.normalBias,
          castShadowMeshes: castShadowCount,
          pointLights,
          shadowMapAllocated: !!sun.shadow.map,
          sunVisible: sun.visible,
          sunInScene: self.env.root.children.includes(sun),
          targetMatrixWorld: sun.target.matrixWorld.toArray().map((n: number) => +n.toFixed(2)).slice(11, 14),
        };
      },
      debugStrip: (what: string) => {
        const scene = self.scene;
        const remove: THREE.Object3D[] = [];
        scene.traverse((o: any) => {
          if (what.includes('points') && o.isPoints) remove.push(o);
          if (what.includes('lamps') && o.isPointLight) remove.push(o);
          if (what.includes('sky') && o.name === 'sky') remove.push(o);
          if (what.includes('contact') && o.name === 'contact-shadow') remove.push(o);
        });
        for (const o of remove) o.parent?.remove(o);
        if (what.includes('materials')) {
          const plain = new (THREE as any).MeshStandardMaterial({ color: 0xd8cfc0, roughness: 0.9 });
          scene.traverse((o: any) => {
            if (o.isMesh && o.material) o.material = plain;
          });
        }
        if (what.includes('sun')) self.env.sun.visible = false;
        if (what.includes('freshsun')) {
          const L = new (THREE as any).DirectionalLight(0xffffff, 4.0);
          L.position.set(3, 8, -4);
          self.scene.add(L, L.target);
        }
        if (what.includes('sunmoves')) {
          self.env.sun.position.set(3.25 + 3, 8, 2.75 - 4);
          self.env.sun.shadow.camera.far = 60;
          self.env.sun.shadow.camera.updateProjectionMatrix();
        }
        if (what.includes('nocast')) self.env.sun.castShadow = false;
        if (what.includes('env')) { scene.environment = null; scene.environmentIntensity = 0; }
        if (what.includes('hemi')) {
          scene.traverse((o: any) => { if (o.isHemisphereLight || o.isAmbientLight) o.visible = false; });
        }
        return remove.length;
      },
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
