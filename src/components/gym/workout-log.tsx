"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getTodayWorkout, type Exercise } from "./workout-data";
import { Button } from "@/components/ui/button";
import {
  useGymStorage,
  toDateStr,
  type ExerciseLogEntry,
  type SetEntry,
} from "@/hooks/use-gym-storage";
import {
  compute1RMHistory,
  suggestNextWeight,
  EXERCISE_EMOJI,
} from "./gym-utils";
import { LogHeader } from "./log-header";
import { GoalHeroCard } from "./goal-hero-card";
import { E1RMTrendChart } from "./e1rm-trend-chart";
import { SmartSuggestion } from "./smart-suggestion";
import { ExerciseCard } from "./exercise-card";

export function WorkoutLog() {
  const router = useRouter();
  const workout = getTodayWorkout();
  const todayStr = toDateStr(new Date());
  const dayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const {
    getLog,
    getPreviousLog,
    saveLog,
    markAttended,
    stats,
    goals,
    setGoal,
    getAllLogsForExercise,
  } = useGymStorage();

  const [entries, setEntries] = useState<ExerciseLogEntry[]>([]);
  const [openCards, setOpenCards] = useState<Set<number>>(new Set([0]));
  const autoSaveRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const previousLog = useMemo(
    () => getPreviousLog(todayStr),
    [getPreviousLog, todayStr]
  );

  const previousByExercise = useMemo(() => {
    const map = new Map<string, SetEntry[]>();
    if (previousLog) {
      for (const entry of previousLog) {
        map.set(entry.exerciseName, entry.sets);
      }
    }
    return map;
  }, [previousLog]);

  // Redirect on rest day
  useEffect(() => {
    if (workout.type === "rest") {
      router.replace("/gym");
    }
  }, [workout.type, router]);

  // Pre-fill from today's saved log, or from previous session, or empty
  useEffect(() => {
    const saved = getLog(todayStr);
    if (saved && saved.length > 0) {
      setEntries(saved);
    } else {
      setEntries(
        workout.exercises.map((ex) => {
          const prevSets = previousByExercise.get(ex.name);
          return {
            exerciseName: ex.name,
            sets: Array.from({ length: ex.sets }, (_, i) => ({
              weight: prevSets?.[i]?.weight ?? null,
              reps: prevSets?.[i]?.reps ?? null,
              completed: false,
            })),
          };
        })
      );
    }
  }, [todayStr, getLog, workout.exercises, previousByExercise]);

  // Primary exercise data (first exercise)
  const primaryExercise = workout.exercises[0];
  const primaryLogs = useMemo(
    () => (primaryExercise ? getAllLogsForExercise(primaryExercise.name) : []),
    [getAllLogsForExercise, primaryExercise]
  );
  const primaryHistory = useMemo(
    () => compute1RMHistory(primaryLogs),
    [primaryLogs]
  );
  const currentBestE1RM =
    primaryHistory.length > 0
      ? primaryHistory[primaryHistory.length - 1].e1rm
      : 0;
  const primaryGoal = primaryExercise
    ? goals[primaryExercise.name]?.target1RM ?? null
    : null;
  const primaryPrevSets = primaryExercise
    ? previousByExercise.get(primaryExercise.name)
    : undefined;
  const suggestion = useMemo(
    () =>
      primaryExercise && primaryPrevSets
        ? suggestNextWeight(
            primaryPrevSets,
            primaryExercise.weightIncrement,
            primaryExercise.reps
          )
        : null,
    [primaryExercise, primaryPrevSets]
  );

  // Exercise lookup
  const exerciseByName = useMemo(() => {
    const map = new Map<string, Exercise>();
    for (const ex of workout.exercises) {
      map.set(ex.name, ex);
    }
    return map;
  }, [workout.exercises]);

  if (workout.type === "rest") return null;

  // Auto-save debounced
  const debouncedSave = useCallback(
    (nextEntries: ExerciseLogEntry[]) => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
      autoSaveRef.current = setTimeout(() => {
        if (nextEntries.length > 0) {
          saveLog(todayStr, nextEntries);
        }
      }, 500);
    },
    [saveLog, todayStr]
  );

  function updateSetField(
    exerciseIndex: number,
    setIndex: number,
    field: "weight" | "reps",
    value: number | null
  ) {
    setEntries((prev) => {
      const next = [...prev];
      const exercise = { ...next[exerciseIndex] };
      const sets = [...exercise.sets];
      sets[setIndex] = { ...sets[setIndex], [field]: value };
      exercise.sets = sets;
      next[exerciseIndex] = exercise;
      debouncedSave(next);
      return next;
    });
  }

  function toggleSetCompleted(exerciseIndex: number, setIndex: number) {
    setEntries((prev) => {
      const next = [...prev];
      const exercise = { ...next[exerciseIndex] };
      const sets = [...exercise.sets];
      sets[setIndex] = {
        ...sets[setIndex],
        completed: !sets[setIndex].completed,
      };
      exercise.sets = sets;
      next[exerciseIndex] = exercise;

      // Auto-expand next card if all sets in current exercise are done
      const allDone = sets.every((s) => s.completed);
      if (allDone && exerciseIndex < next.length - 1) {
        setOpenCards((prev) => {
          const updated = new Set(prev);
          updated.add(exerciseIndex + 1);
          return updated;
        });
      }

      debouncedSave(next);
      return next;
    });
  }

  function addSet(exerciseIndex: number) {
    setEntries((prev) => {
      const next = [...prev];
      const exercise = { ...next[exerciseIndex] };
      const sets = [...exercise.sets];
      const lastSet = sets[sets.length - 1];
      sets.push({
        weight: lastSet?.weight ?? null,
        reps: lastSet?.reps ?? null,
        completed: false,
      });
      exercise.sets = sets;
      next[exerciseIndex] = exercise;
      debouncedSave(next);
      return next;
    });
  }

  function handleFinish() {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    saveLog(todayStr, entries);
    markAttended(todayStr);
    router.push("/gym");
  }

  const completedSets = entries.reduce(
    (acc, e) => acc + e.sets.filter((s) => s.completed).length,
    0
  );
  const totalSets = entries.reduce((acc, e) => acc + e.sets.length, 0);
  const allComplete = completedSets === totalSets && totalSets > 0;

  return (
    <div className="mx-auto max-w-2xl space-y-4 pb-8">
      {/* Header */}
      <LogHeader
        dayName={dayName}
        dateStr={todayStr}
        splitLabel={workout.label}
        splitEmoji={workout.emoji}
        streak={stats.currentStreak}
        completedSets={completedSets}
        totalSets={totalSets}
        onBack={() => router.push("/gym")}
      />

      {/* Goal Hero Card */}
      {primaryExercise && (
        <GoalHeroCard
          exerciseName={primaryExercise.name}
          emoji={EXERCISE_EMOJI[primaryExercise.name] ?? "💪"}
          currentE1RM={currentBestE1RM}
          targetE1RM={primaryGoal}
          onSetGoal={(target) => setGoal(primaryExercise.name, target)}
        />
      )}

      {/* 1RM Trend Chart */}
      {primaryExercise && (
        <E1RMTrendChart history={primaryHistory} goalE1RM={primaryGoal} />
      )}

      {/* Smart Suggestion */}
      {primaryExercise && (
        <SmartSuggestion
          exerciseName={primaryExercise.name}
          suggestion={suggestion}
          hasHistory={!!primaryPrevSets}
        />
      )}

      {/* Exercise Accordion Cards */}
      <div className="space-y-3">
        {entries.map((entry, ei) => {
          const exerciseDef = exerciseByName.get(entry.exerciseName);
          if (!exerciseDef) return null;

          return (
            <ExerciseCard
              key={entry.exerciseName}
              entry={entry}
              exerciseDef={exerciseDef}
              colorIndex={ei}
              previousSets={previousByExercise.get(entry.exerciseName)}
              isOpen={openCards.has(ei)}
              onOpenChange={(open) => {
                setOpenCards((prev) => {
                  const next = new Set(prev);
                  if (open) next.add(ei);
                  else next.delete(ei);
                  return next;
                });
              }}
              onUpdateSet={(si, field, value) =>
                updateSetField(ei, si, field, value)
              }
              onToggleComplete={(si) => toggleSetCompleted(ei, si)}
              onAddSet={() => addSet(ei)}
            />
          );
        })}
      </div>

      {/* Finish Workout Button */}
      <Button
        onClick={handleFinish}
        className={
          "w-full h-14 rounded-2xl text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/20 transition-all" +
          (allComplete ? " animate-pulse" : "")
        }
        size="lg"
      >
        Finish Workout 💪
      </Button>
    </div>
  );
}
