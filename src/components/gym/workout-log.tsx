"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getWorkoutForDate,
  getSplitDayInfo,
  getMuscleGroupSummary,
  type Exercise,
} from "./workout-data";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  useGymStorage,
  toDateStr,
  type ExerciseLogEntry,
  type SetEntry,
} from "@/hooks/use-gym-storage";
import {
  compute1RMHistory,
  computeVolumeHistory,
  suggestNextWeight,
  EXERCISE_EMOJI,
} from "./gym-utils";
import { LogHeader } from "./log-header";
import { GoalHeroCard } from "./goal-hero-card";
import { E1RMTrendChart } from "./e1rm-trend-chart";
import { SmartSuggestion } from "./smart-suggestion";
import { ExerciseCard } from "./exercise-card";
import { RoadmapBoard } from "./roadmap-board";
import { SessionInsights } from "./session-insights";
import { WeeklyProgress } from "./weekly-progress";
import { E1RMCalculator } from "./e1rm-calculator";
import { SessionNotes } from "./session-notes";

interface WorkoutLogProps {
  date?: string; // YYYY-MM-DD, defaults to today
}

export function WorkoutLog({ date }: WorkoutLogProps) {
  const router = useRouter();
  const targetDate = date ? new Date(date + "T00:00:00") : new Date();
  const dateStr = toDateStr(targetDate);
  const workout = getWorkoutForDate(targetDate);
  const dayName = targetDate.toLocaleDateString("en-US", { weekday: "long" });
  const splitInfo = getSplitDayInfo(targetDate);
  const muscleGroupSummary = getMuscleGroupSummary(workout.type);
  const {
    getLog,
    getPreviousLog,
    saveLog,
    markAttended,
    stats,
    goals,
    logs,
    setGoal,
    getAllLogsForExercise,
    getNote,
    saveNote,
  } = useGymStorage();

  const [entries, setEntries] = useState<ExerciseLogEntry[]>([]);
  const [openCards, setOpenCards] = useState<Set<number>>(new Set([0]));
  const [sessionNote, setSessionNote] = useState("");
  const [workoutOpen, setWorkoutOpen] = useState(true);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const noteSaveRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const previousLog = useMemo(
    () => getPreviousLog(dateStr),
    [getPreviousLog, dateStr]
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

  // Pre-fill from today's saved log, or from previous session, or empty
  useEffect(() => {
    const saved = getLog(dateStr);
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
    // Load notes
    setSessionNote(getNote(dateStr));
  }, [dateStr, getLog, getNote, workout.exercises, previousByExercise]);

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

  // Volume history for weekly progress
  const volumeHistory = useMemo(() => computeVolumeHistory(logs), [logs]);

  // Exercise lookup
  const exerciseByName = useMemo(() => {
    const map = new Map<string, Exercise>();
    for (const ex of workout.exercises) {
      map.set(ex.name, ex);
    }
    return map;
  }, [workout.exercises]);

  // Auto-save debounced
  const debouncedSave = useCallback(
    (nextEntries: ExerciseLogEntry[]) => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
      autoSaveRef.current = setTimeout(() => {
        if (nextEntries.length > 0) {
          saveLog(dateStr, nextEntries);
        }
      }, 500);
    },
    [saveLog, dateStr]
  );

  function handleNoteChange(text: string) {
    setSessionNote(text);
    if (noteSaveRef.current) clearTimeout(noteSaveRef.current);
    noteSaveRef.current = setTimeout(() => {
      saveNote(dateStr, text);
    }, 500);
  }

  if (workout.type === "rest") {
    return (
      <div className="mx-auto max-w-2xl space-y-4 pb-8">
        <LogHeader
          dayName={dayName}
          dateStr={dateStr}
          splitLabel="Rest Day"
          splitEmoji="😴"
          streak={stats.currentStreak}
          completedSets={0}
          totalSets={0}
          onBack={() => router.push("/gym")}
        />
        <div className="rounded-2xl border bg-card p-8 text-center space-y-2">
          <p className="text-4xl">😴</p>
          <p className="text-lg font-semibold">Rest Day</p>
          <p className="text-sm text-muted-foreground">
            No workout scheduled. Recovery is part of the process.
          </p>
        </div>

        {/* Still show weekly progress and calculator on rest days */}
        <WeeklyProgress
          e1rmHistory={primaryHistory}
          volumeHistory={volumeHistory}
        />
        <E1RMCalculator />
        <SessionNotes value={sessionNote} onChange={handleNoteChange} />
      </div>
    );
  }

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
    if (noteSaveRef.current) clearTimeout(noteSaveRef.current);
    saveLog(dateStr, entries);
    if (sessionNote) saveNote(dateStr, sessionNote);
    markAttended(dateStr);
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
        dateStr={dateStr}
        splitLabel={workout.label}
        splitEmoji={workout.emoji}
        streak={stats.currentStreak}
        completedSets={completedSets}
        totalSets={totalSets}
        onBack={() => router.push("/gym")}
        splitDayNumber={splitInfo?.dayNumber}
        splitTotalDays={splitInfo?.totalDays}
        muscleGroupSummary={muscleGroupSummary}
      />

      {/* Goal Hero Card (with embedded collapsible Roadmap) */}
      {primaryExercise && (
        <GoalHeroCard
          exerciseName={primaryExercise.name}
          emoji={EXERCISE_EMOJI[primaryExercise.name] ?? "💪"}
          currentE1RM={currentBestE1RM}
          targetE1RM={primaryGoal}
          onSetGoal={(target) => setGoal(primaryExercise.name, target)}
        >
          {primaryGoal && currentBestE1RM > 0 && (
            <RoadmapBoard
              currentE1RM={currentBestE1RM}
              targetE1RM={primaryGoal}
            />
          )}
        </GoalHeroCard>
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

      {/* 1RM Calculator (above exercises per reference) */}
      <E1RMCalculator />

      {/* Today's Workout wrapper card */}
      <Collapsible open={workoutOpen} onOpenChange={setWorkoutOpen}>
        <div className="rounded-2xl border bg-card overflow-hidden">
          {/* Wrapper header */}
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between px-4 py-3.5 border-b hover:bg-accent/30 transition-colors">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">🏋️</span>
                <h3 className="font-semibold text-sm">Today&apos;s Workout</h3>
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full",
                    allComplete
                      ? "bg-green-500/15 text-green-400"
                      : "bg-purple-500/15 text-purple-400"
                  )}
                >
                  {completedSets}/{totalSets} sets
                </span>
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                  workoutOpen && "rotate-180"
                )}
              />
            </button>
          </CollapsibleTrigger>

          {/* Motivational text + current 1RM */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30">
            <div className="flex items-center gap-2">
              {/* Mini progress ring */}
              <div className="relative h-10 w-10 shrink-0">
                <svg viewBox="0 0 36 36" className="h-10 w-10 -rotate-90">
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-muted/30"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke={allComplete ? "#22c55e" : "#8b5cf6"}
                    strokeWidth="3"
                    strokeDasharray={`${(completedSets / Math.max(totalSets, 1)) * 94.25} 94.25`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <span className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                  <span className="text-sm font-bold">{completedSets}</span>
                  <span className="text-[7px] text-muted-foreground">/{totalSets}</span>
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {allComplete
                  ? "All sets crushed! Great work! 🎉"
                  : completedSets === 0
                    ? "Ready to crush it 💪"
                    : `${completedSets} down, ${totalSets - completedSets} to go 🔥`}
              </p>
            </div>
            {currentBestE1RM > 0 && (
              <div className="text-right">
                <p className="text-lg font-bold italic">{currentBestE1RM} lbs</p>
                <p className="text-[10px] text-muted-foreground">
                  EST 1RM{primaryGoal ? ` · ${Math.round((currentBestE1RM / primaryGoal) * 100)}% of ${primaryGoal}` : ""}
                </p>
              </div>
            )}
          </div>

          {/* Exercise cards */}
          <CollapsibleContent>
            <div className="p-3 space-y-3">
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
                    isPrimary={ei === 0}
                    targetE1RM={ei === 0 ? primaryGoal : undefined}
                  />
                );
              })}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Weekly Progress */}
      <WeeklyProgress
        e1rmHistory={primaryHistory}
        volumeHistory={volumeHistory}
      />

      {/* Session Insights */}
      {primaryExercise && (
        <SessionInsights
          entries={entries}
          previousEntries={previousLog}
          primaryExerciseName={primaryExercise.name}
          completedSets={completedSets}
          totalSets={totalSets}
        />
      )}

      {/* Session Notes */}
      <SessionNotes value={sessionNote} onChange={handleNoteChange} />

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
