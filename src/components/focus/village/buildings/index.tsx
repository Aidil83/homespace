"use client";

import type { VillageBuilding } from "@/lib/village/types";
import type { TerrainData } from "@/lib/village/terrain";
import { getBlockHeight } from "@/lib/village/terrain";
import { Cottage } from "./cottage";
import { Farm } from "./farm";
import { Well } from "./well";
import { Garden } from "./garden";
import { Windmill } from "./windmill";
import { Market } from "./market";
import { Blacksmith } from "./blacksmith";
import { Tavern } from "./tavern";
import { Chapel } from "./chapel";
import { Watchtower } from "./watchtower";
import { Library } from "./library";
import { Bakery } from "./bakery";
import { FishingHut } from "./fishing-hut";
import { BridgeBuilding } from "./bridge-building";
import { Stable } from "./stable";
import { Lighthouse } from "./lighthouse";
import { Brewery } from "./brewery";
import { Mine } from "./mine";
import { Castle } from "./castle";
import { Granary } from "./granary";
import { Barracks } from "./barracks";
import { Apothecary } from "./apothecary";
import { Dock } from "./dock";
import { BuildingFountain } from "./building-fountain";

const BUILDING_COMPONENTS: Record<string, React.ComponentType<{ timerState?: string }>> = {
  cottage: Cottage,
  farm: Farm,
  well: Well,
  garden: Garden,
  windmill: Windmill,
  market: Market,
  blacksmith: Blacksmith,
  tavern: Tavern,
  chapel: Chapel,
  watchtower: Watchtower,
  library: Library,
  bakery: Bakery,
  "fishing-hut": FishingHut,
  "bridge-building": BridgeBuilding,
  stable: Stable,
  lighthouse: Lighthouse,
  brewery: Brewery,
  mine: Mine,
  castle: Castle,
  granary: Granary,
  barracks: Barracks,
  apothecary: Apothecary,
  dock: Dock,
  "building-fountain": BuildingFountain,
};

interface BuildingRendererProps {
  building: VillageBuilding;
  timerState: string;
  terrain: TerrainData;
}

export function BuildingRenderer({ building, timerState, terrain }: BuildingRendererProps) {
  const Component = BUILDING_COMPONENTS[building.buildingType];
  if (!Component) return null;

  const terrainY = getBlockHeight(terrain.heightMap, building.positionX, building.positionZ);

  return (
    <group
      position={[building.positionX, terrainY, building.positionZ]}
      rotation={[0, building.rotation, 0]}
    >
      <Component timerState={timerState} />
    </group>
  );
}
