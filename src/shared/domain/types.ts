/** Shared domain types for the Flamingo Cat Ba 3D experience. */

export type Vec2 = readonly [number, number];
export type Vec3 = readonly [number, number, number];

/** Catalog categories, ordered as shown in the UI. */
export const CATEGORIES = [
  'seating',
  'tables',
  'bedroom',
  'storage',
  'lighting',
  'decor',
  'plants',
  'bathroom',
  'architecture',
  'outdoor',
] as const;
export type Category = (typeof CATEGORIES)[number];

/** A named variant of a model (style / material / size options). */
export interface ModelVariant {
  /** Unique within the model, e.g. "walnut". */
  id: string;
  /** Human label, e.g. "Walnut & Cognac". */
  label: string;
  /** Material ids resolved from the material library. */
  materials: Record<string, string>;
  /** Optional scale multiplier (1 = as designed). */
  scale?: number;
  /** Optional extra params forwarded to the builder. */
  params?: Record<string, string | number | boolean>;
}

/** A catalog entry = one model with its variants. */
export interface CatalogEntry {
  id: string;
  label: string;
  category: Category;
  /** Short marketing description. */
  description: string;
  /** Approximate footprint + height in meters (unscaled base variant). */
  dimensions: { w: number; d: number; h: number };
  /** Unit price in USD (base variant). */
  price: number;
  /** Material ids used by the default variant (for spec docs). */
  defaultMaterials: string[];
  variants: ModelVariant[];
  /** Builder function id — maps to builders/index.ts */
  builder: string;
}

/** Billed line in the specification. */
export interface SpecLine {
  modelId: string;
  variantId: string;
  label: string;
  category: Category;
  unitPrice: number;
  quantity: number;
  /** true when the quantity was manually overridden (not auto-derived). */
  manual: boolean;
  materials: string[];
}

export interface SpecSnapshot {
  lines: SpecLine[];
  itemCount: number;
  subtotal: number;
  resortCredit: number;
  total: number;
  rooms: number;
}

/** One placed object in the editor. */
export interface Placement {
  id: string;
  modelId: string;
  variantId: string;
  /** position on the floor plane */
  x: number;
  z: number;
  /** yaw rotation in radians */
  rotation: number;
}

/** Camera waypoint for suite tours. */
export interface Zone {
  id: string;
  label: string;
  /** camera look-at target */
  target: Vec3;
  radius: number;
  theta?: number;
  phi?: number;
  /** optional subtitle describing the zone */
  note?: string;
}

export type RoomKind = 'living' | 'bedroom' | 'bathroom' | 'kitchen' | 'terrace' | 'villa';

export interface SuitePlacement extends Placement {
  zone?: string;
}

/** A showcase suite. */
export interface Suite {
  id: string;
  label: string;
  tagline: string;
  /** nightly rate in USD */
  rate: number;
  /** interior size m² */
  size: number;
  room: {
    kind: RoomKind;
    width: number;
    depth: number;
    height: number;
    floorMaterial: string;
    wallMaterial: string;
    /** wall segments to omit (windows / openings) */
    openings?: Array<{ side: 'north' | 'south' | 'east' | 'west'; start: number; len: number }>;
  };
  placements: SuitePlacement[];
  zones: Zone[];
}

export type AppMode = 'showroom' | 'library' | 'editor';

/** Test harness contract exposed on window.__RESORT__ (see main.ts). */
export interface ResortTestApi {
  ready(): boolean;
  backend(): string;
  mode(): AppMode;
  setMode(m: AppMode): void;
  activeSuite(): string;
  loadSuite(id: string): Promise<void>;
  zones(): Array<{ id: string; label: string }>;
  flyToZone(zoneId: string, instant?: boolean): boolean;
  catalog(): { count: number; categories: Array<{ name: Category; count: number }> };
  selectCategory(c: Category | 'all'): number;
  libraryEntries(): Array<{ id: string; label: string; variants: number }>;
  switchVariant(modelId: string, variantId: string): void;
  place(modelId: string, variantId: string, x: number, z: number, rotation?: number): string | null;
  placements(): Array<{ id: string; modelId: string; variantId: string; x: number; z: number; rotation: number }>;
  select(placementId: string): void;
  rotate(placementId: string, degrees?: number): void;
  move(placementId: string, x: number, z: number): boolean;
  remove(placementId: string): boolean;
  undo(): boolean;
  redo(): boolean;
  spec(): SpecSnapshot;
  setQuantity(modelId: string, variantId: string, qty: number): boolean;
  clearManual(modelId: string, variantId: string): boolean;
  exportSpec(): object;
  stats(): { meshes: number; drawCalls: number; triangles: number };
  frameCount(): number;
  /** --- photoreal pipeline (time of day / post chain) --- */
  timeOfDay(): string;
  setTimeOfDay(id: string): void;
  setQuality(tier: string): void;
  quality(): string;
  postEnabled(): boolean;
  setPostEnabled(on: boolean): void;
  debugShadow(): ShadowDebugInfo;
  debugStrip(what: string): number;
}

/** Shadow diagnostics (QA). */
export interface ShadowDebugInfo {
  shadowMapEnabled: boolean | null;
  shadowMapType: number | null;
  sunPos: number[];
  sunTarget: number[];
  sunIntensity: number;
  sunColor: string;
  shadowCam: { l: number; r: number; t: number; b: number; near: number; far: number; mapSize: number };
  bias: number;
  normalBias: number;
  castShadowMeshes: number;
  pointLights: number;
  shadowMapAllocated: boolean;
  sunVisible: boolean;
  sunInScene: boolean;
  targetMatrixWorld: number[];
}
