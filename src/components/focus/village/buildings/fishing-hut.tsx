"use client";

export function FishingHut() {
  return (
    <group>
      {/* Hut body */}
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 1.8, 2]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
      {/* Thatched roof */}
      <mesh position={[0, 2.2, 0]} castShadow>
        <coneGeometry args={[2, 1.2, 4]} />
        <meshStandardMaterial color="#DAA520" />
      </mesh>
      {/* Door */}
      <mesh position={[0, 0.6, 1.01]}>
        <boxGeometry args={[0.7, 1.2, 0.1]} />
        <meshStandardMaterial color="#5D3A1A" />
      </mesh>
      {/* Fishing rod (leaning against wall) */}
      <mesh position={[1.4, 1.5, 0.5]} rotation={[0.3, 0, 0.15]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 3, 4]} />
        <meshStandardMaterial color="#8B6914" />
      </mesh>
      {/* Net hanging */}
      <mesh position={[-1.3, 1.2, 0]} rotation={[0, 0, 0.2]}>
        <planeGeometry args={[1, 1.5]} />
        <meshStandardMaterial color="#C4A882" transparent opacity={0.5} side={2} />
      </mesh>
      {/* Barrel */}
      <mesh position={[1.5, 0.4, -0.5]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.8, 8]} />
        <meshStandardMaterial color="#6B4226" />
      </mesh>
    </group>
  );
}
