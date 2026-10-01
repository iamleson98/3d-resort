/** Editor views — placement ghost, selection ring, snap grid. */
import * as THREE from 'three/webgpu';

/** Semi-transparent preview of the model being placed. */
export class GhostView {
  readonly root = new THREE.Group();
  private tint: THREE.MeshBasicMaterial;
  modelId: string | null = null;
  variantId: string | null = null;

  constructor() {
    this.root.name = 'ghost';
    this.root.visible = false;
    this.tint = new THREE.MeshBasicMaterial({ color: 0xc9a15a, transparent: true, opacity: 0.42, depthWrite: false });
  }

  /** Attach a built model and ghost-tint every mesh. */
  attach(obj: THREE.Object3D): void {
    this.clear();
    obj.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.castShadow = false;
        m.receiveShadow = false;
        m.material = this.tint;
      }
    });
    this.root.add(obj);
    this.root.visible = true;
  }

  /** Red tint when overlapping. */
  setColliding(colliding: boolean): void {
    this.tint.color.setHex(colliding ? 0xb0453a : 0xc9a15a);
    this.tint.opacity = colliding ? 0.55 : 0.42;
  }

  moveTo(x: number, z: number, rotation: number): void {
    this.root.position.set(x, 0, z);
    this.root.rotation.y = rotation;
  }

  clear(): void {
    for (const child of [...this.root.children]) this.root.remove(child);
    this.root.visible = false;
    this.modelId = null;
    this.variantId = null;
  }

  dispose(): void {
    this.clear();
    this.tint.dispose();
  }
}

/** Soft ring under the selected placement. */
export class SelectionRing {
  readonly root = new THREE.Group();
  private ring: THREE.Mesh;

  constructor() {
    this.root.name = 'selection';
    this.root.visible = false;
    const mat = new THREE.MeshBasicMaterial({ color: 0xc9a15a, transparent: true, opacity: 0.85, depthWrite: false });
    this.ring = new THREE.Mesh(new THREE.RingGeometry(0.34, 0.42, 40), mat);
    this.ring.rotation.x = -Math.PI / 2;
    this.ring.position.y = 0.008;
    this.ring.renderOrder = 3;
    this.root.add(this.ring);
  }

  show(x: number, z: number, footprintRadius: number): void {
    const s = Math.max(0.6, footprintRadius * 2.3);
    this.ring.scale.setScalar(s);
    this.root.position.set(x, 0, z);
    this.root.visible = true;
  }

  hide(): void {
    this.root.visible = false;
  }
}

/** Snap grid overlay (10 cm), only in editor mode. */
export class GridView {
  readonly root = new THREE.Group();

  constructor(w: number, d: number, step = 0.5) {
    this.root.name = 'grid';
    const lines = Math.floor(w / step) + 1;
    const linesD = Math.floor(d / step) + 1;
    const positions: number[] = [];
    for (let i = 0; i < lines; i++) {
      const x = i * step;
      positions.push(x, 0, 0, x, 0, d);
    }
    for (let j = 0; j < linesD; j++) {
      const z = j * step;
      positions.push(0, 0, z, w, 0, z);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const mat = new THREE.LineBasicMaterial({ color: 0xc9a15a, transparent: true, opacity: 0.14 });
    const grid = new THREE.LineSegments(geo, mat);
    grid.position.y = 0.012;
    this.root.add(grid);
    this.root.visible = false;
  }

  setVisible(v: boolean): void {
    this.root.visible = v;
  }
}
