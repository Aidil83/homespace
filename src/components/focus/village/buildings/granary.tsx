"use client";

export function Granary() {
  return (
    <group>
      {/* Raised platform (stilts) */}
      {[[-1.2, -0.8], [1.2, -0.8], [-1.2, 0.8], [1.2, 0.8]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.5, z]} castShadow>
          <boxGeometry args={[0.25, 1, 0.25]} />
          <meshStandardMaterial color="#5D3A1A" />
        </mesh>
      ))}
      {/* Main storage body */}
      <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 1.6, 2.2]} />
        <meshStandardMaterial color="#DAA520" />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 2.9, 0]} castShadow>
        <boxGeometry args={[3.5, 0.3, 2.7]} />
        <meshStandardMaterial color="#8B6914" />
      </mesh>
      <mesh position={[0, 3.3, 0]} castShadow>
        <boxGeometry args={[2.8, 0.3, 2]} />
        <meshStandardMaterial color="#8B6914" />
      </mesh>
      {/* Door */}
      <mesh position={[0, 1.5, 1.11]}>
        <boxGeometry args={[0.8, 1, 0.1]} />
        <meshStandardMaterial color="#5D3A1A" />
      </mesh>
      {/* Grain sacks nearby */}
      {[[1.8, 0.25, 0.5], [2, 0.25, -0.3]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <sphereGeometry args={[0.3, 6, 6]} />
          <meshStandardMaterial color="#C4A882" />
        </mesh>
      ))}
      {/* Ladder */}
      <mesh position={[-1.6, 1.3, 0]} castShadow>
        <boxGeometry args={[0.1, 2, 0.6]} />
        <meshStandardMaterial color="#6B4226" />
      </mesh>
    </group>
  );
}
