/**
 * Sky system — physically based sky (Preetham via SkyMesh) driving the whole
 * lighting rig, borrowed from the tidewater aesthetic: a real atmosphere with
 * a real sun, baked to a PMREM environment so every PBR material reflects the
 * actual sky instead of a flat canvas gradient.
 *
 * Two SkyMesh instances share the live state:
 *  - `backdrop` lives in the main scene (visible sky through the glazing),
 *  - `bakeMesh` lives in a private scene used only for PMREM captures.
 *
 * Time-of-day presets move the sun low across the ocean-side glazing so the
 * mullion shadows rake across the floor — the "golden hour suite" hero look.
 */
import * as THREE from 'three/webgpu';
import { SkyMesh } from 'three/addons/objects/SkyMesh.js';

export type TimeOfDayId = 'dawn' | 'noon' | 'golden' | 'dusk';

export interface TimeOfDayPreset {
  id: TimeOfDayId;
  label: string;
  /** sun elevation in degrees above the horizon */
  elevation: number;
  /** sun azimuth in degrees; 0 = due north (−Z, straight out of the glazing), positive = toward +X (east) */
  azimuth: number;
  turbidity: number;
  rayleigh: number;
  mieCoefficient: number;
  mieDirectionalG: number;
  sunColor: number;
  sunIntensity: number;
  exposure: number;
  /** scene.environmentIntensity */
  envIntensity: number;
  /** warm ground-bounce hemisphere intensity */
  hemiIntensity: number;
  hemiSky: number;
  hemiGround: number;
  /** 0..1 — how strongly interior fixtures glow */
  lampLevel: number;
  cloudCoverage: number;
  cloudDensity: number;
}

/**
 * Preset tuning (validated against every suite's framing — all five stage
 * their main glazing on the north wall at z = 0, window runs left-of-center
 * to center, e.g. deluxe-king x∈[1.4, 5]). The sun therefore sits WEST of
 * due north (negative azimuth) so beams clear the window's east jamb and
 * rake across the floor toward +X:
 *  - golden: 17° up, 34° west of north — shafts cross the bed diagonally.
 *  - dawn: 6° up, far west — long raking beams over the whole floor.
 *  - dusk: sun on the horizon, turbidity 11 → amber sky; lamps take over.
 */
export const TIME_OF_DAY: Record<TimeOfDayId, TimeOfDayPreset> = {
  dawn: {
    id: 'dawn', label: 'Dawn',
    elevation: 6, azimuth: -68,
    turbidity: 2.8, rayleigh: 2.4, mieCoefficient: 0.004, mieDirectionalG: 0.8,
    sunColor: 0xffcf9e, sunIntensity: 3.2,
    exposure: 1.02, envIntensity: 0.32, hemiIntensity: 0.22,
    hemiSky: 0xbcc8d8, hemiGround: 0x8a7a64,
    lampLevel: 0.55, cloudCoverage: 0.34, cloudDensity: 0.42,
  },
  noon: {
    id: 'noon', label: 'Midday',
    elevation: 60, azimuth: -18,
    turbidity: 3.0, rayleigh: 1.15, mieCoefficient: 0.0035, mieDirectionalG: 0.8,
    sunColor: 0xfff5e8, sunIntensity: 3.6,
    exposure: 0.72, envIntensity: 0.4, hemiIntensity: 0.18,
    hemiSky: 0xcddbe8, hemiGround: 0x9a8a72,
    lampLevel: 0.0, cloudCoverage: 0.26, cloudDensity: 0.34,
  },
  golden: {
    id: 'golden', label: 'Golden Hour',
    elevation: 17, azimuth: -34,
    turbidity: 6.8, rayleigh: 2.9, mieCoefficient: 0.006, mieDirectionalG: 0.85,
    sunColor: 0xffb268, sunIntensity: 3.4,
    exposure: 0.76, envIntensity: 0.3, hemiIntensity: 0.2,
    hemiSky: 0xd8cfbb, hemiGround: 0x8f7c60,
    lampLevel: 0.25, cloudCoverage: 0.42, cloudDensity: 0.5,
  },
  dusk: {
    id: 'dusk', label: 'Dusk',
    elevation: 1.5, azimuth: -26,
    turbidity: 11, rayleigh: 3.6, mieCoefficient: 0.0085, mieDirectionalG: 0.9,
    sunColor: 0xff9350, sunIntensity: 1.6,
    exposure: 1.3, envIntensity: 0.34, hemiIntensity: 0.2,
    hemiSky: 0x8d90a8, hemiGround: 0x6b5a48,
    lampLevel: 1.0, cloudCoverage: 0.55, cloudDensity: 0.6,
  },
};

