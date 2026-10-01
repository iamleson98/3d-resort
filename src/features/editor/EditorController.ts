/**
 * EditorController — room configurator mode.
 * Drag-and-drop placement from the catalog, selection, rotate/move/delete,
 * grid snap, collision hints, undo/redo, and spec tracking integration.
 */
import * as THREE from 'three/webgpu';
import type { CatalogEntry, Placement, SpecSnapshot } from '../../shared/domain/types';
import type { CameraRig } from '../../core/camera/CameraRig';
import type { Environment } from '../../core/environment/environment';
import { getEntry, getVariant, CATALOG } from '../../catalog';
import { BUILDERS } from '../../catalog/builders';
import { buildModel } from '../../catalog/builders/shared/context';
import { objectStats } from '../../catalog/builders/shared/primitives';
import { SpecTracker } from '../specs/tracker';
import { History } from './logic/history';
import { footprint, overlaps, snap, snapAngle, clampToRoom, overlapPressure } from './logic/collisions';
import { GhostView, SelectionRing, GridView } from './view/overlays';
import { buildRoomShell, updateWallVisibility, type RoomShellResult } from '../showroom/RoomShell';
import { getSuite } from '../showroom/suites';
import { fitShadowToRoom } from '../../core/environment/environment';

export type EditorEvent = 'placed' | 'moved' | 'rotated' | 'removed' | 'selected' | 'variant' | 'undo' | 'redo';

interface EditorPlacement extends Placement {
  object: THREE.Object3D;
}

export class EditorController {
  readonly root = new THREE.Group();
  private roomW: number;
  private roomD: number;
  private placements: EditorPlacement[] = [];
  private history = new History<Placement[]>([], 120, 'empty-room');
  private tracker = new SpecTracker([...CATALOG], { rooms: 1 });
  private ghost = new GhostView();
  private ring = new SelectionRing();
  private grid: GridView;
  private selectedId: string | null = null;
  private seq = 0;
  private snapStep = 0.1;
  private snapEnabled = true;
  private readonly listeners = new Set<(e: EditorEvent) => void>();
  private shell: RoomShellResult;

  constructor(
    private readonly rig: CameraRig,
    private readonly env: Environment,
  ) {
    this.root.name = 'editor';
    const suite = getSuite('deluxe-king')!;
    this.roomW = suite.room.width;
    this.roomD = suite.room.depth;
    this.shell = buildRoomShell(suite);
    this.root.add(this.shell.root);
    this.grid = new GridView(this.roomW, this.roomD);
    this.root.add(this.ghost.root, this.ring.root, this.grid.root);
    fitShadowToRoom(this.env.sun, this.roomW, this.roomD, this.roomW / 2, this.roomD / 2);
    this.rig.flyTo({ target: new THREE.Vector3(this.roomW / 2, 1.1, this.roomD / 2), radius: Math.max(this.roomW, this.roomD) * 1.05, theta: Math.PI * 0.25, phi: Math.PI * 0.38 }, 0.01);
    this.history.reset([], 'empty-room');
  }

