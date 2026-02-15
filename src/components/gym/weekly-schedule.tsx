"use client";

import { useMemo } from "react";
import { CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { getWeekSchedule } from "./workout-data";
import { toDateStr } from "@/hooks/use-gym-storage";

interface WeeklyScheduleProps {
  attendance: Set<string>;
}

function getWeekDates(): Date[] {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - dayOfWeek + i);
    dates[i] = d;
  }
  return dates;
}

export function WeeklySchedule({ attendance }: WeeklyScheduleProps) {
  const schedule = useMemo(() => getWeekSchedule(), []);
  const weekDates = useMemo(() => getWeekDates(), []);
  const todayIndex = new Date().getDay();

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">This Week</h2>
      <div className="grid grid-cols-7 gap-2">
        {schedule.map((day, i) => {
          const dateStr = toDateStr(weekDates[i]);
          const isToday = day.dayIndex === todayIndex;
          const completed = attendance.has(dateStr);

          return (
            <div
              key={day.dayIndex}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-lg border p-2 text-center transition-colors",
                isToday && "border-primary border-2",
                completed && "bg-green-500/10",
                !isToday && !completed && "bg-card"
              )}
            >
              <span className="text-[10px] font-medium uppercase text-muted-foreground">
                {day.shortDay}
              </span>
              <span className="text-sm font-medium leading-none">
                {day.workout.emoji}
              </span>
              <span className="text-[10px] text-muted-foreground leading-none">
                {day.type === "rest" ? "Rest" : day.type.charAt(0).toUpperCase() + day.type.slice(1)}
              </span>
              {completed && (
                <CircleCheck className="h-3 w-3 text-green-500" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
