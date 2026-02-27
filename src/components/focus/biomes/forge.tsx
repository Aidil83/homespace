"use client";

import type { BiomeProps } from "./types";

export function ForgeBiome({ progress }: BiomeProps) {
  const heatOpacity = 0.1 + progress * 0.6;
  const sparkCount = Math.floor(progress * 10);
  const metalGlow = progress > 0.3 ? Math.min(1, (progress - 0.3) * 2) : 0;
  const forgedOpacity = progress > 0.65 ? Math.min(1, (progress - 0.65) * 3) : 0;

  return (
    <svg viewBox="0 0 300 300" width="100%" height="100%">
      <style>{`
        @keyframes forgeHammer {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(-25deg); }
          30% { transform: rotate(5deg); }
        }
        @keyframes forgeSpark {
          0% { opacity: 1; transform: translate(0, 0) scale(1); }
          100% { opacity: 0; transform: translate(var(--sx, 20px), var(--sy, -30px)) scale(0); }
        }
        @keyframes forgeCoalGlow {
          0%, 100% { opacity: ${heatOpacity}; }
          50% { opacity: ${heatOpacity * 0.7}; }
        }
        @keyframes forgePulse {
          0%, 100% { opacity: ${forgedOpacity}; }
          50% { opacity: ${forgedOpacity * 0.6}; }
        }
      `}</style>

      <defs>
        <radialGradient id="forgeHeat">
          <stop offset="0%" stopColor="#F97316" stopOpacity={heatOpacity} />
          <stop offset="50%" stopColor="#DC2626" stopOpacity={heatOpacity * 0.5} />
          <stop offset="100%" stopColor="#7F1D1D" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background */}
      <rect width="300" height="300" rx="16" fill="#1C1008" />

      {/* Brick wall background */}
      <g opacity="0.15">
        {Array.from({ length: 5 }).map((_, row) =>
          Array.from({ length: 6 }).map((_, col) => (
            <rect
              key={`br${row}-${col}`}
              x={col * 52 + (row % 2) * 26 - 10}
              y={row * 28 + 10}
              width="48"
              height="24"
              rx="2"
              fill="none"
              stroke="#78350F"
              strokeWidth="1"
            />
          ))
        )}
      </g>

      {/* Coal bed glow */}
      <ellipse
        cx="150" cy="250"
        rx={60 + progress * 20} ry="20"
        fill="url(#forgeHeat)"
        style={{ animation: "forgeCoalGlow 2s ease-in-out infinite" }}
      />

      {/* Coals */}
      {Array.from({ length: 5 }).map((_, i) => (
        <ellipse
          key={`c${i}`}
          cx={120 + i * 15}
          cy={245 + Math.sin(i) * 4}
          rx="8" ry="5"
          fill={progress > 0.2 ? "#F97316" : "#78350F"}
          opacity={0.5 + progress * 0.4}
          style={progress > 0.2 ? { animation: `forgeCoalGlow ${1.5 + i * 0.2}s ease-in-out infinite`, animationDelay: `${i * 0.3}s` } : undefined}
        />
      ))}

      {/* Anvil */}
      <g>
        {/* Anvil base */}
        <rect x="115" y="215" width="70" height="35" rx="3" fill="#374151" />
        {/* Anvil top (working surface) */}
        <rect x="105" y="205" width="90" height="14" rx="4" fill="#4B5563" />
        {/* Anvil horn */}
        <polygon points="105,212 85,210 105,208" fill="#4B5563" />
      </g>

      {/* Metal piece on anvil */}
      {progress > 0.1 && (
        <rect
          x="135" y="198" width="30" height="8" rx="2"
          fill={metalGlow > 0 ? "#FBBF24" : "#6B7280"}
          opacity={0.6 + metalGlow * 0.4}
          style={metalGlow > 0 ? { filter: `drop-shadow(0 0 ${metalGlow * 6}px #F97316)` } : undefined}
        />
      )}

      {/* Hammer */}
      {progress > 0.2 && (
        <g style={{
          transformOrigin: "200px 180px",
          animation: progress > 0.3 ? `forgeHammer ${1.2 - progress * 0.4}s ease-in-out infinite` : undefined,
        }}>
          {/* Handle */}
          <rect x="195" y="150" width="6" height="50" rx="2" fill="#92400E" />
          {/* Head */}
          <rect x="185" y="142" width="26" height="14" rx="3" fill="#6B7280" />
        </g>
      )}

      {/* Sparks */}
      {Array.from({ length: sparkCount }).map((_, i) => {
        const angle = (i / sparkCount) * Math.PI * 2;
        const dist = 20 + ((i * 17) % 30);
        return (
          <circle
            key={`sp${i}`}
            cx="150" cy="205"
            r="1.5"
            fill="#FBBF24"
            style={{
              ["--sx" as string]: `${Math.cos(angle) * dist}px`,
              ["--sy" as string]: `${Math.sin(angle) * dist - 20}px`,
              animation: `forgeSpark ${0.6 + i * 0.1}s ease-out infinite`,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        );
      })}

      {/* Forged item (sword silhouette) */}
      {forgedOpacity > 0 && (
        <g opacity={forgedOpacity} style={{ animation: "forgePulse 3s ease-in-out infinite" }}>
          <rect x="143" y="160" width="14" height="40" rx="2" fill="#FBBF24" filter="drop-shadow(0 0 8px #F97316)" />
          <rect x="135" y="196" width="30" height="6" rx="3" fill="#D97706" />
          <rect x="146" y="200" width="8" height="12" rx="2" fill="#92400E" />
        </g>
      )}

      {/* Tool rack on wall */}
      <g opacity="0.3">
        <line x1="30" y1="100" x2="30" y2="180" stroke="#78350F" strokeWidth="2" />
        <rect x="24" y="110" width="12" height="4" rx="1" fill="#6B7280" />
        <rect x="24" y="140" width="12" height="4" rx="1" fill="#6B7280" />
        <rect x="24" y="170" width="12" height="4" rx="1" fill="#6B7280" />
      </g>
    </svg>
  );
}
