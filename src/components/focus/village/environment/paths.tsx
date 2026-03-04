"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { GRID, TILE_SIZE, gridToWorld, getTerrainHeight, type TerrainData } from "@/lib/village/terrain";

interface PathsProps {
  terrain: TerrainData;
}

export function Paths({ terrain }: PathsProps) {
  const geometry = useMemo(() => {
    const positions: number[] = [];
    const indices: number[] = [];
    let vertIndex = 0;

    for (let gy = 0; gy < GRID; gy++) {
      for (let gx = 0; gx < GRID; gx++) {
        const idx = gy * GRID + gx;
        if (terrain.tileTypes[idx] !== "path") continue;

        const pos = gridToWorld(gx, gy);
        const h = getTerrainHeight(terrain.heightMap, pos.x, pos.z) + 0.05;
        const halfTile = TILE_SIZE / 2 * 0.8; // Slightly narrower than tile

        positions.push(
          pos.x - halfTile, h, pos.z - halfTile,
          pos.x + halfTile, h, pos.z - halfTile,
          pos.x + halfTile, h, pos.z + halfTile,
          pos.x - halfTile, h, pos.z + halfTile,
        );

        indices.push(
          vertIndex, vertIndex + 1, vertIndex + 2,
          vertIndex, vertIndex + 2, vertIndex + 3,
        );
        vertIndex += 4;
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [terrain]);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial color="#8B7355" roughness={0.9} />
    </mesh>
  );
}
