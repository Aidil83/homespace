"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { DifficultyBadge } from "./difficulty-badge";
import {
  type Rating,
  RATING_LABELS,
  getIntervalPreview,
} from "@/lib/spaced-repetition";
import {
  X,
  Hash,
  Clock,
  Zap,
  GraduationCap,
  Eye,
  EyeOff,
} from "lucide-react";

const RATING_STYLES: Record<Rating, string> = {
  1: "border-red-600/30 bg-red-600/20 text-red-400 hover:bg-red-600/30",
  2: "border-orange-600/30 bg-orange-600/20 text-orange-400 hover:bg-orange-600/30",
  3: "border-yellow-600/30 bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30",
  4: "border-blue-600/30 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30",
  5: "border-green-600/30 bg-green-600/20 text-green-400 hover:bg-green-600/30",
};

interface ReviewDialogProps {
  problemName: string;
  difficulty: string;
  attempts: number;
  bestTime: string | null;
  isFirstSolve: boolean;
  currentIntervalDays: number;
  masteryStreak: number;
  notes: string | null;
  onRate: (rating: Rating, notes: string) => void;
  onSkip: (notes: string) => void; // "I know this"
  onClose: () => void;
}

export function ReviewDialog({
  problemName,
  difficulty,
  attempts,
  bestTime,
  isFirstSolve,
  currentIntervalDays,
  masteryStreak,
  notes,
  onRate,
  onSkip,
  onClose,
}: ReviewDialogProps) {
  const [showReflection, setShowReflection] = useState(false);
  const [notesText, setNotesText] = useState(notes ?? "");
  const intervalPreview = getIntervalPreview(currentIntervalDays);
  const phase = currentIntervalDays === 0 ? "new" : currentIntervalDays <= 2 ? "learning" : "review";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg rounded-xl border bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">{problemName}</h2>
            <DifficultyBadge difficulty={difficulty} />
          </div>
          <button onClick={onClose} className="rounded p-1 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-5 border-b px-5 py-3">
          <div className="flex items-center gap-1.5 text-sm">
            <Hash className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Attempts:</span>
            <span className="font-medium">{attempts}</span>
          </div>
          {bestTime && (
            <div className="flex items-center gap-1.5 text-sm">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Best:</span>
              <span className="font-medium">{bestTime}</span>
            </div>
          )}
          <span className={cn(
            "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
            phase === "new" && "bg-purple-600/20 text-purple-400",
            phase === "learning" && "bg-orange-600/20 text-orange-400",
            phase === "review" && "bg-blue-600/20 text-blue-400",
          )}>
            {phase === "new" ? <Zap className="h-3 w-3" /> : <GraduationCap className="h-3 w-3" />}
            {phase === "new" ? "New" : phase === "learning" ? "Learning" : "Review"}
            {masteryStreak > 0 && ` (${masteryStreak}/3)`}
          </span>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Past reflection (hidden by default) */}
          {!isFirstSolve && notes && (
            <div>
              <button
                onClick={() => setShowReflection(!showReflection)}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {showReflection ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {showReflection ? "Hide past reflection" : "Show past reflection"}
              </button>
              {showReflection && (
                <div className="mt-2 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/50 p-3 text-sm text-muted-foreground italic">
                  &quot;{notes}&quot;
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-sm font-medium">
              {isFirstSolve ? "Notes for next time" : "Update reflection"}
            </label>
            <p className="text-xs text-muted-foreground mb-2">
              What was the key insight? What tripped you up?
            </p>
            <textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="e.g., Use a hashmap for O(n). I kept trying nested loops..."
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              rows={2}
            />
          </div>

          {/* Rating scale */}
          <div>
            <label className="text-sm font-medium mb-2 block">How did it go?</label>
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-[10px]">
                <span className="text-muted-foreground">Learning</span>
                <div className="h-px flex-1 bg-muted-foreground/20" />
                <span className="text-muted-foreground">Review</span>
                <div className="h-px flex-1 bg-muted-foreground/20" />
              </div>
              <div className="flex gap-1.5">
                {([1, 2, 3, 4, 5] as Rating[]).map((value) => (
                  <button
                    key={value}
                    onClick={() => onRate(value, notesText)}
                    className={cn(
                      "flex-1 rounded-lg border px-2 py-2 text-center transition-colors",
                      RATING_STYLES[value]
                    )}
                    title={RATING_LABELS[value].description}
                  >
                    <div className="text-xs font-bold">{value}</div>
                    <div className="text-[10px] font-medium">{RATING_LABELS[value].label}</div>
                    <div className="text-[10px] opacity-60 mt-0.5">{intervalPreview[value]}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* I know this */}
          <button
            onClick={() => onSkip(notesText)}
            className="w-full rounded-lg border border-muted-foreground/20 px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground hover:border-muted-foreground/40"
          >
            I know this — skip review
          </button>
        </div>
      </div>
    </div>
  );
}
