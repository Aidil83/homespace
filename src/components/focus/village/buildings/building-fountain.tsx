"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function BuildingFountain() {
  const waterRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (waterRef.current) {
      waterRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group>
      {/* Outer pool */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2, 2.3, 0.5, 12]} />
        <meshStandardMaterial color="#8B8682" />
      </mesh>
      {/* Water surface */}
      <mesh ref={waterRef} position={[0, 0.45, 0]}>
        <cylinderGeometry args={[1.8, 1.8, 0.08, 12]} />
        <meshStandardMaterial color="#4A90D9" transparent opacity={0.7} />
      </mesh>
      {/* Inner pedestal */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.5, 1.2, 8]} />
        <meshStandardMaterial color="#9B9B9B" />
      </mesh>
      {/* Top decorative bowl */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.7, 0.4, 0.3, 8]} />
        <meshStandardMaterial color="#8B8682" />
      </mesh>
      {/* Water spout */}
      <mesh position={[0, 1.9, 0]}>
        <sphereGeometry args={[0.15, 6, 6]} />
        <meshStandardMaterial color="#6AB4F0" transparent opacity={0.6} emissive="#4A90D9" emissiveIntensity={0.3} />
      </mesh>
      {/* Decorative rim details */}
      {[0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3, (5 * Math.PI) / 3].map((angle, i) => (
        <mesh key={i} position={[Math.cos(angle) * 2, 0.5, Math.sin(angle) * 2]} castShadow>
          <sphereGeometry args={[0.12, 6, 6]} />
          <meshStandardMaterial color="#9B9B9B" />
        </mesh>
      ))}
    </group>
  );
}
