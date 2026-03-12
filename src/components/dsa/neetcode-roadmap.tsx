"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { DifficultyBadge } from "./difficulty-badge";
import {
  NEETCODE_TOPICS,
  type NeetcodeProblem,
  type NeetcodeTopic,
} from "@/data/neetcode-150";
import {
  ExternalLink,
  Play,
  Pause,
  RotateCcw,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { formatTime, type StopwatchState, computeLiveElapsed } from "@/lib/stopwatch";

// ── Time limits per difficulty ─────────────────────────────────────
const TIME_LIMIT: Record<string, number> = {
  Easy: 20 * 60,
  Medium: 40 * 60,
  Hard: 60 * 60,
};

// ── Notification helpers (same as daily-challenges) ────────────────
let originalFavicon: string | null = null;
let originalTitle: string | null = null;
let activeTitleOwner: string | null = null;

function playNotificationSound() {
  try {
    const ctx = new AudioContext();
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + start + duration
      );
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };
    playTone(880, 0, 0.15);
    playTone(1100, 0.18, 0.2);
    setTimeout(() => ctx.close(), 1000);
  } catch {
    /* audio not available */
  }
}

function setNotificationFavicon() {
  try {
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) return;
    if (!originalFavicon) originalFavicon = link.href;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const size = 64;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, size, size);
      ctx.beginPath();
      ctx.arc(size - 14, 14, 13, 0, Math.PI * 2);
      ctx.fillStyle = "#ef4444";
      ctx.fill();
      ctx.strokeStyle = "#1a1a2e";
      ctx.lineWidth = 3;
      ctx.stroke();
      link.href = canvas.toDataURL("image/png");
    };
    img.src = link.href;
  } catch {
    /* ignore */
  }
}

function restoreFavicon() {
  try {
    if (!originalFavicon) return;
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (link) link.href = originalFavicon;
  } catch {
    /* ignore */
  }
}

// ── LocalStorage helpers keyed by problemId ────────────────────────
function swKey(problemId: string) {
  return `neetcode-sw-${problemId}`;
}

function loadSwState(problemId: string): StopwatchState {
  const fallback: StopwatchState = {
    elapsed: 0,
    running: false,
    startedAt: null,
    notified: false,
  };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(swKey(problemId));
    if (raw) {
      const saved = JSON.parse(raw) as StopwatchState;
      if (saved.running && saved.startedAt) {
        saved.elapsed += Math.floor((Date.now() - saved.startedAt) / 1000);
        saved.startedAt = Date.now();
      }
      return saved;
    }
  } catch {
    /* ignore */
  }
  return fallback;
}

