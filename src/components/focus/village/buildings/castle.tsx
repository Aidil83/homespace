"use client";

export function Castle() {
  return (
    <group>
      {/* Main keep */}
      <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[5, 5, 5]} />
        <meshStandardMaterial color="#7F8C8D" />
      </mesh>
      {/* Corner towers */}
      {[[-2.5, -2.5], [2.5, -2.5], [-2.5, 2.5], [2.5, 2.5]].map(([x, z], i) => (
        <group key={i}>
          <mesh position={[x, 3.5, z]} castShadow>
            <cylinderGeometry args={[1, 1.2, 7, 8]} />
            <meshStandardMaterial color="#6B7778" />
          </mesh>
          {/* Tower top */}
          <mesh position={[x, 7.5, z]} castShadow>
            <coneGeometry args={[1.3, 1.5, 8]} />
            <meshStandardMaterial color="#2C3E50" />
          </mesh>
          {/* Crenellations */}
          {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, j) => (
            <mesh key={j} position={[
              x + Math.cos(angle) * 0.8,
              6.8,
              z + Math.sin(angle) * 0.8,
            ]} castShadow>
              <boxGeometry args={[0.3, 0.4, 0.3]} />
              <meshStandardMaterial color="#5A6566" />
            </mesh>
          ))}
        </group>
      ))}
      {/* Main gate */}
      <mesh position={[0, 1.2, 2.51]}>
        <boxGeometry args={[2, 2.4, 0.1]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Gate arch */}
      <mesh position={[0, 2.7, 2.51]}>
        <boxGeometry args={[2.4, 0.4, 0.15]} />
        <meshStandardMaterial color="#5A6566" />
      </mesh>
      {/* Main crenellations */}
      {[-2, -1, 0, 1, 2].map((x, i) => (
        <mesh key={i} position={[x, 5.3, 2.5]} castShadow>
          <boxGeometry args={[0.5, 0.6, 0.3]} />
          <meshStandardMaterial color="#6B7778" />
        </mesh>
      ))}
      {/* Banner */}
      <mesh position={[0, 6, 2.6]}>
        <planeGeometry args={[0.8, 1.2]} />
        <meshStandardMaterial color="#C0392B" side={2} />
      </mesh>
      {/* Banner pole */}
      <mesh position={[0, 7, 2.6]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 2, 4]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
}