export const TIME_OF_DAY_IDS: TimeOfDayId[] = ['dawn', 'noon', 'golden', 'dusk'];

/** Live (interpolated) sky state — everything downstream reads from here. */
export interface SkyState {
  elevation: number;
  azimuth: number;
  turbidity: number;
  rayleigh: number;
  mieCoefficient: number;
  mieDirectionalG: number;
  sunColor: THREE.Color;
  sunIntensity: number;
  exposure: number;
  envIntensity: number;
  hemiIntensity: number;
  hemiSky: THREE.Color;
  hemiGround: THREE.Color;
  lampLevel: number;
  cloudCoverage: number;
  cloudDensity: number;
}

function stateFromPreset(p: TimeOfDayPreset): SkyState {
  return {
    elevation: p.elevation, azimuth: p.azimuth,
    turbidity: p.turbidity, rayleigh: p.rayleigh,
    mieCoefficient: p.mieCoefficient, mieDirectionalG: p.mieDirectionalG,
    sunColor: new THREE.Color(p.sunColor), sunIntensity: p.sunIntensity,
    exposure: p.exposure, envIntensity: p.envIntensity,
    hemiIntensity: p.hemiIntensity,
    hemiSky: new THREE.Color(p.hemiSky), hemiGround: new THREE.Color(p.hemiGround),
    lampLevel: p.lampLevel, cloudCoverage: p.cloudCoverage, cloudDensity: p.cloudDensity,
  };
}

/** Unit vector from the room toward the sun (azimuth 0 = −Z / out the glazing). */
export function sunDirection(state: Pick<SkyState, 'elevation' | 'azimuth'>, out = new THREE.Vector3()): THREE.Vector3 {
  const e = THREE.MathUtils.degToRad(state.elevation);
  const a = THREE.MathUtils.degToRad(state.azimuth);
  return out.set(Math.sin(a) * Math.cos(e), Math.sin(e), -Math.cos(a) * Math.cos(e)).normalize();
}

const SMOOTH = (t: number): number => t * t * (3 - 2 * t);

export interface SkySystemOptions {
  onLampLevel?(level: number): void;
  onExposure?(exposure: number): void;
}

export class SkySystem {
  readonly backdrop: SkyMesh;
  readonly root = new THREE.Group();
  readonly state: SkyState;

  private readonly bakeScene = new THREE.Scene();
  private readonly bakeMesh: SkyMesh;
  private pmrem: THREE.PMREMGenerator | null = null;
  private envRT: THREE.RenderTarget | null = null;
  private renderer: THREE.WebGPURenderer | null = null;

  private from: SkyState;
  private target: SkyState;
  private transitionT = 1; // 1 = settled
  private lastBakeStep = -1;
  private currentPreset: TimeOfDayId;

  private readonly opts: SkySystemOptions;

  constructor(startPreset: TimeOfDayId = 'golden', opts: SkySystemOptions = {}) {
    this.opts = opts;
    this.backdrop = new SkyMesh();
    this.backdrop.scale.setScalar(70);
    this.backdrop.name = 'sky';
    this.root.add(this.backdrop);

    this.bakeMesh = new SkyMesh();
    this.bakeMesh.scale.setScalar(1000);
    this.bakeScene.add(this.bakeMesh);

    this.currentPreset = startPreset;
    this.state = stateFromPreset(TIME_OF_DAY[startPreset]);
    this.from = stateFromPreset(TIME_OF_DAY[startPreset]);
    this.target = stateFromPreset(TIME_OF_DAY[startPreset]);
    this.applyState(this.state);
  }

  get presetId(): TimeOfDayId {
    return this.currentPreset;
  }

  get isTransitioning(): boolean {
    return this.transitionT < 1;
  }

  /** The PMREM texture assigned to scene.environment (null before the first bake). */
  get currentEnvTexture(): THREE.Texture | null {
    return this.envRT?.texture ?? null;
  }

  /** Must be called once after the renderer is initialized (PMREM needs a live backend). */
  attachRenderer(renderer: THREE.WebGPURenderer): void {
    this.renderer = renderer;
    this.pmrem = new THREE.PMREMGenerator(renderer);
    this.bake();
    this.opts.onExposure?.(this.state.exposure);
    this.opts.onLampLevel?.(this.state.lampLevel);
  }

  setPreset(id: TimeOfDayId, instant = false): void {
    if (id === this.currentPreset && this.transitionT >= 1) return;
    this.currentPreset = id;
    this.from = this.snapshot();
    this.target = stateFromPreset(TIME_OF_DAY[id]);
    if (instant) {
      this.transitionT = 1;
      this.applyState(this.target);
      this.bake();
      this.opts.onExposure?.(this.state.exposure);
      this.opts.onLampLevel?.(this.state.lampLevel);
    } else {
      this.transitionT = 0;
      this.lastBakeStep = -1;
    }
  }

