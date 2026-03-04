"use client";
/* eslint-disable react-hooks/purity */

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface HorseMeshProps {
  walkingRef: React.RefObject<boolean>;
}

export function HorseMesh({ walkingRef }: HorseMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const legRefs = useRef<(THREE.Mesh | null)[]>([]);
  const headRef = useRef<THREE.Mesh>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const phaseRef = useRef(Math.random() * Math.PI * 2);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const walking = walkingRef.current;
    phaseRef.current += walking ? 0.15 : 0.02;

    // Leg animation
    const swing = walking ? Math.sin(phaseRef.current) * 0.4 : 0;
    if (legRefs.current[0]) legRefs.current[0].rotation.x = swing;
    if (legRefs.current[1]) legRefs.current[1].rotation.x = -swing;
    if (legRefs.current[2]) legRefs.current[2].rotation.x = -swing;
    if (legRefs.current[3]) legRefs.current[3].rotation.x = swing;

    // Head bob (grazing when not walking)
    if (headRef.current) {
      if (walking) {
        headRef.current.rotation.x = Math.sin(t * 3) * 0.1;
      } else {
        // Grazing - head dips down
        headRef.current.rotation.x = 0.3 + Math.sin(t * 0.5) * 0.1;
      }
    }

    // Tail wag
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(t * 2) * 0.2;
    }
  });

  return (
    <group ref={groupRef} scale={0.7}>
      {/* Body */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[0.8, 0.7, 1.6]} />
        <meshStandardMaterial color="#6B4226" />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.3, -0.7]} rotation={[0.5, 0, 0]} castShadow>
        <boxGeometry args={[0.35, 0.8, 0.35]} />
        <meshStandardMaterial color="#6B4226" />
      </mesh>

      {/* Head */}
      <mesh ref={headRef} position={[0, 1.6, -1]} castShadow>
        <boxGeometry args={[0.3, 0.35, 0.6]} />
        <meshStandardMaterial color="#6B4226" />
      </mesh>

      {/* Ears */}
      {[-0.1, 0.1].map((x, i) => (
        <mesh key={i} position={[x, 1.85, -0.9]}>
          <coneGeometry args={[0.04, 0.15, 4]} />
          <meshStandardMaterial color="#5D3A1A" />
        </mesh>
      ))}

      {/* Mane */}
      <mesh position={[0, 1.45, -0.5]} castShadow>
        <boxGeometry args={[0.1, 0.3, 0.8]} />
        <meshStandardMaterial color="#2C2C2C" />
      </mesh>

      {/* Front legs */}
      <mesh ref={(el) => { legRefs.current[0] = el; }} position={[-0.25, 0.35, -0.55]} castShadow>
        <boxGeometry args={[0.2, 0.7, 0.2]} />
        <meshStandardMaterial color="#6B4226" />
      </mesh>
      <mesh ref={(el) => { legRefs.current[1] = el; }} position={[0.25, 0.35, -0.55]} castShadow>
        <boxGeometry args={[0.2, 0.7, 0.2]} />
        <meshStandardMaterial color="#6B4226" />
      </mesh>

      {/* Back legs */}
      <mesh ref={(el) => { legRefs.current[2] = el; }} position={[-0.25, 0.35, 0.55]} castShadow>
        <boxGeometry args={[0.2, 0.7, 0.2]} />
        <meshStandardMaterial color="#6B4226" />
      </mesh>
      <mesh ref={(el) => { legRefs.current[3] = el; }} position={[0.25, 0.35, 0.55]} castShadow>
        <boxGeometry args={[0.2, 0.7, 0.2]} />
        <meshStandardMaterial color="#6B4226" />
      </mesh>

      {/* Tail */}
      <mesh ref={tailRef} position={[0, 1, 0.95]} rotation={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.06, 0.5, 0.06]} />
        <meshStandardMaterial color="#2C2C2C" />
      </mesh>

      {/* Hooves */}
      {[[-0.25, -0.55], [0.25, -0.55], [-0.25, 0.55], [0.25, 0.55]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.02, z]}>
          <boxGeometry args={[0.22, 0.04, 0.22]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      ))}
    </group>
  );
}
