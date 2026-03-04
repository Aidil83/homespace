"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GRID, TILE_SIZE, type TerrainData } from "@/lib/village/terrain";

interface WaterMeshProps {
  terrain: TerrainData;
}

function seededRandom(seed: number): number {
  return Math.abs(Math.sin(seed * 127.1 + 0.7) * 43758.5453) % 1;
}

export function WaterMesh({ terrain }: WaterMeshProps) {
  const regularRef = useRef<THREE.InstancedMesh>(null);
  const deepRef = useRef<THREE.InstancedMesh>(null);
  const regularMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const deepMatRef = useRef<THREE.MeshStandardMaterial>(null);

  // Categorize water tiles into regular and deep
  const { regularTiles, deepTiles } = useMemo(() => {
    const regular: { x: number; z: number; seed: number }[] = [];
    const deep: { x: number; z: number; seed: number }[] = [];

    for (const { gx, gy } of terrain.waterTiles) {
      const x = (gx - GRID / 2 + 0.5) * TILE_SIZE;
      const z = (gy - GRID / 2 + 0.5) * TILE_SIZE;
      const seed = gx * GRID + gy;

      // Check if surrounded by water on 3+ sides = deep
      let waterNeighbors = 0;
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const nx = gx + dx;
        const ny = gy + dy;
        if (nx >= 0 && nx < GRID && ny >= 0 && ny < GRID) {
          if (terrain.tileTypes[ny * GRID + nx] === "water") waterNeighbors++;
        }
      }

      if (waterNeighbors >= 3) {
        deep.push({ x, z, seed });
      } else {
        regular.push({ x, z, seed });
      }
    }

    return { regularTiles: regular, deepTiles: deep };
  }, [terrain]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Animate caustic shimmer on water materials
    const causticShift = Math.sin(t * 2) * 0.03;
    if (regularMatRef.current) {
      regularMatRef.current.emissiveIntensity = 0.08 + causticShift;
    }
    if (deepMatRef.current) {
      deepMatRef.current.emissiveIntensity = 0.06 + causticShift * 0.5;
    }

    if (regularRef.current) {
      for (let i = 0; i < regularTiles.length; i++) {
        const tile = regularTiles[i];
        const y = 0.15 + Math.sin(t + seededRandom(tile.seed) * 6.28) * 0.03;
        dummy.position.set(tile.x, y, tile.z);
        dummy.scale.set(TILE_SIZE, 0.3, TILE_SIZE);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        regularRef.current.setMatrixAt(i, dummy.matrix);
      }
      regularRef.current.instanceMatrix.needsUpdate = true;
    }

    if (deepRef.current) {
      for (let i = 0; i < deepTiles.length; i++) {
        const tile = deepTiles[i];
        const y = 0.15 + Math.sin(t * 0.8 + seededRandom(tile.seed) * 6.28) * 0.02;
        dummy.position.set(tile.x, y, tile.z);
        dummy.scale.set(TILE_SIZE, 0.3, TILE_SIZE);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        deepRef.current.setMatrixAt(i, dummy.matrix);
      }
      deepRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  const boxGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);

  return (
    <group>
      {regularTiles.length > 0 && (
        <instancedMesh ref={regularRef} args={[boxGeo, undefined, regularTiles.length]}>
          <meshStandardMaterial
            ref={regularMatRef}
            color="#2980B9"
            transparent
            opacity={0.6}
            roughness={0.15}
            metalness={0.1}
            emissive="#1A6B99"
            emissiveIntensity={0.08}
            flatShading
          />
        </instancedMesh>
      )}
      {deepTiles.length > 0 && (
        <instancedMesh ref={deepRef} args={[boxGeo, undefined, deepTiles.length]}>
          <meshStandardMaterial
            ref={deepMatRef}
            color="#1A5276"
            transparent
            opacity={0.7}
            roughness={0.15}
            metalness={0.1}
            emissive="#0E3D5C"
            emissiveIntensity={0.06}
            flatShading
          />
        </instancedMesh>
      )}
    </group>
  );
}
