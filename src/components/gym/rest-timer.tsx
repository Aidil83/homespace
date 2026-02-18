"use client";

import { useState, useEffect, useRef } from "react";

interface RestTimerProps {
  durationSeconds?: number;
  onComplete: () => void;
  onSkip: () => void;
  accentColor?: string;
}

export function RestTimer({
  durationSeconds = 90,
  onComplete,
  onSkip,
  accentColor = "#8b5cf6",
}: RestTimerProps) {
  const [remaining, setRemaining] = useState(durationSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [onComplete]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const pct = remaining / durationSeconds;

  return (
    <div
      className="flex items-center justify-between rounded-xl px-3.5 py-2.5 mt-2 border"
      style={{
        backgroundColor: `${accentColor}10`,
        borderColor: `${accentColor}30`,
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm">⏱️</span>
        <span className="text-xs font-semibold text-muted-foreground">Rest</span>
        <span
          className="text-lg font-extrabold tabular-nums"
          style={{ color: remaining <= 10 ? "#ef4444" : accentColor }}
        >
          {minutes}:{seconds.toString().padStart(2, "0")}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-16 rounded-full overflow-hidden bg-white/10">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-linear"
            style={{
              width: `${pct * 100}%`,
              backgroundColor: accentColor,
            }}
          />
        </div>
        <button
          onClick={onSkip}
          className="rounded-lg px-2.5 py-1 text-xs font-bold cursor-pointer"
          style={{
            backgroundColor: `${accentColor}20`,
            borderColor: `${accentColor}40`,
            color: accentColor,
          }}
        >
          Skip
        </button>
      </div>
    </div>
  );
}
