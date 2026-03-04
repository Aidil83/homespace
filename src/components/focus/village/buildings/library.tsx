"use client";

export function Library() {
  return (
    <group>
      {/* Main building */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 3, 3.5]} />
        <meshStandardMaterial color="#D4C4A8" />
      </mesh>
      {/* Peaked roof */}
      <mesh position={[0, 3.5, 0]} castShadow>
        <coneGeometry args={[3, 2, 4]} />
        <meshStandardMaterial color="#5B3A29" />
      </mesh>
      {/* Door */}
      <mesh position={[0, 0.75, 1.76]}>
        <boxGeometry args={[1, 1.5, 0.1]} />
        <meshStandardMaterial color="#6B4226" />
      </mesh>
      {/* Windows with book-like details */}
      {[-1.2, 1.2].map((x, i) => (
        <mesh key={i} position={[x, 1.8, 1.76]}>
          <boxGeometry args={[0.6, 0.8, 0.1]} />
          <meshStandardMaterial color="#4A90D9" transparent opacity={0.6} />
        </mesh>
      ))}
      {/* Side windows */}
      {[-1.2, 1.2].map((z, i) => (
        <mesh key={`side-${i}`} position={[2.01, 1.8, z]}>
          <boxGeometry args={[0.1, 0.8, 0.6]} />
          <meshStandardMaterial color="#4A90D9" transparent opacity={0.6} />
        </mesh>
      ))}
      {/* Steps */}
      <mesh position={[0, 0.15, 2.1]} castShadow>
        <boxGeometry args={[1.8, 0.3, 0.8]} />
        <meshStandardMaterial color="#9B9B9B" />
      </mesh>
      {/* Bookshelf visible through window (decorative) */}
      <mesh position={[-1.8, 1.5, 0]}>
        <boxGeometry args={[0.3, 2.5, 2]} />
        <meshStandardMaterial color="#8B6914" />
      </mesh>
    </group>
  );
}
