import * as THREE from "three";

// Cached MeshStandardMaterial map for voxel terrain tiles
// Standard + flatShading = voxel aesthetic with specular highlights

const materialCache = new Map<string, THREE.MeshStandardMaterial>();
const normalMapCache = new Map<string, THREE.DataTexture>();

interface TileMaterialConfig {
  color: string;
  roughness: number;
  metalness: number;
  normalType?: "organic" | "rough" | "fine";
  normalStrength?: number;
}

// Procedural normal map generation
function createNormalMap(
  type: "organic" | "rough" | "fine",
  size: number = 64,
): THREE.DataTexture {
  const cached = normalMapCache.get(type);
  if (cached) return cached;

  const data = new Uint8Array(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size;
      const ny = y / size;
      const nxr = (x + 1) / size;
      const nyr = (y + 1) / size;

      // Sample height at this point and neighbors
      const h = heightNoise(nx, ny, type);
      const hx = heightNoise(nxr, ny, type);
      const hy = heightNoise(nx, nyr, type);

      // Gradient → normal
      const dx = (h - hx) * 2;
      const dy = (h - hy) * 2;
      const len = Math.sqrt(dx * dx + dy * dy + 1);

      const idx = (y * size + x) * 4;
      data[idx] = ((dx / len) * 0.5 + 0.5) * 255;
      data[idx + 1] = ((dy / len) * 0.5 + 0.5) * 255;
      data[idx + 2] = ((1 / len) * 0.5 + 0.5) * 255;
      data[idx + 3] = 255;
    }
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;

  normalMapCache.set(type, texture);
  return texture;
}

function heightNoise(x: number, y: number, type: "organic" | "rough" | "fine"): number {
  switch (type) {
    case "organic":
      // Soft bumps — grass blades, uneven ground
      return (
        Math.sin(x * 25 + 0.3) * Math.cos(y * 20 + 1.1) * 0.4 +
        Math.sin(x * 50 + 2.7) * Math.cos(y * 40 + 0.5) * 0.3 +
        Math.sin(x * 80 + 1.9) * Math.cos(y * 70 + 3.1) * 0.15
      );
    case "rough":
      // Angular, harsh bumps — stone, rock
      return (
        Math.sin(x * 15 + 0.7) * Math.cos(y * 18 + 2.3) * 0.5 +
        Math.sin(x * 35 + 1.3) * Math.cos(y * 30 + 0.9) * 0.35 +
        Math.abs(Math.sin(x * 60 + 3.7) * Math.cos(y * 55 + 1.7)) * 0.3
      );
    case "fine":
      // Very small-scale grain — sand
      return (
        Math.sin(x * 60 + 0.5) * Math.cos(y * 55 + 1.7) * 0.3 +
        Math.sin(x * 120 + 2.1) * Math.cos(y * 100 + 3.3) * 0.2 +
        Math.sin(x * 200 + 1.1) * Math.cos(y * 180 + 0.3) * 0.1
      );
  }
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

    // Apply normal map if specified
    if (config.normalType) {
      mat.normalMap = createNormalMap(config.normalType);
      mat.normalScale = new THREE.Vector2(
        config.normalStrength ?? 0.3,
        config.normalStrength ?? 0.3,
      );
    }

    materialCache.set(key, mat);
  }
  return mat;
}

const GRASS_COLORS = ["#4a7c3f", "#528a47", "#43723a"];
const GRASS_ROUGHNESS = 0.92;

const TILE_MATERIALS: Record<string, TileMaterialConfig> = {
  dirt: { color: "#8B6914", roughness: 0.90, metalness: 0.0, normalType: "rough", normalStrength: 0.25 },
  sand: { color: "#D4B896", roughness: 0.80, metalness: 0.0, normalType: "fine", normalStrength: 0.2 },
  stone: { color: "#7F8C8D", roughness: 0.65, metalness: 0.0, normalType: "rough", normalStrength: 0.4 },
  snow: { color: "#E8E8F0", roughness: 0.70, metalness: 0.0, normalType: "fine", normalStrength: 0.15 },
  path: { color: "#8B7355", roughness: 0.85, metalness: 0.0, normalType: "rough", normalStrength: 0.3 },
  water: { color: "#2980B9", roughness: 0.15, metalness: 0.1 },
  deepWater: { color: "#1A5276", roughness: 0.15, metalness: 0.1 },
  bridge: { color: "#8B6914", roughness: 0.85, metalness: 0.0, normalType: "rough", normalStrength: 0.25 },
};

function seededRandom(seed: number): number {
  return Math.abs(Math.sin(seed * 127.1 + 0.7) * 43758.5453) % 1;
}

export function getVoxelMaterial(tileType: string, rngSeed: number = 0): THREE.MeshStandardMaterial {
  if (tileType === "grass") {
    const variant = Math.floor(seededRandom(rngSeed * 73) * 3);
    const key = `grass${variant}`;
    return getCached(key, {
      color: GRASS_COLORS[variant],
      roughness: GRASS_ROUGHNESS,
      metalness: 0.0,
      normalType: "organic",
      normalStrength: 0.3,
    });
  }

  const config = TILE_MATERIALS[tileType];
  if (config) return getCached(tileType, config);

  // Fallback
  return getCached("grass0", {
    color: GRASS_COLORS[0],
    roughness: GRASS_ROUGHNESS,
    metalness: 0.0,
    normalType: "organic",
    normalStrength: 0.3,
  });
}
