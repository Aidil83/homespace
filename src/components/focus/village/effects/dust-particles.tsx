"use client";
/* eslint-disable react-hooks/purity */

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 8;

interface DustParticlesProps {
  position: [number, number, number];
}

export function DustParticles({ position }: DustParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, () => ({
      phase: Math.random(),
      speed: 0.15 + Math.random() * 0.2,
      driftX: (Math.random() - 0.5) * 2,
      driftZ: (Math.random() - 0.5) * 2,
      size: 0.04 + Math.random() * 0.05,
    }));
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particles[i];
      const life = ((t * p.speed * 0.3 + p.phase) % 1);
      const expand = 1 + life * 1.5;

      dummy.position.set(
        position[0] + p.driftX * life,
        position[1] + life * 0.8,
        position[2] + p.driftZ * life,
      );
      dummy.scale.setScalar(p.size * expand);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshStandardMaterial color="#8B7355" transparent opacity={0.2} />
    </instancedMesh>
  );
}
