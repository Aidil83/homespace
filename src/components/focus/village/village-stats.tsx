"use client";

interface VillageStatsProps {
  totalSessions: number;
  totalFocusMinutes: number;
  currentStreak: number;
  buildingCount: number;
}

export function VillageStats({
  totalSessions,
  totalFocusMinutes,
  currentStreak,
  buildingCount,
}: VillageStatsProps) {
  const hours = Math.floor(totalFocusMinutes / 60);
  const mins = totalFocusMinutes % 60;
  const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 8,
      }}
    >
      {[
        { value: totalSessions, label: "Sessions", color: "#4F8EF7" },
        { value: timeStr, label: "Focus Time", color: "#34D399" },
        { value: `${currentStreak}d`, label: "Streak", color: "#F59E0B" },
        { value: buildingCount, label: "Buildings", color: "#A855F7" },
      ].map((stat, i) => (
        <div
          key={i}
          style={{
            background: "rgba(255,255,255,0.03)",
            borderRadius: 10,
            padding: "10px 8px",
            border: "1px solid rgba(255,255,255,0.06)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 800, color: stat.color }}>
            {stat.value}
          </div>
          <div style={{ fontSize: 10, color: "#6B7280" }}>{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
