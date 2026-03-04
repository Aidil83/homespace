import * as THREE from "three";

// Cached MeshStandardMaterial map for voxel terrain tiles
// Standard + flatShading = voxel aesthetic with specular highlights

const materialCache = new Map<string, THREE.MeshStandardMaterial>();

interface TileMaterialConfig {
  color: string;
  roughness: number;
  metalness: number;
}

function getCached(key: string, config: TileMaterialConfig): THREE.MeshStandardMaterial {
  let mat = materialCache.get(key);
  if (!mat) {
    mat = new THREE.MeshStandardMaterial({
      color: config.color,
      roughness: config.roughness,
      metalness: config.metalness,
      flatShading: true,
    });
    materialCache.set(key, mat);
  }
  return mat;
}

const GRASS_COLORS = ["#4a7c3f", "#528a47", "#43723a"];
const GRASS_ROUGHNESS = 0.92;

const TILE_MATERIALS: Record<string, TileMaterialConfig> = {
  dirt: { color: "#8B6914", roughness: 0.90, metalness: 0.0 },
  sand: { color: "#D4B896", roughness: 0.80, metalness: 0.0 },
  stone: { color: "#7F8C8D", roughness: 0.65, metalness: 0.0 },
  snow: { color: "#E8E8F0", roughness: 0.70, metalness: 0.0 },
  path: { color: "#8B7355", roughness: 0.85, metalness: 0.0 },
  water: { color: "#2980B9", roughness: 0.15, metalness: 0.1 },
  deepWater: { color: "#1A5276", roughness: 0.15, metalness: 0.1 },
  bridge: { color: "#8B6914", roughness: 0.85, metalness: 0.0 },
};

function seededRandom(seed: number): number {
  return Math.abs(Math.sin(seed * 127.1 + 0.7) * 43758.5453) % 1;
}

export function getVoxelMaterial(tileType: string, rngSeed: number = 0): THREE.MeshStandardMaterial {
  if (tileType === "grass") {
    const variant = Math.floor(seededRandom(rngSeed * 73) * 3);
    const key = `grass${variant}`;
    return getCached(key, { color: GRASS_COLORS[variant], roughness: GRASS_ROUGHNESS, metalness: 0.0 });
  }

  const config = TILE_MATERIALS[tileType];
  if (config) return getCached(tileType, config);

  // Fallback
  return getCached("grass0", { color: GRASS_COLORS[0], roughness: GRASS_ROUGHNESS, metalness: 0.0 });
}
