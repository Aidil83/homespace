"use client";

import { useState } from "react";
import { Target, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface GoalHeroCardProps {
  exerciseName: string;
  emoji: string;
  currentE1RM: number;
  targetE1RM: number | null;
  onSetGoal: (target: number) => void;
}

function ProgressRing({
  progress,
  size = 112,
}: {
  progress: number;
  size?: number;
}) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(progress, 1));

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="transform -rotate-90"
    >
      <defs>
        <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-muted/30"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#ring-gradient)"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-700"
      />
    </svg>
  );
}

export function GoalHeroCard({
  exerciseName,
  emoji,
  currentE1RM,
  targetE1RM,
  onSetGoal,
}: GoalHeroCardProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  function handleStartEdit() {
    setEditValue(targetE1RM?.toString() ?? "225");
    setEditing(true);
  }

  function handleSaveGoal() {
    const num = Number(editValue);
    if (!isNaN(num) && num > 0) {
      onSetGoal(num);
    }
    setEditing(false);
  }

  // No goal set
  if (targetE1RM == null && !editing) {
    return (
      <button
        onClick={handleStartEdit}
        className="w-full rounded-2xl border border-dashed border-muted-foreground/30 bg-card p-6 text-center transition-colors hover:bg-accent/50"
      >
        <Target className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm font-medium">
          Set a goal for {emoji} {exerciseName}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Track your 1RM progress toward a target
        </p>
      </button>
    );
  }

  // Editing goal
  if (editing) {
    return (
      <div className="rounded-2xl border bg-card p-6">
        <p className="text-sm font-medium text-muted-foreground mb-3">
          {emoji} {exerciseName} — Target 1RM (lbs)
        </p>
        <div className="flex items-center gap-3">
          <input
            type="number"
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveGoal();
            }}
            className={cn(
              "h-12 flex-1 rounded-xl border bg-transparent text-center text-2xl font-bold",
              "focus:outline-none focus:ring-2 focus:ring-primary",
              "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            )}
          />
          <button
            onClick={handleSaveGoal}
            className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            Set Goal
          </button>
        </div>
      </div>
    );
  }

  // Has goal — show progress
  const target = targetE1RM!;
  const progress = target > 0 ? currentE1RM / target : 0;
  const percentage = Math.min(Math.round(progress * 100), 100);
  const remaining = Math.max(target - currentE1RM, 0);
  const isComplete = currentE1RM >= target;

  return (
    <div className="rounded-2xl border bg-gradient-to-br from-card to-accent/20 p-6">
      <div className="flex items-center gap-6">
        <div className="relative shrink-0">
          <ProgressRing progress={progress} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">
              {isComplete ? "🎉" : `${percentage}%`}
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{emoji}</span>
            <h3 className="font-semibold truncate">{exerciseName}</h3>
            <button
              onClick={handleStartEdit}
              className="ml-auto shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-accent transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-3xl font-bold">{currentE1RM || "—"}</span>
            <span className="text-muted-foreground">→</span>
            <span className="text-xl font-semibold text-muted-foreground">
              {targetE1RM} lbs
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {isComplete
              ? "Goal reached! Tap the pencil to set a new target 🏆"
              : `${remaining} lbs to go — keep pushing!`}
          </p>
        </div>
      </div>
    </div>
  );
}
