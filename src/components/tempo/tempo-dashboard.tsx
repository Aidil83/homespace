"use client";

import { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

const WEEK_HOURS = 168;

interface Category {
  id: string;
  label: string;
  hours: number;
  color: string;
  icon: string;
}

interface DayBlock {
  time: string;
  activity: string;
  cat: string;
}

interface DayTemplate {
  label: string;
  blocks: DayBlock[];
}

const defaultCategories: Category[] = [
  { id: "work", label: "Work (Financial Services)", hours: 40, color: "#4F8EF7", icon: "💼" },
  { id: "gym", label: "Gym (PPL 6x/wk)", hours: 5, color: "#F97066", icon: "🏋️" },
  { id: "sleep", label: "Sleep", hours: 56, color: "#7C6EF6", icon: "😴" },
  { id: "coding", label: "Side Projects / GymQuest", hours: 18, color: "#34D399", icon: "💻" },
  { id: "leetcode", label: "LeetCode / Interview Prep", hours: 9, color: "#FBBF24", icon: "🧩" },
  { id: "commute", label: "Commute / Driving", hours: 3, color: "#A78BFA", icon: "🚗" },
  { id: "meals", label: "Meals & Cooking", hours: 9, color: "#FB923C", icon: "🍳" },
  { id: "chores", label: "Chores / Errands", hours: 5, color: "#94A3B8", icon: "🧹" },
  { id: "social", label: "Social / Dating", hours: 3, color: "#F472B6", icon: "👋" },
  { id: "downtime", label: "Free Time / Recharge", hours: 15, color: "#2DD4BF", icon: "🎮" },
];

const idealCategories = [
  { id: "work", hours: 40 },
  { id: "gym", hours: 5 },
  { id: "sleep", hours: 56 },
  { id: "coding", hours: 18 },
  { id: "leetcode", hours: 9 },
  { id: "commute", hours: 3 },
  { id: "meals", hours: 9 },
  { id: "chores", hours: 5 },
  { id: "social", hours: 3 },
  { id: "downtime", hours: 15 },
];

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const dayTemplates: Record<string, DayTemplate> = {
  workday_push: {
    label: "Work + Push",
    blocks: [
      { time: "6:00", activity: "Wake + Prep", cat: "meals" },
      { time: "6:30", activity: "Push Day (Chest/Shoulders/Tri)", cat: "gym" },
      { time: "8:00", activity: "Commute", cat: "commute" },
      { time: "8:30", activity: "Deep Work Block", cat: "work" },
      { time: "12:00", activity: "Lunch", cat: "meals" },
      { time: "12:30", activity: "Meetings / Collab", cat: "work" },
      { time: "17:00", activity: "Commute", cat: "commute" },
      { time: "17:30", activity: "Dinner + Decompress", cat: "meals" },
      { time: "18:30", activity: "LeetCode (1-2 problems)", cat: "leetcode" },
      { time: "19:30", activity: "GymQuest / Side Project", cat: "coding" },
      { time: "21:00", activity: "Free Time", cat: "downtime" },
      { time: "22:30", activity: "Wind Down → Sleep", cat: "sleep" },
    ],
  },
  workday_pull: {
    label: "Work + Pull",
    blocks: [
      { time: "6:00", activity: "Wake + Prep", cat: "meals" },
      { time: "6:30", activity: "Pull Day (Back/Biceps)", cat: "gym" },
      { time: "8:00", activity: "Commute", cat: "work" },
      { time: "8:30", activity: "Deep Work Block", cat: "work" },
      { time: "12:00", activity: "Lunch", cat: "meals" },
      { time: "12:30", activity: "Afternoon Work", cat: "work" },
      { time: "17:00", activity: "Commute", cat: "commute" },
      { time: "17:30", activity: "Dinner", cat: "meals" },
      { time: "18:30", activity: "Side Project Sprint", cat: "coding" },
      { time: "20:30", activity: "Free Time / Social", cat: "social" },
      { time: "22:30", activity: "Sleep", cat: "sleep" },
    ],
  },
  workday_legs: {
    label: "Work + Legs",
    blocks: [
      { time: "6:00", activity: "Wake + Prep", cat: "meals" },
      { time: "6:30", activity: "Leg Day (Squats/DL)", cat: "gym" },
      { time: "8:00", activity: "Commute", cat: "work" },
      { time: "8:30", activity: "Deep Work Block", cat: "work" },
      { time: "12:00", activity: "Lunch + Walk", cat: "meals" },
      { time: "12:45", activity: "Afternoon Work", cat: "work" },
      { time: "17:00", activity: "Commute", cat: "commute" },
      { time: "17:30", activity: "Dinner", cat: "meals" },
      { time: "18:30", activity: "LeetCode", cat: "leetcode" },
      { time: "19:30", activity: "Chores / Errands", cat: "chores" },
      { time: "20:30", activity: "Free Time", cat: "downtime" },
      { time: "22:30", activity: "Sleep", cat: "sleep" },
    ],
  },
  rest_day: {
    label: "Rest / Flex Day",
    blocks: [
      { time: "8:00", activity: "Sleep In + Breakfast", cat: "sleep" },
      { time: "9:30", activity: "Chores / Errands", cat: "chores" },
      { time: "11:00", activity: "Deep Coding Session", cat: "coding" },
      { time: "13:00", activity: "Lunch", cat: "meals" },
      { time: "13:30", activity: "LeetCode Contest / Practice", cat: "leetcode" },
      { time: "15:00", activity: "Social / Date / Friends", cat: "social" },
      { time: "18:00", activity: "Dinner", cat: "meals" },
      { time: "19:00", activity: "Gaming / Hobbies / Celica", cat: "downtime" },
      { time: "22:30", activity: "Sleep", cat: "sleep" },
    ],
  },
};

const weekSchedule = [
  "workday_push",
  "workday_pull",
  "workday_legs",
  "workday_push",
  "workday_pull",
  "workday_legs",
  "rest_day",
];

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { icon?: string; label?: string; name?: string; hours?: number; value?: number } }> }) {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    const hours = d.hours ?? d.value ?? 0;
    return (
      <div
        style={{
          background: "#1a1a2e",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 10,
          padding: "10px 14px",
          color: "#e0e0e0",
          fontSize: 13,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 2 }}>
          {d.icon} {d.label || d.name}
        </div>
        <div>
          {hours}h/week · {((hours / WEEK_HOURS) * 100).toFixed(1)}%
        </div>
      </div>
    );
  }
  return null;
}

