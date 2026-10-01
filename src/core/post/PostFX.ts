/**
 * PostFX — the cinematic post chain, ported from tidewater's recipe:
 *
 *   scene (HDR) → GTAO (half-res, temporal) applied to ambient
 *   → AA (TRAA on WebGPU / SMAA otherwise)
 *   → bloom (HDR, threshold 1 — lamps, sun glare, speculars only)
 *   → grade (saturation / contrast / warmth / vignette / grain, pre-tonemap)
 *   → ACES (renderer output transform) → sharpen
 *
 * Quality tiers (the tidewater "dynamic resolution" idea, adapted to feature
 * degradation): cinematic / balanced / efficient, plus a frame-time governor
 * that steps down automatically when the GPU can't keep ~30 fps.
 *
 * Pixel-stability invariant (anti-flicker tests): when `grainEnabled` is false
 * the chain contains no time-dependent node, so a parked camera is bit-stable.
 */
import * as THREE from 'three/webgpu';
import {
  pass, mrt, output, velocity, screenUV, time, hash,
  vec2, vec3, vec4, float, uniform,
  mix, clamp, dot, length, add, sub, mul, oneMinus,
} from 'three/tsl';
import { builtinAOContext } from 'three/tsl';
import { ao } from 'three/addons/tsl/display/GTAONode.js';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';
import { smaa } from 'three/addons/tsl/display/SMAANode.js';
import { traa } from 'three/addons/tsl/display/TRAANode.js';
import { sharpen } from 'three/addons/tsl/display/SharpenNode.js';

export type QualityTier = 'cinematic' | 'balanced' | 'efficient';

/** tidewater's grading defaults (PostFX.js), tuned for interiors */
export interface GradeSettings {
  saturation: number;
  contrast: number;
  warmth: number;
  vignette: number;
  grain: number;
  bloomStrength: number;
  bloomThreshold: number;
  bloomRadius: number;
  sharpen: number;
}

const DEFAULT_GRADE: GradeSettings = {
  saturation: 1.07,
  contrast: 1.05,
  warmth: 0.032,
  vignette: 0.27,
  grain: 0.016,
  bloomStrength: 0.1,
  bloomThreshold: 1.5,
  bloomRadius: 0.6,
  sharpen: 0.35,
};

export interface PostFXOptions {
  tier?: QualityTier;
  /** true when the renderer's real backend is WebGPU (enables TRAA) */
  webgpu?: boolean;
  grade?: Partial<GradeSettings>;
  /** test hook — 0 disables animated grain for pixel-stability tests */
  grainOverride?: number;
}

interface BuiltChain {
  pipeline: THREE.RenderPipeline;
  dispose: () => void;
}

export class PostFX {
  readonly renderer: THREE.WebGPURenderer;
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;

  tier: QualityTier;
  readonly grade: GradeSettings;
  /** animated grain toggle — tests pin to false (pixel-stability invariant) */
  grainEnabled: boolean;
  autoQuality = true;

  private chain: BuiltChain | null = null;
  private enabled = true;
  private readonly webgpu: boolean;
  private requestedTier: QualityTier;

  // frame-time governor
  private frameTimes: number[] = [];
  private lastStepDown = 0;

