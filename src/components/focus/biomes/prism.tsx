"use client";

import type { BiomeProps } from "./types";

export function PrismBiome({ progress }: BiomeProps) {
  const crystalCount = Math.floor(2 + progress * 8);
  const beamCount = Math.floor(1 + progress * 3);
  const glowIntensity = 0.1 + progress * 0.5;
  const refractOpacity = progress > 0.4 ? Math.min(1, (progress - 0.4) * 2) : 0;

  const crystals = [
    { x: 80, y: 250, h: 35, w: 14, color: "#06B6D4", rot: -8 },
    { x: 130, y: 240, h: 50, w: 16, color: "#8B5CF6", rot: 5 },
    { x: 170, y: 245, h: 42, w: 12, color: "#22D3EE", rot: -3 },
    { x: 210, y: 248, h: 38, w: 15, color: "#A855F7", rot: 10 },
    { x: 60, y: 255, h: 28, w: 10, color: "#06B6D4", rot: -12 },
    { x: 240, y: 252, h: 32, w: 11, color: "#38BDF8", rot: 6 },
    { x: 110, y: 252, h: 30, w: 13, color: "#D946EF", rot: -5 },
    { x: 190, y: 255, h: 25, w: 10, color: "#67E8F9", rot: 8 },
    { x: 150, y: 235, h: 60, w: 18, color: "#E879F9", rot: 2 },
    { x: 100, y: 245, h: 40, w: 14, color: "#2DD4BF", rot: -7 },
  ];

  const beamColors = ["#EF4444", "#22C55E", "#3B82F6", "#FBBF24"];

  return (
    <svg viewBox="0 0 300 300" width="100%" height="100%">
      <style>{`
        @keyframes prismGrow {
          0% { transform: scaleY(0); }
          100% { transform: scaleY(1); }
        }
        @keyframes prismPulse {
          0%, 100% { opacity: ${glowIntensity}; filter: brightness(1); }
          50% { opacity: ${glowIntensity * 1.3}; filter: brightness(1.2); }
        }
        @keyframes prismRefract {
          0%, 100% { opacity: ${refractOpacity}; }
          50% { opacity: ${refractOpacity * 0.6}; }
        }
        @keyframes prismParticle {
          0% { opacity: 0.8; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-40px); }
        }
      `}</style>

      <defs>
        <radialGradient id="prismCaveGlow">
          <stop offset="0%" stopColor="#06B6D4" stopOpacity={glowIntensity * 0.4} />
          <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Cave background */}
      <rect width="300" height="300" rx="16" fill="#0C1520" />

      {/* Cave walls */}
      <g opacity="0.2">
        <ellipse cx="0" cy="150" rx="30" ry="150" fill="#1E293B" />
        <ellipse cx="300" cy="150" rx="30" ry="150" fill="#1E293B" />
        <ellipse cx="150" cy="0" rx="120" ry="25" fill="#1E293B" />
      </g>

      {/* Light beam from above */}
      <polygon
        points="140,0 160,0 180,150 120,150"
        fill="#fff"
        opacity={0.04 + progress * 0.06}
      />

      {/* Refracted beams (appear mid-progress) */}
      {beamColors.slice(0, beamCount).map((color, i) => {
        const angle = -30 + i * 20;
        const x2 = 150 + Math.cos((angle * Math.PI) / 180) * 120;
        const y2 = 150 + Math.sin((angle * Math.PI) / 180) * 100;
        return (
          <line
            key={`beam${i}`}
            x1="150" y1="140"
            x2={x2} y2={y2}
            stroke={color}
            strokeWidth="2"
            opacity={refractOpacity * 0.4}
            style={{ animation: `prismRefract ${2 + i * 0.5}s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }}
          />
        );
      })}

      {/* Cave glow (from crystals) */}
      <ellipse
        cx="150" cy="260"
        rx={80 + progress * 40} ry={30 + progress * 15}
        fill="url(#prismCaveGlow)"
        style={{ animation: "prismPulse 4s ease-in-out infinite" }}
      />

      {/* Crystals */}
      {crystals.slice(0, crystalCount).map((c, i) => {
        const scale = 0.5 + progress * 0.5;
        return (
          <g
            key={`cr${i}`}
            style={{
              transformOrigin: `${c.x}px ${c.y}px`,
              animation: `prismGrow 0.8s ease-out ${i * 0.1}s both`,
            }}
          >
            {/* Crystal body */}
            <polygon
              points={`${c.x},${c.y - c.h * scale} ${c.x - c.w / 2},${c.y} ${c.x + c.w / 2},${c.y}`}
              fill={c.color}
              opacity={0.6 + progress * 0.3}
              transform={`rotate(${c.rot} ${c.x} ${c.y})`}
              style={{
                filter: progress > 0.5 ? `drop-shadow(0 0 ${progress * 6}px ${c.color})` : undefined,
                animation: `prismPulse ${3 + i * 0.4}s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
            {/* Crystal highlight */}
            <polygon
              points={`${c.x},${c.y - c.h * scale} ${c.x - c.w / 4},${c.y - c.h * scale * 0.3} ${c.x},${c.y}`}
              fill="#fff"
              opacity={0.1 + progress * 0.1}
              transform={`rotate(${c.rot} ${c.x} ${c.y})`}
            />
          </g>
        );
      })}

      {/* Light particles (high progress) */}
      {progress > 0.5 && Array.from({ length: 6 }).map((_, i) => (
        <circle
          key={`lp${i}`}
          cx={80 + i * 30 + Math.sin(i * 2) * 15}
          cy={220}
          r="1.5"
          fill={beamColors[i % beamColors.length]}
          style={{
            animation: `prismParticle ${2 + i * 0.3}s ease-out infinite`,
            animationDelay: `${i * 0.5}s`,
          }}
        />
      ))}

      {/* Stalactites */}
      <g opacity="0.25">
        <polygon points="50,0 55,35 45,35" fill="#334155" />
        <polygon points="120,0 124,28 116,28" fill="#334155" />
        <polygon points="230,0 234,32 226,32" fill="#334155" />
        <polygon points="270,0 273,22 267,22" fill="#334155" />
      </g>
    </svg>
  );
}
