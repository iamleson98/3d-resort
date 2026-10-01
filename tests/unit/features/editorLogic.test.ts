/** Editor logic — collisions, snapping, clamping + undo/redo history. */
import { describe, it, expect } from 'vitest';
import {
  overlaps, snap, snapAngle, clampToRoom, footprint, rotatedExtents,
  hasAnyOverlap, overlapPressure,
} from '@/features/editor/logic/collisions';
import { History } from '@/features/editor/logic/history';

describe('rotatedExtents / footprint', () => {
  it('axis-aligned at rotation 0', () => {
    const f = footprint(5, 5, 2, 1, 0);
    expect(f.hw).toBeCloseTo(1);
    expect(f.hd).toBeCloseTo(0.5);
  });
  it('45° swaps to the diagonal envelope', () => {
    const { hw, hd } = rotatedExtents(2, 1, Math.PI / 4);
    expect(hw).toBeCloseTo((1 + 0.5) * Math.SQRT1_2, 3);
    expect(hd).toBeCloseTo(hw, 5);
  });
  it('90° swaps width and depth', () => {
    const { hw, hd } = rotatedExtents(2, 1, Math.PI / 2);
    expect(hw).toBeCloseTo(0.5);
    expect(hd).toBeCloseTo(1);
  });
});

describe('overlaps', () => {
  const A = { x: 0, z: 0, hw: 1, hd: 1 };
  it('overlap when intersecting', () => {
    expect(overlaps(A, { x: 0.5, z: 0, hw: 1, hd: 1 })).toBe(true);
  });
  it('no overlap when apart', () => {
    expect(overlaps(A, { x: 3, z: 3, hw: 1, hd: 1 })).toBe(false);
  });
  it('touching edges are not overlapping (epsilon)', () => {
    expect(overlaps(A, { x: 2, z: 0, hw: 1, hd: 1 })).toBe(false);
  });
  it('hasAnyOverlap scans lists', () => {
    expect(hasAnyOverlap(A, [{ x: 5, z: 5, hw: 1, hd: 1 }, { x: 0.2, z: 0, hw: 1, hd: 1 }])).toBe(true);
    expect(hasAnyOverlap(A, [{ x: 5, z: 5, hw: 1, hd: 1 }])).toBe(false);
  });
});

describe('overlapPressure', () => {
  it('zero when alone', () => {
    expect(overlapPressure({ x: 0, z: 0, hw: 1, hd: 1 }, [])).toBe(0);
  });
  it('full burial → 1', () => {
    expect(overlapPressure({ x: 0, z: 0, hw: 1, hd: 1 }, [{ x: 0, z: 0, hw: 1, hd: 1 }])).toBe(1);
  });
  it('partial overlap between 0 and 1', () => {
    const p = overlapPressure({ x: 0, z: 0, hw: 1, hd: 1 }, [{ x: 1, z: 0, hw: 1, hd: 1 }]);
    expect(p).toBeGreaterThan(0);
    expect(p).toBeLessThan(1);
  });
});

describe('snap / snapAngle / clampToRoom', () => {
  it('snap rounds to grid', () => {
    expect(snap(1.04, 0.1)).toBeCloseTo(1.0);
    expect(snap(1.06, 0.1)).toBeCloseTo(1.1);
    expect(snap(1.04, 0)).toBe(1.04); // disabled
  });
  it('snapAngle quantizes to 15°', () => {
    expect(snapAngle((16 * Math.PI) / 180)).toBeCloseTo((15 * Math.PI) / 180, 5);
    expect(snapAngle((7 * Math.PI) / 180)).toBeCloseTo(0, 5);
  });
  it('clampToRoom keeps the footprint inside', () => {
    expect(clampToRoom(-5, 3, 0.5, 0.5, 6, 6).x).toBeCloseTo(0.5);
    expect(clampToRoom(30, 3, 0.5, 0.5, 6, 6).x).toBeCloseTo(5.5);
    expect(clampToRoom(3, -2, 0.5, 0.5, 6, 6).z).toBeCloseTo(0.5);
  });
});

describe('History', () => {
  it('push/undo/redo round trip', () => {
    const h = new History<number[]>([]);
    h.push([1], 'add-1');
    h.push([1, 2], 'add-2');
    h.push([1, 2, 3], 'add-3');
    expect(h.state).toEqual([1, 2, 3]);
    expect(h.undo()).toEqual([1, 2]);
    expect(h.undo()).toEqual([1]);
    expect(h.undo()).toEqual([]);
    expect(h.undo()).toBeNull();
    expect(h.redo()).toEqual([1]);
    expect(h.redo()).toEqual([1, 2]);
    expect(h.redo()).toEqual([1, 2, 3]);
    expect(h.redo()).toBeNull();
  });
  it('push clears the redo stack', () => {
    const h = new History<number[]>([]);
    h.push([1], 'one');
    h.push([2], 'two');
    h.undo();
    h.push([9], 'branch');
    expect(h.canRedo).toBe(false);
    expect(h.state).toEqual([9]);
  });
  it('caps the past stack', () => {
    const h = new History<number[]>([], 5);
    for (let i = 0; i < 10; i++) h.push([i], `s${i}`);
    let undos = 0;
    while (h.undo() !== null) undos += 1;
    expect(undos).toBe(5);
  });
  it('labels track the origin', () => {
    const h = new History<string>('a', 100, 'init');
    h.push('b', 'first');
    h.undo();
    expect(h.label).toBe('init');
    h.redo();
    expect(h.label).toBe('first');
  });
  it('reset clears everything', () => {
    const h = new History<number[]>([]);
    h.push([1], 'one');
    h.reset([], 'fresh');
    expect(h.canUndo).toBe(false);
    expect(h.canRedo).toBe(false);
    expect(h.label).toBe('fresh');
  });
});
