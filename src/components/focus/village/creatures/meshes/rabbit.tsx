"use client";
/* eslint-disable react-hooks/purity */

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface RabbitMeshProps {
  walkingRef: React.RefObject<boolean>;
}

export function RabbitMesh({ walkingRef }: RabbitMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const phaseRef = useRef(Math.random() * Math.PI * 2);

  useFrame(() => {
    if (!groupRef.current) return;
    const hopping = walkingRef.current;

    // Hop animation when walking
    if (hopping) {
      phaseRef.current += 0.15;
      groupRef.current.position.y = Math.abs(Math.sin(phaseRef.current)) * 0.15;
    } else {
      groupRef.current.position.y = 0;
    }
  });

  return (
    <group ref={groupRef} scale={0.35}>
      {/* Body */}
      <mesh castShadow>
        <sphereGeometry args={[0.3, 6, 6]} />
        <meshLambertMaterial color="#C4A882" />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.2, -0.25]} castShadow>
        <sphereGeometry args={[0.2, 6, 6]} />
        <meshLambertMaterial color="#C4A882" />
      </mesh>

      {/* Left ear */}
      <mesh position={[-0.08, 0.55, -0.2]}>
        <cylinderGeometry args={[0.03, 0.04, 0.35, 4]} />
        <meshLambertMaterial color="#C4A882" />
      </mesh>
      {/* Left ear inner (pink) */}
      <mesh position={[-0.08, 0.55, -0.19]}>
        <cylinderGeometry args={[0.015, 0.025, 0.3, 4]} />
        <meshLambertMaterial color="#E8A0A0" />
      </mesh>

      {/* Right ear */}
      <mesh position={[0.08, 0.55, -0.2]}>
        <cylinderGeometry args={[0.03, 0.04, 0.35, 4]} />
        <meshLambertMaterial color="#C4A882" />
      </mesh>
      {/* Right ear inner (pink) */}
      <mesh position={[0.08, 0.55, -0.19]}>
        <cylinderGeometry args={[0.015, 0.025, 0.3, 4]} />
        <meshLambertMaterial color="#E8A0A0" />
      </mesh>

      {/* Nose */}
      <mesh position={[0, 0.18, -0.44]}>
        <sphereGeometry args={[0.03, 4, 4]} />
        <meshLambertMaterial color="#E8A0A0" />
      </mesh>

      {/* Cotton tail */}
      <mesh position={[0, 0.05, 0.28]}>
        <sphereGeometry args={[0.1, 5, 5]} />
        <meshLambertMaterial color="#FFFAF0" />
      </mesh>
    </group>
  );
}
