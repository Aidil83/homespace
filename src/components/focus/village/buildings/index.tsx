"use client";

import type { VillageBuilding } from "@/lib/village/types";
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
};

interface BuildingRendererProps {
  building: VillageBuilding;
  timerState: string;
}

export function BuildingRenderer({ building, timerState }: BuildingRendererProps) {
  const Component = BUILDING_COMPONENTS[building.buildingType];
  if (!Component) return null;

  return (
    <group
      position={[building.positionX, 0, building.positionZ]}
      rotation={[0, building.rotation, 0]}
    >
      <Component timerState={timerState} />
    </group>
  );
}
