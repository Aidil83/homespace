"use client";

import { BIOMES } from "./biomes/types";
import type { BiomeId } from "./biomes/types";
import { WORLD_COLLECTIBLES } from "./world-collectibles";

interface WorldZoneProps {
  biome: BiomeId;
  level: number;
  earnedCollectibles: string[];
  onZoneClick: () => void;
  onCollectibleHover: (name: string | null, e?: React.PointerEvent) => void;
}

export function WorldZone({
  biome,
  level,
  earnedCollectibles,
  onZoneClick,
  onCollectibleHover,
}: WorldZoneProps) {
  const meta = BIOMES[biome];
  const color = meta.color;
  const collectibles = WORLD_COLLECTIBLES[biome];
  const lvl = Math.min(Math.max(level, 1), 5);

  return (
    <g>
      {/* Zone background glow — intensifies with level */}
      <ellipse
        cx={130}
        cy={110}
        rx={125}
        ry={105}
        fill={color}
        opacity={0.02 + 0.015 * lvl}
      />

      {/* Legendary aura (level 5+) */}
      {lvl >= 5 && (
        <ellipse
          cx={130}
          cy={110}
          rx={128}
          ry={107}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          opacity={0.2}
        >
          <animate
            attributeName="opacity"
            values="0.15;0.35;0.15"
            dur="3s"
            repeatCount="indefinite"
          />
        </ellipse>
      )}

      {/* Invisible click target covering the zone */}
      <rect
        x={0}
        y={0}
        width={260}
        height={220}
        fill="transparent"
        cursor="pointer"
        onClick={onZoneClick}
      />

      {/* Level-based terrain */}
      {renderTerrain(biome, lvl, color)}

      {/* Collectibles */}
      {collectibles.map((def, i) => {
        const earned = earnedCollectibles.includes(def.name);
        const bobDur = 2.5 + (i % 5) * 0.3;
        return (
          <g
            key={def.name}
            transform={`translate(${def.offsetX}, ${def.offsetY})`}
            opacity={earned ? 0.85 : 0.15}
            filter={earned ? "url(#collectibleGlow)" : undefined}
            style={{ cursor: "pointer" }}
            onPointerEnter={(e) => onCollectibleHover(def.name, e)}
            onPointerLeave={() => onCollectibleHover(null)}
          >
            {def.render(earned ? color : "#4B5563")}
            {earned && (
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,0; 0,-2; 0,0"
                dur={`${bobDur}s`}
                repeatCount="indefinite"
                additive="sum"
              />
            )}
          </g>
        );
      })}

      {/* Zone label */}
      <text
        x={130}
        y={145}
        textAnchor="middle"
        fill={color}
        fontSize={12}
        fontWeight={700}
        fontFamily="'Outfit', sans-serif"
        opacity={0.55 + 0.08 * lvl}
        style={{ pointerEvents: "none" }}
      >
        {meta.icon} {meta.name}
      </text>
    </g>
  );
}

/* ─── Terrain Renderers ─────────────────────────────────────────────────────
   Each biome has 5 progressive levels of terrain within the zone's local
   260×220 coordinate space, centered roughly around (130, 110).
   ────────────────────────────────────────────────────────────────────────── */

function renderTerrain(
  biome: BiomeId,
  level: number,
  c: string,
): React.ReactNode {
  switch (biome) {
    case "ember":
      return renderEmber(level, c);
    case "fathom":
      return renderFathom(level, c);
    case "forge":
      return renderForge(level, c);
    case "flux":
      return renderFlux(level, c);
    case "prism":
      return renderPrism(level, c);
    case "signal":
      return renderSignal(level, c);
  }
}

