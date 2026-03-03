"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

interface DogMeshProps {
  walkingRef: React.RefObject<boolean>;
}

export function DogMesh({ walkingRef }: DogMeshProps) {
  const flRef = useRef<Mesh>(null);
  const frRef = useRef<Mesh>(null);
  const blRef = useRef<Mesh>(null);
  const brRef = useRef<Mesh>(null);
  const tailRef = useRef<Mesh>(null);
  const phase = useRef(0);

  useFrame((_, delta) => {
    if (walkingRef.current) phase.current += delta * 8;
    const swing = Math.sin(phase.current) * 0.3;
    // Tail always wags but faster when walking
    const tailSpeed = walkingRef.current ? 3 : 1.5;
    const tailWag = Math.sin(phase.current * tailSpeed) * 0.5;
    if (flRef.current) flRef.current.rotation.x = swing;
    if (frRef.current) frRef.current.rotation.x = -swing;
    if (blRef.current) blRef.current.rotation.x = -swing;
    if (brRef.current) brRef.current.rotation.x = swing;
    if (tailRef.current) tailRef.current.rotation.z = tailWag;
  });

  return (
    <group scale={0.5}>
      {/* Body */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[0.35, 0.3, 0.7]} />
        <meshStandardMaterial color="#8B6914" />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.55, 0.4]}>
        <boxGeometry args={[0.28, 0.25, 0.28]} />
        <meshStandardMaterial color="#8B6914" />
      </mesh>

      {/* Snout */}
      <mesh position={[0, 0.48, 0.58]}>
        <boxGeometry args={[0.15, 0.12, 0.15]} />
        <meshStandardMaterial color="#A07828" />
      </mesh>

      {/* Nose */}
      <mesh position={[0, 0.5, 0.66]}>
        <sphereGeometry args={[0.03, 4, 4]} />
        <meshStandardMaterial color="#1A1A1A" />
      </mesh>

      {/* Left ear */}
      <mesh position={[-0.15, 0.68, 0.38]}>
        <boxGeometry args={[0.08, 0.12, 0.06]} />
        <meshStandardMaterial color="#6B4E14" />
      </mesh>

      {/* Right ear */}
      <mesh position={[0.15, 0.68, 0.38]}>
        <boxGeometry args={[0.08, 0.12, 0.06]} />
        <meshStandardMaterial color="#6B4E14" />
      </mesh>

      {/* Front left leg */}
      <mesh ref={flRef} position={[-0.12, 0.15, 0.22]}>
        <cylinderGeometry args={[0.04, 0.04, 0.3, 4]} />
        <meshStandardMaterial color="#8B6914" />
      </mesh>

      {/* Front right leg */}
      <mesh ref={frRef} position={[0.12, 0.15, 0.22]}>
        <cylinderGeometry args={[0.04, 0.04, 0.3, 4]} />
        <meshStandardMaterial color="#8B6914" />
      </mesh>

      {/* Back left leg */}
      <mesh ref={blRef} position={[-0.12, 0.15, -0.22]}>
        <cylinderGeometry args={[0.04, 0.04, 0.3, 4]} />
        <meshStandardMaterial color="#8B6914" />
      </mesh>

      {/* Back right leg */}
      <mesh ref={brRef} position={[0.12, 0.15, -0.22]}>
        <cylinderGeometry args={[0.04, 0.04, 0.3, 4]} />
        <meshStandardMaterial color="#8B6914" />
      </mesh>

      {/* Tail */}
      <mesh ref={tailRef} position={[0, 0.6, -0.4]} rotation={[-0.6, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.02, 0.25, 4]} />
        <meshStandardMaterial color="#8B6914" />
      </mesh>
    </group>
  );
}
