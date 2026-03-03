"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Fountain() {
  const waterRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (waterRef.current) {
      waterRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Base pool */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.5, 3, 0.6, 16]} />
        <meshStandardMaterial color="#8B8682" />
      </mesh>

      {/* Water surface */}
      <mesh ref={waterRef} position={[0, 0.55, 0]}>
        <cylinderGeometry args={[2.2, 2.2, 0.1, 16]} />
        <meshStandardMaterial color="#4A90D9" transparent opacity={0.7} />
      </mesh>

      {/* Center pillar */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 1.8, 8]} />
        <meshStandardMaterial color="#9B9B9B" />
      </mesh>

      {/* Top bowl */}
      <mesh position={[0, 2.2, 0]} castShadow>
        <cylinderGeometry args={[0.8, 0.5, 0.4, 8]} />
        <meshStandardMaterial color="#8B8682" />
      </mesh>

      {/* Water spout sphere */}
      <mesh position={[0, 2.6, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#6AB4F0" transparent opacity={0.6} emissive="#4A90D9" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}
