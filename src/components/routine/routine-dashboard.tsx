"use client";

import { useState, useMemo, useEffect } from "react";
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

interface ArcSegment {
  startAngle: number;
  endAngle: number;
  startTime: string;
  endTime: string;
  activity: string;
  cat: string;
  color: string;
  icon: string;
  durationMinutes: number;
  ring: "am" | "pm" | "sleep";
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function to12h(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return m === 0 ? `${h12} ${period}` : `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}

// Standard 12-hour clock: 12 at top (0°), 3 at right (90°), 6 at bottom (180°), 9 at left (270°)
function minutesToClockAngle(minutes: number): number {
  const hourIn12 = (minutes / 60) % 12;
  return (hourIn12 / 12) * 360;
}

function isAM(minutes: number): boolean {
  return minutes < 720; // before noon
}

function describeArc(
  cx: number, cy: number,
  outerR: number, innerR: number,
  startDeg: number, endDeg: number
): string {
  const startRad = ((startDeg - 90) * Math.PI) / 180;
  const endRad = ((endDeg - 90) * Math.PI) / 180;
  const sweep = ((endDeg - startDeg) + 360) % 360;
  const largeArc = sweep > 180 ? 1 : 0;

  const x1o = cx + outerR * Math.cos(startRad);
  const y1o = cy + outerR * Math.sin(startRad);
  const x2o = cx + outerR * Math.cos(endRad);
  const y2o = cy + outerR * Math.sin(endRad);
  const x1i = cx + innerR * Math.cos(endRad);
  const y1i = cy + innerR * Math.sin(endRad);
  const x2i = cx + innerR * Math.cos(startRad);
  const y2i = cy + innerR * Math.sin(startRad);

  return [
    `M ${x1o} ${y1o}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2o} ${y2o}`,
    `L ${x1i} ${y1i}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x2i} ${y2i}`,
    `Z`,
  ].join(" ");
}

function blocksToArcs(blocks: DayBlock[], cats: Category[]): ArcSegment[] {
  const arcs: ArcSegment[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const nextBlock = blocks[(i + 1) % blocks.length];
    const startMin = timeToMinutes(block.time);
    let endMin = i === blocks.length - 1
      ? timeToMinutes(nextBlock.time)
      : timeToMinutes(nextBlock.time);
    if (endMin <= startMin) endMin += 1440;
    const cat = cats.find(c => c.id === block.cat);
    const isSleep = block.cat === "sleep";

    if (isSleep) {
      arcs.push({
        startAngle: minutesToClockAngle(startMin),
        endAngle: minutesToClockAngle(endMin % 1440),
        startTime: block.time, endTime: nextBlock.time,
        activity: block.activity, cat: block.cat,
        color: cat?.color || "#4B5563", icon: cat?.icon || "",
        durationMinutes: endMin - startMin, ring: "sleep",
      });
    } else if (startMin < 720 && endMin > 720) {
      // Block crosses noon — split into AM and PM arcs
      const amCat = cat;
      arcs.push({
        startAngle: minutesToClockAngle(startMin),
        endAngle: minutesToClockAngle(720),
        startTime: block.time, endTime: "12:00",
        activity: block.activity, cat: block.cat,
        color: amCat?.color || "#4B5563", icon: amCat?.icon || "",
        durationMinutes: 720 - startMin, ring: "am",
      });
      arcs.push({
        startAngle: minutesToClockAngle(720),
        endAngle: minutesToClockAngle(endMin),
        startTime: "12:00", endTime: nextBlock.time,
        activity: block.activity, cat: block.cat,
        color: amCat?.color || "#4B5563", icon: amCat?.icon || "",
        durationMinutes: endMin - 720, ring: "pm",
      });
    } else {
      arcs.push({
        startAngle: minutesToClockAngle(startMin),
        endAngle: minutesToClockAngle(endMin),
        startTime: block.time, endTime: nextBlock.time,
        activity: block.activity, cat: block.cat,
        color: cat?.color || "#4B5563", icon: cat?.icon || "",
        durationMinutes: endMin - startMin,
        ring: isAM(startMin) ? "am" : "pm",
      });
    }
  }
  return arcs;
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

export function RoutineDashboard() {
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [activeTab, setActiveTab] = useState("overview");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [hoveredArc, setHoveredArc] = useState<number | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

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

  const orbitArcs = useMemo(
    () => blocksToArcs(dayBlocks, categories),
    [dayBlocks, categories]
  );

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentTimeAngle = minutesToClockAngle(currentMinutes);
  const currentTimeRad = ((currentTimeAngle - 90) * Math.PI) / 180;
  const currentIsAM = isAM(currentMinutes);
  const isSleepTime = currentMinutes >= 1350 || currentMinutes < 360; // 10:30 PM to 6 AM
  const currentTimeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const currentArcIndex = orbitArcs.findIndex(arc => {
    const s = timeToMinutes(arc.startTime);
    const e = timeToMinutes(arc.endTime);
    if (e > s) return currentMinutes >= s && currentMinutes < e;
    return currentMinutes >= s || currentMinutes < e;
  });
  const currentArcSegment = currentArcIndex >= 0 ? orbitArcs[currentArcIndex] : undefined;

  const displayArc = hoveredArc !== null ? orbitArcs[hoveredArc] : currentArcSegment;

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
            Routine
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
              ["orbit", "Orbit"],
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

        {/* ORBIT TAB */}
        {activeTab === "orbit" && (
          <>
            <style>{`
              @keyframes orbitSegmentIn {
                0% { opacity: 0; transform: scale(0.3); transform-origin: 200px 200px; }
                60% { opacity: 0.85; transform: scale(1.04); transform-origin: 200px 200px; }
                100% { opacity: 1; transform: scale(1); transform-origin: 200px 200px; }
              }
              @keyframes orbitHandPulse {
                0%, 100% { filter: drop-shadow(0 0 4px rgba(255,255,255,0.6)); }
                50% { filter: drop-shadow(0 0 10px rgba(255,255,255,1)); }
              }
              @keyframes orbitGlowPulse {
                0%, 100% { opacity: 0.08; }
                50% { opacity: 0.18; }
              }
              @keyframes orbitFadeIn {
                from { opacity: 0; transform: translateY(8px); }
                to { opacity: 1; transform: translateY(0); }
              }
              @keyframes orbitLaser {
                0%, 100% { opacity: 0.5; stroke-width: 1.5; }
                50% { opacity: 1; stroke-width: 2.5; }
              }
              @keyframes orbitLaserOuter {
                0%, 100% { opacity: 0; stroke-width: 2; }
                50% { opacity: 0.3; stroke-width: 6; }
              }
            `}</style>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Left: Clock */}
              <div style={{
                background: "rgba(255,255,255,0.03)",
                borderRadius: 16,
                padding: 24,
                border: "1px solid rgba(255,255,255,0.05)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}>
                <div style={{ width: "100%", marginBottom: 12 }}>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#9CA3AF" }}>
                    Daily Orbit
                  </h3>
                  <span style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}>
                    {dayTemplates[weekSchedule[selectedDay]].label} · {weekdays[selectedDay]}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 4, marginBottom: 16, width: "100%" }}>
                  {weekdays.map((d, i) => (
                    <button
                      key={d}
                      onClick={() => { setSelectedDay(i); setHoveredArc(null); }}
                      style={{
                        flex: 1,
                        padding: "6px 0",
                        borderRadius: 8,
                        border: "none",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                        transition: "all 0.2s",
                        background: selectedDay === i ? "rgba(79,142,247,0.15)" : "rgba(255,255,255,0.04)",
                        color: selectedDay === i ? "#4F8EF7" : "#6B7280",
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <svg viewBox="0 0 400 400" style={{ width: "100%", maxWidth: 380 }}>
                  <defs>
                    <filter id="orbitGlow">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <filter id="orbitLaserGlow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="3" result="blur1" />
                      <feGaussianBlur stdDeviation="8" result="blur2" />
                      <feMerge>
                        <feMergeNode in="blur2" />
                        <feMergeNode in="blur1" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="rgba(79,142,247,0.1)" />
                      <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                  </defs>

                  {/* Center glow */}
                  <circle cx="200" cy="200" r="100" fill="url(#centerGlow)" style={{ animation: "orbitGlowPulse 4s ease-in-out infinite" }} />

                  {/* Ring guides */}
                  <circle cx="200" cy="200" r="175" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                  <circle cx="200" cy="200" r="130" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />

                  {/* Arc segments — PM outer ring, AM inner ring */}
                  <g key={selectedDay}>
                    {orbitArcs.map((arc, i) => {
                      const startDeg = arc.startAngle + 0.4;
                      let endDeg = arc.endAngle - 0.4;
                      if (endDeg < startDeg) endDeg += 360;
                      let outerR: number, innerR: number;
                      if (arc.ring === "pm") {
                        outerR = 174; innerR = 132;
                      } else if (arc.ring === "am") {
                        outerR = 128; innerR = 104;
                      } else {
                        // sleep — skip rendering on the ring
                        return null;
                      }
                      const isCurrentRing = i === currentArcIndex;
                      const isHighlighted = hoveredArc === i || isCurrentRing;
                      const isInactiveHalf = (currentIsAM && arc.ring === "pm") || (!currentIsAM && arc.ring === "am");
                      const arcOpacity = isHighlighted ? 1 : isInactiveHalf ? 0.15 : 0.7;
                      return (
                        <g key={i} style={{ animation: `orbitSegmentIn 0.6s ease-out ${i * 0.06}s both` }}>
                          <path
                            d={describeArc(200, 200, outerR, innerR, startDeg, endDeg)}
                            fill={arc.color}
                            opacity={arcOpacity}
                            stroke="#0d0d1a"
                            strokeWidth="1.5"
                            style={{
                              filter: isHighlighted ? "url(#orbitGlow)" : "none",
                              transition: "opacity 0.2s, filter 0.2s",
                              cursor: "pointer",
                            }}
                            onMouseEnter={() => setHoveredArc(i)}
                            onMouseLeave={() => setHoveredArc(null)}
                          />
                          {isCurrentRing && (() => {
                            const entryDelay = 0.3 + i * 0.06; // overlap with tail end of segment entry
                            return (
                              <>
                                {/* Laser core — bright tight outline */}
                                <path
                                  d={describeArc(200, 200, outerR + 2, innerR - 2, startDeg, endDeg)}
                                  fill="none"
                                  stroke={arc.color}
                                  strokeWidth="2"
                                  opacity="0"
                                  style={{ animation: `orbitLaser 2s ease-in-out ${entryDelay}s infinite`, filter: "url(#orbitLaserGlow)" }}
                                />
                                {/* Laser bloom — wide soft glow */}
                                <path
                                  d={describeArc(200, 200, outerR + 5, innerR - 5, startDeg, endDeg)}
                                  fill="none"
                                  stroke={arc.color}
                                  strokeWidth="4"
                                  opacity="0"
                                  style={{ animation: `orbitLaserOuter 2s ease-in-out ${entryDelay}s infinite` }}
                                />
                              </>
                            );
                          })()}
                        </g>
                      );
                    })}
                  </g>

                  {/* Hour tick marks — standard 12-hour positions */}
                  {Array.from({ length: 12 }, (_, i) => {
                    const deg = (i / 12) * 360;
                    const angle = ((deg - 90) * Math.PI) / 180;
                    const isMajor = i % 3 === 0;
                    const r1 = isMajor ? 176 : 175;
                    const r2 = isMajor ? 186 : 181;
                    return (
                      <line
                        key={i}
                        x1={200 + r1 * Math.cos(angle)}
                        y1={200 + r1 * Math.sin(angle)}
                        x2={200 + r2 * Math.cos(angle)}
                        y2={200 + r2 * Math.sin(angle)}
                        stroke={isMajor ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.15)"}
                        strokeWidth={isMajor ? 2 : 1}
                      />
                    );
                  })}

                  {/* Hour labels — standard clock: 12 at top, 3 right, 6 bottom, 9 left */}
                  {([
                    [0, "12"], [1, "1"], [2, "2"], [3, "3"], [4, "4"], [5, "5"],
                    [6, "6"], [7, "7"], [8, "8"], [9, "9"], [10, "10"], [11, "11"],
                  ] as const).map(([pos, label]) => {
                    const deg = (pos / 12) * 360;
                    const angle = ((deg - 90) * Math.PI) / 180;
                    const r = 194;
                    return (
                      <text
                        key={pos}
                        x={200 + r * Math.cos(angle)}
                        y={200 + r * Math.sin(angle)}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="rgba(255,255,255,0.45)"
                        fontSize="11"
                        fontWeight="600"
                        fontFamily="'DM Sans', sans-serif"
                      >
                        {label}
                      </text>
                    );
                  })}

                  {/* Ring labels */}
                  <text x="200" y="22" textAnchor="middle" fill="#4F8EF7" fontSize="8" fontWeight="700" fontFamily="'DM Sans', sans-serif" opacity="0.6" letterSpacing="1">
                    PM
                  </text>
                  <text x="200" y="80" textAnchor="middle" fill="#9CA3AF" fontSize="8" fontWeight="700" fontFamily="'DM Sans', sans-serif" opacity="0.4" letterSpacing="1">
                    AM
                  </text>

                  {/* Current time hand */}
                  {!isSleepTime && (
                    <>
                      <line
                        x1={200 + (currentIsAM ? 98 : 100) * Math.cos(currentTimeRad)}
                        y1={200 + (currentIsAM ? 98 : 100) * Math.sin(currentTimeRad)}
                        x2={200 + (currentIsAM ? 130 : 180) * Math.cos(currentTimeRad)}
                        y2={200 + (currentIsAM ? 130 : 180) * Math.sin(currentTimeRad)}
                        stroke="#ffffff"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        style={{ animation: "orbitHandPulse 3s ease-in-out infinite" }}
                      />
                      <circle
                        cx={200 + (currentIsAM ? 130 : 180) * Math.cos(currentTimeRad)}
                        cy={200 + (currentIsAM ? 130 : 180) * Math.sin(currentTimeRad)}
                        r="4"
                        fill="#fff"
                        style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.8))" }}
                      />
                    </>
                  )}

                  {/* Center info */}
                  <text x="200" y={hoveredArc !== null ? 180 : 185} textAnchor="middle" fill="#e8e8f0" fontSize="24" fontWeight="700" fontFamily="'DM Sans', sans-serif">
                    {hoveredArc !== null ? `${orbitArcs[hoveredArc].icon}` : currentTimeStr}
                  </text>
                  <text x="200" y={hoveredArc !== null ? 205 : 210} textAnchor="middle" fill={displayArc?.color || "#9CA3AF"} fontSize="12" fontWeight="600" fontFamily="'DM Sans', sans-serif">
                    {displayArc?.activity || ""}
                  </text>
                  <text x="200" y={hoveredArc !== null ? 223 : 228} textAnchor="middle" fill="#6B7280" fontSize="10" fontFamily="'DM Sans', sans-serif">
                    {displayArc ? `${to12h(displayArc.startTime)} – ${to12h(displayArc.endTime)}` : ""}
                  </text>
                  {hoveredArc !== null && (
                    <text x="200" y="240" textAnchor="middle" fill="#4B5563" fontSize="10" fontFamily="'DM Sans', sans-serif">
                      {Math.floor(orbitArcs[hoveredArc].durationMinutes / 60) > 0
                        ? `${Math.floor(orbitArcs[hoveredArc].durationMinutes / 60)}h${orbitArcs[hoveredArc].durationMinutes % 60 > 0 ? ` ${orbitArcs[hoveredArc].durationMinutes % 60}m` : ""}`
                        : `${orbitArcs[hoveredArc].durationMinutes}m`}
                    </text>
                  )}
                </svg>
              </div>

              {/* Right: Schedule Breakdown */}
              <div style={{
                background: "rgba(255,255,255,0.03)",
                borderRadius: 16,
                padding: "24px 16px",
                border: "1px solid rgba(255,255,255,0.05)",
                overflow: "hidden",
                minWidth: 0,
              }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600, color: "#9CA3AF" }}>
                  Schedule Breakdown
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {orbitArcs.map((arc, i) => {
                    const hours = Math.floor(arc.durationMinutes / 60);
                    const mins = arc.durationMinutes % 60;
                    const dur = hours > 0 ? `${hours}h${mins > 0 ? ` ${mins}m` : ""}` : `${mins}m`;
                    const isCurrent = i === currentArcIndex;
                    return (
                      <div
                        key={i}
                        onMouseEnter={() => setHoveredArc(i)}
                        onMouseLeave={() => setHoveredArc(null)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "8px 10px",
                          borderRadius: 8,
                          background: hoveredArc === i
                            ? `${arc.color}15`
                            : isCurrent
                              ? `${arc.color}30`
                              : "transparent",
                          border: isCurrent ? `1.5px solid ${arc.color}` : "1px solid transparent",
                          boxShadow: isCurrent ? `0 0 20px ${arc.color}60, 0 0 40px ${arc.color}25, inset 0 0 12px ${arc.color}20` : "none",
                          animation: `orbitFadeIn 0.4s ease-out ${i * 0.04}s both`,
                          transition: "all 0.3s",
                          cursor: "pointer",
                        }}
                      >
                        <div style={{
                          width: 10, height: 10, borderRadius: 3,
                          background: arc.color, flexShrink: 0,
                        }} />
                        <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: isCurrent ? "#f3f4f6" : "#d1d5db", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{arc.icon} {arc.activity}</span>
                            {isCurrent && (
                              <span style={{
                                fontSize: 8, fontWeight: 700, color: arc.color,
                                background: `${arc.color}20`, padding: "1px 5px",
                                borderRadius: 4, flexShrink: 0, letterSpacing: "0.05em",
                              }}>NOW</span>
                            )}
                          </div>
                          <div style={{ fontSize: 10, color: isCurrent ? "#9CA3AF" : "#6B7280" }}>
                            {to12h(arc.startTime)} – {to12h(arc.endTime)}
                          </div>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: arc.color, flexShrink: 0, minWidth: 50, textAlign: "right" }}>
                          {dur}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Category totals */}
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", marginBottom: 10 }}>
                    Category Totals
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {(() => {
                      const totals: Record<string, number> = {};
                      orbitArcs.forEach(a => { totals[a.cat] = (totals[a.cat] || 0) + a.durationMinutes; });
                      return Object.entries(totals)
                        .sort((a, b) => b[1] - a[1])
                        .map(([catId, mins]) => {
                          const cat = categories.find(c => c.id === catId);
                          if (!cat) return null;
                          const hours = Math.floor(mins / 60);
                          const m = mins % 60;
                          const dur = hours > 0 ? `${hours}h${m > 0 ? ` ${m}m` : ""}` : `${m}m`;
                          const pct = (mins / 1440) * 100;
                          return (
                            <div key={catId}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500 }}>
                                  {cat.icon} {cat.label.split(" (")[0].split(" /")[0]}
                                </span>
                                <span style={{ fontSize: 11, color: cat.color, fontWeight: 600 }}>{dur}</span>
                              </div>
                              <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                                <div style={{
                                  height: "100%", borderRadius: 2,
                                  background: cat.color, width: `${pct}%`,
                                  transition: "width 0.4s ease",
                                }} />
                              </div>
                            </div>
                          );
                        });
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </>
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
