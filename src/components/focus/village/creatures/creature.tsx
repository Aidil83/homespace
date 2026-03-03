"use client";

import { useRef, useState, useCallback } from "react";
import { Html } from "@react-three/drei";
import type { CreatureConfig, CreatureType } from "@/lib/village/creatures";
import { PHRASE_POOLS } from "@/lib/village/creatures";
import { VillagerMesh } from "./meshes/villager";
import { GuardMesh } from "./meshes/guard";
import { ChickenMesh } from "./meshes/chicken";
import { SheepMesh } from "./meshes/sheep";
import { CatMesh } from "./meshes/cat";
import { DogMesh } from "./meshes/dog";

interface CreatureProps {
  config: CreatureConfig;
  walkingRef: React.RefObject<boolean>;
}

const LABEL_Y: Record<CreatureType, number> = {
  villager: 1.1,
  guard: 1.5,
  chicken: 0.3,
  sheep: 0.5,
  cat: 0.4,
  dog: 0.6,
};

const SPEECH_Y: Record<CreatureType, number> = {
  villager: 1.3,
  guard: 1.8,
  chicken: 0.5,
  sheep: 0.7,
  cat: 0.6,
  dog: 0.8,
};

const GLOW_Y: Record<CreatureType, number> = {
  villager: 0.5,
  guard: 0.7,
  chicken: 0.1,
  sheep: 0.3,
  cat: 0.2,
  dog: 0.35,
};

const GLOW_RADIUS: Record<CreatureType, number> = {
  villager: 0.3,
  guard: 0.35,
  chicken: 0.15,
  sheep: 0.25,
  cat: 0.2,
  dog: 0.25,
};

export function Creature({ config, walkingRef }: CreatureProps) {
  const [hovered, setHovered] = useState(false);
  const [speech, setSpeech] = useState<string | null>(null);
  const speechTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = useCallback(() => {
    const phrases = PHRASE_POOLS[config.type];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    setSpeech(phrase);
    if (speechTimeout.current) clearTimeout(speechTimeout.current);
    speechTimeout.current = setTimeout(() => setSpeech(null), 2500);
  }, [config.type]);

  const handlePointerOver = useCallback(() => setHovered(true), []);
  const handlePointerOut = useCallback(() => setHovered(false), []);

  return (
    <group
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <CreatureMesh type={config.type} variant={config.variant} walkingRef={walkingRef} />

      {/* Hover glow */}
      {hovered && (
        <mesh position={[0, GLOW_Y[config.type], 0]}>
          <sphereGeometry args={[GLOW_RADIUS[config.type], 6, 6]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.15}
            emissive="#ffffff"
            emissiveIntensity={0.3}
          />
        </mesh>
      )}

      {/* Name label on hover */}
      {hovered && (
        <Html
          position={[0, LABEL_Y[config.type], 0]}
          center
          style={{ pointerEvents: "none" }}
        >
          <div style={{
            background: "rgba(0,0,0,0.7)",
            color: "#fff",
            padding: "2px 8px",
            borderRadius: 4,
            fontSize: 11,
            whiteSpace: "nowrap",
            fontFamily: "system-ui, sans-serif",
          }}>
            {config.name}
          </div>
        </Html>
      )}

      {/* Speech bubble on click */}
      {speech && (
        <Html
          position={[0, SPEECH_Y[config.type], 0]}
          center
          style={{ pointerEvents: "none" }}
        >
          <div style={{
            background: "#fff",
            color: "#333",
            padding: "4px 10px",
            borderRadius: 8,
            fontSize: 12,
            whiteSpace: "nowrap",
            fontFamily: "system-ui, sans-serif",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}>
            {speech}
          </div>
        </Html>
      )}
    </group>
  );
}

function CreatureMesh({
  type,
  variant,
  walkingRef,
}: {
  type: CreatureType;
  variant?: string;
  walkingRef: React.RefObject<boolean>;
}) {
  switch (type) {
    case "villager":
      return <VillagerMesh variant={variant as import("@/lib/village/creatures").VillagerVariant} walkingRef={walkingRef} />;
    case "guard":
      return <GuardMesh walkingRef={walkingRef} />;
    case "chicken":
      return <ChickenMesh walkingRef={walkingRef} />;
    case "sheep":
      return <SheepMesh walkingRef={walkingRef} />;
    case "cat":
      return <CatMesh walkingRef={walkingRef} />;
    case "dog":
      return <DogMesh walkingRef={walkingRef} />;
  }
}
