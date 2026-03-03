"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

interface SheepMeshProps {
  walkingRef: React.RefObject<boolean>;
}

export function SheepMesh({ walkingRef }: SheepMeshProps) {
  const bodyRef = useRef<Mesh>(null);
  const flRef = useRef<Mesh>(null);
  const frRef = useRef<Mesh>(null);
  const blRef = useRef<Mesh>(null);
  const brRef = useRef<Mesh>(null);
  const phase = useRef(0);

  useFrame((_, delta) => {
    if (walkingRef.current) phase.current += delta * 6;
    const swing = Math.sin(phase.current) * 0.3;
    const bob = Math.sin(phase.current * 1.5) * 0.02;
    if (bodyRef.current) bodyRef.current.position.y = 0.5 + bob;
    if (flRef.current) flRef.current.rotation.x = swing;
    if (frRef.current) frRef.current.rotation.x = -swing;
    if (blRef.current) blRef.current.rotation.x = -swing;
    if (brRef.current) brRef.current.rotation.x = swing;
  });

  return (
    <group scale={0.5}>
      {/* Woolly body */}
      <mesh ref={bodyRef} position={[0, 0.5, 0]}>
        <boxGeometry args={[0.6, 0.45, 0.8]} />
        <meshStandardMaterial color="#F5F5F0" roughness={0.9} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.6, 0.45]}>
        <sphereGeometry args={[0.17, 6, 6]} />
        <meshStandardMaterial color="#3D3D3D" />
      </mesh>

      {/* Left ear */}
      <mesh position={[-0.15, 0.7, 0.42]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.1, 0.06, 0.04]} />
        <meshStandardMaterial color="#3D3D3D" />
      </mesh>

      {/* Right ear */}
      <mesh position={[0.15, 0.7, 0.42]} rotation={[0, 0, 0.4]}>
        <boxGeometry args={[0.1, 0.06, 0.04]} />
        <meshStandardMaterial color="#3D3D3D" />
      </mesh>

      {/* Front left leg */}
      <mesh ref={flRef} position={[-0.18, 0.15, 0.25]}>
        <cylinderGeometry args={[0.04, 0.04, 0.3, 4]} />
        <meshStandardMaterial color="#3D3D3D" />
      </mesh>

      {/* Front right leg */}
      <mesh ref={frRef} position={[0.18, 0.15, 0.25]}>
        <cylinderGeometry args={[0.04, 0.04, 0.3, 4]} />
        <meshStandardMaterial color="#3D3D3D" />
      </mesh>

      {/* Back left leg */}
      <mesh ref={blRef} position={[-0.18, 0.15, -0.25]}>
        <cylinderGeometry args={[0.04, 0.04, 0.3, 4]} />
        <meshStandardMaterial color="#3D3D3D" />
      </mesh>

      {/* Back right leg */}
      <mesh ref={brRef} position={[0.18, 0.15, -0.25]}>
        <cylinderGeometry args={[0.04, 0.04, 0.3, 4]} />
        <meshStandardMaterial color="#3D3D3D" />
      </mesh>
    </group>
  );
}
