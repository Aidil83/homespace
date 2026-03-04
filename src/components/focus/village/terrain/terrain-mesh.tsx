"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { GRID, TILE_SIZE, type TerrainData } from "@/lib/village/terrain";
import { getVoxelMaterial } from "./voxel-materials";

interface TerrainMeshProps {
  terrain: TerrainData;
}

interface TileGroup {
  material: THREE.MeshStandardMaterial;
  matrices: THREE.Matrix4[];
}

export function VoxelTerrainMesh({ terrain }: TerrainMeshProps) {
  const tileGroups = useMemo(() => {
    const groups = new Map<string, TileGroup>();
    const m = new THREE.Matrix4();

    for (let gy = 0; gy < GRID; gy++) {
      for (let gx = 0; gx < GRID; gx++) {
        const idx = gy * GRID + gx;
        const tileType = terrain.tileTypes[idx];

        // Skip water tiles — rendered separately
        if (tileType === "water") continue;

        const h = Math.max(terrain.heightMap[idx], 0.3);
        const x = (gx - GRID / 2 + 0.5) * TILE_SIZE;
        const z = (gy - GRID / 2 + 0.5) * TILE_SIZE;

        const mat = getVoxelMaterial(tileType, idx);
        const key = mat.uuid;

        if (!groups.has(key)) {
          groups.set(key, { material: mat, matrices: [] });
        }

        // Scale unit box to tile dimensions
        m.makeScale(TILE_SIZE, h, TILE_SIZE);
        m.setPosition(x, h / 2, z);
        groups.get(key)!.matrices.push(m.clone());
      }
    }

    return Array.from(groups.values());
  }, [terrain]);

  const boxGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);

  return (
    <group>
      {/* Voxel terrain blocks */}
      {tileGroups.map((group, i) => (
        <VoxelBlockGroup key={i} geo={boxGeo} group={group} />
      ))}

      {/* Water bed backdrop — large dark blue plane underneath */}
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[150, 150]} />
        <meshStandardMaterial color="#1A3C5E" roughness={0.9} metalness={0.0} />
      </mesh>
    </group>
  );
}

function VoxelBlockGroup({ geo, group }: { geo: THREE.BoxGeometry; group: TileGroup }) {
  const mesh = useMemo(() => {
    const inst = new THREE.InstancedMesh(geo, group.material, group.matrices.length);
    for (let i = 0; i < group.matrices.length; i++) {
      inst.setMatrixAt(i, group.matrices[i]);
    }
    inst.instanceMatrix.needsUpdate = true;
    inst.castShadow = true;
    inst.receiveShadow = true;
    return inst;
  }, [geo, group]);

  return <primitive object={mesh} />;
}
