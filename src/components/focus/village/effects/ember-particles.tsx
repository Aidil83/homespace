"use client";
/* eslint-disable react-hooks/purity */

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 15;

interface EmberParticlesProps {
  position: [number, number, number];
}

export function EmberParticles({ position }: EmberParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, () => ({
      phase: Math.random(),
      speed: 0.2 + Math.random() * 0.4,
      driftX: (Math.random() - 0.5) * 1.5,
      driftZ: (Math.random() - 0.5) * 1.5,
      size: 0.02 + Math.random() * 0.03,
    }));
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particles[i];
      const life = ((t * p.speed * 0.5 + p.phase) % 1);

      dummy.position.set(
        position[0] + p.driftX * life,
        position[1] + life * 2 + Math.sin(t * 3 + p.phase) * 0.2,
        position[2] + p.driftZ * life,
      );
      dummy.scale.setScalar(p.size * (1 - life * 0.5));
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial color="#FF6600" transparent opacity={0.7} />
    </instancedMesh>
  );
}
