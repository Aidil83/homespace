"use client";

import { useState, useRef, useCallback } from "react";
import type { BiomeId } from "./biomes/types";
import { BIOMES } from "./biomes/types";
import { WorldZone } from "./world-zone";

const ZONE_CENTERS: Record<BiomeId, { cx: number; cy: number }> = {
  flux: { cx: 300, cy: 150 },
  signal: { cx: 600, cy: 150 },
  prism: { cx: 150, cy: 350 },
  fathom: { cx: 750, cy: 350 },
  ember: { cx: 300, cy: 550 },
  forge: { cx: 600, cy: 550 },
};

const ZONE_ORDER: BiomeId[] = [
  "flux",
  "signal",
  "prism",
  "fathom",
  "ember",
  "forge",
];

const ZOOM_SCALE = 2.2;

interface BiomeProgressData {
  xp: number;
  level: number;
  collectibles: string[];
}

interface WorldMapProps {
  biomeProgress: Record<string, BiomeProgressData>;
  onStartSession: (biome: BiomeId) => void;
}

export function WorldMap({ biomeProgress, onStartSession }: WorldMapProps) {
  const [focusedZone, setFocusedZone] = useState<BiomeId | null>(null);
  const [tooltip, setTooltip] = useState<{
    name: string;
    x: number;
    y: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getProgress = (biome: BiomeId): BiomeProgressData =>
    biomeProgress[biome] || { xp: 0, level: 1, collectibles: [] };

  const handleZoneClick = useCallback((biome: BiomeId) => {
    setFocusedZone((prev) => (prev === biome ? null : biome));
    setTooltip(null);
  }, []);

  const handleCollectibleHover = useCallback(
    (name: string | null, e?: React.PointerEvent) => {
      if (!name || !e) {
        setTooltip(null);
        return;
      }
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setTooltip({
          name,
          x: e.clientX - rect.left,
          y: e.clientY - rect.top - 32,
        });
      }
    },
    [],
  );

  const getZoomStyle = (): React.CSSProperties => {
    if (!focusedZone) {
      return {
        transform: "translate(0px, 0px) scale(1)",
        transformOrigin: "0 0",
        transition: "transform 0.5s ease-in-out",
      };
    }
    const { cx, cy } = ZONE_CENTERS[focusedZone];
    const tx = 450 - cx * ZOOM_SCALE;
    const ty = 350 - cy * ZOOM_SCALE;
    return {
      transform: `translate(${tx}px, ${ty}px) scale(${ZOOM_SCALE})`,
      transformOrigin: "0 0",
      transition: "transform 0.5s ease-in-out",
    };
  };

  const focused = focusedZone ? getProgress(focusedZone) : null;
  const focusedMeta = focusedZone ? BIOMES[focusedZone] : null;

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 14,
        background: "#050510",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <svg
        viewBox="0 0 900 700"
        width="100%"
        style={{ display: "block" }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter
            id="collectibleGlow"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="oceanGrad" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#0c0c1e" />
            <stop offset="100%" stopColor="#050510" />
          </radialGradient>
        </defs>

        <g style={getZoomStyle()}>
          {/* Ocean / void background */}
          <rect width={900} height={700} fill="url(#oceanGrad)" />

          {/* Island outline — organic shape encompassing all zones */}
          <path
            d="M450,20 C720,15 895,140 890,360 C885,580 700,690 450,695 C200,690 15,580 10,360 C5,140 180,15 450,20 Z"
            fill="#0e1225"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={1.5}
          />

          {/* Subtle interior texture lines */}
          <path
            d="M200,200 C350,220 550,180 700,200"
            fill="none"
            stroke="rgba(255,255,255,0.015)"
            strokeWidth={1}
          />
          <path
            d="M150,400 C300,380 600,420 750,400"
            fill="none"
            stroke="rgba(255,255,255,0.015)"
            strokeWidth={1}
          />

          {/* Biome zones */}
          {ZONE_ORDER.map((biome) => {
            const { cx, cy } = ZONE_CENTERS[biome];
            const p = getProgress(biome);
            return (
              <g
                key={biome}
                transform={`translate(${cx - 130}, ${cy - 110})`}
              >
                <WorldZone
                  biome={biome}
                  level={p.level}
                  earnedCollectibles={p.collectibles}
                  onZoneClick={() => handleZoneClick(biome)}
                  onCollectibleHover={handleCollectibleHover}
                />
              </g>
            );
          })}
        </g>
      </svg>

      {/* Collectible tooltip */}
      {tooltip && (
        <div
          style={{
            position: "absolute",
            left: tooltip.x,
            top: tooltip.y,
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.88)",
            color: "#e8e8f0",
            padding: "4px 10px",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 500,
            pointerEvents: "none",
            whiteSpace: "nowrap",
            zIndex: 10,
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {tooltip.name}
        </div>
      )}

      {/* Back to Map button */}
      {focusedZone && (
        <button
          onClick={() => {
            setFocusedZone(null);
            setTooltip(null);
          }}
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            padding: "6px 14px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(0,0,0,0.7)",
            color: "#e8e8f0",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            zIndex: 10,
            backdropFilter: "blur(8px)",
          }}
        >
          ← Back to Map
        </button>
      )}

      {/* Zone info panel (when zoomed) */}
      {focusedZone && focused && focusedMeta && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "20px 20px 16px",
            background:
              "linear-gradient(to top, rgba(0,0,0,0.88) 60%, transparent)",
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              maxWidth: 560,
              margin: "0 auto",
              flexWrap: "wrap",
            }}
          >
            {/* Biome name + stats */}
            <div style={{ minWidth: 120 }}>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  fontFamily: "'Outfit', sans-serif",
                  color: "#e8e8f0",
                }}
              >
                {focusedMeta.icon} {focusedMeta.name}
              </div>
              <div
                style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}
              >
                Level {focused.level} ·{" "}
                {focused.collectibles.length}/
                {focusedMeta.collectibles.length} collectibles
              </div>
            </div>

            {/* XP progress bar */}
            <div style={{ flex: 1, minWidth: 100 }}>
              <div
                style={{
                  height: 6,
                  borderRadius: 3,
                  background: "rgba(255,255,255,0.08)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${focused.xp % 100}%`,
                    height: "100%",
                    borderRadius: 3,
                    background: focusedMeta.color,
                    transition: "width 0.3s",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#6B7280",
                  marginTop: 3,
                }}
              >
                {focused.xp % 100}/100 XP
              </div>
            </div>

            {/* Start session button */}
            <button
              onClick={() => onStartSession(focusedZone)}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                border: "none",
                background: focusedMeta.color,
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Start Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
