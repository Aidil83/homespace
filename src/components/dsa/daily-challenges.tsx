"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { DifficultyBadge } from "./difficulty-badge";
import { type DailyProblem } from "@/data/daily-problems";
import {
  Code,
  CheckCircle,
  StickyNote,
  SkipForward,
  Zap,
  Flame,
  ExternalLink,
  Play,
  Pause,
  RotateCcw,
  Clock,
} from "lucide-react";
import {
  formatTime,
  type StopwatchState,
  loadState,
  saveState,
  computeLiveElapsed,
} from "@/lib/stopwatch";

// Shared daily problems endpoint (synced between users)
const SHARED_DAILY_URL = "https://mgymlcatbtelmsmzxjnl.supabase.co/rest/v1/daily_problems";
const SHARED_DAILY_KEY = "sb_publishable_MMvk0Glh9zo1SrG-Spn-Hg_pxv7VsxV";

interface SharedDailyRow {
  leetcode_number: number;
  name: string;
  difficulty: string;
  url: string;
  topic: string;
}

function sharedRowToProblem(row: SharedDailyRow): DailyProblem {
  const slug = row.url.replace(/.*\/problems\//, "").replace(/\/$/, "");
  return {
    id: slug,
    name: row.name,
    number: row.leetcode_number,
    difficulty: row.difficulty as DailyProblem["difficulty"],
    url: row.url,
    topic: row.topic,
  };
}

const TIME_LIMIT: Record<string, number> = {
  easy: 20 * 60,
  medium: 40 * 60,
};

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
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };
    playTone(880, 0, 0.15);
    playTone(1100, 0.18, 0.2);
    setTimeout(() => ctx.close(), 1000);
  } catch { /* audio not available */ }
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

      // Red notification dot (top-right)
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
  } catch { /* ignore */ }
}

function restoreFavicon() {
  try {
    if (!originalFavicon) return;
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (link) link.href = originalFavicon;
  } catch { /* ignore */ }
}


