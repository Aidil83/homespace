"use client";

import { WATCH } from "./watch-constants";

interface WatchFrameProps {
  label: string;
  children: React.ReactNode;
}

export function WatchFrame({ label, children }: WatchFrameProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      {/* Watch case */}
      <div
        style={{
          position: "relative",
          width: WATCH.width + 16, // padding for case
          height: WATCH.height + 16,
        }}
      >
        {/* Case body */}
        <div
          style={{
            width: WATCH.width + 16,
            height: WATCH.height + 16,
            backgroundColor: WATCH.caseColor,
            borderRadius: WATCH.caseRadius,
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />

        {/* Digital Crown */}
        <div
          style={{
            position: "absolute",
            right: -6,
            top: "30%",
            width: WATCH.crownWidth,
            height: WATCH.crownHeight,
            backgroundColor: "#3a3a3a",
            borderRadius: 2,
            border: "1px solid #4a4a4a",
          }}
        />

        {/* Side button */}
        <div
          style={{
            position: "absolute",
            right: -5,
            top: "45%",
            width: WATCH.buttonWidth,
            height: WATCH.buttonHeight,
            backgroundColor: "#3a3a3a",
            borderRadius: 1.5,
            border: "1px solid #4a4a4a",
          }}
        />

        {/* Screen */}
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            width: WATCH.width,
            height: WATCH.height,
            backgroundColor: WATCH.screenBg,
            borderRadius: WATCH.screenRadius,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {children}
        </div>
      </div>

      {/* Label */}
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#a1a1aa",
          letterSpacing: "0.02em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
    </div>
  );
}
