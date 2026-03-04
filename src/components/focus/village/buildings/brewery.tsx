"use client";

export function Brewery() {
  return (
    <group>
      {/* Main building */}
      <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 2.6, 3.5]} />
        <meshStandardMaterial color="#C4A882" />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 3, 0]} castShadow>
        <boxGeometry args={[4.5, 0.4, 4]} />
        <meshStandardMaterial color="#5B3A29" />
      </mesh>
      <mesh position={[0, 3.5, 0]} castShadow>
        <boxGeometry args={[3.5, 0.3, 3]} />
        <meshStandardMaterial color="#5B3A29" />
      </mesh>
      {/* Large brewing vat (side of building) */}
      <mesh position={[2.5, 1.2, 0]} castShadow>
        <cylinderGeometry args={[1, 1, 2.2, 10]} />
        <meshStandardMaterial color="#8B6914" />
      </mesh>
      {/* Vat bands */}
      <mesh position={[2.5, 0.5, 0]}>
        <torusGeometry args={[1, 0.05, 4, 10]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[2.5, 1.8, 0]}>
        <torusGeometry args={[1, 0.05, 4, 10]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Door */}
      <mesh position={[0, 0.7, 1.76]}>
        <boxGeometry args={[1.2, 1.4, 0.1]} />
        <meshStandardMaterial color="#6B4226" />
      </mesh>
      {/* Barrels */}
      {[[-1.5, 0.3, 2], [-0.8, 0.3, 2.2]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.6, 8]} />
          <meshStandardMaterial color="#5D3A1A" />
        </mesh>
      ))}
      {/* Sign */}
      <mesh position={[0, 2.5, 1.8]}>
        <boxGeometry args={[1.5, 0.5, 0.1]} />
        <meshStandardMaterial color="#5D3A1A" />
      </mesh>
    </group>
  );
}
