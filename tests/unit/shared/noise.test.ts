/** Noise math — determinism, ranges, continuity, packing. */
import { describe, it, expect } from 'vitest';
import {
  mulberry32, hash2, valueNoise, fbm, ridged, clamp01, mix, hexRGB, cssRGB,
  heightToNormalBytes, smooth,
} from '@/shared/math/noise';

describe('mulberry32', () => {
  it('is deterministic per seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 100; i++) expect(a()).toBe(b());
  });
  it('produces values in [0,1)', () => {
    const r = mulberry32(7);
    for (let i = 0; i < 2000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
  it('differs across seeds', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    const sa = Array.from({ length: 20 }, () => a());
    const sb = Array.from({ length: 20 }, () => b());
    expect(sa).not.toEqual(sb);
  });
});

describe('hash2 / valueNoise', () => {
  it('hash is stable and bounded', () => {
    for (let x = -5; x < 5; x++) {
      for (let y = -5; y < 5; y++) {
        const h = hash2(x, y, 3);
        expect(h).toBeGreaterThanOrEqual(0);
        expect(h).toBeLessThan(1);
        expect(h).toBe(hash2(x, y, 3));
      }
    }
  });
  it('noise stays in [0,1]', () => {
    for (let i = 0; i < 500; i++) {
      const n = valueNoise(Math.random() * 40 - 20, Math.random() * 40 - 20, 11);
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThanOrEqual(1);
    }
  });
  it('noise is continuous (small delta, small change)', () => {
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 10;
      const y = Math.random() * 10;
      const a = valueNoise(x, y, 5);
      const b = valueNoise(x + 0.001, y, 5);
      expect(Math.abs(a - b)).toBeLessThan(0.01);
    }
  });
});

describe('fbm / ridged', () => {
  it('fbm normalized to [0,1]', () => {
    for (let i = 0; i < 500; i++) {
      const v = fbm(Math.random() * 8, Math.random() * 8, 9, 5);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });
  it('ridged in [0,1]', () => {
    for (let i = 0; i < 500; i++) {
      const v = ridged(Math.random() * 6, Math.random() * 6, 4);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });
  it('deterministic given seed', () => {
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 5;
      expect(fbm(x, 1.5, 77)).toBe(fbm(x, 1.5, 77));
    }
  });
});

describe('scalar utils', () => {
  it('clamp01', () => {
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(0.4)).toBe(0.4);
    expect(clamp01(2)).toBe(1);
  });
  it('mix', () => {
    expect(mix(0, 10, 0.5)).toBe(5);
    expect(mix(2, 4, 0)).toBe(2);
    expect(mix(2, 4, 1)).toBe(4);
  });
  it('smooth hermite', () => {
    expect(smooth(0)).toBe(0);
    expect(smooth(1)).toBe(1);
    expect(smooth(0.5)).toBeCloseTo(0.5);
  });
  it('hexRGB unpacks channels', () => {
    expect(hexRGB(0xff0000)).toEqual([1, 0, 0]);
    expect(hexRGB(0x00ff00)).toEqual([0, 1, 0]);
    expect(hexRGB(0x0000ff)).toEqual([0, 0, 1]);
  });
  it('cssRGB formats', () => {
    expect(cssRGB(0xff0000)).toBe('rgb(255,0,0)');
    expect(cssRGB(0x804020, 2)).toBe('rgb(255,128,64)');
  });
});

describe('heightToNormalBytes', () => {
  it('flat height → neutral normals', () => {
    const size = 16;
    const flat = new Float32Array(size * size).fill(0.5);
    const out = heightToNormalBytes(flat, size, 1);
    expect(out[2]!).toBeGreaterThan(250);
    expect(Math.abs(out[0]! - 127.5)).toBeLessThan(1);
    expect(Math.abs(out[1]! - 127.5)).toBeLessThan(1);
  });
  it('gradient height → tilted normals', () => {
    const size = 16;
    const ramp = new Float32Array(size * size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) ramp[y * size + x] = x / size;
    }
    const out = heightToNormalBytes(ramp, size, 1);
    const nx = out[3 * 4]! - 128;
    expect(nx).toBeLessThan(0);
  });
  it('alpha channel fully opaque', () => {
    const size = 8;
    const h = new Float32Array(size * size).fill(0.3);
    const out = heightToNormalBytes(h, size, 1);
    for (let i = 3; i < out.length; i += 4) expect(out[i]).toBe(255);
  });
});
