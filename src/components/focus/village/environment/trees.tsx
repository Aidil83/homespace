"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { GRID, gridToWorld, type TerrainData } from "@/lib/village/terrain";
import { BUILDING_GRID_POSITIONS } from "@/lib/village/terrain";

function seededRandom(seed: number): number {
  return Math.abs(Math.sin(seed * 127.1 + 0.7) * 43758.5453) % 1;
}

interface TreesProps {
  terrain: TerrainData;
}

interface TreeData {
  x: number;
  y: number;
  z: number;
  type: "pine" | "oak" | "palm";
  scale: number;
}

export function Trees({ terrain }: TreesProps) {
  const trees = useMemo(() => {
    const result: TreeData[] = [];
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
        if (buildingSet.has(`${gx},${gy}`)) continue;

        const seed = gx * GRID + gy;
        const val = seededRandom(seed);
        const h = terrain.heightMap[idx];

        // Palm trees on sand tiles near water
        if (tileType === "sand" && val < 0.15) {
          const pos = gridToWorld(gx, gy);
          const scale = 0.7 + seededRandom(seed * 3) * 0.3;
          result.push({ x: pos.x, y: h, z: pos.z, type: "palm", scale });
          continue;
        }

        // Regular trees on grass
        if (tileType !== "grass") continue;
        if (val < 0.08) {
          const pos = gridToWorld(gx, gy);
          const treeType = (gx + gy) % 3 === 0 ? "pine" : "oak";
          const scale = 0.8 + seededRandom(seed * 3) * 0.4;
          result.push({ x: pos.x, y: h, z: pos.z, type: treeType, scale });
        }
      }
    }
    return result;
  }, [terrain]);

  const pines = useMemo(() => trees.filter((t) => t.type === "pine"), [trees]);
  const oaks = useMemo(() => trees.filter((t) => t.type === "oak"), [trees]);
  const palms = useMemo(() => trees.filter((t) => t.type === "palm"), [trees]);

  return (
    <group>
      <PineInstances pines={pines} />
      <OakInstances oaks={oaks} />
      <PalmInstances palms={palms} />
    </group>
  );
}

// --- Enhanced Pine Trees (4 cone layers) ---

function PineInstances({ pines }: { pines: TreeData[] }) {
  const meshes = useMemo(() => {
    if (pines.length === 0) return null;

    const trunkGeo = new THREE.CylinderGeometry(0.15, 0.2, 1, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: "#5D3A1A", roughness: 0.95, metalness: 0.0, flatShading: true });
    const trunk = new THREE.InstancedMesh(trunkGeo, trunkMat, pines.length);

    const coneGeo = new THREE.ConeGeometry(0.5, 1, 6);
    const foliageConfigs = [
      { color: "#1E4620", roughness: 0.92, emissive: "#000000", emissiveIntensity: 0 },
      { color: "#2D5A27", roughness: 0.90, emissive: "#000000", emissiveIntensity: 0 },
      { color: "#367D2E", roughness: 0.88, emissive: "#000000", emissiveIntensity: 0 },
      { color: "#4A9D42", roughness: 0.85, emissive: "#4A9D42", emissiveIntensity: 0.05 }, // sun-kissed top
    ];
    const foliageLayers = foliageConfigs.map(
      (c) => new THREE.InstancedMesh(
        coneGeo,
        new THREE.MeshStandardMaterial({
          color: c.color,
          roughness: c.roughness,
          metalness: 0.0,
          flatShading: true,
          emissive: c.emissive,
          emissiveIntensity: c.emissiveIntensity,
        }),
        pines.length,
      ),
    );

    const m = new THREE.Matrix4();

    for (let i = 0; i < pines.length; i++) {
      const t = pines[i];
      const s = t.scale;

      // Trunk — slightly tapered
      m.makeScale(0.3 * s, 2.5 * s, 0.3 * s);
      m.setPosition(t.x, t.y + 1.25 * s, t.z);
      trunk.setMatrixAt(i, m);

      // 4 cone foliage layers, progressively smaller
      const layerConfigs = [
        { scaleXZ: 1.5, scaleY: 2.0, yOff: 2.8 },
        { scaleXZ: 1.2, scaleY: 1.8, yOff: 4.0 },
        { scaleXZ: 0.9, scaleY: 1.5, yOff: 5.0 },
        { scaleXZ: 0.6, scaleY: 1.2, yOff: 5.8 },
      ];

      for (let l = 0; l < 4; l++) {
        const cfg = layerConfigs[l];
        m.makeScale(cfg.scaleXZ * s, cfg.scaleY * s, cfg.scaleXZ * s);
        m.setPosition(t.x, t.y + cfg.yOff * s, t.z);
        foliageLayers[l].setMatrixAt(i, m);
      }
    }

    trunk.instanceMatrix.needsUpdate = true;
    trunk.castShadow = true;
    for (const fl of foliageLayers) {
      fl.instanceMatrix.needsUpdate = true;
      fl.castShadow = true;
    }

    return { trunk, foliageLayers };
  }, [pines]);

  if (!meshes) return null;

  return (
    <group>
      <primitive object={meshes.trunk} />
      {meshes.foliageLayers.map((fl, i) => (
        <primitive key={i} object={fl} />
      ))}
    </group>
  );
}

// --- Enhanced Oak Trees (larger canopy + secondary sphere) ---