  private snapshot(): SkyState {
    const s = this.state;
    return {
      elevation: s.elevation, azimuth: s.azimuth,
      turbidity: s.turbidity, rayleigh: s.rayleigh,
      mieCoefficient: s.mieCoefficient, mieDirectionalG: s.mieDirectionalG,
      sunColor: s.sunColor.clone(), sunIntensity: s.sunIntensity,
      exposure: s.exposure, envIntensity: s.envIntensity,
      hemiIntensity: s.hemiIntensity,
      hemiSky: s.hemiSky.clone(), hemiGround: s.hemiGround.clone(),
      lampLevel: s.lampLevel, cloudCoverage: s.cloudCoverage, cloudDensity: s.cloudDensity,
    };
  }

  /** Advance the transition; rebakes the PMREM a handful of times along the way. */
  update(dt: number): void {
    if (this.transitionT >= 1) return;
    this.transitionT = Math.min(1, this.transitionT + dt / 1.6);
    const k = SMOOTH(this.transitionT);
    const a = this.from;
    const b = this.target;
    const s = this.state;
    s.elevation = THREE.MathUtils.lerp(a.elevation, b.elevation, k);
    s.azimuth = THREE.MathUtils.lerp(a.azimuth, b.azimuth, k);
    s.turbidity = THREE.MathUtils.lerp(a.turbidity, b.turbidity, k);
    s.rayleigh = THREE.MathUtils.lerp(a.rayleigh, b.rayleigh, k);
    s.mieCoefficient = THREE.MathUtils.lerp(a.mieCoefficient, b.mieCoefficient, k);
    s.mieDirectionalG = THREE.MathUtils.lerp(a.mieDirectionalG, b.mieDirectionalG, k);
    s.sunColor.lerpColors(a.sunColor, b.sunColor, k);
    s.sunIntensity = THREE.MathUtils.lerp(a.sunIntensity, b.sunIntensity, k);
    s.exposure = THREE.MathUtils.lerp(a.exposure, b.exposure, k);
    s.envIntensity = THREE.MathUtils.lerp(a.envIntensity, b.envIntensity, k);
    s.hemiIntensity = THREE.MathUtils.lerp(a.hemiIntensity, b.hemiIntensity, k);
    s.hemiSky.lerpColors(a.hemiSky, b.hemiSky, k);
    s.hemiGround.lerpColors(a.hemiGround, b.hemiGround, k);
    s.lampLevel = THREE.MathUtils.lerp(a.lampLevel, b.lampLevel, k);
    s.cloudCoverage = THREE.MathUtils.lerp(a.cloudCoverage, b.cloudCoverage, k);
    s.cloudDensity = THREE.MathUtils.lerp(a.cloudDensity, b.cloudDensity, k);
    this.applyState(s);

    // rebake at 20% steps — 5 small cube renders across the transition,
    // then one exact final bake (the RT is reused, so scene.environment
    // keeps pointing at the same texture object)
    const step = Math.floor(this.transitionT / 0.2);
    if (step > this.lastBakeStep) {
      this.lastBakeStep = step;
      this.bake();
    }
    this.opts.onExposure?.(s.exposure);
    this.opts.onLampLevel?.(s.lampLevel);
    if (this.transitionT >= 1) {
      this.lastBakeStep = -1;
      this.bake();
    }
  }

  private applyState(s: SkyState): void {
    const dir = sunDirection(s);
    for (const sky of [this.backdrop, this.bakeMesh]) {
      sky.turbidity.value = s.turbidity;
      sky.rayleigh.value = s.rayleigh;
      sky.mieCoefficient.value = s.mieCoefficient;
      sky.mieDirectionalG.value = s.mieDirectionalG;
      sky.sunPosition.value.copy(dir);
      sky.cloudCoverage.value = s.cloudCoverage;
      sky.cloudDensity.value = s.cloudDensity;
    }
    // no sun disc anywhere — the disc + bloom reads as a glow sprite, and the
    // hot spot blew out the whole window band; the sky gradient carries the mood
    this.backdrop.showSunDisc.value = 0;
    this.bakeMesh.showSunDisc.value = 0;
  }

  /** Regenerate the PMREM environment texture from the current sky state. */
  bake(): THREE.Texture | null {
    if (!this.renderer || !this.pmrem) return null;
    const next = this.pmrem.fromScene(this.bakeScene, 0, 0.1, 2000, {
      size: 256,
      renderTarget: this.envRT ?? undefined,
    });
    this.envRT = next;
    return next.texture;
  }

  dispose(): void {
    this.pmrem?.dispose();
    this.envRT?.dispose();
  }
}
