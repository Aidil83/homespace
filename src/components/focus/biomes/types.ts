export type BiomeId = "ember" | "fathom" | "forge" | "flux" | "prism" | "signal";

export interface BiomeProps {
  progress: number; // 0 to 1
}

export interface BiomeMeta {
  id: BiomeId;
  name: string;
  tagline: string;
  icon: string;
  color: string;
  bgGradient: string;
  collectibles: string[];
}

export const BIOME_IDS: BiomeId[] = ["ember", "fathom", "forge", "flux", "prism", "signal"];

export const DURATION_OPTIONS = [
  { label: "15m", seconds: 900 },
  { label: "25m", seconds: 1500 },
  { label: "45m", seconds: 2700 },
  { label: "60m", seconds: 3600 },
] as const;

export const BIOMES: Record<BiomeId, BiomeMeta> = {
  ember: {
    id: "ember",
    name: "Ember",
    tagline: "Keep the fire alive",
    icon: "🔥",
    color: "#F97316",
    bgGradient: "linear-gradient(135deg, #7c2d12, #c2410c)",
    collectibles: [
      "Warm Ember", "Flickering Log", "Roasted Marshmallow",
      "Fire Spirit", "Charcoal Heart", "Phoenix Feather",
      "Kindling Crown", "Ash Rose", "Lava Lamp", "Bonfire Badge",
    ],
  },
  fathom: {
    id: "fathom",
    name: "Fathom",
    tagline: "Dive into deep focus",
    icon: "🌊",
    color: "#0EA5E9",
    bgGradient: "linear-gradient(135deg, #0c4a6e, #0284c7)",
    collectibles: [
      "Lantern Fish", "Pearl Clam", "Coral Fragment",
      "Abyssal Jellyfish", "Sunken Compass", "Bioluminescent Orb",
      "Trench Map", "Sea Sapphire", "Nautilus Shell", "Deep Current",
    ],
  },
  forge: {
    id: "forge",
    name: "Forge",
    tagline: "Craft something great",
    icon: "⚒️",
    color: "#EF4444",
    bgGradient: "linear-gradient(135deg, #7f1d1d, #dc2626)",
    collectibles: [
      "Iron Ingot", "Bronze Hammer", "Tempered Blade",
      "Spark Shard", "Anvil Mark", "Molten Ring",
      "Steel Gauntlet", "Ember Tongs", "Forged Crest", "Master Key",
    ],
  },
  flux: {
    id: "flux",
    name: "Flux",
    tagline: "Light up the sky",
    icon: "🌌",
    color: "#A855F7",
    bgGradient: "linear-gradient(135deg, #3b0764, #7c3aed)",
    collectibles: [
      "Aurora Wisp", "Polar Ray", "Northern Ribbon",
      "Cosmic Dust", "Magnetosphere", "Solar Wind",
      "Photon Shard", "Spectrum Veil", "Ion Trail", "Sky Crown",
    ],
  },
  prism: {
    id: "prism",
    name: "Prism",
    tagline: "Grow something brilliant",
    icon: "💎",
    color: "#06B6D4",
    bgGradient: "linear-gradient(135deg, #164e63, #0891b2)",
    collectibles: [
      "Quartz Shard", "Rainbow Prism", "Amethyst Cluster",
      "Light Fractal", "Crystal Seed", "Diamond Dust",
      "Geode Heart", "Refracted Beam", "Stalactite Drop", "Cave Echo",
    ],
  },
  signal: {
    id: "signal",
    name: "Signal",
    tagline: "Broadcast across the stars",
    icon: "📡",
    color: "#22C55E",
    bgGradient: "linear-gradient(135deg, #14532d, #16a34a)",
    collectibles: [
      "Radio Pulse", "Star Frequency", "Antenna Spark",
      "Deep Space Echo", "Binary Message", "Satellite Ping",
      "Nebula Signal", "Cosmic Beacon", "Waveform Crystal", "First Contact",
    ],
  },
};
