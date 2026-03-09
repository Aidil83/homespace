"use client";

import { WOS, SAMPLE_STREAK, SAMPLE_DURATION } from "./watch-constants";

// In a real app, these come from workout data
const SAMPLE_PRS = 1; // number of PRs hit this session (0 = none)
const SAMPLE_AVG_1RM_CHANGE = "+3.2%"; // fallback when no PRs

export function WatchWorkoutSummary() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        padding: "16px 20px",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      }}
    >
      {/* Animated checkmark */}
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: WOS.green,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "watchBounce 0.5s ease-out",
        }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <div
        style={{
          fontSize: 17,
          fontWeight: 700,
          color: WOS.label,
        }}
      >
        Workout Complete!
      </div>

      {/* PR callout */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 14px",
          backgroundColor: "rgba(234,179,8,0.12)",
          borderRadius: 14,
          border: "1px solid rgba(234,179,8,0.25)",
        }}
      >
        <span style={{ fontSize: 14 }}>🏆</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#eab308" }}>
          New PR! Squats 1RM: 171 lbs
        </span>
      </div>

      {/* Stats grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px 20px",
          width: "100%",
          marginTop: 8,
        }}
      >
        {SAMPLE_PRS > 0 ? (
          <StatItem label="PRs Hit" value={`${SAMPLE_PRS} 🏆`} highlight />
        ) : (
          <StatItem label="Avg 1RM" value={SAMPLE_AVG_1RM_CHANGE} />
        )}
        <StatItem label="Exercises" value="8/8" />
        <StatItem label="Duration" value={SAMPLE_DURATION} />
        <StatItem label="Streak" value={`${SAMPLE_STREAK} days 🔥`} />
      </div>

      {/* Done button */}
      <button
        style={{
          width: "100%",
          padding: "12px 0",
          marginTop: 16,
          backgroundColor: WOS.grayMid,
          color: WOS.label,
          fontSize: 15,
          fontWeight: 700,
          border: "none",
          borderRadius: 22,
          cursor: "pointer",
        }}
      >
        Done
      </button>

      {/* Keyframes for bounce animation */}
      <style>{`
        @keyframes watchBounce {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function StatItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: highlight ? "#eab308" : WOS.label, lineHeight: 1.2 }}>
        {value}
      </div>
      <div style={{ fontSize: 10, color: highlight ? "#eab308" : WOS.tertiaryLabel, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </div>
    </div>
  );
}
