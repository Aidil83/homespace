"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import type { VillagerVariant } from "@/lib/village/creatures";

const VARIANT_COLORS: Record<VillagerVariant, { shirt: string; pants: string }> = {
  farmer: { shirt: "#8B6914", pants: "#5C4033" },
  merchant: { shirt: "#6B3FA0", pants: "#3D3D3D" },
  smith: { shirt: "#4A4A4A", pants: "#2F2F2F" },
  monk: { shirt: "#C4A35A", pants: "#8B7355" },
};

const DEFAULT_COLORS = { shirt: "#4A7C59", pants: "#5C4033" };

interface VillagerMeshProps {
  variant?: VillagerVariant;
  walkingRef: React.RefObject<boolean>;
}

export function VillagerMesh({ variant, walkingRef }: VillagerMeshProps) {
  const colors = variant ? VARIANT_COLORS[variant] : DEFAULT_COLORS;
  const leftLegRef = useRef<Mesh>(null);
  const rightLegRef = useRef<Mesh>(null);
  const leftArmRef = useRef<Mesh>(null);
  const rightArmRef = useRef<Mesh>(null);
  const phase = useRef(0);

  useFrame((_, delta) => {
    if (walkingRef.current) phase.current += delta * 8;
    const swing = Math.sin(phase.current) * 0.3;
    const dampedSwing = walkingRef.current ? swing : swing * 0.9;
    if (leftLegRef.current) leftLegRef.current.rotation.x = dampedSwing;
    if (rightLegRef.current) rightLegRef.current.rotation.x = -dampedSwing;
    if (leftArmRef.current) leftArmRef.current.rotation.x = -dampedSwing;
    if (rightArmRef.current) rightArmRef.current.rotation.x = dampedSwing;
  });

  return (
    <group>
      {/* Head */}
      <mesh position={[0, 0.85, 0]}>
        <sphereGeometry args={[0.15, 8, 6]} />
        <meshStandardMaterial color="#FDBCB4" />
      </mesh>

      {/* Body / Shirt */}
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.3, 0.4, 0.2]} />
        <meshStandardMaterial color={colors.shirt} />
      </mesh>

      {/* Left leg */}
      <mesh ref={leftLegRef} position={[-0.08, 0.2, 0]}>
        <boxGeometry args={[0.1, 0.3, 0.1]} />
        <meshStandardMaterial color={colors.pants} />
      </mesh>

      {/* Right leg */}
      <mesh ref={rightLegRef} position={[0.08, 0.2, 0]}>
        <boxGeometry args={[0.1, 0.3, 0.1]} />
        <meshStandardMaterial color={colors.pants} />
      </mesh>

      {/* Left arm */}
      <mesh ref={leftArmRef} position={[-0.22, 0.55, 0]}>
        <boxGeometry args={[0.08, 0.35, 0.08]} />
        <meshStandardMaterial color={colors.shirt} />
      </mesh>

      {/* Right arm */}
      <mesh ref={rightArmRef} position={[0.22, 0.55, 0]}>
        <boxGeometry args={[0.08, 0.35, 0.08]} />
        <meshStandardMaterial color={colors.shirt} />
      </mesh>
    </group>
  );
}
