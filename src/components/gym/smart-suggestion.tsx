"use client";

import { Zap } from "lucide-react";

interface SmartSuggestionProps {
  exerciseName: string;
  suggestion: { weight: number; reps: number } | null;
  hasHistory: boolean;
}

export function SmartSuggestion({
  exerciseName,
  suggestion,
  hasHistory,
}: SmartSuggestionProps) {
  if (!hasHistory) {
    return (
      <div className="flex items-center gap-2.5 rounded-2xl border bg-card px-4 py-3">
        <span className="text-lg">🎯</span>
        <p className="text-sm text-muted-foreground">
          First {exerciseName} session — start light and find your groove!
        </p>
      </div>
    );
  }

  if (!suggestion) return null;

  return (
    <div className="flex items-center gap-2.5 rounded-2xl border bg-gradient-to-r from-yellow-500/10 to-orange-500/10 px-4 py-3">
      <Zap className="h-4 w-4 shrink-0 text-yellow-500" />
      <p className="text-sm">
        Based on last session — try{" "}
        <span className="font-bold">
          {suggestion.weight} lbs × {suggestion.reps}
        </span>{" "}
        on {exerciseName} today! ⚡
      </p>
    </div>
  );
}
