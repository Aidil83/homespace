"use client";

import type { BiomeProps } from "./types";

export function FathomBiome({ progress }: BiomeProps) {
  const depth = progress; // 0 = surface, 1 = abyss
  const bgTop = depth < 0.33 ? "#0c4a6e" : depth < 0.66 ? "#082f49" : "#020617";
  const bgBot = depth < 0.33 ? "#0284c7" : depth < 0.66 ? "#0c4a6e" : "#0f172a";
  const bubbleCount = 4 + Math.floor(progress * 6);
  const lightOpacity = Math.max(0, 0.3 - progress * 0.35);
  const creatureOpacity = Math.min(1, Math.max(0, (progress - 0.25) * 2));
  const deepOpacity = Math.min(1, Math.max(0, (progress - 0.6) * 2.5));

  return (
    <svg viewBox="0 0 300 300" width="100%" height="100%">
      <style>{`
        @keyframes fathomBubble {
          0% { opacity: 0.7; transform: translateY(0) translateX(0); }
          50% { transform: translateY(-60px) translateX(var(--bx, 5px)); }
          100% { opacity: 0; transform: translateY(-120px) translateX(var(--bx2, -3px)); }
        }
        @keyframes fathomJelly {
          0%, 100% { transform: translateY(0) scaleY(1); }
          50% { transform: translateY(-8px) scaleY(0.9); }
        }
        @keyframes fathomGlow {
          0%, 100% { opacity: ${deepOpacity}; }
          50% { opacity: ${deepOpacity * 0.5}; }
        }
        @keyframes fathomWave {
          0% { transform: translateX(0); }
          100% { transform: translateX(-20px); }
        }
      `}</style>

      <defs>
        <linearGradient id="fathomBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={bgTop} />
          <stop offset="100%" stopColor={bgBot} />
        </linearGradient>
        <radialGradient id="bioGlow">
          <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background gradient shifts with depth */}
      <rect width="300" height="300" rx="16" fill="url(#fathomBg)" />

      {/* Surface light rays */}
      {lightOpacity > 0 && (
        <g opacity={lightOpacity}>
          <rect x="80" y="-10" width="8" height="120" rx="4" fill="#38BDF8" opacity="0.2" transform="rotate(12 84 50)" />
          <rect x="150" y="-10" width="6" height="100" rx="3" fill="#38BDF8" opacity="0.15" transform="rotate(-5 153 40)" />
          <rect x="200" y="-10" width="10" height="130" rx="5" fill="#38BDF8" opacity="0.18" transform="rotate(8 205 55)" />
        </g>
      )}

      {/* Bubbles */}
      {Array.from({ length: bubbleCount }).map((_, i) => (
        <circle
          key={`b${i}`}
          cx={40 + i * 30 + Math.sin(i) * 15}
          cy={250 - i * 10}
          r={2 + (i % 3)}
          fill="none"
          stroke="#38BDF8"
          strokeWidth="0.5"
          opacity="0.4"
          style={{
            ["--bx" as string]: `${Math.sin(i * 2) * 8}px`,
            ["--bx2" as string]: `${Math.cos(i * 3) * 6}px`,
            animation: `fathomBubble ${3 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.6}s`,
          }}
        />
      ))}

      {/* Mid-depth creatures: jellyfish */}
      {creatureOpacity > 0 && (
        <g opacity={creatureOpacity}>
          <g style={{ animation: "fathomJelly 3s ease-in-out infinite", transformOrigin: "80px 140px" }}>
            <ellipse cx="80" cy="140" rx="16" ry="12" fill="#C084FC" opacity="0.5" />
            <ellipse cx="80" cy="140" rx="10" ry="8" fill="#E9D5FF" opacity="0.3" />
            <line x1="72" y1="152" x2="68" y2="175" stroke="#C084FC" strokeWidth="1" opacity="0.4" />
            <line x1="80" y1="152" x2="80" y2="178" stroke="#C084FC" strokeWidth="1" opacity="0.4" />
            <line x1="88" y1="152" x2="92" y2="172" stroke="#C084FC" strokeWidth="1" opacity="0.4" />
          </g>
          <g style={{ animation: "fathomJelly 4s ease-in-out infinite", animationDelay: "1s", transformOrigin: "220px 110px" }}>
            <ellipse cx="220" cy="110" rx="12" ry="9" fill="#38BDF8" opacity="0.4" />
            <line x1="214" y1="119" x2="212" y2="138" stroke="#38BDF8" strokeWidth="0.8" opacity="0.3" />
            <line x1="220" y1="119" x2="220" y2="140" stroke="#38BDF8" strokeWidth="0.8" opacity="0.3" />
            <line x1="226" y1="119" x2="228" y2="136" stroke="#38BDF8" strokeWidth="0.8" opacity="0.3" />
          </g>
        </g>
      )}

      {/* Small fish */}
      {creatureOpacity > 0 && (
        <g opacity={creatureOpacity * 0.7} style={{ animation: "fathomWave 6s linear infinite" }}>
          <ellipse cx="180" cy="180" rx="8" ry="4" fill="#0EA5E9" opacity="0.5" />
          <polygon points="188,180 194,176 194,184" fill="#0EA5E9" opacity="0.4" />
        </g>
      )}

      {/* Deep creatures: anglerfish with lure */}
      {deepOpacity > 0 && (
        <g opacity={deepOpacity}>
          {/* Anglerfish silhouette */}
          <ellipse cx="160" cy="230" rx="25" ry="18" fill="#1E293B" />
          <ellipse cx="145" cy="228" rx="4" ry="3" fill="#0F172A" />
          <circle cx="147" cy="226" r="2" fill="#38BDF8" opacity="0.6" />
          {/* Lure */}
          <path d="M170 215 Q175 200 168 195" stroke="#475569" strokeWidth="1" fill="none" />
          <circle cx="168" cy="193" r="4" fill="#06B6D4" style={{ animation: "fathomGlow 2s ease-in-out infinite" }}>
          </circle>
          <circle cx="168" cy="193" r="8" fill="url(#bioGlow)" style={{ animation: "fathomGlow 2s ease-in-out infinite" }} />

          {/* Bioluminescent particles */}
          {Array.from({ length: 8 }).map((_, i) => (
            <circle
              key={`p${i}`}
              cx={50 + i * 30 + Math.sin(i * 1.5) * 20}
              cy={180 + Math.cos(i * 2) * 40}
              r="2"
              fill="#06B6D4"
              opacity={0.2 + Math.sin(i) * 0.2}
              style={{ animation: `fathomGlow ${2 + i * 0.3}s ease-in-out infinite`, animationDelay: `${i * 0.4}s` }}
            />
          ))}
        </g>
      )}

      {/* Coral at bottom */}
      {progress > 0.4 && (
        <g opacity={Math.min(1, (progress - 0.4) * 3)}>
          <rect x="20" y="270" width="8" height="25" rx="4" fill="#0E7490" opacity="0.4" />
          <rect x="35" y="265" width="6" height="30" rx="3" fill="#0891B2" opacity="0.3" />
          <rect x="255" y="272" width="7" height="22" rx="3" fill="#0E7490" opacity="0.35" />
          <rect x="270" y="268" width="5" height="26" rx="2" fill="#06B6D4" opacity="0.25" />
        </g>
      )}
    </svg>
  );
}
