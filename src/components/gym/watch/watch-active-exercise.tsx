"use client";

import { useState, useEffect, useRef } from "react";
import { WOS } from "./watch-constants";

// Epley formula: weight × (1 + reps/30)
function estimatedE1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

const DEFAULT_WEIGHT = 135;
const DEFAULT_REPS = 8;

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface WatchActiveExerciseProps {
  onAction?: () => void;
  exerciseName?: string;
  setIndex?: number;
  totalSets?: number;
  prevWeight?: number;
  prevReps?: number;
  defaultWeight?: number;
}

export function WatchActiveExercise({
  onAction,
  exerciseName = "Squats",
  setIndex = 0,
  totalSets = 2,
  prevWeight = 130,
  prevReps = 8,
  defaultWeight = DEFAULT_WEIGHT,
}: WatchActiveExerciseProps = {}) {
  const [weight, setWeight] = useState(defaultWeight);
  const [reps, setReps] = useState(DEFAULT_REPS);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const e1rm = estimatedE1RM(weight, reps);
  const prev1rm = estimatedE1RM(prevWeight, prevReps);
  const isPR = e1rm > prev1rm && e1rm > 0;
  const isDefault = weight === defaultWeight && reps === DEFAULT_REPS;

  useEffect(() => {
    intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "10px 16px",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      }}
    >
      {/* Stopwatch + Heart rate */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
          marginBottom: 6,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={WOS.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="13" r="9" />
            <polyline points="12 9 12 13 15 13" />
            <line x1="12" y1="1" x2="12" y2="3" />
          </svg>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: WOS.green,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatElapsed(elapsed)}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill={WOS.red} stroke="none">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: WOS.red,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {142 + (elapsed % 8)}
          </span>
        </div>
      </div>

      {/* Exercise name + set */}
      <div style={{ textAlign: "center", marginBottom: 4 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: WOS.label,
          }}
        >
          {exerciseName}
        </div>
        {/* Set progress dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 6 }}>
          {Array.from({ length: totalSets }, (_, i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i <= setIndex ? WOS.green : WOS.grayMid,
              }}
            />
          ))}
        </div>
        <div
          style={{
            fontSize: 11,
            color: WOS.secondaryLabel,
            marginTop: 4,
          }}
        >
          Set {setIndex + 1} / {totalSets}
        </div>
      </div>

      {/* Weight control */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 10 }}>
        <button
          onClick={() => setWeight((w) => Math.max(0, w - 5))}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: WOS.grayMid,
            border: "none",
            color: WOS.label,
            fontSize: 22,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          −
        </button>
        <div style={{ textAlign: "center", minWidth: 90 }}>
          <div style={{ fontSize: 36, fontWeight: 700, color: WOS.label, lineHeight: 1 }}>
            {weight}
          </div>
          <div style={{ fontSize: 11, color: WOS.tertiaryLabel, marginTop: 2 }}>LBS</div>
        </div>
        <button
          onClick={() => setWeight((w) => w + 5)}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: WOS.grayMid,
            border: "none",
            color: WOS.label,
            fontSize: 22,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          +
        </button>
      </div>

      {/* Reps control */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 12 }}>
        <button
          onClick={() => setReps((r) => Math.max(1, r - 1))}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: WOS.grayMid,
            border: "none",
            color: WOS.label,
            fontSize: 20,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          −
        </button>
        <div style={{ textAlign: "center", minWidth: 70 }}>
          <div style={{ fontSize: 30, fontWeight: 700, color: WOS.label, lineHeight: 1 }}>
            {reps}
          </div>
          <div style={{ fontSize: 11, color: WOS.tertiaryLabel, marginTop: 2 }}>REPS</div>
        </div>
        <button
          onClick={() => setReps((r) => r + 1)}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: WOS.grayMid,
            border: "none",
            color: WOS.label,
            fontSize: 20,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          +
        </button>
      </div>

      {/* Estimated 1RM + PR badge */}
      <div style={{ textAlign: "center", marginTop: 14 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: isPR ? "#eab308" : WOS.orange,
          }}
        >
          {isPR && "🏆 "}1RM: {e1rm} lbs{isPR && " PR!"}
        </div>
        {isPR && (
          <div
            style={{
              fontSize: 10,
              color: "#eab308",
              marginTop: 2,
              animation: "prPulse 1s ease-in-out infinite",
            }}
          >
            +{e1rm - prev1rm} lbs over previous
          </div>
        )}
      </div>

      {/* Previous reference */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 6,
          marginTop: 8,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: WOS.secondaryLabel,
            backgroundColor: WOS.grayDark,
            padding: "3px 10px",
            borderRadius: 10,
          }}
        >
          {prevWeight} lbs × {prevReps} reps
        </span>
      </div>

      {/* Reset button */}
      {!isDefault && (
        <button
          onClick={() => { setWeight(defaultWeight); setReps(DEFAULT_REPS); }}
          style={{
            margin: "8px auto 0",
            padding: "5px 14px",
            backgroundColor: WOS.grayMid,
            color: WOS.secondaryLabel,
            fontSize: 11,
            fontWeight: 600,
            border: "none",
            borderRadius: 14,
            cursor: "pointer",
          }}
        >
          Reset
        </button>
      )}

      {/* Complete set button */}
      <button
        onClick={onAction}
        style={{
          width: "100%",
          padding: "12px 0",
          marginTop: 12,
          backgroundColor: WOS.green,
          color: "#000",
          fontSize: 15,
          fontWeight: 700,
          border: "none",
          borderRadius: 22,
          cursor: "pointer",
          marginBottom: 4,
        }}
      >
        Complete Set
      </button>

      {/* Keyframes */}
      <style>{`
        @keyframes prPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