function OakInstances({ oaks }: { oaks: TreeData[] }) {
  const meshes = useMemo(() => {
    if (oaks.length === 0) return null;

    const trunkGeo = new THREE.CylinderGeometry(0.15, 0.2, 1, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: "#5D3A1A", roughness: 0.95, metalness: 0.0, flatShading: true });
    const trunk = new THREE.InstancedMesh(trunkGeo, trunkMat, oaks.length);

    const canopyGeo = new THREE.SphereGeometry(0.5, 6, 6);
    const canopy1Mat = new THREE.MeshStandardMaterial({ color: "#2D6B27", roughness: 0.88, metalness: 0.0, flatShading: true });
    const canopy2Mat = new THREE.MeshStandardMaterial({ color: "#3D8B37", roughness: 0.85, metalness: 0.0, flatShading: true });
    const canopy1 = new THREE.InstancedMesh(canopyGeo, canopy1Mat, oaks.length);
    const canopy2 = new THREE.InstancedMesh(canopyGeo, canopy2Mat, oaks.length);

    const m = new THREE.Matrix4();

    for (let i = 0; i < oaks.length; i++) {
      const t = oaks[i];
      const s = t.scale;

      // Trunk
      m.makeScale(0.25 * s, 2 * s, 0.25 * s);
      m.setPosition(t.x, t.y + 1 * s, t.z);
      trunk.setMatrixAt(i, m);

      // Main canopy (larger — 1.2 radius equiv)
      m.makeScale(2.4 * s, 2.0 * s, 2.4 * s);
      m.setPosition(t.x, t.y + 2.8 * s, t.z);
      canopy1.setMatrixAt(i, m);

      // Secondary canopy (offset, lighter green)
      m.makeScale(1.6 * s, 1.4 * s, 1.6 * s);
      m.setPosition(t.x + 0.5 * s, t.y + 3.5 * s, t.z + 0.3 * s);
      canopy2.setMatrixAt(i, m);
    }

    trunk.instanceMatrix.needsUpdate = true;
    canopy1.instanceMatrix.needsUpdate = true;
    canopy2.instanceMatrix.needsUpdate = true;
    trunk.castShadow = true;
    canopy1.castShadow = true;
    canopy2.castShadow = true;

    return { trunk, canopy1, canopy2 };
  }, [oaks]);

  if (!meshes) return null;

  return (
    <group>
      <primitive object={meshes.trunk} />
      <primitive object={meshes.canopy1} />
      <primitive object={meshes.canopy2} />
    </group>
  );
}

// --- Palm Trees (sand tiles near water) ---

function PalmInstances({ palms }: { palms: TreeData[] }) {
  if (palms.length === 0) return null;

  return (
    <group>
      {palms.map((palm, i) => (
        <PalmTree key={i} data={palm} />
      ))}
    </group>
  );
}

function PalmTree({ data }: { data: TreeData }) {
  const s = data.scale;

  return (
    <group position={[data.x, data.y, data.z]}>
      {/* Trunk — 3 stacked slightly-offset cylinders for curved effect */}
      <mesh position={[0, 0.6 * s, 0]} castShadow>
        <cylinderGeometry args={[0.12 * s, 0.18 * s, 1.2 * s, 6]} />
        <meshStandardMaterial color="#8B6914" roughness={0.95} metalness={0.0} flatShading />
      </mesh>
      <mesh position={[0.05 * s, 1.6 * s, 0.03 * s]} castShadow>
        <cylinderGeometry args={[0.1 * s, 0.13 * s, 1.0 * s, 6]} />
        <meshStandardMaterial color="#8B6914" roughness={0.95} metalness={0.0} flatShading />
      </mesh>
      <mesh position={[0.1 * s, 2.4 * s, 0.05 * s]} castShadow>
        <cylinderGeometry args={[0.08 * s, 0.11 * s, 0.8 * s, 6]} />
        <meshStandardMaterial color="#8B6914" roughness={0.95} metalness={0.0} flatShading />
      </mesh>

      {/* Fronds — 5 elongated cones radiating from top */}
      {[0, 1.2, 2.4, 3.6, 4.8].map((angle, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(angle) * 0.6 * s + 0.1 * s,
            2.8 * s,
            Math.sin(angle) * 0.6 * s + 0.05 * s,
          ]}
          rotation={[
            Math.sin(angle) * 0.6,
            angle,
            Math.cos(angle) * 0.6,
          ]}
          castShadow
        >
          <coneGeometry args={[0.15 * s, 1.2 * s, 4]} />
          <meshStandardMaterial color="#3D8B37" roughness={0.88} metalness={0.0} flatShading />
        </mesh>
      ))}

      {/* Coconuts — 2-3 small brown spheres */}
      <mesh position={[0.1 * s, 2.7 * s, 0.12 * s]}>
        <sphereGeometry args={[0.06 * s, 5, 5]} />
        <meshStandardMaterial color="#5D3A1A" roughness={0.9} metalness={0.0} flatShading />
      </mesh>
      <mesh position={[-0.05 * s, 2.65 * s, -0.08 * s]}>
        <sphereGeometry args={[0.06 * s, 5, 5]} />
        <meshStandardMaterial color="#5D3A1A" roughness={0.9} metalness={0.0} flatShading />
      </mesh>
    </group>
  );
}
