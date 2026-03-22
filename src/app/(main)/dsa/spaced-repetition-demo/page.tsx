"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { DifficultyBadge } from "@/components/dsa/difficulty-badge";
import {
  CheckCircle,
  Circle,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  RotateCcw,
  Clock,
  Hash,
  Eye,
  EyeOff,
  Zap,
  GraduationCap,
  X,
} from "lucide-react";

// ── 5-point rating scale ───────────────────────────────────────────
type Rating5 = 1 | 2 | 3 | 4 | 5;

const RATING_CONFIG: {
  value: Rating5;
  label: string;
  description: string;
  className: string;
  phase: "learning" | "review";
}[] = [
  {
    value: 1,
    label: "Blank",
    description: "Had no idea, needed the solution",
    className: "border-red-600/30 bg-red-600/20 text-red-400 hover:bg-red-600/30",
    phase: "learning",
  },
  {
    value: 2,
    label: "Struggled",
    description: "Right direction but couldn't finish",
    className: "border-orange-600/30 bg-orange-600/20 text-orange-400 hover:bg-orange-600/30",
    phase: "learning",
  },
  {
    value: 3,
    label: "Slow",
    description: "Solved it but took too long",
    className: "border-yellow-600/30 bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30",
    phase: "review",
  },
  {
    value: 4,
    label: "Good",
    description: "Solved with minor hesitation",
    className: "border-blue-600/30 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30",
    phase: "review",
  },
  {
    value: 5,
    label: "Nailed",
    description: "Quick and confident",
    className: "border-green-600/30 bg-green-600/20 text-green-400 hover:bg-green-600/30",
    phase: "review",
  },
];

function computeInterval(rating: Rating5, currentInterval: number): { interval: number; phase: "learning" | "review"; mastered: boolean } {
  switch (rating) {
    case 1: return { interval: 1, phase: "learning", mastered: false };
    case 2: return { interval: 2, phase: "learning", mastered: false };
    case 3: return { interval: currentInterval === 0 ? 4 : Math.max(3, Math.floor(currentInterval * 0.75)), phase: "review", mastered: false };
    case 4: return { interval: currentInterval === 0 ? 7 : Math.min(currentInterval * 2, 120), phase: "review", mastered: currentInterval * 2 >= 60 };
    case 5: return { interval: currentInterval === 0 ? 14 : Math.min(currentInterval * 2.5, 120), phase: "review", mastered: currentInterval * 2.5 >= 60 };
  }
}

function formatDays(days: number): string {
  if (days < 30) return `${days}d`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return `${Math.round(days / 365)}y`;
}

