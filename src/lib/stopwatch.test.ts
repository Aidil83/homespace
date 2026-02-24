import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  formatTime,
  computeLiveElapsed,
  toggleState,
  resetState,
  loadState,
  saveState,
  type StopwatchState,
} from "./stopwatch";

describe("formatTime", () => {
  it("formats seconds only", () => {
    expect(formatTime(5)).toBe("00:05");
    expect(formatTime(0)).toBe("00:00");
    expect(formatTime(59)).toBe("00:59");
  });

  it("formats minutes and seconds", () => {
    expect(formatTime(60)).toBe("01:00");
    expect(formatTime(90)).toBe("01:30");
    expect(formatTime(600)).toBe("10:00");
  });

  it("formats hours, minutes, and seconds", () => {
    expect(formatTime(3600)).toBe("1:00:00");
    expect(formatTime(3661)).toBe("1:01:01");
    expect(formatTime(7200)).toBe("2:00:00");
  });
});

describe("computeLiveElapsed", () => {
  it("returns base elapsed when not running", () => {
    const state: StopwatchState = { elapsed: 120, running: false, startedAt: null, notified: false };
    expect(computeLiveElapsed(state)).toBe(120);
  });

  it("returns base elapsed when running but no startedAt", () => {
    const state: StopwatchState = { elapsed: 120, running: true, startedAt: null, notified: false };
    expect(computeLiveElapsed(state)).toBe(120);
  });

  it("computes wall-clock elapsed while running", () => {
    const startedAt = 1000000;
    const now = 1600000; // 600s later
    const state: StopwatchState = { elapsed: 30, running: true, startedAt, notified: false };
    expect(computeLiveElapsed(state, now)).toBe(630); // 30 base + 600 delta
  });

  it("is immune to setInterval throttling — reports real wall-clock time", () => {
    // Simulate: timer started 10 minutes ago, but if setInterval was throttled
    // only ~10 ticks would have fired. computeLiveElapsed doesn't care about ticks.
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    const state: StopwatchState = { elapsed: 0, running: true, startedAt: tenMinutesAgo, notified: false };
    const result = computeLiveElapsed(state);
    // Should be ~600 seconds, not dependent on number of interval ticks
    expect(result).toBeGreaterThanOrEqual(599);
    expect(result).toBeLessThanOrEqual(601);
  });

  it("correctly adds to base elapsed from previous runs", () => {
    // User ran for 5 minutes, paused, then started again 2 minutes ago
    const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
    const state: StopwatchState = {
      elapsed: 300, // 5 min from previous run
      running: true,
      startedAt: twoMinutesAgo,
      notified: false,
    };
    const result = computeLiveElapsed(state);
    expect(result).toBeGreaterThanOrEqual(419); // 300 + ~120
    expect(result).toBeLessThanOrEqual(421);
  });
});

describe("toggleState", () => {
  it("starts from paused state", () => {
    const prev: StopwatchState = { elapsed: 50, running: false, startedAt: null, notified: false };
    const now = 5000000;
    const next = toggleState(prev, now);
    expect(next.running).toBe(true);
    expect(next.startedAt).toBe(now);
    expect(next.elapsed).toBe(50); // base preserved
  });

  it("pauses from running state and consolidates elapsed", () => {
    const startedAt = 1000000;
    const now = 1300000; // 300s later
    const prev: StopwatchState = { elapsed: 50, running: true, startedAt, notified: false };
    const next = toggleState(prev, now);
    expect(next.running).toBe(false);
    expect(next.startedAt).toBeNull();
    expect(next.elapsed).toBe(350); // 50 base + 300 delta
  });

  it("handles pause-resume-pause cycle correctly", () => {
    // Start at t=0 with 0 base
    let state: StopwatchState = { elapsed: 0, running: false, startedAt: null, notified: false };

    // Start at t=1000
    state = toggleState(state, 1000);
    expect(state.running).toBe(true);
    expect(state.startedAt).toBe(1000);

    // Pause at t=61000 (60s later)
    state = toggleState(state, 61000);
    expect(state.running).toBe(false);
    expect(state.elapsed).toBe(60);

    // Resume at t=100000
    state = toggleState(state, 100000);
    expect(state.running).toBe(true);
    expect(state.elapsed).toBe(60); // base preserved
    expect(state.startedAt).toBe(100000);

    // Pause at t=400000 (300s later)
    state = toggleState(state, 400000);
    expect(state.running).toBe(false);
    expect(state.elapsed).toBe(360); // 60 + 300
  });
});

describe("resetState", () => {
  it("returns a clean state", () => {
    const state = resetState();
    expect(state).toEqual({ elapsed: 0, running: false, startedAt: null, notified: false });
  });
});

describe("loadState / saveState", () => {
  let storage: Storage;

  beforeEach(() => {
    const store: Record<string, string> = {};
    storage = {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
      removeItem: vi.fn((key: string) => { delete store[key]; }),
      clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
      get length() { return Object.keys(store).length; },
      key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
    };
  });

  it("returns fallback when no saved data", () => {
    const state = loadState("easy", storage);
    expect(state).toEqual({ elapsed: 0, running: false, startedAt: null, notified: false });
  });

  it("loads paused state correctly", () => {
    const saved: StopwatchState = { elapsed: 120, running: false, startedAt: null, notified: false };
    saveState("easy", saved, storage);
    const loaded = loadState("easy", storage);
    expect(loaded.elapsed).toBe(120);
    expect(loaded.running).toBe(false);
  });

  it("reconciles running timer on load — adds wall-clock delta", () => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const saved: StopwatchState = {
      elapsed: 0, // base is 0 (just started, no previous runs)
      running: true,
      startedAt: fiveMinutesAgo,
      notified: false,
    };
    saveState("easy", saved, storage);

    const loaded = loadState("easy", storage);
    // Should have ~300s elapsed (5 minutes of wall-clock time)
    expect(loaded.elapsed).toBeGreaterThanOrEqual(299);
    expect(loaded.elapsed).toBeLessThanOrEqual(301);
    expect(loaded.running).toBe(true);
    // startedAt should be updated to now
    expect(loaded.startedAt).toBeGreaterThan(fiveMinutesAgo);
  });

  it("does not double-count — base elapsed is preserved correctly after load", () => {
    // Simulate: timer ran for 5 min (base=300), then started again 2 min ago
    const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
    const saved: StopwatchState = {
      elapsed: 300, // 5 min from previous run
      running: true,
      startedAt: twoMinutesAgo,
      notified: false,
    };
    saveState("easy", saved, storage);

    const loaded = loadState("easy", storage);
    // Should be 300 + ~120 = ~420
    expect(loaded.elapsed).toBeGreaterThanOrEqual(419);
    expect(loaded.elapsed).toBeLessThanOrEqual(421);

    // After load, computeLiveElapsed should NOT add extra time since startedAt was reset
    const live = computeLiveElapsed(loaded);
    // Should be approximately the same as loaded.elapsed (maybe +1s for execution time)
    expect(live - loaded.elapsed).toBeLessThanOrEqual(1);
  });
});
