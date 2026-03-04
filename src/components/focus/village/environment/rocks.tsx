"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { GRID, gridToWorld, getBlockHeight, type TerrainData } from "@/lib/village/terrain";
import { BUILDING_GRID_POSITIONS } from "@/lib/village/terrain";

function seededRandom(seed: number): number {
  return Math.abs(Math.sin(seed * 127.1 + 0.7) * 43758.5453) % 1;
}

interface RocksProps {
  terrain: TerrainData;
}

export function Rocks({ terrain }: RocksProps) {
  const { mainMesh, highlightMesh } = useMemo(() => {
    const rocks: { x: number; y: number; z: number; scale: number }[] = [];
    const buildingSet = new Set(
      BUILDING_GRID_POSITIONS.flatMap(({ gx, gy }) => {
        const tiles: string[] = [];
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            tiles.push(`${gx + dx},${gy + dy}`);
          }
        }
        return tiles;
      })
    );

    for (let gy = 0; gy < GRID; gy++) {
      for (let gx = 0; gx < GRID; gx++) {
        const idx = gy * GRID + gx;
        const tileType = terrain.tileTypes[idx];
        if (tileType !== "grass" && tileType !== "stone") continue;
        if (buildingSet.has(`${gx},${gy}`)) continue;

        const seed = gx * GRID + gy;
        const val = seededRandom(seed);

        // 4% chance for rock (val > 0.96 maps to different range than trees)
        if (val > 0.12 && val < 0.16) {
          const pos = gridToWorld(gx, gy);
          const h = getBlockHeight(terrain.heightMap, pos.x, pos.z);
          const scale = 0.5 + seededRandom(seed * 7) * 0.8;
          rocks.push({ x: pos.x, y: h, z: pos.z, scale });
        }
      }
    }

    // Main rocks
    const mainGeo = new THREE.DodecahedronGeometry(0.5, 0);
    const mainMat = new THREE.MeshStandardMaterial({ color: "#7F8C8D", roughness: 0.65, metalness: 0.05, flatShading: true });
    const main = new THREE.InstancedMesh(mainGeo, mainMat, rocks.length);

    // Highlight rocks (lighter, smaller)
    const hiGeo = new THREE.DodecahedronGeometry(0.3, 0);
    const hiMat = new THREE.MeshStandardMaterial({ color: "#95A5A6", roughness: 0.65, metalness: 0.05, flatShading: true });
    const hi = new THREE.InstancedMesh(hiGeo, hiMat, rocks.length);

    const m = new THREE.Matrix4();

    for (let i = 0; i < rocks.length; i++) {
      const r = rocks[i];
      m.makeScale(r.scale, r.scale * 0.6, r.scale);
      m.setPosition(r.x, r.y + r.scale * 0.2, r.z);
      main.setMatrixAt(i, m);

      m.makeScale(r.scale * 0.6, r.scale * 0.4, r.scale * 0.6);
      m.setPosition(r.x + r.scale * 0.3, r.y + r.scale * 0.35, r.z + r.scale * 0.2);
      hi.setMatrixAt(i, m);
    }

    main.instanceMatrix.needsUpdate = true;
    hi.instanceMatrix.needsUpdate = true;
    main.castShadow = true;
    main.receiveShadow = true;

    return { mainMesh: main, highlightMesh: hi };
  }, [terrain]);

  return (
    <group>
      <primitive object={mainMesh} />
      <primitive object={highlightMesh} />
    </group>
  );
}
