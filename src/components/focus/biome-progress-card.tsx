"use client";

import { BIOMES, type BiomeId } from "./biomes/types";

interface BiomeProgressData {
  xp: number;
  level: number;
  collectibles: string[];
}

interface BiomeProgressCardProps {
  biomeId: BiomeId;
  progress: BiomeProgressData;
  compact?: boolean;
}

export function BiomeProgressCard({ biomeId, progress, compact }: BiomeProgressCardProps) {
  const meta = BIOMES[biomeId];
  const xpInLevel = progress.xp % 100;
  const xpPercent = xpInLevel;

  if (compact) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 11, color: "#9CA3AF" }}>Lv.{progress.level}</span>
        <div style={{
          flex: 1, height: 4, borderRadius: 2,
          background: "rgba(255,255,255,0.06)", overflow: "hidden",
        }}>
          <div style={{
            height: "100%", borderRadius: 2,
            background: meta.color, width: `${xpPercent}%`,
            transition: "width 0.4s ease",
          }} />
        </div>
        <span style={{ fontSize: 10, color: "#6B7280" }}>{xpInLevel}/100</span>
      </div>
    );
  }

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 12,
      padding: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 20 }}>{meta.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#e8e8f0" }}>{meta.name}</div>
          <div style={{ fontSize: 11, color: "#6B7280" }}>{meta.tagline}</div>
        </div>
        <div style={{
          background: `${meta.color}20`, color: meta.color,
          fontSize: 12, fontWeight: 700, padding: "2px 8px",
          borderRadius: 6,
        }}>
          Lv.{progress.level}
        </div>
      </div>

      {/* XP Bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 10, color: "#6B7280" }}>XP</span>
          <span style={{ fontSize: 10, color: meta.color }}>{xpInLevel}/100</span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 3,
            background: `linear-gradient(90deg, ${meta.color}, ${meta.color}cc)`,
            width: `${xpPercent}%`,
            transition: "width 0.6s ease",
          }} />
        </div>
      </div>

      {/* Collectibles */}
      {progress.collectibles.length > 0 && (
        <div>
          <div style={{ fontSize: 10, color: "#6B7280", marginBottom: 6 }}>
            Collectibles ({progress.collectibles.length}/{meta.collectibles.length})
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {progress.collectibles.map((c) => (
              <span key={c} style={{
                fontSize: 10, padding: "2px 6px", borderRadius: 4,
                background: `${meta.color}15`, color: meta.color,
                fontWeight: 500,
              }}>
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
