/**
 * RoomShell — suite architecture: floor slab, walls with openings,
 * glazing, baseboards. Anti-flicker invariants:
 *  - floor is a 12 cm-thick BOX (never a coplanar plane)
 *  - glazing is inset into wall openings (not overlapping the wall plane)
 *  - rugs float 12 mm above the floor with polygonOffset (see rug builder)
 *
 * Dollhouse visibility: walls (with their glazing + trim) are grouped per
 * side; `updateWallVisibility` hides the sides that face the camera while
 * the camera is outside the room, so orbiting always keeps the interior
 * visible — the classic configurator treatment.
 */
import * as THREE from 'three/webgpu';
import type { Suite } from '../../shared/domain/types';
import { floorMaterial, getMaterial } from '../../assets/materials';
import { mesh } from '../../catalog/builders/shared/primitives';

export interface RoomSide {
  group: THREE.Group;
  /** outward horizontal normal of this wall */
  normal: THREE.Vector3;
  /** horizontal center of the wall run */
  center: THREE.Vector3;
}

export interface RoomShellResult {
  root: THREE.Group;
  floor: THREE.Mesh;
  walls: THREE.Mesh[];
  sides: RoomSide[];
  bounds: { width: number; depth: number; height: number };
}

interface Opening {
  side: 'north' | 'south' | 'east' | 'west';
  start: number;
  len: number;
}

function wallSegments(total: number, openings: Opening[], side: string): Array<{ start: number; len: number }> {
  const sideOpens = openings.filter((o) => o.side === side).sort((a, b) => a.start - b.start);
  const segs: Array<{ start: number; len: number }> = [];
  let cursor = 0;
  for (const o of sideOpens) {
    if (o.start > cursor) segs.push({ start: cursor, len: o.start - cursor });
    cursor = o.start + o.len;
  }
  if (cursor < total) segs.push({ start: cursor, len: total - cursor });
  return segs;
}

const SIDE_NORMALS: Record<Opening['side'], [number, number]> = {
  north: [0, -1],
  south: [0, 1],
  west: [-1, 0],
  east: [1, 0],
};

