"use client";

import { useState } from "react";
import { BUILDING_META, BUILDING_TIERS, type BuildingType } from "@/lib/village/types";

interface BuildingPickerModalProps {
  unlockedTypes: BuildingType[];
  totalSessions: number;
  onSelect: (type: BuildingType) => void;
  onClose: () => void;
}

export function BuildingPickerModal({
  unlockedTypes,
  totalSessions,
  onSelect,
  onClose,
}: BuildingPickerModalProps) {
  const [selected, setSelected] = useState<BuildingType | null>(null);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)",
          borderRadius: 16,
          padding: 28,
          maxWidth: 480,
          width: "90%",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <h2
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#e8e8f0",
            margin: "0 0 4px",
            textAlign: "center",
          }}
        >
          Session Complete!
        </h2>
        <p
          style={{
            color: "#9CA3AF",
            fontSize: 13,
            margin: "0 0 20px",
            textAlign: "center",
          }}
        >
          Choose a building to add to your village
        </p>

        {/* Building tiers */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {BUILDING_TIERS.map((tier, tierIdx) => {
            const isLocked = totalSessions < tier.minSessions;
            return (
              <div key={tierIdx}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: isLocked ? "#4B5563" : "#9CA3AF",
                    marginBottom: 6,
                  }}
                >
                  {isLocked
                    ? `Unlocks at ${tier.minSessions} sessions (${tier.minSessions - totalSessions} more)`
                    : `Tier ${tierIdx + 1}`}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 8,
                  }}
                >
                  {tier.buildings.map((type) => {
                    const meta = BUILDING_META[type];
                    const unlocked = unlockedTypes.includes(type);
                    const isSelected = selected === type;

                    return (
                      <button
                        key={type}
                        onClick={() => unlocked && setSelected(type)}
                        disabled={!unlocked}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 12px",
                          borderRadius: 10,
                          border: isSelected
                            ? "2px solid #4F8EF7"
                            : "1px solid rgba(255,255,255,0.08)",
                          background: isSelected
                            ? "rgba(79,142,247,0.12)"
                            : unlocked
                              ? "rgba(255,255,255,0.03)"
                              : "rgba(255,255,255,0.01)",
                          cursor: unlocked ? "pointer" : "not-allowed",
                          opacity: unlocked ? 1 : 0.4,
                          textAlign: "left",
                          color: "#e8e8f0",
                          transition: "all 0.15s",
                        }}
                      >
                        <span style={{ fontSize: 22 }}>{meta.icon}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>
                            {meta.name}
                          </div>
                          <div style={{ fontSize: 10, color: "#6B7280" }}>
                            {meta.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 20,
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "transparent",
              color: "#9CA3AF",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Skip
          </button>
          <button
            onClick={() => selected && onSelect(selected)}
            disabled={!selected}
            style={{
              padding: "8px 22px",
              borderRadius: 8,
              border: "none",
              background: selected
                ? "linear-gradient(135deg, #4F8EF7, #6366F1)"
                : "rgba(255,255,255,0.05)",
              color: selected ? "#fff" : "#6B7280",
              fontSize: 13,
              fontWeight: 700,
              cursor: selected ? "pointer" : "not-allowed",
              transition: "all 0.15s",
            }}
          >
            Place Building
          </button>
        </div>
      </div>
    </div>
  );
}