/* ── Ember: cold stones → smoldering → campfire → bonfire → fire spirit ─── */
function renderEmber(l: number, c: string) {
  return (
    <g>
      {/* L1: cold stones */}
      <circle cx={115} cy={118} r={8} fill="#374151" opacity={0.5} />
      <circle cx={145} cy={120} r={6} fill="#374151" opacity={0.4} />
      <circle cx={130} cy={128} r={7} fill="#374151" opacity={0.45} />
      <ellipse cx={125} cy={126} rx={10} ry={4} fill="#1f2937" opacity={0.3} />

      {l >= 2 && (
        <>
          {/* smoldering coals */}
          <circle cx={130} cy={116} r={12} fill={c} opacity={0.1} />
          <circle cx={126} cy={118} r={3} fill={c} opacity={0.3} />
          <circle cx={134} cy={117} r={2.5} fill={c} opacity={0.25} />
          <circle cx={130} cy={122} r={2} fill={c} opacity={0.2} />
        </>
      )}

      {l >= 3 && (
        <>
          {/* campfire: crossed logs + flame */}
          <rect
            x={112}
            y={122}
            width={36}
            height={3}
            rx={1.5}
            fill="#78350f"
            transform="rotate(-15, 130, 123)"
          />
          <rect
            x={118}
            y={122}
            width={24}
            height={3}
            rx={1.5}
            fill="#78350f"
            transform="rotate(20, 130, 123)"
          />
          <path
            d="M130,120 C126,108 134,108 130,96"
            fill="none"
            stroke={c}
            strokeWidth={5}
            opacity={0.45}
            strokeLinecap="round"
          />
        </>
      )}

      {l >= 4 && (
        <>
          {/* roaring bonfire: bigger flame + floating embers */}
          <path
            d="M130,118 C122,98 138,98 130,78"
            fill="none"
            stroke={c}
            strokeWidth={8}
            opacity={0.35}
            strokeLinecap="round"
          />
          <circle cx={121} cy={96} r={2} fill={c} opacity={0.6}>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; -3,-10; -5,-20"
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6;0"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx={139} cy={100} r={1.5} fill={c} opacity={0.5}>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 2,-8; 5,-18"
              dur="2.4s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.5;0"
              dur="2.4s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx={130} cy={92} r={1.8} fill={c} opacity={0.4}>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; -1,-12; 0,-22"
              dur="3s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.4;0"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>
        </>
      )}

      {l >= 5 && (
        <>
          {/* fire spirit hovering above */}
          <circle cx={130} cy={70} r={18} fill={c} opacity={0.06}>
            <animate
              attributeName="opacity"
              values="0.06;0.12;0.06"
              dur="2.5s"
              repeatCount="indefinite"
            />
          </circle>
          <path
            d="M130,82 C127,74 133,74 130,65"
            fill={c}
            opacity={0.35}
          />
          <circle cx={130} cy={62} r={5} fill={c} opacity={0.5}>
            <animate
              attributeName="opacity"
              values="0.4;0.65;0.4"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx={128} cy={60} r={1.5} fill="#fff" opacity={0.6} />
        </>
      )}
    </g>
  );
}

/* ── Fathom: dry sand → tide pool → coral → deep water → anglerfish ─────── */
function renderFathom(l: number, c: string) {
  return (
    <g>
      {/* L1: dry sand */}
      <ellipse cx={130} cy={118} rx={40} ry={15} fill="#92764a" opacity={0.25} />
      <ellipse cx={130} cy={120} rx={35} ry={10} fill="#a3865a" opacity={0.15} />

      {l >= 2 && (
        <>
          {/* tide pool */}
          <ellipse cx={130} cy={110} rx={18} ry={10} fill={c} opacity={0.15} />
          <ellipse cx={128} cy={112} rx={8} ry={5} fill={c} opacity={0.25} />
        </>
      )}

      {l >= 3 && (
        <>
          {/* coral reef */}
          <circle cx={118} cy={108} r={5} fill="#f472b6" opacity={0.35} />
          <circle cx={142} cy={106} r={4} fill="#fb923c" opacity={0.3} />
          <circle cx={130} cy={102} r={3.5} fill={c} opacity={0.4} />
          <line
            x1={122}
            y1={114}
            x2={120}
            y2={100}
            stroke="#a78bfa"
            strokeWidth={2}
            strokeLinecap="round"
            opacity={0.3}
          />
          <line
            x1={138}
            y1={112}
            x2={140}
            y2={98}
            stroke="#34d399"
            strokeWidth={2}
            strokeLinecap="round"
            opacity={0.3}
          />
        </>
      )}

      {l >= 4 && (
        <>
          {/* deep water + bioluminescence */}
          <ellipse cx={130} cy={110} rx={45} ry={25} fill={c} opacity={0.1} />
          <circle cx={115} cy={98} r={2} fill="#67e8f9" opacity={0.5}>
            <animate
              attributeName="opacity"
              values="0.5;0.2;0.5"
              dur="2.5s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx={145} cy={100} r={1.5} fill="#a5f3fc" opacity={0.4}>
            <animate
              attributeName="opacity"
              values="0.4;0.1;0.4"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx={125} cy={92} r={1.8} fill="#22d3ee" opacity={0.45}>
            <animate
              attributeName="opacity"
              values="0.45;0.15;0.45"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
        </>
      )}

      {l >= 5 && (
        <>
          {/* giant anglerfish */}
          <ellipse cx={130} cy={95} rx={18} ry={10} fill={c} opacity={0.2} />
          <circle cx={122} cy={92} r={2.5} fill="#0d0d1a" opacity={0.5} />
          <circle cx={122} cy={92} r={1} fill="#fff" opacity={0.6} />
          {/* lantern */}
          <line
            x1={120}
            y1={86}
            x2={116}
            y2={76}
            stroke={c}
            strokeWidth={1}
            opacity={0.4}
          />
          <circle cx={116} cy={74} r={4} fill={c} opacity={0.35}>
            <animate
              attributeName="opacity"
              values="0.35;0.6;0.35"
              dur="1.8s"
              repeatCount="indefinite"
            />
          </circle>
          {/* tail */}
          <path
            d="M148,95 Q155,90 158,95 Q155,100 148,95"
            fill={c}
            opacity={0.15}
          />
        </>
      )}
    </g>
  );
}

