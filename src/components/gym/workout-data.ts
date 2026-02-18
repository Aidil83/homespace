export type WorkoutType = "push" | "pull" | "legs" | "rest";

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
  0: "pull", // Sunday
  1: "legs", // Monday
  2: "rest", // Tuesday
  3: "push", // Wednesday
  4: "pull", // Thursday
  5: "legs", // Friday
  6: "push", // Saturday
};

const WORKOUTS: Record<WorkoutType, WorkoutDay> = {
  push: {
    type: "push",
    label: "Push Day",
    emoji: "✊",
    exercises: [
      { name: "Bench Press", sets: 2, reps: "6-8", weightIncrement: 5, defaultWeight: 135, defaultReps: 8, muscles: ["Chest", "Front Delts", "Triceps"] },
      { name: "Overhead Press", sets: 2, reps: "8-10", weightIncrement: 5, defaultWeight: 65, defaultReps: 8, muscles: ["Shoulders", "Triceps"] },
      { name: "Lateral Raises", sets: 2, reps: "12-15", weightIncrement: 5, defaultWeight: 15, defaultReps: 12, muscles: ["Side Delts"] },
      { name: "Tricep Pushdowns", sets: 2, reps: "10-12", weightIncrement: 5, defaultWeight: 40, defaultReps: 10, muscles: ["Triceps"] },
    ],
  },
  pull: {
    type: "pull",
    label: "Pull Day",
    emoji: "💪",
    exercises: [
      { name: "Deadlift", sets: 2, reps: "5-6", weightIncrement: 5, defaultWeight: 225, defaultReps: 5, muscles: ["Back", "Hamstrings", "Glutes"] },
      { name: "Barbell Rows", sets: 2, reps: "6-8", weightIncrement: 5, defaultWeight: 95, defaultReps: 8, muscles: ["Back", "Lats", "Biceps"] },
      { name: "Lat Pulldown", sets: 2, reps: "8-12", weightIncrement: 5, defaultWeight: 80, defaultReps: 10, muscles: ["Lats", "Biceps"] },
      { name: "Face Pulls", sets: 2, reps: "12-15", weightIncrement: 5, defaultWeight: 30, defaultReps: 12, muscles: ["Rear Delts", "Traps"] },
      { name: "Barbell Curls", sets: 2, reps: "10-12", weightIncrement: 5, defaultWeight: 45, defaultReps: 10, muscles: ["Biceps", "Forearms"] },
      { name: "Hammer Curls", sets: 2, reps: "10-12", weightIncrement: 5, defaultWeight: 25, defaultReps: 10, muscles: ["Biceps", "Forearms"] },
    ],
  },
  legs: {
    type: "legs",
    label: "Leg Day",
    emoji: "🏋️",
    exercises: [
      { name: "Squats", sets: 2, reps: "6-8", weightIncrement: 5, defaultWeight: 95, defaultReps: 5, muscles: ["Quads", "Glutes"] },
      { name: "Romanian Deadlift", sets: 2, reps: "8-10", weightIncrement: 5, defaultWeight: 95, defaultReps: 8, muscles: ["Hamstrings", "Glutes", "Back"] },
      { name: "Leg Press", sets: 2, reps: "10-12", weightIncrement: 5, defaultWeight: 135, defaultReps: 10, muscles: ["Quads", "Glutes"] },
      { name: "Leg Curls", sets: 2, reps: "10-12", weightIncrement: 5, defaultWeight: 60, defaultReps: 10, muscles: ["Hamstrings"] },
      { name: "Leg Extensions", sets: 2, reps: "10-12", weightIncrement: 5, defaultWeight: 60, defaultReps: 10, muscles: ["Quads"] },
      { name: "Calf Raises", sets: 2, reps: "12-15", weightIncrement: 5, defaultWeight: 80, defaultReps: 12, muscles: ["Calves"] },
    ],
  },
  rest: {
    type: "rest",
    label: "Rest Day",
    emoji: "😴",
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

// Non-rest day indices in the weekly schedule (for SPLIT Day X/6 badge)
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
  push: "Chest & Triceps",
  pull: "Back & Biceps",
  legs: "Quads & Hamstrings",
  rest: "",
};

export function getMuscleGroupSummary(type: WorkoutType): string {
  return MUSCLE_SUMMARIES[type];
}
