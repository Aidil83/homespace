"use client";
/* eslint-disable react-hooks/purity */

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 10;

interface SmokeParticlesProps {
  position: [number, number, number];
}

export function SmokeParticles({ position }: SmokeParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, () => ({
      phase: Math.random(),
      speed: 0.2 + Math.random() * 0.2,
      drift: (Math.random() - 0.5) * 0.3,
      size: 0.06 + Math.random() * 0.06,
    }));
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particles[i];
      const life = ((t * p.speed * 0.3 + p.phase) % 1);

      // Small puffs that expand gently and fade
      const scale = p.size * (1 + life * 1.5);

      dummy.position.set(
        position[0] + p.drift * life + Math.sin(t * 0.5 + p.phase) * 0.05,
        position[1] + life * 2,
        position[2] + Math.cos(t * 0.3 + p.phase) * 0.05,
      );
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <sphereGeometry args={[1, 5, 5]} />
      <meshStandardMaterial color="#AAAAAA" transparent opacity={0.2} />
    </instancedMesh>
  );
}
