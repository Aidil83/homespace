"use client";

import { useMemo } from "react";
import type { VillageBuilding } from "@/lib/village/types";

interface GroundProps {
  buildings: VillageBuilding[];
}

export function Ground({ buildings }: GroundProps) {
  const paths = useMemo(() => {
    return buildings.map((b) => {
      const dx = b.positionX;
      const dz = b.positionZ;
      const len = Math.sqrt(dx * dx + dz * dz);
      const angle = Math.atan2(dx, dz);
      return { x: dx / 2, z: dz / 2, length: len, rotation: angle };
    });
  }, [buildings]);

  return (
    <group>
      {/* Main ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#4a7c3f" />
      </mesh>

      {/* Subtle grid texture layer */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[6, 32]} />
        <meshStandardMaterial color="#5a8c4f" />
      </mesh>

      {/* Paths from buildings to center */}
      {paths.map((p, i) => (
        <mesh
          key={i}
          position={[p.x, 0.01, p.z]}
          rotation={[-Math.PI / 2, 0, -p.rotation]}
        >
          <planeGeometry args={[1.2, p.length]} />
          <meshStandardMaterial color="#8B7355" />
        </mesh>
      ))}
    </group>
  );
}
