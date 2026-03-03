"use client";

export function Chapel() {
  return (
    <group>
      {/* Main body */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 3, 4]} />
        <meshStandardMaterial color="#E8E8E0" />
      </mesh>

      {/* Main roof */}
      <mesh position={[0, 3.5, 0]} castShadow rotation={[0, Math.PI / 2, 0]}>
        <coneGeometry args={[2.5, 1.5, 4]} />
        <meshStandardMaterial color="#6B6B6B" />
      </mesh>

      {/* Steeple base */}
      <mesh position={[0, 4.5, -1.2]} castShadow>
        <boxGeometry args={[1.2, 1.5, 1.2]} />
        <meshStandardMaterial color="#E8E8E0" />
      </mesh>

      {/* Steeple spire */}
      <mesh position={[0, 6, -1.2]} castShadow>
        <coneGeometry args={[0.6, 2, 4]} />
        <meshStandardMaterial color="#6B6B6B" />
      </mesh>

      {/* Cross */}
      <group position={[0, 7.2, -1.2]}>
        <mesh>
          <boxGeometry args={[0.08, 0.6, 0.08]} />
          <meshStandardMaterial color="#DAA520" />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.4, 0.08, 0.08]} />
          <meshStandardMaterial color="#DAA520" />
        </mesh>
      </group>

      {/* Door arch */}
      <mesh position={[0, 0.8, 2.01]}>
        <boxGeometry args={[0.9, 1.6, 0.05]} />
        <meshStandardMaterial color="#5C3317" />
      </mesh>

      {/* Rose window */}
      <mesh position={[0, 2.3, 2.01]}>
        <circleGeometry args={[0.4, 8]} />
        <meshStandardMaterial color="#4A90D9" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}
