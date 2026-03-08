"use client";

import { useMemo, useEffect, useRef } from "react";

interface RoadmapBoardProps {
  currentE1RM: number;
  targetE1RM: number;
  increment?: number;
}

interface MilestoneNode {
  weight: number;
  weeks: number;
  isCurrent: boolean;
  isPast: boolean;
  isGoal: boolean;
}

export function RoadmapBoard({
  currentE1RM,
  targetE1RM,
  increment = 10,
}: RoadmapBoardProps) {
  const litPathRef = useRef<SVGPathElement>(null);

  const milestones = useMemo(() => {
    const nodes: MilestoneNode[] = [];

    // Start node (round down to nearest increment below current)
    const startWeight = Math.floor((currentE1RM - increment) / increment) * increment;
    if (startWeight > 0 && startWeight < currentE1RM) {
      nodes.push({ weight: startWeight, weeks: 0, isCurrent: false, isPast: true, isGoal: false });
    }

    // Current node
    nodes.push({ weight: currentE1RM, weeks: 0, isCurrent: true, isPast: false, isGoal: currentE1RM >= targetE1RM });

    // Future milestones
    if (currentE1RM < targetE1RM) {
      for (let w = currentE1RM + increment; w < targetE1RM; w += increment) {
        const stepsAway = (w - currentE1RM) / increment;
        nodes.push({ weight: w, weeks: Math.round(stepsAway * 3), isCurrent: false, isPast: false, isGoal: false });
      }
      // Goal node
      const goalSteps = (targetE1RM - currentE1RM) / increment;
      nodes.push({ weight: targetE1RM, weeks: Math.round(goalSteps * 3), isCurrent: false, isPast: false, isGoal: true });
    }

    // Limit to ~8 nodes for readability
    if (nodes.length > 8) {
      const kept = [nodes[0], nodes[1]]; // start + current
      const future = nodes.slice(2);
      const step = Math.ceil(future.length / 5);
      for (let i = 0; i < future.length - 1; i += step) {
        kept.push(future[i]);
      }
      kept.push(future[future.length - 1]); // always include goal
      return kept;
    }

    return nodes;
  }, [currentE1RM, targetE1RM, increment]);

  const currentIdx = milestones.findIndex((n) => n.isCurrent);

  // Layout: 3 columns, zigzag rows
  const cols = 3;
  const gapX = 110;
  const gapY = 90;
  const padX = 50;
  const padY = 50;

  const positions = useMemo(() => {
    const rowGroups: MilestoneNode[][] = [];
    for (let i = 0; i < milestones.length; i += cols) {
      rowGroups.push(milestones.slice(i, i + cols));
    }
    // Zigzag: reverse odd rows
    rowGroups.forEach((row, i) => {
      if (i % 2 === 1) row.reverse();
    });

    const result: (MilestoneNode & { x: number; y: number })[] = [];
    rowGroups.forEach((row, ri) => {
      row.forEach((node, ci) => {
        result.push({ ...node, x: padX + ci * gapX, y: padY + ri * gapY });
      });
    });
    return result;
  }, [milestones]);

  const svgW = padX * 2 + (cols - 1) * gapX;
  const svgH = padY * 2 + (Math.ceil(milestones.length / cols) - 1) * gapY;
  const nodeR = 24;

  const buildPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      if (Math.abs(a.y - b.y) < 1) {
        const midX = (a.x + b.x) / 2;
        d += ` C ${midX} ${a.y - 10}, ${midX} ${b.y - 10}, ${b.x} ${b.y}`;
      } else {
        const dir = a.x > padX + gapX ? 1 : -1;
        const bulge = 40;
        d += ` C ${a.x + bulge * dir} ${a.y + gapY * 0.5}, ${b.x + bulge * dir} ${b.y - gapY * 0.5}, ${b.x} ${b.y}`;
      }
    }
    return d;
  };

  const fullPath = buildPath(positions);
  const litPath = currentIdx >= 0 ? buildPath(positions.slice(0, currentIdx + 1)) : "";

  useEffect(() => {
    const el = litPathRef.current;
    if (!el) return;
    const len = el.getTotalLength();
    el.style.strokeDasharray = `${len}`;
    el.style.strokeDashoffset = `${len}`;
    el.getBoundingClientRect();
    el.style.transition = "stroke-dashoffset 0.8s ease-out";
    el.style.strokeDashoffset = "0";
  });

  if (milestones.length < 2) return null;

  return (
    <div className="pt-2">
      <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} className="overflow-visible">
        <defs>
          <linearGradient id="roadmapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
          <filter id="nodeGlow">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background path (dashed) */}
        <path
          d={fullPath}
          fill="none"
          stroke="currentColor"
          className="text-purple-500/10"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d={fullPath}
          fill="none"
          stroke="currentColor"
          className="text-purple-500/15"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="6 8"
        />

        {/* Lit path (animated) */}
        {litPath && (
          <>
            <path
              d={litPath}
              fill="none"
              stroke="url(#roadmapGrad)"
              strokeWidth="6"
              strokeLinecap="round"
              opacity="0.3"
              filter="url(#nodeGlow)"
            />
            <path
              ref={litPathRef}
              d={litPath}
              fill="none"
              stroke="url(#roadmapGrad)"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </>
        )}

        {/* Nodes */}
        {positions.map((node, i) => {
          const isAchieved = node.isPast || node.isCurrent;
          return (
            <g key={i}>
              {/* Ripple ring for current */}
              {node.isCurrent && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={nodeR + 2}
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  opacity="0"
                >
                  <animate
                    attributeName="r"
                    values={`${nodeR + 2};${nodeR + 4};${nodeR + 16};${nodeR + 16}`}
                    keyTimes="0;0.05;0.6;1"
                    dur="2.5s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;0.6;0;0"
                    keyTimes="0;0.05;0.6;1"
                    dur="2.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}

              {/* Shadow */}
              <circle cx={node.x} cy={node.y + 2} r={nodeR} fill="rgba(0,0,0,0.2)" />

              {/* Node circle */}
              <circle
                cx={node.x}
                cy={node.y}
                r={nodeR}
                fill={node.isCurrent ? "#6366f1" : node.isPast ? "#4c1d95" : "var(--color-card, #1a1a2e)"}
                stroke={node.isCurrent ? "#c4b5fd" : node.isPast ? "#7c3aed" : "rgba(139,92,246,0.2)"}
                strokeWidth={node.isCurrent ? 3 : node.isPast ? 2 : 1.5}
                filter={node.isCurrent ? "url(#nodeGlow)" : "none"}
              />

              {/* Checkmark for past */}
              {node.isPast && !node.isCurrent && (
                <path
                  d={`M ${node.x - 6} ${node.y} l 4 4 l 8 -8`}
                  fill="none"
                  stroke="#a78bfa"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.6"
                />
              )}

              {/* Weight text for current/future */}
              {(!node.isPast || node.isCurrent) && (
                <>
                  <text
                    x={node.x}
                    y={node.y - 2}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="12"
                    fontWeight="800"
                    fontFamily="-apple-system, sans-serif"
                  >
                    {node.weight}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + 10}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.5)"
                    fontSize="7"
                    fontWeight="600"
                    fontFamily="-apple-system, sans-serif"
                  >
                    lbs
                  </text>
                </>
              )}

              {/* Past weight label below */}
              {node.isPast && !node.isCurrent && (
                <text
                  x={node.x}
                  y={node.y + nodeR + 14}
                  textAnchor="middle"
                  fill="#7c3aed"
                  fontSize="9"
                  fontWeight="700"
                  fontFamily="-apple-system, sans-serif"
                >
                  {node.weight}
                </text>
              )}

              {/* "YOU" badge for current */}
              {node.isCurrent && (
                <g>
                  <rect
                    x={node.x - 22}
                    y={node.y - nodeR - 20}
                    width="44"
                    height="16"
                    rx="8"
                    fill="#6366f1"
                    stroke="#a78bfa"
                    strokeWidth="1"
                  />
                  <text
                    x={node.x}
                    y={node.y - nodeR - 9}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="8"
                    fontWeight="800"
                    fontFamily="-apple-system, sans-serif"
                  >
                    ⚡ YOU
                  </text>
                </g>
              )}

              {/* Weeks label for future */}
              {!isAchieved && (
                <text
                  x={node.x}
                  y={node.y + nodeR + 14}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="9"
                  fontWeight="600"
                  fontFamily="-apple-system, sans-serif"
                >
                  {node.isGoal ? "🏆 " : "~"}
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
