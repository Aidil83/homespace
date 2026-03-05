"use client";

import { useMemo } from "react";
import * as THREE from "three";
import type { VillageBuilding } from "@/lib/village/types";
import { getBlockHeight } from "@/lib/village/terrain";
import type { TerrainData } from "@/lib/village/terrain";

interface BuildingShadowsProps {
  buildings: VillageBuilding[];
  terrain: TerrainData;
}

// Soft radial gradient texture for shadow blobs
function createShadowTexture(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const gradient = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2,
  );
  gradient.addColorStop(0, "rgba(0,0,0,0.3)");
  gradient.addColorStop(0.5, "rgba(0,0,0,0.15)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function BuildingShadows({ buildings, terrain }: BuildingShadowsProps) {
  const mesh = useMemo(() => {
    if (buildings.length === 0) return null;

    const geo = new THREE.PlaneGeometry(1, 1);
    geo.rotateX(-Math.PI / 2);

    const shadowTex = createShadowTexture();
    const mat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });

    const inst = new THREE.InstancedMesh(geo, mat, buildings.length);
    const m = new THREE.Matrix4();

    for (let i = 0; i < buildings.length; i++) {
      const b = buildings[i];
      const y = getBlockHeight(terrain.heightMap, b.positionX, b.positionZ) + 0.05;
      // Shadow size varies by building type
      const size = b.buildingType === "castle" ? 10
        : b.buildingType === "well" || b.buildingType === "garden" ? 4
        : 6;

      m.makeScale(size, 1, size);
      m.setPosition(b.positionX, y, b.positionZ);
      inst.setMatrixAt(i, m);
    }
    inst.instanceMatrix.needsUpdate = true;
    inst.renderOrder = -1; // Render before terrain to avoid z-fighting

    return inst;
  }, [buildings, terrain]);

  if (!mesh) return null;
  return <primitive object={mesh} />;
}
