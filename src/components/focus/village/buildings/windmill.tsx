"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Windmill() {
  const bladesRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (bladesRef.current) {
      bladesRef.current.rotation.z -= delta * 1.5;
    }
  });

  return (
    <group>
      {/* Tower base (tapered) */}
      <mesh position={[0, 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1, 1.5, 4, 8]} />
        <meshStandardMaterial color="#E8D5B7" />
      </mesh>

      {/* Roof cap */}
      <mesh position={[0, 4.4, 0]} castShadow>
        <coneGeometry args={[1.3, 1.2, 8]} />
        <meshStandardMaterial color="#5C3317" />
      </mesh>

      {/* Blade hub */}
      <mesh position={[0, 3.5, 1.2]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.3, 8]} />
        <meshStandardMaterial color="#5C3317" />
      </mesh>

      {/* Rotating blades */}
      <group ref={bladesRef} position={[0, 3.5, 1.35]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 2]} position={[0, 1.2, 0]} castShadow>
            <boxGeometry args={[0.25, 2.4, 0.05]} />
            <meshStandardMaterial color="#D4A76A" />
          </mesh>
        ))}
      </group>

      {/* Door */}
      <mesh position={[0, 0.5, 1.26]}>
        <boxGeometry args={[0.6, 1, 0.05]} />
        <meshStandardMaterial color="#5C3317" />
      </mesh>
    </group>
  );
}
