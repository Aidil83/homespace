"use client";

import { useMemo, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getWorkoutForDate } from "./workout-data";
import { toDateStr } from "@/hooks/use-gym-storage";

interface GymHeatmapProps {
  attendance: Set<string>;
  onDayClick: (dateStr: string) => void;
}

interface DayCell {
  date: Date;
  dateStr: string;
}

function generateWeeks(): DayCell[][] {
  const today = new Date();

  // End at this week's Saturday
  const end = new Date(today);
  end.setDate(end.getDate() + (6 - end.getDay()));

  // Start ~52 weeks back, aligned to Sunday
  const start = new Date(end);
  start.setDate(start.getDate() - 52 * 7 + 1);
  // Align to Sunday
  start.setDate(start.getDate() - start.getDay());

  const weeks: DayCell[][] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    const week: DayCell[] = [];
    for (let d = 0; d < 7; d++) {
      week.push({
        date: new Date(cursor),
        dateStr: toDateStr(cursor),
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  return weeks;
}

function getMonthLabels(
  weeks: DayCell[][]
): { label: string; colIndex: number }[] {
  const labels: { label: string; colIndex: number }[] = [];
  const seen = new Set<string>();

  for (let wi = 0; wi < weeks.length; wi++) {
    for (const day of weeks[wi]) {
      // Place label at the week containing the 1st of each month
      if (day.date.getDate() === 1) {
        const key = `${day.date.getFullYear()}-${day.date.getMonth()}`;
        if (seen.has(key)) continue;
        seen.add(key);
        // Skip if too close to previous label (< 3 columns apart)
        if (labels.length > 0 && wi - labels[labels.length - 1].colIndex < 3) {
          continue;
        }
        labels.push({
          label: day.date.toLocaleString("default", { month: "short" }),
          colIndex: wi,
        });
        break;
      }
    }
  }

  return labels;
}

export function GymHeatmap({ attendance, onDayClick }: GymHeatmapProps) {
  const todayStr = useMemo(() => toDateStr(new Date()), []);
  const currentYear = new Date().getFullYear();
  const scrollRef = useRef<HTMLDivElement>(null);

  const weeks = useMemo(() => generateWeeks(), []);
  const monthLabels = useMemo(() => getMonthLabels(weeks), [weeks]);

  // Auto-scroll to show today (rightmost) on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, []);

  return (
    <div className="space-y-3 pb-4">
      <div className="flex items-baseline gap-2">
        <h2 className="text-lg font-semibold">Activity</h2>
        <span className="text-sm text-muted-foreground">{currentYear}</span>
      </div>

      <div ref={scrollRef} className="overflow-x-auto pb-2">
        <div className="inline-flex flex-col gap-1 pr-4">
          {/* Month labels */}
          <div className="relative h-4">
            {monthLabels.map(({ label, colIndex }) => (
              <span
                key={`${label}-${colIndex}`}
                className="absolute text-xs text-muted-foreground"
                style={{ left: colIndex * 15 }}
              >
                {label}
              </span>
            ))}
          </div>

          {/* Grid — no day labels, LeetCode style */}
          <div className="flex gap-[3px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day, di) => {
                  const attended = attendance.has(day.dateStr);
                  const isToday = day.dateStr === todayStr;
                  const isFuture = day.dateStr > todayStr;
                  const workout = getWorkoutForDate(day.date);
                  const isRest = workout.type === "rest";

                  const statusText = attended
                    ? "Attended"
                    : isRest
                      ? "Rest day"
                      : isFuture
                        ? workout.label
                        : "Missed";

                  return (
                    <Tooltip key={di}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() =>
                            !isFuture && !isRest && onDayClick(day.dateStr)
                          }
                          disabled={isFuture || isRest}
                          className={cn(
                            "h-[12px] w-[12px] rounded-[2px] transition-colors",
                            attended
                              ? "bg-green-500 dark:bg-green-600"
                              : "bg-muted",
                            isToday && "ring-1 ring-foreground/40",
                            isFuture && "opacity-30",
                            !isFuture &&
                              !isRest &&
                              !attended &&
                              "hover:bg-muted-foreground/20"
                          )}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        <p className="font-medium">{day.dateStr}</p>
                        <p className="text-muted-foreground">{statusText}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
