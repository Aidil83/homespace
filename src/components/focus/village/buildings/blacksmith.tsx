"use client";

interface BlacksmithProps {
  timerState?: string;
}

export function Blacksmith({ timerState }: BlacksmithProps) {
  const isNight = timerState === "break";

  return (
    <group>
      {/* Main building */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 2.4, 2.5]} />
        <meshStandardMaterial color="#6B6B6B" />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 2.8, 0]} castShadow>
        <coneGeometry args={[2.3, 1.2, 4]} />
        <meshStandardMaterial color="#4A4A4A" />
      </mesh>

      {/* Open forge area */}
      <mesh position={[-1.8, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 1.2, 2]} />
        <meshStandardMaterial color="#5C3317" />
      </mesh>

      {/* Forge fire glow */}
      <pointLight
        position={[-1.8, 1, 0]}
        color="#FF4500"
        intensity={isNight ? 3 : 1.5}
        distance={6}
      />

      {/* Forge ember block */}
      <mesh position={[-1.8, 0.8, 0]}>
        <boxGeometry args={[0.6, 0.3, 0.6]} />
        <meshStandardMaterial color="#FF4500" emissive="#FF4500" emissiveIntensity={0.8} />
      </mesh>

      {/* Anvil */}
      <mesh position={[0, 0.3, 1.5]} castShadow>
        <boxGeometry args={[0.8, 0.6, 0.5]} />
        <meshStandardMaterial color="#3A3A3A" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Chimney */}
      <mesh position={[-1.8, 2.5, 0]} castShadow>
        <boxGeometry args={[0.6, 2, 0.6]} />
        <meshStandardMaterial color="#4A4A4A" />
      </mesh>
    </group>
  );
}
