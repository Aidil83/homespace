"use client";
 

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface FoxMeshProps {
  walkingRef: React.RefObject<boolean>;
}

export function FoxMesh({ walkingRef }: FoxMeshProps) {
  const frontLeftRef = useRef<THREE.Mesh>(null);
  const frontRightRef = useRef<THREE.Mesh>(null);
  const backLeftRef = useRef<THREE.Mesh>(null);
  const backRightRef = useRef<THREE.Mesh>(null);
  const tailRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const walking = walkingRef.current;
    const legSwing = walking ? Math.sin(t * 8) * 0.4 : 0;
    const tailSway = Math.sin(t * (walking ? 4 : 1.5)) * (walking ? 0.3 : 0.1);

    if (frontLeftRef.current) frontLeftRef.current.rotation.x = legSwing;
    if (frontRightRef.current) frontRightRef.current.rotation.x = -legSwing;
    if (backLeftRef.current) backLeftRef.current.rotation.x = -legSwing;
    if (backRightRef.current) backRightRef.current.rotation.x = legSwing;
    if (tailRef.current) tailRef.current.rotation.z = tailSway;
  });

  return (
    <group scale={0.35}>
      {/* Body */}
      <mesh castShadow>
        <boxGeometry args={[0.3, 0.25, 0.5]} />
        <meshLambertMaterial color="#D4752E" />
      </mesh>

      {/* Belly */}
      <mesh position={[0, -0.08, 0]}>
        <boxGeometry args={[0.25, 0.12, 0.4]} />
        <meshLambertMaterial color="#F5DEB3" />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.1, -0.3]} castShadow>
        <sphereGeometry args={[0.18, 6, 6]} />
        <meshLambertMaterial color="#D4752E" />
      </mesh>

      {/* Snout */}
      <mesh position={[0, 0.05, -0.48]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.06, 0.15, 4]} />
        <meshLambertMaterial color="#C06020" />
      </mesh>

      {/* Nose */}
      <mesh position={[0, 0.06, -0.54]}>
        <sphereGeometry args={[0.025, 4, 4]} />
        <meshLambertMaterial color="#1A1A1A" />
      </mesh>

      {/* Left ear */}
      <mesh position={[-0.1, 0.3, -0.28]} rotation={[0, 0, -0.2]}>
        <coneGeometry args={[0.06, 0.15, 4]} />
        <meshLambertMaterial color="#D4752E" />
      </mesh>

      {/* Right ear */}
      <mesh position={[0.1, 0.3, -0.28]} rotation={[0, 0, 0.2]}>
        <coneGeometry args={[0.06, 0.15, 4]} />
        <meshLambertMaterial color="#D4752E" />
      </mesh>

      {/* Tail with white tip */}
      <mesh ref={tailRef} position={[0, 0.1, 0.35]} rotation={[-0.3, 0, 0]} castShadow>
        <coneGeometry args={[0.08, 0.4, 5]} />
        <meshLambertMaterial color="#D4752E" />
      </mesh>
      <mesh position={[0, 0.22, 0.42]}>
        <sphereGeometry args={[0.06, 4, 4]} />
        <meshLambertMaterial color="#FFFAF0" />
      </mesh>

      {/* Legs */}
      <mesh ref={frontLeftRef} position={[-0.1, -0.2, -0.15]}>
        <cylinderGeometry args={[0.03, 0.03, 0.2, 4]} />
        <meshLambertMaterial color="#C06020" />
      </mesh>
      <mesh ref={frontRightRef} position={[0.1, -0.2, -0.15]}>
        <cylinderGeometry args={[0.03, 0.03, 0.2, 4]} />
        <meshLambertMaterial color="#C06020" />
      </mesh>
      <mesh ref={backLeftRef} position={[-0.1, -0.2, 0.15]}>
        <cylinderGeometry args={[0.03, 0.03, 0.2, 4]} />
        <meshLambertMaterial color="#C06020" />
      </mesh>
      <mesh ref={backRightRef} position={[0.1, -0.2, 0.15]}>
        <cylinderGeometry args={[0.03, 0.03, 0.2, 4]} />
        <meshLambertMaterial color="#C06020" />
      </mesh>
    </group>
  );
}
