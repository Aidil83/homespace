"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

interface GuardMeshProps {
  walkingRef: React.RefObject<boolean>;
}

export function GuardMesh({ walkingRef }: GuardMeshProps) {
  const leftLegRef = useRef<Mesh>(null);
  const rightLegRef = useRef<Mesh>(null);
  const leftArmRef = useRef<Mesh>(null);
  const phase = useRef(0);

  useFrame((_, delta) => {
    if (walkingRef.current) phase.current += delta * 8;
    const swing = Math.sin(phase.current) * 0.25;
    if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
    if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
    if (leftArmRef.current) leftArmRef.current.rotation.x = -swing * 0.5;
  });

  return (
    <group>
      {/* Head */}
      <mesh position={[0, 1.05, 0]}>
        <sphereGeometry args={[0.16, 8, 6]} />
        <meshStandardMaterial color="#FDBCB4" />
      </mesh>

      {/* Helmet */}
      <mesh position={[0, 1.15, 0]}>
        <sphereGeometry args={[0.17, 8, 4]} />
        <meshStandardMaterial color="#808080" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Body / Armor */}
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[0.35, 0.5, 0.22]} />
        <meshStandardMaterial color="#A0A0A0" metalness={0.4} roughness={0.4} />
      </mesh>

      {/* Left leg */}
      <mesh ref={leftLegRef} position={[-0.09, 0.25, 0]}>
        <boxGeometry args={[0.12, 0.35, 0.12]} />
        <meshStandardMaterial color="#5C5C5C" />
      </mesh>

      {/* Right leg */}
      <mesh ref={rightLegRef} position={[0.09, 0.25, 0]}>
        <boxGeometry args={[0.12, 0.35, 0.12]} />
        <meshStandardMaterial color="#5C5C5C" />
      </mesh>

      {/* Left arm */}
      <mesh ref={leftArmRef} position={[-0.25, 0.7, 0]}>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial color="#A0A0A0" metalness={0.4} roughness={0.4} />
      </mesh>

      {/* Right arm + Spear */}
      <group position={[0.25, 0.7, 0]} rotation={[0.15, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.1, 0.4, 0.1]} />
          <meshStandardMaterial color="#A0A0A0" metalness={0.4} roughness={0.4} />
        </mesh>
        {/* Spear shaft */}
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 1.2, 4]} />
          <meshStandardMaterial color="#8B6914" />
        </mesh>
        {/* Spear tip */}
        <mesh position={[0, 1.25, 0]}>
          <coneGeometry args={[0.05, 0.15, 4]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.7} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
}