/* ── Forge: bare rock → anvil → workshop → sparks → legendary sword ─────── */
function renderForge(l: number, c: string) {
  return (
    <g>
      {/* L1: bare rock */}
      <polygon
        points="110,125 125,105 150,108 155,125"
        fill="#374151"
        opacity={0.4}
      />
      <polygon
        points="120,128 135,118 145,128"
        fill="#4b5563"
        opacity={0.3}
      />

      {l >= 2 && (
        <>
          {/* anvil */}
          <rect
            x={122}
            y={100}
            width={16}
            height={8}
            rx={1}
            fill="#6b7280"
            opacity={0.6}
          />
          <rect
            x={118}
            y={96}
            width={24}
            height={5}
            rx={1}
            fill="#9ca3af"
            opacity={0.5}
          />
          <rect
            x={127}
            y={108}
            width={6}
            height={10}
            rx={1}
            fill="#4b5563"
            opacity={0.5}
          />
        </>
      )}

      {l >= 3 && (
        <>
          {/* hammer + hot coals */}
          <rect
            x={146}
            y={90}
            width={3}
            height={18}
            rx={1}
            fill="#78350f"
            opacity={0.5}
            transform="rotate(-30, 147, 99)"
          />
          <rect
            x={143}
            y={86}
            width={10}
            height={6}
            rx={1}
            fill="#6b7280"
            opacity={0.6}
            transform="rotate(-30, 148, 89)"
          />
          <circle cx={125} cy={112} r={3} fill={c} opacity={0.25} />
          <circle cx={135} cy={114} r={2.5} fill={c} opacity={0.2} />
        </>
      )}

      {l >= 4 && (
        <>
          {/* full workshop: sparks flying */}
          <rect
            x={108}
            y={118}
            width={44}
            height={3}
            rx={1}
            fill="#4b5563"
            opacity={0.3}
          />
          <circle cx={140} cy={94} r={1.5} fill={c} opacity={0.6}>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 5,-8; 10,-4"
              dur="1.2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6;0"
              dur="1.2s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx={136} cy={92} r={1} fill={c} opacity={0.5}>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; -4,-10; -2,-18"
              dur="1.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.5;0"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx={130} cy={90} r={1.2} fill={c} opacity={0.4}>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 3,-12; 8,-6"
              dur="1.8s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.4;0"
              dur="1.8s"
              repeatCount="indefinite"
            />
          </circle>
        </>
      )}

      {l >= 5 && (
        <>
          {/* legendary sword on display */}
          <polygon
            points="130,60 133,62 132,88 128,88 127,62"
            fill="#e5e7eb"
            opacity={0.6}
          />
          <rect
            x={125}
            y={86}
            width={10}
            height={3}
            rx={1}
            fill="#d4a017"
            opacity={0.5}
          />
          <rect
            x={128}
            y={88}
            width={4}
            height={8}
            rx={1}
            fill="#78350f"
            opacity={0.5}
          />
          {/* glow */}
          <ellipse
            cx={130}
            cy={75}
            rx={10}
            ry={20}
            fill={c}
            opacity={0.06}
          >
            <animate
              attributeName="opacity"
              values="0.06;0.12;0.06"
              dur="2s"
              repeatCount="indefinite"
            />
          </ellipse>
        </>
      )}
    </g>
  );
}

