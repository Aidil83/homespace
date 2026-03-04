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
  hemiSkyColor: string;
  hemiGroundColor: string;
  hemiIntensity: number;
  fillIntensity: number;
  fogDensity: number;
}> = {
  idle: {
    ambient: 0.35, sunColor: "#ffffff", sunIntensity: 0.8, skyColor: "#b0dae8",
    hemiSkyColor: "#87CEEB", hemiGroundColor: "#4a7c3f", hemiIntensity: 0.4,
    fillIntensity: 0.12, fogDensity: 0.004,
  },
  focusing: {
    ambient: 0.4, sunColor: "#FDB813", sunIntensity: 1.0, skyColor: "#8ec5d6",
    hemiSkyColor: "#FDB813", hemiGroundColor: "#8B6914", hemiIntensity: 0.5,
    fillIntensity: 0.15, fogDensity: 0.003,
  },
  paused: {
    ambient: 0.3, sunColor: "#E8751A", sunIntensity: 0.6, skyColor: "#E8836B",
    hemiSkyColor: "#E8836B", hemiGroundColor: "#5D3A1A", hemiIntensity: 0.35,
    fillIntensity: 0.09, fogDensity: 0.006,
  },
  break: {
    ambient: 0.15, sunColor: "#6B8FC7", sunIntensity: 0.3, skyColor: "#0F1B3D",
    hemiSkyColor: "#1A2550", hemiGroundColor: "#0A0F20", hemiIntensity: 0.15,
    fillIntensity: 0.045, fogDensity: 0.008,
  },
};

export function DayNightCycle({ timerState }: DayNightCycleProps) {
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const directionalRef = useRef<THREE.DirectionalLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);
  const fillRef = useRef<THREE.DirectionalLight>(null);
  const target = LIGHTING[timerState] || LIGHTING.idle;

  const currentAmbient = useRef(target.ambient);
  const currentSunIntensity = useRef(target.sunIntensity);
  const currentSunColor = useRef(new THREE.Color(target.sunColor));
  const currentHemiIntensity = useRef(target.hemiIntensity);
  const currentHemiSky = useRef(new THREE.Color(target.hemiSkyColor));
  const currentHemiGround = useRef(new THREE.Color(target.hemiGroundColor));
  const currentFillIntensity = useRef(target.fillIntensity);
  const currentFogDensity = useRef(target.fogDensity);

  useFrame((state, delta) => {
    const lerpSpeed = 1.5 * delta;

    // Lerp ambient
    currentAmbient.current = THREE.MathUtils.lerp(currentAmbient.current, target.ambient, lerpSpeed);
    if (ambientRef.current) {
      ambientRef.current.intensity = currentAmbient.current;
    }

    // Lerp directional (sun) light
    currentSunIntensity.current = THREE.MathUtils.lerp(currentSunIntensity.current, target.sunIntensity, lerpSpeed);
    currentSunColor.current.lerp(new THREE.Color(target.sunColor), lerpSpeed);
    if (directionalRef.current) {
      directionalRef.current.intensity = currentSunIntensity.current;
      directionalRef.current.color.copy(currentSunColor.current);
    }

    // Lerp hemisphere light
    currentHemiIntensity.current = THREE.MathUtils.lerp(currentHemiIntensity.current, target.hemiIntensity, lerpSpeed);
    currentHemiSky.current.lerp(new THREE.Color(target.hemiSkyColor), lerpSpeed);
    currentHemiGround.current.lerp(new THREE.Color(target.hemiGroundColor), lerpSpeed);
    if (hemiRef.current) {
      hemiRef.current.intensity = currentHemiIntensity.current;
      hemiRef.current.color.copy(currentHemiSky.current);
      hemiRef.current.groundColor.copy(currentHemiGround.current);
    }

    // Lerp fill light
    currentFillIntensity.current = THREE.MathUtils.lerp(currentFillIntensity.current, target.fillIntensity, lerpSpeed);
    if (fillRef.current) {
      fillRef.current.intensity = currentFillIntensity.current;
    }

    // Lerp fog density
    currentFogDensity.current = THREE.MathUtils.lerp(currentFogDensity.current, target.fogDensity, lerpSpeed);
    const fog = state.scene.fog;
    if (fog instanceof THREE.FogExp2) {
      fog.density = currentFogDensity.current;
    }

    // Update fog color
    const targetFog = new THREE.Color(target.skyColor);
    if (fog instanceof THREE.FogExp2) {
      fog.color.lerp(targetFog, lerpSpeed);
    } else if (fog instanceof THREE.Fog) {
      fog.color.lerp(targetFog, lerpSpeed);
    }
    state.scene.background = fog ? fog.color.clone() : targetFog;
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
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={150}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        shadow-bias={-0.001}
        shadow-normalBias={0.02}
      />
      <hemisphereLight
        ref={hemiRef}
        args={[target.hemiSkyColor, target.hemiGroundColor, target.hemiIntensity]}
      />
      <directionalLight
        ref={fillRef}
        position={[-15, 10, -8]}
        intensity={target.fillIntensity}
        color="#ffffff"
      />
      {timerState === "break" && <Stars radius={100} depth={50} count={2000} factor={4} fade />}
    </>
  );
}
