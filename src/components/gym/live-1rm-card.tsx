"use client";

import { Progress } from "@/components/ui/progress";

interface Live1RMCardProps {
  currentE1RM: number;
  targetE1RM: number | null;
}

export function Live1RMCard({ currentE1RM, targetE1RM }: Live1RMCardProps) {
  if (currentE1RM <= 0) return null;

  const pct = targetE1RM ? Math.min(100, Math.round((currentE1RM / targetE1RM) * 100)) : null;
  const gap = targetE1RM ? targetE1RM - currentE1RM : null;
  const hitGoal = gap != null && gap <= 0;

  return (
    <div className="mt-3 rounded-xl border border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-indigo-500/8 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Live Estimated 1RM
        </span>
        {targetE1RM && (
          <span className={`text-[11px] font-bold ${hitGoal ? "text-green-500" : "text-purple-400"}`}>
            {hitGoal ? "🎉 Goal hit!" : `${gap} lbs to ${targetE1RM}`}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1.5 mb-2">
        <span className={`text-2xl font-extrabold ${hitGoal ? "text-green-500" : ""}`}>
          {currentE1RM}
        </span>
        <span className="text-sm font-semibold text-muted-foreground">lbs</span>
        {pct != null && (
          <span className="ml-auto text-xs text-muted-foreground">{pct}% of goal</span>
        )}
      </div>
      {pct != null && (
        <Progress
          value={pct}
          className={`h-1.5 ${hitGoal ? "[&>div]:bg-green-500" : "[&>div]:bg-gradient-to-r [&>div]:from-indigo-500 [&>div]:to-purple-400"}`}
        />
      )}
    </div>
  );
}
