"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Stable() {
  const doorRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (doorRef.current) {
      const t = state.clock.elapsedTime;
      doorRef.current.rotation.y = Math.sin(t * 0.5) * 0.05;
    }
  });

  return (
    <group>
      {/* Main barn */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[5, 3, 4]} />
        <meshStandardMaterial color="#8B6914" />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 3.3, 0]} castShadow>
        <boxGeometry args={[5.5, 0.3, 4.5]} />
        <meshStandardMaterial color="#5B3A29" />
      </mesh>
      <mesh position={[0, 3.8, 0]} castShadow>
        <boxGeometry args={[4.5, 0.3, 3.5]} />
        <meshStandardMaterial color="#5B3A29" />
      </mesh>
      {/* Stall doors (3 stalls) */}
      {[-1.5, 0, 1.5].map((x, i) => (
        <group key={i}>
          <mesh position={[x, 0.75, 2.01]}>
            <boxGeometry args={[1.2, 1.5, 0.1]} />
            <meshStandardMaterial color="#5D3A1A" />
          </mesh>
          {/* Half-door (lower) */}
          {i === 1 ? (
            <group ref={doorRef} position={[x - 0.6, 0.4, 2.05]}>
              <mesh position={[0.6, 0, 0]}>
                <boxGeometry args={[1.2, 0.8, 0.05]} />
                <meshStandardMaterial color="#4A2A0A" />
              </mesh>
            </group>
          ) : (
            <mesh position={[x, 0.4, 2.05]}>
              <boxGeometry args={[1.2, 0.8, 0.05]} />
              <meshStandardMaterial color="#4A2A0A" />
            </mesh>
          )}
        </group>
      ))}
      {/* Hay bales */}
      <mesh position={[2.8, 0.4, 0]} castShadow>
        <boxGeometry args={[0.8, 0.8, 1.2]} />
        <meshStandardMaterial color="#DAA520" />
      </mesh>
      <mesh position={[2.8, 1.1, 0]} castShadow>
        <boxGeometry args={[0.7, 0.6, 1]} />
        <meshStandardMaterial color="#DAA520" />
      </mesh>
      {/* Fence */}
      {[0, 1.5, 3].map((x, i) => (
        <mesh key={i} position={[-2.5 + x, 0.4, 3]} castShadow>
          <boxGeometry args={[0.1, 0.8, 0.1]} />
          <meshStandardMaterial color="#6B4226" />
        </mesh>
      ))}
      <mesh position={[-1, 0.5, 3]} castShadow>
        <boxGeometry args={[3.5, 0.1, 0.1]} />
        <meshStandardMaterial color="#6B4226" />
      </mesh>
    </group>
  );
}