/* ── Flux: dark sky → faint wisp → aurora bands → full aurora → crown ───── */
function renderFlux(l: number, c: string) {
  return (
    <g>
      {/* L1: dark empty sky — faint ground */}
      <ellipse cx={130} cy={125} rx={35} ry={8} fill="#1f2937" opacity={0.3} />

      {l >= 2 && (
        <>
          {/* faint green/purple wisp */}
          <path
            d="M115,100 C120,90 140,95 145,85"
            fill="none"
            stroke={c}
            strokeWidth={2.5}
            opacity={0.2}
            strokeLinecap="round"
          />
        </>
      )}

      {l >= 3 && (
        <>
          {/* two aurora bands */}
          <path
            d="M100,95 C115,80 145,85 160,75"
            fill="none"
            stroke={c}
            strokeWidth={4}
            opacity={0.2}
            strokeLinecap="round"
          />
          <path
            d="M105,105 C120,90 150,100 165,88"
            fill="none"
            stroke="#a78bfa"
            strokeWidth={3}
            opacity={0.15}
            strokeLinecap="round"
          />
          {/* subtle glow */}
          <ellipse cx={130} cy={90} rx={30} ry={15} fill={c} opacity={0.06} />
        </>
      )}

      {l >= 4 && (
        <>
          {/* full aurora */}
          <path
            d="M90,100 C110,70 150,75 170,60"
            fill="none"
            stroke={c}
            strokeWidth={6}
            opacity={0.2}
            strokeLinecap="round"
          />
          <path
            d="M95,110 C115,82 155,88 175,72"
            fill="none"
            stroke="#c084fc"
            strokeWidth={4}
            opacity={0.15}
            strokeLinecap="round"
          />
          <path
            d="M100,90 C120,65 145,72 165,55"
            fill="none"
            stroke="#22d3ee"
            strokeWidth={3}
            opacity={0.12}
            strokeLinecap="round"
          />
          {/* shooting star */}
          <line
            x1={155}
            y1={68}
            x2={165}
            y2={62}
            stroke="#fff"
            strokeWidth={1.5}
            opacity={0.4}
          >
            <animate
              attributeName="opacity"
              values="0;0.5;0"
              dur="4s"
              repeatCount="indefinite"
            />
          </line>
        </>
      )}

      {l >= 5 && (
        <>
          {/* crown of light */}
          <circle cx={130} cy={65} r={14} fill={c} opacity={0.08}>
            <animate
              attributeName="opacity"
              values="0.08;0.18;0.08"
              dur="2.5s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx={130} cy={65} r={7} fill={c} opacity={0.15}>
            <animate
              attributeName="opacity"
              values="0.15;0.3;0.15"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          <polygon
            points="130,52 133,58 139,58 134,62 136,68 130,64 124,68 126,62 121,58 127,58"
            fill="#fff"
            opacity={0.3}
          />
        </>
      )}
    </g>
  );
}

/* ── Prism: dark cave → one crystal → cluster → garden → radiant ─────── */
function renderPrism(l: number, c: string) {
  return (
    <g>
      {/* L1: dark cave mouth */}
      <polygon
        points="100,130 120,95 140,92 160,130"
        fill="#111827"
        opacity={0.5}
      />
      <ellipse cx={130} cy={128} rx={28} ry={6} fill="#0f172a" opacity={0.4} />

      {l >= 2 && (
        <>
          {/* one crystal */}
          <polygon
            points="130,115 134,105 132,90 128,90 126,105"
            fill={c}
            opacity={0.3}
          />
        </>
      )}

      {l >= 3 && (
        <>
          {/* crystal cluster + glow */}
          <polygon
            points="120,118 123,108 121,92 119,92 117,108"
            fill={c}
            opacity={0.25}
          />
          <polygon
            points="140,116 143,106 141,94 139,94 137,106"
            fill={c}
            opacity={0.2}
          />
          <polygon
            points="130,115 134,102 132,85 128,85 126,102"
            fill={c}
            opacity={0.35}
          />
          <ellipse cx={130} cy={100} rx={15} ry={12} fill={c} opacity={0.05} />
        </>
      )}

      {l >= 4 && (
        <>
          {/* crystal garden + rainbow beams */}
          <polygon
            points="112,120 114,112 113,100 111,100 110,112"
            fill="#a78bfa"
            opacity={0.2}
          />
          <polygon
            points="148,118 150,108 149,98 147,98 146,108"
            fill="#f472b6"
            opacity={0.2}
          />
          {/* rainbow beams */}
          <line
            x1={130}
            y1={85}
            x2={110}
            y2={70}
            stroke={c}
            strokeWidth={1.5}
            opacity={0.2}
          />
          <line
            x1={130}
            y1={85}
            x2={150}
            y2={68}
            stroke="#a78bfa"
            strokeWidth={1.5}
            opacity={0.15}
          />
          <line
            x1={130}
            y1={85}
            x2={130}
            y2={65}
            stroke="#f472b6"
            strokeWidth={1.5}
            opacity={0.15}
          />
          <ellipse cx={130} cy={95} rx={22} ry={18} fill={c} opacity={0.06} />
        </>
      )}

      {l >= 5 && (
        <>
          {/* massive radiant crystal */}
          <polygon
            points="130,110 137,95 134,62 126,62 123,95"
            fill={c}
            opacity={0.35}
          />
          <ellipse cx={130} cy={80} rx={20} ry={28} fill={c} opacity={0.06}>
            <animate
              attributeName="opacity"
              values="0.06;0.14;0.06"
              dur="2.5s"
              repeatCount="indefinite"
            />
          </ellipse>
          <line
            x1={130}
            y1={62}
            x2={130}
            y2={55}
            stroke="#fff"
            strokeWidth={2}
            opacity={0.25}
          >
            <animate
              attributeName="opacity"
              values="0.25;0.5;0.25"
              dur="2s"
              repeatCount="indefinite"
            />
          </line>
        </>
      )}
    </g>
  );
}

