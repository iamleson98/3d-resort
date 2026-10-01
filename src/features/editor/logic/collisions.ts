/**
 * Editor collision math — pure logic. Unit tested.
 * Axis-aligned footprints on the floor plane, rotation-aware extents.
 */

export interface Box2 {
  x: number;
  z: number;
  /** half-extents */
  hw: number;
  hd: number;
}

/** World-space AABB half-extents of a rotated footprint. */
export function rotatedExtents(w: number, d: number, rotation: number): { hw: number; hd: number } {
  const c = Math.abs(Math.cos(rotation));
  const s = Math.abs(Math.sin(rotation));
  return {
    hw: (w / 2) * c + (d / 2) * s,
    hd: (w / 2) * s + (d / 2) * c,
  };
}

export function footprint(x: number, z: number, w: number, d: number, rotation: number): Box2 {
  const { hw, hd } = rotatedExtents(w, d, rotation);
  return { x, z, hw, hd };
}

/** Do two footprints overlap? (closed test with epsilon) */
export function overlaps(a: Box2, b: Box2, epsilon = 1e-6): boolean {
  return (
    Math.abs(a.x - b.x) < a.hw + b.hw - epsilon &&
    Math.abs(a.z - b.z) < a.hd + b.hd - epsilon
  );
}

/** Snap a coordinate to a grid of `step` meters (0 disables). */
export function snap(v: number, step: number): number {
  if (step <= 0) return v;
  return Math.round(v / step) * step;
}

/** Clamp position so footprint stays inside room [0..w] x [0..d]. */
export function clampToRoom(x: number, z: number, hw: number, hd: number, roomW: number, roomD: number): { x: number; z: number } {
  return {
    x: Math.min(Math.max(x, hw), Math.max(hw, roomW - hw)),
    z: Math.min(Math.max(z, hd), Math.max(hd, roomD - hd)),
  };
}

/** Any overlap against a list of other footprints? */
export function hasAnyOverlap(self: Box2, others: Box2[], epsilon = 1e-6): boolean {
  for (const o of others) if (overlaps(self, o, epsilon)) return true;
  return false;
}

/** Normalized 0..1 heat of how much a box is buried (UI tinting). */
export function overlapPressure(self: Box2, others: Box2[]): number {
  let area = 0;
  const selfArea = self.hw * 2 * (self.hd * 2);
  if (selfArea <= 0) return 0;
  for (const o of others) {
    const w = Math.min(self.x + self.hw, o.x + o.hw) - Math.max(self.x - self.hw, o.x - o.hw);
    const d = Math.min(self.z + self.hd, o.z + o.hd) - Math.max(self.z - self.hd, o.z - o.hd);
    if (w > 0 && d > 0) area += w * d;
  }
  return Math.min(1, area / selfArea);
}

/** Snap yaw to 15° increments (radians in/out). */
export function snapAngle(rotation: number, degrees = 15): number {
  const step = (degrees * Math.PI) / 180;
  return Math.round(rotation / step) * step;
}