export function TempoDashboard() {
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [activeTab, setActiveTab] = useState("overview");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);

  const totalAllocated = useMemo(
    () => categories.reduce((s, c) => s + c.hours, 0),
    [categories]
  );
  const unallocated = WEEK_HOURS - totalAllocated;

  const pieData = useMemo(() => {
    const d = categories
      .filter((c) => c.hours > 0)
      .map((c) => ({
        name: c.label,
        value: c.hours,
        color: c.color,
        icon: c.icon,
        label: c.label,
      }));
    if (unallocated > 0)
      d.push({
        name: "Unallocated",
        value: unallocated,
        color: "#374151",
        icon: "⏳",
        label: "Unallocated",
      });
    return d;
  }, [categories, unallocated]);

  const comparisonData = useMemo(
    () =>
      categories.map((c) => {
        const ideal = idealCategories.find((i) => i.id === c.id);
        return {
          name: c.label.split(" (")[0].split(" /")[0],
          current: c.hours,
          ideal: ideal?.hours || 0,
          icon: c.icon,
          color: c.color,
        };
      }),
    [categories]
  );

  const updateHours = (id: string, val: string) => {
    const num = Math.max(0, Math.min(80, parseFloat(val) || 0));
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, hours: num } : c))
    );
  };

  const healthScores = useMemo(() => {
    const sleep = categories.find((c) => c.id === "sleep")?.hours || 0;
    const free =
      (categories.find((c) => c.id === "downtime")?.hours || 0) + unallocated;
    const social = categories.find((c) => c.id === "social")?.hours || 0;
    const gym = categories.find((c) => c.id === "gym")?.hours || 0;
    const work = categories.find((c) => c.id === "work")?.hours || 0;
    return [
      {
        metric: "Sleep",
        score: Math.min(100, (sleep / 56) * 100),
        detail: `${sleep}h → ${(sleep / 7).toFixed(1)}h/night`,
      },
      {
        metric: "Recovery",
        score: Math.min(100, (free / 14) * 100),
        detail: `${free.toFixed(1)}h free time`,
      },
      {
        metric: "Social",
        score: Math.min(100, (social / 7) * 100),
        detail: `${social}h/week`,
      },
      {
        metric: "Fitness",
        score: Math.min(100, (gym / 9) * 100),
        detail: `${gym}h · PPL 6x`,
      },
      {
        metric: "Work-Life",
        score: Math.min(
          100,
          Math.max(0, 100 - ((work - 40) / 20) * 100)
        ),
        detail: `${work}h work/week`,
      },
    ];
  }, [categories, unallocated]);

  const radarData = healthScores.map((h) => ({
    subject: h.metric,
    score: Math.round(h.score),
  }));

  const insights = useMemo(() => {
    const msgs: Array<{ type: string; text: string }> = [];
    const sleep = categories.find((c) => c.id === "sleep")?.hours || 0;
    const free =
      (categories.find((c) => c.id === "downtime")?.hours || 0) + unallocated;
    const coding = categories.find((c) => c.id === "coding")?.hours || 0;
    const lc = categories.find((c) => c.id === "leetcode")?.hours || 0;
    if (sleep < 49)
      msgs.push({
        type: "warn",
        text: `${(sleep / 7).toFixed(1)}h sleep/night is below the 7h minimum. Recovery suffers → bench progress stalls.`,
      });
    if (free < 7)
      msgs.push({
        type: "warn",
        text: `Only ${free.toFixed(1)}h free time/week. Burnout risk is high — protect at least 2h/day on weekends.`,
      });
    if (free >= 14)
      msgs.push({
        type: "good",
        text: `${free.toFixed(1)}h of free time looks sustainable. Nice balance.`,
      });
    if (coding + lc > 18)
      msgs.push({
        type: "warn",
        text: `${coding + lc}h of coding outside work is aggressive. Consider alternating focus weeks.`,
      });
    if (sleep >= 49 && free >= 10)
      msgs.push({
        type: "good",
        text: "Sleep + recovery look solid. This schedule is sustainable.",
      });
    if (totalAllocated > WEEK_HOURS)
      msgs.push({
        type: "error",
        text: `Over-allocated by ${(totalAllocated - WEEK_HOURS).toFixed(1)}h! Something has to give.`,
      });
    if (msgs.length === 0)
      msgs.push({
        type: "good",
        text: "Allocation looks reasonable. Use the schedule tab to add structure to your days.",
      });
    return msgs;
  }, [categories, unallocated, totalAllocated]);

  const tabStyle = (t: string): React.CSSProperties => ({
    padding: "8px 20px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    transition: "all 0.2s",
    background:
      activeTab === t ? "rgba(79,142,247,0.15)" : "transparent",
    color: activeTab === t ? "#4F8EF7" : "#9CA3AF",
  });

  const dayBlocks = dayTemplates[weekSchedule[selectedDay]].blocks;

  return (
    <div
      style={{
        fontFamily: "'DM Sans', 'Outfit', sans-serif",
        background:
          "linear-gradient(145deg, #0d0d1a 0%, #131328 50%, #0f1a2e 100%)",
        minHeight: "100vh",
        color: "#e8e8f0",
        padding: "28px 24px",
      }}
    >
      {/* Header */}
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <h1
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 28,
              fontWeight: 800,
              margin: 0,
              background: "linear-gradient(135deg, #4F8EF7, #34D399)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Tempo
          </h1>
          <p
            style={{
              color: "#6B7280",
              margin: "4px 0 0",
              fontSize: 14,
            }}
          >
            Your {WEEK_HOURS}h week, visualized. Drag the sliders to find
            your ideal balance.
          </p>
        </div>

        {/* Summary Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
            marginBottom: 24,
          }}
        >
          {[
            {
              label: "Allocated",
              val: `${totalAllocated}h`,
              sub: `of ${WEEK_HOURS}h`,
              accent: "#4F8EF7",
            },
            {
              label: "Free Time",
              val: `${Math.max(
                0,
                (categories.find((c) => c.id === "downtime")?.hours || 0) +
                  unallocated
              ).toFixed(1)}h`,
              sub: "recharge buffer",
              accent: "#2DD4BF",
            },
            {
              label: "Sleep/Night",
              val: `${(
                (categories.find((c) => c.id === "sleep")?.hours || 0) / 7
              ).toFixed(1)}h`,
              sub: "avg nightly",
              accent: "#7C6EF6",
            },
          ].map((card, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 14,
                padding: "16px 18px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: card.accent,
                  opacity: 0.6,
                }}
              />
              <div
                style={{
                  fontSize: 12,
                  color: "#6B7280",
                  fontWeight: 600,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                }}
              >
                {card.label}
              </div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: card.accent,
                  margin: "4px 0 2px",
                }}
              >
                {card.val}
              </div>
              <div style={{ fontSize: 12, color: "#4B5563" }}>{card.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 24,
            background: "rgba(255,255,255,0.03)",
            borderRadius: 10,
            padding: 4,
            width: "fit-content",
          }}
        >
          {(
            [
              ["overview", "Overview"],
              ["adjust", "Adjust"],
              ["schedule", "Daily Schedule"],
              ["health", "Balance Check"],
            ] as const
          ).map(([t, l]) => (
            <button key={t} onClick={() => setActiveTab(t)} style={tabStyle(t)}>
              {l}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                borderRadius: 16,
                padding: 24,
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <h3
                style={{
                  margin: "0 0 16px",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#9CA3AF",
                }}
              >
                Weekly Breakdown
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px 14px",
                  justifyContent: "center",
                  marginTop: 8,
                }}
              >
                {pieData.map((d, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 11,
                      color: "#9CA3AF",
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 2,
                        background: d.color,
                      }}
                    />
                    {d.name.split(" (")[0].split(" /")[0]}
                  </div>
                ))}
              </div>
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                borderRadius: 16,
                padding: 24,
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <h3
                style={{
                  margin: "0 0 16px",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#9CA3AF",
                }}
              >
                Current vs Ideal
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={comparisonData}
                  layout="vertical"
                  margin={{ left: 10, right: 20 }}
                >
                  <XAxis
                    type="number"
                    tick={{ fill: "#6B7280", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: "#9CA3AF", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1a1a2e",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      fontSize: 12,
                      color: "#e0e0e0",
                    }}
                  />
                  <Bar
                    dataKey="current"
                    fill="#4F8EF7"
                    radius={[0, 4, 4, 0]}
                    barSize={10}
                    name="Current"
                  />
                  <Bar
                    dataKey="ideal"
                    fill="rgba(52,211,153,0.4)"
                    radius={[0, 4, 4, 0]}
                    barSize={10}
                    name="Ideal"
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 11, color: "#9CA3AF" }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ADJUST TAB */}
        {activeTab === "adjust" && (
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              borderRadius: 16,
              padding: 24,
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#9CA3AF",
                }}
              >
                Adjust Your Hours
              </h3>
              {totalAllocated > WEEK_HOURS && (
                <div
                  style={{
                    background: "rgba(239,68,68,0.15)",
                    color: "#F87171",
                    padding: "6px 14px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {(totalAllocated - WEEK_HOURS).toFixed(1)}h over budget!
                </div>
              )}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "200px 1fr 70px 50px",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{cat.icon}</span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#d1d5db",
                      }}
                    >
                      {cat.label.split(" (")[0]}
                    </span>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        height: 6,
                        borderRadius: 3,
                        background: "rgba(255,255,255,0.06)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        width: `${(cat.hours / 56) * 100}%`,
                        height: 6,
                        borderRadius: 3,
                        background: cat.color,
                        transition: "width 0.2s",
                      }}
                    />
                    <input
                      type="range"
                      min="0"
                      max="56"
                      step="0.5"
                      value={cat.hours}
                      onChange={(e) => updateHours(cat.id, e.target.value)}
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        width: "100%",
                        opacity: 0,
                        cursor: "pointer",
                        height: 32,
                      }}
                    />
                  </div>
                  <div
                    onClick={() => setEditingId(cat.id)}
                    style={{
                      textAlign: "right",
                      fontSize: 14,
                      fontWeight: 600,
                      color: cat.color,
                      cursor: "pointer",
                    }}
                  >
                    {editingId === cat.id ? (
                      <input
                        type="number"
                        autoFocus
                        value={cat.hours}
                        step="0.5"
                        onChange={(e) =>
                          updateHours(cat.id, e.target.value)
                        }
                        onBlur={() => setEditingId(null)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && setEditingId(null)
                        }
                        style={{
                          width: 50,
                          background: "rgba(255,255,255,0.1)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          borderRadius: 6,
                          color: cat.color,
                          textAlign: "right",
                          padding: "2px 6px",
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      />
                    ) : (
                      `${cat.hours}h`
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: "#6B7280" }}>
                    {((cat.hours / WEEK_HOURS) * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: 20,
                padding: "12px 16px",
                background:
                  unallocated >= 0
                    ? "rgba(52,211,153,0.08)"
                    : "rgba(239,68,68,0.08)",
                borderRadius: 10,
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <span style={{ color: "#9CA3AF" }}>Remaining</span>
              <span
                style={{
                  color: unallocated >= 0 ? "#34D399" : "#F87171",
                }}
              >
                {unallocated.toFixed(1)}h
              </span>
            </div>
          </div>
        )}

        {/* SCHEDULE TAB */}
        {activeTab === "schedule" && (
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              borderRadius: 16,
              padding: 24,
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <h3
              style={{
                margin: "0 0 16px",
                fontSize: 15,
                fontWeight: 600,
                color: "#9CA3AF",
              }}
            >
              Suggested Weekly Structure
            </h3>
            <div
              style={{
                display: "flex",
                gap: 6,
                marginBottom: 20,
                flexWrap: "wrap",
              }}
            >
              {weekdays.map((d, i) => (
                <button
                  key={d}
                  onClick={() => setSelectedDay(i)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                    transition: "all 0.2s",
                    background:
                      selectedDay === i
                        ? "rgba(79,142,247,0.15)"
                        : "rgba(255,255,255,0.04)",
                    color: selectedDay === i ? "#4F8EF7" : "#6B7280",
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#6B7280",
                marginBottom: 16,
                fontWeight: 500,
              }}
            >
              {dayTemplates[weekSchedule[selectedDay]].label} ·{" "}
              {weekdays[selectedDay]}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 42,
                  top: 0,
                  bottom: 0,
                  width: 2,
                  background: "rgba(255,255,255,0.04)",
                }}
              />
              {dayBlocks.map((block, i) => {
                const cat = categories.find((c) => c.id === block.cat);
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "10px 0",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        fontSize: 11,
                        color: "#6B7280",
                        fontWeight: 600,
                        textAlign: "right",
                        flexShrink: 0,
                      }}
                    >
                      {block.time}
                    </div>
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: cat?.color || "#4B5563",
                        border: "2px solid #131328",
                        zIndex: 1,
                        flexShrink: 0,
                      }}
                    />
                    <div
                      style={{
                        flex: 1,
                        padding: "10px 14px",
                        borderRadius: 10,
                        background: `${cat?.color}10`,
                        borderLeft: `3px solid ${cat?.color || "#4B5563"}`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#e0e0e0",
                        }}
                      >
                        {cat?.icon} {block.activity}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* HEALTH TAB */}
        {activeTab === "health" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                borderRadius: 16,
                padding: 24,
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <h3
                style={{
                  margin: "0 0 20px",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#9CA3AF",
                }}
              >
                Balance Radar
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={false}
                    axisLine={false}
                  />
                  <Radar
                    dataKey="score"
                    stroke="#4F8EF7"
                    fill="#4F8EF7"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                borderRadius: 16,
                padding: 24,
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <h3
                style={{
                  margin: "0 0 20px",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#9CA3AF",
                }}
              >
                Metrics
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                {healthScores.map((h, i) => (
                  <div key={i}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#d1d5db",
                        }}
                      >
                        {h.metric}
                      </span>
                      <span style={{ fontSize: 12, color: "#6B7280" }}>
                        {h.detail}
                      </span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        borderRadius: 3,
                        background: "rgba(255,255,255,0.06)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          borderRadius: 3,
                          transition: "width 0.4s ease",
                          width: `${h.score}%`,
                          background:
                            h.score > 70
                              ? "#34D399"
                              : h.score > 40
                                ? "#FBBF24"
                                : "#F87171",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div
                style={{
                  marginTop: 24,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {insights.map((ins, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 10,
                      fontSize: 12,
                      lineHeight: 1.5,
                      background:
                        ins.type === "warn"
                          ? "rgba(251,191,36,0.08)"
                          : ins.type === "error"
                            ? "rgba(239,68,68,0.08)"
                            : "rgba(52,211,153,0.08)",
                      color:
                        ins.type === "warn"
                          ? "#FCD34D"
                          : ins.type === "error"
                            ? "#F87171"
                            : "#6EE7B7",
                      borderLeft: `3px solid ${ins.type === "warn" ? "#FBBF24" : ins.type === "error" ? "#EF4444" : "#34D399"}`,
                    }}
                  >
                    {ins.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div
          style={{
            marginTop: 24,
            fontSize: 11,
            color: "#374151",
            textAlign: "center",
          }}
        >
          Adjust hours in the Adjust tab to see impacts across all views in
          real time
        </div>
      </div>
    </div>
  );
}
