"use client";

import { WOS, SAMPLE_STREAK } from "./watch-constants";

export function WatchHomeScreen({ onAction }: { onAction?: () => void } = {}) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "12px 20px",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      }}
    >
      {/* App label */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: WOS.green,
          textTransform: "uppercase",
          textAlign: "center",
          marginBottom: 12,
        }}
      >
        GYMQUEST
      </div>

      {/* Weekly progress ring + workout type */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ position: "relative", width: 100, height: 100 }}>
          <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="50" cy="50" r="42" fill="none" stroke={WOS.grayMid} strokeWidth="6" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke={WOS.green}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 42}
              strokeDashoffset={2 * Math.PI * 42 * (1 - 2 / 3)} // 2/3 workouts done
            />
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 28 }}>💪</span>
          </div>
        </div>
        <div
          style={{
            fontSize: 10,
            color: WOS.secondaryLabel,
            marginTop: 4,
            letterSpacing: "0.05em",
          }}
        >
          2/3 THIS WEEK
        </div>
      </div>

      {/* Workout type */}
      <div
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: WOS.label,
          textAlign: "center",
          lineHeight: 1.2,
          marginTop: 10,
        }}
      >
        Full Body
      </div>

      {/* Streak + exercise count */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          marginTop: 10,
          fontSize: 14,
          fontWeight: 600,
          color: WOS.orange,
        }}
      >
        🔥 {SAMPLE_STREAK} Day Streak
      </div>
      <div
        style={{
          fontSize: 13,
          color: WOS.secondaryLabel,
          textAlign: "center",
          marginTop: 4,
        }}
      >
        8 exercises
      </div>

      {/* Start button */}
      <button
        onClick={onAction}
        style={{
          width: "100%",
          padding: "14px 0",
          marginTop: 16,
          backgroundColor: WOS.green,
          color: "#000",
          fontSize: 17,
          fontWeight: 700,
          border: "none",
          borderRadius: 24,
          cursor: "pointer",
        }}
      >
        Start Workout
      </button>
    </div>
  );
}
