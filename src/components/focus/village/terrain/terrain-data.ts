import { generateTerrain, type TerrainData } from "@/lib/village/terrain";

// Computed terrain singleton — generated once, shared across components
let _terrain: TerrainData | null = null;

export function getTerrainData(): TerrainData {
  if (!_terrain) {
    _terrain = generateTerrain();
  }
  return _terrain;
}
