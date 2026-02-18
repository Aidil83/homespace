"use client";

import { useState, Fragment } from "react";
import { ChevronDown, Check, Plus as PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Stepper } from "./stepper";
import { RestTimer } from "./rest-timer";
import { Live1RMCard } from "./live-1rm-card";
import {
  bestE1RMFromSets,
  computeSetVolume,
  EXERCISE_EMOJI,
  EXERCISE_COLORS,
  MUSCLE_COLORS,
} from "./gym-utils";
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
  isPrimary?: boolean;
  targetE1RM?: number | null;
}

function Delta({ current, previous, unit = "" }: { current: number | null; previous: number | null; unit?: string }) {
  if (current == null || previous == null) return null;
  const diff = current - previous;
  if (diff === 0) return null;
  return (
    <span
      className={cn(
        "text-[10px] font-bold inline-flex items-center gap-0.5",
        diff > 0 ? "text-green-500" : "text-red-400"
      )}
    >
      {diff > 0 ? "▲" : "▼"} {Math.abs(diff)}{unit}
    </span>
  );
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
  isPrimary = false,
  targetE1RM,
}: ExerciseCardProps) {
  const emoji = EXERCISE_EMOJI[entry.exerciseName] ?? "💪";
  const colors = EXERCISE_COLORS[colorIndex % EXERCISE_COLORS.length];
  const completedSets = entry.sets.filter((s) => s.completed).length;
  const totalSets = entry.sets.length;
  const progressPercent = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  const allDone = completedSets === totalSets && totalSets > 0;
  const e1rm = bestE1RMFromSets(entry.sets);

  const [activeTimer, setActiveTimer] = useState<number | null>(null);

  const handleToggleComplete = (si: number) => {
    const wasCompleted = entry.sets[si].completed;
    onToggleComplete(si);
    if (!wasCompleted) {
      setActiveTimer(si);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <div
        className={cn(
          "rounded-2xl border border-l-4 overflow-hidden transition-all bg-card",
          allDone ? "border-green-500/30 border-l-green-500" : colors.border
        )}
      >
        {/* Header */}
        <CollapsibleTrigger asChild>
          <button
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-accent/30"
          >
            {/* Emoji in dark circle */}
            <div className="h-10 w-10 rounded-xl bg-muted/60 flex items-center justify-center shrink-0">
              <span className="text-xl">{emoji}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate">{entry.exerciseName}</h3>
                {allDone && (
                  <span className="text-[10px] font-bold text-green-500">✓ Done</span>
                )}
              </div>
              {/* Muscle tags */}
              {exerciseDef.muscles.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {exerciseDef.muscles.map((muscle) => (
                    <span
                      key={muscle}
                      className={cn(
                        "text-[9px] font-semibold px-2 py-0.5 rounded-full",
                        MUSCLE_COLORS[muscle] ?? "bg-muted text-muted-foreground"
                      )}
                    >
                      {muscle}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-0.5 shrink-0">
              {previousSets && previousSets.some((s) => s.weight != null) && (
                <div className="text-right">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground">
                    Previous
                  </span>
                  {previousSets
                    .filter((s) => s.weight != null && s.reps != null)
                    .map((s, i) => (
                      <p key={i} className="text-[10px] font-medium text-muted-foreground leading-tight">
                        {s.weight} x {s.reps}
                      </p>
                    ))}
                </div>
              )}
              <div className="flex items-center gap-2">
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
            </div>
          </button>
        </CollapsibleTrigger>

        {/* Expanded content */}
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-3">
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
            {entry.sets.map((set, si) => {
              const prevSet = previousSets?.[si];
              const vol = computeSetVolume(set.weight, set.reps);

              return (
                <Fragment key={si}>
                  <div
                    className={cn(
                      "grid grid-cols-[32px_1fr_1fr_36px] gap-2 items-center rounded-lg py-1 transition-all duration-200",
                      set.completed && "bg-muted/30"
                    )}
                  >
                    <span className="text-sm font-medium text-center text-muted-foreground">
                      {si + 1}
                    </span>
                    <div>
                      <Stepper
                        value={set.weight}
                        increment={exerciseDef.weightIncrement}
                        onChange={(v) => onUpdateSet(si, "weight", v)}
                        unit="lbs"
                      />
                      {prevSet && (
                        <div className="text-center mt-0.5">
                          <Delta current={set.weight} previous={prevSet.weight} unit="lb" />
                        </div>
                      )}
                    </div>
                    <div>
                      <Stepper
                        value={set.reps}
                        increment={1}
                        onChange={(v) => onUpdateSet(si, "reps", v)}
                      />
                      {prevSet && (
                        <div className="text-center mt-0.5">
                          <Delta current={set.reps} previous={prevSet.reps} />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleComplete(si)}
                      className={cn(
                        "mx-auto flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-200",
                        set.completed
                          ? cn("text-white scale-100", colors.check)
                          : "border-muted-foreground/30 text-muted-foreground/30 hover:border-muted-foreground/60 scale-95"
                      )}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Per-set volume */}
                  {set.completed && vol > 0 && (
                    <div className="text-[10px] text-muted-foreground text-right pr-1 -mt-2">
                      Vol: {vol.toLocaleString()} lbs
                    </div>
                  )}

                  {/* Rest timer */}
                  {activeTimer === si && set.completed && (
                    <RestTimer
                      durationSeconds={90}
                      onComplete={() => setActiveTimer(null)}
                      onSkip={() => setActiveTimer(null)}
                    />
                  )}
                </Fragment>
              );
            })}

            {/* Live 1RM card for primary exercise */}
            {isPrimary && e1rm > 0 && (
              <Live1RMCard currentE1RM={e1rm} targetE1RM={targetE1RM ?? null} />
            )}

            {/* Add Set + E1RM */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={onAddSet}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                Add Set
              </button>
              {e1rm > 0 && !isPrimary && (
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
