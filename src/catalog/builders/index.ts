/**
 * Builder registry — maps catalog `builder` ids to ModelBuilder functions.
 * Unit tests assert every catalog entry has a registered builder and that
 * every variant builds into a sane, finite, shadow-flagged object.
 */
import type { ModelBuilder } from './shared/context';
import { buildModel } from './shared/context';
import { objectStats } from './shared/primitives';
import { loungeArmchair, slipperChair, chaiseLongue, pouf } from './seating/lounge';
import { sofa3Seat, benchUpholstered, benchWood } from './seating/sofas';
import { diningChair, barStool } from './seating/chairs';
import { coffeeTableRect, coffeeTableRound, sideTable, barCart } from './tables/coffee';
import { diningTable, consoleTable, deskWriting } from './tables/dining';
import { bedKing, nightstand } from './bedroom/bed';
import { dresser, wardrobe } from './bedroom/casegoods';
import { mirrorFloor, mirrorWall, vanityTable } from './bedroom/mirrors';
import { shelfOpen, bookcaseTall } from './storage/shelving';
import { cabinetSide, tvConsole, barCabinet } from './storage/cabinets';
import { pendantDome, pendantCluster, chandelier } from './lighting/pendants';
import { floorLampArc, floorLampColumn, tableLamp, wallSconce } from './lighting/lamps';
import { artworkLarge, artworkPair, vaseFloor, vaseTable, trayDecor, booksStack, candleHolder, basketWeave } from './decor/decorItems';
import { rugArea, sculptureObject } from './decor/rugs';
import { palmAreca, monstera, ficusTree, oliveTree } from './plants/large';
import { plantPotted, plantHanging, plantTallCorner } from './plants/small';
import { bathtubFreestanding, vanityDouble, showerGlass, toilet } from './bathroom/fixtures';
import { towelRack, sinkVessel } from './bathroom/accessories';
import { partitionScreen, windowWall, doorPanel, columnClassic, archWay } from './architecture/openings';
import { fireplace } from './architecture/fireplace';
import { loungeSunbed, daybedCanopy, umbrellaBeach } from './outdoor/loungers';
import { outdoorTable, outdoorChair, planterLarge, firepit } from './outdoor/patio';

export const BUILDERS: Readonly<Record<string, ModelBuilder>> = Object.freeze({
  lounge_armchair: loungeArmchair,
  slipper_chair: slipperChair,
  chaise_longue: chaiseLongue,
  pouf,
  sofa_3seat: sofa3Seat,
  bench_upholstered: benchUpholstered,
  bench_wood: benchWood,
  dining_chair: diningChair,
  bar_stool: barStool,
  coffee_table_rect: coffeeTableRect,
  coffee_table_round: coffeeTableRound,
  side_table: sideTable,
  bar_cart: barCart,
  dining_table: diningTable,
  console_table: consoleTable,
  desk_writing: deskWriting,
  bed_king: bedKing,
  nightstand,
  dresser,
  wardrobe,
  mirror_floor: mirrorFloor,
  mirror_wall: mirrorWall,
  vanity_table: vanityTable,
  shelf_open: shelfOpen,
  bookcase_tall: bookcaseTall,
  cabinet_side: cabinetSide,
  tv_console: tvConsole,
  bar_cabinet: barCabinet,
  pendant_dome: pendantDome,
  pendant_cluster: pendantCluster,
  chandelier,
  floor_lamp_arc: floorLampArc,
  floor_lamp_column: floorLampColumn,
  table_lamp: tableLamp,
  wall_sconce: wallSconce,
  artwork_large: artworkLarge,
  artwork_pair: artworkPair,
  vase_floor: vaseFloor,
  vase_table: vaseTable,
  tray_decor: trayDecor,
  books_stack: booksStack,
  candle_holder: candleHolder,
  basket_weave: basketWeave,
  rug_area: rugArea,
  sculpture_object: sculptureObject,
  palm_areca: palmAreca,
  monstera,
  ficus_tree: ficusTree,
  olive_tree: oliveTree,
  plant_potted: plantPotted,
  plant_hanging: plantHanging,
  plant_tall_corner: plantTallCorner,
  bathtub_freestanding: bathtubFreestanding,
  vanity_double: vanityDouble,
  shower_glass: showerGlass,
  toilet,
  towel_rack: towelRack,
  sink_vessel: sinkVessel,
  partition_screen: partitionScreen,
  window_wall: windowWall,
  door_panel: doorPanel,
  column_classic: columnClassic,
  arch_way: archWay,
  fireplace,
  lounge_sunbed: loungeSunbed,
  daybed_canopy: daybedCanopy,
  umbrella_beach: umbrellaBeach,
  outdoor_table: outdoorTable,
  outdoor_chair: outdoorChair,
  planter_large: planterLarge,
  firepit,
});

export function getBuilder(id: string): ModelBuilder | undefined {
  return BUILDERS[id];
}

/** Convenience: build any catalog variant directly. */
export function buildVariant(
  builderId: string,
  materials: Record<string, string>,
  params: Record<string, string | number | boolean> = {},
  scale = 1,
): ReturnType<ModelBuilder> | null {
  const builder = BUILDERS[builderId];
  if (!builder) return null;
  return buildModel(builder, materials, params, scale);
}

export { objectStats };
