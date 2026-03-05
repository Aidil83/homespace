"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars, Sky } from "@react-three/drei";
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
  sunPosition: [number, number, number];
}> = {
  idle: {
    ambient: 1.0, sunColor: "#FFFFFF", sunIntensity: 2.5, skyColor: "#87CEEB",
    hemiSkyColor: "#87CEEB", hemiGroundColor: "#7BC46A", hemiIntensity: 1.2,
    fillIntensity: 0.5,
    sunPosition: [80, 150, 40],
  },
  focusing: {
    ambient: 1.1, sunColor: "#FFF5D4", sunIntensity: 2.8, skyColor: "#7EC8E3",
    hemiSkyColor: "#FFF0B0", hemiGroundColor: "#8BC46A", hemiIntensity: 1.3,
    fillIntensity: 0.6,
    sunPosition: [80, 120, 40],
  },
  paused: {
    ambient: 0.3, sunColor: "#E8751A", sunIntensity: 0.6, skyColor: "#E8836B",
    hemiSkyColor: "#E8836B", hemiGroundColor: "#5D3A1A", hemiIntensity: 0.35,
    fillIntensity: 0.09,
    sunPosition: [100, 5, 50],
  },
  break: {
    ambient: 0.15, sunColor: "#6B8FC7", sunIntensity: 0.3, skyColor: "#0F1B3D",
    hemiSkyColor: "#1A2550", hemiGroundColor: "#0A0F20", hemiIntensity: 0.15,
    fillIntensity: 0.045,
    sunPosition: [100, -20, 50],
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
  const currentSunPos = useRef<[number, number, number]>([...target.sunPosition]);
  // Scratch colors to avoid per-frame allocations
  const _scratchColor = useRef(new THREE.Color());
  const _scratchBg = useRef(new THREE.Color(target.skyColor));

  useFrame((state, delta) => {
    const lerpSpeed = 1.5 * delta;

    // Lerp ambient
    currentAmbient.current = THREE.MathUtils.lerp(currentAmbient.current, target.ambient, lerpSpeed);
    if (ambientRef.current) {
      ambientRef.current.intensity = currentAmbient.current;
    }

    // Lerp directional (sun) light
    currentSunIntensity.current = THREE.MathUtils.lerp(currentSunIntensity.current, target.sunIntensity, lerpSpeed);
    currentSunColor.current.lerp(_scratchColor.current.set(target.sunColor), lerpSpeed);
    if (directionalRef.current) {
      directionalRef.current.intensity = currentSunIntensity.current;
      directionalRef.current.color.copy(currentSunColor.current);
    }

    // Lerp hemisphere light
    currentHemiIntensity.current = THREE.MathUtils.lerp(currentHemiIntensity.current, target.hemiIntensity, lerpSpeed);
    currentHemiSky.current.lerp(_scratchColor.current.set(target.hemiSkyColor), lerpSpeed);
    currentHemiGround.current.lerp(_scratchColor.current.set(target.hemiGroundColor), lerpSpeed);
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

    // Lerp sun position for Sky
    currentSunPos.current[0] = THREE.MathUtils.lerp(currentSunPos.current[0], target.sunPosition[0], lerpSpeed);
    currentSunPos.current[1] = THREE.MathUtils.lerp(currentSunPos.current[1], target.sunPosition[1], lerpSpeed);
    currentSunPos.current[2] = THREE.MathUtils.lerp(currentSunPos.current[2], target.sunPosition[2], lerpSpeed);

    // Update scene background color
    _scratchBg.current.lerp(_scratchColor.current.set(target.skyColor), lerpSpeed);
    state.scene.background = _scratchBg.current;
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
      {/* eslint-disable react-hooks/refs -- R3F: ref is updated per-frame in useFrame, read here intentionally */}
      <Sky
        sunPosition={currentSunPos.current}
        turbidity={8}
        rayleigh={2}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />
      {/* eslint-enable react-hooks/refs */}
      {timerState === "break" && <Stars radius={100} depth={50} count={2000} factor={4} fade />}
    </>
  );
}
