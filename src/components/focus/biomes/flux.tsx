"use client";

import type { BiomeProps } from "./types";

export function FluxBiome({ progress }: BiomeProps) {
  const bandCount = Math.floor(1 + progress * 4);
  const bandOpacity = 0.15 + progress * 0.55;
  const starBrightness = 0.3 + progress * 0.5;

  const bands = [
    { color: "#4ADE80", y: 40, amplitude: 25 },
    { color: "#A855F7", y: 65, amplitude: 20 },
    { color: "#38BDF8", y: 30, amplitude: 30 },
    { color: "#F472B6", y: 55, amplitude: 22 },
    { color: "#22D3EE", y: 45, amplitude: 28 },
  ];

  return (
    <svg viewBox="0 0 300 300" width="100%" height="100%">
      <style>{`
        @keyframes fluxWave {
          0% { transform: translateX(0); }
          100% { transform: translateX(-40px); }
        }
        @keyframes fluxPulse {
          0%, 100% { opacity: ${bandOpacity}; }
          50% { opacity: ${bandOpacity * 0.6}; }
        }
        @keyframes fluxStar {
          0%, 100% { opacity: ${starBrightness}; }
          50% { opacity: ${starBrightness * 0.4}; }
        }
        @keyframes fluxShoot {
          0% { opacity: 1; transform: translate(0, 0); }
          100% { opacity: 0; transform: translate(60px, 40px); }
        }
      `}</style>

      <defs>
        {bands.slice(0, bandCount).map((band, i) => (
          <linearGradient key={`grad${i}`} id={`fluxBand${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={band.color} stopOpacity="0" />
            <stop offset="50%" stopColor={band.color} stopOpacity="0.6" />
            <stop offset="100%" stopColor={band.color} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>

      {/* Night sky */}
      <rect width="300" height="300" rx="16" fill="#0B0D21" />

      {/* Stars */}
      {Array.from({ length: 25 }).map((_, i) => {
        const x = (i * 47 + i * i * 7) % 290 + 5;
        const y = (i * 31 + i * 13) % 200 + 5;
        const r = i % 4 === 0 ? 1.5 : 1;
        return (
          <circle
            key={`st${i}`}
            cx={x} cy={y} r={r}
            fill="#fff"
            style={{
              animation: `fluxStar ${2 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        );
      })}

      {/* Aurora bands */}
      <g>
        {bands.slice(0, bandCount).map((band, i) => {
          const y = band.y;
          const a = band.amplitude;
          const path = `M-40,${y + a} Q30,${y - a} 100,${y + a * 0.5} Q170,${y - a * 0.7} 240,${y + a * 0.3} Q310,${y - a} 380,${y + a} L380,${y + a + 30} Q310,${y + 30} 240,${y + a + 20} Q170,${y + 20} 100,${y + a + 25} Q30,${y + 20} -40,${y + a + 30} Z`;
          return (
            <path
              key={`band${i}`}
              d={path}
              fill={`url(#fluxBand${i})`}
              opacity={bandOpacity}
              style={{
                animation: `fluxWave ${6 + i * 2}s linear infinite, fluxPulse ${3 + i}s ease-in-out infinite`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          );
        })}
      </g>

      {/* Shooting star (final stage) */}
      {progress > 0.7 && (
        <g opacity={Math.min(1, (progress - 0.7) * 3)}>
          <line
            x1="60" y1="30" x2="70" y2="35"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
            style={{ animation: "fluxShoot 3s ease-in infinite", animationDelay: "1s" }}
          />
          <line
            x1="200" y1="50" x2="210" y2="55"
            stroke="#fff"
            strokeWidth="1"
            strokeLinecap="round"
            style={{ animation: "fluxShoot 4s ease-in infinite", animationDelay: "2.5s" }}
          />
        </g>
      )}

      {/* Mountain silhouettes at bottom */}
      <polygon points="0,300 0,260 40,230 80,255 120,220 160,245 200,215 240,240 280,225 300,250 300,300" fill="#0F172A" opacity="0.8" />
      <polygon points="0,300 0,275 50,250 100,270 150,240 200,265 250,245 300,270 300,300" fill="#1E1B3A" opacity="0.6" />

      {/* Tree silhouettes */}
      <g opacity="0.4">
        <polygon points="30,270 35,240 40,270" fill="#0F172A" />
        <polygon points="60,268 66,232 72,268" fill="#0F172A" />
        <polygon points="250,265 255,235 260,265" fill="#0F172A" />
      </g>
    </svg>
  );
}
