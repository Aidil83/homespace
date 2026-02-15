"use client";

import { ArrowLeft, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LogHeaderProps {
  dayName: string;
  dateStr: string;
  splitLabel: string;
  splitEmoji: string;
  streak: number;
  completedSets: number;
  totalSets: number;
  onBack: () => void;
}

export function LogHeader({
  dayName,
  dateStr,
  splitLabel,
  splitEmoji,
  streak,
  completedSets,
  totalSets,
  onBack,
}: LogHeaderProps) {
  const formattedDate = new Date(dateStr + "T00:00:00").toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric" }
  );

  return (
    <div className="flex items-center gap-3">
      <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <span className="text-3xl">{splitEmoji}</span>
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-bold">{splitLabel}</h1>
        <p className="text-sm text-muted-foreground">
          {dayName}, {formattedDate}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {streak > 0 && (
          <div className="flex items-center gap-1 rounded-full bg-orange-500/10 px-3 py-1">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-semibold text-orange-500">{streak}</span>
          </div>
        )}
        <span className="text-sm text-muted-foreground">
          {completedSets}/{totalSets} sets
        </span>
      </div>
    </div>
  );
}
