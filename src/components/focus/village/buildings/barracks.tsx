"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Barracks() {
  const flagRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (flagRef.current) {
      const t = state.clock.elapsedTime;
      flagRef.current.rotation.y = Math.sin(t * 3) * 0.15;
      flagRef.current.position.x = 2.5 + Math.sin(t * 2.5) * 0.05;
    }
  });

  return (
    <group>
      {/* Main building */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[5, 3, 3.5]} />
        <meshStandardMaterial color="#6B7778" />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 3.3, 0]} castShadow>
        <boxGeometry args={[5.5, 0.4, 4]} />
        <meshStandardMaterial color="#4A4A4A" />
      </mesh>
      {/* Door */}
      <mesh position={[0, 0.9, 1.76]}>
        <boxGeometry args={[1.4, 1.8, 0.1]} />
        <meshStandardMaterial color="#5D3A1A" />
      </mesh>
      {/* Windows */}
      {[-1.5, 1.5].map((x, i) => (
        <mesh key={i} position={[x, 1.8, 1.76]}>
          <boxGeometry args={[0.5, 0.5, 0.1]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      ))}
      {/* Training dummy */}
      <mesh position={[3.5, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 1.6, 6]} />
        <meshStandardMaterial color="#6B4226" />
      </mesh>
      <mesh position={[3.5, 1.2, 0]} castShadow>
        <sphereGeometry args={[0.25, 6, 6]} />
        <meshStandardMaterial color="#DAA520" />
      </mesh>
      {/* Weapon rack */}
      <mesh position={[-3, 0.8, 0]} castShadow>
        <boxGeometry args={[0.3, 1.6, 1.2]} />
        <meshStandardMaterial color="#5D3A1A" />
      </mesh>
      {/* Spears on rack */}
      {[-0.3, 0, 0.3].map((z, i) => (
        <mesh key={i} position={[-3, 1.2, z]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 2.5, 4]} />
          <meshStandardMaterial color="#888" />
        </mesh>
      ))}
      {/* Flag */}
      <mesh ref={flagRef} position={[2.5, 4, 0]}>
        <planeGeometry args={[0.7, 0.5]} />
        <meshStandardMaterial color="#C0392B" side={2} />
      </mesh>
      <mesh position={[2.5, 4.5, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 1.5, 4]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
}
