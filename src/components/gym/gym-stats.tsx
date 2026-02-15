"use client";

import { Flame, Trophy, Calendar, TrendingUp } from "lucide-react";
import type { GymStats as GymStatsType } from "@/hooks/use-gym-storage";

interface GymStatsProps {
  stats: GymStatsType;
}

const STAT_CARDS = [
  { key: "currentStreak", label: "Current Streak", unit: "days", icon: Flame },
  { key: "longestStreak", label: "Longest Streak", unit: "days", icon: Trophy },
  { key: "totalThisMonth", label: "This Month", unit: "workouts", icon: Calendar },
  { key: "totalThisYear", label: "This Year", unit: "workouts", icon: TrendingUp },
] as const;

export function GymStats({ stats }: GymStatsProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Stats</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STAT_CARDS.map(({ key, label, unit, icon: Icon }) => (
          <div
            key={key}
            className="rounded-xl border bg-card p-4"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon className="h-4 w-4" />
              <span className="text-xs font-medium">{label}</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{stats[key]}</p>
            <p className="text-xs text-muted-foreground">{unit}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
