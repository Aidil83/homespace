"use client";

export function Market() {
  return (
    <group>
      {/* Counter/stall base */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.5, 1, 2]} />
        <meshStandardMaterial color="#D4A76A" />
      </mesh>

      {/* Canopy poles */}
      {[[-1.5, -0.8], [1.5, -0.8], [-1.5, 0.8], [1.5, 0.8]].map(([x, z], i) => (
        <mesh key={i} position={[x, 1.8, z]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 2.6, 6]} />
          <meshStandardMaterial color="#5C3317" />
        </mesh>
      ))}

      {/* Canopy fabric */}
      <mesh position={[0, 3.1, 0]} castShadow>
        <boxGeometry args={[3.8, 0.1, 2.2]} />
        <meshStandardMaterial color="#C0392B" />
      </mesh>
      {/* Canopy stripes */}
      <mesh position={[0, 3.16, 0]}>
        <boxGeometry args={[3.8, 0.02, 0.6]} />
        <meshStandardMaterial color="#E8E8E8" />
      </mesh>

      {/* Goods on counter */}
      {[-0.8, 0, 0.8].map((x, i) => (
        <mesh key={i} position={[x, 1.15, 0.3]}>
          <boxGeometry args={[0.5, 0.3, 0.4]} />
          <meshStandardMaterial color={["#F4A460", "#8B4513", "#DAA520"][i]} />
        </mesh>
      ))}
    </group>
  );
}