  onEvent(fn: (e: EditorEvent) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(e: EditorEvent): void {
    for (const fn of this.listeners) fn(e);
  }

  private pushHistory(label: string): void {
    this.history.push(this.serialize(), label);
  }

  private serialize(): Placement[] {
    return this.placements.map((p) => ({ id: p.id, modelId: p.modelId, variantId: p.variantId, x: p.x, z: p.z, rotation: p.rotation }));
  }

  // ------------------------------------------------------------- placement
  place(modelId: string, variantId: string, x: number, z: number, rotationDeg = 0): string | null {
    const entry = getEntry(modelId);
    if (!entry) return null;
    const variant = getVariant(entry, variantId);
    const builder = BUILDERS[entry.builder];
    if (!builder) return null;
    this.seq += 1;
    const id = `ed-${this.seq}`;
    const obj = buildModel(builder, variant.materials, variant.params ?? {}, variant.scale ?? 1);
    const rot = snapAngle((rotationDeg * Math.PI) / 180);
    const { x: cx, z: cz } = this.clampPlacement(x, z, rot, entry, variant.id);
    obj.position.set(cx, 0, cz);
    obj.rotation.y = rot;
    obj.name = id;
    this.root.add(obj);
    this.placements.push({ id, modelId, variantId, x: cx, z: cz, rotation: rot, object: obj });
    this.pushHistory(`place ${modelId}`);
    this.emit('placed');
    this.select(id);
    return id;
  }

  private clampPlacement(x: number, z: number, rotation: number, entry: CatalogEntry, variantId: string): { x: number; z: number } {
    const scale = getVariant(entry, variantId).scale ?? 1;
    const w = entry.dimensions.w * scale;
    const d = entry.dimensions.d * scale;
    const half = Math.max(w, d) / 2;
    let px = this.snapEnabled ? snap(x, this.snapStep) : x;
    let pz = this.snapEnabled ? snap(z, this.snapStep) : z;
    const clamped = clampToRoom(px, pz, half, half, this.roomW, this.roomD);
    px = clamped.x;
    pz = clamped.z;
    return { x: px, z: pz };
  }

  select(id: string): boolean {
    const p = this.placements.find((q) => q.id === id);
    if (!p) return false;
    this.selectedId = id;
    const entry = getEntry(p.modelId)!;
    const scale = getVariant(entry, p.variantId).scale ?? 1;
    const half = Math.max(entry.dimensions.w, entry.dimensions.d) * scale * 0.5;
    this.ring.show(p.x, p.z, half);
    this.emit('selected');
    return true;
  }

  deselect(): void {
    this.selectedId = null;
    this.ring.hide();
  }

  get selected(): string | null {
    return this.selectedId;
  }

  rotate(id: string, degrees = 15): boolean {
    const p = this.placements.find((q) => q.id === id);
    if (!p) return false;
    p.rotation = snapAngle(p.rotation + (degrees * Math.PI) / 180);
    p.object.rotation.y = p.rotation;
    const entry = getEntry(p.modelId)!;
    const rec = this.clampPlacement(p.x, p.z, p.rotation, entry, p.variantId);
    p.x = rec.x;
    p.z = rec.z;
    p.object.position.set(p.x, 0, p.z);
    this.pushHistory(`rotate ${id}`);
    this.emit('rotated');
    if (this.selectedId === id) this.select(id);
    return true;
  }

  move(id: string, x: number, z: number): boolean {
    const p = this.placements.find((q) => q.id === id);
    if (!p) return false;
    const entry = getEntry(p.modelId)!;
    const rec = this.clampPlacement(x, z, p.rotation, entry, p.variantId);
    p.x = rec.x;
    p.z = rec.z;
    p.object.position.set(p.x, 0, p.z);
    this.pushHistory(`move ${id}`);
    this.emit('moved');
    if (this.selectedId === id) this.select(id);
    return true;
  }

  remove(id: string): boolean {
    const idx = this.placements.findIndex((q) => q.id === id);
    if (idx < 0) return false;
    const [p] = this.placements.splice(idx, 1);
    this.root.remove(p!.object);
    if (this.selectedId === id) this.deselect();
    this.pushHistory(`remove ${id}`);
    this.emit('removed');
    return true;
  }

  // ------------------------------------------------------------- variants
  switchVariant(id: string, variantId: string): boolean {
    const p = this.placements.find((q) => q.id === id);
    if (!p) return false;
    const entry = getEntry(p.modelId)!;
    const variant = getVariant(entry, variantId);
    if (variant.id !== variantId) return false;
    const builder = BUILDERS[entry.builder];
    if (!builder) return false;
    this.root.remove(p.object);
    const obj = buildModel(builder, variant.materials, variant.params ?? {}, variant.scale ?? 1);
    obj.position.set(p.x, 0, p.z);
    obj.rotation.y = p.rotation;
    obj.name = p.id;
    this.root.add(obj);
    p.variantId = variantId;
    p.object = obj;
    this.pushHistory(`variant ${id}`);
    this.emit('variant');
    return true;
  }

  // ------------------------------------------------------------- ghost drag
  /** True while a ghost model is being dragged (used by PlacementInput). */
  ghostActive(): boolean {
    return this.ghost.root.visible && this.ghost.modelId !== null;
  }

  beginGhost(modelId: string, variantId: string): boolean {
    const entry = getEntry(modelId);
    if (!entry) return false;
    const variant = getVariant(entry, variantId);
    const builder = BUILDERS[entry.builder];
    if (!builder) return false;
    const obj = buildModel(builder, variant.materials, variant.params ?? {}, variant.scale ?? 1);
    this.ghost.attach(obj);
    this.ghost.modelId = modelId;
    this.ghost.variantId = variant.id;
    return true;
  }

  moveGhost(x: number, z: number, rotationDeg = 0): void {
    const entry = getEntry(this.ghost.modelId ?? '');
    if (!entry) return;
    const rot = snapAngle((rotationDeg * Math.PI) / 180);
    const { x: cx, z: cz } = this.clampPlacement(x, z, rot, entry, this.ghost.variantId ?? '');
    this.ghost.moveTo(cx, cz, rot);
    const scale = getVariant(entry, this.ghost.variantId ?? '')?.scale ?? 1;
    const mine = footprint(cx, cz, entry.dimensions.w * scale, entry.dimensions.d * scale, rot);
    const others = this.placements.map((p) => {
      const e = getEntry(p.modelId)!;
      const s = getVariant(e, p.variantId).scale ?? 1;
      return footprint(p.x, p.z, e.dimensions.w * s, e.dimensions.d * s, p.rotation);
    });
    this.ghost.setColliding(others.some((o) => overlaps(mine, o)));
  }

  commitGhost(): string | null {
    if (!this.ghost.modelId || !this.ghost.root.visible) return null;
    const id = this.place(this.ghost.modelId, this.ghost.variantId ?? '', this.ghost.root.position.x, this.ghost.root.position.z, (this.ghost.root.rotation.y * 180) / Math.PI);
    this.ghost.clear();
    return id;
  }

  cancelGhost(): void {
    this.ghost.clear();
  }

  // ------------------------------------------------------------- history
  undo(): boolean {
    const prev = this.history.undo();
    if (!prev) return false;
    this.applyState(prev);
    this.emit('undo');
    return true;
  }

  redo(): boolean {
    const next = this.history.redo();
    if (!next) return false;
    this.applyState(next);
    this.emit('redo');
    return true;
  }

  get canUndo(): boolean {
    return this.history.canUndo;
  }

  get canRedo(): boolean {
    return this.history.canRedo;
  }

  private applyState(state: Placement[]): void {
    for (const p of this.placements) this.root.remove(p.object);
    this.placements = [];
    this.deselect();
    for (const s of state) {
      const entry = getEntry(s.modelId);
      if (!entry) continue;
      const variant = getVariant(entry, s.variantId);
      const builder = BUILDERS[entry.builder];
      if (!builder) continue;
      const obj = buildModel(builder, variant.materials, variant.params ?? {}, variant.scale ?? 1);
      obj.position.set(s.x, 0, s.z);
      obj.rotation.y = s.rotation;
      obj.name = s.id;
      this.root.add(obj);
      this.placements.push({ ...s, object: obj });
    }
  }

  // ------------------------------------------------------------- settings
  setSnapEnabled(on: boolean): void {
    this.snapEnabled = on;
    this.grid.setVisible(on);
  }

  get snapping(): boolean {
    return this.snapEnabled;
  }

  // ------------------------------------------------------------- specs
  spec(): SpecSnapshot {
    return this.tracker.compute(this.serialize());
  }

  setQuantity(modelId: string, variantId: string, qty: number): boolean {
    const ok = this.tracker.setQuantity(modelId, variantId, qty);
    if (ok) this.emit('placed'); // spec changed
    return ok;
  }

  clearManual(modelId: string, variantId: string): boolean {
    return this.tracker.clearManual(modelId, variantId);
  }

  exportSpec(): object {
    return this.tracker.exportSpec(this.serialize(), { product: 'resort-room', roomW: String(this.roomW), roomD: String(this.roomD) });
  }

  // ------------------------------------------------------------- queries
  list(): Array<{ id: string; modelId: string; variantId: string; x: number; z: number; rotation: number; colliding: boolean }> {
    return this.placements.map((p) => {
      const e = getEntry(p.modelId)!;
      const s = getVariant(e, p.variantId).scale ?? 1;
      const mine = footprint(p.x, p.z, e.dimensions.w * s, e.dimensions.d * s, p.rotation);
      const others = this.placements
        .filter((q) => q.id !== p.id)
        .map((q) => {
          const eq = getEntry(q.modelId)!;
          const sq = getVariant(eq, q.variantId).scale ?? 1;
          return footprint(q.x, q.z, eq.dimensions.w * sq, eq.dimensions.d * sq, q.rotation);
        });
      return {
        id: p.id,
        modelId: p.modelId,
        variantId: p.variantId,
        x: p.x,
        z: p.z,
        rotation: p.rotation,
        colliding: overlapPressure(mine, others) > 0.04,
      };
    });
  }

  stats(): { meshes: number; triangles: number } {
    return objectStats(this.root);
  }

  /** Dollhouse wall culling — called every frame from the engine loop. */
  update(): void {
    updateWallVisibility(this.shell, this.rig.camera.position);
  }

  roomSize(): { w: number; d: number } {
    return { w: this.roomW, d: this.roomD };
  }
}