function useStopwatch(difficulty: string) {
  const [state, setState] = useState<StopwatchState>(() => loadState(difficulty));
  const [, setTick] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const limit = TIME_LIMIT[difficulty] ?? 20 * 60;

  const persist = useCallback((s: StopwatchState) => {
    saveState(difficulty, s);
  }, [difficulty]);

  useEffect(() => {
    setState(loadState(difficulty));
  }, [difficulty]);

  // Compute actual elapsed from wall clock — immune to setInterval throttling
  const liveElapsed = computeLiveElapsed(state);

  // Interval only triggers re-renders so liveElapsed stays fresh
  useEffect(() => {
    if (state.running) {
      intervalRef.current = setInterval(() => {
        setTick((t) => t + 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.running]);

  // Notification when hitting the time limit
  useEffect(() => {
    if (!state.notified && liveElapsed >= limit) {
      setState((prev) => {
        const next = { ...prev, notified: true };
        persist(next);
        return next;
      });
      playNotificationSound();
      setNotificationFavicon();
    }
  }, [liveElapsed, limit, state.notified, persist]);

  const toggle = useCallback(() => {
    setState((prev) => {
      if (prev.running) {
        // Stopping: consolidate wall-clock elapsed into base
        const total = prev.startedAt
          ? prev.elapsed + Math.floor((Date.now() - prev.startedAt) / 1000)
          : prev.elapsed;
        const next = { ...prev, elapsed: total, running: false, startedAt: null };
        persist(next);
        return next;
      } else {
        // Starting: record wall-clock start, keep current elapsed as base
        const next = { ...prev, running: true, startedAt: Date.now() };
        persist(next);
        return next;
      }
    });
  }, [persist]);

  const reset = useCallback(() => {
    const next: StopwatchState = { elapsed: 0, running: false, startedAt: null, notified: false };
    setState(next);
    persist(next);
    restoreFavicon();
    if (activeTitleOwner === difficulty && originalTitle) {
      activeTitleOwner = null;
      document.title = originalTitle;
    }
  }, [persist, difficulty]);

  const overTime = liveElapsed >= limit;

  // Update page title with minutes — only one stopwatch owns the title at a time
  useEffect(() => {
    if (state.running) {
      if (!originalTitle) originalTitle = document.title;
      activeTitleOwner = difficulty;
      const mins = Math.floor(liveElapsed / 60);
      document.title = `${mins}m — ${originalTitle}`;
    } else if (activeTitleOwner === difficulty) {
      activeTitleOwner = null;
      if (originalTitle) document.title = originalTitle;
    }
  }, [liveElapsed, state.running, difficulty]);

  return { elapsed: liveElapsed, running: state.running, overTime, toggle, reset };
}

interface CompletionMap {
  [difficulty: string]: { problemId: string; elapsedSec: number };
}

const DIFFICULTY_CONFIG: Record<string, { label: string; subtitle: string; icon: React.ReactNode; accentColor: "green" | "purple" | "red" }> = {
  Easy: { label: "Easy Warmup", subtitle: "Daily warmup challenge", icon: <Zap className="h-4 w-4 text-green-400" />, accentColor: "green" },
  Medium: { label: "Medium Grind", subtitle: "Push your limits", icon: <Flame className="h-4 w-4 text-purple-400" />, accentColor: "purple" },
  Hard: { label: "Hard Challenge", subtitle: "Test your mastery", icon: <Flame className="h-4 w-4 text-red-400" />, accentColor: "red" },
};

export function DailyChallenges() {
  const [problems, setProblems] = useState<DailyProblem[]>([]);
  const [completions, setCompletions] = useState<CompletionMap>({});

  // Fetch daily problems from Supabase
  useEffect(() => {
    const now = new Date();
    const today = now.toLocaleDateString("en-CA", { timeZone: "America/Chicago" });
    fetch(`${SHARED_DAILY_URL}?date=eq.${today}&select=*`, {
      headers: { apikey: SHARED_DAILY_KEY },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: SharedDailyRow[]) => {
        if (rows.length > 0) {
          setProblems(rows.map(sharedRowToProblem));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/dsa/daily-challenge")
      .then((r) => (r.ok ? r.json() : {}))
      .then(setCompletions)
      .catch(() => {});
  }, []);

  const markDone = useCallback(async (difficulty: string, problemId: string, elapsedSec: number) => {
    setCompletions((prev) => ({ ...prev, [difficulty]: { problemId, elapsedSec } }));
    await fetch("/api/dsa/daily-challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ difficulty, problemId, elapsedSec }),
    });
  }, []);

  const unmarkDone = useCallback(async (difficulty: string) => {
    setCompletions((prev) => {
      const next = { ...prev };
      delete next[difficulty];
      return next;
    });
    await fetch("/api/dsa/daily-challenge", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ difficulty }),
    });
  }, []);

  if (problems.length === 0) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {problems.map((problem, i) => {
        const config = DIFFICULTY_CONFIG[problem.difficulty] ?? DIFFICULTY_CONFIG.Easy;
        const key = `${problem.difficulty.toLowerCase()}-${i}`;
        return (
          <ChallengeCard
            key={key}
            label={config.label}
            subtitle={config.subtitle}
            icon={config.icon}
            accentColor={config.accentColor === "red" ? "purple" : config.accentColor}
            problem={problem}
            difficulty={key}
            done={!!completions[key]}
            onMarkDone={markDone}
            onUnmarkDone={unmarkDone}
          />
        );
      })}
    </div>
  );
}

interface ChallengeCardProps {
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  accentColor: "green" | "purple";
  problem: DailyProblem;
  difficulty: string;
  done: boolean;
  onMarkDone: (difficulty: string, problemId: string, elapsedSec: number) => void;
  onUnmarkDone: (difficulty: string) => void;
}

function ChallengeCard({
  label,
  subtitle,
  icon,
  accentColor,
  problem,
  difficulty,
  done,
  onMarkDone,
  onUnmarkDone,
}: ChallengeCardProps) {
  const sw = useStopwatch(difficulty);

  const toggleDone = () => {
    if (done) {
      onUnmarkDone(difficulty);
    } else {
      onMarkDone(difficulty, problem.id, sw.elapsed);
    }
  };

  return (
    <div className={cn("rounded-xl border bg-card p-5 space-y-3", done && "border-green-600/40 opacity-60")}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          {icon}
          <div>
            <h3 className="font-semibold text-sm leading-tight">{label}</h3>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Stopwatch sw={sw} accentColor={accentColor} />
          <DifficultyBadge difficulty={problem.difficulty.toLowerCase()} />
        </div>
      </div>

      {/* Problem info */}
      <div>
        <a
          href={problem.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-medium text-sm hover:text-primary hover:underline transition-colors"
        >
          #{problem.number}. {problem.name}
          <ExternalLink className="h-3 w-3 opacity-50" />
        </a>
        <p className="mt-1 text-xs text-muted-foreground">{problem.topic}</p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <a
          href={problem.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            accentColor === "green"
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-purple-600 text-white hover:bg-purple-700"
          )}
        >
          <Zap className="h-3 w-3" />
          Solve
        </a>
        <a
          href={problem.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md bg-purple-600/20 px-3 py-1.5 text-xs font-medium text-purple-400 transition-colors hover:bg-purple-600/30"
        >
          <Code className="h-3 w-3" />
          Code
        </a>
        <button
          onClick={toggleDone}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition-colors",
            done
              ? "border-green-600/50 bg-green-600/20 text-green-400"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
          title={done ? "Mark as not done" : "Mark as done"}
        >
          <CheckCircle className="h-3 w-3" />
          Done
        </button>
        <button
          className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Notes"
        >
          <StickyNote className="h-3 w-3" />
          Notes
        </button>
        <button
          className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Skip"
        >
          <SkipForward className="h-3 w-3" />
          Skip
        </button>
      </div>
    </div>
  );
}

interface StopwatchProps {
  sw: ReturnType<typeof useStopwatch>;
  accentColor: "green" | "purple";
}

function Stopwatch({ sw, accentColor }: StopwatchProps) {
  return (
    <div className="group/sw flex items-center gap-1">
      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-mono tabular-nums",
          sw.overTime
            ? "bg-red-600/20 text-red-400"
            : sw.running
              ? accentColor === "green"
                ? "bg-green-600/20 text-green-400"
                : "bg-purple-600/20 text-purple-400"
              : "bg-muted text-muted-foreground"
        )}
      >
        <Clock className="h-3 w-3" />
        {formatTime(sw.elapsed)}
      </div>
      <div className={cn(
        "flex items-center gap-0.5 transition-opacity",
        sw.running ? "opacity-100" : "opacity-0 group-hover/sw:opacity-100"
      )}>
        <button
          onClick={sw.toggle}
          className={cn(
            "rounded-md p-1 transition-colors",
            sw.running
              ? "text-yellow-400 hover:bg-yellow-600/20"
              : "text-green-400 hover:bg-green-600/20"
          )}
          title={sw.running ? "Pause" : "Start"}
        >
          {sw.running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>
        <button
          onClick={sw.reset}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Reset"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
