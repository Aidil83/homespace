"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { DifficultyBadge } from "./difficulty-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  type Rating,
  RATING_LABELS,
  getIntervalPreview,
  getReviewStatus,
  formatInterval,
} from "@/lib/spaced-repetition";
import { formatTime } from "@/lib/stopwatch";
import type { NeetcodeProblem } from "@/data/neetcode-150";
import {
  ExternalLink,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Zap,
  GraduationCap,
  ChevronRight,
  Eye,
  EyeOff,
  Calendar,
  Trophy,
  Send,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────
interface ProgressEntry {
  elapsedSec: number;
  completed: boolean;
  lastRating: number | null;
  intervalDays: number;
  reviewCount: number;
  nextReviewDate: string | null;
  mastered: boolean;
  masteryStreak: number;
  notes: string | null;
}

interface Attempt {
  elapsedSec: number;
  rating: number | null;
  createdAt: string;
}

interface StopwatchHandle {
  elapsed: number;
  running: boolean;
  overTime: boolean;
  toggle: () => void;
  reset: () => void;
}

const RATING_STYLES: Record<number, string> = {
  1: "bg-purple-600/5 text-purple-400/40",
  2: "bg-purple-600/10 text-purple-400/55",
  3: "bg-purple-600/15 text-purple-400/70",
  4: "bg-purple-600/20 text-purple-400/85",
  5: "bg-purple-600/25 text-purple-400",
};

const RATING_BUTTON_STYLES: Record<number, string> = {
  1: "border-purple-500/10 bg-purple-600/5 text-purple-400/40 hover:bg-purple-600/10",
  2: "border-purple-500/15 bg-purple-600/10 text-purple-400/55 hover:bg-purple-600/15",
  3: "border-purple-500/20 bg-purple-600/15 text-purple-400/70 hover:bg-purple-600/20",
  4: "border-purple-500/30 bg-purple-600/20 text-purple-400/85 hover:bg-purple-600/25",
  5: "border-purple-500/40 bg-purple-600/25 text-purple-400 hover:bg-purple-600/30",
};

// ── Helpers ────────────────────────────────────────────────────────
function relativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Component ──────────────────────────────────────────────────────
interface ProblemHubDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  problem: NeetcodeProblem;
  progressEntry: ProgressEntry;
  stopwatch: StopwatchHandle;
  onRateAndComplete: (rating: Rating, notes: string) => void;
  onSkipReview: (notes: string) => void;
  onSubmit: (elapsedSec: number) => void;
}

