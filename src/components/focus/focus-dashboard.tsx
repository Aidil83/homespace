"use client";

import { useState, useEffect, useCallback } from "react";
import { BiomeSelector } from "./biome-selector";
import { FocusTimer } from "./focus-timer";
import { SessionHistory } from "./session-history";
import { WorldMap } from "./world-map";
import type { BiomeId } from "./biomes/types";

type View = "select" | "timer" | "history" | "world";

interface BiomeProgressData {
  xp: number;
  level: number;
  collectibles: string[];
}

interface ActiveSession {
  id: string;
  biome: BiomeId;
  duration: number;
}

export function FocusDashboard() {
  const [view, setView] = useState<View>("select");
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [biomeProgress, setBiomeProgress] = useState<Record<string, BiomeProgressData>>({});
  const [mounted, setMounted] = useState(false);

  const fetchProgress = useCallback(async () => {
    try {
      const res = await fetch("/api/focus/progress");
      if (res.ok) {
        const data = await res.json();
        setBiomeProgress(data);
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchProgress();
  }, [fetchProgress]);

  const handleStart = useCallback(async (biome: BiomeId, duration: number) => {
    try {
      const res = await fetch("/api/focus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ biome, duration }),
      });
      const session = await res.json();
      setActiveSession({ id: session.id, biome, duration });
      setView("timer");
    } catch {
      // silently fail
    }
  }, []);

  const handleTimerComplete = useCallback(() => {
    setActiveSession(null);
    fetchProgress();
    setView("select");
  }, [fetchProgress]);

  const handleTimerAbandon = useCallback(() => {
    setActiveSession(null);
    setView("select");
  }, []);

  if (!mounted) return null;

  const tabStyle = (t: View): React.CSSProperties => ({
    padding: "8px 20px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    transition: "all 0.2s",
    background: view === t ? "rgba(79,142,247,0.15)" : "transparent",
    color: view === t ? "#4F8EF7" : "#9CA3AF",
  });

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Outfit', sans-serif",
      background: "linear-gradient(145deg, #0d0d1a 0%, #131328 50%, #0f1a2e 100%)",
      minHeight: "100vh",
      color: "#e8e8f0",
      padding: "28px 24px",
      containerType: "inline-size",
    }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 28,
            fontWeight: 800,
            margin: 0,
            background: "linear-gradient(135deg, #F97316, #EF4444, #A855F7)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Focus
          </h1>
          <p style={{ color: "#6B7280", margin: "4px 0 0", fontSize: 14 }}>
            Choose a biome, set your timer, and dive into deep focus.
          </p>
        </div>

        {/* Tabs (hidden during active timer) */}
        {view !== "timer" && (
          <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
            <button onClick={() => setView("world")} style={tabStyle("world")}>
              World
            </button>
            <button onClick={() => setView("select")} style={tabStyle("select")}>
              Biomes
            </button>
            <button onClick={() => setView("history")} style={tabStyle("history")}>
              History
            </button>
          </div>
        )}

        {/* Views */}
        {view === "select" && (
          <BiomeSelector biomeProgress={biomeProgress} onStart={handleStart} />
        )}
        {view === "timer" && activeSession && (
          <FocusTimer
            biome={activeSession.biome}
            duration={activeSession.duration}
            sessionId={activeSession.id}
            onComplete={handleTimerComplete}
            onAbandon={handleTimerAbandon}
          />
        )}
        {view === "world" && (
          <WorldMap
            biomeProgress={biomeProgress}
            onStartSession={() => setView("select")}
          />
        )}
        {view === "history" && (
          <SessionHistory biomeProgress={biomeProgress} />
        )}
      </div>
    </div>
  );
}
