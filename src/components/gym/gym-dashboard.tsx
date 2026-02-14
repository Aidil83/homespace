"use client";

import { useState, useCallback } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TodayWorkout } from "./today-workout";
import { GymHeatmap } from "./gym-heatmap";

function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function GymDashboard() {
  const [attendance, setAttendance] = useState<Set<string>>(new Set());
  const todayStr = toDateStr(new Date());

  const toggleAttendance = useCallback((dateStr: string) => {
    setAttendance((prev) => {
      const next = new Set(prev);
      if (next.has(dateStr)) {
        next.delete(dateStr);
      } else {
        next.add(dateStr);
      }
      return next;
    });
  }, []);

  return (
    <TooltipProvider>
      <div className="mx-auto max-w-3xl space-y-8">
        <h1 className="text-3xl font-bold">Gym</h1>
        <TodayWorkout
          attended={attendance.has(todayStr)}
          onToggle={() => toggleAttendance(todayStr)}
        />
        <GymHeatmap attendance={attendance} onToggle={toggleAttendance} />
      </div>
    </TooltipProvider>
  );
}
