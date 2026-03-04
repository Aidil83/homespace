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
  | "watchtower"
  | "library"
  | "bakery"
  | "fishing-hut"
  | "bridge-building"
  | "stable"
  | "lighthouse"
  | "brewery"
  | "mine"
  | "castle"
  | "granary"
  | "barracks"
  | "apothecary"
  | "dock"
  | "building-fountain";

export interface BuildingTier {
  minSessions: number;
  buildings: BuildingType[];
}

export const BUILDING_TIERS: BuildingTier[] = [
  { minSessions: 0, buildings: ["cottage", "farm", "well", "garden"] },
  { minSessions: 5, buildings: ["windmill", "market"] },
  { minSessions: 10, buildings: ["blacksmith", "tavern"] },
  { minSessions: 20, buildings: ["chapel", "watchtower"] },
  { minSessions: 30, buildings: ["library", "bakery"] },
  { minSessions: 40, buildings: ["fishing-hut", "stable"] },
  { minSessions: 50, buildings: ["brewery", "granary"] },
  { minSessions: 65, buildings: ["lighthouse", "barracks"] },
  { minSessions: 80, buildings: ["apothecary", "mine"] },
  { minSessions: 100, buildings: ["dock", "bridge-building"] },
  { minSessions: 125, buildings: ["castle", "building-fountain"] },
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
  library: { name: "Library", icon: "📚", description: "A hall of knowledge and scrolls", tier: 5 },
  bakery: { name: "Bakery", icon: "🍞", description: "Fresh bread with chimney smoke", tier: 5 },
  "fishing-hut": { name: "Fishing Hut", icon: "🎣", description: "A riverside fishing shelter", tier: 6 },
  stable: { name: "Stable", icon: "🐴", description: "Home for village horses", tier: 6 },
  brewery: { name: "Brewery", icon: "🍺", description: "Ales and meads for the tavern", tier: 7 },
  granary: { name: "Granary", icon: "🌾", description: "Stores grain for the village", tier: 7 },
  lighthouse: { name: "Lighthouse", icon: "🏗️", description: "Guides travelers at night", tier: 8 },
  barracks: { name: "Barracks", icon: "🛡️", description: "Training grounds for guards", tier: 8 },
  apothecary: { name: "Apothecary", icon: "⚗️", description: "Potions and herbal remedies", tier: 9 },
  mine: { name: "Mine", icon: "⛏️", description: "Ore and gems from the mountain", tier: 9 },
  dock: { name: "Dock", icon: "⚓", description: "Boats and river trade", tier: 10 },
  "bridge-building": { name: "Bridge", icon: "🌉", description: "Spans the river crossing", tier: 10 },
  castle: { name: "Castle", icon: "🏰", description: "A grand hilltop fortress", tier: 11 },
  "building-fountain": { name: "Fountain", icon: "⛲", description: "A decorative water fountain", tier: 11 },
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
