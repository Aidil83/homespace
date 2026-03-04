import type { BuildingType } from "./types";
import { BUILDING_GRID_POSITIONS, gridToWorld } from "./terrain";

export interface District {
  name: string;
  buildings: BuildingType[];
}

export const DISTRICTS: District[] = [
  {
    name: "Residential",
    buildings: ["cottage", "farm", "well", "garden", "library", "bakery", "tavern", "chapel"],
  },
  {
    name: "Market",
    buildings: ["market", "brewery", "building-fountain", "apothecary"],
  },
  {
    name: "Hilltop",
    buildings: ["windmill", "blacksmith", "watchtower", "mine", "barracks", "castle"],
  },
  {
    name: "Farming",
    buildings: ["stable", "granary"],
  },
  {
    name: "Waterfront",
    buildings: ["fishing-hut", "lighthouse", "dock", "bridge-building"],
  },
];

export interface BuildingSlot {
  buildingType: string;
  gx: number;
  gy: number;
  worldX: number;
  worldZ: number;
}

/**
 * Get world position for a building type from the grid layout
 */
export function getBuildingWorldPosition(buildingType: string): { x: number; z: number } | null {
  const entry = BUILDING_GRID_POSITIONS.find((b) => b.name === buildingType);
  if (!entry) return null;
  return gridToWorld(entry.gx, entry.gy);
}
