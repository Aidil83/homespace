"use client";

export function Dock() {
  return (
    <group>
      {/* Main dock platform */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[5, 0.2, 3]} />
        <meshStandardMaterial color="#8B6914" />
      </mesh>
      {/* Dock planks detail */}
      {[-2, -1, 0, 1, 2].map((x, i) => (
        <mesh key={i} position={[x, 0.41, 0]}>
          <boxGeometry args={[0.03, 0.01, 3]} />
          <meshStandardMaterial color="#6B500E" />
        </mesh>
      ))}
      {/* Support pillars */}
      {[[-2, -1], [2, -1], [-2, 1], [2, 1], [0, 0]].map(([x, z], i) => (
        <mesh key={i} position={[x, -0.3, z]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 1, 6]} />
          <meshStandardMaterial color="#5D3A1A" />
        </mesh>
      ))}
      {/* Mooring posts */}
      <mesh position={[-2.3, 0.6, -1]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.8, 6]} />
        <meshStandardMaterial color="#5D3A1A" />
      </mesh>
      <mesh position={[2.3, 0.6, -1]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.8, 6]} />
        <meshStandardMaterial color="#5D3A1A" />
      </mesh>
      {/* Small boat */}
      <group position={[0, 0.1, -2]} rotation={[0, 0.3, 0]}>
        {/* Hull */}
        <mesh castShadow>
          <boxGeometry args={[1, 0.4, 2.5]} />
          <meshStandardMaterial color="#6B4226" />
        </mesh>
        {/* Bow (front taper) */}
        <mesh position={[0, 0, -1.5]} castShadow>
          <coneGeometry args={[0.5, 1, 4]} />
          <meshStandardMaterial color="#6B4226" />
        </mesh>
        {/* Mast */}
        <mesh position={[0, 1.2, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 2, 4]} />
          <meshStandardMaterial color="#5D3A1A" />
        </mesh>
      </group>
      {/* Crates */}
      <mesh position={[1.5, 0.6, 0.5]} castShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
      <mesh position={[1.8, 0.6, 0]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#6B4226" />
      </mesh>
    </group>
  );
}
