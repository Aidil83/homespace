export interface StopwatchState {
  elapsed: number;
  running: boolean;
  startedAt: number | null;
  notified: boolean;
}

export function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function getStorageKey(difficulty: string): string {
  const day = getDayOfYear();
  const year = new Date().getFullYear();
  return `daily-sw-${year}-${day}-${difficulty}`;
}

export function loadState(difficulty: string, storage?: Storage): StopwatchState {
  const fallback: StopwatchState = { elapsed: 0, running: false, startedAt: null, notified: false };
  const store = storage ?? (typeof window !== "undefined" ? localStorage : null);
  if (!store) return fallback;
  try {
    const raw = store.getItem(getStorageKey(difficulty));
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

export function saveState(difficulty: string, state: StopwatchState, storage?: Storage) {
  const store = storage ?? (typeof window !== "undefined" ? localStorage : null);
  if (!store) return;
  try {
    store.setItem(getStorageKey(difficulty), JSON.stringify(state));
  } catch { /* ignore */ }
}

/**
 * Compute the live elapsed time from wall clock.
 * `elapsed` is the base time accumulated before the current run.
 * `startedAt` is the wall-clock timestamp when the current run began.
 */
export function computeLiveElapsed(state: StopwatchState, now: number = Date.now()): number {
  if (state.running && state.startedAt) {
    return state.elapsed + Math.floor((now - state.startedAt) / 1000);
  }
  return state.elapsed;
}

/**
 * Toggle the stopwatch. Returns the new state.
 */
export function toggleState(prev: StopwatchState, now: number = Date.now()): StopwatchState {
  if (prev.running) {
    // Stopping: consolidate wall-clock elapsed into base
    const total = prev.startedAt
      ? prev.elapsed + Math.floor((now - prev.startedAt) / 1000)
      : prev.elapsed;
    return { ...prev, elapsed: total, running: false, startedAt: null };
  } else {
    // Starting: record wall-clock start, keep current elapsed as base
    return { ...prev, running: true, startedAt: now };
  }
}

/**
 * Reset the stopwatch. Returns a clean state.
 */
export function resetState(): StopwatchState {
  return { elapsed: 0, running: false, startedAt: null, notified: false };
}
