"use client";

import { WOS, SAMPLE_EXERCISES, ACCENT_COLORS } from "./watch-constants";

interface WatchExerciseListProps {
  onAction?: (exerciseIndex: number) => void;
  onEndWorkout?: () => void;
  completedSet?: Set<number>;
}

export function WatchExerciseList({ onAction, onEndWorkout, completedSet }: WatchExerciseListProps = {}) {
  const doneCount = completedSet
    ? SAMPLE_EXERCISES.filter((_, i) => SAMPLE_EXERCISES[i].done || completedSet.has(i)).length
    : SAMPLE_EXERCISES.filter((e) => e.done).length;
  const nextIdx = SAMPLE_EXERCISES.findIndex((e, i) =>
    completedSet ? !e.done && !completedSet.has(i) : !e.done
  );

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px 10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: WOS.secondaryLabel,
            textTransform: "uppercase",
          }}
        >
          FULL BODY
        </span>
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: WOS.green,
          }}
        >
          {doneCount}/8
        </span>
      </div>

      {/* Scrollable list */}
      {/* Hide scrollbar via inline style tag */}
      <style>{`.watch-ex-list::-webkit-scrollbar { display: none; }`}</style>
      <div
        className="watch-ex-list"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "0 12px 12px",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {SAMPLE_EXERCISES.map((exercise, i) => {
          const isDone = exercise.done || (completedSet?.has(i) ?? false);
          const isNext = i === nextIdx;
          return (
          <div
            key={exercise.name}
            onClick={() => onAction?.(i)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 8px",
              borderBottom: i < SAMPLE_EXERCISES.length - 1 ? `1px solid ${WOS.grayMid}` : "none",
              backgroundColor: isNext ? `${ACCENT_COLORS[i]}14` : "transparent",
              borderRadius: isNext ? 10 : 0,
              position: "relative",
              cursor: onAction ? "pointer" : "default",
            }}
          >
            {/* NEXT badge */}
            {isNext && (
              <div
                style={{
                  position: "absolute",
                  top: 2,
                  right: 8,
                  fontSize: 8,
                  fontWeight: 700,
                  color: ACCENT_COLORS[i],
                  letterSpacing: "0.08em",
                }}
              >
                NEXT
              </div>
            )}

            {/* Color stripe */}
            <div
              style={{
                width: 4,
                height: 32,
                borderRadius: 2,
                backgroundColor: ACCENT_COLORS[i],
                flexShrink: 0,
              }}
            />

            {/* Exercise info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: WOS.label,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {exercise.name}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: WOS.tertiaryLabel,
                  marginTop: 1,
                }}
              >
                {exercise.sets}×{exercise.reps}
              </div>
            </div>

            {/* Completion checkmark */}
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                border: isDone ? "none" : `2px solid ${WOS.gray}`,
                backgroundColor: isDone ? WOS.green : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {isDone && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          </div>
          );
        })}

        {/* End Workout button */}
        {onEndWorkout && (
          <button
            onClick={onEndWorkout}
            style={{
              width: "100%",
              padding: "10px 0",
              marginTop: 8,
              backgroundColor: "rgba(255,69,58,0.15)",
              color: WOS.red,
              fontSize: 13,
              fontWeight: 700,
              border: `1px solid rgba(255,69,58,0.3)`,
              borderRadius: 18,
              cursor: "pointer",
            }}
          >
            End Workout
          </button>
        )}
      </div>
    </div>
  );
}