function saveSwState(problemId: string, state: StopwatchState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(swKey(problemId), JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

// ── Per-problem stopwatch hook ─────────────────────────────────────
function useNeetcodeStopwatch(
  problemId: string,
  difficulty: string,
  onPause?: (elapsedSec: number) => void
) {
  const [state, setState] = useState<StopwatchState>(() =>
    loadSwState(problemId)
  );
  const [, setTick] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const limit = TIME_LIMIT[difficulty] ?? 40 * 60;
  const onPauseRef = useRef(onPause);
  useEffect(() => {
    onPauseRef.current = onPause;
  }, [onPause]);

  const persist = useCallback(
    (s: StopwatchState) => saveSwState(problemId, s),
    [problemId]
  );

  const liveElapsed = computeLiveElapsed(state);

  useEffect(() => {
    if (state.running) {
      intervalRef.current = setInterval(() => setTick((t) => t + 1), 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.running]);

  // Notification at time limit
  const notifiedRef = useRef(state.notified);
  useEffect(() => {
    if (!notifiedRef.current && liveElapsed >= limit) {
      notifiedRef.current = true;
      // Persist notified flag to localStorage
      persist({ ...state, notified: true });
      playNotificationSound();
      setNotificationFavicon();
    }
  }, [liveElapsed, limit, state, persist]);

  // Page title when running
  useEffect(() => {
    if (state.running) {
      if (!originalTitle) originalTitle = document.title;
      activeTitleOwner = problemId;
      const mins = Math.floor(liveElapsed / 60);
      document.title = `${mins}m \u2014 ${originalTitle}`;
    } else if (activeTitleOwner === problemId) {
      activeTitleOwner = null;
      if (originalTitle) document.title = originalTitle;
    }
  }, [liveElapsed, state.running, problemId]);

  const toggle = useCallback(() => {
    setState((prev) => {
      if (prev.running) {
        const total = prev.startedAt
          ? prev.elapsed + Math.floor((Date.now() - prev.startedAt) / 1000)
          : prev.elapsed;
        const next = { ...prev, elapsed: total, running: false, startedAt: null };
        persist(next);
        // Defer onPause to avoid setState-during-render
        queueMicrotask(() => onPauseRef.current?.(total));
        return next;
      } else {
        const next = { ...prev, running: true, startedAt: Date.now() };
        persist(next);
        return next;
      }
    });
  }, [persist]);

  const reset = useCallback(() => {
    const next: StopwatchState = {
      elapsed: 0,
      running: false,
      startedAt: null,
      notified: false,
    };
    setState(next);
    notifiedRef.current = false;
    persist(next);
    restoreFavicon();
    if (activeTitleOwner === problemId && originalTitle) {
      activeTitleOwner = null;
      document.title = originalTitle;
    }
  }, [persist, problemId]);

  /** Restore elapsed from DB value (on initial load) */
  const setElapsedFromDb = useCallback(
    (sec: number) => {
      setState((prev) => {
        if (prev.elapsed > 0 || prev.running) return prev; // localStorage takes priority
        const next = { ...prev, elapsed: sec };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const overTime = liveElapsed >= limit;

  return { elapsed: liveElapsed, running: state.running, overTime, toggle, reset, setElapsedFromDb };
}

// ── Progress types ─────────────────────────────────────────────────
interface ProgressEntry {
  elapsedSec: number;
  completed: boolean;
}

type ProgressMap = Record<string, ProgressEntry>;

// ── Main component ─────────────────────────────────────────────────
export function NeetcodeRoadmap() {
  const [progress, setProgress] = useState<ProgressMap>({});
  const [loaded, setLoaded] = useState(false);

  // Fetch progress from DB on mount
  useEffect(() => {
    fetch("/api/dsa/neetcode-progress")
      .then((r) => (r.ok ? r.json() : {}))
      .then((data: ProgressMap) => {
        setProgress(data);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const saveProgress = useCallback(
    async (problemId: string, elapsedSec: number, completed?: boolean) => {
      const entry: ProgressEntry = {
        elapsedSec,
        completed: completed ?? progress[problemId]?.completed ?? false,
      };
      setProgress((prev) => ({ ...prev, [problemId]: entry }));
      await fetch("/api/dsa/neetcode-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, elapsedSec, completed: entry.completed }),
      });
    },
    [progress]
  );

  const toggleCompleted = useCallback(
    async (problemId: string, elapsedSec: number) => {
      const current = progress[problemId]?.completed ?? false;
      const next = !current;
      setProgress((prev) => ({
        ...prev,
        [problemId]: { elapsedSec, completed: next },
      }));
      await fetch("/api/dsa/neetcode-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, elapsedSec, completed: next }),
      });
    },
    [progress]
  );

  const resetTopic = useCallback(
    async (topic: NeetcodeTopic) => {
      const problemIds = topic.problems.map((p) => p.id);
      // Clear local state
      setProgress((prev) => {
        const next = { ...prev };
        for (const id of problemIds) {
          if (next[id]) {
            next[id] = { elapsedSec: 0, completed: false };
          }
        }
        return next;
      });
      // Clear localStorage stopwatch states
      for (const id of problemIds) {
        localStorage.removeItem(swKey(id));
      }
      // Persist to DB
      await fetch("/api/dsa/neetcode-progress", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemIds }),
      });
    },
    []
  );

  const totalCompleted = Object.values(progress).filter((p) => p.completed).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">NeetCode 150</h2>
          <p className="text-sm text-muted-foreground">
            {totalCompleted}/150 completed
          </p>
        </div>
        {/* Overall progress bar */}
        <div className="flex items-center gap-3">
          <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-green-500 transition-all"
              style={{ width: `${(totalCompleted / 150) * 100}%` }}
            />
          </div>
          <span className="text-xs tabular-nums text-muted-foreground">
            {Math.round((totalCompleted / 150) * 100)}%
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 items-start">
        {NEETCODE_TOPICS.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            progress={progress}
            loaded={loaded}
            onSaveProgress={saveProgress}
            onToggleCompleted={toggleCompleted}
            onResetTopic={resetTopic}
          />
        ))}
      </div>
    </div>
  );
}

// ── Topic card ─────────────────────────────────────────────────────
interface TopicCardProps {
  topic: NeetcodeTopic;
  progress: ProgressMap;
  loaded: boolean;
  onSaveProgress: (problemId: string, elapsedSec: number, completed?: boolean) => Promise<void>;
  onToggleCompleted: (problemId: string, elapsedSec: number) => Promise<void>;
  onResetTopic: (topic: NeetcodeTopic) => Promise<void>;
}

function TopicCard({ topic, progress, loaded, onSaveProgress, onToggleCompleted, onResetTopic }: TopicCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const completedCount = topic.problems.filter(
    (p) => progress[p.id]?.completed
  ).length;

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex w-full items-center justify-between">
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex flex-1 items-center gap-2 text-left"
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <h3 className="font-semibold text-sm">{topic.name}</h3>
        </button>
        <div className="flex items-center gap-2">
          {completedCount > 0 && expanded && (
            confirmReset ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    onResetTopic(topic);
                    setConfirmReset(false);
                  }}
                  className="rounded px-1.5 py-0.5 text-[11px] font-medium text-red-400 hover:bg-red-600/20 transition-colors"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="rounded px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="rounded p-0.5 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                title={`Reset all ${topic.name} progress`}
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )
          )}
          <span className="text-xs text-muted-foreground">
            {completedCount}/{topic.problems.length}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-2 mb-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-green-500 transition-all"
          style={{
            width: `${topic.problems.length > 0 ? (completedCount / topic.problems.length) * 100 : 0}%`,
          }}
        />
      </div>

      {expanded && (
        <div className="space-y-1">
          {topic.problems.map((problem) => (
            <ProblemRow
              key={problem.id}
              problem={problem}
              progressEntry={progress[problem.id]}
              loaded={loaded}
              onSaveProgress={onSaveProgress}
              onToggleCompleted={onToggleCompleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Problem row ────────────────────────────────────────────────────
interface ProblemRowProps {
  problem: NeetcodeProblem;
  progressEntry?: ProgressEntry;
  loaded: boolean;
  onSaveProgress: (problemId: string, elapsedSec: number, completed?: boolean) => Promise<void>;
  onToggleCompleted: (problemId: string, elapsedSec: number) => Promise<void>;
}

function ProblemRow({
  problem,
  progressEntry,
  loaded,
  onSaveProgress,
  onToggleCompleted,
}: ProblemRowProps) {
  const handlePause = useCallback(
    (elapsedSec: number) => {
      onSaveProgress(problem.id, elapsedSec);
    },
    [problem.id, onSaveProgress]
  );

  const sw = useNeetcodeStopwatch(problem.id, problem.difficulty, handlePause);
  const isCompleted = progressEntry?.completed ?? false;

  // Seed elapsed from DB when progress loads (only if localStorage is empty)
  useEffect(() => {
    if (loaded && progressEntry?.elapsedSec) {
      sw.setElapsedFromDb(progressEntry.elapsedSec);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  const handleReset = useCallback(() => {
    sw.reset();
    onSaveProgress(problem.id, 0, false);
  }, [sw, problem.id, onSaveProgress]);

  const handleToggleDone = useCallback(() => {
    onToggleCompleted(problem.id, sw.elapsed);
  }, [onToggleCompleted, problem.id, sw.elapsed]);

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm",
        isCompleted && "opacity-60"
      )}
    >
      {/* Done button */}
      <button
        onClick={handleToggleDone}
        className={cn(
          "shrink-0 rounded p-0.5 transition-colors",
          isCompleted
            ? "text-green-400"
            : "text-muted-foreground/40 hover:text-muted-foreground"
        )}
        title={isCompleted ? "Mark incomplete" : "Mark complete"}
      >
        <CheckCircle className="h-4 w-4" />
      </button>

      {/* Problem link */}
      <a
        href={problem.url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex-1 truncate hover:text-primary hover:underline transition-colors",
          isCompleted && "line-through"
        )}
      >
        {problem.name}
        <ExternalLink className="ml-1 inline h-3 w-3 opacity-40" />
      </a>

      {/* Difficulty badge */}
      <DifficultyBadge difficulty={problem.difficulty.toLowerCase()} className="shrink-0" />

      {/* Inline stopwatch */}
      <div className="group/sw flex shrink-0 items-center gap-0.5">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-mono tabular-nums",
            sw.overTime
              ? "bg-red-600/20 text-red-400"
              : sw.running
                ? "bg-blue-600/20 text-blue-400"
                : "text-muted-foreground"
          )}
        >
          <Clock className="h-3 w-3" />
          {formatTime(sw.elapsed)}
        </span>
        <div className={cn(
          "flex items-center gap-0.5 transition-opacity",
          sw.running ? "opacity-100" : "opacity-0 group-hover/sw:opacity-100"
        )}>
          <button
            onClick={sw.toggle}
            className={cn(
              "rounded p-0.5 transition-colors",
              sw.running
                ? "text-yellow-400 hover:bg-yellow-600/20"
                : "text-green-400 hover:bg-green-600/20"
            )}
            title={sw.running ? "Pause" : "Start"}
          >
            {sw.running ? (
              <Pause className="h-3 w-3" />
            ) : (
              <Play className="h-3 w-3" />
            )}
          </button>
          <button
            onClick={handleReset}
            className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Reset"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
