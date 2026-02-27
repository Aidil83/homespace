"use client";

import { useState } from "react";
import { BIOMES, BIOME_IDS, DURATION_OPTIONS, type BiomeId } from "./biomes/types";
import { BiomeProgressCard } from "./biome-progress-card";
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

interface BiomeProgressData {
  xp: number;
  level: number;
  collectibles: string[];
}

interface BiomeSelectorProps {
  biomeProgress: Record<string, BiomeProgressData>;
  onStart: (biome: BiomeId, duration: number) => void;
}

export function BiomeSelector({ biomeProgress, onStart }: BiomeSelectorProps) {
  const [selectedBiome, setSelectedBiome] = useState<BiomeId | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(DURATION_OPTIONS[1].seconds); // default 25m

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{
          fontSize: 22, fontWeight: 700, color: "#e8e8f0", margin: 0,
        }}>
          Choose Your Biome
        </h2>
        <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}>
          Pick an environment and focus duration to begin your session.
        </p>
      </div>

      {/* Biome Grid */}
      <div className="biome-grid" style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 12,
        marginBottom: 24,
      }}>
        <style>{`
          @container (max-width: 720px) {
            .biome-grid { grid-template-columns: repeat(2, 1fr) !important; }
          }
          @container (max-width: 480px) {
            .biome-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
        {BIOME_IDS.map((id) => {
          const meta = BIOMES[id];
          const BiomeComp = BIOME_COMPONENTS[id];
          const isSelected = selectedBiome === id;
          const prog = biomeProgress[id] || { xp: 0, level: 1, collectibles: [] };

          return (
            <div
              key={id}
              onClick={() => setSelectedBiome(isSelected ? null : id)}
              style={{
                borderRadius: 14,
                border: isSelected ? `2px solid ${meta.color}` : "1px solid rgba(255,255,255,0.06)",
                background: isSelected ? `${meta.color}10` : "rgba(255,255,255,0.02)",
                cursor: "pointer",
                overflow: "hidden",
                transition: "all 0.25s ease",
                boxShadow: isSelected ? `0 0 20px ${meta.color}30` : "none",
              }}
            >
              {/* Biome Preview */}
              <div style={{
                height: 120,
                overflow: "hidden",
                position: "relative",
              }}>
                <div style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: "scale(0.7)",
                  transformOrigin: "center center",
                  pointerEvents: "none",
                }}>
                  <BiomeComp progress={isSelected ? 0.6 : 0.35} />
                </div>
              </div>

              {/* Info */}
              <div style={{ padding: "10px 14px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 14 }}>{meta.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: isSelected ? meta.color : "#e8e8f0" }}>
                    {meta.name}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 8 }}>
                  {meta.tagline}
                </div>
                <BiomeProgressCard biomeId={id} progress={prog} compact />
              </div>
            </div>
          );
        })}
      </div>

      {/* Duration Selector + Start (shown when biome selected) */}
      {selectedBiome && (
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: `1px solid ${BIOMES[selectedBiome].color}30`,
          borderRadius: 14,
          padding: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          animation: "biomeSlideUp 0.3s ease-out",
        }}>
          <style>{`
            @keyframes biomeSlideUp {
              from { opacity: 0; transform: translateY(12px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#e8e8f0", marginBottom: 8 }}>
              Duration
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.seconds}
                  onClick={() => setSelectedDuration(opt.seconds)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: "none",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    background: selectedDuration === opt.seconds
                      ? BIOMES[selectedBiome].color
                      : "rgba(255,255,255,0.06)",
                    color: selectedDuration === opt.seconds
                      ? "#fff"
                      : "#9CA3AF",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => onStart(selectedBiome, selectedDuration)}
            style={{
              padding: "10px 28px",
              borderRadius: 10,
              border: "none",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              background: `linear-gradient(135deg, ${BIOMES[selectedBiome].color}, ${BIOMES[selectedBiome].color}cc)`,
              color: "#fff",
              boxShadow: `0 4px 16px ${BIOMES[selectedBiome].color}40`,
              transition: "all 0.2s",
            }}
          >
            Start Focus
          </button>
        </div>
      )}
    </div>
  );
}
