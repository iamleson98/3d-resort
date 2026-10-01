/**
 * Sunbeam motes — tidewater's AirMotes idea, indoors: a slow drifting field
 * of dust specks suspended in the air of the sunlit room. They read as
 * "golden hour atmosphere" through the glazing and cost one draw call.
 *
 * The field is a uniform volume over the room; visibility is driven by the
 * sun elevation (low sun → visible motes, overhead noon → clean air), so no
 * beam geometry has to match the changing sun azimuth.
 */
import * as THREE from 'three/webgpu';

function moteSprite(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
  g.addColorStop(0, 'rgba(255,244,220,1)');
  g.addColorStop(0.35, 'rgba(255,238,205,0.55)');
  g.addColorStop(1, 'rgba(255,238,205,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return c;
}

export interface MoteBounds {
  x0: number;
  x1: number;
  z0: number;
  z1: number;
  height: number;
}

export class SunbeamMotes {
  readonly root: THREE.Points;
  private readonly mat: THREE.PointsMaterial;
  private readonly positions: Float32Array;
  private readonly seeds: Float32Array;
  private readonly count: number;
  private bounds: MoteBounds = { x0: 0, x1: 6, z0: 0, z1: 5, height: 2.4 };
  private t = 0;
  private level = 0;

  constructor(count = 130) {
    this.count = count;
    this.positions = new Float32Array(count * 3);
    this.seeds = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) this.seeds[i] = Math.random();

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

    this.mat = new THREE.PointsMaterial({
      size: 0.035,
      map: new THREE.CanvasTexture(moteSprite()),
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    this.mat.map!.colorSpace = THREE.SRGBColorSpace;

    this.root = new THREE.Points(geo, this.mat);
    this.root.name = 'sunbeam-motes';
    this.root.frustumCulled = false;
    this.scatter();
  }

  /** Re-seed the volume for a new room. */
  setBounds(b: MoteBounds): void {
    this.bounds = b;
    this.scatter();
  }

  private scatter(): void {
    const { x0, x1, z0, z1, height } = this.bounds;
    for (let i = 0; i < this.count; i++) {
      this.positions[i * 3] = x0 + (x1 - x0) * Math.random();
      this.positions[i * 3 + 1] = 0.25 + (height - 0.35) * Math.random();
      this.positions[i * 3 + 2] = z0 + (z1 - z0) * Math.random();
    }
    (this.root.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  }

  /**
   * Drive the drift + fade.
   * @param sunElevation current sun elevation in degrees
   */
  update(dt: number, sunElevation: number): void {
    this.t += dt;
    // low sun → visible; fade to nothing once the sun climbs past 30°
    const target = THREE.MathUtils.clamp((30 - sunElevation) / 22, 0, 1) * 0.5;
    this.level += (target - this.level) * Math.min(1, dt * 2.5);
    this.mat.opacity = this.level;
    this.root.visible = this.level > 0.01;
    if (!this.root.visible) return;

    const { x0, x1, z0, z1, height } = this.bounds;
    const w = x1 - x0;
    const d = z1 - z0;
    for (let i = 0; i < this.count; i++) {
      const sx = this.seeds[i * 3]!;
      const sy = this.seeds[i * 3 + 1]!;
      const sz = this.seeds[i * 3 + 2]!;
      const ph = this.t * (0.05 + sx * 0.08);
      // gentle brownian-ish wander around the anchor + a slow settle
      this.positions[i * 3] = x0 + w * sx + Math.sin(ph * 2.1 + sz * 40) * 0.08;
      this.positions[i * 3 + 1] = 0.25 + (height - 0.35) * sy + Math.sin(ph * 1.3 + sx * 40) * 0.06;
      this.positions[i * 3 + 2] = z0 + d * sz + Math.cos(ph * 1.7 + sy * 40) * 0.08;
    }
    (this.root.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  }
}
