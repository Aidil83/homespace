"use client";

import { WatchFrame } from "./watch-frame";
import { WatchHomeScreen } from "./watch-home-screen";
import { WatchExerciseList } from "./watch-exercise-list";
import { WatchActiveExercise } from "./watch-active-exercise";
import { WatchRestTimer } from "./watch-rest-timer";
import { WatchWorkoutSummary } from "./watch-workout-summary";
import { WatchComplication } from "./watch-complication";

const screens = [
  { label: "Workout Home", Component: WatchHomeScreen },
  { label: "Exercise List", Component: WatchExerciseList },
  { label: "Active Exercise", Component: WatchActiveExercise },
  { label: "Rest Timer", Component: WatchRestTimer },
  { label: "Workout Summary", Component: WatchWorkoutSummary },
  { label: "Complications", Component: WatchComplication },
] as const;

export function WatchMockupGallery() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0a0a",
        padding: "48px 24px",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#fff",
            margin: 0,
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
          }}
        >
          Apple Watch — GymQuest
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "#71717a",
            marginTop: 8,
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
          }}
        >
          Interactive mockups · 45mm · watchOS
        </p>
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
          gap: 48,
          maxWidth: 1400,
          margin: "0 auto",
          justifyItems: "center",
        }}
      >
        {screens.map(({ label, Component }) => (
          <WatchFrame key={label} label={label}>
            <Component />
          </WatchFrame>
        ))}
      </div>
    </div>
  );
}
