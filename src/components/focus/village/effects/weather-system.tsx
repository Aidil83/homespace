"use client";
/* eslint-disable react-hooks/purity, react-hooks/immutability */

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const SNOW_COUNT = 2000;
const RAIN_COUNT = 800;

interface WeatherSystemProps {
  weather: "clear" | "snow" | "rain";
}

export function WeatherSystem({ weather }: WeatherSystemProps) {
  if (weather === "clear") return null;
  if (weather === "snow") return <SnowSystem />;
  return <RainSystem />;
}

// --- Snow: 800 Points particles ---

function SnowSystem() {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(SNOW_COUNT * 3);
    const vel = new Float32Array(SNOW_COUNT * 3);

    for (let i = 0; i < SNOW_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 100;
      pos[i * 3 + 1] = Math.random() * 35 + 5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 100;

      // Wobble parameters stored as velocity
      vel[i * 3] = Math.random() * Math.PI * 2; // phase X
      vel[i * 3 + 1] = 0.7 + Math.random() * 0.6; // fall speed multiplier
      vel[i * 3 + 2] = Math.random() * Math.PI * 2; // phase Z
    }

    return { positions: pos, velocities: vel };
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < SNOW_COUNT; i++) {
      const i3 = i * 3;
      const phaseX = velocities[i3];
      const speedMul = velocities[i3 + 1];
      const phaseZ = velocities[i3 + 2];

      // Fall + wobble
      arr[i3 + 1] -= 1.5 * speedMul * delta;
      arr[i3] += Math.sin(t * 0.8 + phaseX) * 0.15 * delta;
      arr[i3 + 2] += Math.cos(t * 0.6 + phaseZ) * 0.08 * delta;

      // Reset when below ground
      if (arr[i3 + 1] < -1) {
        arr[i3] = (Math.random() - 0.5) * 100;
        arr[i3 + 1] = 35 + Math.random() * 8;
        arr[i3 + 2] = (Math.random() - 0.5) * 100;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={SNOW_COUNT}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#E8E8F0"
        size={0.8}
        transparent
        opacity={0.9}
        sizeAttenuation
      />
    </points>
  );
}

// --- Rain: InstancedMesh box streaks (voxel consistency) ---

function RainSystem() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    return Array.from({ length: RAIN_COUNT }, () => ({
      x: (Math.random() - 0.5) * 100,
      y: Math.random() * 30 + 5,
      z: (Math.random() - 0.5) * 100,
      speedMul: 0.7 + Math.random() * 0.6,
    }));
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    for (let i = 0; i < RAIN_COUNT; i++) {
      const p = particles[i];
      p.y -= 20 * p.speedMul * delta;
      p.x -= 2 * delta;

      if (p.y < -1) {
        p.x = (Math.random() - 0.5) * 100;
        p.y = 30 + Math.random() * 8;
        p.z = (Math.random() - 0.5) * 100;
      }

      dummy.position.set(p.x, p.y, p.z);
      dummy.scale.set(0.04, 0.7, 0.04);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, RAIN_COUNT]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#6699CC" transparent opacity={0.7} />
    </instancedMesh>
  );
}
