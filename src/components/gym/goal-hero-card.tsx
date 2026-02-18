"use client";

import { useState, type ReactNode } from "react";
import { Target, Pencil, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface GoalHeroCardProps {
  exerciseName: string;
  emoji: string;
  currentE1RM: number;
  targetE1RM: number | null;
  onSetGoal: (target: number) => void;
  increment?: number;
  children?: ReactNode;
}

export function GoalHeroCard({
  exerciseName,
  emoji,
  currentE1RM,
  targetE1RM,
  onSetGoal,
  increment = 10,
  children,
}: GoalHeroCardProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [roadmapOpen, setRoadmapOpen] = useState(false);

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

  // Next milestone
  const nextMilestone = Math.ceil(currentE1RM / increment) * increment + increment;
  const stepsToMilestone = Math.max(
    Math.round((nextMilestone - currentE1RM) / increment),
    1
  );
  const estWeeks = stepsToMilestone * 3;
  const estDate = new Date();
  estDate.setDate(estDate.getDate() + estWeeks * 7);
  const estDateStr = estDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      <div className="px-5 pt-5 pb-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏆</span>
            <h3 className="font-semibold">{exerciseName} Goal</h3>
            <button
              onClick={handleStartEdit}
              className="rounded-lg p-1 text-muted-foreground hover:bg-accent transition-colors"
            >
              <Pencil className="h-3 w-3" />
            </button>
          </div>
          <span className="text-lg font-bold text-purple-400">
            {currentE1RM}/{target}{" "}
            <span className="text-sm font-normal text-muted-foreground">lbs</span>
          </span>
        </div>

        {/* Horizontal progress bar */}
        <div className="relative h-7 rounded-full bg-purple-500/15 overflow-hidden mb-3">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-700"
            style={{ width: `${Math.max(percentage, 8)}%` }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
            {percentage}%
          </span>
        </div>

        {/* Info row */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <span>
            Current:{" "}
            <span className="font-semibold text-foreground">{currentE1RM} lbs</span>
          </span>
          <span>{remaining} to go</span>
          <span>
            Goal:{" "}
            <span className="font-semibold text-foreground">{target} lbs</span>
          </span>
        </div>

        {/* Next Milestone */}
        {!isComplete && nextMilestone <= target && (
          <div className="rounded-xl bg-muted/50 px-4 py-3 flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] text-muted-foreground">Next Milestone</p>
              <p className="text-lg font-bold">{nextMilestone} lbs</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">
                Est. ~{estWeeks} weeks
              </p>
              <p className="text-sm font-semibold">{estDateStr}</p>
            </div>
          </div>
        )}

        {isComplete && (
          <p className="text-sm text-green-500 font-semibold mb-4 text-center">
            Goal reached! Tap the pencil to set a new target 🏆
          </p>
        )}
      </div>

      {/* Collapsible Roadmap */}
      {children && (
        <Collapsible open={roadmapOpen} onOpenChange={setRoadmapOpen}>
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-purple-400 hover:bg-accent/50 transition-colors border-t">
              {roadmapOpen ? "Hide Full Roadmap" : "View Full Roadmap"}
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  roadmapOpen && "rotate-180"
                )}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4">{children}</div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
