"use client";

import { useState } from "react";
import { BarChart3, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { computeExerciseVolume, computeSessionVolume } from "./gym-utils";
import type { ExerciseLogEntry } from "@/hooks/use-gym-storage";

interface SessionInsightsProps {
  entries: ExerciseLogEntry[];
  previousEntries: ExerciseLogEntry[] | undefined;
  primaryExerciseName: string;
  completedSets: number;
  totalSets: number;
}

export function SessionInsights({
  entries,
  previousEntries,
  primaryExerciseName,
  completedSets,
  totalSets,
}: SessionInsightsProps) {
  const [open, setOpen] = useState(false);

  const primaryEntry = entries.find((e) => e.exerciseName === primaryExerciseName);
  const prevPrimaryEntry = previousEntries?.find(
    (e) => e.exerciseName === primaryExerciseName
  );

  const primaryVol = primaryEntry ? computeExerciseVolume(primaryEntry.sets) : 0;
  const prevPrimaryVol = prevPrimaryEntry
    ? computeExerciseVolume(prevPrimaryEntry.sets)
    : 0;
  const volDelta = prevPrimaryVol > 0 ? primaryVol - prevPrimaryVol : null;

  const totalVol = computeSessionVolume(entries);

  const stats = [
    {
      label: `${primaryExerciseName} Volume`,
      value: `${primaryVol.toLocaleString()} lbs`,
    },
    ...(volDelta != null
      ? [
          {
            label: "vs Last Session",
            value: `${volDelta >= 0 ? "+" : ""}${volDelta.toLocaleString()} lbs`,
            color: volDelta >= 0 ? "text-green-500" : "text-red-400",
          },
        ]
      : []),
    {
      label: "Total Session Volume",
      value: `${totalVol.toLocaleString()} lbs`,
    },
    {
      label: "Sets Completed",
      value: `${completedSets} / ${totalSets}`,
    },
  ];

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rounded-2xl border bg-card overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-2.5">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-sm">Session Insights</span>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-2">
            {stats.map(({ label, value, color }, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl bg-muted/50 px-3.5 py-2.5"
              >
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className={cn("text-sm font-bold", color)}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
