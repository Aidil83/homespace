"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const BOTTLE_COLORS = ["#FF6347", "#4169E1", "#32CD32"] as const;

export function Apothecary() {
  const bottle0Ref = useRef<THREE.Mesh>(null);
  const bottle1Ref = useRef<THREE.Mesh>(null);
  const bottle2Ref = useRef<THREE.Mesh>(null);
  const bottlesRef = useRef([bottle0Ref, bottle1Ref, bottle2Ref]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    bottlesRef.current.forEach((ref, i) => {
      if (ref.current) {
        const mat = ref.current.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 0.3 + Math.sin(t * 2 + i * 2) * 0.15;
      }
    });
  });

  return (
    <group>
      {/* Main building */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 2.4, 2.8]} />
        <meshStandardMaterial color="#4A6741" />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 2.8, 0]} castShadow>
        <coneGeometry args={[2.5, 1.5, 4]} />
        <meshStandardMaterial color="#2C3E50" />
      </mesh>
      {/* Door */}
      <mesh position={[0, 0.7, 1.41]}>
        <boxGeometry args={[0.9, 1.4, 0.1]} />
        <meshStandardMaterial color="#5D3A1A" />
      </mesh>
      {/* Window with potion display */}
      <mesh position={[-1, 1.5, 1.41]}>
        <boxGeometry args={[0.6, 0.6, 0.1]} />
        <meshStandardMaterial color="#7B68EE" transparent opacity={0.5} emissive="#7B68EE" emissiveIntensity={0.2} />
      </mesh>
      {/* Herb garden (front) */}
      <mesh position={[0, 0.05, 2.2]} receiveShadow>
        <boxGeometry args={[2.5, 0.1, 0.8]} />
        <meshStandardMaterial color="#3D5A1A" />
      </mesh>
      {/* Herb plants */}
      {[-0.8, -0.3, 0.2, 0.7].map((x, i) => (
        <mesh key={i} position={[x, 0.3, 2.2]}>
          <coneGeometry args={[0.15, 0.4, 5]} />
          <meshStandardMaterial color={["#228B22", "#32CD32", "#006400", "#9ACD32"][i]} />
        </mesh>
      ))}
      {/* Potion bottles on shelf (side) */}
      {[0.5, 0.8, 1.1].map((y, i) => (
        <mesh
          key={i}
          ref={[bottle0Ref, bottle1Ref, bottle2Ref][i]}
          position={[1.51, y + 0.8, 0]}
        >
          <cylinderGeometry args={[0.08, 0.08, 0.2, 6]} />
          <meshStandardMaterial color={BOTTLE_COLORS[i]} emissive={BOTTLE_COLORS[i]} emissiveIntensity={0.3} />
        </mesh>
      ))}
      {/* Hanging sign */}
      <mesh position={[0, 2.3, 1.6]}>
        <boxGeometry args={[1.2, 0.4, 0.05]} />
        <meshStandardMaterial color="#5D3A1A" />
      </mesh>
    </group>
  );
}
