"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

interface DayNightCycleProps {
  timerState: "idle" | "focusing" | "paused" | "break";
}

const LIGHTING: Record<string, {
  ambient: number;
  sunColor: string;
  sunIntensity: number;
  skyColor: string;
}> = {
  idle: { ambient: 0.5, sunColor: "#ffffff", sunIntensity: 0.8, skyColor: "#87CEEB" },
  focusing: { ambient: 0.6, sunColor: "#FDB813", sunIntensity: 1.0, skyColor: "#5B9BD5" },
  paused: { ambient: 0.35, sunColor: "#E8751A", sunIntensity: 0.6, skyColor: "#E8836B" },
  break: { ambient: 0.15, sunColor: "#6B8FC7", sunIntensity: 0.3, skyColor: "#0F1B3D" },
};

export function DayNightCycle({ timerState }: DayNightCycleProps) {
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const directionalRef = useRef<THREE.DirectionalLight>(null);
  const target = LIGHTING[timerState] || LIGHTING.idle;

  const currentAmbient = useRef(target.ambient);
  const currentSunIntensity = useRef(target.sunIntensity);
  const currentSunColor = useRef(new THREE.Color(target.sunColor));

  useFrame((state, delta) => {
    const lerpSpeed = 1.5 * delta;

    // Lerp ambient
    currentAmbient.current = THREE.MathUtils.lerp(currentAmbient.current, target.ambient, lerpSpeed);
    if (ambientRef.current) {
      ambientRef.current.intensity = currentAmbient.current;
    }

    // Lerp directional light
    currentSunIntensity.current = THREE.MathUtils.lerp(currentSunIntensity.current, target.sunIntensity, lerpSpeed);
    currentSunColor.current.lerp(new THREE.Color(target.sunColor), lerpSpeed);
    if (directionalRef.current) {
      directionalRef.current.intensity = currentSunIntensity.current;
      directionalRef.current.color.copy(currentSunColor.current);
    }

    // Update fog color
    const targetFog = new THREE.Color(target.skyColor);
    if (state.scene.fog instanceof THREE.Fog) {
      state.scene.fog.color.lerp(targetFog, lerpSpeed);
    }
    state.scene.background = state.scene.fog instanceof THREE.Fog ? state.scene.fog.color.clone() : targetFog;
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={target.ambient} />
      <directionalLight
        ref={directionalRef}
        position={[20, 30, 10]}
        intensity={target.sunIntensity}
        color={target.sunColor}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      {timerState === "break" && <Stars radius={100} depth={50} count={2000} factor={4} fade />}
    </>
  );
}
