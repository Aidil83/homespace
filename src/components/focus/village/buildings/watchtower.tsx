"use client";

interface WatchtowerProps {
  timerState?: string;
}

export function Watchtower({ timerState }: WatchtowerProps) {
  const isNight = timerState === "break";

  return (
    <group>
      {/* Base */}
      <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 1.6, 2.5]} />
        <meshStandardMaterial color="#808080" />
      </mesh>

      {/* Tower shaft */}
      <mesh position={[0, 3.5, 0]} castShadow>
        <boxGeometry args={[1.8, 4, 1.8]} />
        <meshStandardMaterial color="#909090" />
      </mesh>

      {/* Lookout platform */}
      <mesh position={[0, 5.7, 0]} castShadow>
        <boxGeometry args={[2.8, 0.3, 2.8]} />
        <meshStandardMaterial color="#5C3317" />
      </mesh>

      {/* Parapet walls */}
      {[
        [0, 6.2, 1.2],
        [0, 6.2, -1.2],
        [1.2, 6.2, 0],
        [-1.2, 6.2, 0],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <boxGeometry args={i < 2 ? [2.8, 0.7, 0.15] : [0.15, 0.7, 2.8]} />
          <meshStandardMaterial color="#808080" />
        </mesh>
      ))}

      {/* Crenellations (merlons) */}
      {[-1, 0, 1].map((x) =>
        [-1, 0, 1].map((z, j) => {
          if (Math.abs(x) + Math.abs(z) < 2) return null;
          return (
            <mesh key={`${x}${j}`} position={[x * 1.0, 6.7, z * 1.0]}>
              <boxGeometry args={[0.3, 0.3, 0.3]} />
              <meshStandardMaterial color="#808080" />
            </mesh>
          );
        })
      )}

      {/* Torch */}
      <mesh position={[0, 6.5, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.8, 6]} />
        <meshStandardMaterial color="#5C3317" />
      </mesh>

      {/* Torch flame */}
      <mesh position={[0, 7, 0]}>
        <sphereGeometry args={[0.15, 6, 6]} />
        <meshStandardMaterial color="#FF6600" emissive="#FF6600" emissiveIntensity={1} />
      </mesh>

      {/* Torch light */}
      <pointLight
        position={[0, 7, 0]}
        color="#FF8C00"
        intensity={isNight ? 4 : 1.5}
        distance={12}
      />
    </group>
  );
}
