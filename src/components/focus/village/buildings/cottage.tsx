"use client";

export function Cottage() {
  return (
    <group>
      {/* Base walls */}
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 2, 2.5]} />
        <meshStandardMaterial color="#D4A76A" />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <coneGeometry args={[2.3, 1.5, 4]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Door */}
      <mesh position={[0, 0.6, 1.26]}>
        <boxGeometry args={[0.7, 1.2, 0.05]} />
        <meshStandardMaterial color="#5C3317" />
      </mesh>

      {/* Window left */}
      <mesh position={[-0.8, 1.2, 1.26]}>
        <boxGeometry args={[0.5, 0.5, 0.05]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.6} />
      </mesh>

      {/* Window right */}
      <mesh position={[0.8, 1.2, 1.26]}>
        <boxGeometry args={[0.5, 0.5, 0.05]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.6} />
      </mesh>

      {/* Chimney */}
      <mesh position={[1, 2.8, -0.5]} castShadow>
        <boxGeometry args={[0.5, 1, 0.5]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
    </group>
  );
}
