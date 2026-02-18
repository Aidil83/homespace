"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getWorkoutForDate,
  getSplitDayInfo,
  getMuscleGroupSummary,
  type Exercise,
} from "./workout-data";
import {
  useGymStorage,
  toDateStr,
  type ExerciseLogEntry,
  type SetEntry,
} from "@/hooks/use-gym-storage";
import {
  bestE1RMFromSets,
  compute1RMHistory,
  suggestNextWeight,
  EXERCISE_EMOJI,
} from "./gym-utils";

// ---------------------------------------------------------------------------
// Inline-styled icon components (exact GymQuest)
// ---------------------------------------------------------------------------

const ChevronDown = ({ open }: { open: boolean }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      transform: open ? "rotate(180deg)" : "rotate(0deg)",
      transition: "transform 0.3s ease",
    }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const TrendUp = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#22c55e"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const Check = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#fff"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const Trophy = () => <span style={{ fontSize: 16 }}>🏆</span>;
const Dumbbell = () => <span style={{ fontSize: 18 }}>🏋️</span>;
const NoteIcon = () => <span style={{ fontSize: 16 }}>📝</span>;
const Target = () => <span style={{ fontSize: 16 }}>🎯</span>;
const Clock = () => <span style={{ fontSize: 14 }}>⏱️</span>;

// ---------------------------------------------------------------------------
// Exercise accent colors (exact GymQuest palette)
// ---------------------------------------------------------------------------

const EXERCISE_ACCENT_COLORS = [
  {
    accent: "#6366f1",
    accentBg: "rgba(99,102,241,0.12)",
    gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  },
  {
    accent: "#f59e0b",
    accentBg: "rgba(245,158,11,0.12)",
    gradient: "linear-gradient(135deg, #f59e0b, #f97316)",
  },
  {
    accent: "#22c55e",
    accentBg: "rgba(34,197,94,0.12)",
    gradient: "linear-gradient(135deg, #22c55e, #10b981)",
  },
  {
    accent: "#ec4899",
    accentBg: "rgba(236,72,153,0.12)",
    gradient: "linear-gradient(135deg, #ec4899, #f43f5e)",
  },
  {
    accent: "#06b6d4",
    accentBg: "rgba(6,182,212,0.12)",
    gradient: "linear-gradient(135deg, #06b6d4, #0ea5e9)",
  },
  {
    accent: "#f97316",
    accentBg: "rgba(249,115,22,0.12)",
    gradient: "linear-gradient(135deg, #f97316, #ef4444)",
  },
];

// ---------------------------------------------------------------------------
// GQCollapsible (exact GymQuest)
// ---------------------------------------------------------------------------

