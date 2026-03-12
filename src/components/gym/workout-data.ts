export type WorkoutType = "fullbody" | "rest";

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  weightIncrement: number;
  defaultWeight: number;
  defaultReps: number;
  muscles: string[];
}

export interface WorkoutDay {
  type: WorkoutType;
  label: string;
  emoji: string;
  exercises: Exercise[];
}

// Fixed weekly schedule
// JS: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
export const WEEKLY_SCHEDULE: Record<number, WorkoutType> = {
  0: "rest",      // Sunday
  1: "fullbody",  // Monday
  2: "rest",      // Tuesday
  3: "rest",      // Wednesday
  4: "fullbody",  // Thursday
  5: "rest",      // Friday
  6: "fullbody",  // Saturday
};

const WORKOUTS: Record<WorkoutType, WorkoutDay> = {
  fullbody: {
    type: "fullbody",
    label: "Full Body",
    emoji: "💪",
    exercises: [
      { name: "Squats", sets: 2, reps: "6-8", weightIncrement: 5, defaultWeight: 95, defaultReps: 5, muscles: ["Quads", "Glutes"] },
      { name: "Bench Press", sets: 2, reps: "6-8", weightIncrement: 5, defaultWeight: 135, defaultReps: 8, muscles: ["Chest", "Front Delts", "Triceps"] },
      { name: "Barbell Rows", sets: 2, reps: "6-8", weightIncrement: 5, defaultWeight: 95, defaultReps: 8, muscles: ["Back", "Lats", "Biceps"] },
      { name: "Overhead Press", sets: 2, reps: "8-10", weightIncrement: 5, defaultWeight: 65, defaultReps: 8, muscles: ["Shoulders", "Triceps"] },
      { name: "Romanian Deadlift", sets: 2, reps: "8-10", weightIncrement: 5, defaultWeight: 95, defaultReps: 8, muscles: ["Hamstrings", "Glutes", "Back"] },
      { name: "Lat Pulldown", sets: 2, reps: "8-12", weightIncrement: 5, defaultWeight: 80, defaultReps: 10, muscles: ["Lats", "Biceps"] },
      { name: "Lateral Raises", sets: 2, reps: "12-15", weightIncrement: 5, defaultWeight: 15, defaultReps: 12, muscles: ["Side Delts"] },
      { name: "Barbell Curls", sets: 2, reps: "10-12", weightIncrement: 5, defaultWeight: 45, defaultReps: 10, muscles: ["Biceps", "Forearms"] },
    ],
  },
  rest: {
    type: "rest",
    label: "Rest Day",
    emoji: "💤",
    exercises: [],
  },
};

export function getTodayWorkout(): WorkoutDay {
  const dayOfWeek = new Date().getDay();
  return WORKOUTS[WEEKLY_SCHEDULE[dayOfWeek]];
}

export function getWorkoutForDate(date: Date): WorkoutDay {
  const dayOfWeek = date.getDay();
  return WORKOUTS[WEEKLY_SCHEDULE[dayOfWeek]];
}

export interface WeekDay {
  dayIndex: number;
  dayName: string;
  shortDay: string;
  type: WorkoutType;
  workout: WorkoutDay;
}

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function getWeekSchedule(): WeekDay[] {
  return Array.from({ length: 7 }, (_, i) => {
    const type = WEEKLY_SCHEDULE[i];
    return {
      dayIndex: i,
      dayName: DAY_NAMES[i],
      shortDay: SHORT_DAYS[i],
      type,
      workout: WORKOUTS[type],
    };
  });
}

// Non-rest day indices in the weekly schedule (for SPLIT Day X/3 badge)
const WORKOUT_DAY_ORDER = Object.entries(WEEKLY_SCHEDULE)
  .filter(([, type]) => type !== "rest")
  .map(([idx]) => Number(idx));

export function getSplitDayInfo(
  date: Date
): { dayNumber: number; totalDays: number } | null {
  const dow = date.getDay();
  const idx = WORKOUT_DAY_ORDER.indexOf(dow);
  if (idx === -1) return null;
  return { dayNumber: idx + 1, totalDays: WORKOUT_DAY_ORDER.length };
}

const MUSCLE_SUMMARIES: Record<WorkoutType, string> = {
  fullbody: "Full Body",
  rest: "",
};

export function getMuscleGroupSummary(type: WorkoutType): string {
  return MUSCLE_SUMMARIES[type];
}
