// Apple Watch 45mm dimensions rendered at 2x for desktop legibility
export const WATCH = {
  width: 396,
  height: 484,
  screenRadius: 40,
  caseRadius: 48,
  caseColor: "#2a2a2a",
  screenBg: "#000000",
  crownWidth: 6,
  crownHeight: 18,
  buttonWidth: 6,
  buttonHeight: 10,
} as const;

// Accent colors from EXERCISE_ACCENT_COLORS in gymquest-workout-log.tsx
export const ACCENT_COLORS = [
  "#6366f1", // indigo — Squats
  "#f59e0b", // amber — Bench Press
  "#22c55e", // green — Barbell Rows
  "#ec4899", // pink — Overhead Press
  "#06b6d4", // cyan — Romanian Deadlift
  "#f97316", // orange — Lat Pulldown
  "#6366f1", // indigo — Lateral Raises (wraps)
  "#f59e0b", // amber — Barbell Curls (wraps)
] as const;

// watchOS system colors
export const WOS = {
  green: "#30d158",
  red: "#ff453a",
  orange: "#ff9f0a",
  blue: "#0a84ff",
  gray: "#8e8e93",
  grayDark: "#1c1c1e",
  grayMid: "#2c2c2e",
  label: "#ffffff",
  secondaryLabel: "#ebebf599",
  tertiaryLabel: "#ebebf54d",
} as const;

// Sample data for mockup screens
export const SAMPLE_EXERCISES = [
  { name: "Squats", sets: 2, reps: "6-8", weight: 135, prevWeight: 130, prevReps: 8, done: true },
  { name: "Bench Press", sets: 2, reps: "6-8", weight: 155, prevWeight: 150, prevReps: 7, done: true },
  { name: "Barbell Rows", sets: 2, reps: "6-8", weight: 115, prevWeight: 110, prevReps: 8, done: true },
  { name: "Overhead Press", sets: 2, reps: "8-10", weight: 85, prevWeight: 80, prevReps: 9, done: false },
  { name: "Romanian Deadlift", sets: 2, reps: "8-10", weight: 115, prevWeight: 110, prevReps: 8, done: false },
  { name: "Lat Pulldown", sets: 2, reps: "8-12", weight: 100, prevWeight: 95, prevReps: 10, done: false },
  { name: "Lateral Raises", sets: 2, reps: "12-15", weight: 20, prevWeight: 15, prevReps: 14, done: false },
  { name: "Barbell Curls", sets: 2, reps: "10-12", weight: 55, prevWeight: 50, prevReps: 11, done: false },
] as const;

export const SAMPLE_STREAK = 12;
export const SAMPLE_VOLUME = 14280;
export const SAMPLE_DURATION = "47:23";
