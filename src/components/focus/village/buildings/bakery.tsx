"use client";

export function Bakery() {
  return (
    <group>
      {/* Main building */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.5, 2.4, 3]} />
        <meshStandardMaterial color="#F5DEB3" />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 2.8, 0]} castShadow>
        <boxGeometry args={[4, 0.4, 3.5]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0, 3.4, 0]} castShadow>
        <boxGeometry args={[3.2, 0.4, 2.8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Chimney */}
      <mesh position={[1.2, 3.8, -0.5]} castShadow>
        <boxGeometry args={[0.6, 1.2, 0.6]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
      {/* Door */}
      <mesh position={[0, 0.7, 1.51]}>
        <boxGeometry args={[1, 1.4, 0.1]} />
        <meshStandardMaterial color="#6B4226" />
      </mesh>
      {/* Display window (large) */}
      <mesh position={[-1, 1.3, 1.51]}>
        <boxGeometry args={[0.8, 0.7, 0.1]} />
        <meshStandardMaterial color="#FFE4B5" emissive="#FFD700" emissiveIntensity={0.15} />
      </mesh>
      {/* Oven (brick structure on side) */}
      <mesh position={[1.76, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.8, 0.8, 1.6, 8]} />
        <meshStandardMaterial color="#CD853F" />
      </mesh>
      {/* Awning */}
      <mesh position={[0, 2.1, 2]} castShadow>
        <boxGeometry args={[3, 0.1, 1]} />
        <meshStandardMaterial color="#D2691E" />
      </mesh>
    </group>
  );
}
