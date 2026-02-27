"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusTimer } from "@/hooks/use-focus-timer";
import { BIOMES, type BiomeId } from "./biomes/types";
import { EmberBiome } from "./biomes/ember";
import { FathomBiome } from "./biomes/fathom";
import { ForgeBiome } from "./biomes/forge";
import { FluxBiome } from "./biomes/flux";
import { PrismBiome } from "./biomes/prism";
import { SignalBiome } from "./biomes/signal";

const BIOME_COMPONENTS: Record<BiomeId, React.ComponentType<{ progress: number }>> = {
  ember: EmberBiome,
  fathom: FathomBiome,
  forge: ForgeBiome,
  flux: FluxBiome,
  prism: PrismBiome,
  signal: SignalBiome,
};

interface CompletionResult {
  collectible: string | null;
  xpEarned: number;
  newLevel: number;
}

interface FocusTimerProps {
  biome: BiomeId;
  duration: number;
  sessionId: string;
  onComplete: () => void;
  onAbandon: () => void;
}

export function FocusTimer({ biome, duration, sessionId, onComplete, onAbandon }: FocusTimerProps) {
  const meta = BIOMES[biome];
  const BiomeComp = BIOME_COMPONENTS[biome];
  const [completion, setCompletion] = useState<CompletionResult | null>(null);

  const handleComplete = useCallback(async () => {
    try {
      const res = await fetch(`/api/focus/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed", elapsed: duration }),
      });
      const data = await res.json();
      setCompletion({
        collectible: data.session?.collectible || null,
        xpEarned: data.xpEarned || 0,
        newLevel: data.biomeProgress?.level || 1,
      });
    } catch {
      setCompletion({ collectible: null, xpEarned: Math.floor(duration / 60), newLevel: 1 });
    }
  }, [sessionId, duration]);

  const timer = useFocusTimer({ duration, onComplete: handleComplete });
  const elapsedRef = useRef(timer.elapsed);
  useEffect(() => { elapsedRef.current = timer.elapsed; }, [timer.elapsed]);

  const handleAbandon = useCallback(async () => {
    try {
      await fetch(`/api/focus/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "abandoned", elapsed: elapsedRef.current }),
      });
    } catch {
      // silently fail
    }
    onAbandon();
  }, [sessionId, onAbandon]);

  // Auto-start on mount
  useEffect(() => {
    timer.start();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- intentionally run once on mount

  const mins = Math.floor(timer.remaining / 60);
  const secs = timer.remaining % 60;
  const timeStr = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

  // Progress ring
  const ringRadius = 140;
  const circumference = 2 * Math.PI * ringRadius;
  const offset = circumference * (1 - timer.progress);

  // Completion screen
  if (completion) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", minHeight: 500, gap: 20,
        animation: "focusFadeIn 0.5s ease-out",
      }}>
        <style>{`
          @keyframes focusFadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes focusCollectGlow {
            0%, 100% { box-shadow: 0 0 20px ${meta.color}40; }
            50% { box-shadow: 0 0 40px ${meta.color}60, 0 0 60px ${meta.color}30; }
          }
        `}</style>

        <div style={{ fontSize: 48, marginBottom: 8 }}>{meta.icon}</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#e8e8f0", margin: 0 }}>
          Session Complete!
        </h2>
        <p style={{ fontSize: 14, color: "#9CA3AF", margin: 0 }}>
          {Math.floor(duration / 60)} minutes focused in {meta.name}
        </p>

        <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
          <div style={{
            background: `${meta.color}15`, borderRadius: 12, padding: "12px 20px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: meta.color }}>+{completion.xpEarned}</div>
            <div style={{ fontSize: 11, color: "#6B7280" }}>XP Earned</div>
          </div>
          <div style={{
            background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "12px 20px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#e8e8f0" }}>Lv.{completion.newLevel}</div>
            <div style={{ fontSize: 11, color: "#6B7280" }}>{meta.name} Level</div>
          </div>
        </div>

        {completion.collectible && (
          <div style={{
            marginTop: 16, background: `${meta.color}10`,
            border: `1px solid ${meta.color}30`, borderRadius: 12,
            padding: "16px 24px", textAlign: "center",
            animation: "focusCollectGlow 3s ease-in-out infinite",
          }}>
            <div style={{ fontSize: 10, color: "#6B7280", marginBottom: 4, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              New Collectible
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: meta.color }}>
              {completion.collectible}
            </div>
          </div>
        )}

        <button
          onClick={onComplete}
          style={{
            marginTop: 20, padding: "12px 32px", borderRadius: 10,
            border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer",
            background: meta.color, color: "#fff",
          }}
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: 24, paddingTop: 16,
    }}>
      <style>{`
        @keyframes focusRingPulse {
          0%, 100% { filter: drop-shadow(0 0 4px ${meta.color}40); }
          50% { filter: drop-shadow(0 0 8px ${meta.color}60); }
        }
      `}</style>

      {/* Biome name */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: meta.color, letterSpacing: "0.05em" }}>
          {meta.icon} {meta.name}
        </div>
      </div>

      {/* Timer ring + biome visual */}
      <div style={{ position: "relative", width: 300, height: 300 }}>
        <svg viewBox="0 0 300 300" width="300" height="300" style={{
          position: "absolute", top: 0, left: 0,
          animation: "focusRingPulse 4s ease-in-out infinite",
        }}>
          {/* Background ring */}
          <circle cx="150" cy="150" r={ringRadius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
          {/* Progress ring */}
          <circle
            cx="150" cy="150" r={ringRadius} fill="none"
            stroke={meta.color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 150 150)"
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>

        {/* Biome visual (clipped inside ring) */}
        <div style={{
          position: "absolute",
          top: 16, left: 16, width: 268, height: 268,
          borderRadius: "50%", overflow: "hidden",
        }}>
          <BiomeComp progress={timer.progress} />
        </div>
      </div>

      {/* Time remaining */}
      <div style={{ textAlign: "center" }}>
        <div style={{
          fontSize: 48, fontWeight: 800, color: "#e8e8f0",
          fontFamily: "'DM Sans', monospace",
          letterSpacing: "0.02em",
        }}>
          {timeStr}
        </div>
        <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
          {timer.isPaused ? "Paused" : "remaining"}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 12 }}>
        {timer.isPaused ? (
          <button
            onClick={timer.resume}
            style={{
              padding: "10px 28px", borderRadius: 10, border: "none",
              fontSize: 14, fontWeight: 700, cursor: "pointer",
              background: meta.color, color: "#fff",
            }}
          >
            Resume
          </button>
        ) : timer.isRunning ? (
          <button
            onClick={timer.pause}
            style={{
              padding: "10px 28px", borderRadius: 10,
              border: `1px solid ${meta.color}50`, background: "transparent",
              fontSize: 14, fontWeight: 600, cursor: "pointer",
              color: meta.color,
            }}
          >
            Pause
          </button>
        ) : null}
        {!timer.isComplete && (
          <button
            onClick={handleAbandon}
            style={{
              padding: "10px 20px", borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
              fontSize: 13, fontWeight: 500, cursor: "pointer",
              color: "#6B7280",
            }}
          >
            Abandon
          </button>
        )}
      </div>
    </div>
  );
}
