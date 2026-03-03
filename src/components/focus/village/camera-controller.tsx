"use client";

import { OrbitControls } from "@react-three/drei";
import { FpsController } from "./fps-controller";

interface CameraControllerProps {
  mode: "orbit" | "fps";
  onExitFps: () => void;
}

export function CameraController({ mode, onExitFps }: CameraControllerProps) {
  if (mode === "fps") {
    return <FpsController onExit={onExitFps} />;
  }

  return (
    <OrbitControls
      target={[0, 0, 0]}
      maxPolarAngle={Math.PI / 2.2}
      minDistance={10}
      maxDistance={80}
      enableDamping
      dampingFactor={0.05}
    />
  );
}
