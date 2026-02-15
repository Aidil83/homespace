import type { SetEntry } from "@/hooks/use-gym-storage";

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
  { gradient: "from-blue-500/20 to-blue-600/5", accent: "bg-blue-500", text: "text-blue-400", border: "border-blue-500/30" },
  { gradient: "from-purple-500/20 to-purple-600/5", accent: "bg-purple-500", text: "text-purple-400", border: "border-purple-500/30" },
  { gradient: "from-emerald-500/20 to-emerald-600/5", accent: "bg-emerald-500", text: "text-emerald-400", border: "border-emerald-500/30" },
  { gradient: "from-orange-500/20 to-orange-600/5", accent: "bg-orange-500", text: "text-orange-400", border: "border-orange-500/30" },
  { gradient: "from-pink-500/20 to-pink-600/5", accent: "bg-pink-500", text: "text-pink-400", border: "border-pink-500/30" },
  { gradient: "from-cyan-500/20 to-cyan-600/5", accent: "bg-cyan-500", text: "text-cyan-400", border: "border-cyan-500/30" },
] as const;
