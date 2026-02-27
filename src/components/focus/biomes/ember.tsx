"use client";

import type { BiomeProps } from "./types";

export function EmberBiome({ progress }: BiomeProps) {
  const flameCount = Math.floor(3 + progress * 7);
  const glowRadius = 20 + progress * 60;
  const glowOpacity = 0.15 + progress * 0.45;
  const emberCount = Math.floor(progress * 12);

  return (
    <svg viewBox="0 0 300 300" width="100%" height="100%">
      <style>{`
        @keyframes emberFlicker {
          0%, 100% { transform: scaleY(1) scaleX(1); }
          25% { transform: scaleY(1.06) scaleX(0.96); }
          50% { transform: scaleY(0.94) scaleX(1.04); }
          75% { transform: scaleY(1.03) scaleX(0.97); }
        }
        @keyframes emberFloat {
          0% { opacity: 1; transform: translateY(0) translateX(0); }
          100% { opacity: 0; transform: translateY(-80px) translateX(var(--dx, 10px)); }
        }
        @keyframes emberGlow {
          0%, 100% { opacity: ${glowOpacity}; }
          50% { opacity: ${glowOpacity * 0.7}; }
        }
      `}</style>

      <defs>
        <radialGradient id="emberGlow">
          <stop offset="0%" stopColor="#F97316" stopOpacity={glowOpacity} />
          <stop offset="60%" stopColor="#DC2626" stopOpacity={glowOpacity * 0.4} />
          <stop offset="100%" stopColor="#DC2626" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background */}
      <rect width="300" height="300" rx="16" fill="#1a0a04" />

      {/* Ground glow */}
      <ellipse
        cx="150" cy="230"
        rx={glowRadius * 1.5} ry={glowRadius * 0.4}
        fill="url(#emberGlow)"
        style={{ animation: "emberGlow 3s ease-in-out infinite" }}
      />

      {/* Logs */}
      <rect x="110" y="220" width="80" height="12" rx="6" fill="#5C3A1E" transform="rotate(-8 150 226)" />
      <rect x="115" y="228" width="75" height="11" rx="5" fill="#4A2E16" transform="rotate(5 152 233)" />
      {progress > 0.3 && (
        <rect x="105" y="215" width="85" height="10" rx="5" fill="#6B4226" transform="rotate(-15 147 220)" />
      )}

      {/* Flames */}
      <g style={{ transformOrigin: "150px 200px", animation: "emberFlicker 0.8s ease-in-out infinite" }}>
        {Array.from({ length: flameCount }).map((_, i) => {
          const x = 130 + (i % 5) * 10 + (i > 4 ? 5 : 0);
          const h = 20 + progress * 40 + Math.sin(i * 1.3) * 10;
          const w = 8 + progress * 4;
          const color = i % 3 === 0 ? "#FBBF24" : i % 3 === 1 ? "#F97316" : "#EF4444";
          return (
            <ellipse
              key={i}
              cx={x}
              cy={215 - h / 2}
              rx={w / 2}
              ry={h / 2}
              fill={color}
              opacity={0.7 + progress * 0.3}
              style={{
                animation: `emberFlicker ${0.5 + i * 0.1}s ease-in-out infinite`,
                animationDelay: `${i * 0.07}s`,
                transformOrigin: `${x}px 215px`,
              }}
            />
          );
        })}
        {/* Bright core */}
        <ellipse cx="150" cy="205" rx={6 + progress * 8} ry={10 + progress * 15} fill="#FEF3C7" opacity={0.6 + progress * 0.3} />
      </g>

      {/* Floating embers */}
      {Array.from({ length: emberCount }).map((_, i) => {
        const startX = 130 + Math.sin(i * 2.1) * 30;
        const dx = Math.sin(i * 3.7) * 20;
        return (
          <circle
            key={`e${i}`}
            cx={startX}
            cy={190}
            r={1.5 + (i % 3) * 0.5}
            fill="#FBBF24"
            style={{
              ["--dx" as string]: `${dx}px`,
              animation: `emberFloat ${2 + i * 0.3}s ease-out infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        );
      })}

      {/* Stars in background (visible as fire grows) */}
      {progress > 0.5 && Array.from({ length: 8 }).map((_, i) => (
        <circle
          key={`s${i}`}
          cx={30 + i * 35}
          cy={20 + (i % 3) * 25}
          r="1"
          fill="#fff"
          opacity={0.3 + (progress - 0.5) * 0.6}
        />
      ))}
    </svg>
  );
}
