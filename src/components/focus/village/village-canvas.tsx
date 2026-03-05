"use client";

import { Canvas } from "@react-three/fiber";
import { useState, createContext, useContext } from "react";
import * as THREE from "three";
import { VoxelTerrainMesh } from "./terrain/terrain-mesh";
import { WaterMesh } from "./terrain/water-mesh";
import { Waterfall } from "./terrain/waterfall";
import { Bridge } from "./terrain/bridge";
import { getTerrainData } from "./terrain/terrain-data";
import { Trees } from "./environment/trees";
import { Rocks } from "./environment/rocks";
import { Decorations } from "./environment/decorations";
import { Fountain } from "./fountain";
import { IsometricCamera } from "./camera-controller";
import { DayNightCycle } from "./day-night-cycle";
import { VillageHud } from "./village-hud";
import { BuildingRenderer } from "./buildings";
import { VillageCreatures } from "./creatures";
import { WeatherSystem } from "./effects/weather-system";
import { SmokeParticles } from "./effects/smoke-particles";
import { EmberParticles } from "./effects/ember-particles";
import { DustParticles } from "./effects/dust-particles";
import { BuildingShadows } from "./effects/building-shadows";
import { GrassBillboards } from "./environment/grass-billboards";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import type { VillageBuilding } from "@/lib/village/types";
import type { TerrainData } from "@/lib/village/terrain";
import { getBlockHeight } from "@/lib/village/terrain";

// Terrain context so any child can access heightmap
export const TerrainContext = createContext<TerrainData | null>(null);
export function useTerrainData() {
  const ctx = useContext(TerrainContext);
  if (!ctx) throw new Error("useTerrainData must be used within TerrainContext");
  return ctx;
}

interface VillageCanvasProps {
  buildings: VillageBuilding[];
  timerState: "idle" | "focusing" | "paused" | "break";
}

const terrain = getTerrainData();

export function VillageCanvas({ buildings, timerState }: VillageCanvasProps) {
  const [weather, setWeather] = useState<"clear" | "snow" | "rain">("clear");

  // Find buildings that emit particles
  const smokeBuildings = buildings.filter((b) => b.buildingType === "cottage" || b.buildingType === "bakery");
  const emberBuildings = buildings.filter((b) => b.buildingType === "blacksmith");
  const dustBuildings = buildings.filter((b) => b.buildingType === "mine");

  return (
    <div style={{ position: "relative", width: "100%", height: "70vh", borderRadius: 16, overflow: "hidden" }}>
      <Canvas
        orthographic
        shadows={{ type: THREE.PCFSoftShadowMap }}
      >
        {/* fog removed for clarity */}
        <DayNightCycle timerState={timerState} />
        <IsometricCamera />

        <TerrainContext.Provider value={terrain}>
          <VoxelTerrainMesh terrain={terrain} />
          <WaterMesh terrain={terrain} />
          <Waterfall terrain={terrain} />
          <Bridge terrain={terrain} />
          <Decorations terrain={terrain} />
          <Trees terrain={terrain} />
          <Rocks terrain={terrain} />
          <GrassBillboards terrain={terrain} />
          <Fountain terrain={terrain} />

          <BuildingShadows buildings={buildings} terrain={terrain} />
          {buildings.map((b) => (
            <BuildingRenderer key={b.id} building={b} timerState={timerState} terrain={terrain} />
          ))}
          <VillageCreatures buildings={buildings} timerState={timerState} terrain={terrain} />

          {/* Weather */}
          <WeatherSystem weather={weather} />

          {/* Building particles */}
          {smokeBuildings.map((b) => (
            <SmokeParticles
              key={`smoke-${b.id}`}
              position={[b.positionX, getBlockHeight(terrain.heightMap, b.positionX, b.positionZ) + 4, b.positionZ]}
            />
          ))}
          {emberBuildings.map((b) => (
            <EmberParticles
              key={`ember-${b.id}`}
              position={[b.positionX, getBlockHeight(terrain.heightMap, b.positionX, b.positionZ) + 1, b.positionZ]}
            />
          ))}
          {dustBuildings.map((b) => (
            <DustParticles
              key={`dust-${b.id}`}
              position={[b.positionX, getBlockHeight(terrain.heightMap, b.positionX, b.positionZ) + 0.5, b.positionZ]}
            />
          ))}
        </TerrainContext.Provider>

        {/* Post-processing effects */}
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.6}
            luminanceSmoothing={0.5}
            intensity={0.4}
          />
        </EffectComposer>
      </Canvas>

      {/* CSS vignette overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          borderRadius: 16,
          boxShadow: "inset 0 0 80px 30px rgba(0,0,0,0.3)",
        }}
      />

      <VillageHud
        weather={weather}
        onToggleWeather={() => setWeather((w) => w === "clear" ? "snow" : w === "snow" ? "rain" : "clear")}
      />
    </div>
  );
}
