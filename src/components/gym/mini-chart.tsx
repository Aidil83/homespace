"use client";

interface MiniChartProps {
  data: number[];
  height?: number;
  color?: string;
  fillOpacity?: number;
}

export function MiniChart({
  data,
  height = 60,
  color = "#8b5cf6",
  fillOpacity = 0.15,
}: MiniChartProps) {
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const padding = 10;
  const viewW = 200;
  const viewH = height;
  const plotH = viewH - padding * 2;
  const step = viewW / (data.length - 1);

  const points = data
    .map((v, i) => `${i * step},${viewH - padding - ((v - min) / range) * plotH}`)
    .join(" ");

  const areaPoints = `0,${viewH} ${points} ${viewW},${viewH}`;
  const id = `mc-${color.replace("#", "")}`;

  return (
    <svg
      viewBox={`0 0 ${viewW} ${viewH}`}
      className="w-full"
      style={{ height }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={fillOpacity} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${id})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
      {data.map((v, i) => (
        <circle
          key={i}
          cx={i * step}
          cy={viewH - padding - ((v - min) / range) * plotH}
          r="2.5"
          fill={color}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
