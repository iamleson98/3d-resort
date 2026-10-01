/**
 * Engine — renderer lifecycle.
 * WebGPU first, automatic WebGL2 fallback via three's forceWebGL path.
 * If WebGPU *renders* fail at runtime (device loss, driver bugs), the
 * engine demotes itself to WebGL2 on a fresh canvas — the app never
 * shows a frozen frame.
 *
 * Anti-flicker invariants live here: PCFSoft shadows, capped pixel ratio,
 * stable near/far, ACES tone mapping.
 *
 * Photoreal path: when a PostFX chain is attached, the loop renders through
 * it (GTAO → AA → bloom → grade → sharpen) instead of the direct pass.
 */
import * as THREE from 'three/webgpu';
import type { PostFX } from '../post/PostFX';

export interface EngineHooks {
  onBackend?(label: string): void;
}

export class Engine {
  canvas: HTMLCanvasElement;
  renderer: THREE.WebGPURenderer | null = null;
  scene: THREE.Scene | null = null;
  /** Created eagerly — controllers capture it during app construction. */
  readonly camera = new THREE.PerspectiveCamera(47, 1, 0.1, 140);
  backendLabel = 'initializing';
  frameCount = 0;

  private clock = new THREE.Clock();
  private running = false;
  private renderFailures = 0;
  private post: PostFX | null = null;
  private readonly updaters = new Set<(dt: number, elapsed: number) => void>();
  private hooks: EngineHooks;
  private readonly parent: HTMLElement;

  constructor(canvas: HTMLCanvasElement, hooks: EngineHooks = {}) {
    this.canvas = canvas;
    this.hooks = hooks;
    this.parent = canvas.parentElement ?? document.body;
  }

  async init(): Promise<this> {
    // 1) preferred: real WebGPU
    const nav = navigator as Navigator & { gpu?: unknown };
    if (nav.gpu) {
      try {
        const r = new THREE.WebGPURenderer({ canvas: this.canvas, antialias: true });
        await r.init();
        this.renderer = r;
        // three may silently fall back to WebGL internally — read the real backend
        const backend = (r as unknown as { backend?: { isWebGPUBackend?: boolean } }).backend;
        this.backendLabel = backend?.isWebGPUBackend === true ? 'WebGPU' : 'WebGL2';
        if (this.backendLabel === 'WebGL2') {
          // already on the WebGL path; skip the forced rebuild below
          this.finishInit();
          return this;
        }
      } catch {
        this.renderer = null;
      }
    }
    // 2) fallback: WebGL 2 (three's webgl backend, forced)
    if (!this.renderer) await this.buildWebGL();
    this.finishInit();
    return this;
  }

  private async buildWebGL(): Promise<void> {
    // a fresh canvas is required — the previous context type sticks to the element
    if (this.renderer || this.backendLabel === 'WebGPU') {
      const fresh = this.canvas.cloneNode() as HTMLCanvasElement;
      this.canvas.replaceWith(fresh);
      this.canvas = fresh;
      this.renderer?.dispose?.();
      this.renderer = null;
    }
    const r = new THREE.WebGPURenderer({ canvas: this.canvas, antialias: true, forceWebGL: true });
    await r.init();
    this.renderer = r;
    this.backendLabel = 'WebGL2';
  }

  private finishInit(): void {
    const r = this.renderer!;
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    r.setSize(window.innerWidth, window.innerHeight, false);
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.06;
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFSoftShadowMap;

    this.camera.position.set(6, 4, 8);

    window.addEventListener('resize', () => this.onResize());
    this.onResize();
    this.hooks.onBackend?.(this.backendLabel);
  }

  /** Runtime demotion — WebGPU device lost / render threw repeatedly. */
  private async demoteToWebGL(): Promise<void> {
    if (this.backendLabel !== 'WebGPU') return;
    console.warn('[engine] WebGPU rendering failed — falling back to WebGL2');
    this.running = false;
    this.post?.dispose(); // the chain is bound to the dead renderer; rebuilt on next attach
    this.post = null;
    await this.buildWebGL();
    this.finishInit();
    this.start();
  }

  onResize(): void {
    if (!this.renderer) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    if (this.camera) {
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    }
  }

  addUpdater(fn: (dt: number, elapsed: number) => void): () => void {
    this.updaters.add(fn);
    return () => this.updaters.delete(fn);
  }

  setScene(scene: THREE.Scene): void {
    this.scene = scene;
  }

  /** Attach the cinematic post chain — the loop renders through it. */
  setPostFX(post: PostFX | null): void {
    this.post = post;
  }

  get postFX(): PostFX | null {
    return this.post;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.clock.start();
    const loop = (): void => {
      if (!this.running) return;
      requestAnimationFrame(loop);
      const dt = Math.min(this.clock.getDelta(), 0.1);
      const el = this.clock.elapsedTime;
      for (const fn of this.updaters) fn(dt, el);
      if (this.scene && this.camera && this.renderer) {
        try {
          if (this.post?.isEnabled) {
            this.post.updatePerformance(dt);
            this.post.render();
          } else {
            this.renderer.render(this.scene, this.camera);
          }
          this.frameCount += 1;
          this.renderFailures = 0;
        } catch (err) {
          this.renderFailures += 1;
          if (this.renderFailures <= 2) console.error('[engine] render error', err);
          if (this.renderFailures >= 5) void this.demoteToWebGL();
        }
      }
    };
    requestAnimationFrame(loop);
  }

  stop(): void {
    this.running = false;
  }

  stats(): { drawCalls: number; triangles: number } {
    const r = this.renderer as unknown as { info?: { render?: { drawCalls?: number; triangles?: number } } };
    const info = r?.info?.render;
    return { drawCalls: info?.drawCalls ?? 0, triangles: info?.triangles ?? 0 };
  }

  /**
   * Photo mode — render one frame at boosted resolution and return a PNG blob.
   * Renders synchronously, then reads the canvas before it can be cleared.
   */
  async capture(type: 'image/png' | 'image/jpeg' = 'image/png', quality = 0.94): Promise<Blob | null> {
    if (!this.renderer || !this.scene || !this.camera) return null;
    const r = this.renderer;
    const prevRatio = r.getPixelRatio();
    const boosted = Math.min((window.devicePixelRatio || 1) * 1.5, 2.5);
    r.setPixelRatio(boosted);
    this.onResize();
    try {
      if (this.post?.isEnabled) this.post.render();
      else r.render(this.scene, this.camera);
    } catch {
      /* fall through to whatever the canvas holds */
    }
    const blob = await new Promise<Blob | null>((resolve) => {
      this.canvas.toBlob((b) => resolve(b), type, quality);
    });
    r.setPixelRatio(prevRatio);
    this.onResize();
    return blob;
  }
}
