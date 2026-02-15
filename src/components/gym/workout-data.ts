export type WorkoutType = "push" | "pull" | "legs" | "rest";

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  weightIncrement: number; // 10 for barbell, 5 for dumbbell/cable/machine
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
    emoji: "🏋️",
    exercises: [
      { name: "Bench Press", sets: 2, reps: "6-8", weightIncrement: 10 },
      { name: "Overhead Press", sets: 2, reps: "8-10", weightIncrement: 10 },
      { name: "Lateral Raises", sets: 2, reps: "12-15", weightIncrement: 5 },
      { name: "Tricep Pushdowns", sets: 2, reps: "10-12", weightIncrement: 5 },
    ],
  },
  pull: {
    type: "pull",
    label: "Pull Day",
    emoji: "💪",
    exercises: [
      { name: "Deadlift", sets: 2, reps: "5-6", weightIncrement: 10 },
      { name: "Barbell Rows", sets: 2, reps: "6-8", weightIncrement: 10 },
      { name: "Lat Pulldown", sets: 2, reps: "8-12", weightIncrement: 5 },
      { name: "Face Pulls", sets: 2, reps: "12-15", weightIncrement: 5 },
      { name: "Barbell Curls", sets: 2, reps: "10-12", weightIncrement: 10 },
      { name: "Hammer Curls", sets: 2, reps: "10-12", weightIncrement: 5 },
    ],
  },
  legs: {
    type: "legs",
    label: "Leg Day",
    emoji: "🦵",
    exercises: [
      { name: "Squats", sets: 2, reps: "6-8", weightIncrement: 10 },
      { name: "Romanian Deadlift", sets: 2, reps: "8-10", weightIncrement: 10 },
      { name: "Leg Press", sets: 2, reps: "10-12", weightIncrement: 10 },
      { name: "Leg Curls", sets: 2, reps: "10-12", weightIncrement: 5 },
      { name: "Leg Extensions", sets: 2, reps: "10-12", weightIncrement: 5 },
      { name: "Calf Raises", sets: 2, reps: "12-15", weightIncrement: 5 },
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
