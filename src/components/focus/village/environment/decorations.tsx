"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GRID, TILE_SIZE, gridToWorld, type TerrainData } from "@/lib/village/terrain";
import { BUILDING_GRID_POSITIONS } from "@/lib/village/terrain";

function seededRandom(seed: number): number {
  return Math.abs(Math.sin(seed * 127.1 + 0.7) * 43758.5453) % 1;
}

interface DecorationsProps {
  terrain: TerrainData;
}

// Grass tuft data
interface TuftData {
  x: number;
  y: number;
  z: number;
  shade: number; // 0, 1, or 2
  phase: number;
}

// Flower data
interface FlowerData {
  x: number;
  y: number;
  z: number;
  colorIdx: number; // 0=red, 1=yellow, 2=purple
}

// Bush data
interface BushData {
  x: number;
  y: number;
  z: number;
  scale: number;
}

export function Decorations({ terrain }: DecorationsProps) {
  const { tufts, flowers, bushes } = useMemo(() => {
    const tufts: TuftData[] = [];
    const flowers: FlowerData[] = [];
    const bushes: BushData[] = [];

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
        if (terrain.tileTypes[idx] !== "grass") continue;
        if (buildingSet.has(`${gx},${gy}`)) continue;

        const baseSeed = gx * 1000 + gy;
        const pos = gridToWorld(gx, gy);
        const h = terrain.heightMap[idx];

        // 5-8 grass tufts per grass tile
        const tuftCount = 5 + Math.floor(seededRandom(baseSeed * 17) * 4);
        for (let t = 0; t < tuftCount; t++) {
          const ox = (seededRandom(baseSeed * 31 + t * 7) - 0.5) * TILE_SIZE * 0.8;
          const oz = (seededRandom(baseSeed * 43 + t * 11) - 0.5) * TILE_SIZE * 0.8;
          const shade = Math.floor(seededRandom(baseSeed * 59 + t * 13) * 3);
          tufts.push({
            x: pos.x + ox,
            y: h,
            z: pos.z + oz,
            shade,
            phase: seededRandom(baseSeed * 67 + t) * Math.PI * 2,
          });
        }

        // 5% chance for flower
        if (seededRandom(baseSeed * 97) < 0.05) {
          const ox = (seededRandom(baseSeed * 101) - 0.5) * TILE_SIZE * 0.5;
          const oz = (seededRandom(baseSeed * 107) - 0.5) * TILE_SIZE * 0.5;
          flowers.push({
            x: pos.x + ox,
            y: h,
            z: pos.z + oz,
            colorIdx: Math.floor(seededRandom(baseSeed * 113) * 3),
          });
        }

        // 3% chance for bush
        if (seededRandom(baseSeed * 127) < 0.03) {
          const ox = (seededRandom(baseSeed * 131) - 0.5) * TILE_SIZE * 0.4;
          const oz = (seededRandom(baseSeed * 137) - 0.5) * TILE_SIZE * 0.4;
          bushes.push({
            x: pos.x + ox,
            y: h,
            z: pos.z + oz,
            scale: 0.25 + seededRandom(baseSeed * 139) * 0.15,
          });
        }
      }
    }

    return { tufts, flowers, bushes };
  }, [terrain]);

  return (
    <group>
      <GrassTufts tufts={tufts} />
      <Flowers flowers={flowers} />
      <Bushes bushes={bushes} />
    </group>
  );
}

// --- Grass Tufts ---

const GRASS_SHADES = ["#3D8B2F", "#4A9D42", "#2D7A22"];

function GrassTufts({ tufts }: { tufts: TuftData[] }) {
  // Group by shade
  const groups = useMemo(() => {
    const byShade: TuftData[][] = [[], [], []];
    for (const t of tufts) byShade[t.shade].push(t);
    return byShade;
  }, [tufts]);

  return (
    <group>
      {groups.map((group, shadeIdx) =>
        group.length > 0 ? (
          <GrassTuftInstances key={shadeIdx} tufts={group} color={GRASS_SHADES[shadeIdx]} />
        ) : null,
      )}
    </group>
  );
}

function GrassTuftInstances({ tufts, color }: { tufts: TuftData[]; color: string }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < tufts.length; i++) {
      const tuft = tufts[i];
      const sway = Math.sin(t * 1.5 + tuft.phase) * 0.08;

      dummy.position.set(tuft.x, tuft.y + 0.25, tuft.z);
      dummy.rotation.set(sway, 0, sway * 0.5);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, tufts.length]}>
      <coneGeometry args={[0.06, 0.5, 3]} />
      <meshStandardMaterial color={color} roughness={0.9} metalness={0.0} flatShading />
    </instancedMesh>
  );
}

// --- Flowers ---

const FLOWER_COLORS = ["#E74C3C", "#F1C40F", "#9B59B6"];

function Flowers({ flowers }: { flowers: FlowerData[] }) {
  // Group by color
  const groups = useMemo(() => {
    const byColor: FlowerData[][] = [[], [], []];
    for (const f of flowers) byColor[f.colorIdx].push(f);
    return byColor;
  }, [flowers]);

  return (
    <group>
      {groups.map((group, colorIdx) =>
        group.length > 0 ? (
          <group key={colorIdx}>
            {group.map((f, i) => (
              <group key={i} position={[f.x, f.y, f.z]}>
                {/* Stem */}
                <mesh position={[0, 0.2, 0]}>
                  <cylinderGeometry args={[0.02, 0.02, 0.4, 4]} />
                  <meshStandardMaterial color="#2D7A22" roughness={0.9} metalness={0.0} flatShading />
                </mesh>
                {/* Bloom */}
                <mesh position={[0, 0.42, 0]}>
                  <sphereGeometry args={[0.08, 5, 5]} />
                  <meshStandardMaterial
                    color={FLOWER_COLORS[colorIdx]}
                    roughness={0.8}
                    metalness={0.0}
                    flatShading
                    emissive={FLOWER_COLORS[colorIdx]}
                    emissiveIntensity={0.05}
                  />
                </mesh>
              </group>
            ))}
          </group>
        ) : null,
      )}
    </group>
  );
}

// --- Bushes ---

function Bushes({ bushes }: { bushes: BushData[] }) {
  const mesh = useMemo(() => {
    if (bushes.length === 0) return null;
    const geo = new THREE.SphereGeometry(1, 6, 6);
    const mat = new THREE.MeshStandardMaterial({ color: "#2D6B27", roughness: 0.88, metalness: 0.0, flatShading: true });
    const inst = new THREE.InstancedMesh(geo, mat, bushes.length);
    const m = new THREE.Matrix4();

    for (let i = 0; i < bushes.length; i++) {
      const b = bushes[i];
      m.makeScale(b.scale, b.scale * 0.6, b.scale);
      m.setPosition(b.x, b.y + b.scale * 0.3, b.z);
      inst.setMatrixAt(i, m);
    }
    inst.instanceMatrix.needsUpdate = true;
    inst.castShadow = true;
    return inst;
  }, [bushes]);

  if (!mesh) return null;
  return <primitive object={mesh} />;
}
