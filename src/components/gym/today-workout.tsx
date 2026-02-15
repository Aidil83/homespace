"use client";

import { useState } from "react";
import { ChevronRight, CircleCheck, Circle, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTodayWorkout } from "./workout-data";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface TodayWorkoutProps {
  attended: boolean;
  onToggle: () => void;
  onNavigateToLog?: () => void;
}

export function TodayWorkout({
  attended,
  onToggle,
  onNavigateToLog,
}: TodayWorkoutProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const workout = getTodayWorkout();
  const dayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const isRest = workout.type === "rest";
  const isClickable = !isRest && onNavigateToLog;

  return (
    <>
      <div
        onClick={() => isClickable && onNavigateToLog()}
        className={cn(
          "rounded-xl border bg-card p-6 transition-colors",
          isClickable && "cursor-pointer hover:bg-accent/50"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{workout.emoji}</span>
            <div>
              <h2 className="text-xl font-semibold">{workout.label}</h2>
              <p className="text-sm text-muted-foreground">{dayName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isRest && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle();
                }}
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
            {isClickable && (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>

        {isRest ? (
          <p className="mt-4 text-muted-foreground">
            Take it easy today. Recovery is part of the process.
          </p>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSheetOpen(true);
            }}
            className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Dumbbell className="h-4 w-4" />
            Show exercises ({workout.exercises.length})
          </button>
        )}
      </div>

      {!isRest && (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side="bottom" className="rounded-t-xl">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <span>{workout.emoji}</span>
                {workout.label}
              </SheetTitle>
              <SheetDescription>
                {workout.exercises.length} exercises
              </SheetDescription>
            </SheetHeader>
            <div className="px-4 pb-6 space-y-1">
              {workout.exercises.map((exercise) => (
                <div
                  key={exercise.name}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5"
                >
                  <span className="text-sm font-medium">{exercise.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {exercise.sets} sets &middot; {exercise.reps} reps
                  </span>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
