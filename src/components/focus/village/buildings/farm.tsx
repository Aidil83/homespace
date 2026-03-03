"use client";

export function Farm() {
  return (
    <group>
      {/* Barn */}
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.5, 2, 2.5]} />
        <meshStandardMaterial color="#C0392B" />
      </mesh>

      {/* Barn roof */}
      <mesh position={[0, 2.5, 0]} castShadow rotation={[0, Math.PI / 2, 0]}>
        <coneGeometry args={[2, 1.2, 4]} />
        <meshStandardMaterial color="#7B241C" />
      </mesh>

      {/* Barn door */}
      <mesh position={[0, 0.75, 1.26]}>
        <boxGeometry args={[1.2, 1.5, 0.05]} />
        <meshStandardMaterial color="#5C2018" />
      </mesh>

      {/* Wheat field rows */}
      {[-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2].map((x, i) => (
        <mesh key={i} position={[x, 0.35, -2.5]} castShadow>
          <boxGeometry args={[0.15, 0.7, 0.15]} />
          <meshStandardMaterial color="#DAA520" />
        </mesh>
      ))}

      {/* Fence posts */}
      {[-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map((x, i) => (
        <mesh key={`f${i}`} position={[x, 0.3, -3.2]}>
          <boxGeometry args={[0.1, 0.6, 0.1]} />
          <meshStandardMaterial color="#8B7355" />
        </mesh>
      ))}

      {/* Fence rail */}
      <mesh position={[0, 0.35, -3.2]}>
        <boxGeometry args={[5.2, 0.08, 0.08]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
    </group>
  );
}
