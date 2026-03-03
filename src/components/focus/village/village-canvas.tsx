"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useState } from "react";
import { Ground } from "./ground";
import { Fountain } from "./fountain";
import { FpsController } from "./fps-controller";
import { DayNightCycle } from "./day-night-cycle";
import { VillageHud } from "./village-hud";
import { BuildingRenderer } from "./buildings";
import { VillageCreatures } from "./creatures";
import type { VillageBuilding } from "@/lib/village/types";

interface VillageCanvasProps {
  buildings: VillageBuilding[];
  timerState: "idle" | "focusing" | "paused" | "break";
}

export function VillageCanvas({ buildings, timerState }: VillageCanvasProps) {
  const [cameraMode, setCameraMode] = useState<"orbit" | "fps">("orbit");

  return (
    <div style={{ position: "relative", width: "100%", height: "70vh", borderRadius: 16, overflow: "hidden" }}>
      <Canvas
        camera={{ position: [30, 25, 30], fov: 50 }}
      >
        <color attach="background" args={["#87CEEB"]} />
        <DayNightCycle timerState={timerState} />
        <fog attach="fog" args={["#87CEEB", 80, 200]} />

        {cameraMode === "orbit" ? (
          <OrbitControls
            target={[0, 0, 0]}
            maxPolarAngle={Math.PI / 2.2}
            minDistance={10}
            maxDistance={80}
            enableDamping
            dampingFactor={0.05}
          />
        ) : (
          <FpsController onExit={() => setCameraMode("orbit")} />
        )}

        <Ground buildings={buildings} />
        <Fountain />
        {buildings.map((b) => (
          <BuildingRenderer key={b.id} building={b} timerState={timerState} />
        ))}
        <VillageCreatures buildings={buildings} timerState={timerState} />
      </Canvas>
      <VillageHud
        cameraMode={cameraMode}
        onToggleCamera={() => setCameraMode((m) => (m === "orbit" ? "fps" : "orbit"))}
      />
    </div>
  );
}