export function buildRoomShell(suite: Suite): RoomShellResult {
  const { width: W, depth: D, height: H } = suite.room;
  const openings = suite.room.openings ?? [];
  const wallMat = getMaterial(suite.room.wallMaterial);
  const floorMat = floorMaterial(suite.room.floorMaterial, W, D);
  const glassMat = getMaterial('glass_clear');
  const frameMat = getMaterial('metal_black');
  const trimMat = getMaterial(suite.room.floorMaterial);

  const root = new THREE.Group();
  root.name = `room-${suite.id}`;

  // Floor slab — thick box, top surface exactly at y=0
  const floor = mesh(new THREE.BoxGeometry(W + 0.24, 0.12, D + 0.24), floorMat, W / 2, -0.06, D / 2);
  floor.name = 'floor';
  floor.castShadow = false;
  root.add(floor);

  const walls: THREE.Mesh[] = [];
  const sides: RoomSide[] = [];
  const T = 0.12; // wall thickness

  const buildSide = (side: 'north' | 'south' | 'east' | 'west'): void => {
    const isNS = side === 'north' || side === 'south';
    const total = isNS ? W : D;
    const group = new THREE.Group();
    group.name = `side-${side}`;

    for (const seg of wallSegments(total, openings, side)) {
      const len = seg.len;
      if (len <= 0.05) continue;
      const center = seg.start + len / 2;
      let wall: THREE.Mesh;
      if (side === 'north') wall = mesh(new THREE.BoxGeometry(len, H, T), wallMat, center, H / 2, 0);
      else if (side === 'south') wall = mesh(new THREE.BoxGeometry(len, H, T), wallMat, center, H / 2, D);
      else if (side === 'west') wall = mesh(new THREE.BoxGeometry(T, H, len), wallMat, 0, H / 2, center);
      else wall = mesh(new THREE.BoxGeometry(T, H, len), wallMat, W, H / 2, center);
      wall.name = `wall-${side}`;
      walls.push(wall);
      group.add(wall);
    }
    // glazing in each opening (inset: centered in wall thickness, 2 mm proud)
    for (const o of openings.filter((x) => x.side === side)) {
      const glassH = H - 0.35;
      const y = 0.35 + glassH / 2;
      let glass: THREE.Mesh;
      let mullion: THREE.Mesh;
      if (side === 'north') {
        glass = mesh(new THREE.BoxGeometry(o.len - 0.06, glassH, 0.02), glassMat, o.start + o.len / 2, y, 0);
        mullion = mesh(new THREE.BoxGeometry(0.05, glassH, 0.05), frameMat, o.start + o.len / 2, y, 0);
      } else if (side === 'south') {
        glass = mesh(new THREE.BoxGeometry(o.len - 0.06, glassH, 0.02), glassMat, o.start + o.len / 2, y, D);
        mullion = mesh(new THREE.BoxGeometry(0.05, glassH, 0.05), frameMat, o.start + o.len / 2, y, D);
      } else if (side === 'west') {
        glass = mesh(new THREE.BoxGeometry(0.02, glassH, o.len - 0.06), glassMat, 0, y, o.start + o.len / 2);
        mullion = mesh(new THREE.BoxGeometry(0.05, glassH, 0.05), frameMat, 0, y, o.start + o.len / 2);
      } else {
        glass = mesh(new THREE.BoxGeometry(0.02, glassH, o.len - 0.06), glassMat, W, y, o.start + o.len / 2);
        mullion = mesh(new THREE.BoxGeometry(0.05, glassH, 0.05), frameMat, W, y, o.start + o.len / 2);
      }
      glass.name = `glass-${side}`;
      glass.castShadow = false;
      group.add(glass, mullion);
    }
    // baseboards on solid segments (skip openings) — 8 cm trim
    for (const seg of wallSegments(total, openings, side)) {
      if (seg.len <= 0.05) continue;
      const center = seg.start + seg.len / 2;
      let trim: THREE.Mesh;
      if (side === 'north') trim = mesh(new THREE.BoxGeometry(seg.len, 0.08, 0.02), trimMat, center, 0.04, 0.07);
      else if (side === 'south') trim = mesh(new THREE.BoxGeometry(seg.len, 0.08, 0.02), trimMat, center, 0.04, D - 0.07);
      else if (side === 'west') trim = mesh(new THREE.BoxGeometry(0.02, 0.08, seg.len), trimMat, 0.07, 0.04, center);
      else trim = mesh(new THREE.BoxGeometry(0.02, 0.08, seg.len), trimMat, W - 0.07, 0.04, center);
      trim.castShadow = false;
      group.add(trim);
    }

    root.add(group);
    const [nx, nz] = SIDE_NORMALS[side];
    sides.push({
      group,
      normal: new THREE.Vector3(nx, 0, nz),
      center: new THREE.Vector3(isNS ? W / 2 : (nx > 0 ? W : 0), 0, isNS ? (nz > 0 ? D : 0) : D / 2),
    });
  };

  buildSide('north');
  buildSide('south');
  buildSide('east');
  buildSide('west');

  return { root, floor, walls, sides, bounds: { width: W, depth: D, height: H } };
}

/**
 * Dollhouse culling — hide walls that face the camera while it is outside
 * the room plan (or above wall height), keep everything when inside.
 * Deterministic in the camera position only, so parked cameras stay
 * pixel-stable (anti-flicker). A hysteresis dead-band keeps grazing orbits
 * from chattering a wall on/off around the boundary.
 */
const HIDE_DOT = 0.25;
const SHOW_DOT = 0.02;

export function updateWallVisibility(shell: RoomShellResult, cam: THREE.Vector3): void {
  const { width: W, depth: D, height: H } = shell.bounds;
  const m = 0.3; // margin so grazing angles don't flicker around the boundary
  const inside = cam.x > -m && cam.x < W + m && cam.z > -m && cam.z < D + m && cam.y < H + 0.05;
  for (const s of shell.sides) {
    if (inside) {
      s.group.visible = true;
      continue;
    }
    const dx = cam.x - s.center.x;
    const dz = cam.z - s.center.z;
    // camera is on this side's outward half-plane?
    const dot = s.normal.x * dx + s.normal.z * dz;
    if (dot > HIDE_DOT) s.group.visible = false; // clearly outside → hide
    else if (dot < SHOW_DOT) s.group.visible = true; // clearly behind → show
    // dead-band in between: keep previous state
  }
}
