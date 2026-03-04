"use client";
/* eslint-disable react-hooks/purity, react-hooks/rules-of-hooks */

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TILE_SIZE, gridToWorld, type TerrainData } from "@/lib/village/terrain";

interface WaterfallProps {
  terrain: TerrainData;
}

const BLOCK_COUNT = 8; // Stacked blocks for waterfall

export function Waterfall({ terrain }: WaterfallProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const sources = terrain.waterfallSources;
  if (sources.length === 0) return null;

  const avgPos = gridToWorld(21, 0);
  const cliffHeight = Math.max(...sources.map((s) => s.h));
  const width = TILE_SIZE * 3;
  const blockHeight = cliffHeight / BLOCK_COUNT;

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < BLOCK_COUNT; i++) {
      const yOffset = ((t * 2 + i * 0.3) % (cliffHeight + blockHeight)) - blockHeight;
      const y = cliffHeight - yOffset;

      dummy.position.set(avgPos.x, y, avgPos.z - TILE_SIZE * 0.4);
      dummy.scale.set(width, blockHeight * 0.9, TILE_SIZE * 0.3);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {/* Waterfall blocks */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, BLOCK_COUNT]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#5DADE2"
          transparent
          opacity={0.5}
          roughness={0.15}
          metalness={0.1}
          emissive="#1A6B99"
          emissiveIntensity={0.08}
          flatShading
        />
      </instancedMesh>

      {/* Splash pool at bottom */}
      <mesh position={[avgPos.x, 0.1, avgPos.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2, 8]} />
        <meshStandardMaterial
          color="#A8D8F0"
          transparent
          opacity={0.4}
          roughness={0.2}
          metalness={0.05}
          emissive="#1A6B99"
          emissiveIntensity={0.05}
        />
      </mesh>

      {/* Mist particles */}
      <WaterfallMist position={[avgPos.x, 0.5, avgPos.z]} />
    </group>
  );
}

function WaterfallMist({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 12;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 4,
      y: Math.random() * 2,
      z: Math.random() * 1.5,
      speed: 0.005 + Math.random() * 0.008,
      scale: 0.08 + Math.random() * 0.12,
      phase: Math.random() * Math.PI * 2,
    }));
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const p = particles[i];
      const life = ((t * p.speed + p.phase) % 1);
      const scale = p.scale * (1 + life * 2);

      dummy.position.set(
        position[0] + p.x + Math.sin(t + p.phase) * 0.3,
        position[1] + p.y + life * 2,
        position[2] + p.z,
      );
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 5, 5]} />
      <meshStandardMaterial color="#D0EAFF" transparent opacity={0.15} roughness={0.3} metalness={0.0} />
    </instancedMesh>
  );
}
