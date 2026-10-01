/**
 * CameraRig — smooth orbit / pan / zoom with eased flyTo tours.
 * Custom (instead of OrbitControls) so the whole app imports a single
 * three instance ('three/webgpu') and we get built-in tweened viewpoints.
 */
import * as THREE from 'three/webgpu';

export interface Viewpoint {
  target?: THREE.Vector3 | [number, number, number];
  radius?: number;
  theta?: number;
  phi?: number;
}

export class CameraRig {
  readonly camera: THREE.PerspectiveCamera;
  private readonly dom: HTMLElement;

  target = new THREE.Vector3(0, 1, 0);
  private targetGoal = this.target.clone();
  private sph = { radius: 7, theta: Math.PI * 0.25, phi: Math.PI * 0.42 };
  private sphGoal = { ...this.sph };

  readonly minRadius = 1.2;
  readonly maxRadius = 42;
  readonly minPhi = 0.12;
  readonly maxPhi = Math.PI * 0.495;
  damping = 0.12;

  enabled = true;
  autoOrbit = false;
  autoOrbitSpeed = 0.05;

  private tween: {
    t: number;
    duration: number;
    fromSph: { radius: number; theta: number; phi: number };
    toSph: { radius: number; theta: number; phi: number };
    fromTarget: THREE.Vector3;
    toTarget: THREE.Vector3;
  } | null = null;

  private readonly pointers = new Map<number, { x: number; y: number }>();
  private state = { rotate: false, pan: false, lastX: 0, lastY: 0, pinchDist: 0 };

  constructor(camera: THREE.PerspectiveCamera, dom: HTMLElement) {
    this.camera = camera;
    this.dom = dom;
    this.bind();
  }

