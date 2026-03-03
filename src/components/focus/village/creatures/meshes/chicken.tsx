"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

interface ChickenMeshProps {
  walkingRef: React.RefObject<boolean>;
}

export function ChickenMesh({ walkingRef }: ChickenMeshProps) {
  const leftLegRef = useRef<Mesh>(null);
  const rightLegRef = useRef<Mesh>(null);
  const beakRef = useRef<Mesh>(null);
  const phase = useRef(0);

  useFrame((_, delta) => {
    if (walkingRef.current) phase.current += delta * 10;
    const swing = Math.sin(phase.current) * 0.4;
    if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
    if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
    // Peck animation
    if (beakRef.current) beakRef.current.position.y = 0.65 + Math.sin(phase.current * 2) * 0.03;
  });

  return (
    <group scale={0.3}>
      {/* Body */}
      <mesh position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.35, 6, 6]} />
        <meshStandardMaterial color="#F5D442" />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.7, 0.2]}>
        <sphereGeometry args={[0.18, 6, 6]} />
        <meshStandardMaterial color="#F5D442" />
      </mesh>

      {/* Beak */}
      <mesh ref={beakRef} position={[0, 0.65, 0.42]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[0.06, 0.12, 4]} />
        <meshStandardMaterial color="#FF8C00" />
      </mesh>

      {/* Comb */}
      <mesh position={[0, 0.88, 0.18]}>
        <boxGeometry args={[0.04, 0.12, 0.1]} />
        <meshStandardMaterial color="#CC0000" />
      </mesh>

      {/* Left leg */}
      <mesh ref={leftLegRef} position={[-0.1, 0.08, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.18, 4]} />
        <meshStandardMaterial color="#FF8C00" />
      </mesh>

      {/* Right leg */}
      <mesh ref={rightLegRef} position={[0.1, 0.08, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.18, 4]} />
        <meshStandardMaterial color="#FF8C00" />
      </mesh>

      {/* Tail feathers */}
      <mesh position={[0, 0.45, -0.3]} rotation={[-0.5, 0, 0]}>
        <boxGeometry args={[0.08, 0.2, 0.06]} />
        <meshStandardMaterial color="#D4A017" />
      </mesh>
    </group>
  );
}
