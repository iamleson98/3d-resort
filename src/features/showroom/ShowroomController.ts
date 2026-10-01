/**
 * ShowroomController — suite showcase mode.
 * Owns the room shell + all placements, camera zone tours, suite switching.
 */
import * as THREE from 'three/webgpu';
import type { Suite } from '../../shared/domain/types';
import type { CameraRig } from '../../core/camera/CameraRig';
import { SUITES, getSuite } from './suites';
import { buildRoomShell, updateWallVisibility, type RoomShellResult } from './RoomShell';
import { getEntry, getVariant } from '../../catalog';
import { BUILDERS } from '../../catalog/builders';
import { buildModel } from '../../catalog/builders/shared/context';
import { objectStats } from '../../catalog/builders/shared/primitives';
import { fitShadowToRoom } from '../../core/environment/environment';
import type { Environment } from '../../core/environment/environment';

export interface ShowroomState {
  activeSuiteId: string;
  activeZoneId: string;
}

export class ShowroomController {
  readonly root = new THREE.Group();
  private suite: Suite;
  private zoneId = 'overview';
  private placedMeshes: THREE.Object3D[] = [];
  private shell!: RoomShellResult;

  constructor(
    private readonly rig: CameraRig,
    private readonly env: Environment,
  ) {
    this.root.name = 'showroom';
    this.suite = SUITES[0]!;
    this.build();
  }

  get activeSuite(): Suite {
    return this.suite;
  }

  /** Room bounds of the staged suite (motes + ambient features follow this). */
  get activeRoomBounds(): { width: number; depth: number; height: number } {
    return this.suite.room;
  }

  get activeZone(): string {
    return this.zoneId;
  }

  private build(): void {
    this.clear();
    this.shell = buildRoomShell(this.suite);
    this.root.add(this.shell.root);

    for (const p of this.suite.placements) {
      const entry = getEntry(p.modelId);
      if (!entry) {
        console.warn(`[showroom] unknown model ${p.modelId}`);
        continue;
      }
      const variant = getVariant(entry, p.variantId);
      const builder = BUILDERS[entry.builder];
      if (!builder) continue;
      const obj = buildModel(builder, variant.materials, variant.params ?? {}, variant.scale ?? 1);
      obj.position.set(p.x, 0, p.z);
      obj.rotation.y = p.rotation;
      obj.name = p.id;
      this.root.add(obj);
      this.placedMeshes.push(obj);
    }

    fitShadowToRoom(this.env.sun, this.suite.room.width, this.suite.room.depth, this.suite.room.width / 2, this.suite.room.depth / 2);
    if (this.env.fitRoom) this.env.fitRoom(this.suite.room.width, this.suite.room.depth, this.suite.room.width / 2, this.suite.room.depth / 2);
    this.zoneId = 'overview';
    this.applyZoneCamera(true);
  }

  private clear(): void {
    for (const child of [...this.root.children]) this.root.remove(child);
    this.placedMeshes = [];
  }

  loadSuite(id: string): boolean {
    const suite = getSuite(id);
    if (!suite) return false;
    this.suite = suite;
    this.build();
    return true;
  }

  zoneList(): Array<{ id: string; label: string; note?: string }> {
    return this.suite.zones.map((z) => ({ id: z.id, label: z.label, note: z.note }));
  }

  /** Dollhouse wall culling — called every frame from the engine loop. */
  update(): void {
    updateWallVisibility(this.shell, this.rig.camera.position);
  }

  flyToZone(zoneId: string, instant = false): boolean {
    const zone = this.suite.zones.find((z) => z.id === zoneId);
    if (!zone) return false;
    this.zoneId = zone.id;
    this.applyZoneCamera(instant);
    return true;
  }

  private applyZoneCamera(instant: boolean): void {
    const zone = this.suite.zones.find((z) => z.id === this.zoneId) ?? this.suite.zones[0]!;
    this.rig.flyTo(
      {
        target: new THREE.Vector3(zone.target[0], zone.target[1], zone.target[2]),
        radius: zone.radius,
        theta: zone.theta,
        phi: zone.phi,
      },
      instant ? 0.01 : 1.3,
    );
  }

  /** Slow cinematic orbit while idle in showroom. */
  setAutoOrbit(on: boolean): void {
    this.rig.autoOrbit = on;
    this.rig.autoOrbitSpeed = 0.045;
  }

  stats(): { meshes: number; triangles: number } {
    return objectStats(this.root);
  }

  dispose(): void {
    this.clear();
  }
}
