"use client";

import { useRouter } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useGymStorage, toDateStr } from "@/hooks/use-gym-storage";
import { WeeklySchedule } from "./weekly-schedule";
import { TodayWorkout } from "./today-workout";
import { GymHeatmap } from "./gym-heatmap";
import { GymStats } from "./gym-stats";

export function GymDashboard() {
  const router = useRouter();
  const { attendance, stats, toggleAttendance } = useGymStorage();
  const todayStr = toDateStr(new Date());

  return (
    <TooltipProvider>
      <div className="mx-auto max-w-3xl space-y-8">
        <h1 className="text-3xl font-bold">Gym</h1>
        <WeeklySchedule attendance={attendance} />
        <TodayWorkout
          attended={attendance.has(todayStr)}
          onToggle={() => toggleAttendance(todayStr)}
          onNavigateToLog={() => router.push("/gym/log")}
        />
        <GymHeatmap attendance={attendance} onToggle={toggleAttendance} />
        <GymStats stats={stats} />
      </div>
    </TooltipProvider>
  );
}