/* ── Signal: barren pole → antenna → tower → signal rings → nebula ──────── */
function renderSignal(l: number, c: string) {
  return (
    <g>
      {/* L1: barren pole */}
      <rect
        x={128}
        y={95}
        width={4}
        height={30}
        rx={1}
        fill="#4b5563"
        opacity={0.4}
      />
      <ellipse cx={130} cy={126} rx={12} ry={4} fill="#1f2937" opacity={0.3} />

      {l >= 2 && (
        <>
          {/* small antenna */}
          <rect
            x={128}
            y={80}
            width={4}
            height={45}
            rx={1}
            fill="#6b7280"
            opacity={0.5}
          />
          <line
            x1={122}
            y1={88}
            x2={130}
            y2={80}
            stroke="#6b7280"
            strokeWidth={1.5}
            opacity={0.4}
          />
          <line
            x1={138}
            y1={88}
            x2={130}
            y2={80}
            stroke="#6b7280"
            strokeWidth={1.5}
            opacity={0.4}
          />
          <circle cx={130} cy={78} r={2} fill={c} opacity={0.3} />
        </>
      )}

      {l >= 3 && (
        <>
          {/* taller tower + blinking light */}
          <rect
            x={127}
            y={70}
            width={6}
            height={55}
            rx={1}
            fill="#9ca3af"
            opacity={0.45}
          />
          <line
            x1={118}
            y1={90}
            x2={130}
            y2={70}
            stroke="#9ca3af"
            strokeWidth={1.5}
            opacity={0.35}
          />
          <line
            x1={142}
            y1={90}
            x2={130}
            y2={70}
            stroke="#9ca3af"
            strokeWidth={1.5}
            opacity={0.35}
          />
          <circle cx={130} cy={68} r={3} fill={c} opacity={0.5}>
            <animate
              attributeName="opacity"
              values="0.5;0.15;0.5"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>
        </>
      )}

      {l >= 4 && (
        <>
          {/* signal rings expanding outward */}
          <circle
            cx={130}
            cy={68}
            r={10}
            fill="none"
            stroke={c}
            strokeWidth={1.2}
            opacity={0.25}
          >
            <animate
              attributeName="r"
              values="6;18;6"
              dur="2.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.3;0;0.3"
              dur="2.5s"
              repeatCount="indefinite"
            />
          </circle>
          <circle
            cx={130}
            cy={68}
            r={14}
            fill="none"
            stroke={c}
            strokeWidth={1}
            opacity={0.15}
          >
            <animate
              attributeName="r"
              values="10;24;10"
              dur="3s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.2;0;0.2"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>
        </>
      )}

      {l >= 5 && (
        <>
          {/* nebula forming above */}
          <circle cx={130} cy={52} r={12} fill={c} opacity={0.08}>
            <animate
              attributeName="opacity"
              values="0.08;0.16;0.08"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx={125} cy={50} r={6} fill={c} opacity={0.1} />
          <circle cx={136} cy={48} r={5} fill={c} opacity={0.08} />
          <circle cx={130} cy={55} r={3} fill="#fff" opacity={0.15}>
            <animate
              attributeName="opacity"
              values="0.15;0.3;0.15"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
        </>
      )}
    </g>
  );
}
