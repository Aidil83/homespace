export type WorkoutType = "push" | "pull" | "legs" | "rest";

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
}

export interface WorkoutDay {
  type: WorkoutType;
  label: string;
  emoji: string;
  exercises: Exercise[];
}

// Fixed weekly schedule
// JS: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
const WEEKLY_SCHEDULE: Record<number, WorkoutType> = {
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
    emoji: "🏋️",
    exercises: [
      { name: "Bench Press", sets: 4, reps: "6-8" },
      { name: "Overhead Press", sets: 3, reps: "8-10" },
      { name: "Incline Dumbbell Press", sets: 3, reps: "8-12" },
      { name: "Lateral Raises", sets: 3, reps: "12-15" },
      { name: "Tricep Pushdowns", sets: 3, reps: "10-12" },
      { name: "Overhead Tricep Extension", sets: 3, reps: "10-12" },
    ],
  },
  pull: {
    type: "pull",
    label: "Pull Day",
    emoji: "💪",
    exercises: [
      { name: "Deadlift", sets: 4, reps: "5-6" },
      { name: "Barbell Rows", sets: 4, reps: "6-8" },
      { name: "Lat Pulldown", sets: 3, reps: "8-12" },
      { name: "Face Pulls", sets: 3, reps: "12-15" },
      { name: "Barbell Curls", sets: 3, reps: "10-12" },
      { name: "Hammer Curls", sets: 3, reps: "10-12" },
    ],
  },
  legs: {
    type: "legs",
    label: "Leg Day",
    emoji: "🦵",
    exercises: [
      { name: "Squats", sets: 4, reps: "6-8" },
      { name: "Romanian Deadlift", sets: 3, reps: "8-10" },
      { name: "Leg Press", sets: 3, reps: "10-12" },
      { name: "Leg Curls", sets: 3, reps: "10-12" },
      { name: "Leg Extensions", sets: 3, reps: "10-12" },
      { name: "Calf Raises", sets: 4, reps: "12-15" },
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
