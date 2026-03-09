"use client";

import { WOS, SAMPLE_STREAK, SAMPLE_DURATION } from "./watch-constants";

// In a real app, these come from workout data
const SAMPLE_PRS = 1; // number of PRs hit this session (0 = none)
const SAMPLE_AVG_1RM_CHANGE = "+3.2%"; // fallback when no PRs

export function WatchWorkoutSummary({ onAction }: { onAction?: () => void } = {}) {
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
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
        onClick={onAction}
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

      {/* Confetti particles */}
      {Array.from({ length: 12 }, (_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: 0,
            left: `${10 + (i * 7) % 80}%`,
            width: i % 3 === 0 ? 6 : 4,
            height: i % 3 === 0 ? 6 : 4,
            borderRadius: i % 2 === 0 ? "50%" : 1,
            backgroundColor: ["#30d158", "#eab308", "#ff453a", "#0a84ff", "#ff9f0a", "#bf5af2"][i % 6],
            animation: `confettiFall ${1.5 + (i % 4) * 0.3}s ease-out ${i * 0.1}s forwards`,
            opacity: 0,
          }}
        />
      ))}

      {/* Keyframes */}
      <style>{`
        @keyframes watchBounce {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(350px) rotate(${720}deg); opacity: 0; }
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
