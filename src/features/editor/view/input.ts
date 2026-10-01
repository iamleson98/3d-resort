/**
 * PlacementInput — pointer plumbing for drag-and-drop placement.
 * Raycasts the floor plane, drives the ghost, commits on click/tap.
 * Also supports selecting placed objects by picking.
 */
import * as THREE from 'three/webgpu';
import type { EditorController } from '../EditorController';

export class PlacementInput {
  private raycaster = new THREE.Raycaster();
  private ndc = new THREE.Vector2();
  private dragging = false;
  private disposers: Array<() => void> = [];

  constructor(
    private readonly canvas: HTMLElement,
    private readonly camera: THREE.PerspectiveCamera,
    private readonly editor: EditorController,
  ) {
    const onPointerMove = (e: PointerEvent): void => this.handleMove(e);
    const onPointerDown = (e: PointerEvent): void => this.handleDown(e);
    const onPointerUp = (): void => this.handleUp();
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    this.disposers.push(
      () => canvas.removeEventListener('pointermove', onPointerMove),
      () => canvas.removeEventListener('pointerdown', onPointerDown),
      () => window.removeEventListener('pointerup', onPointerUp),
    );
  }

  private toNdc(e: PointerEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.ndc.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );
  }

  /** Intersect the y=0 floor plane; returns world x/z or null. */
  private floorPoint(): { x: number; z: number } | null {
    this.raycaster.setFromCamera(this.ndc, this.camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hit = new THREE.Vector3();
    const ok = this.raycaster.ray.intersectPlane(plane, hit);
    return ok ? { x: hit.x, z: hit.z } : null;
  }

  private handleMove(e: PointerEvent): void {
    this.toNdc(e);
    const pt = this.floorPoint();
    if (!pt) return;
    if (this.editor.ghostActive()) {
      this.editor.moveGhost(pt.x, pt.z);
    }
  }

  private handleDown(e: PointerEvent): void {
    this.toNdc(e);
    const pt = this.floorPoint();
    if (!pt) return;
    if (this.editor.ghostActive()) {
      this.dragging = true;
      this.editor.moveGhost(pt.x, pt.z);
    } else {
      // pick a placed object under the cursor
      this.raycaster.setFromCamera(this.ndc, this.camera);
      const hits = this.raycaster.intersectObject(this.editor.root, true);
      const hit = hits.find((h) => (h.object as THREE.Mesh).isMesh);
      if (hit) {
        let o: THREE.Object3D | null = hit.object;
        while (o && !o.name.startsWith('ed-')) o = o.parent;
        if (o) this.editor.select(o.name);
      } else {
        this.editor.deselect();
      }
    }
  }

  private handleUp(): void {
    if (this.dragging && this.editor.ghostActive()) {
      this.editor.commitGhost();
    }
    this.dragging = false;
  }

  dispose(): void {
    for (const d of this.disposers) d();
    this.disposers = [];
  }
}
