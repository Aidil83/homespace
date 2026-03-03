"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { VillageScene } from "./village/village-scene";
import { VillageStats } from "./village/village-stats";
import { BuildingPickerModal } from "./village/building-picker-modal";
import { SessionHistory } from "./session-history";
import { useVillage } from "@/hooks/use-village";
import { useFocusTimer } from "@/hooks/use-focus-timer";
import { playChime } from "@/lib/village/sounds";
import { DURATION_OPTIONS } from "./biomes/types";
import type { BuildingType } from "@/lib/village/types";

type View = "village" | "timer" | "history";

export function FocusDashboard() {
  const [view, setView] = useState<View>("village");
  const [mounted, setMounted] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(1500);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [timerState, setTimerState] = useState<"idle" | "focusing" | "paused" | "break">("idle");

  const { buildings, stats, unlockedTypes, fetchVillage, placeBuilding } = useVillage();

  const elapsedRef = useRef(0);

  const handleTimerComplete = useCallback(async () => {
    if (!sessionId) return;
    try {
      await fetch(`/api/focus/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed", elapsed: selectedDuration }),
      });
    } catch {
      // silently fail
    }
    playChime();
    setTimerState("break");
    setShowPicker(true);
    fetchVillage();
  }, [sessionId, selectedDuration, fetchVillage]);

  const timer = useFocusTimer({ duration: selectedDuration, onComplete: handleTimerComplete });

  useEffect(() => {
    elapsedRef.current = timer.elapsed;
  }, [timer.elapsed]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- mount flag for hydration guard
  useEffect(() => { setMounted(true); }, []);

  const handleStart = useCallback(async () => {
    try {
      const res = await fetch("/api/focus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ biome: "village", duration: selectedDuration }),
      });
      const session = await res.json();
      setSessionId(session.id);
      setView("timer");
      setTimerState("focusing");
      timer.start();
    } catch {
      // silently fail
    }
  }, [selectedDuration, timer]);

  const handlePause = useCallback(() => {
    timer.pause();
    setTimerState("paused");
  }, [timer]);

  const handleResume = useCallback(() => {
    timer.resume();
    setTimerState("focusing");
  }, [timer]);

  const handleAbandon = useCallback(async () => {
    if (sessionId) {
      try {
        await fetch(`/api/focus/${sessionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "abandoned", elapsed: elapsedRef.current }),
        });
      } catch {
        // silently fail
      }
    }
    timer.reset();
    setSessionId(null);
    setTimerState("idle");
    setView("village");
  }, [sessionId, timer]);

  const handlePickBuilding = useCallback(
    async (type: BuildingType) => {
      await placeBuilding(type);
      setShowPicker(false);
      timer.reset();
      setSessionId(null);
      setTimerState("idle");
      setView("village");
    },
    [placeBuilding, timer]
  );

  const handleSkipPicker = useCallback(() => {
    setShowPicker(false);
    timer.reset();
    setSessionId(null);
    setTimerState("idle");
    setView("village");
  }, [timer]);

  if (!mounted) return null;

  const mins = Math.floor(timer.remaining / 60);
  const secs = timer.remaining % 60;
  const timeStr = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

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
    <div
      style={{
        fontFamily: "'DM Sans', 'Outfit', sans-serif",
        background: "linear-gradient(145deg, #0d0d1a 0%, #131328 50%, #0f1a2e 100%)",
        minHeight: "100vh",
        color: "#e8e8f0",
        padding: "28px 24px",
        containerType: "inline-size",
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 28,
              fontWeight: 800,
              margin: 0,
              background: "linear-gradient(135deg, #F97316, #EF4444, #A855F7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Focus
          </h1>
          <p style={{ color: "#6B7280", margin: "4px 0 0", fontSize: 14 }}>
            Build your village one focus session at a time.
          </p>
        </div>

        {/* Tabs (hidden during active timer) */}
        {view !== "timer" && (
          <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
            <button onClick={() => setView("village")} style={tabStyle("village")}>
              Village
            </button>
            <button onClick={() => setView("history")} style={tabStyle("history")}>
              History
            </button>
          </div>
        )}

        {/* Village view */}
        {(view === "village" || view === "timer") && (
          <div style={{ position: "relative" }}>
            <VillageScene buildings={buildings} timerState={timerState} />

            {/* Timer overlay when focusing */}
            {view === "timer" && (
              <div
                style={{
                  position: "absolute",
                  top: 16,
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  zIndex: 10,
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    background: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(8px)",
                    borderRadius: 16,
                    padding: "12px 28px",
                    textAlign: "center",
                    pointerEvents: "auto",
                  }}
                >
                  <div
                    style={{
                      fontSize: 42,
                      fontWeight: 800,
                      color: "#e8e8f0",
                      fontFamily: "'DM Sans', monospace",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {timeStr}
                  </div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
                    {timer.isPaused ? "Paused" : timer.isComplete ? "Complete!" : "remaining"}
                  </div>

                  {/* Timer progress bar */}
                  <div
                    style={{
                      width: 180,
                      height: 3,
                      background: "rgba(255,255,255,0.1)",
                      borderRadius: 2,
                      marginTop: 8,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${timer.progress * 100}%`,
                        height: "100%",
                        background: "linear-gradient(90deg, #4F8EF7, #6366F1)",
                        borderRadius: 2,
                        transition: "width 1s linear",
                      }}
                    />
                  </div>

                  {/* Controls */}
                  <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "center" }}>
                    {timer.isPaused ? (
                      <button
                        onClick={handleResume}
                        style={{
                          padding: "6px 18px",
                          borderRadius: 8,
                          border: "none",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          background: "#4F8EF7",
                          color: "#fff",
                        }}
                      >
                        Resume
                      </button>
                    ) : timer.isRunning ? (
                      <button
                        onClick={handlePause}
                        style={{
                          padding: "6px 18px",
                          borderRadius: 8,
                          border: "1px solid rgba(255,255,255,0.2)",
                          background: "transparent",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          color: "#e8e8f0",
                        }}
                      >
                        Pause
                      </button>
                    ) : null}
                    {!timer.isComplete && (
                      <button
                        onClick={handleAbandon}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 8,
                          border: "1px solid rgba(255,255,255,0.1)",
                          background: "transparent",
                          fontSize: 11,
                          fontWeight: 500,
                          cursor: "pointer",
                          color: "#6B7280",
                        }}
                      >
                        Abandon
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Bottom panel: duration picker + start (only on village view) */}
            {view === "village" && (
              <div
                style={{
                  marginTop: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", gap: 6 }}>
                  {DURATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.seconds}
                      onClick={() => setSelectedDuration(opt.seconds)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: 8,
                        border:
                          selectedDuration === opt.seconds
                            ? "1px solid #4F8EF7"
                            : "1px solid rgba(255,255,255,0.08)",
                        background:
                          selectedDuration === opt.seconds
                            ? "rgba(79,142,247,0.15)"
                            : "rgba(255,255,255,0.03)",
                        color: selectedDuration === opt.seconds ? "#4F8EF7" : "#9CA3AF",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleStart}
                  style={{
                    padding: "10px 28px",
                    borderRadius: 10,
                    border: "none",
                    background: "linear-gradient(135deg, #4F8EF7, #6366F1)",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  Start Focus
                </button>
              </div>
            )}

            {/* Stats */}
            <div style={{ marginTop: 16 }}>
              <VillageStats
                totalSessions={stats.totalSessions}
                totalFocusMinutes={stats.totalFocusMinutes}
                currentStreak={stats.currentStreak}
                buildingCount={buildings.length}
              />
            </div>
          </div>
        )}

        {/* History view */}
        {view === "history" && <SessionHistory biomeProgress={{}} />}
      </div>

      {/* Building picker modal */}
      {showPicker && (
        <BuildingPickerModal
          unlockedTypes={unlockedTypes}
          totalSessions={stats.totalSessions}
          onSelect={handlePickBuilding}
          onClose={handleSkipPicker}
        />
      )}
    </div>
  );
}