  private bind(): void {
    const el = this.dom;
    el.style.touchAction = 'none';
    el.addEventListener('pointerdown', (e) => this.down(e));
    window.addEventListener('pointermove', (e) => this.move(e));
    window.addEventListener('pointerup', (e) => this.up(e));
    el.addEventListener('wheel', (e) => this.wheel(e), { passive: false });
    el.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private down(e: PointerEvent): void {
    if (!this.enabled) return;
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    this.tween = null;
    this.autoOrbit = false;
    if (e.button === 2 || e.button === 1 || e.altKey) this.state.pan = true;
    else this.state.rotate = true;
    this.state.lastX = e.clientX;
    this.state.lastY = e.clientY;
    if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()];
      this.state.pinchDist = Math.hypot(a!.x - b!.x, a!.y - b!.y);
    }
  }

  private move(e: PointerEvent): void {
    if (!this.enabled || !this.pointers.has(e.pointerId)) return;
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()];
      const d = Math.hypot(a!.x - b!.x, a!.y - b!.y);
      if (this.state.pinchDist > 0) this.zoom((this.state.pinchDist - d) * 0.02);
      this.state.pinchDist = d;
      this.pan(-(b!.x - a!.x) * 0.0008, (b!.y - a!.y) * 0.0008);
      return;
    }

    const dx = e.clientX - this.state.lastX;
    const dy = e.clientY - this.state.lastY;
    this.state.lastX = e.clientX;
    this.state.lastY = e.clientY;

    if (this.state.rotate) {
      this.sphGoal.theta -= dx * 0.005;
      this.sphGoal.phi = THREE.MathUtils.clamp(this.sphGoal.phi - dy * 0.004, this.minPhi, this.maxPhi);
    } else if (this.state.pan) {
      const scale = this.sph.radius * 0.0012;
      this.pan(-dx * scale, -dy * scale);
    }
  }

  private up(e: PointerEvent): void {
    this.pointers.delete(e.pointerId);
    if (this.pointers.size === 0) {
      this.state.rotate = false;
      this.state.pan = false;
    }
    this.state.pinchDist = 0;
  }

  private wheel(e: WheelEvent): void {
    if (!this.enabled) return;
    e.preventDefault();
    this.zoom(e.deltaY * 0.0016);
  }

  zoom(delta: number): void {
    this.tween = null;
    this.sphGoal.radius = THREE.MathUtils.clamp(this.sphGoal.radius * (1 + delta), this.minRadius, this.maxRadius);
  }

  pan(dx: number, dy: number): void {
    this.tween = null;
    const t = new THREE.Vector3();
    this.camera.getWorldDirection(t);
    t.y = 0;
    if (t.lengthSq() < 1e-6) t.set(0, 0, -1);
    t.normalize();
    const right = new THREE.Vector3().crossVectors(this.camera.up, t).normalize();
    this.targetGoal.addScaledVector(right, dx * this.sph.radius);
    this.targetGoal.y = THREE.MathUtils.clamp(this.targetGoal.y + dy * this.sph.radius, 0, 4);
    this.targetGoal.x = THREE.MathUtils.clamp(this.targetGoal.x, -60, 60);
    this.targetGoal.z = THREE.MathUtils.clamp(this.targetGoal.z, -60, 60);
  }

  /** Ease to a viewpoint (angles optional, radians). */
  flyTo(v: Viewpoint, duration = 1.2): void {
    const toTarget = Array.isArray(v.target)
      ? new THREE.Vector3(v.target[0], v.target[1], v.target[2])
      : (v.target ?? this.targetGoal).clone();
    this.tween = {
      t: 0,
      duration,
      fromSph: { ...this.sphGoal },
      toSph: {
        radius: v.radius ?? this.sphGoal.radius,
        theta: v.theta !== undefined ? v.theta : this.sphGoal.theta,
        phi: v.phi !== undefined ? v.phi : this.sphGoal.phi,
      },
      fromTarget: this.targetGoal.clone(),
      toTarget,
    };
    this.autoOrbit = false;
  }

  update(dt: number): void {
    if (this.autoOrbit) this.sphGoal.theta += this.autoOrbitSpeed * dt;

    if (this.tween) {
      const tw = this.tween;
      tw.t += dt;
      const k = THREE.MathUtils.clamp(tw.t / tw.duration, 0, 1);
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      let dTheta = tw.toSph.theta - tw.fromSph.theta;
      while (dTheta > Math.PI) dTheta -= Math.PI * 2;
      while (dTheta < -Math.PI) dTheta += Math.PI * 2;
      this.sphGoal.theta = tw.fromSph.theta + dTheta * e;
      this.sphGoal.phi = THREE.MathUtils.lerp(tw.fromSph.phi, tw.toSph.phi, e);
      this.sphGoal.radius = THREE.MathUtils.lerp(tw.fromSph.radius, tw.toSph.radius, e);
      this.targetGoal.lerpVectors(tw.fromTarget, tw.toTarget, e);
      if (k >= 1) this.tween = null;
    }

    const d = 1 - Math.pow(1 - this.damping, dt * 60);
    this.sph.theta += (this.sphGoal.theta - this.sph.theta) * d;
    this.sph.phi += (this.sphGoal.phi - this.sph.phi) * d;
    this.sph.radius += (this.sphGoal.radius - this.sph.radius) * d;
    this.target.lerp(this.targetGoal, d);
    // convergence snap — the damped approach never lands exactly, and the
    // sub-pixel residual shows up as frame-to-frame shimmer in screenshots
    if (
      Math.abs(this.sph.theta - this.sphGoal.theta) < 1e-5 &&
      Math.abs(this.sph.phi - this.sphGoal.phi) < 1e-5 &&
      Math.abs(this.sph.radius - this.sphGoal.radius) < 1e-5 &&
      this.target.distanceToSquared(this.targetGoal) < 1e-10
    ) {
      this.sph.theta = this.sphGoal.theta;
      this.sph.phi = this.sphGoal.phi;
      this.sph.radius = this.sphGoal.radius;
      this.target.copy(this.targetGoal);
    }

    const sp = this.sph;
    this.camera.position.set(
      this.target.x + sp.radius * Math.sin(sp.phi) * Math.sin(sp.theta),
      this.target.y + sp.radius * Math.cos(sp.phi),
      this.target.z + sp.radius * Math.sin(sp.phi) * Math.cos(sp.theta),
    );
    this.camera.lookAt(this.target);
  }
}
