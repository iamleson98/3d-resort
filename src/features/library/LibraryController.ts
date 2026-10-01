/**
 * LibraryController — model browser mode.
 * Displays one catalog entry at a time on a podium with slow turntable
 * rotation; switching entries/variants rebuilds the displayed object.
 */
import * as THREE from 'three/webgpu';
import type { CatalogEntry } from '../../shared/domain/types';
import type { CameraRig } from '../../core/camera/CameraRig';
import { CATALOG, getEntry, getVariant, entriesByCategory } from '../../catalog';
import { BUILDERS } from '../../catalog/builders';
import { buildModel } from '../../catalog/builders/shared/context';
import { objectStats } from '../../catalog/builders/shared/primitives';
import { buildPodium } from './podium';

export class LibraryController {
  readonly root = new THREE.Group();
  private entry: CatalogEntry;
  private variantId: string;
  private display: THREE.Object3D | null = null;
  private turntable = new THREE.Group();
  private podium = buildPodium();

  constructor(private readonly rig: CameraRig) {
    this.root.name = 'library';
    this.entry = CATALOG[0]!;
    this.variantId = this.entry.variants[0]!.id;
    this.root.add(this.podium, this.turntable);
    this.rig.flyTo({ target: new THREE.Vector3(0, 0.9, 0), radius: 3.6, theta: Math.PI * 0.3, phi: Math.PI * 0.4 }, 0.01);
  }

  get activeEntry(): CatalogEntry {
    return this.entry;
  }

  get activeVariantId(): string {
    return this.variantId;
  }

  private rebuild(): void {
    if (this.display) {
      this.turntable.remove(this.display);
      this.display = null;
    }
    const variant = getVariant(this.entry, this.variantId);
    const builder = BUILDERS[this.entry.builder];
    if (!builder) return;
    const obj = buildModel(builder, variant.materials, variant.params ?? {}, variant.scale ?? 1);
    // center the model on the podium
    const box = new THREE.Box3().setFromObject(obj);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    obj.position.set(-center.x, -box.min.y, -center.z);
    this.turntable.add(obj);
    this.display = obj;
    // frame camera by object height
    const h = Math.max(0.6, size.y);
    this.rig.flyTo({ target: new THREE.Vector3(0, h * 0.55, 0), radius: Math.max(1.6, h * 2.1), theta: Math.PI * 0.3, phi: Math.PI * 0.4 }, 0.9);
  }

  show(modelId: string, variantId?: string): boolean {
    const entry = getEntry(modelId);
    if (!entry) return false;
    this.entry = entry;
    this.variantId = variantId ?? entry.variants[0]!.id;
    if (!entry.variants.some((v) => v.id === this.variantId)) {
      this.variantId = entry.variants[0]!.id;
    }
    this.rebuild();
    return true;
  }

  switchVariant(variantId: string): boolean {
    if (!this.entry.variants.some((v) => v.id === variantId)) return false;
    this.variantId = variantId;
    this.rebuild();
    return true;
  }

  /** Called by the render loop — gentle turntable. */
  update(dt: number): void {
    this.turntable.rotation.y += dt * 0.35;
  }

  stats(): { meshes: number; triangles: number } {
    return objectStats(this.root);
  }

  /** Random entry from a category (for "surprise me" / tests). */
  randomFrom(category: string): boolean {
    const list = entriesByCategory(category as never);
    if (!list.length) return false;
    const pick = list[Math.floor(Math.random() * list.length)]!;
    return this.show(pick.id);
  }
}
