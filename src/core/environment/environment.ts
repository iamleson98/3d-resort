/**
 * Environment — the lighting rig.
 *
 * Photoreal overhaul (tidewater-inspired): sun, sky, IBL, exposure and the
 * interior lamp level all derive from one physical sky state. The sky is a
 * Preetham atmosphere (SkyMesh); its PMREM bake feeds scene.environment so
 * materials reflect the real sky. A warm hemisphere stands in for tidewater's
 * baked ground bounce (sunlit floor/sand lighting the underside of furniture).
 *
 * Anti-flicker invariants (the v1 floor bug) are preserved:
 *  - PCFSoftShadowMap, bias=-0.00035, normalBias=0.04
 *  - tight orthographic shadow frustum fitted to the active room
 *  - 2048² shadow map, stable near/far, capped pixel ratio
 *  - no coplanar surfaces (floors are thick slabs built by RoomShell)
 */
import * as THREE from 'three/webgpu';
import { SkySystem, sunDirection, TIME_OF_DAY, type TimeOfDayId } from './sky';

export interface Environment {
  root: THREE.Group;
  sky: SkySystem;
  sun: THREE.DirectionalLight;
  hemi: THREE.HemisphereLight;
  ambient: THREE.AmbientLight;
  backdrop: THREE.Object3D;
  envMap: THREE.Texture | null;
  readonly timeOfDay: TimeOfDayId;
  /** smooth transition to a time-of-day preset */
  setTimeOfDay(id: TimeOfDayId, instant?: boolean): void;
  /** fit the shadow frustum to the active room; the sun keeps its sky-driven direction */
  fitRoom(w: number, d: number, cx?: number, cz?: number): void;
  update(dt: number): void;
  attachRenderer(renderer: THREE.WebGPURenderer): void;
  /** engine hooks — exposure + interior lamp level follow the sky */
  onExposure(fn: (e: number) => void): void;
  onLampLevel(fn: (l: number) => void): void;
}

const SUN_DIST = 26;

export function createEnvironment(scene: THREE.Scene): Environment {
  const root = new THREE.Group();
  root.name = 'environment';

  let exposureSink: (e: number) => void = () => undefined;
  let lampSink: (l: number) => void = () => undefined;

  const sky = new SkySystem('golden', {
    onExposure: (e) => exposureSink(e),
    onLampLevel: (l) => lampSink(l),
  });
  root.add(sky.root);

  // Key light — direction, color and intensity driven by the sky state.
  const sun = new THREE.DirectionalLight(0xffb268, 3.1);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = SUN_DIST + 22;
  sun.shadow.camera.left = -9;
  sun.shadow.camera.right = 9;
  sun.shadow.camera.top = 9;
  sun.shadow.camera.bottom = -9;
  sun.shadow.bias = -0.00035;
  sun.shadow.normalBias = 0.04;
  root.add(sun, sun.target);

  // Ground bounce — one warm hemisphere, sand-toned underside (tidewater GroundBounce stand-in).
  const hemi = new THREE.HemisphereLight(0xd8cfbb, 0x8f7c60, 0.3);
  root.add(hemi);

  // A whisper of fill so dusk corners never go pitch black; the IBL does the real work.
  const ambient = new THREE.AmbientLight(0xffffff, 0.06);
  root.add(ambient);

  scene.add(root);

  const applySkyToRig = (): void => {
    const s = sky.state;
    const dir = sunDirection(s);
    const cx = sun.target.position.x;
    const cz = sun.target.position.z;
    sun.position.set(cx + dir.x * SUN_DIST, dir.y * SUN_DIST, cz + dir.z * SUN_DIST);
    sun.color.copy(s.sunColor);
    sun.intensity = s.sunIntensity;
    hemi.color.copy(s.hemiSky);
    hemi.groundColor.copy(s.hemiGround);
    hemi.intensity = s.hemiIntensity;
    scene.environmentIntensity = s.envIntensity;
  };

  const env: Environment = {
    root,
    sky,
    sun,
    hemi,
    ambient,
    backdrop: sky.backdrop,
    envMap: null,
    get timeOfDay() {
      return sky.presetId;
    },
    setTimeOfDay(id, instant = false) {
      sky.setPreset(id, instant);
      applySkyToRig();
    },
    fitRoom(w, d, cx = 0, cz = 0) {
      const half = Math.max(w, d) / 2 + 2;
      sun.target.position.set(cx, 0, cz);
      sun.target.updateMatrixWorld();
      const dir = sunDirection(sky.state);
      sun.position.set(cx + dir.x * SUN_DIST, dir.y * SUN_DIST, cz + dir.z * SUN_DIST);
      sun.shadow.camera.left = -half;
      sun.shadow.camera.right = half;
      sun.shadow.camera.top = half;
      sun.shadow.camera.bottom = -half;
      sun.shadow.camera.updateProjectionMatrix();
    },
    update(dt) {
      sky.update(dt);
      applySkyToRig();
    },
    attachRenderer(renderer) {
      sky.attachRenderer(renderer);
      const tex = sky.currentEnvTexture;
      if (tex) scene.environment = tex;
      env.envMap = tex;
      applySkyToRig();
    },
    onExposure(fn) {
      exposureSink = fn;
      fn(sky.state.exposure);
    },
    onLampLevel(fn) {
      lampSink = fn;
      fn(sky.state.lampLevel);
    },
  };

  applySkyToRig();
  return env;
}

export { TIME_OF_DAY };
export type { TimeOfDayId };

/**
 * Back-compat shim for the pre-photoreal signature — controllers now call
 * `env.fitRoom(...)`. Given only the light, it fits the frustum and keeps the
 * existing direction (the legacy 6/9/4 sun vector when nothing else is set).
 */
export function fitShadowToRoom(sun: THREE.DirectionalLight, w: number, d: number, cx = 0, cz = 0): void {
  const half = Math.max(w, d) / 2 + 2;
  sun.target.position.set(cx, 0, cz);
  sun.target.updateMatrixWorld();
  const dir = new THREE.Vector3(6, 9, 4).normalize();
  sun.position.copy(sun.target.position).addScaledVector(dir, SUN_DIST);
  sun.shadow.camera.left = -half;
  sun.shadow.camera.right = half;
  sun.shadow.camera.top = half;
  sun.shadow.camera.bottom = -half;
  sun.shadow.camera.updateProjectionMatrix();
}
