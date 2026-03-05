"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { GRID, TILE_SIZE, type TerrainData } from "@/lib/village/terrain";

interface GrassProps {
  terrain: TerrainData;
}

// Deterministic random
function srand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const GRASS_COLORS = [
  new THREE.Color("#2D6B27"),
  new THREE.Color("#3D8B37"),
  new THREE.Color("#4A9D42"),
  new THREE.Color("#1E5620"),
  new THREE.Color("#387D32"),
];

export function GrassBillboards({ terrain }: GrassProps) {
  const mesh = useMemo(() => {
    // Thin box blade — visible from all angles, fits voxel aesthetic
    const geo = new THREE.BoxGeometry(1, 1, 0.15);
    geo.translate(0, 0.5, 0); // Origin at bottom so blade grows upward

    const matrices: THREE.Matrix4[] = [];
    const colors: THREE.Color[] = [];
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const p = new THREE.Vector3();

    for (let gy = 0; gy < GRID; gy++) {
      for (let gx = 0; gx < GRID; gx++) {
        const idx = gy * GRID + gx;
        if (terrain.tileTypes[idx] !== "grass") continue;

        const h = terrain.heightMap[idx];
        const baseX = (gx - GRID / 2 + 0.5) * TILE_SIZE;
        const baseZ = (gy - GRID / 2 + 0.5) * TILE_SIZE;

        // ~1 tuft per 10 tiles, evenly spread
        if (srand(idx * 7) > 0.1) continue;
        const tufts = 1;
        for (let i = 0; i < tufts; i++) {
          const seed = idx * 13 + i * 37;
          const ox = (srand(seed) - 0.5) * TILE_SIZE * 0.4;
          const oz = (srand(seed + 1) - 0.5) * TILE_SIZE * 0.4;
          const rotY = srand(seed + 2) * Math.PI;
          const bladeH = 0.3 + srand(seed + 3) * 0.4;
          const bladeW = 0.3 + srand(seed + 4) * 0.2;

          p.set(baseX + ox, h, baseZ + oz);
          q.setFromEuler(new THREE.Euler(0, rotY, 0));
          s.set(bladeW, bladeH, bladeW);
          m.compose(p, q, s);
          matrices.push(m.clone());
          colors.push(GRASS_COLORS[Math.floor(srand(seed + 5) * GRASS_COLORS.length)]);
        }
      }
    }

    const mat = new THREE.MeshStandardMaterial({
      roughness: 0.9,
      metalness: 0,
      flatShading: true,
    });

    const inst = new THREE.InstancedMesh(geo, mat, matrices.length);
    for (let i = 0; i < matrices.length; i++) {
      inst.setMatrixAt(i, matrices[i]);
      inst.setColorAt(i, colors[i]);
    }
    inst.instanceMatrix.needsUpdate = true;
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
    inst.castShadow = true;
    inst.receiveShadow = true;

    return inst;
  }, [terrain]);

  return <primitive object={mesh} />;
}
