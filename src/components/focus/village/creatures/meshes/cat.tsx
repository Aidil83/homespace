"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

interface CatMeshProps {
  walkingRef: React.RefObject<boolean>;
}

export function CatMesh({ walkingRef }: CatMeshProps) {
  const flRef = useRef<Mesh>(null);
  const frRef = useRef<Mesh>(null);
  const blRef = useRef<Mesh>(null);
  const brRef = useRef<Mesh>(null);
  const tailRef = useRef<Mesh>(null);
  const phase = useRef(0);

  useFrame((_, delta) => {
    if (walkingRef.current) phase.current += delta * 8;
    const swing = Math.sin(phase.current) * 0.25;
    const tailWave = Math.sin(phase.current * 0.7) * 0.4;
    if (flRef.current) flRef.current.rotation.x = swing;
    if (frRef.current) frRef.current.rotation.x = -swing;
    if (blRef.current) blRef.current.rotation.x = -swing;
    if (brRef.current) brRef.current.rotation.x = swing;
    if (tailRef.current) tailRef.current.rotation.x = tailWave - 0.8;
  });

  return (
    <group scale={0.35}>
      {/* Body */}
      <mesh position={[0, 0.4, 0]} rotation={[0.1, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.18, 0.6, 6]} />
        <meshStandardMaterial color="#5C5C5C" />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.55, 0.3]}>
        <sphereGeometry args={[0.16, 6, 6]} />
        <meshStandardMaterial color="#5C5C5C" />
      </mesh>

      {/* Left ear */}
      <mesh position={[-0.1, 0.72, 0.3]} rotation={[0, 0, -0.2]}>
        <coneGeometry args={[0.05, 0.1, 3]} />
        <meshStandardMaterial color="#5C5C5C" />
      </mesh>

      {/* Right ear */}
      <mesh position={[0.1, 0.72, 0.3]} rotation={[0, 0, 0.2]}>
        <coneGeometry args={[0.05, 0.1, 3]} />
        <meshStandardMaterial color="#5C5C5C" />
      </mesh>

      {/* Front left leg */}
      <mesh ref={flRef} position={[-0.1, 0.13, 0.18]}>
        <cylinderGeometry args={[0.03, 0.03, 0.25, 4]} />
        <meshStandardMaterial color="#5C5C5C" />
      </mesh>

      {/* Front right leg */}
      <mesh ref={frRef} position={[0.1, 0.13, 0.18]}>
        <cylinderGeometry args={[0.03, 0.03, 0.25, 4]} />
        <meshStandardMaterial color="#5C5C5C" />
      </mesh>

      {/* Back left leg */}
      <mesh ref={blRef} position={[-0.1, 0.13, -0.18]}>
        <cylinderGeometry args={[0.03, 0.03, 0.25, 4]} />
        <meshStandardMaterial color="#5C5C5C" />
      </mesh>

      {/* Back right leg */}
      <mesh ref={brRef} position={[0.1, 0.13, -0.18]}>
        <cylinderGeometry args={[0.03, 0.03, 0.25, 4]} />
        <meshStandardMaterial color="#5C5C5C" />
      </mesh>

      {/* Tail */}
      <mesh ref={tailRef} position={[0, 0.5, -0.4]} rotation={[-0.8, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.015, 0.4, 4]} />
        <meshStandardMaterial color="#5C5C5C" />
      </mesh>
    </group>
  );
}
