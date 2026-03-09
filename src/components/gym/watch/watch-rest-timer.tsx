"use client";

import { useState, useEffect, useCallback } from "react";
import { WOS } from "./watch-constants";

const TOTAL_SECONDS = 90;
const RADIUS = 90;
const STROKE = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function WatchRestTimer() {
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

  const progress = remaining / TOTAL_SECONDS;
  const offset = CIRCUMFERENCE * (1 - progress);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  const handleSkip = useCallback(() => {
    setRemaining(0);
    setRunning(false);
  }, []);

  const handleReset = useCallback(() => {
    setRemaining(TOTAL_SECONDS);
    setRunning(true);
  }, []);

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

      {/* Skip / Reset button */}
      <button
        onClick={remaining > 0 ? handleSkip : handleReset}
        style={{
          marginTop: 12,
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
        {remaining > 0 ? "Skip" : "Reset"}
      </button>

      {/* Next exercise */}
      <div
        style={{
          fontSize: 12,
          color: WOS.tertiaryLabel,
          marginTop: 12,
        }}
      >
        Next: Barbell Rows
      </div>
    </div>
  );
}
