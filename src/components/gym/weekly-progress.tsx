"use client";

import { useState } from "react";
import { TrendingUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { MiniChart } from "./mini-chart";

interface WeeklyProgressProps {
  e1rmHistory: { date: string; e1rm: number }[];
  volumeHistory: { date: string; volume: number }[];
}

export function WeeklyProgress({
  e1rmHistory,
  volumeHistory,
}: WeeklyProgressProps) {
  const [open, setOpen] = useState(false);

  const e1rmValues = e1rmHistory.map((d) => d.e1rm);
  const volumeValues = volumeHistory.map((d) => d.volume);

  const latestE1RM = e1rmValues.length > 0 ? e1rmValues[e1rmValues.length - 1] : 0;
  const firstE1RM = e1rmValues.length > 0 ? e1rmValues[0] : 0;
  const e1rmGain = latestE1RM - firstE1RM;

  const latestVol = volumeValues.length > 0 ? volumeValues[volumeValues.length - 1] : 0;

  const hasData = e1rmValues.length >= 2 || volumeValues.length >= 2;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rounded-2xl border bg-card overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-2.5">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-sm">Weekly Progress</span>
              {e1rmGain > 0 && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-400">
                  +{e1rmGain} lbs
                </span>
              )}
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
          <div className="px-4 pb-4 space-y-4">
            {!hasData ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Need at least 2 sessions to show trends
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {/* 1RM Trend */}
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-[10px] font-medium uppercase text-muted-foreground mb-1">
                    1RM Trend
                  </p>
                  <p className="text-xl font-extrabold text-purple-400 mb-2">
                    {latestE1RM}
                  </p>
                  {e1rmValues.length >= 2 && (
                    <MiniChart data={e1rmValues} color="#8b5cf6" height={50} />
                  )}
                </div>

                {/* Volume Trend */}
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-[10px] font-medium uppercase text-muted-foreground mb-1">
                    Volume Trend
                  </p>
                  <p className="text-xl font-extrabold text-green-400 mb-2">
                    {latestVol.toLocaleString()}
                  </p>
                  {volumeValues.length >= 2 && (
                    <MiniChart data={volumeValues} color="#22c55e" height={50} />
                  )}
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
