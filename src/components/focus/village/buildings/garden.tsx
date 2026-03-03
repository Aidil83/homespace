"use client";

const FLOWER_COLORS = ["#FF6B9D", "#FFD93D", "#FF8C42", "#C77DFF", "#FF5757", "#72EFDD"];

export function Garden() {
  return (
    <group>
      {/* Garden bed */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <boxGeometry args={[3.5, 0.2, 3]} />
        <meshStandardMaterial color="#3D2B1F" />
      </mesh>

      {/* Flowers in rows */}
      {FLOWER_COLORS.map((color, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        const x = (col - 1) * 1.1;
        const z = (row - 0.5) * 1.1;
        return (
          <group key={i} position={[x, 0.2, z]}>
            {/* Stem */}
            <mesh position={[0, 0.4, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.8, 4]} />
              <meshStandardMaterial color="#2D8A4E" />
            </mesh>
            {/* Flower head */}
            <mesh position={[0, 0.85, 0]}>
              <sphereGeometry args={[0.2, 6, 6]} />
              <meshStandardMaterial color={color} />
            </mesh>
          </group>
        );
      })}

      {/* Fence corners */}
      {[[-1.9, -1.6], [1.9, -1.6], [-1.9, 1.6], [1.9, 1.6]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.3, z]}>
          <boxGeometry args={[0.08, 0.6, 0.08]} />
          <meshStandardMaterial color="#D4A76A" />
        </mesh>
      ))}

      {/* Fence rails */}
      <mesh position={[0, 0.3, -1.6]}>
        <boxGeometry args={[3.9, 0.06, 0.06]} />
        <meshStandardMaterial color="#D4A76A" />
      </mesh>
      <mesh position={[0, 0.3, 1.6]}>
        <boxGeometry args={[3.9, 0.06, 0.06]} />
        <meshStandardMaterial color="#D4A76A" />
      </mesh>
    </group>
  );
}