// ── Rating buttons component ───────────────────────────────────────
function RatingScale({
  currentInterval,
  onRate,
}: {
  currentInterval: number;
  onRate: (rating: Rating5) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground mr-1">Learning</span>
        <div className="h-px flex-1 bg-muted-foreground/20" />
        <span className="text-xs text-muted-foreground mx-1">Review</span>
        <div className="h-px flex-1 bg-muted-foreground/20" />
      </div>
      <div className="flex gap-1.5">
        {RATING_CONFIG.map(({ value, label, description, className }) => {
          const result = computeInterval(value, currentInterval);
          return (
            <button
              key={value}
              onClick={() => onRate(value)}
              className={cn(
                "flex-1 rounded-lg border px-2 py-2 text-center transition-colors",
                className
              )}
              title={description}
            >
              <div className="text-xs font-bold">{value}</div>
              <div className="text-[10px] font-medium">{label}</div>
              <div className="text-[10px] opacity-60 mt-0.5">{formatDays(result.interval)}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Review Dialog component ────────────────────────────────────────
function ReviewDialog({
  problem,
  attempts,
  bestTime,
  history,
  reflection,
  currentInterval,
  phase,
  onRate,
  onClose,
  onSaveReflection,
}: {
  problem: { name: string; difficulty: string; topic: string };
  attempts: number;
  bestTime: string;
  history: { date: string; time: string; rating: Rating5 | null; interval: string }[];
  reflection: string;
  currentInterval: number;
  phase: "learning" | "review" | "first";
  onRate: (rating: Rating5) => void;
  onClose: () => void;
  onSaveReflection: (text: string) => void;
}) {
  const [showReflection, setShowReflection] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [reflectionText, setReflectionText] = useState(reflection);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">{problem.name}</h2>
            <DifficultyBadge difficulty={problem.difficulty} />
          </div>
          <button onClick={onClose} className="rounded p-1 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-6 border-b px-5 py-3">
          <div className="flex items-center gap-1.5 text-sm">
            <Hash className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Attempts:</span>
            <span className="font-medium">{attempts}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Best:</span>
            <span className="font-medium">{bestTime}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            {phase === "learning" ? (
              <Zap className="h-3.5 w-3.5 text-orange-400" />
            ) : (
              <GraduationCap className="h-3.5 w-3.5 text-blue-400" />
            )}
            <span className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              phase === "first" && "bg-purple-600/20 text-purple-400",
              phase === "learning" && "bg-orange-600/20 text-orange-400",
              phase === "review" && "bg-blue-600/20 text-blue-400",
            )}>
              {phase === "first" ? "First Solve" : phase === "learning" ? "Learning" : "Review"}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* First solve message */}
          {phase === "first" && (
            <div className="rounded-lg border border-purple-600/30 bg-purple-600/10 p-3">
              <p className="text-sm text-purple-300">
                First time solving this problem. A recall session will be scheduled for
                <span className="font-semibold"> tomorrow</span> to test if you can solve it on your own.
              </p>
            </div>
          )}

          {/* Reflection (hidden by default) */}
          {phase !== "first" && reflection && (
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
                  &quot;{reflection}&quot;
                </div>
              )}
            </div>
          )}

          {/* Write/update reflection */}
          <div>
            <label className="text-sm font-medium">
              {phase === "first" ? "Notes for next time" : "Update reflection"}
            </label>
            <p className="text-xs text-muted-foreground mb-2">
              What was the key insight? What tripped you up?
            </p>
            <textarea
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              onBlur={() => onSaveReflection(reflectionText)}
              placeholder="e.g., Use a hashmap to store complements. I kept trying two nested loops..."
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              rows={2}
            />
          </div>

          {/* Rating */}
          {phase === "first" ? (
            <button
              onClick={onClose}
              className="w-full rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-500"
            >
              Got it — see you tomorrow
            </button>
          ) : (
            <div>
              <label className="text-sm font-medium mb-2 block">How did it go?</label>
              <RatingScale currentInterval={currentInterval} onRate={onRate} />
            </div>
          )}

          {/* Collapsible history */}
          {history.length > 0 && (
            <div>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {showHistory ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                View history ({history.length})
              </button>
              {showHistory && (
                <div className="mt-2 rounded-lg border bg-muted/30 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-xs text-muted-foreground">
                        <th className="px-3 py-1.5 text-left font-medium">Date</th>
                        <th className="px-3 py-1.5 text-left font-medium">Time</th>
                        <th className="px-3 py-1.5 text-left font-medium">Rating</th>
                        <th className="px-3 py-1.5 text-left font-medium">Next</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="px-3 py-1.5 text-muted-foreground">{h.date}</td>
                          <td className="px-3 py-1.5 font-mono">{h.time}</td>
                          <td className="px-3 py-1.5">
                            {h.rating ? (
                              <span className={cn(
                                "rounded px-1.5 py-0.5 text-xs font-medium",
                                h.rating <= 2 && "bg-red-600/20 text-red-400",
                                h.rating === 3 && "bg-yellow-600/20 text-yellow-400",
                                h.rating >= 4 && "bg-green-600/20 text-green-400",
                              )}>
                                {RATING_CONFIG.find((r) => r.value === h.rating)?.label}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">First solve</span>
                            )}
                          </td>
                          <td className="px-3 py-1.5 text-muted-foreground">{h.interval}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Step 1: First Solve ────────────────────────────────────────────
function Step1FirstSolve() {
  const [showDialog, setShowDialog] = useState(false);
  const [completed, setCompleted] = useState(false);

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        The first time you solve a problem, there&apos;s <span className="font-medium text-foreground">no rating</span>.
        The system automatically schedules a recall for tomorrow so you can test yourself cold.
      </p>
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-3 py-1.5">
          <button
            onClick={() => {
              if (!completed) setShowDialog(true);
            }}
            className={cn(
              "shrink-0 rounded p-0.5 transition-colors",
              completed ? "text-green-400" : "text-muted-foreground/40 hover:text-muted-foreground"
            )}
          >
            <CheckCircle className="h-5 w-5" />
          </button>
          <span className={cn("flex-1", completed && "line-through opacity-60")}>
            Climbing Stairs <ExternalLink className="ml-1 inline h-3 w-3 opacity-40" />
          </span>
          <DifficultyBadge difficulty="easy" />
          <span className="text-xs text-muted-foreground font-mono">15:42</span>
        </div>
        {completed && (
          <div className="pl-8 pt-1 text-xs text-purple-400">
            Recall scheduled for tomorrow
          </div>
        )}
      </div>
      {!completed && (
        <p className="text-xs text-muted-foreground italic">Click the checkmark to try it.</p>
      )}

      {showDialog && (
        <ReviewDialog
          problem={{ name: "Climbing Stairs", difficulty: "easy", topic: "1-D Dynamic Programming" }}
          attempts={1}
          bestTime="15:42"
          history={[]}
          reflection=""
          currentInterval={0}
          phase="first"
          onRate={() => {}}
          onClose={() => { setShowDialog(false); setCompleted(true); }}
          onSaveReflection={() => {}}
        />
      )}
    </div>
  );
}

// ── Step 2: Learning Phase ─────────────────────────────────────────
function Step2Learning() {
  const [showDialog, setShowDialog] = useState(false);
  const [rated, setRated] = useState<Rating5 | null>(null);

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Next day: the problem comes back for active recall. You re-solve it on LeetCode,
        then open the dialog to rate. Your past reflection is <span className="font-medium text-foreground">hidden</span> — click to reveal only after you&apos;ve tried.
      </p>
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-3 py-1.5">
          <Circle className="h-5 w-5 text-orange-400 shrink-0" />
          <span className="flex-1">
            Climbing Stairs <ExternalLink className="ml-1 inline h-3 w-3 opacity-40" />
          </span>
          <DifficultyBadge difficulty="easy" />
          <button
            onClick={() => setShowDialog(true)}
            className="rounded-md border border-orange-600/30 bg-orange-600/20 px-3 py-1 text-xs font-medium text-orange-400 hover:bg-orange-600/30 transition-colors"
          >
            {rated ? "Rated" : "Review"}
          </button>
        </div>
        {rated && (
          <div className="pl-8 pt-1 text-xs text-muted-foreground">
            Rated <span className="font-medium text-foreground">{RATING_CONFIG.find((r) => r.value === rated)?.label}</span>
            {" — "}
            {rated <= 2
              ? <span className="text-orange-400">still learning, try again in {rated === 1 ? "1" : "2"} day{rated === 2 ? "s" : ""}</span>
              : <span className="text-blue-400">graduated to review phase, next in {computeInterval(rated, 0).interval}d</span>
            }
          </div>
        )}
      </div>

      {showDialog && (
        <ReviewDialog
          problem={{ name: "Climbing Stairs", difficulty: "easy", topic: "1-D Dynamic Programming" }}
          attempts={2}
          bestTime="15:42"
          history={[
            { date: "Mar 21", time: "15:42", rating: null, interval: "1d (auto)" },
          ]}
          reflection="Use DP — f(n) = f(n-1) + f(n-2). I kept trying to brute force with recursion."
          currentInterval={0}
          phase="learning"
          onRate={(r) => { setRated(r); setShowDialog(false); }}
          onClose={() => setShowDialog(false)}
          onSaveReflection={() => {}}
        />
      )}
    </div>
  );
}

// ── Step 3: Review Phase with interval growth ──────────────────────
function Step3ReviewPhase() {
  const [reviews, setReviews] = useState<{ rating: Rating5; interval: number; phase: string }[]>([]);
  const [currentInterval, setCurrentInterval] = useState(0);
  const [mastered, setMastered] = useState(false);

  const handleRate = (rating: Rating5) => {
    const result = computeInterval(rating, currentInterval);
    setReviews((prev) => [...prev, { rating, interval: result.interval, phase: result.phase }]);
    setCurrentInterval(result.interval);
    setMastered(result.mastered);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Try the 5-point scale below. Ratings 1-2 keep you in the <span className="text-orange-400 font-medium">learning</span> loop.
        Ratings 3-5 move you to <span className="text-blue-400 font-medium">review</span> with growing intervals.
      </p>
      <div className="rounded-lg border bg-card p-4 space-y-4">
        {reviews.length > 0 && (
          <div className="space-y-1.5">
            {reviews.map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="w-16 text-xs text-muted-foreground">
                  {i === 0 ? "Attempt" : "Review"} {i + 1}
                </span>
                <span className={cn(
                  "rounded-md border px-2 py-0.5 text-xs font-medium",
                  RATING_CONFIG.find((c) => c.value === r.rating)?.className
                )}>
                  {r.rating} — {RATING_CONFIG.find((c) => c.value === r.rating)?.label}
                </span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium",
                  r.phase === "learning" ? "bg-orange-600/20 text-orange-400" : "bg-blue-600/20 text-blue-400"
                )}>
                  {r.phase}
                </span>
                <span className="text-xs text-muted-foreground">
                  next in <span className="font-medium text-foreground">{formatDays(r.interval)}</span>
                </span>
              </div>
            ))}
          </div>
        )}

        {mastered ? (
          <div className="flex items-center gap-2 rounded-lg border border-green-600/30 bg-green-600/10 p-3">
            <CheckCircle className="h-5 w-5 text-green-400 fill-green-400/20" />
            <span className="text-sm font-medium text-green-400">
              Problem mastered! No more reviews.
            </span>
          </div>
        ) : (
          <div>
            <p className="text-xs text-muted-foreground mb-2">
              {reviews.length === 0
                ? "First recall attempt — rate yourself:"
                : `Current interval: ${formatDays(currentInterval)} — rate your review:`}
            </p>
            <RatingScale currentInterval={currentInterval} onRate={handleRate} />
          </div>
        )}

        {reviews.length > 0 && (
          <button
            onClick={() => { setReviews([]); setCurrentInterval(0); setMastered(false); }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        )}
      </div>
    </div>
  );
}

// ── Step 4: The Dialog ─────────────────────────────────────────────
function Step4Dialog() {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        This is the full review dialog with stats, hidden reflection, history, and the 5-point rating.
        Click below to open it.
      </p>
      <button
        onClick={() => setShowDialog(true)}
        className="rounded-lg border bg-card px-4 py-3 text-sm font-medium hover:bg-muted transition-colors w-full text-left flex items-center gap-3"
      >
        <Circle className="h-5 w-5 text-orange-400" />
        <span className="flex-1">Group Anagrams</span>
        <DifficultyBadge difficulty="medium" />
        <span className="text-xs text-orange-400">Due for review</span>
      </button>

      {showDialog && (
        <ReviewDialog
          problem={{ name: "Group Anagrams", difficulty: "medium", topic: "Arrays & Hashing" }}
          attempts={4}
          bestTime="08:15"
          history={[
            { date: "Mar 10", time: "22:47", rating: null, interval: "1d (auto)" },
            { date: "Mar 11", time: "18:30", rating: 2, interval: "2d" },
            { date: "Mar 13", time: "12:05", rating: 3, interval: "4d" },
            { date: "Mar 17", time: "08:15", rating: 4, interval: "14d" },
          ]}
          reflection="Sort each string as key for the hashmap. I kept trying to compare characters one by one — just sort and group."
          currentInterval={14}
          phase="review"
          onRate={() => setShowDialog(false)}
          onClose={() => setShowDialog(false)}
          onSaveReflection={() => {}}
        />
      )}
    </div>
  );
}

// ── Step 5: Full Journey ───────────────────────────────────────────
function Step5FullJourney() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Complete lifecycle of a problem from first solve to mastery.
      </p>
      <div className="rounded-lg border bg-card p-4">
        {([
          { day: "Day 1", action: "First solve (with help)", detail: "No rating — auto recall tomorrow", phase: "first", color: "bg-purple-400 border-purple-400" },
          { day: "Day 2", action: "Active recall — rate 2 (Struggled)", detail: "Still learning → try again in 2d", phase: "learning", color: "bg-orange-400 border-orange-400" },
          { day: "Day 4", action: "Re-solve — rate 3 (Slow)", detail: "Graduate to review → next in 4d", phase: "review", color: "bg-yellow-400 border-yellow-400" },
          { day: "Day 8", action: "Review — rate 4 (Good)", detail: "Interval grows → next in 14d", phase: "review", color: "bg-blue-400 border-blue-400" },
          { day: "Day 22", action: "Review — rate 5 (Nailed)", detail: "Interval grows → next in 35d", phase: "review", color: "bg-green-400 border-green-400" },
          { day: "Day 57", action: "Review — rate 4 (Good)", detail: "Interval 60d+ → Mastered!", phase: "mastered", color: "bg-green-400 border-green-400" },
        ]).map((step, i, arr) => (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={cn("h-3 w-3 rounded-full border-2 mt-1.5", step.color)} />
              {i < arr.length - 1 && <div className="w-0.5 flex-1 bg-muted-foreground/20 my-1" />}
            </div>
            <div className="pb-4 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground w-14">{step.day}</span>
                <span className="text-sm">{step.action}</span>
                <span className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                  step.phase === "first" && "bg-purple-600/20 text-purple-400",
                  step.phase === "learning" && "bg-orange-600/20 text-orange-400",
                  step.phase === "review" && "bg-blue-600/20 text-blue-400",
                  step.phase === "mastered" && "bg-green-600/20 text-green-400",
                )}>
                  {step.phase}
                </span>
              </div>
              <p className="ml-14 mt-0.5 text-xs text-muted-foreground">{step.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────

const STEPS = [
  { title: "First Solve", component: Step1FirstSolve },
  { title: "Learning Phase", component: Step2Learning },
  { title: "Rating Scale", component: Step3ReviewPhase },
  { title: "Review Dialog", component: Step4Dialog },
  { title: "Full Journey", component: Step5FullJourney },
];

export default function SpacedRepetitionDemoPage() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Spaced Repetition Demo</h1>
        <p className="text-muted-foreground mt-1">
          Interactive walkthrough — two-phase system with 5-point rating scale.
        </p>
      </div>

      {/* Step navigation */}
      <div className="flex flex-wrap gap-1">
        {STEPS.map((step, i) => (
          <button
            key={i}
            onClick={() => setActiveStep(i)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              activeStep === i
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background/20 text-xs">
              {i + 1}
            </span>
            {step.title}
          </button>
        ))}
      </div>

      {/* Active step */}
      <div className="min-h-[350px]">
        {(() => {
          const StepComponent = STEPS[activeStep].component;
          return <StepComponent />;
        })()}
      </div>

      {/* Navigation arrows */}
      <div className="flex justify-between">
        <button
          onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
          disabled={activeStep === 0}
          className={cn(
            "flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            activeStep === 0
              ? "text-muted-foreground/40 cursor-not-allowed"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <ChevronRight className="h-4 w-4 rotate-180" /> Previous
        </button>
        <button
          onClick={() => setActiveStep((s) => Math.min(STEPS.length - 1, s + 1))}
          disabled={activeStep === STEPS.length - 1}
          className={cn(
            "flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            activeStep === STEPS.length - 1
              ? "text-muted-foreground/40 cursor-not-allowed"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
