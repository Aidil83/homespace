"use client";

export function Well() {
  return (
    <group>
      {/* Stone base */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1, 1.2, 1, 8]} />
        <meshStandardMaterial color="#808080" />
      </mesh>

      {/* Water inside */}
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.1, 8]} />
        <meshStandardMaterial color="#4A90D9" transparent opacity={0.7} />
      </mesh>

      {/* Left post */}
      <mesh position={[-0.7, 1.5, 0]} castShadow>
        <boxGeometry args={[0.15, 2, 0.15]} />
        <meshStandardMaterial color="#5C3317" />
      </mesh>

      {/* Right post */}
      <mesh position={[0.7, 1.5, 0]} castShadow>
        <boxGeometry args={[0.15, 2, 0.15]} />
        <meshStandardMaterial color="#5C3317" />
      </mesh>

      {/* Crossbar */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <boxGeometry args={[1.7, 0.15, 0.15]} />
        <meshStandardMaterial color="#5C3317" />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 2.9, 0]} castShadow>
        <coneGeometry args={[1.2, 0.7, 4]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Bucket */}
      <mesh position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.2, 0.15, 0.3, 6]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
    </group>
  );
}
