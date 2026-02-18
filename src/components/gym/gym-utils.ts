import type { SetEntry, ExerciseLogEntry } from "@/hooks/use-gym-storage";

/** Epley formula: weight × (1 + reps/30) */
export function computeE1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

/** Best estimated 1RM from a set of sets */
export function bestE1RMFromSets(sets: SetEntry[]): number {
  let best = 0;
  for (const s of sets) {
    if (s.weight != null && s.reps != null && s.completed) {
      const e1rm = computeE1RM(s.weight, s.reps);
      if (e1rm > best) best = e1rm;
    }
  }
  return best;
}

/** Compute 1RM history for charting */
export function compute1RMHistory(
  allLogs: { date: string; sets: SetEntry[] }[]
): { date: string; e1rm: number }[] {
  return allLogs
    .map(({ date, sets }) => ({ date, e1rm: bestE1RMFromSets(sets) }))
    .filter((d) => d.e1rm > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Suggest progressive overload based on previous session */
export function suggestNextWeight(
  prevSets: SetEntry[],
  increment: number,
  targetReps: string
): { weight: number; reps: number } | null {
  let bestSet: SetEntry | null = null;
  for (const s of prevSets) {
    if (s.completed && s.weight != null && s.reps != null) {
      if (!bestSet || s.weight > (bestSet.weight ?? 0)) {
        bestSet = s;
      }
    }
  }
  if (!bestSet || bestSet.weight == null || bestSet.reps == null) return null;

  const match = targetReps.match(/(\d+)-(\d+)/);
  const maxReps = match ? parseInt(match[2]) : bestSet.reps;
  const minReps = match ? parseInt(match[1]) : bestSet.reps;

  if (bestSet.reps >= maxReps) {
    return { weight: bestSet.weight + increment, reps: minReps };
  }
  return { weight: bestSet.weight, reps: bestSet.reps + 1 };
}

/** Exercise emoji mapping */
export const EXERCISE_EMOJI: Record<string, string> = {
  "Bench Press": "🏋️",
  "Overhead Press": "🙆",
  "Lateral Raises": "🦅",
  "Tricep Pushdowns": "💪",
  "Deadlift": "🔥",
  "Barbell Rows": "🚣",
  "Lat Pulldown": "⬇️",
  "Face Pulls": "🎯",
  "Barbell Curls": "💪",
  "Hammer Curls": "🔨",
  "Squats": "🏋️",
  "Romanian Deadlift": "🦵",
  "Leg Press": "🦿",
  "Leg Curls": "🦵",
  "Leg Extensions": "🦿",
  "Calf Raises": "🫳",
};

/** Color palette for exercise cards */
export const EXERCISE_COLORS = [
  { accent: "bg-purple-500", text: "text-purple-400", border: "border-l-purple-500", check: "border-purple-500 bg-purple-500" },
  { accent: "bg-orange-500", text: "text-orange-400", border: "border-l-orange-500", check: "border-orange-500 bg-orange-500" },
  { accent: "bg-emerald-500", text: "text-emerald-400", border: "border-l-emerald-500", check: "border-emerald-500 bg-emerald-500" },
  { accent: "bg-blue-500", text: "text-blue-400", border: "border-l-blue-500", check: "border-blue-500 bg-blue-500" },
  { accent: "bg-pink-500", text: "text-pink-400", border: "border-l-pink-500", check: "border-pink-500 bg-pink-500" },
  { accent: "bg-cyan-500", text: "text-cyan-400", border: "border-l-cyan-500", check: "border-cyan-500 bg-cyan-500" },
] as const;

/** Muscle group color mapping for tags — purple-tinted to match GymQuest */
export const MUSCLE_COLORS: Record<string, string> = {
  Chest: "bg-purple-500/20 text-purple-300",
  "Front Delts": "bg-purple-500/20 text-purple-300",
  Triceps: "bg-purple-500/20 text-purple-300",
  Shoulders: "bg-purple-500/20 text-purple-300",
  "Side Delts": "bg-purple-500/20 text-purple-300",
  Back: "bg-purple-500/20 text-purple-300",
  Lats: "bg-purple-500/20 text-purple-300",
  "Rear Delts": "bg-purple-500/20 text-purple-300",
  Biceps: "bg-purple-500/20 text-purple-300",
  Forearms: "bg-purple-500/20 text-purple-300",
  Quads: "bg-purple-500/20 text-purple-300",
  Hamstrings: "bg-purple-500/20 text-purple-300",
  Glutes: "bg-purple-500/20 text-purple-300",
  Calves: "bg-purple-500/20 text-purple-300",
  Traps: "bg-purple-500/20 text-purple-300",
};

/** Volume of a single set */
export function computeSetVolume(weight: number | null, reps: number | null): number {
  if (weight == null || reps == null) return 0;
  return weight * reps;
}

/** Total volume for completed sets in one exercise */
export function computeExerciseVolume(sets: SetEntry[]): number {
  return sets
    .filter((s) => s.completed)
    .reduce((sum, s) => sum + computeSetVolume(s.weight, s.reps), 0);
}

/** Total volume for an entire session (all exercises) */
export function computeSessionVolume(entries: ExerciseLogEntry[]): number {
  return entries.reduce((acc, e) => acc + computeExerciseVolume(e.sets), 0);
}

/** Volume history across all logged sessions */
export function computeVolumeHistory(
  logs: Record<string, ExerciseLogEntry[]>
): { date: string; volume: number }[] {
  return Object.entries(logs)
    .map(([date, entries]) => ({ date, volume: computeSessionVolume(entries) }))
    .filter((d) => d.volume > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
}
