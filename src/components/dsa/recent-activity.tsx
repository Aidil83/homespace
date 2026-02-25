"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { DifficultyBadge } from "./difficulty-badge";
import { DAILY_PROBLEM_POOL } from "@/data/daily-problems";
import { NEETCODE_TOPICS } from "@/data/neetcode-150";
import { CheckCircle, ChevronDown, History } from "lucide-react";
import { formatTime } from "@/lib/stopwatch";

const DAILY_MAP = new Map(DAILY_PROBLEM_POOL.map((p) => [p.id, p]));
const NEETCODE_MAP = new Map(
  NEETCODE_TOPICS.flatMap((t) => t.problems).map((p) => [p.id, p])
);

interface Activity {
  type: "daily" | "neetcode";
  date: string;
  problemId: string;
  difficulty: string;
  elapsedSec: number;
}

interface DayGroup {
  date: string;
  entries: Activity[];
}

function groupByDate(entries: Activity[]): DayGroup[] {
  const map = new Map<string, Activity[]>();
  for (const e of entries) {
    if (!map.has(e.date)) map.set(e.date, []);
    map.get(e.date)!.push(e);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, entries]) => ({ date, entries }));
}

function relativeDate(dateStr: string): string {
  const today = new Date();
  const target = new Date(dateStr + "T00:00:00");
  const diffMs = today.getTime() - target.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return target.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function resolveProblem(entry: Activity) {
  if (entry.type === "daily") {
    const p = DAILY_MAP.get(entry.problemId);
    if (p) return { name: `#${p.number}. ${p.name}`, url: p.url, difficulty: entry.difficulty };
  } else {
    const p = NEETCODE_MAP.get(entry.problemId);
    if (p) return { name: `#${p.number}. ${p.name}`, url: p.url, difficulty: p.difficulty.toLowerCase() };
  }
  return { name: entry.problemId, url: `https://leetcode.com/problems/${entry.problemId}/`, difficulty: entry.difficulty };
}

const PREVIEW_COUNT = 3;

function ActivityRow({ entry }: { entry: Activity }) {
  const info = resolveProblem(entry);
  return (
    <div className="flex items-center gap-2 text-sm">
      <CheckCircle className="h-3.5 w-3.5 text-green-400 shrink-0" />
      {entry.type === "neetcode" && (
        <span className="shrink-0 rounded bg-blue-600/20 px-1.5 py-0.5 text-[10px] font-medium text-blue-400">NC</span>
      )}
      <DifficultyBadge difficulty={info.difficulty} />
      <a
        href={info.url}
        target="_blank"
        rel="noopener noreferrer"
        className="truncate hover:text-primary hover:underline transition-colors"
      >
        {info.name}
      </a>
      <span className="ml-auto shrink-0 text-xs font-mono tabular-nums text-muted-foreground">
        {formatTime(entry.elapsedSec)}
      </span>
    </div>
  );
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [history, setHistory] = useState<DayGroup[]>([]);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    fetch("/api/dsa/activity-history?limit=30")
      .then((r) => (r.ok ? r.json() : { activities: [] }))
      .then((data: { activities: Activity[] }) => {
        setActivities(data.activities);
        setHistory(groupByDate(data.activities));
      })
      .catch(() => {});
  }, []);

  if (activities.length === 0) return null;

  const preview = activities.slice(0, PREVIEW_COUNT);
  const hasMore = activities.length > PREVIEW_COUNT;

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Recent Activity</h3>
        </div>
        {hasMore && (
          <button
            onClick={() => setShowMore((s) => !s)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showMore ? "Show less" : `View more (${activities.length - PREVIEW_COUNT})`}
            <ChevronDown className={cn("h-3 w-3 transition-transform", showMore && "rotate-180")} />
          </button>
        )}
      </div>

      {/* Always show the most recent 3 */}
      <div className="space-y-1">
        {preview.map((entry, i) => (
          <ActivityRow key={`${entry.type}-${entry.problemId}-${i}`} entry={entry} />
        ))}
      </div>

      {/* Expanded view grouped by date */}
      {showMore && (
        <div className="space-y-3 border-t border-border pt-3">
          {history.map((day) => (
            <div key={day.date} className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">{relativeDate(day.date)}</p>
              <div className="space-y-1">
                {day.entries.map((entry, i) => (
                  <ActivityRow key={`${entry.type}-${entry.problemId}-${i}`} entry={entry} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
