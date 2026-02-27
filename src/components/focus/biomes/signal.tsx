"use client";

import type { BiomeProps } from "./types";

export function SignalBiome({ progress }: BiomeProps) {
  const ringCount = Math.floor(1 + progress * 5);
  const ringOpacity = 0.15 + progress * 0.4;
  const towerLight = progress < 0.33 ? "#EF4444" : progress < 0.66 ? "#F59E0B" : "#22C55E";
  const contactOpacity = progress > 0.7 ? Math.min(1, (progress - 0.7) * 3.3) : 0;
  const starRespond = progress > 0.5;

  return (
    <svg viewBox="0 0 300 300" width="100%" height="100%">
      <style>{`
        @keyframes signalRing {
          0% { transform: scale(1); opacity: ${ringOpacity}; }
          100% { transform: scale(3); opacity: 0; }
        }
        @keyframes signalBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
        @keyframes signalStarPulse {
          0%, 100% { opacity: 0.3; r: 1; }
          50% { opacity: 0.8; r: 2; }
        }
        @keyframes signalNebula {
          0%, 100% { opacity: ${contactOpacity * 0.4}; }
          50% { opacity: ${contactOpacity * 0.7}; }
        }
        @keyframes signalScan {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <defs>
        <radialGradient id="signalTowerGlow">
          <stop offset="0%" stopColor={towerLight} stopOpacity="0.3" />
          <stop offset="100%" stopColor={towerLight} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="signalNebula">
          <stop offset="0%" stopColor="#A855F7" stopOpacity="0.4" />
          <stop offset="40%" stopColor="#7C3AED" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Space background */}
      <rect width="300" height="300" rx="16" fill="#050A15" />

      {/* Stars */}
      {Array.from({ length: 30 }).map((_, i) => {
        const x = (i * 43 + i * i * 11) % 290 + 5;
        const y = (i * 29 + i * 17) % 200 + 5;
        const responding = starRespond && i % 5 === 0;
        return (
          <circle
            key={`s${i}`}
            cx={x} cy={y}
            r={i % 5 === 0 ? 1.5 : 1}
            fill={responding ? "#22C55E" : "#fff"}
            opacity={responding ? undefined : 0.3 + (i % 4) * 0.15}
            style={responding ? { animation: `signalStarPulse ${1.5 + (i % 3) * 0.5}s ease-in-out infinite`, animationDelay: `${i * 0.2}s` } : undefined}
          />
        );
      })}

      {/* Nebula / galaxy (contact achieved) */}
      {contactOpacity > 0 && (
        <ellipse
          cx="220" cy="60"
          rx="45" ry="30"
          fill="url(#signalNebula)"
          transform="rotate(-20 220 60)"
          style={{ animation: "signalNebula 4s ease-in-out infinite" }}
        />
      )}

      {/* Ground / alien landscape */}
      <ellipse cx="150" cy="290" rx="180" ry="30" fill="#0F172A" />
      <ellipse cx="150" cy="288" rx="160" ry="18" fill="#1E293B" opacity="0.5" />

      {/* Tower structure */}
      <g>
        {/* Base */}
        <rect x="140" y="240" width="20" height="15" rx="2" fill="#374151" />
        {/* Main column */}
        <rect x="146" y="160" width="8" height="80" fill="#4B5563" />
        {/* Cross beams */}
        <line x1="138" y1="200" x2="162" y2="200" stroke="#4B5563" strokeWidth="2" />
        <line x1="140" y1="220" x2="160" y2="220" stroke="#4B5563" strokeWidth="2" />
        <line x1="142" y1="180" x2="158" y2="180" stroke="#4B5563" strokeWidth="1.5" />
        {/* Diagonal supports */}
        <line x1="140" y1="240" x2="148" y2="200" stroke="#4B5563" strokeWidth="1" opacity="0.6" />
        <line x1="160" y1="240" x2="152" y2="200" stroke="#4B5563" strokeWidth="1" opacity="0.6" />
        {/* Dish */}
        <ellipse cx="150" cy="158" rx="18" ry="6" fill="#6B7280" transform="rotate(-15 150 158)" />
        <line x1="150" y1="158" x2="150" y2="148" stroke="#6B7280" strokeWidth="2" />
        {/* Tip light */}
        <circle
          cx="150" cy="145"
          r="3"
          fill={towerLight}
          style={{ animation: `signalBlink ${progress > 0.5 ? 0.5 : 1.5}s ease-in-out infinite` }}
        />
        {/* Tip glow */}
        <circle cx="150" cy="145" r="12" fill="url(#signalTowerGlow)" />
      </g>

      {/* Signal rings */}
      {Array.from({ length: ringCount }).map((_, i) => (
        <circle
          key={`r${i}`}
          cx="150" cy="145"
          r="12"
          fill="none"
          stroke={towerLight}
          strokeWidth="1.5"
          style={{
            transformOrigin: "150px 145px",
            animation: `signalRing ${2 + i * 0.3}s ease-out infinite`,
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}

      {/* Scanning beam (active) */}
      {progress > 0.3 && (
        <g opacity={0.15 + progress * 0.15} style={{ transformOrigin: "150px 145px", animation: "signalScan 8s linear infinite" }}>
          <line x1="150" y1="145" x2="150" y2="80" stroke={towerLight} strokeWidth="1" />
          <polygon points="145,85 155,85 150,145" fill={towerLight} opacity="0.1" />
        </g>
      )}

      {/* Contact message indicator */}
      {contactOpacity > 0 && (
        <g opacity={contactOpacity}>
          <rect x="200" y="90" width="50" height="20" rx="4" fill="rgba(34,197,94,0.15)" stroke="#22C55E" strokeWidth="0.5" />
          <text x="225" y="103" textAnchor="middle" fill="#22C55E" fontSize="8" fontFamily="monospace">
            CONTACT
          </text>
        </g>
      )}

      {/* Grid lines on ground */}
      <g opacity="0.08">
        {Array.from({ length: 7 }).map((_, i) => (
          <line key={`gl${i}`} x1={i * 50} y1="270" x2={i * 50} y2="300" stroke="#22C55E" strokeWidth="0.5" />
        ))}
      </g>
    </svg>
  );
}
