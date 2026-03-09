"use client";

import { WOS, SAMPLE_STREAK } from "./watch-constants";

export function WatchComplication() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: "16px 16px",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      }}
    >
      {/* Title */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: WOS.secondaryLabel,
          textTransform: "uppercase",
        }}
      >
        COMPLICATIONS
      </div>

      {/* Widget previews row */}
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        {/* Circular — Streak */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: WOS.grayDark,
            border: `2px solid ${WOS.grayMid}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ fontSize: 10, color: WOS.orange }}>🔥</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: WOS.label, lineHeight: 1 }}>
            {SAMPLE_STREAK}
          </div>
          <div style={{ fontSize: 8, color: WOS.tertiaryLabel, marginTop: 1 }}>STREAK</div>
        </div>

        {/* Corner — Minimal ring */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: WOS.grayDark,
            border: `2px solid ${WOS.grayMid}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="20" cy="20" r="16" fill="none" stroke={WOS.grayMid} strokeWidth="3" />
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke={WOS.green}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 16}
              strokeDashoffset={2 * Math.PI * 16 * 0.25} // 75% complete
            />
          </svg>
          <div
            style={{
              position: "absolute",
              fontSize: 9,
              fontWeight: 700,
              color: WOS.label,
            }}
          >
            6/8
          </div>
        </div>
      </div>

      {/* Rectangular — Next workout */}
      <div
        style={{
          width: 200,
          padding: "10px 14px",
          backgroundColor: WOS.grayDark,
          borderRadius: 14,
          border: `1px solid ${WOS.grayMid}`,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div style={{ fontSize: 22 }}>💪</div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: WOS.label }}>Full Body</div>
          <div style={{ fontSize: 10, color: WOS.tertiaryLabel }}>Tomorrow · 8 exercises</div>
        </div>
      </div>

      {/* Quick Start complication */}
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: WOS.green,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#000" stroke="none">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      </div>

      {/* Labels */}
      <div style={{ display: "flex", gap: 14, fontSize: 9, color: WOS.tertiaryLabel, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        <span>Streak</span>
        <span>Progress</span>
        <span>Quick Start</span>
      </div>
    </div>
  );
}
