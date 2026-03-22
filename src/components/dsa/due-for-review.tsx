"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { DifficultyBadge } from "./difficulty-badge";
import { ReviewDialog } from "./review-dialog";
import { NEETCODE_TOPICS } from "@/data/neetcode-150";
import { ExternalLink, RotateCcw, AlertCircle } from "lucide-react";
import { type Rating } from "@/lib/spaced-repetition";

const NEETCODE_MAP = new Map(
  NEETCODE_TOPICS.flatMap((t) => t.problems).map((p) => [p.id, p])
);

interface DueProblem {
  problemId: string;
  nextReviewDate: string | null;
  intervalDays: number;
  reviewCount: number;
  lastRating: number | null;
  masteryStreak: number;
  notes: string | null;
}

export function DueForReview() {
  const [dueProblems, setDueProblems] = useState<DueProblem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dsa/neetcode-progress/due")
      .then((r) => (r.ok ? r.json() : { due: [] }))
      .then((data: { due: DueProblem[] }) => {
        setDueProblems(data.due);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const handleRate = useCallback(
    async (problemId: string, rating: Rating, notes: string) => {
      setDueProblems((prev) => prev.filter((p) => p.problemId !== problemId));
      setReviewingId(null);

      await fetch("/api/dsa/neetcode-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, elapsedSec: 0, completed: true, rating, notes: notes || undefined }),
      });
    },
    []
  );

  const handleSkip = useCallback(
    async (problemId: string, notes: string) => {
      setDueProblems((prev) => prev.filter((p) => p.problemId !== problemId));
      setReviewingId(null);

      await fetch("/api/dsa/neetcode-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, elapsedSec: 0, completed: true, skip: true, notes: notes || undefined }),
      });
    },
    []
  );

  if (!loaded || dueProblems.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <RotateCcw className="h-4 w-4 text-orange-400" />
        <h2 className="text-lg font-semibold">Due for Review</h2>
        <span className="rounded-full bg-orange-600/20 px-2 py-0.5 text-xs font-medium text-orange-400">
          {dueProblems.length}
        </span>
      </div>

      <div className="rounded-lg border bg-card p-4 space-y-1">
        {dueProblems.map((due) => {
          const problem = NEETCODE_MAP.get(due.problemId);
          if (!problem) return null;

          const daysOverdue = due.nextReviewDate
            ? Math.floor(
                (new Date().setHours(0, 0, 0, 0) -
                  new Date(due.nextReviewDate + "T00:00:00").getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            : 0;

          return (
            <div key={due.problemId}>
              <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm">
                <AlertCircle
                  className={cn(
                    "h-4 w-4 shrink-0",
                    daysOverdue >= 2 ? "text-red-400" : "text-orange-400"
                  )}
                />

                <a
                  href={problem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 truncate hover:text-primary hover:underline transition-colors"
                  title={problem.name}
                >
                  {problem.name}
                  <ExternalLink className="ml-1 inline h-3 w-3 opacity-40" />
                </a>

                <DifficultyBadge
                  difficulty={problem.difficulty.toLowerCase()}
                  className="shrink-0"
                />

                {daysOverdue > 0 && (
                  <span className="text-[11px] text-red-400">
                    {daysOverdue}d overdue
                  </span>
                )}

                <button
                  onClick={() => setReviewingId(due.problemId)}
                  className="rounded-md border border-orange-600/30 bg-orange-600/20 px-3 py-1 text-xs font-medium text-orange-400 hover:bg-orange-600/30 transition-colors"
                >
                  Review
                </button>
              </div>

              {reviewingId === due.problemId && (
                <ReviewDialog
                  problemName={problem.name}
                  difficulty={problem.difficulty.toLowerCase()}
                  attempts={due.reviewCount + 1}
                  bestTime={null}
                  isFirstSolve={false}
                  currentIntervalDays={due.intervalDays}
                  masteryStreak={due.masteryStreak ?? 0}
                  notes={due.notes ?? null}
                  onRate={(rating, notes) => handleRate(due.problemId, rating, notes)}
                  onSkip={(notes) => handleSkip(due.problemId, notes)}
                  onClose={() => setReviewingId(null)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
