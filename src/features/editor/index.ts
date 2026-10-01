/** Editor feature public API. */
export { EditorController } from './EditorController';
export type { EditorEvent } from './EditorController';
export { History } from './logic/history';
export type { HistoryEntry } from './logic/history';
export {
  overlaps, snap, snapAngle, clampToRoom, footprint, rotatedExtents,
  hasAnyOverlap, overlapPressure,
} from './logic/collisions';
export type { Box2 } from './logic/collisions';
export { GhostView, SelectionRing, GridView } from './view/overlays';
