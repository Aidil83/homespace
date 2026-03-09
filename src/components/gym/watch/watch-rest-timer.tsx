"use client";

import { useState, useEffect, useCallback } from "react";
import { WOS } from "./watch-constants";

const TOTAL_SECONDS = 90;
const RADIUS = 90;
const STROKE = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function WatchRestTimer({ onAction, nextExercise }: { onAction?: () => void; nextExercise?: string } = {}) {
  const [totalTime, setTotalTime] = useState(TOTAL_SECONDS);
  const [remaining, setRemaining] = useState(TOTAL_SECONDS);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running || remaining <= 0) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, remaining]);

  const progress = remaining / totalTime;
  const offset = CIRCUMFERENCE * (1 - progress);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  const handleSkip = useCallback(() => {
    if (onAction) {
      onAction();
      return;
    }
    setRemaining(0);
    setRunning(false);
  }, [onAction]);

  const handleReset = useCallback(() => {
    if (onAction) {
      onAction();
      return;
    }
    setRemaining(totalTime);
    setRunning(true);
  }, [onAction, totalTime]);

  const adjustTime = useCallback((delta: number) => {
    setTotalTime((t) => {
      const next = Math.max(15, Math.min(300, t + delta));
      setRemaining((r) => Math.max(0, r + delta));
      return next;
    });
  }, []);

  // Auto-transition when timer reaches 0 in interactive mode
  useEffect(() => {
    if (remaining === 0 && onAction) {
      const timeout = setTimeout(onAction, 800);
      return () => clearTimeout(timeout);
    }
  }, [remaining, onAction]);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "12px 16px",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      }}
    >
      {/* Rest label */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: WOS.secondaryLabel,
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        REST
      </div>

      {/* Circular timer */}
      <div style={{ position: "relative", width: RADIUS * 2 + STROKE, height: RADIUS * 2 + STROKE }}>
        <svg
          width={RADIUS * 2 + STROKE}
          height={RADIUS * 2 + STROKE}
          style={{ transform: "rotate(-90deg)" }}
        >
          {/* Track */}
          <circle
            cx={RADIUS + STROKE / 2}
            cy={RADIUS + STROKE / 2}
            r={RADIUS}
            fill="none"
            stroke={WOS.grayMid}
            strokeWidth={STROKE}
          />
          {/* Progress */}
          <circle
            cx={RADIUS + STROKE / 2}
            cy={RADIUS + STROKE / 2}
            r={RADIUS}
            fill="none"
            stroke={remaining > 0 ? WOS.green : WOS.red}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>

        {/* Time display */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 48,
            fontWeight: 300,
            color: WOS.label,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {timeStr}
        </div>
      </div>

      {/* Timer controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
        {remaining > 0 && (
          <button
            onClick={() => adjustTime(-15)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: WOS.grayMid,
              border: "none",
              color: WOS.secondaryLabel,
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            −15
          </button>
        )}
        <button
          onClick={remaining > 0 ? handleSkip : handleReset}
          style={{
            padding: "8px 24px",
            backgroundColor: WOS.grayMid,
            color: WOS.label,
            fontSize: 14,
            fontWeight: 600,
            border: "none",
            borderRadius: 18,
            cursor: "pointer",
          }}
        >
          {remaining > 0 ? "Skip" : onAction ? "Continue" : "Reset"}
        </button>
        {remaining > 0 && (
          <button
            onClick={() => adjustTime(15)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: WOS.grayMid,
              border: "none",
              color: WOS.secondaryLabel,
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            +15
          </button>
        )}
      </div>

      {/* Next exercise */}
      <div
        style={{
          fontSize: 12,
          color: WOS.tertiaryLabel,
          marginTop: 12,
        }}
      >
        Next: {nextExercise ?? "Barbell Rows"}
      </div>
    </div>
  );
}
