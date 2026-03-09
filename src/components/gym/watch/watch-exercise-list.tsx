"use client";

import { WOS, SAMPLE_EXERCISES, ACCENT_COLORS } from "./watch-constants";

export function WatchExerciseList() {
  const completed = SAMPLE_EXERCISES.filter((e) => e.done).length;
  const nextIdx = SAMPLE_EXERCISES.findIndex((e) => !e.done);

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
          {completed}/8
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
          const isNext = i === nextIdx;
          return (
          <div
            key={exercise.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 8px",
              borderBottom: i < SAMPLE_EXERCISES.length - 1 ? `1px solid ${WOS.grayMid}` : "none",
              backgroundColor: isNext ? `${ACCENT_COLORS[i]}14` : "transparent",
              borderRadius: isNext ? 10 : 0,
              position: "relative",
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
                border: exercise.done ? "none" : `2px solid ${WOS.gray}`,
                backgroundColor: exercise.done ? WOS.green : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {exercise.done && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}
