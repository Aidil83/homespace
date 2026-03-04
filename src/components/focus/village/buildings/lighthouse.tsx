"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Lighthouse({ timerState }: { timerState?: string }) {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (lightRef.current) {
      const t = state.clock.elapsedTime;
      // Rotating beacon effect
      const intensity = timerState === "break" ? 3 + Math.sin(t * 2) * 1.5 : 1;
      lightRef.current.intensity = intensity;
    }
  });

  return (
    <group>
      {/* Base - wider stone foundation */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2, 2.5, 1, 8]} />
        <meshStandardMaterial color="#7F8C8D" />
      </mesh>
      {/* Tower - tapering cylinder */}
      <mesh position={[0, 3.5, 0]} castShadow>
        <cylinderGeometry args={[1, 1.5, 5, 8]} />
        <meshStandardMaterial color="#E8E0D0" />
      </mesh>
      {/* Red stripe */}
      <mesh position={[0, 3.5, 0]}>
        <cylinderGeometry args={[1.25, 1.25, 0.6, 8]} />
        <meshStandardMaterial color="#C0392B" />
      </mesh>
      {/* Observation deck */}
      <mesh position={[0, 6.2, 0]} castShadow>
        <cylinderGeometry args={[1.5, 1.3, 0.5, 8]} />
        <meshStandardMaterial color="#5A6566" />
      </mesh>
      {/* Lamp room */}
      <mesh position={[0, 6.8, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.8, 8]} />
        <meshStandardMaterial color="#FFD700" transparent opacity={0.6} emissive="#FFD700" emissiveIntensity={0.4} />
      </mesh>
      {/* Dome top */}
      <mesh position={[0, 7.4, 0]} castShadow>
        <sphereGeometry args={[0.7, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#2C3E50" />
      </mesh>
      {/* Light */}
      <pointLight
        ref={lightRef}
        position={[0, 6.8, 0]}
        color="#FFD700"
        intensity={1}
        distance={30}
      />
      {/* Door */}
      <mesh position={[0, 0.6, 2.01]}>
        <boxGeometry args={[0.8, 1.2, 0.1]} />
        <meshStandardMaterial color="#5D3A1A" />
      </mesh>
    </group>
  );
}