export function ProblemHubDialog({
  open,
  onOpenChange,
  problem,
  progressEntry,
  stopwatch,
  onRateAndComplete,
  onSkipReview,
  onSubmit,
}: ProblemHubDialogProps) {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [attemptsLoaded, setAttemptsLoaded] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [notesText, setNotesText] = useState(progressEntry.notes ?? "");
  const [activeAttempt, setActiveAttempt] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setAttemptsLoaded(false);
      setShowRating(false);
      setActiveAttempt(false);
      setNotesText(progressEntry.notes ?? "");
    }
    onOpenChange(nextOpen);
  };

  const entry = progressEntry;
  const phase = entry.mastered
    ? "mastered"
    : entry.intervalDays <= 2 && entry.intervalDays > 0
      ? "learning"
      : entry.reviewCount > 0
        ? "review"
        : "new";
  const reviewStatus = entry.completed
    ? getReviewStatus(entry.nextReviewDate, entry.mastered)
    : "none";
  const intervalPreview = getIntervalPreview(entry.intervalDays);

  const bestTime =
    attempts.length > 0
      ? Math.min(...attempts.filter((a) => a.elapsedSec > 0).map((a) => a.elapsedSec))
      : entry.elapsedSec > 0
        ? entry.elapsedSec
        : null;

  useEffect(() => {
    if (open && !attemptsLoaded) {
      fetch(`/api/dsa/neetcode-progress/attempts?problemId=${problem.id}`)
        .then((r) => (r.ok ? r.json() : { attempts: [] }))
        .then((data: { attempts: Attempt[] }) => {
          setAttempts(data.attempts);
          setAttemptsLoaded(true);
        })
        .catch(() => setAttemptsLoaded(true));
    }
  }, [open, problem.id, attemptsLoaded]);

  const handleTryAgain = () => {
    stopwatch.reset();
    stopwatch.toggle();
    setActiveAttempt(true);
    window.open(problem.url, "_blank");
  };

  const handleSubmit = () => {
    const elapsed = stopwatch.elapsed;
    onSubmit(elapsed);
    stopwatch.reset();
    setActiveAttempt(false);
    setAttempts((prev) => [
      { elapsedSec: elapsed, rating: null, createdAt: new Date().toISOString() },
      ...prev,
    ]);
  };

  const handleRate = (rating: Rating) => {
    onRateAndComplete(rating, notesText);
    setShowRating(false);
    setAttempts((prev) => [
      { elapsedSec: stopwatch.elapsed, rating, createdAt: new Date().toISOString() },
      ...prev,
    ]);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto gap-0 p-0 border-0 bg-gradient-to-b from-card to-background">
        {/* ── Header ── */}
        <DialogHeader className="px-5 pt-5 pb-0">
          <div className="flex items-center gap-2 pr-8">
            <span className="text-xs text-muted-foreground/70 font-mono">#{problem.number}</span>
            <DifficultyBadge difficulty={problem.difficulty.toLowerCase()} />
            <span
              className={cn(
                "flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ml-auto",
                phase === "new" && "bg-purple-500/15 text-purple-400 ring-1 ring-purple-500/20",
                phase === "learning" && "bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/20",
                phase === "review" && "bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/20",
                phase === "mastered" && "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20"
              )}
            >
              {phase === "new" ? <Zap className="h-3 w-3" /> : phase === "mastered" ? <Trophy className="h-3 w-3" /> : <GraduationCap className="h-3 w-3" />}
              {phase === "new" ? "New" : phase === "learning" ? "Learning" : phase === "review" ? `Review ${entry.masteryStreak}/3` : "Mastered"}
            </span>
          </div>
          <DialogTitle className="text-base">{problem.name}</DialogTitle>
          <DialogDescription className="sr-only">Problem details and actions</DialogDescription>
        </DialogHeader>

        {/* ── Stopwatch + Actions ── */}
        <div className="px-5 pt-4 pb-3 space-y-3">
          {/* Timer display — only shows during an active attempt */}
          {activeAttempt && (stopwatch.running || stopwatch.elapsed > 0) && (
            <div className={cn(
              "rounded-xl p-4 text-center",
              stopwatch.running
                ? "bg-gradient-to-br from-blue-600/15 to-indigo-600/10 ring-1 ring-blue-500/25"
                : "bg-gradient-to-br from-slate-500/10 to-slate-600/5 ring-1 ring-white/5"
            )}>
              <div className={cn(
                "text-3xl font-mono font-bold tabular-nums tracking-tight",
                stopwatch.running ? "text-blue-400" : "text-slate-200"
              )}>
                {formatTime(stopwatch.elapsed)}
              </div>
              <div className="flex items-center justify-center gap-2 mt-3">
                <button
                  onClick={stopwatch.toggle}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all",
                    stopwatch.running
                      ? "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/25 hover:bg-amber-500/30"
                      : "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/25 hover:bg-emerald-500/30"
                  )}
                >
                  {stopwatch.running ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  {stopwatch.running ? "Pause" : "Resume"}
                </button>
                <button
                  onClick={stopwatch.reset}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium text-slate-400 ring-1 ring-white/5 hover:bg-white/5 hover:text-slate-300 transition-all"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </button>
                {!stopwatch.running && stopwatch.elapsed > 0 && (
                  <button
                    onClick={handleSubmit}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:shadow-emerald-600/30 hover:brightness-110"
                  >
                    <Send className="h-3 w-3" />
                    Submit
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <a
              href={problem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-medium text-slate-300 ring-1 ring-white/10 transition-all hover:bg-white/5 hover:ring-white/20"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open in LeetCode
            </a>
            <button
              onClick={handleTryAgain}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-purple-600 px-3 py-2.5 text-xs font-semibold text-white shadow-lg shadow-purple-600/20 transition-all hover:bg-purple-700 hover:shadow-purple-600/30"
            >
              <Play className="h-3.5 w-3.5" />
              Try Again
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="mx-5 rounded-xl bg-gradient-to-br from-white/[0.04] to-white/[0.02] ring-1 ring-white/[0.06] px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="text-center flex-1">
              <div className="text-lg font-bold tabular-nums text-slate-100">{attempts.length || entry.reviewCount}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Solves</div>
            </div>
            {bestTime != null && bestTime > 0 && bestTime !== Infinity && (
              <div className="text-center flex-1">
                <div className="text-lg font-bold font-mono tabular-nums text-amber-300">{formatTime(bestTime)}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium flex items-center justify-center gap-1">
                  <Trophy className="h-2.5 w-2.5 text-amber-400" /> Best
                </div>
              </div>
            )}
            {entry.completed && !entry.mastered && entry.intervalDays > 0 && (
              <div className="text-center flex-1">
                <div className="text-lg font-bold tabular-nums text-blue-300">{formatInterval(entry.intervalDays)}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Interval</div>
              </div>
            )}
          </div>

          {/* Next review */}
          {entry.completed && !entry.mastered && entry.nextReviewDate && (
            <div className="flex items-center justify-center gap-1.5 mt-2.5 pt-2.5 border-t border-white/[0.06] text-xs">
              <Calendar className="h-3 w-3 text-slate-500" />
              <span className="text-slate-500">Next review:</span>
              <span
                className={cn(
                  "font-semibold",
                  reviewStatus === "due" && "text-orange-400",
                  reviewStatus === "overdue" && "text-red-400",
                  reviewStatus === "scheduled" && "text-slate-300"
                )}
              >
                {reviewStatus === "due" ? "Today" : reviewStatus === "overdue" ? "Overdue" : entry.nextReviewDate}
              </span>
            </div>
          )}
        </div>

        {/* ── Collapsible sections ── */}
        <div className="px-5 py-4 space-y-1">
          {/* Activity history */}
          <Collapsible defaultOpen={attempts.length > 0 && attempts.length <= 5}>
            <CollapsibleTrigger className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-white/[0.04] transition-all w-full text-left group">
              <ChevronRight className="h-4 w-4 text-slate-500 transition-transform group-data-[state=open]:rotate-90" />
              <Clock className="h-3.5 w-3.5 text-cyan-400/70" />
              <span className="text-slate-300">Activity</span>
              {attempts.length > 0 && (
                <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-semibold text-cyan-400 ring-1 ring-cyan-500/20">
                  {attempts.length}
                </span>
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              {attempts.length > 0 ? (
                <div className="ml-8 mt-1 space-y-0.5">
                  {attempts.map((a, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-md px-2 py-1.5 text-xs hover:bg-white/[0.02] transition-colors"
                    >
                      <span className="text-slate-500 w-20 shrink-0">
                        {relativeDate(a.createdAt)}
                      </span>
                      <span className="font-mono tabular-nums w-12 shrink-0 text-slate-300">
                        {a.elapsedSec > 0 ? formatTime(a.elapsedSec) : "--:--"}
                      </span>
                      {a.rating ? (
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-medium",
                            RATING_STYLES[a.rating]
                          )}
                        >
                          {RATING_LABELS[a.rating as Rating]?.label}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-600">Unrated</span>
                      )}
                      {bestTime != null && a.elapsedSec === bestTime && a.elapsedSec > 0 && (
                        <Trophy className="h-3 w-3 text-amber-400" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="ml-8 mt-1 text-xs text-slate-600">
                  {attemptsLoaded ? "No attempts yet" : "Loading..."}
                </p>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Rate this problem */}
          <Collapsible open={showRating} onOpenChange={setShowRating}>
            <CollapsibleTrigger className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-white/[0.04] transition-all w-full text-left group">
              <ChevronRight className="h-4 w-4 text-slate-500 transition-transform group-data-[state=open]:rotate-90" />
              <GraduationCap className="h-3.5 w-3.5 text-violet-400/70" />
              <span className="text-slate-300">Rate this problem</span>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="ml-8 mt-2 space-y-3">
                {/* Past reflection */}
                {entry.notes && (
                  <button
                    onClick={() => setShowReflection(!showReflection)}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showReflection ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    {showReflection ? "Hide past reflection" : "Show past reflection"}
                  </button>
                )}
                {showReflection && entry.notes && (
                  <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.02] p-3 text-xs text-slate-400 italic">
                    &quot;{entry.notes}&quot;
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="text-xs font-medium text-slate-400">Reflection</label>
                  <textarea
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    placeholder="What was the key insight? What tripped you up?"
                    className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/30 resize-none transition-all"
                    rows={2}
                  />
                </div>

                {/* 5-point scale */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-[10px] text-slate-600">
                    <span>Learning</span>
                    <div className="h-px flex-1 bg-white/[0.06]" />
                    <span>Review</span>
                    <div className="h-px flex-1 bg-white/[0.06]" />
                  </div>
                  <div className="flex gap-1.5">
                    {([1, 2, 3, 4, 5] as Rating[]).map((value) => (
                      <button
                        key={value}
                        onClick={() => handleRate(value)}
                        className={cn(
                          "flex-1 rounded-lg border py-2.5 text-center transition-all hover:scale-[1.03] hover:shadow-md",
                          RATING_BUTTON_STYLES[value]
                        )}
                        title={RATING_LABELS[value].description}
                      >
                        <div className="text-sm font-bold">{value}</div>
                        <div className="text-[9px] font-semibold opacity-80">{RATING_LABELS[value].label}</div>
                        <div className="text-[9px] opacity-40 mt-0.5">{intervalPreview[value]}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skip review */}
                <button
                  onClick={() => { onSkipReview(notesText); setShowRating(false); }}
                  className="w-full rounded-lg ring-1 ring-white/[0.06] px-3 py-2 text-[11px] text-slate-500 transition-all hover:text-slate-300 hover:ring-white/10 hover:bg-white/[0.02]"
                >
                  I know this — skip review
                </button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </DialogContent>
    </Dialog>
  );
}
