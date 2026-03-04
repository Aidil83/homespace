"use client";

export function BridgeBuilding() {
  return (
    <group>
      {/* Bridge deck */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[5, 0.3, 2.5]} />
        <meshStandardMaterial color="#8B6914" />
      </mesh>
      {/* Planks (decorative lines) */}
      {[-2, -1, 0, 1, 2].map((x, i) => (
        <mesh key={i} position={[x, 0.66, 0]}>
          <boxGeometry args={[0.05, 0.02, 2.5]} />
          <meshStandardMaterial color="#6B500E" />
        </mesh>
      ))}
      {/* Railings */}
      <mesh position={[0, 0.9, -1.2]} castShadow>
        <boxGeometry args={[5, 0.5, 0.15]} />
        <meshStandardMaterial color="#6B500E" />
      </mesh>
      <mesh position={[0, 0.9, 1.2]} castShadow>
        <boxGeometry args={[5, 0.5, 0.15]} />
        <meshStandardMaterial color="#6B500E" />
      </mesh>
      {/* Support posts */}
      {[-2, 0, 2].map((x, i) => (
        <group key={i}>
          <mesh position={[x, 0, -1.2]} castShadow>
            <boxGeometry args={[0.2, 1.3, 0.2]} />
            <meshStandardMaterial color="#5A4008" />
          </mesh>
          <mesh position={[x, 0, 1.2]} castShadow>
            <boxGeometry args={[0.2, 1.3, 0.2]} />
            <meshStandardMaterial color="#5A4008" />
          </mesh>
        </group>
      ))}
      {/* Support arches underneath */}
      <mesh position={[-1.5, -0.2, 0]} castShadow>
        <boxGeometry args={[0.3, 1, 0.3]} />
        <meshStandardMaterial color="#7F8C8D" />
      </mesh>
      <mesh position={[1.5, -0.2, 0]} castShadow>
        <boxGeometry args={[0.3, 1, 0.3]} />
        <meshStandardMaterial color="#7F8C8D" />
      </mesh>
    </group>
  );
}
