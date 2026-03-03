"use client";

import dynamic from "next/dynamic";
import type { VillageBuilding } from "@/lib/village/types";

const VillageCanvas = dynamic(() => import("./village-canvas").then((m) => m.VillageCanvas), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "70vh",
        background: "linear-gradient(180deg, #87CEEB 0%, #228B22 100%)",
        borderRadius: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      Loading village...
    </div>
  ),
});

interface VillageSceneProps {
  buildings: VillageBuilding[];
  timerState: "idle" | "focusing" | "paused" | "break";
}

export function VillageScene({ buildings, timerState }: VillageSceneProps) {
  return <VillageCanvas buildings={buildings} timerState={timerState} />;
}
