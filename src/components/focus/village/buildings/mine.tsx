"use client";

export function Mine() {
  return (
    <group>
      {/* Mine entrance - carved into hill */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 2.4, 2.5]} />
        <meshStandardMaterial color="#5A6566" />
      </mesh>
      {/* Entrance arch */}
      <mesh position={[0, 1, 1.26]}>
        <boxGeometry args={[2, 2, 0.3]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Wooden support beams */}
      <mesh position={[-0.9, 1, 1.3]} castShadow>
        <boxGeometry args={[0.2, 2, 0.2]} />
        <meshStandardMaterial color="#6B4226" />
      </mesh>
      <mesh position={[0.9, 1, 1.3]} castShadow>
        <boxGeometry args={[0.2, 2, 0.2]} />
        <meshStandardMaterial color="#6B4226" />
      </mesh>
      <mesh position={[0, 2.1, 1.3]} castShadow>
        <boxGeometry args={[2, 0.2, 0.2]} />
        <meshStandardMaterial color="#6B4226" />
      </mesh>
      {/* Ore cart */}
      <mesh position={[1.8, 0.3, 1.5]} castShadow>
        <boxGeometry args={[0.8, 0.5, 0.6]} />
        <meshStandardMaterial color="#555" />
      </mesh>
      {/* Cart wheels */}
      <mesh position={[1.5, 0.15, 1.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.05, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[2.1, 0.15, 1.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.05, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Rails */}
      <mesh position={[1.8, 0.05, 0.8]}>
        <boxGeometry args={[0.05, 0.05, 2]} />
        <meshStandardMaterial color="#888" />
      </mesh>
      <mesh position={[2.2, 0.05, 0.8]}>
        <boxGeometry args={[0.05, 0.05, 2]} />
        <meshStandardMaterial color="#888" />
      </mesh>
      {/* Ore pile */}
      <mesh position={[-1.5, 0.3, 1.5]} castShadow>
        <coneGeometry args={[0.6, 0.6, 6]} />
        <meshStandardMaterial color="#4A4A4A" />
      </mesh>
      {/* Lantern */}
      <mesh position={[0, 2.3, 1.4]}>
        <boxGeometry args={[0.15, 0.2, 0.15]} />
        <meshStandardMaterial color="#FFD700" emissive="#FF8C00" emissiveIntensity={0.5} />
      </mesh>
      <pointLight position={[0, 2.3, 1.4]} color="#FF8C00" intensity={1} distance={5} />
    </group>
  );
}