function GQCollapsible({
  title,
  icon,
  children,
  defaultOpen = false,
  badge,
  headerRight,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
  headerRight?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      style={{
        background: "#1a1a2e",
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          background: "none",
          border: "none",
          color: "#fff",
          cursor: "pointer",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {icon}
          <span style={{ fontWeight: 700, fontSize: 15 }}>{title}</span>
          {badge && (
            <span
              style={{
                background: "rgba(139,92,246,0.2)",
                color: "#a78bfa",
                fontSize: 11,
                padding: "2px 8px",
                borderRadius: 20,
                fontWeight: 600,
              }}
            >
              {badge}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {headerRight}
          <ChevronDown open={open} />
        </div>
      </button>
      <div
        style={{
          maxHeight: open ? 5000 : 0,
          overflow: "hidden",
          transition: "max-height 0.4s ease",
        }}
      >
        <div style={{ padding: "0 20px 20px" }}>{children}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stepper (exact GymQuest)
// ---------------------------------------------------------------------------

function Stepper({
  value,
  onChange,
  step,
  min = 0,
  color,
  defaultValue,
}: {
  value: number;
  onChange: (v: number) => void;
  step: number;
  min?: number;
  color: string;
  defaultValue?: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        background: "rgba(255,255,255,0.04)",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "4px 2px",
      }}
    >
      <button
        onClick={() => onChange(Math.max(min, value - step))}
        style={{
          width: 32,
          height: 32,
          background: "none",
          border: "none",
          color: "#94a3b8",
          fontSize: 18,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        −
      </button>
      <div
        onClick={defaultValue !== undefined ? () => onChange(defaultValue) : undefined}
        style={{
          flex: 1,
          minWidth: 36,
          textAlign: "center",
          fontSize: 16,
          fontWeight: 800,
          color: value > 0 ? "#fff" : "#4a5568",
          padding: "0 2px",
          cursor: defaultValue !== undefined ? "pointer" : "default",
        }}
      >
        {value}
      </div>
      <button
        onClick={() => onChange(value + step)}
        style={{
          width: 32,
          height: 32,
          background: "none",
          border: "none",
          color,
          fontSize: 18,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        +
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ProgressRing (exact GymQuest)
// ---------------------------------------------------------------------------

function ProgressRing({
  pct,
  size = 64,
  stroke = 5,
  color = "#8b5cf6",
}: {
  pct: number;
  size?: number;
  stroke?: number;
  color?: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// RestTimer (exact GymQuest)
// ---------------------------------------------------------------------------

function RestTimer({
  seconds: initSec,
  onDismiss,
  color,
}: {
  seconds: number;
  onDismiss: () => void;
  color: string;
}) {
  const [left, setLeft] = useState(initSec);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    ref.current = setInterval(() => {
      setLeft((p) => {
        if (p <= 1) {
          clearInterval(ref.current!);
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => {
      if (ref.current) clearInterval(ref.current);
    };
  }, []);
  const m = Math.floor(left / 60);
  const s = left % 60;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: `${color}15`,
        borderRadius: 10,
        padding: "10px 14px",
        marginTop: 8,
        border: `1px solid ${color}30`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 14 }}>⏱️</span>
        <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>
          Rest
        </span>
        <span
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: left <= 10 ? "#ef4444" : color,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {m}:{s.toString().padStart(2, "0")}
        </span>
      </div>
      <button
        onClick={onDismiss}
        style={{
          background: `${color}20`,
          border: `1px solid ${color}40`,
          borderRadius: 8,
          color,
          fontSize: 12,
          fontWeight: 700,
          padding: "4px 12px",
          cursor: "pointer",
        }}
      >
        Skip
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Delta (exact GymQuest)
// ---------------------------------------------------------------------------

function Delta({
  current,
  previous,
  unit = "",
}: {
  current: number;
  previous: number;
  unit?: string;
}) {
  const diff = current - previous;
  if (diff === 0) return null;
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: diff > 0 ? "#22c55e" : "#ef4444",
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      {diff > 0 ? "▲" : "▼"} {Math.abs(diff)}
      {unit}
    </span>
  );
}

// ---------------------------------------------------------------------------
// MiniChart (exact GymQuest)
// ---------------------------------------------------------------------------

function MiniChart({
  data,
  color,
  h = 80,
  id,
}: {
  data: number[];
  color: string;
  h?: number;
  id: string;
}) {
  const vals = data;
  if (vals.length < 2) return null;
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  const range = max - min || 1;
  const w = 100 / (vals.length - 1);
  const pts = vals
    .map(
      (v, i) =>
        `${i * w},${h - ((v - min) / range) * (h - 20) - 10}`
    )
    .join(" ");
  return (
    <svg
      viewBox={`0 0 100 ${h}`}
      style={{ width: "100%", height: h }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`g-${id}-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${h} ${pts} 100,${h}`}
        fill={`url(#g-${id}-${color})`}
      />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
      {vals.map((v, i) => (
        <circle
          key={i}
          cx={i * w}
          cy={h - ((v - min) / range) * (h - 20) - 10}
          r="2.5"
          fill={color}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// BoardGameRoadmap (Candy Land serpentine winding path)
// ---------------------------------------------------------------------------

function BoardGameRoadmap({
  currentE1RM,
  targetE1RM,
  increment = 10,
}: {
  currentE1RM: number;
  targetE1RM: number;
  increment?: number;
}) {
  const pathRef = useRef<SVGPathElement | null>(null);
  const litPathRef = useRef<SVGPathElement | null>(null);
  const [nodePositions, setNodePositions] = useState<
    { x: number; y: number }[]
  >([]);
  const [pathLen, setPathLen] = useState(0);
  const [currentDist, setCurrentDist] = useState(0);

  // Build milestone nodes
  const allNodes = useMemo(() => {
    const nodes: {
      weight: number;
      weeks: number;
      isPast?: boolean;
      isCurrent?: boolean;
      isGoal?: boolean;
    }[] = [];

    const prevMilestone = Math.floor(currentE1RM / increment) * increment;
    if (prevMilestone < currentE1RM) {
      nodes.push({ weight: prevMilestone, weeks: 0, isPast: true });
    }
    nodes.push({ weight: currentE1RM, weeks: 0, isCurrent: true });

    const nextStart =
      Math.ceil(currentE1RM / increment) * increment +
      (currentE1RM % increment === 0 ? increment : 0);
    for (let w = nextStart; w <= targetE1RM; w += increment) {
      const steps = (w - currentE1RM) / increment;
      const weeks = Math.round(steps * 3);
      nodes.push({ weight: w, weeks, isGoal: w === targetE1RM });
    }
    if (
      nodes.length === 0 ||
      nodes[nodes.length - 1].weight !== targetE1RM
    ) {
      const steps = (targetE1RM - currentE1RM) / increment;
      const weeks = Math.ceil(steps) * 3;
      nodes.push({ weight: targetE1RM, weeks, isGoal: true });
    }
    return nodes;
  }, [currentE1RM, targetE1RM, increment]);

  const currentIdx = allNodes.findIndex((n) => n.weight === currentE1RM);

  // Serpentine path layout (Candy Land style)
  const rowWidth = 240;
  const turnRadius = 55;
  const rowSpacing = turnRadius * 2;
  const nodesPerRow = 3;
  const numRows = Math.max(1, Math.ceil(allNodes.length / nodesPerRow));
  const padX = turnRadius + 35;
  const padY = 50;
  const leftX = padX;
  const rightX = padX + rowWidth;
  const svgW = padX * 2 + rowWidth;
  const svgH = padY * 2 + Math.max(0, numRows - 1) * rowSpacing + 20;

  // Build the serpentine SVG path
  const serpentinePath = useMemo(() => {
    if (numRows <= 0) return "";
    let d = `M ${leftX} ${padY}`;

    for (let row = 0; row < numRows; row++) {
      const y = padY + row * rowSpacing;
      const goingRight = row % 2 === 0;

      // Horizontal segment
      if (goingRight) {
        d += ` L ${rightX} ${y}`;
      } else {
        d += ` L ${leftX} ${y}`;
      }

      // U-turn to next row
      if (row < numRows - 1) {
        const nextY = y + rowSpacing;
        if (goingRight) {
          // Right-side U-turn: bulge outward to the right
          d += ` C ${rightX + turnRadius * 1.3} ${y}, ${rightX + turnRadius * 1.3} ${nextY}, ${rightX} ${nextY}`;
        } else {
          // Left-side U-turn: bulge outward to the left
          d += ` C ${leftX - turnRadius * 1.3} ${y}, ${leftX - turnRadius * 1.3} ${nextY}, ${leftX} ${nextY}`;
        }
      }
    }
    return d;
  }, [numRows, leftX, rightX, padY, rowSpacing, turnRadius]);

  // Place nodes evenly along the path & measure distances
  useEffect(() => {
    const el = pathRef.current;
    if (!el || allNodes.length === 0) return;

    const len = el.getTotalLength();
    setPathLen(len);

    const positions = allNodes.map((_, i) => {
      const d =
        allNodes.length > 1 ? (i / (allNodes.length - 1)) * len : 0;
      const pt = el.getPointAtLength(d);
      return { x: pt.x, y: pt.y };
    });
    setNodePositions(positions);

    if (currentIdx >= 0 && allNodes.length > 1) {
      setCurrentDist((currentIdx / (allNodes.length - 1)) * len);
    } else {
      setCurrentDist(0);
    }
  }, [serpentinePath, allNodes, currentIdx]);

  // Animate the lit path drawing
  useEffect(() => {
    const el = litPathRef.current;
    if (!el || pathLen === 0 || currentDist === 0) return;

    // Show only the first currentDist portion of the path
    el.style.strokeDasharray = `${currentDist} ${pathLen}`;
    el.style.strokeDashoffset = `${currentDist}`;
    el.getBoundingClientRect();
    el.style.transition = "stroke-dashoffset 1s ease-out";
    el.style.strokeDashoffset = "0";
  }, [pathLen, currentDist]);

  const nodeR = 24;

  return (
    <div style={{ marginTop: 16 }}>
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.6); }
        }
        @keyframes nodeAppear {
          0% { opacity: 0; transform: scale(0.5); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes floatBadge {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
      <svg
        width="100%"
        viewBox={`0 0 ${svgW} ${svgH}`}
        style={{ overflow: "visible" }}
      >
        <defs>
          <linearGradient
            id="pathGrad"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="bigGlow">
            <feGaussianBlur stdDeviation="8" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Full background path (wide, faint) */}
        <path
          ref={pathRef}
          d={serpentinePath}
          fill="none"
          stroke="rgba(99,102,241,0.1)"
          strokeWidth="40"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Thinner dashed center line */}
        <path
          d={serpentinePath}
          fill="none"
          stroke="rgba(139,92,246,0.15)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="6 8"
        />
        {/* Lit progress path (glow) */}
        {currentDist > 0 && (
          <path
            d={serpentinePath}
            fill="none"
            stroke="url(#pathGrad)"
            strokeWidth="40"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.15"
            strokeDasharray={`${currentDist} ${pathLen}`}
            filter="url(#glow)"
          />
        )}
        {/* Lit progress path (solid line) */}
        <path
          ref={litPathRef}
          d={serpentinePath}
          fill="none"
          stroke="url(#pathGrad)"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Nodes */}
        {nodePositions.map((pos, i) => {
          const node = allNodes[i];
          if (!node) return null;
          const isCurrent = node.weight === currentE1RM;
          const isPast = node.weight < currentE1RM;
          const isAchieved = node.weight <= currentE1RM;
          const isGoal = node.weight === targetE1RM;
          const delay = `${0.15 + i * 0.08}s`;

          return (
            <g
              key={i}
              style={{
                animation: `nodeAppear 0.4s ease-out ${delay} both`,
                transformOrigin: `${pos.x}px ${pos.y}px`,
              }}
            >
              {/* Pulse glow ring on current node */}
              {isCurrent && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={nodeR + 2}
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  style={{
                    animation: "pulseGlow 3s ease-in-out infinite",
                    transformOrigin: `${pos.x}px ${pos.y}px`,
                  }}
                />
              )}
              {/* Drop shadow */}
              <circle
                cx={pos.x}
                cy={pos.y + 2}
                r={nodeR}
                fill="rgba(0,0,0,0.3)"
              />
              {/* Main circle */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={nodeR}
                fill={
                  isCurrent
                    ? "#6366f1"
                    : isPast
                      ? "#4c1d95"
                      : "#1a1a2e"
                }
                stroke={
                  isCurrent
                    ? "#c4b5fd"
                    : isPast
                      ? "#7c3aed"
                      : "rgba(139,92,246,0.2)"
                }
                strokeWidth={isCurrent ? 3 : isPast ? 2 : 1.5}
                filter={isCurrent ? "url(#bigGlow)" : "none"}
              />
              {/* Checkmark for past nodes */}
              {isPast && !isCurrent && (
                <path
                  d={`M ${pos.x - 6} ${pos.y} l 4 4 l 8 -8`}
                  fill="none"
                  stroke="#a78bfa"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.6"
                />
              )}
              {/* Weight + "lbs" text */}
              {(!isPast || isCurrent) && (
                <>
                  <text
                    x={pos.x}
                    y={pos.y - 3}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="13"
                    fontWeight="800"
                    fontFamily="-apple-system, sans-serif"
                  >
                    {node.weight}
                  </text>
                  <text
                    x={pos.x}
                    y={pos.y + 10}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.5)"
                    fontSize="7.5"
                    fontWeight="600"
                    fontFamily="-apple-system, sans-serif"
                  >
                    lbs
                  </text>
                </>
              )}
              {/* Weight label below past nodes */}
              {isPast && !isCurrent && (
                <text
                  x={pos.x}
                  y={pos.y + nodeR + 14}
                  textAnchor="middle"
                  fill="#7c3aed"
                  fontSize="9"
                  fontWeight="700"
                  fontFamily="-apple-system, sans-serif"
                >
                  {node.weight}
                </text>
              )}
              {/* "YOU" floating badge */}
              {isCurrent && (
                <g
                  style={{
                    animation: "floatBadge 2.5s ease-in-out infinite",
                  }}
                >
                  <rect
                    x={pos.x - 24}
                    y={pos.y - nodeR - 22}
                    width="48"
                    height="18"
                    rx="9"
                    ry="9"
                    fill="#6366f1"
                    stroke="#a78bfa"
                    strokeWidth="1"
                  />
                  <text
                    x={pos.x}
                    y={pos.y - nodeR - 10}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="9"
                    fontWeight="800"
                    fontFamily="-apple-system, sans-serif"
                  >
                    ⚡ YOU
                  </text>
                </g>
              )}
              {/* Weeks estimate below future nodes */}
              {!isAchieved && (
                <text
                  x={pos.x}
                  y={pos.y + nodeR + 14}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="9"
                  fontWeight="600"
                  fontFamily="-apple-system, sans-serif"
                >
                  {isGoal ? "\uD83C\uDFC6 " : "~"}
                  {node.weeks}wk
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Session Notes (inline-styled version)
// ---------------------------------------------------------------------------

function GQSessionNotes({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <GQCollapsible title="Session Notes" icon={<NoteIcon />}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="How did the session feel? Any observations..."
        rows={3}
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10,
          color: "#fff",
          padding: "10px 14px",
          fontSize: 13,
          resize: "vertical",
          outline: "none",
          fontFamily: "inherit",
        }}
      />
    </GQCollapsible>
  );
}

// ---------------------------------------------------------------------------
// This Week Strip
// ---------------------------------------------------------------------------

function ThisWeekStrip({
  targetDate,
  dateStr,
  attendance,
  onNavigate,
}: {
  targetDate: Date;
  dateStr: string;
  attendance: Set<string>;
  onNavigate: (ds: string) => void;
}) {
  const dayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const today = toDateStr(new Date());

  // Compute Sunday of the week containing targetDate
  const sun = new Date(targetDate);
  sun.setDate(sun.getDate() - sun.getDay());

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sun);
    d.setDate(sun.getDate() + i);
    const ds = toDateStr(d);
    const w = getWorkoutForDate(d);
    return { ds, w, dayLabel: dayLabels[i] };
  });

  return (
    <div style={{ marginTop: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>This Week</h3>
      <div style={{ display: "flex", gap: 6 }}>
        {days.map(({ ds, w, dayLabel }) => {
          const isActive = ds === dateStr;
          const isPast = ds < today;
          const isToday = ds === today;
          const isRest = w.type === "rest";
          // Rest days are auto-completed if in the past; workout days need explicit attendance
          const attended = (isPast || isToday) && (isRest || attendance.has(ds));
          return (
            <button
              key={ds}
              onClick={() => onNavigate(ds)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                padding: "10px 4px",
                borderRadius: 12,
                border: isActive
                  ? "2px solid rgba(255,255,255,0.8)"
                  : "1px solid rgba(255,255,255,0.08)",
                background: isActive
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(255,255,255,0.02)",
                cursor: "pointer",
                color: "#fff",
                transition: "all 0.2s ease",
                position: "relative",
              }}
            >
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 0.5,
                color: isActive ? "#fff" : "#64748b",
              }}>
                {dayLabel}
              </span>
              <span style={{ fontSize: 20 }}>{w.emoji}</span>
              <span style={{
                fontSize: 10,
                fontWeight: 600,
                color: isActive ? "#fff" : "#94a3b8",
              }}>
                {w.type === "rest" ? "Rest" : w.type.charAt(0).toUpperCase() + w.type.slice(1)}
              </span>
              {attended && (
                <div style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#22c55e",
                }} />
              )}
              {isPast && !attended && w.type !== "rest" && (
                <div style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "rgba(239,68,68,0.5)",
                }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function GymQuestWorkoutLog({ date }: { date?: string }) {
  const router = useRouter();
  const targetDate = date ? new Date(date + "T00:00:00") : new Date();
  const dateStr = toDateStr(targetDate);
  const workout = getWorkoutForDate(targetDate);
  const dayName = targetDate.toLocaleDateString("en-US", { weekday: "long" });
  const formattedDate = targetDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const splitInfo = getSplitDayInfo(targetDate);
  const muscleGroupSummary = getMuscleGroupSummary(workout.type);

  const {
    attendance,
    getLog,
    getPreviousLog,
    saveLog,
    markAttended,
    stats,
    goals,
    logs,
    setGoal,
    getAllLogsForExercise,
    getNote,
    saveNote,
  } = useGymStorage();

  const [entries, setEntries] = useState<ExerciseLogEntry[]>([]);
  const [openCards, setOpenCards] = useState<Set<number>>(new Set([0]));
  const [sessionNote, setSessionNote] = useState("");
  const [restTimers, setRestTimers] = useState<Record<string, number>>({});
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState("");
  const [roadmapOpen, setRoadmapOpen] = useState(false);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const noteSaveRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const previousLog = useMemo(
    () => getPreviousLog(dateStr),
    [getPreviousLog, dateStr]
  );

  const previousByExercise = useMemo(() => {
    const map = new Map<string, SetEntry[]>();
    if (previousLog) {
      for (const entry of previousLog) {
        map.set(entry.exerciseName, entry.sets);
      }
    }
    return map;
  }, [previousLog]);

  // Pre-fill from saved log or previous session
  useEffect(() => {
    const saved = getLog(dateStr);
    if (saved && saved.length > 0) {
      setEntries(saved);
    } else {
      setEntries(
        workout.exercises.map((ex) => {
          return {
            exerciseName: ex.name,
            sets: Array.from({ length: 2 }, () => ({
              weight: ex.defaultWeight,
              reps: ex.defaultReps,
              completed: false,
            })),
          };
        })
      );
    }
    setSessionNote(getNote(dateStr));
  }, [dateStr, getLog, getNote, workout.exercises, previousByExercise]);

  // Primary exercise data
  const primaryExercise = workout.exercises[0];
  const primaryLogs = useMemo(
    () => (primaryExercise ? getAllLogsForExercise(primaryExercise.name) : []),
    [getAllLogsForExercise, primaryExercise]
  );
  const primaryHistory = useMemo(
    () => compute1RMHistory(primaryLogs),
    [primaryLogs]
  );
  const currentBestE1RM =
    primaryHistory.length > 0
      ? primaryHistory[primaryHistory.length - 1].e1rm
      : 0;
  const primaryGoal = primaryExercise
    ? goals[primaryExercise.name]?.target1RM ?? null
    : null;
  const primaryPrevSets = primaryExercise
    ? previousByExercise.get(primaryExercise.name)
    : undefined;
  const suggestion = useMemo(
    () =>
      primaryExercise && primaryPrevSets
        ? suggestNextWeight(
            primaryPrevSets,
            primaryExercise.weightIncrement,
            primaryExercise.reps
          )
        : null,
    [primaryExercise, primaryPrevSets]
  );


  const exerciseByName = useMemo(() => {
    const map = new Map<string, Exercise>();
    for (const ex of workout.exercises) {
      map.set(ex.name, ex);
    }
    return map;
  }, [workout.exercises]);

  // Auto-save debounced
  const debouncedSave = useCallback(
    (nextEntries: ExerciseLogEntry[]) => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
      autoSaveRef.current = setTimeout(() => {
        if (nextEntries.length > 0) {
          saveLog(dateStr, nextEntries);
        }
      }, 500);
    },
    [saveLog, dateStr]
  );

  function handleNoteChange(text: string) {
    setSessionNote(text);
    if (noteSaveRef.current) clearTimeout(noteSaveRef.current);
    noteSaveRef.current = setTimeout(() => {
      saveNote(dateStr, text);
    }, 500);
  }

  function updateSetField(
    exerciseIndex: number,
    setIndex: number,
    field: "weight" | "reps",
    value: number | null
  ) {
    setEntries((prev) => {
      const next = [...prev];
      const exercise = { ...next[exerciseIndex] };
      const sets = [...exercise.sets];
      sets[setIndex] = { ...sets[setIndex], [field]: value };
      exercise.sets = sets;
      next[exerciseIndex] = exercise;
      debouncedSave(next);
      return next;
    });
  }

  function toggleSetCompleted(exerciseIndex: number, setIndex: number) {
    setEntries((prev) => {
      const next = [...prev];
      const exercise = { ...next[exerciseIndex] };
      const sets = [...exercise.sets];
      const wasCompleted = sets[setIndex].completed;
      sets[setIndex] = { ...sets[setIndex], completed: !wasCompleted };
      exercise.sets = sets;
      next[exerciseIndex] = exercise;

      // If just completed (not uncompleted), start rest timer
      if (!wasCompleted) {
        const timerKey = `${exerciseIndex}-${setIndex}`;
        setRestTimers((prev) => ({ ...prev, [timerKey]: 90 }));
      }

      // Auto-expand next card if all sets done
      const allDone = sets.every((s) => s.completed);
      if (allDone && exerciseIndex < next.length - 1) {
        setOpenCards((prev) => {
          const updated = new Set(prev);
          updated.add(exerciseIndex + 1);
          return updated;
        });
      }

      debouncedSave(next);
      return next;
    });
  }

  function handleFinish() {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    if (noteSaveRef.current) clearTimeout(noteSaveRef.current);
    saveLog(dateStr, entries);
    if (sessionNote) saveNote(dateStr, sessionNote);
    markAttended(dateStr);
    router.push("/gym");
  }

  const completedSets = entries.reduce(
    (acc, e) => acc + e.sets.filter((s) => s.completed).length,
    0
  );
  const totalSets = entries.reduce((acc, e) => acc + e.sets.length, 0);
  const allComplete = completedSets === totalSets && totalSets > 0;
  const pctComplete = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  const liveE1RM = bestE1RMFromSets(entries[0]?.sets ?? []);

  // ---- REST DAY VIEW ----
  if (workout.type === "rest") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0f0f1a",
          color: "#fff",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 16px" }}>
          {/* Back button */}
          <button
            onClick={() => router.push("/gym")}
            style={{
              background: "none",
              border: "none",
              color: "#8b5cf6",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              padding: "16px 0",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>

          {/* Header */}
          <div
            style={{
              padding: "24px 0 8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  color: "#8b5cf6",
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                GymQuest
              </div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 28,
                  fontWeight: 800,
                  background:
                    "linear-gradient(135deg, #a78bfa, #6366f1)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Rest Day
              </h1>
              <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>
                {dayName}, {formattedDate}
              </div>
            </div>
          </div>

          {/* This Week */}
          <ThisWeekStrip
            targetDate={targetDate}
            dateStr={dateStr}
            attendance={attendance}
            onNavigate={(ds) => router.push(`/gym/log?date=${ds}`)}
          />

          {/* Rest day card */}
          <div
            style={{
              background: "#1a1a2e",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.06)",
              padding: 32,
              textAlign: "center",
              marginTop: 16,
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>😴</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
              Rest Day
            </div>
            <div style={{ fontSize: 14, color: "#94a3b8" }}>
              No workout scheduled. Recovery is part of the process.
            </div>
          </div>

          {/* Notes on rest days */}
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            <GQSessionNotes value={sessionNote} onChange={handleNoteChange} />
          </div>
        </div>
      </div>
    );
  }

  // ---- WORKOUT DAY VIEW ----
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0f1a",
        color: "#fff",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 16px" }}>
        {/* Back button */}
        <button
          onClick={() => router.push("/gym")}
          style={{
            background: "none",
            border: "none",
            color: "#8b5cf6",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 600,
            padding: "16px 0",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>

        {/* Header */}
        <div
          style={{
            padding: "24px 0 8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                color: "#8b5cf6",
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              GymQuest
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 28,
                fontWeight: 800,
                background:
                  "linear-gradient(135deg, #a78bfa, #6366f1)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {workout.label}
            </h1>
            <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>
              {dayName}, {formattedDate}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            {splitInfo && (
              <div
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  borderRadius: 12,
                  padding: "8px 14px",
                }}
              >
                <div style={{ fontSize: 11, opacity: 0.8, fontWeight: 600 }}>
                  SPLIT
                </div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>
                  Day {splitInfo.dayNumber}/{splitInfo.totalDays}
                </div>
              </div>
            )}
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
              {muscleGroupSummary}
            </div>
          </div>
        </div>

        {/* This Week */}
        <ThisWeekStrip
          targetDate={targetDate}
          dateStr={dateStr}
          attendance={attendance}
          onNavigate={(ds) => router.push(`/gym/log?date=${ds}`)}
        />

        {/* Goal Hero Card */}
        {primaryExercise && primaryGoal && currentBestE1RM > 0 && (
          <div style={{
            background: "#1a1a2e",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.06)",
            padding: 20,
            marginTop: 12,
          }}>
            {/* Header: Trophy + title + ratio */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Trophy />
                <span style={{ fontWeight: 700, fontSize: 15 }}>{primaryExercise.name} Goal</span>
              </div>
              <span style={{ color: "#a78bfa", fontSize: 13, fontWeight: 700 }}>{currentBestE1RM} / {primaryGoal} lbs</span>
            </div>
            {/* Horizontal progress bar */}
            <div style={{ position: "relative", height: 28, background: "rgba(255,255,255,0.06)", borderRadius: 14, overflow: "hidden", marginBottom: 8 }}>
              <div style={{
                height: "100%",
                width: `${Math.min((currentBestE1RM / primaryGoal) * 100, 100)}%`,
                background: "linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)",
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                paddingRight: 10,
              }}>
                <span style={{ fontSize: 12, fontWeight: 800 }}>{Math.round((currentBestE1RM / primaryGoal) * 100)}%</span>
              </div>
            </div>
            {/* Info row */}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 12 }}>
              <span>Current: {currentBestE1RM} lbs</span>
              <span>{primaryGoal - currentBestE1RM} lbs to go</span>
              <span>Goal: {primaryGoal} lbs</span>
            </div>
            {/* Next Milestone box */}
            {(() => {
              const nextMilestone = Math.ceil(currentBestE1RM / primaryExercise.weightIncrement) * primaryExercise.weightIncrement + primaryExercise.weightIncrement;
              const stepsToNext = Math.ceil((nextMilestone - currentBestE1RM) / primaryExercise.weightIncrement);
              const weeksToNext = stepsToNext * 3;
              const nextDate = new Date();
              nextDate.setDate(nextDate.getDate() + weeksToNext * 7);
              const dateStr = nextDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
              return nextMilestone <= primaryGoal ? (
                <div style={{
                  background: "rgba(139,92,246,0.1)",
                  borderRadius: 12,
                  padding: "12px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>Next Milestone</div>
                    <div style={{ fontWeight: 700, fontSize: 18, color: "#a78bfa" }}>{nextMilestone} lbs</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>
                      <Clock /> Est. ~{weeksToNext} weeks
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{dateStr}</div>
                  </div>
                </div>
              ) : null;
            })()}
            {/* View/Hide Full Roadmap toggle */}
            <button
              onClick={() => setRoadmapOpen(!roadmapOpen)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                marginTop: 12,
                background: "none",
                border: "none",
                color: "#8b5cf6",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                padding: 4,
              }}
            >
              {roadmapOpen ? "Hide" : "View"} Full Roadmap <ChevronDown open={roadmapOpen} />
            </button>
            <div style={{ maxHeight: roadmapOpen ? 1200 : 0, overflow: "hidden", transition: "max-height 0.6s ease" }}>
              {roadmapOpen && (
                <BoardGameRoadmap
                  currentE1RM={currentBestE1RM}
                  targetE1RM={primaryGoal}
                  increment={primaryExercise.weightIncrement}
                />
              )}
            </div>
          </div>
        )}
        {/* Edit goal button when no goal set or no data yet */}
        {primaryExercise && (!primaryGoal || currentBestE1RM === 0) && (
          <div style={{
            background: "#1a1a2e",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.06)",
            padding: 20,
            marginTop: 12,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Target />
                <span style={{ fontWeight: 700, fontSize: 15 }}>{primaryExercise.name} Goal</span>
              </div>
              {!editingGoal && (
                <button
                  onClick={() => { setEditingGoal(true); setGoalInput(primaryGoal ? String(primaryGoal) : ""); }}
                  style={{
                    background: "rgba(139,92,246,0.15)",
                    border: "1px solid rgba(139,92,246,0.3)",
                    borderRadius: 8,
                    color: "#a78bfa",
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "4px 12px",
                    cursor: "pointer",
                  }}
                >
                  {primaryGoal ? "Edit" : "Set Goal"}
                </button>
              )}
            </div>
            {editingGoal ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>Target 1RM:</div>
                <input
                  type="number"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  placeholder="e.g. 225"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    color: "#fff",
                    padding: "6px 12px",
                    fontSize: 14,
                    fontWeight: 700,
                    width: 100,
                    outline: "none",
                  }}
                />
                <span style={{ fontSize: 12, color: "#64748b" }}>lbs</span>
                <button
                  onClick={() => {
                    const val = parseInt(goalInput);
                    if (val > 0) setGoal(primaryExercise.name, val);
                    setEditingGoal(false);
                  }}
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    border: "none",
                    borderRadius: 8,
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "6px 14px",
                    cursor: "pointer",
                  }}
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingGoal(false)}
                  style={{
                    background: "none",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    color: "#94a3b8",
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "6px 10px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : null}
            {primaryGoal ? (
              <div style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", padding: "12px 0" }}>
                Complete your first session to track progress toward{" "}
                <span style={{ color: "#a78bfa", fontWeight: 700 }}>{primaryGoal} lbs</span>
              </div>
            ) : (
              <div style={{ fontSize: 13, color: "#64748b", textAlign: "center", padding: "12px 0" }}>
                Set a target 1RM to track your progress
              </div>
            )}
          </div>
        )}

        {/* 1RM Trend Chart */}
        {primaryExercise && primaryHistory.length >= 2 && (
          <div style={{ marginTop: 12 }}>
          <GQCollapsible
            title={`${primaryExercise.name} 1RM Trend`}
            icon={<TrendUp />}
            badge={`${currentBestE1RM} lbs`}
            defaultOpen={false}
          >
            <MiniChart
              data={primaryHistory.map((h) => h.e1rm)}
              color="#8b5cf6"
              h={100}
              id="e1rm-trend"
            />
            {primaryGoal && (
              <div
                style={{
                  fontSize: 11,
                  color: "#64748b",
                  textAlign: "right",
                  marginTop: 4,
                }}
              >
                Goal: {primaryGoal} lbs (
                {Math.round((currentBestE1RM / primaryGoal) * 100)}%)
              </div>
            )}
          </GQCollapsible>
          </div>
        )}

        {/* Smart Suggestion */}
        {primaryExercise && suggestion && (
          <div
            style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))",
              borderRadius: 16,
              border: "1px solid rgba(99,102,241,0.2)",
              padding: "14px 18px",
              marginTop: 12,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 20 }}>💡</span>
            <div>
              <div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 700, marginBottom: 2 }}>
                SUGGESTED NEXT
              </div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                {primaryExercise.name}: {suggestion.weight} lbs x{" "}
                {suggestion.reps} reps
              </div>
            </div>
          </div>
        )}

        {/* Exercise Cards */}
        <div
          style={{
            marginTop: 12,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <GQCollapsible
            title="Today's Workout"
            icon={<Dumbbell />}
            badge={`${completedSets}/${totalSets} sets`}
            defaultOpen={true}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{ position: "relative", width: 64, height: 64, flexShrink: 0 }}>
                <ProgressRing pct={pctComplete} />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                  <span style={{ fontSize: 16, fontWeight: 800, lineHeight: 1 }}>{completedSets}</span>
                  <span style={{ fontSize: 9, color: "#64748b", fontWeight: 600 }}>/ {totalSets}</span>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: "#94a3b8" }}>
                  {completedSets === 0 ? "Ready to crush it 💪" : allComplete ? "All sets complete! 🎉" : `${completedSets} of ${totalSets} sets done`}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                {liveE1RM > 0 ? (
                  <>
                    <div style={{ fontSize: 22, fontWeight: 800, color: primaryGoal && liveE1RM >= primaryGoal ? "#22c55e" : "#a78bfa" }}>{liveE1RM} lbs</div>
                    <div style={{ fontSize: 10, color: primaryGoal && liveE1RM >= primaryGoal ? "#22c55e" : "#64748b", fontWeight: 600 }}>
                      EST 1RM{primaryGoal ? ` • ${Math.min(100, Math.round((liveE1RM / primaryGoal) * 100))}% of ${primaryGoal}` : ""}
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: 12, color: "#4a5568" }}>Log sets to see 1RM</div>
                )}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {entries.map((entry, ei) => {
                const exerciseDef = exerciseByName.get(entry.exerciseName);
                if (!exerciseDef) return null;

                const colorIdx = ei % EXERCISE_ACCENT_COLORS.length;
                const colors = EXERCISE_ACCENT_COLORS[colorIdx];
                const emoji = EXERCISE_EMOJI[entry.exerciseName] ?? "💪";
                const isOpen = openCards.has(ei);
                const prevSets = previousByExercise.get(entry.exerciseName);
                const allSetsDone = entry.sets.every((s) => s.completed);
                const completedInExercise = entry.sets.filter(
                  (s) => s.completed
                ).length;
                const isPrimary = ei === 0;

                // Live 1RM for primary exercise
                const liveE1RM = isPrimary
                  ? bestE1RMFromSets(entry.sets)
                  : 0;

                return (
                  <div
                    key={entry.exerciseName}
                    style={{
                      background: "#1a1a2e",
                      borderRadius: 14,
                      overflow: "hidden",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {/* Top gradient bar */}
                    <div
                      style={{
                        height: 3,
                        background: colors.gradient,
                      }}
                    />

                    {/* Exercise header */}
                    <button
                      onClick={() => {
                        setOpenCards((prev) => {
                          const next = new Set(prev);
                          if (next.has(ei)) next.delete(ei);
                          else next.add(ei);
                          return next;
                        });
                      }}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "14px 16px",
                        background: "none",
                        border: "none",
                        color: "#fff",
                        cursor: "pointer",
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            background: colors.accentBg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 20,
                          }}
                        >
                          {emoji}
                        </div>
                        <div style={{ textAlign: "left" }}>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: 14,
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            {entry.exerciseName}
                            {allSetsDone && (
                              <span
                                style={{
                                  fontSize: 10,
                                  color: "#22c55e",
                                  fontWeight: 700,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 3,
                                }}
                              >
                                ✓ Done
                              </span>
                            )}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: 4,
                              marginTop: 4,
                              flexWrap: "wrap",
                            }}
                          >
                            {exerciseDef.muscles.map((m) => (
                              <span
                                key={m}
                                style={{
                                  fontSize: 10,
                                  padding: "1px 6px",
                                  borderRadius: 6,
                                  background: colors.accentBg,
                                  color: colors.accent,
                                  fontWeight: 600,
                                }}
                              >
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        {/* Previous data */}
                        {prevSets && prevSets.length > 0 && (
                          <div style={{ textAlign: "right" }}>
                            <div
                              style={{
                                fontSize: 9,
                                color: "#64748b",
                                fontWeight: 600,
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                              }}
                            >
                              PREVIOUS
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                color: "#94a3b8",
                                fontWeight: 600,
                              }}
                            >
                              {prevSets[0].weight ?? 0}×
                              {prevSets[0].reps ?? 0}
                            </div>
                          </div>
                        )}
                        <ChevronDown open={isOpen} />
                      </div>
                    </button>

                    {/* Expanded content */}
                    <div
                      style={{
                        maxHeight: isOpen ? 2000 : 0,
                        overflow: "hidden",
                        transition: "max-height 0.4s ease",
                      }}
                    >
                      <div style={{ padding: "0 16px 16px" }}>
                        {/* Set headers */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 8,
                            paddingLeft: 4,
                          }}
                        >
                          <div
                            style={{
                              flex: 1,
                              fontSize: 10,
                              color: "#64748b",
                              fontWeight: 600,
                            }}
                          >
                            WEIGHT (lbs)
                          </div>
                          <div
                            style={{
                              flex: 1,
                              fontSize: 10,
                              color: "#64748b",
                              fontWeight: 600,
                            }}
                          >
                            REPS ({exerciseDef.reps})
                          </div>
                          <div style={{ width: 36 }} />
                        </div>

                        {/* Set rows */}
                        {entry.sets.map((set, si) => {
                          const prevSetData = prevSets?.[si];
                          const timerKey = `${ei}-${si}`;
                          const hasTimer = restTimers[timerKey] !== undefined && set.completed;

                          return (
                            <div key={si}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  marginBottom: 12,
                                  paddingLeft: 4,
                                }}
                              >
                                {/* Weight stepper */}
                                <div style={{ flex: 1 }}>
                                  <Stepper
                                    value={set.weight ?? 0}
                                    onChange={(v) =>
                                      updateSetField(ei, si, "weight", v)
                                    }
                                    step={exerciseDef.weightIncrement}
                                    color={colors.accent}
                                    defaultValue={exerciseDef.defaultWeight}
                                  />
                                </div>

                                {/* Reps stepper */}
                                <div style={{ flex: 1 }}>
                                  <Stepper
                                    value={set.reps ?? 0}
                                    onChange={(v) =>
                                      updateSetField(ei, si, "reps", v)
                                    }
                                    step={1}
                                    color={colors.accent}
                                    defaultValue={exerciseDef.defaultReps}
                                  />
                                </div>

                                {/* Check button */}
                                <button
                                  onClick={() => toggleSetCompleted(ei, si)}
                                  style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 10,
                                    border: `2px solid ${
                                      set.completed
                                        ? colors.accent
                                        : "rgba(255,255,255,0.1)"
                                    }`,
                                    background: set.completed
                                      ? colors.accent
                                      : "transparent",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "all 0.2s ease",
                                  }}
                                >
                                  {set.completed && <Check />}
                                </button>

                              </div>

                              {/* Estimated 1RM */}
                              {(set.weight ?? 0) > 0 && (set.reps ?? 0) > 0 && (
                                <div
                                  style={{
                                    paddingLeft: 4,
                                    marginBottom: 4,
                                    fontSize: 11,
                                    color: "#64748b",
                                    fontWeight: 600,
                                  }}
                                >
                                  Est. 1RM:{" "}
                                  <span style={{ color: colors.accent, fontWeight: 700 }}>
                                    {Math.round(set.weight! * (1 + set.reps! / 30))} lbs
                                  </span>
                                </div>
                              )}

                              {/* Delta from previous set */}
                              {set.completed &&
                                prevSetData &&
                                prevSetData.weight != null &&
                                set.weight != null && (
                                  <div
                                    style={{
                                      paddingLeft: 36,
                                      marginBottom: 4,
                                    }}
                                  >
                                    <Delta
                                      current={set.weight}
                                      previous={prevSetData.weight}
                                      unit=" lbs"
                                    />
                                  </div>
                                )}

                              {/* Rest timer */}
                              {hasTimer && (
                                <RestTimer
                                  seconds={90}
                                  onDismiss={() =>
                                    setRestTimers((prev) => {
                                      const next = { ...prev };
                                      delete next[timerKey];
                                      return next;
                                    })
                                  }
                                  color={colors.accent}
                                />
                              )}
                            </div>
                          );
                        })}

                        {/* Live 1RM for primary exercise */}
                        {isPrimary && liveE1RM > 0 && (
                          <div
                            style={{
                              marginTop: 10,
                              background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))",
                              borderRadius: 10,
                              padding: "10px 14px",
                              border: "1px solid rgba(99,102,241,0.15)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <span style={{ fontSize: 14 }}>⚡</span>
                              <span
                                style={{
                                  fontSize: 12,
                                  color: "#a78bfa",
                                  fontWeight: 600,
                                }}
                              >
                                Live Est. 1RM
                              </span>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 18,
                                  fontWeight: 800,
                                  background:
                                    "linear-gradient(135deg, #a78bfa, #6366f1)",
                                  WebkitBackgroundClip: "text",
                                  WebkitTextFillColor: "transparent",
                                }}
                              >
                                {liveE1RM} lbs
                              </span>
                              {primaryGoal && (
                                <span
                                  style={{
                                    fontSize: 10,
                                    color: "#64748b",
                                  }}
                                >
                                  / {primaryGoal}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </GQCollapsible>
        </div>

        {/* Session Insights */}
        <div style={{ marginTop: 12 }}>
          <GQCollapsible title="Session Insights" icon={<Trophy />} defaultOpen={false}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 10,
                  padding: "12px 14px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: "#64748b",
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                >
                  SETS DONE
                </div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>
                  {completedSets}
                  <span style={{ fontSize: 12, color: "#64748b" }}>
                    /{totalSets}
                  </span>
                </div>
              </div>
              {currentBestE1RM > 0 && (
                <div
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: 10,
                    padding: "12px 14px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: "#64748b",
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                  >
                    BEST 1RM
                  </div>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: "#a78bfa",
                    }}
                  >
                    {currentBestE1RM}
                    <span style={{ fontSize: 10, color: "#64748b" }}> lbs</span>
                  </div>
                </div>
              )}
              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 10,
                  padding: "12px 14px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: "#64748b",
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                >
                  STREAK
                </div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>
                  {stats.currentStreak}
                  <span style={{ fontSize: 10, color: "#64748b" }}> days</span>
                </div>
              </div>
            </div>
          </GQCollapsible>
        </div>

        {/* Session Notes */}
        <div style={{ marginTop: 12 }}>
          <GQSessionNotes value={sessionNote} onChange={handleNoteChange} />
        </div>

        {/* Finish Button */}
        <button
          onClick={handleFinish}
          style={{
            width: "100%",
            height: 56,
            borderRadius: 16,
            border: "none",
            fontSize: 18,
            fontWeight: 800,
            color: "#fff",
            cursor: "pointer",
            marginTop: 16,
            marginBottom: 32,
            background: allComplete
              ? "linear-gradient(135deg, #22c55e, #10b981)"
              : "linear-gradient(135deg, #6366f1, #8b5cf6)",
            boxShadow: allComplete
              ? "0 8px 24px rgba(34,197,94,0.3)"
              : "0 8px 24px rgba(99,102,241,0.3)",
            transition: "all 0.3s ease",
            animation: allComplete ? "pulse-btn 2s ease-in-out infinite" : "none",
          }}
        >
          {allComplete ? "Finish Workout 🎉" : "Finish Workout 💪"}
        </button>
        <style>{`
          @keyframes pulse-btn {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
          }
        `}</style>
      </div>
    </div>
  );
}
