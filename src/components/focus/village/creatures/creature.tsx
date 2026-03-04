"use client";
 

import { useRef, useState, useCallback } from "react";
import { Html } from "@react-three/drei";
import type { CreatureConfig, CreatureType } from "@/lib/village/creatures";
import { PHRASE_POOLS } from "@/lib/village/creatures";
import { VillagerMesh } from "./meshes/villager";
import { GuardMesh } from "./meshes/guard";
import { RabbitMesh } from "./meshes/rabbit";
import { FoxMesh } from "./meshes/fox";
import { DeerMesh } from "./meshes/deer";
import { BirdMesh } from "./meshes/bird";

interface CreatureProps {
  config: CreatureConfig;
  walkingRef: React.RefObject<boolean>;
}

const LABEL_Y: Record<CreatureType, number> = {
  villager: 1.1,
  guard: 1.5,
  rabbit: 0.3,
  fox: 0.5,
  deer: 1.2,
  bird: 0.4,
};

const SPEECH_Y: Record<CreatureType, number> = {
  villager: 1.3,
  guard: 1.8,
  rabbit: 0.5,
  fox: 0.7,
  deer: 1.5,
  bird: 0.6,
};

const GLOW_Y: Record<CreatureType, number> = {
  villager: 0.5,
  guard: 0.7,
  rabbit: 0.15,
  fox: 0.25,
  deer: 0.5,
  bird: 0.2,
};

const GLOW_RADIUS: Record<CreatureType, number> = {
  villager: 0.3,
  guard: 0.35,
  rabbit: 0.18,
  fox: 0.22,
  deer: 0.35,
  bird: 0.15,
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
          <meshLambertMaterial
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
    case "rabbit":
      return <RabbitMesh walkingRef={walkingRef} />;
    case "fox":
      return <FoxMesh walkingRef={walkingRef} />;
    case "deer":
      return <DeerMesh walkingRef={walkingRef} />;
    case "bird":
      return <BirdMesh walkingRef={walkingRef} variant={variant} />;
  }
}
