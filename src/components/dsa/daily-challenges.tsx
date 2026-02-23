"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { DifficultyBadge } from "./difficulty-badge";
import {
  DAILY_PROBLEM_POOL,
  type DailyProblem,
} from "@/data/daily-problems";
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

// Filter pools (done once, outside component)
const EASY_POOL = DAILY_PROBLEM_POOL.filter((p) => p.difficulty === "Easy");
const MED_POOL = DAILY_PROBLEM_POOL.filter((p) => p.difficulty === "Medium");

const TIME_LIMIT: Record<string, number> = {
  easy: 20 * 60,
  medium: 40 * 60,
};

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

let originalFavicon: string | null = null;
let originalTitle: string | null = null;

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

interface StopwatchState {
  elapsed: number;
  running: boolean;
  startedAt: number | null;
  notified: boolean;
}

function getStorageKey(difficulty: string): string {
  const day = getDayOfYear();
  const year = new Date().getFullYear();
  return `daily-sw-${year}-${day}-${difficulty}`;
}

function loadState(difficulty: string): StopwatchState {
  const fallback: StopwatchState = { elapsed: 0, running: false, startedAt: null, notified: false };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(getStorageKey(difficulty));
    if (raw) {
      const saved = JSON.parse(raw) as StopwatchState;
      if (saved.running && saved.startedAt) {
        saved.elapsed += Math.floor((Date.now() - saved.startedAt) / 1000);
        saved.startedAt = Date.now();
      }
      return saved;
    }
  } catch { /* ignore */ }
  return fallback;
}

function saveState(difficulty: string, state: StopwatchState) {
  try {
    localStorage.setItem(getStorageKey(difficulty), JSON.stringify(state));
  } catch { /* ignore */ }
}

function useStopwatch(difficulty: string) {
  const [state, setState] = useState<StopwatchState>(() => loadState(difficulty));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const limit = TIME_LIMIT[difficulty] ?? 20 * 60;

  const persist = useCallback((s: StopwatchState) => {
    saveState(difficulty, s);
  }, [difficulty]);

  useEffect(() => {
    setState(loadState(difficulty));
  }, [difficulty]);

  useEffect(() => {
    if (state.running) {
      intervalRef.current = setInterval(() => {
        setState((prev) => {
          const next = { ...prev, elapsed: prev.elapsed + 1 };
          // Play sound once when hitting the time limit
          if (!prev.notified && next.elapsed >= limit) {
            next.notified = true;
            playNotificationSound();
            setNotificationFavicon();
          }
          persist(next);
          return next;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.running, persist, limit]);

  const toggle = useCallback(() => {
    setState((prev) => {
      const next = {
        ...prev,
        running: !prev.running,
        startedAt: !prev.running ? Date.now() : null,
      };
      persist(next);
      return next;
    });
  }, [persist]);

  const reset = useCallback(() => {
    const next: StopwatchState = { elapsed: 0, running: false, startedAt: null, notified: false };
    setState(next);
    persist(next);
    restoreFavicon();
    if (originalTitle) document.title = originalTitle;
  }, [persist]);

  const overTime = state.elapsed >= limit;

  // Update page title with minutes
  useEffect(() => {
    if (state.running || overTime) {
      if (!originalTitle) originalTitle = document.title;
      const mins = Math.floor(state.elapsed / 60);
      document.title = `${mins}m — ${originalTitle}`;
    }
    return () => {
      if (!state.running && originalTitle) {
        document.title = originalTitle;
      }
    };
  }, [state.elapsed, state.running, overTime]);

  return { elapsed: state.elapsed, running: state.running, overTime, toggle, reset };
}

export function DailyChallenges() {
  const dayOfYear = getDayOfYear();
  const easyPick = EASY_POOL.length > 0 ? EASY_POOL[dayOfYear % EASY_POOL.length] : null;
  const medPick = MED_POOL.length > 0 ? MED_POOL[dayOfYear % MED_POOL.length] : null;

  if (!easyPick && !medPick) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {easyPick && (
        <ChallengeCard
          label="Easy Warmup"
          subtitle="Daily warmup challenge"
          icon={<Zap className="h-4 w-4 text-green-400" />}
          accentColor="green"
          problem={easyPick}
          difficulty="easy"
        />
      )}
      {medPick && (
        <ChallengeCard
          label="Medium Grind"
          subtitle="Push your limits"
          icon={<Flame className="h-4 w-4 text-purple-400" />}
          accentColor="purple"
          problem={medPick}
          difficulty="medium"
        />
      )}
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
}

function ChallengeCard({
  label,
  subtitle,
  icon,
  accentColor,
  problem,
  difficulty,
}: ChallengeCardProps) {
  const sw = useStopwatch(difficulty);

  return (
    <div className="rounded-xl border bg-card p-5 space-y-3">
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
      <div className="flex items-center gap-2 pt-1">
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
          className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Mark as done"
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
    <div className="flex items-center gap-1">
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
  );
}
