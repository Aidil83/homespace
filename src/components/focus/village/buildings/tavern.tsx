"use client";

interface TavernProps {
  timerState?: string;
}

export function Tavern({ timerState }: TavernProps) {
  const isNight = timerState === "break";
  const windowEmissive = isNight ? 0.8 : 0.2;

  return (
    <group>
      {/* Main building - wider */}
      <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 2.6, 3]} />
        <meshStandardMaterial color="#8B6914" />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 3.1, 0]} castShadow rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[3.2, 1.5, 4]} />
        <meshStandardMaterial color="#5C3317" />
      </mesh>

      {/* Door */}
      <mesh position={[0, 0.7, 1.51]}>
        <boxGeometry args={[1, 1.4, 0.05]} />
        <meshStandardMaterial color="#3D2B1F" />
      </mesh>

      {/* Warm windows */}
      {[[-1.2, 1.5, 1.51], [1.2, 1.5, 1.51], [-1.2, 1.5, -1.51], [1.2, 1.5, -1.51]].map(
        ([x, y, z], i) => (
          <mesh key={i} position={[x, y, z]}>
            <boxGeometry args={[0.6, 0.6, 0.05]} />
            <meshStandardMaterial
              color="#FDB813"
              emissive="#FDB813"
              emissiveIntensity={windowEmissive}
              transparent
              opacity={0.7}
            />
          </mesh>
        )
      )}

      {/* Warm light from windows at night */}
      {isNight && (
        <pointLight position={[0, 1.5, 2]} color="#FDB813" intensity={2} distance={8} />
      )}

      {/* Sign */}
      <mesh position={[2.1, 2, 0]} castShadow>
        <boxGeometry args={[0.1, 0.8, 0.6]} />
        <meshStandardMaterial color="#5C3317" />
      </mesh>

      {/* Barrel */}
      <mesh position={[2.2, 0.4, 1]} castShadow>
        <cylinderGeometry args={[0.3, 0.35, 0.8, 8]} />
        <meshStandardMaterial color="#5C3317" />
      </mesh>
    </group>
  );
}
