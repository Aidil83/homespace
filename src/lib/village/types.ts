export type BuildingType =
  | "cottage"
  | "farm"
  | "well"
  | "garden"
  | "windmill"
  | "market"
  | "blacksmith"
  | "tavern"
  | "chapel"
  | "watchtower";

export interface BuildingTier {
  minSessions: number;
  buildings: BuildingType[];
}

export const BUILDING_TIERS: BuildingTier[] = [
  { minSessions: 0, buildings: ["cottage", "farm", "well", "garden"] },
  { minSessions: 5, buildings: ["windmill", "market"] },
  { minSessions: 10, buildings: ["blacksmith", "tavern"] },
  { minSessions: 20, buildings: ["chapel", "watchtower"] },
];

export const BUILDING_META: Record<BuildingType, { name: string; icon: string; description: string; tier: number }> = {
  cottage: { name: "Cottage", icon: "🏠", description: "A cozy home for villagers", tier: 1 },
  farm: { name: "Farm", icon: "🌾", description: "Fields of golden wheat", tier: 1 },
  well: { name: "Well", icon: "🪣", description: "Fresh water for the village", tier: 1 },
  garden: { name: "Garden", icon: "🌻", description: "A colorful flower garden", tier: 1 },
  windmill: { name: "Windmill", icon: "🌀", description: "Animated spinning blades", tier: 2 },
  market: { name: "Market", icon: "🏪", description: "A bustling market stall", tier: 2 },
  blacksmith: { name: "Blacksmith", icon: "⚒️", description: "Forge with glowing embers", tier: 3 },
  tavern: { name: "Tavern", icon: "🍺", description: "Warm light from the windows", tier: 3 },
  chapel: { name: "Chapel", icon: "⛪", description: "A steeple reaching skyward", tier: 4 },
  watchtower: { name: "Watchtower", icon: "🗼", description: "A torch-lit lookout tower", tier: 4 },
};

export interface VillageBuilding {
  id: string;
  buildingType: BuildingType;
  gridIndex: number;
  positionX: number;
  positionZ: number;
  rotation: number;
  createdAt: string;
}

export interface VillageStats {
  totalSessions: number;
  totalFocusMinutes: number;
  currentStreak: number;
}

export interface VillageData {
  buildings: VillageBuilding[];
  stats: VillageStats;
  unlockedTypes: BuildingType[];
}

export function getUnlockedTypes(totalSessions: number): BuildingType[] {
  const unlocked: BuildingType[] = [];
  for (const tier of BUILDING_TIERS) {
    if (totalSessions >= tier.minSessions) {
      unlocked.push(...tier.buildings);
    }
  }
  return unlocked;
}
