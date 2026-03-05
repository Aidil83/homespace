// Heightmap terrain generation for the village
// 24x24 grid, heights 0-10, with river/tile types

export const GRID = 24;
export const TILE_SIZE = 4; // world units per tile
export const WORLD_SIZE = GRID * TILE_SIZE; // 96 units total

export type TileType = "grass" | "water" | "sand" | "path" | "stone" | "bridge";

export interface TerrainData {
  heightMap: Float32Array; // GRID * GRID
  tileTypes: TileType[];  // GRID * GRID
  riverTiles: Set<number>;
  waterTiles: { gx: number; gy: number }[];
  waterfallSources: { gx: number; gy: number; h: number }[];
  waterfallSplash: { gx: number; gy: number }[];
}

// Tile colors for vertex coloring
export const TILE_COLORS: Record<TileType, [number, number, number]> = {
  grass: [0.29, 0.486, 0.247],   // #4a7c3f
  water: [0.161, 0.502, 0.725],  // #2980B9
  sand: [0.831, 0.722, 0.588],   // #D4B896
  path: [0.545, 0.451, 0.333],   // #8B7355
  stone: [0.498, 0.549, 0.553],  // #7F8C8D
  bridge: [0.545, 0.412, 0.078], // #8B6914
};

// Grass color variations for more natural look (reserved for future use)
// const GRASS_VARIANTS: [number, number, number][] = [
//   [0.29, 0.486, 0.247],  // #4a7c3f
//   [0.322, 0.541, 0.278], // #528a47
//   [0.263, 0.447, 0.227], // #43723a
// ];

// River path: diagonal from top-right to bottom-left
function generateRiverPath(): { gx: number; gy: number }[] {
  const path: { gx: number; gy: number }[] = [];
  for (let i = 0; i < 22; i++) {
    path.push({ gx: 22 - i, gy: 1 + i });
  }
  return path;
}

// Building positions (grid coords) - used for flattening terrain
export const BUILDING_GRID_POSITIONS: { gx: number; gy: number; name: string }[] = [
  // Residential (left)
  { gx: 3, gy: 9, name: "cottage" },
  { gx: 6, gy: 8, name: "farm" },
  { gx: 3, gy: 12, name: "well" },
  { gx: 6, gy: 11, name: "garden" },
  { gx: 3, gy: 15, name: "library" },
  { gx: 6, gy: 14, name: "bakery" },
  { gx: 9, gy: 9, name: "tavern" },
  { gx: 9, gy: 13, name: "chapel" },
  // Market center
  { gx: 11, gy: 11, name: "market" },
  { gx: 13, gy: 10, name: "brewery" },
  { gx: 12, gy: 13, name: "fountain" },
  { gx: 14, gy: 13, name: "apothecary" },
  // Hilltop (top-right)
  { gx: 16, gy: 5, name: "windmill" },
  { gx: 19, gy: 4, name: "blacksmith" },
  { gx: 16, gy: 8, name: "watchtower" },
  { gx: 19, gy: 7, name: "mine" },
  { gx: 17, gy: 3, name: "barracks" },
  { gx: 20, gy: 6, name: "castle" },
  // Farming (right lower)
  { gx: 17, gy: 11, name: "stable" },
  { gx: 17, gy: 14, name: "granary" },
  // Waterfront (bottom)
  { gx: 5, gy: 19, name: "fishing-hut" },
  { gx: 2, gy: 20, name: "lighthouse" },
  { gx: 8, gy: 20, name: "dock" },
  { gx: 10, gy: 17, name: "bridge-building" },
];

