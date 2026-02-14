"use client";

import { useState } from "react";
import { ChevronDown, CircleCheck, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTodayWorkout } from "./workout-data";

interface TodayWorkoutProps {
  attended: boolean;
  onToggle: () => void;
}

export function TodayWorkout({ attended, onToggle }: TodayWorkoutProps) {
  const [expanded, setExpanded] = useState(false);
  const workout = getTodayWorkout();
  const dayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const isRest = workout.type === "rest";

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{workout.emoji}</span>
          <div>
            <h2 className="text-xl font-semibold">{workout.label}</h2>
            <p className="text-sm text-muted-foreground">{dayName}</p>
          </div>
        </div>
        {!isRest && (
          <button
            onClick={onToggle}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              attended
                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {attended ? (
              <CircleCheck className="h-4 w-4" />
            ) : (
              <Circle className="h-4 w-4" />
            )}
            {attended ? "Done" : "Mark as done"}
          </button>
        )}
      </div>

      {isRest ? (
        <p className="mt-4 text-muted-foreground">
          Take it easy today. Recovery is part of the process.
        </p>
      ) : (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                expanded && "rotate-180"
              )}
            />
            {expanded ? "Hide" : "Show"} exercises ({workout.exercises.length})
          </button>

          {expanded && (
            <div className="mt-3 space-y-2">
              {workout.exercises.map((exercise) => (
                <div
                  key={exercise.name}
                  className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2.5"
                >
                  <span className="text-sm font-medium">{exercise.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {exercise.sets} &times; {exercise.reps}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
