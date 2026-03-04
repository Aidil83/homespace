"use client";

import { TILE_SIZE, gridToWorld, type TerrainData } from "@/lib/village/terrain";

interface BridgeProps {
  terrain: TerrainData;
}

// Bridge positions where paths cross the river
const BRIDGE_TILES = [
  { gx: 11, gy: 12 },
  { gx: 12, gy: 11 },
  { gx: 10, gy: 13 },
  { gx: 13, gy: 10 },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Bridge({ terrain }: BridgeProps) {
  return (
    <group>
      {BRIDGE_TILES.map(({ gx, gy }, i) => {
        const pos = gridToWorld(gx, gy);
        return (
          <group key={i} position={[pos.x, 0.3, pos.z]}>
            {/* Bridge deck */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[TILE_SIZE, 0.3, TILE_SIZE]} />
              <meshStandardMaterial color="#8B6914" />
            </mesh>
            {/* Rails */}
            <mesh position={[0, 0.35, -TILE_SIZE / 2 + 0.1]} castShadow>
              <boxGeometry args={[TILE_SIZE, 0.4, 0.15]} />
              <meshStandardMaterial color="#6B500E" />
            </mesh>
            <mesh position={[0, 0.35, TILE_SIZE / 2 - 0.1]} castShadow>
              <boxGeometry args={[TILE_SIZE, 0.4, 0.15]} />
              <meshStandardMaterial color="#6B500E" />
            </mesh>
            {/* Support posts */}
            <mesh position={[-TILE_SIZE / 2 + 0.15, -0.3, 0]} castShadow>
              <boxGeometry args={[0.2, 0.9, 0.2]} />
              <meshStandardMaterial color="#5A4008" />
            </mesh>
            <mesh position={[TILE_SIZE / 2 - 0.15, -0.3, 0]} castShadow>
              <boxGeometry args={[0.2, 0.9, 0.2]} />
              <meshStandardMaterial color="#5A4008" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