export function generateTerrain(): TerrainData {
  const heightMap = new Float32Array(GRID * GRID);
  const tileTypes: TileType[] = new Array(GRID * GRID).fill("grass");
  const riverTiles = new Set<number>();
  const waterTiles: { gx: number; gy: number }[] = [];

  // Step 1: Generate base heightmap
  for (let gy = 0; gy < GRID; gy++) {
    for (let gx = 0; gx < GRID; gx++) {
      const idx = gy * GRID + gx;
      const nx = gx / GRID;
      const ny = gy / GRID;
      let h = 0;

      // Global base: higher inland, lower at coast
      h += (1 - ny) * 3;

      // Zone 1: Northwest meadow hills (h ~3-8)
      if (gx < 12 && gy < 8) {
        h += 4 + Math.sin(nx * Math.PI * 4 + 1.7) * 2 + Math.cos(ny * Math.PI * 3.5 + 0.9) * 1.8;
        // Prominent knoll near (5, 3)
        const dist = Math.sqrt((gx - 5) ** 2 + (gy - 3) ** 2);
        if (dist < 6) h += (6 - dist) * 0.8;
        // Secondary rise near (2, 6)
        const dist2 = Math.sqrt((gx - 2) ** 2 + (gy - 6) ** 2);
        if (dist2 < 4) h += (4 - dist2) * 0.6;
        // Zone-specific noise for unique shape
        h += Math.sin(nx * Math.PI * 5.3 + ny * 2.1) * 1.2;
        h += Math.cos(nx * Math.PI * 2.7 + ny * 4.3) * 0.9;
      }
      // Zone 2: Hilltop district (top-right) — dramatic focal point (h ~8-14)
      else if (gx >= 14 && gy < 10) {
        h = 8 + Math.sin(nx * Math.PI * 3) * 3 + Math.cos(ny * Math.PI * 2) * 3;
        // Peak near (18, 4)
        const dist = Math.sqrt((gx - 18) ** 2 + (gy - 4) ** 2);
        if (dist < 5) h += (5 - dist) * 1.4;
        // Back-edge cliff
        if (gy <= 1 && gx >= 16) h = 12 + Math.sin(nx * Math.PI * 3) * 2;
        // Diagonal cliff fade
        const sum = gx + gy;
        if (sum >= 20 && sum <= 24) {
          const cliffFactor = (sum - 20) / 4;
          h *= 1 - cliffFactor * 0.5;
        }
        // Zone-specific noise
        h += Math.sin(nx * Math.PI * 6.1 + ny * 3.7) * 1;
      }
      // Zone 3: Farming slopes (right lower) — terraced hills (h ~3-7)
      else if (gx >= 14 && gy >= 10) {
        h += 3 + Math.sin(nx * Math.PI * 3 + 2.3) * 2.5 + Math.cos(ny * Math.PI * 4 + 1.1) * 2;
        // Terrace step near stable (17, 12)
        const dist = Math.sqrt((gx - 17) ** 2 + (gy - 12) ** 2);
        if (dist < 4) h += (4 - dist) * 0.7;
        // Ridge near (19, 14)
        const dist2 = Math.sqrt((gx - 19) ** 2 + (gy - 14) ** 2);
        if (dist2 < 3) h += (3 - dist2) * 0.8;
        // Zone-specific noise
        h += Math.sin(nx * Math.PI * 4.7 + ny * 5.9) * 1.1;
        h += Math.cos(nx * Math.PI * 3.3 + ny * 1.8) * 0.7;
      }
      // Zone 4: Residential terraces (left center) — undulating (h ~2-6)
      else if (gx < 14 && gy >= 8 && gy < 16) {
        h += 3 + Math.sin(nx * Math.PI * 3.5 + 0.5) * 2 + Math.cos(ny * Math.PI * 2.5 + 1.3) * 1.5;
        // Knoll near chapel area (9, 13)
        const dist = Math.sqrt((gx - 9) ** 2 + (gy - 13) ** 2);
        if (dist < 4) h += (4 - dist) * 0.6;
        // Dip near (5, 10) — creates a small valley
        const dist2 = Math.sqrt((gx - 5) ** 2 + (gy - 10) ** 2);
        if (dist2 < 3) h -= (3 - dist2) * 0.5;
        // Zone-specific noise
        h += Math.sin(nx * Math.PI * 6.3 + ny * 4.1) * 0.9;
        h += Math.cos(nx * Math.PI * 3.9 + ny * 6.7) * 0.6;
      }
      // Zone 5: Waterfront bluffs (bottom) — coastal shelf (h ~1-4)
      else if (gy >= 16) {
        const shoreRise = Math.max(0, (20 - gy)) * 0.8;
        h += shoreRise + Math.sin(nx * Math.PI * 3 + 1.9) * 1.2 + 1;
        // Bluff near (4, 17)
        const dist = Math.sqrt((gx - 4) ** 2 + (gy - 17) ** 2);
        if (dist < 3) h += (3 - dist) * 0.7;
        // Zone-specific noise
        h += Math.sin(nx * Math.PI * 5.1 + ny * 3.3) * 0.8;
      }

      // Zone 6: River valley depression (global modifier)
      const riverGx = 22 - gy;
      const distToRiver = Math.abs(gx - riverGx);
      if (distToRiver < 4 && tileTypes[idx] !== "water") {
        h *= 0.5 + distToRiver * 0.125;
      }

      // General noise (4 octaves with varied seeds)
      h += Math.sin(nx * Math.PI * 4 + ny * 3) * 1.2;
      h += Math.cos(ny * Math.PI * 3 + nx * 2) * 1;
      h += Math.sin(nx * Math.PI * 7 + ny * 5) * 0.6;
      h += Math.cos(nx * Math.PI * 11 + ny * 7) * 0.4;

      heightMap[idx] = Math.max(0.3, h);
    }
  }

  // Step 2: Cliff heights (gy=0, gx>=16)
  const cliffHeights: Record<number, number> = {
    16: 7, 17: 8, 18: 9, 19: 10, 20: 10, 21: 10, 22: 10, 23: 10,
  };
  for (const [gxStr, h] of Object.entries(cliffHeights)) {
    const gx = Number(gxStr);
    heightMap[0 * GRID + gx] = h;
  }

  // Step 3: River path
  const riverPath = generateRiverPath();
  for (const { gx, gy } of riverPath) {
    if (gx >= 0 && gx < GRID && gy >= 0 && gy < GRID) {
      const idx = gy * GRID + gx;
      heightMap[idx] = 0;
      tileTypes[idx] = "water";
      riverTiles.add(idx);
      waterTiles.push({ gx, gy });

      // Widen river
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const nx = gx + dx;
        const ny = gy + dy;
        if (nx >= 0 && nx < GRID && ny >= 0 && ny < GRID) {
          const nIdx = ny * GRID + nx;
          if (tileTypes[nIdx] !== "water") {
            // Mark adjacent as sand (riverbank)
            if (tileTypes[nIdx] === "grass") {
              tileTypes[nIdx] = "sand";
              heightMap[nIdx] = Math.min(heightMap[nIdx], 0.5);
            }
          }
        }
      }
    }
  }

  // Step 4: Flatten building sites (3x3 area)
  for (const { gx, gy } of BUILDING_GRID_POSITIONS) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = gx + dx;
        const ny = gy + dy;
        if (nx >= 0 && nx < GRID && ny >= 0 && ny < GRID) {
          const idx = ny * GRID + nx;
          if (tileTypes[idx] !== "water") {
            heightMap[idx] = heightMap[gy * GRID + gx];
          }
        }
      }
    }
  }

  // Step 5: Path tiles
  const pathTiles = generatePaths();
  for (const { gx, gy } of pathTiles) {
    if (gx >= 0 && gx < GRID && gy >= 0 && gy < GRID) {
      const idx = gy * GRID + gx;
      if (tileTypes[idx] === "grass" || tileTypes[idx] === "sand") {
        tileTypes[idx] = "path";
      }
    }
  }

  // Step 6: Bridge tiles
  const bridgeTiles = [
    { gx: 11, gy: 12 }, { gx: 12, gy: 11 },
    { gx: 10, gy: 13 }, { gx: 13, gy: 10 },
  ];
  for (const { gx, gy } of bridgeTiles) {
    if (gx >= 0 && gx < GRID && gy >= 0 && gy < GRID) {
      const idx = gy * GRID + gx;
      if (tileTypes[idx] === "water") {
        tileTypes[idx] = "bridge";
        heightMap[idx] = 0.3;
      }
    }
  }

  // Step 7: Stone tiles near hilltop cliffs
  for (let gy = 0; gy < 3; gy++) {
    for (let gx = 14; gx < GRID; gx++) {
      const idx = gy * GRID + gx;
      if (tileTypes[idx] === "grass" && heightMap[idx] > 6) {
        tileTypes[idx] = "stone";
      }
    }
  }

  // Grass variation placeholder (tile types already set above)

  // Waterfall sources
  const waterfallSources = [
    { gx: 20, gy: 0, h: heightMap[0 * GRID + 20] },
    { gx: 21, gy: 0, h: heightMap[0 * GRID + 21] },
    { gx: 22, gy: 0, h: heightMap[0 * GRID + 22] },
  ];

  const waterfallSplash = [
    { gx: 22, gy: 1 },
    { gx: 23, gy: 1 },
    { gx: 21, gy: 2 },
  ];

  return { heightMap, tileTypes, riverTiles, waterTiles, waterfallSources, waterfallSplash };
}

