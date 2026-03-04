"use client";
/* eslint-disable react-hooks/purity */

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface BirdMeshProps {
  walkingRef: React.RefObject<boolean>;
  variant?: string;
}

export function BirdMesh({ walkingRef, variant }: BirdMeshProps) {
  const leftWingRef = useRef<THREE.Mesh>(null);
  const rightWingRef = useRef<THREE.Mesh>(null);
  const phaseRef = useRef(Math.random() * Math.PI * 2);

  const isRed = variant === "red";
  const bodyColor = isRed ? "#C0392B" : "#2C3E50";
  const headColor = isRed ? "#E74C3C" : "#34495E";
  const wingColor = isRed ? "#A93226" : "#34495E";

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const flying = walkingRef.current;
    phaseRef.current += flying ? 0.3 : 0.05;

    const wingAngle = flying
      ? Math.sin(phaseRef.current) * 0.8
      : Math.sin(t * 0.5) * 0.1;

    if (leftWingRef.current) leftWingRef.current.rotation.z = -wingAngle;
    if (rightWingRef.current) rightWingRef.current.rotation.z = wingAngle;
  });

  return (
    <group scale={0.3}>
      {/* Body */}
      <mesh castShadow>
        <sphereGeometry args={[0.3, 6, 6]} />
        <meshLambertMaterial color={bodyColor} />
      </mesh>

      {/* Belly */}
      <mesh position={[0, -0.1, -0.05]}>
        <sphereGeometry args={[0.22, 6, 6]} />
        <meshLambertMaterial color={isRed ? "#E8A090" : "#5D6D7E"} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.2, -0.3]}>
        <sphereGeometry args={[0.18, 6, 6]} />
        <meshLambertMaterial color={headColor} />
      </mesh>

      {/* Beak */}
      <mesh position={[0, 0.15, -0.5]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[0.06, 0.2, 4]} />
        <meshLambertMaterial color="#E67E22" />
      </mesh>

      {/* Eye */}
      <mesh position={[0.1, 0.25, -0.38]}>
        <sphereGeometry args={[0.04, 4, 4]} />
        <meshLambertMaterial color="#fff" />
      </mesh>
      <mesh position={[0.11, 0.25, -0.4]}>
        <sphereGeometry args={[0.02, 4, 4]} />
        <meshLambertMaterial color="#1A1A1A" />
      </mesh>

      {/* Left wing */}
      <mesh ref={leftWingRef} position={[-0.3, 0, 0]}>
        <boxGeometry args={[0.5, 0.05, 0.35]} />
        <meshLambertMaterial color={wingColor} />
      </mesh>

      {/* Right wing */}
      <mesh ref={rightWingRef} position={[0.3, 0, 0]}>
        <boxGeometry args={[0.5, 0.05, 0.35]} />
        <meshLambertMaterial color={wingColor} />
      </mesh>

      {/* Tail feathers */}
      <mesh position={[0, 0.08, 0.35]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[0.2, 0.04, 0.3]} />
        <meshLambertMaterial color={bodyColor} />
      </mesh>
      <mesh position={[-0.08, 0.1, 0.4]} rotation={[-0.3, 0.15, 0]}>
        <boxGeometry args={[0.1, 0.03, 0.2]} />
        <meshLambertMaterial color={wingColor} />
      </mesh>
      <mesh position={[0.08, 0.1, 0.4]} rotation={[-0.3, -0.15, 0]}>
        <boxGeometry args={[0.1, 0.03, 0.2]} />
        <meshLambertMaterial color={wingColor} />
      </mesh>
    </group>
  );
}
