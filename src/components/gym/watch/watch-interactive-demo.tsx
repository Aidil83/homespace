"use client";

import { useState } from "react";
import { WatchFrame } from "./watch-frame";
import { WatchHomeScreen } from "./watch-home-screen";
import { WatchExerciseList } from "./watch-exercise-list";
import { WatchActiveExercise } from "./watch-active-exercise";
import { WatchRestTimer } from "./watch-rest-timer";
import { WatchWorkoutSummary } from "./watch-workout-summary";
import { SAMPLE_EXERCISES, WOS } from "./watch-constants";

type InteractiveState =
  | { screen: "home" }
  | { screen: "exerciseList" }
  | { screen: "activeExercise"; exerciseIndex: number; setIndex: number }
  | { screen: "restTimer"; exerciseIndex: number; setIndex: number }
  | { screen: "summary" };

const SCREEN_LABELS: Record<InteractiveState["screen"], string> = {
  home: "Workout Home",
  exerciseList: "Exercise List",
  activeExercise: "Active Exercise",
  restTimer: "Rest Timer",
  summary: "Workout Summary",
};

const FLOW_STEPS = ["Home", "Exercises", "Active", "Rest", "Summary"] as const;

function getFlowIndex(screen: InteractiveState["screen"]): number {
  switch (screen) {
    case "home": return 0;
    case "exerciseList": return 1;
    case "activeExercise": return 2;
    case "restTimer": return 3;
    case "summary": return 4;
  }
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        padding: "6px 10px",
        margin: "10px 0 0 12px",
        backgroundColor: "transparent",
        border: "none",
        color: WOS.green,
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      <svg width="8" height="12" viewBox="0 0 8 12" fill="none" stroke={WOS.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 1 1 6 6 11" />
      </svg>
      Back
    </button>
  );
}

export function WatchInteractiveDemo() {
  const [state, setState] = useState<InteractiveState>({ screen: "home" });
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const flowIndex = getFlowIndex(state.screen);

  function getBackAction(): (() => void) | null {
    switch (state.screen) {
      case "home": return null;
      case "exerciseList": return () => setState({ screen: "home" });
      case "activeExercise": return () => setState({ screen: "exerciseList" });
      case "restTimer": return () => setState({ screen: "activeExercise", exerciseIndex: state.exerciseIndex, setIndex: state.setIndex });
      case "summary": return () => setState({ screen: "home" });
    }
  }

  function renderScreen() {
    switch (state.screen) {
      case "home":
        return (
          <WatchHomeScreen
            onAction={() => {
              setCompletedExercises(new Set());
              setState({ screen: "exerciseList" });
            }}
          />
        );

      case "exerciseList":
        return (
          <WatchExerciseList
            completedSet={completedExercises}
            onAction={(exerciseIndex) =>
              setState({ screen: "activeExercise", exerciseIndex, setIndex: 0 })
            }
            onEndWorkout={() => setState({ screen: "summary" })}
          />
        );

      case "activeExercise": {
        const exercise = SAMPLE_EXERCISES[state.exerciseIndex];
        return (
          <WatchActiveExercise
            exerciseName={exercise.name}
            setIndex={state.setIndex}
            totalSets={exercise.sets}
            prevWeight={exercise.prevWeight}
            prevReps={exercise.prevReps}
            defaultWeight={exercise.weight}
            onAction={() => {
              // Mark exercise complete when finishing the last set
              const exercise = SAMPLE_EXERCISES[state.exerciseIndex];
              if (state.setIndex >= exercise.sets - 1) {
                setCompletedExercises((prev) => new Set([...prev, state.exerciseIndex]));
              }
              setState({
                screen: "restTimer",
                exerciseIndex: state.exerciseIndex,
                setIndex: state.setIndex,
              });
            }}
          />
        );
      }

      case "restTimer": {
        const exercise = SAMPLE_EXERCISES[state.exerciseIndex];
        const isLastSet = state.setIndex >= exercise.sets - 1;
        const isLastExercise = state.exerciseIndex >= SAMPLE_EXERCISES.length - 1;

        // Determine what comes next for the "Next:" label
        let nextLabel: string;
        if (isLastSet && isLastExercise) {
          nextLabel = "Workout Summary";
        } else if (isLastSet) {
          nextLabel = SAMPLE_EXERCISES[state.exerciseIndex + 1].name;
        } else {
          nextLabel = `${exercise.name} Set ${state.setIndex + 2}`;
        }

        return (
          <WatchRestTimer
            nextExercise={nextLabel}
            onAction={() => {
              // Mark exercise as completed when last set is done
              if (isLastSet) {
                setCompletedExercises((prev) => new Set([...prev, state.exerciseIndex]));
              }
              if (isLastSet && isLastExercise) {
                setState({ screen: "summary" });
              } else if (isLastSet) {
                setState({ screen: "activeExercise", exerciseIndex: state.exerciseIndex + 1, setIndex: 0 });
              } else {
                setState({ screen: "activeExercise", exerciseIndex: state.exerciseIndex, setIndex: state.setIndex + 1 });
              }
            }}
          />
        );
      }

      case "summary":
        return (
          <WatchWorkoutSummary
            onAction={() => setState({ screen: "home" })}
          />
        );
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <WatchFrame label={`Interactive Demo — ${SCREEN_LABELS[state.screen]}`}>
        {getBackAction() && <BackButton onClick={getBackAction()!} />}
        {renderScreen()}
      </WatchFrame>

      {/* Flow breadcrumb */}
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {FLOW_STEPS.map((step, i) => (
          <div key={step} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: i === flowIndex ? 700 : 400,
                color: i === flowIndex ? WOS.green : "#71717a",
                transition: "color 0.2s",
              }}
            >
              {step}
            </span>
            {i < FLOW_STEPS.length - 1 && (
              <span style={{ fontSize: 10, color: "#3f3f46" }}>›</span>
            )}
          </div>
        ))}
      </div>

      {/* Restart button */}
      {state.screen !== "home" && (
        <button
          onClick={() => { setCompletedExercises(new Set()); setState({ screen: "home" }); }}
          style={{
            padding: "6px 16px",
            backgroundColor: "#27272a",
            color: "#a1a1aa",
            fontSize: 12,
            fontWeight: 600,
            border: "1px solid #3f3f46",
            borderRadius: 14,
            cursor: "pointer",
          }}
        >
          Restart Demo
        </button>
      )}
    </div>
  );
}