function generatePaths(): { gx: number; gy: number }[] {
  const paths: { gx: number; gy: number }[] = [];

  // Main E-W road (row 12)
  for (let gx = 1; gx < 22; gx++) paths.push({ gx, gy: 12 });
  // Main N-S road (col 12)
  for (let gy = 1; gy < 22; gy++) paths.push({ gx: 12, gy });
  // Residential paths
  for (let gx = 3; gx <= 9; gx++) paths.push({ gx, gy: 10 });
  for (let gx = 3; gx <= 6; gx++) paths.push({ gx, gy: 14 });
  // Market area paths
  for (let gx = 10; gx <= 14; gx++) paths.push({ gx, gy: 11 });
  // Hilltop paths
  for (let gx = 14; gx <= 20; gx++) paths.push({ gx, gy: 6 });
  for (let gy = 3; gy <= 8; gy++) paths.push({ gx: 17, gy });
  // Waterfront paths
  for (let gx = 2; gx <= 10; gx++) paths.push({ gx, gy: 19 });

  return paths;
}

/**
 * Bilinear interpolation to get terrain height at any world position.
 * World coords: x,z in [-WORLD_SIZE/2, WORLD_SIZE/2]
 */
export function getTerrainHeight(heightMap: Float32Array, worldX: number, worldZ: number): number {
  // Convert world coords to grid coords
  const gxf = (worldX + WORLD_SIZE / 2) / TILE_SIZE;
  const gyf = (worldZ + WORLD_SIZE / 2) / TILE_SIZE;

  const gx0 = Math.floor(gxf);
  const gy0 = Math.floor(gyf);
  const gx1 = Math.min(gx0 + 1, GRID - 1);
  const gy1 = Math.min(gy0 + 1, GRID - 1);

  const fx = gxf - gx0;
  const fy = gyf - gy0;

  const gx0c = Math.max(0, Math.min(gx0, GRID - 1));
  const gy0c = Math.max(0, Math.min(gy0, GRID - 1));

  const h00 = heightMap[gy0c * GRID + gx0c];
  const h10 = heightMap[gy0c * GRID + gx1];
  const h01 = heightMap[gy1 * GRID + gx0c];
  const h11 = heightMap[gy1 * GRID + gx1];

  // Bilinear interpolation
  const h0 = h00 + (h10 - h00) * fx;
  const h1 = h01 + (h11 - h01) * fx;

  return h0 + (h1 - h0) * fy;
}

/**
 * Discrete grid lookup for block-snapped Y positioning.
 * No interpolation — returns exact heightmap value at the nearest grid cell.
 */
export function getBlockHeight(heightMap: Float32Array, worldX: number, worldZ: number): number {
  const gx = Math.floor((worldX + WORLD_SIZE / 2) / TILE_SIZE);
  const gz = Math.floor((worldZ + WORLD_SIZE / 2) / TILE_SIZE);
  const gxc = Math.max(0, Math.min(gx, GRID - 1));
  const gzc = Math.max(0, Math.min(gz, GRID - 1));
  return heightMap[gzc * GRID + gxc];
}

/**
 * Convert grid coordinates to world position
 */
export function gridToWorld(gx: number, gy: number): { x: number; z: number } {
  return {
    x: (gx - GRID / 2 + 0.5) * TILE_SIZE,
    z: (gy - GRID / 2 + 0.5) * TILE_SIZE,
  };
}

/**
 * Get tile type at grid coordinates
 */
export function getTileAt(tileTypes: TileType[], gx: number, gy: number): TileType {
  if (gx < 0 || gx >= GRID || gy < 0 || gy >= GRID) return "grass";
  return tileTypes[gy * GRID + gx];
}
