"use client";

import { ChevronDown, Check, Plus as PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Stepper } from "./stepper";
import { bestE1RMFromSets, EXERCISE_EMOJI, EXERCISE_COLORS } from "./gym-utils";
import type { Exercise } from "./workout-data";
import type { ExerciseLogEntry, SetEntry } from "@/hooks/use-gym-storage";

interface ExerciseCardProps {
  entry: ExerciseLogEntry;
  exerciseDef: Exercise;
  colorIndex: number;
  previousSets: SetEntry[] | undefined;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateSet: (setIndex: number, field: "weight" | "reps", value: number | null) => void;
  onToggleComplete: (setIndex: number) => void;
  onAddSet: () => void;
}

export function ExerciseCard({
  entry,
  exerciseDef,
  colorIndex,
  previousSets,
  isOpen,
  onOpenChange,
  onUpdateSet,
  onToggleComplete,
  onAddSet,
}: ExerciseCardProps) {
  const emoji = EXERCISE_EMOJI[entry.exerciseName] ?? "💪";
  const colors = EXERCISE_COLORS[colorIndex % EXERCISE_COLORS.length];
  const completedSets = entry.sets.filter((s) => s.completed).length;
  const totalSets = entry.sets.length;
  const progressPercent = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  const allDone = completedSets === totalSets && totalSets > 0;
  const e1rm = bestE1RMFromSets(entry.sets);

  // Previous session summary
  const prevSummary = previousSets
    ?.filter((s) => s.weight != null && s.reps != null)
    .map((s) => `${s.weight}×${s.reps}`)
    .join(", ");

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <div
        className={cn(
          "rounded-2xl border overflow-hidden transition-all",
          allDone && "border-green-500/30",
          colors.border
        )}
      >
        {/* Collapsed trigger / header */}
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "w-full flex items-center gap-3 px-4 py-4 text-left transition-colors",
              "bg-gradient-to-r",
              colors.gradient,
              "hover:opacity-90"
            )}
          >
            <span className="text-2xl">{emoji}</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{entry.exerciseName}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {exerciseDef.sets} sets · {exerciseDef.reps} reps · ±{exerciseDef.weightIncrement} lbs
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={cn("text-sm font-semibold", allDone ? "text-green-500" : colors.text)}>
                {completedSets}/{totalSets}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </div>
          </button>
        </CollapsibleTrigger>

        {/* Expanded content */}
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-3">
            {/* Previous session reference */}
            <div className="rounded-lg bg-muted/50 px-3 py-2">
              <p className="text-xs text-muted-foreground">
                {prevSummary ? (
                  <>Last session: <span className="font-medium">{prevSummary}</span></>
                ) : (
                  "No previous data"
                )}
              </p>
            </div>

            {/* Column labels */}
            <div className="grid grid-cols-[32px_1fr_1fr_36px] gap-2">
              <span className="text-[10px] font-medium uppercase text-muted-foreground text-center">
                Set
              </span>
              <span className="text-[10px] font-medium uppercase text-muted-foreground text-center">
                Weight
              </span>
              <span className="text-[10px] font-medium uppercase text-muted-foreground text-center">
                Reps
              </span>
              <span />
            </div>

            {/* Set rows */}
            {entry.sets.map((set, si) => (
              <div
                key={si}
                className={cn(
                  "grid grid-cols-[32px_1fr_1fr_36px] gap-2 items-center rounded-lg py-1 transition-all duration-200",
                  set.completed && "bg-green-500/10"
                )}
              >
                <span className="text-sm font-medium text-center text-muted-foreground">
                  {si + 1}
                </span>
                <Stepper
                  value={set.weight}
                  increment={exerciseDef.weightIncrement}
                  onChange={(v) => onUpdateSet(si, "weight", v)}
                  unit="lbs"
                />
                <Stepper
                  value={set.reps}
                  increment={1}
                  onChange={(v) => onUpdateSet(si, "reps", v)}
                />
                <button
                  type="button"
                  onClick={() => onToggleComplete(si)}
                  className={cn(
                    "mx-auto flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-200",
                    set.completed
                      ? "border-green-500 bg-green-500 text-white scale-100"
                      : "border-muted-foreground/30 text-muted-foreground/30 hover:border-muted-foreground/60 scale-95"
                  )}
                >
                  <Check className="h-4 w-4" />
                </button>
              </div>
            ))}

            {/* Add Set + E1RM */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={onAddSet}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                Add Set
              </button>
              {e1rm > 0 && (
                <span className="text-xs text-muted-foreground">
                  Est. 1RM: <span className="font-semibold">{e1rm} lbs</span>
                </span>
              )}
            </div>

            {/* Progress bar */}
            <Progress value={progressPercent} className="h-1.5" />
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
