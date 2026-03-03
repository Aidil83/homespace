"use client";

interface VillageHudProps {
  cameraMode: "orbit" | "fps";
  onToggleCamera: () => void;
}

export function VillageHud({ cameraMode, onToggleCamera }: VillageHudProps) {
  return (
    <>
      {/* Camera toggle button */}
      <button
        onClick={onToggleCamera}
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          padding: "6px 14px",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.2)",
          background: "rgba(0,0,0,0.5)",
          color: "#fff",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          backdropFilter: "blur(8px)",
          zIndex: 10,
        }}
      >
        {cameraMode === "orbit" ? "🚶 Explore (FPS)" : "🔭 Orbit View"}
      </button>

      {/* FPS crosshair + instructions */}
      {cameraMode === "fps" && (
        <>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 4,
              height: 4,
              background: "#fff",
              borderRadius: "50%",
              boxShadow: "0 0 4px rgba(0,0,0,0.5)",
              zIndex: 10,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 12,
              left: "50%",
              transform: "translateX(-50%)",
              padding: "6px 16px",
              borderRadius: 8,
              background: "rgba(0,0,0,0.5)",
              color: "#ccc",
              fontSize: 11,
              zIndex: 10,
              pointerEvents: "none",
              backdropFilter: "blur(8px)",
              whiteSpace: "nowrap",
            }}
          >
            WASD move · Shift sprint · Space jump · ESC exit
          </div>
        </>
      )}
    </>
  );
}
