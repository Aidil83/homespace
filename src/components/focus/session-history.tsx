"use client";

import { useEffect, useState } from "react";
import { BIOMES, BIOME_IDS, type BiomeId } from "./biomes/types";
import { BiomeProgressCard } from "./biome-progress-card";

interface Session {
  id: string;
  biome: string;
  duration: number;
  elapsed: number;
  status: string;
  collectible: string | null;
  createdAt: string;
}

interface BiomeProgressData {
  xp: number;
  level: number;
  collectibles: string[];
}

interface SessionHistoryProps {
  biomeProgress: Record<string, BiomeProgressData>;
}

export function SessionHistory({ biomeProgress }: SessionHistoryProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/focus?limit=30")
      .then((r) => r.json())
      .then((data) => {
        setSessions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const completed = sessions.filter((s) => s.status === "completed");
  const totalMinutes = completed.reduce((sum, s) => sum + Math.floor(s.elapsed / 60), 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainMins = totalMinutes % 60;

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#e8e8f0", margin: "0 0 20px" }}>
        History
      </h2>

      {/* Stats Row */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12,
        marginBottom: 24,
      }}>
        <div style={{
          background: "rgba(255,255,255,0.03)", borderRadius: 12,
          padding: 14, border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#4F8EF7" }}>
            {completed.length}
          </div>
          <div style={{ fontSize: 11, color: "#6B7280" }}>Sessions</div>
        </div>
        <div style={{
          background: "rgba(255,255,255,0.03)", borderRadius: 12,
          padding: 14, border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#34D399" }}>
            {totalHours > 0 ? `${totalHours}h ${remainMins}m` : `${remainMins}m`}
          </div>
          <div style={{ fontSize: 11, color: "#6B7280" }}>Total Focus</div>
        </div>
        <div style={{
          background: "rgba(255,255,255,0.03)", borderRadius: 12,
          padding: 14, border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#F59E0B" }}>
            {completed.reduce((sum, s) => sum + Math.floor(s.elapsed / 60), 0)}
          </div>
          <div style={{ fontSize: 11, color: "#6B7280" }}>Total XP</div>
        </div>
      </div>

      {/* Biome Progress Cards */}
      <h3 style={{ fontSize: 15, fontWeight: 600, color: "#9CA3AF", margin: "0 0 12px" }}>
        Biome Progress
      </h3>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10,
        marginBottom: 28,
      }}>
        {BIOME_IDS.map((id) => (
          <BiomeProgressCard
            key={id}
            biomeId={id}
            progress={biomeProgress[id] || { xp: 0, level: 1, collectibles: [] }}
          />
        ))}
      </div>

      {/* Recent Sessions */}
      <h3 style={{ fontSize: 15, fontWeight: 600, color: "#9CA3AF", margin: "0 0 12px" }}>
        Recent Sessions
      </h3>
      {loading ? (
        <div style={{ color: "#6B7280", fontSize: 13, padding: 20, textAlign: "center" }}>
          Loading...
        </div>
      ) : sessions.length === 0 ? (
        <div style={{ color: "#6B7280", fontSize: 13, padding: 20, textAlign: "center" }}>
          No sessions yet. Start your first focus session!
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {sessions.map((s) => {
            const meta = BIOMES[s.biome as BiomeId];
            if (!meta) return null;
            const mins = Math.floor(s.elapsed / 60);
            const date = new Date(s.createdAt);
            const dateStr = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
            const timeStr = date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

            return (
              <div key={s.id} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 12px", borderRadius: 8,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: 2,
                  background: s.status === "completed" ? meta.color : "#6B7280",
                  flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#d1d5db" }}>
                    {meta.icon} {meta.name}
                    {s.collectible && (
                      <span style={{
                        marginLeft: 6, fontSize: 10, color: meta.color,
                        background: `${meta.color}15`, padding: "1px 5px", borderRadius: 3,
                      }}>
                        {s.collectible}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 10, color: "#6B7280" }}>
                    {dateStr} at {timeStr}
                  </div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: meta.color, flexShrink: 0 }}>
                  {mins}m
                </div>
                <div style={{
                  fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 4,
                  background: s.status === "completed" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                  color: s.status === "completed" ? "#22C55E" : "#EF4444",
                  flexShrink: 0,
                }}>
                  {s.status === "completed" ? "DONE" : "LEFT"}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
