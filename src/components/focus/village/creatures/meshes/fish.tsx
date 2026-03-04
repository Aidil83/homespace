"use client";
/* eslint-disable react-hooks/purity */

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface FishMeshProps {
  walkingRef: React.RefObject<boolean>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function FishMesh({ walkingRef }: FishMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const jumpTimer = useRef(3 + Math.random() * 10);
  const isJumping = useRef(false);
  const jumpTime = useRef(0);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // Tail wag
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(t * 6) * 0.3;
    }

    // Jump animation
    if (!isJumping.current) {
      jumpTimer.current -= delta;
      if (jumpTimer.current <= 0) {
        isJumping.current = true;
        jumpTime.current = 0;
      }
    }

    if (isJumping.current && groupRef.current) {
      jumpTime.current += delta;
      const jumpDuration = 0.6;
      const t = jumpTime.current / jumpDuration;

      if (t >= 1) {
        // Jump done
        isJumping.current = false;
        jumpTimer.current = 3 + Math.random() * 10;
        groupRef.current.position.y = 0;
        groupRef.current.rotation.z = 0;
      } else {
        // Parabolic arc
        const arc = -Math.sin(t * Math.PI) * 1.5;
        groupRef.current.position.y = -arc;
        // Rotate during jump
        groupRef.current.rotation.z = Math.sin(t * Math.PI) * 0.5;
      }
    }
  });

  return (
    <group ref={groupRef} scale={0.3}>
      {/* Body */}
      <mesh castShadow>
        <sphereGeometry args={[0.5, 8, 6]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0, -0.5]}>
        <sphereGeometry args={[0.3, 6, 6]} />
        <meshStandardMaterial color="#D0D0D0" metalness={0.3} />
      </mesh>

      {/* Eye */}
      <mesh position={[0.2, 0.1, -0.6]}>
        <sphereGeometry args={[0.06, 4, 4]} />
        <meshStandardMaterial color="#111" />
      </mesh>

      {/* Tail fin */}
      <mesh ref={tailRef} position={[0, 0, 0.6]}>
        <coneGeometry args={[0.3, 0.5, 4]} />
        <meshStandardMaterial color="#A0A0A0" />
      </mesh>

      {/* Dorsal fin */}
      <mesh position={[0, 0.4, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.15, 0.3, 3]} />
        <meshStandardMaterial color="#B0B0B0" />
      </mesh>
    </group>
  );
}
