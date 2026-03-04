"use client";
 

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface DeerMeshProps {
  walkingRef: React.RefObject<boolean>;
}

export function DeerMesh({ walkingRef }: DeerMeshProps) {
  const frontLeftRef = useRef<THREE.Mesh>(null);
  const frontRightRef = useRef<THREE.Mesh>(null);
  const backLeftRef = useRef<THREE.Mesh>(null);
  const backRightRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const walking = walkingRef.current;
    const legSwing = walking ? Math.sin(t * 6) * 0.35 : 0;
    const headBob = walking ? Math.sin(t * 3) * 0.05 : 0;

    if (frontLeftRef.current) frontLeftRef.current.rotation.x = legSwing;
    if (frontRightRef.current) frontRightRef.current.rotation.x = -legSwing;
    if (backLeftRef.current) backLeftRef.current.rotation.x = -legSwing;
    if (backRightRef.current) backRightRef.current.rotation.x = legSwing;
    if (headRef.current) headRef.current.position.y = 0.6 + headBob;
  });

  return (
    <group scale={0.4}>
      {/* Body */}
      <mesh castShadow>
        <boxGeometry args={[0.35, 0.3, 0.65]} />
        <meshLambertMaterial color="#A0725A" />
      </mesh>

      {/* Spots on body */}
      <mesh position={[0.18, 0.05, -0.1]}>
        <sphereGeometry args={[0.04, 4, 4]} />
        <meshLambertMaterial color="#D4B896" />
      </mesh>
      <mesh position={[-0.15, 0.08, 0.12]}>
        <sphereGeometry args={[0.035, 4, 4]} />
        <meshLambertMaterial color="#D4B896" />
      </mesh>
      <mesh position={[0.12, 0.1, 0.2]}>
        <sphereGeometry args={[0.03, 4, 4]} />
        <meshLambertMaterial color="#D4B896" />
      </mesh>

      {/* Head group */}
      <group ref={headRef} position={[0, 0.6, -0.35]}>
        {/* Head */}
        <mesh castShadow>
          <sphereGeometry args={[0.15, 6, 6]} />
          <meshLambertMaterial color="#A0725A" />
        </mesh>

        {/* Snout */}
        <mesh position={[0, -0.05, -0.15]}>
          <boxGeometry args={[0.1, 0.08, 0.12]} />
          <meshLambertMaterial color="#C4A882" />
        </mesh>

        {/* Left ear */}
        <mesh position={[-0.12, 0.12, 0]} rotation={[0, 0, -0.4]}>
          <coneGeometry args={[0.04, 0.12, 4]} />
          <meshLambertMaterial color="#A0725A" />
        </mesh>

        {/* Right ear */}
        <mesh position={[0.12, 0.12, 0]} rotation={[0, 0, 0.4]}>
          <coneGeometry args={[0.04, 0.12, 4]} />
          <meshLambertMaterial color="#A0725A" />
        </mesh>

        {/* Left antler */}
        <group position={[-0.08, 0.2, 0]}>
          <mesh rotation={[0, 0, -0.3]}>
            <cylinderGeometry args={[0.015, 0.02, 0.25, 4]} />
            <meshLambertMaterial color="#5D3A1A" />
          </mesh>
          {/* Branch */}
          <mesh position={[-0.08, 0.1, 0]} rotation={[0, 0, -0.8]}>
            <cylinderGeometry args={[0.01, 0.015, 0.12, 4]} />
            <meshLambertMaterial color="#5D3A1A" />
          </mesh>
        </group>

        {/* Right antler */}
        <group position={[0.08, 0.2, 0]}>
          <mesh rotation={[0, 0, 0.3]}>
            <cylinderGeometry args={[0.015, 0.02, 0.25, 4]} />
            <meshLambertMaterial color="#5D3A1A" />
          </mesh>
          {/* Branch */}
          <mesh position={[0.08, 0.1, 0]} rotation={[0, 0, 0.8]}>
            <cylinderGeometry args={[0.01, 0.015, 0.12, 4]} />
            <meshLambertMaterial color="#5D3A1A" />
          </mesh>
        </group>
      </group>

      {/* Tail */}
      <mesh position={[0, 0.1, 0.35]}>
        <sphereGeometry args={[0.05, 4, 4]} />
        <meshLambertMaterial color="#FFFAF0" />
      </mesh>

      {/* Legs with hooves */}
      <group>
        <mesh ref={frontLeftRef} position={[-0.12, -0.28, -0.2]}>
          <cylinderGeometry args={[0.03, 0.035, 0.35, 4]} />
          <meshLambertMaterial color="#8B6B50" />
        </mesh>
        <mesh ref={frontRightRef} position={[0.12, -0.28, -0.2]}>
          <cylinderGeometry args={[0.03, 0.035, 0.35, 4]} />
          <meshLambertMaterial color="#8B6B50" />
        </mesh>
        <mesh ref={backLeftRef} position={[-0.12, -0.28, 0.2]}>
          <cylinderGeometry args={[0.03, 0.035, 0.35, 4]} />
          <meshLambertMaterial color="#8B6B50" />
        </mesh>
        <mesh ref={backRightRef} position={[0.12, -0.28, 0.2]}>
          <cylinderGeometry args={[0.03, 0.035, 0.35, 4]} />
          <meshLambertMaterial color="#8B6B50" />
        </mesh>
      </group>
    </group>
  );
}