  constructor(renderer: THREE.WebGPURenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera, opts: PostFXOptions = {}) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.requestedTier = opts.tier ?? 'balanced';
    this.tier = this.requestedTier;
    this.webgpu = opts.webgpu ?? false;
    this.grade = { ...DEFAULT_GRADE, ...opts.grade };
    if (opts.grainOverride !== undefined) {
      this.grade.grain = opts.grainOverride;
      this.grainEnabled = opts.grainOverride > 0;
    } else {
      this.grainEnabled = true;
    }
  }

  setEnabled(on: boolean): void {
    if (this.enabled === on) return;
    this.enabled = on;
    if (!on) this.disposeChain();
  }

  get isEnabled(): boolean {
    return this.enabled;
  }

  setTier(tier: QualityTier): void {
    this.requestedTier = tier;
    if (tier !== this.tier) {
      this.tier = tier;
      this.autoQuality = false;
      this.disposeChain();
    }
  }

  setGrain(on: boolean): void {
    if (this.grainEnabled === on) return;
    this.grainEnabled = on;
    this.disposeChain();
  }

  /** Build the chain for the current tier. Lazily called by render(). */
  private buildChain(): BuiltChain {
    const { renderer, scene, camera, tier } = this;
    const disposers: Array<() => void> = [];

    const useTRAA = tier === 'cinematic' && this.webgpu;
    const scenePass = pass(scene, camera);
    if (useTRAA) {
      // TRAA reprojects the previous frame — needs per-pixel velocity (MRT)
      scenePass.setMRT(mrt({ output, velocity }));
    }
    const scenePassColor = scenePass.getTextureNode();
    const scenePassDepth = scenePass.getTextureNode('depth');

    // ---- ambient occlusion applied to the ambient/indirect term (tidewater: GTAO)
    if (tier !== 'efficient') {
      const aoPass = ao(scenePassDepth, null as unknown as THREE.Node, camera);
      aoPass.resolutionScale = 0.5;
      aoPass.radius.value = 0.9;
      aoPass.thickness.value = 1.0;
      aoPass.scale.value = 1.2;
      aoPass.samples.value = tier === 'cinematic' ? 16 : 8;
      aoPass.useTemporalFiltering = true;
      scenePass.contextNode = builtinAOContext(aoPass.getTextureNode());
      disposers.push(() => aoPass.dispose());
    }

    // ---- anti-aliasing: TRAA (temporal) on WebGPU, SMAA elsewhere
    let color: THREE.Node<'vec4'> = scenePassColor;
    if (useTRAA) {
      const velocityNode = scenePass.getTextureNode('velocity');
      const traaPass = traa(scenePassColor, scenePassDepth, velocityNode, camera);
      color = traaPass as THREE.Node<'vec4'>;
      disposers.push(() => (traaPass as unknown as { dispose?: () => void }).dispose?.());
    } else if (tier === 'balanced') {
      const smaaPass = smaa(scenePassColor);
      color = smaaPass as unknown as THREE.Node<'vec4'>;
      disposers.push(() => (smaaPass as unknown as { dispose?: () => void }).dispose?.());
    }

    // ---- bloom in HDR linear (pre-tonemap) — threshold 1 means only true
    //      emissive peaks bloom: lamp filaments, the sun through the glass, hot speculars
    const g = this.grade;
    const bloomStrength = uniform(g.bloomStrength);
    const bloomThreshold = uniform(g.bloomThreshold);
    const bloomRadius = uniform(g.bloomRadius);
    const bloomNode = bloom(color, bloomStrength, bloomRadius, bloomThreshold) as THREE.Node<'vec4'>;
    const bloomScale = tier === 'efficient' ? 0.6 : 1;
    color = add(color, mul(bloomNode, bloomScale)) as THREE.Node<'vec4'>;

    // ---- grading (tidewater values): saturation, contrast, warmth, vignette, grain
    color = this.applyGrade(color);

    // ---- sharpen last (RCAS-style); skips the AA-free efficient tier
    if (tier !== 'efficient') {
      color = sharpen(color, g.sharpen, false) as THREE.Node<'vec4'>;
    }

    const pipeline = new THREE.RenderPipeline(renderer, color);
    return {
      pipeline,
      dispose: () => {
        disposers.forEach((d) => d());
        (scenePass as unknown as { dispose?: () => void }).dispose?.();
        pipeline.dispose();
      },
    };
  }

  /**
   * The grading stage — tidewater's PostFX grading pass in TSL. Operates on HDR
   * linear color before the renderer's ACES output transform.
   */
  private applyGrade(color: THREE.Node<'vec4'>): THREE.Node<'vec4'> {
    const { saturation, contrast, warmth, vignette, grain } = this.grade;

    const sat = uniform(saturation);
    const con = uniform(contrast);
    const warm = uniform(warmth);
    const vig = uniform(vignette);
    const grainAmp = uniform(grain);

    const c = color.rgb;
    const luma = dot(c, vec3(0.2126, 0.7152, 0.0722));

    // saturation
    let x = mix(vec3(luma), c, sat);

    // warmth — a touch of amber overall (tidewater warmth 0.02; interiors like a bit more)
    x = mul(x, vec3(add(1.0, warm), 1.0, sub(1.0, mul(warm, 0.8))));

    // contrast around the linear mid-gray pivot
    const pivot = 0.18;
    x = add(mul(sub(x, pivot), con), pivot);
    x = clamp(x, 0.0, 8.0);

    // vignette — soft falloff from the frame center, never fully black
    const d = length(sub(screenUV, 0.5));
    const f = clamp(sub(d, 0.32), 0.0, 1.0);
    const mask = oneMinus(mul(vig, mul(f, f)));
    x = mul(x, mask);

    // grain — animated hash noise, luma only; omitted entirely when disabled
    // (pixel-stability invariant for the anti-flicker test suite)
    if (this.grainEnabled) {
      const noise = sub(hash(add(mul(screenUV, 1657.0), mul(time, 97.0))), 0.5);
      x = add(x, mul(noise, grainAmp));
    }

    x = clamp(x, 0.0, 8.0);
    return vec4(x, 1.0);
  }

  private disposeChain(): void {
    this.chain?.dispose();
    this.chain = null;
  }

  /** Render through the chain — replaces renderer.render(scene, camera). */
  render(): void {
    if (!this.enabled) return;
    if (!this.chain) this.chain = this.buildChain();
    this.chain.pipeline.render();
  }

  /** Frame-time governor — call every frame with the raw dt. */
  updatePerformance(dt: number): void {
    if (!this.autoQuality || this.tier === 'efficient') return;
    this.frameTimes.push(dt);
    if (this.frameTimes.length > 90) this.frameTimes.shift();
    if (this.frameTimes.length < 60) return;
    const now = performance.now();
    if (now - this.lastStepDown < 5000) return; // hysteresis: max one step per 5 s
    const sorted = [...this.frameTimes].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)]!;
    if (median > 0.034) {
      // below ~30 fps median — drop one tier, forget the history
      this.lastStepDown = now;
      this.frameTimes = [];
      if (this.tier === 'cinematic') this.tier = 'balanced';
      else if (this.tier === 'balanced') this.tier = 'efficient';
      this.disposeChain();
    }
  }

  dispose(): void {
    this.disposeChain();
  }

  describe(): string {
    return `${this.tier}${this.autoQuality ? ' · auto' : ''}`;
  }
}
