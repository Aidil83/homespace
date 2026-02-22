"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  WEEKLY_SCHEDULE,
  getWorkoutForDate,
  type WorkoutType,
} from "@/components/gym/workout-data";

// --- Types ---

export interface SetEntry {
  weight: number | null;
  reps: number | null;
  completed: boolean;
}

export interface ExerciseLogEntry {
  exerciseName: string;
  sets: SetEntry[];
}

export interface GymStats {
  currentStreak: number;
  longestStreak: number;
  totalThisMonth: number;
  totalThisYear: number;
}

export interface ExerciseGoal {
  target1RM: number;
}

interface GymStorageData {
  attendance: string[]; // serialized Set
  logs: Record<string, ExerciseLogEntry[]>;
  goals: Record<string, ExerciseGoal>;
  notes: Record<string, string>;
}

// --- Utilities ---

export function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const STORAGE_KEY = "homespace-gym";

// Migrate old format entries (flat weight/reps) to new per-set format
function migrateEntry(entry: Record<string, unknown>): ExerciseLogEntry {
  // Old format: { exerciseName, weight, reps }
  // New format: { exerciseName, sets: SetEntry[] }
  if ("sets" in entry && Array.isArray(entry.sets)) {
    return entry as unknown as ExerciseLogEntry;
  }
  // Convert old format to single-set new format
  return {
    exerciseName: (entry.exerciseName as string) || "",
    sets: [
      {
        weight: (entry.weight as number) ?? null,
        reps: (entry.reps as number) ?? null,
        completed: (entry.weight != null || entry.reps != null),
      },
    ],
  };
}

function migrateLogs(
  logs: Record<string, Record<string, unknown>[]>
): Record<string, ExerciseLogEntry[]> {
  const migrated: Record<string, ExerciseLogEntry[]> = {};
  for (const [date, entries] of Object.entries(logs)) {
    migrated[date] = entries.map(migrateEntry);
  }
  return migrated;
}

function loadFromStorage(): GymStorageData {
  if (typeof window === "undefined") return { attendance: [], logs: {}, goals: {}, notes: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { attendance: [], logs: {}, goals: {}, notes: {} };
    const parsed = JSON.parse(raw);
    return {
      attendance: parsed.attendance || [],
      logs: migrateLogs(parsed.logs || {}),
      goals: parsed.goals || {},
      notes: parsed.notes || {},
    };
  } catch {
    return { attendance: [], logs: {}, goals: {}, notes: {} };
  }
}

function saveToStorage(data: GymStorageData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function isRestDay(date: Date): boolean {
  return WEEKLY_SCHEDULE[date.getDay()] === "rest";
}

function computeStats(attendance: Set<string>): GymStats {
  const today = new Date();
  const todayStr = toDateStr(today);
  const now = new Date(today);

  // Current streak: walk backward from today, skip rest days
  let currentStreak = 0;
  const cursor = new Date(now);
  if (isRestDay(cursor)) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (true) {
    if (isRestDay(cursor)) {
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }
    const ds = toDateStr(cursor);
    if (ds > todayStr) {
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }
    if (attendance.has(ds)) {
      currentStreak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  // Longest streak: scan all attended dates sorted
  const sortedDates = Array.from(attendance).sort();
  let longestStreak = 0;
  let streak = 0;
  for (let i = 0; i < sortedDates.length; i++) {
    streak++;
    if (i < sortedDates.length - 1) {
      const current = new Date(sortedDates[i] + "T00:00:00");
      const check = new Date(current);
      check.setDate(check.getDate() + 1);
      let consecutive = true;
      while (toDateStr(check) < sortedDates[i + 1]) {
        if (!isRestDay(check)) {
          consecutive = false;
          break;
        }
        check.setDate(check.getDate() + 1);
      }
      if (!consecutive) {
        longestStreak = Math.max(longestStreak, streak);
        streak = 0;
      }
    }
  }
  longestStreak = Math.max(longestStreak, streak);

  // This month
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  let totalThisMonth = 0;
  for (const d of attendance) {
    if (d.startsWith(monthPrefix)) totalThisMonth++;
  }

  // This year
  const yearPrefix = `${now.getFullYear()}-`;
  let totalThisYear = 0;
  for (const d of attendance) {
    if (d.startsWith(yearPrefix)) totalThisYear++;
  }

  return { currentStreak, longestStreak, totalThisMonth, totalThisYear };
}

// --- Hook ---

export function useGymStorage() {
  const [attendance, setAttendance] = useState<Set<string>>(new Set());
  const [logs, setLogs] = useState<Record<string, ExerciseLogEntry[]>>({});
  const [goals, setGoals] = useState<Record<string, ExerciseGoal>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount to avoid SSR mismatch
  useEffect(() => {
    const data = loadFromStorage();
    setAttendance(new Set(data.attendance));
    setLogs(data.logs);
    setGoals(data.goals);
    setNotes(data.notes);
    setHydrated(true);
  }, []);

  const persist = useCallback(
    (
      nextAttendance: Set<string>,
      nextLogs: Record<string, ExerciseLogEntry[]>,
      nextGoals: Record<string, ExerciseGoal>,
      nextNotes: Record<string, string>
    ) => {
      saveToStorage({
        attendance: Array.from(nextAttendance),
        logs: nextLogs,
        goals: nextGoals,
        notes: nextNotes,
      });
    },
    []
  );

  const toggleAttendance = useCallback(
    (dateStr: string) => {
      setAttendance((prev) => {
        const next = new Set(prev);
        if (next.has(dateStr)) {
          next.delete(dateStr);
        } else {
          next.add(dateStr);
        }
        setLogs((prevLogs) => {
          setGoals((prevGoals) => {
            setNotes((prevNotes) => {
              persist(next, prevLogs, prevGoals, prevNotes);
              return prevNotes;
            });
            return prevGoals;
          });
          return prevLogs;
        });
        return next;
      });
    },
    [persist]
  );

  const markAttended = useCallback(
    (dateStr: string) => {
      setAttendance((prev) => {
        if (prev.has(dateStr)) return prev;
        const next = new Set(prev);
        next.add(dateStr);
        setLogs((prevLogs) => {
          setGoals((prevGoals) => {
            setNotes((prevNotes) => {
              persist(next, prevLogs, prevGoals, prevNotes);
              return prevNotes;
            });
            return prevGoals;
          });
          return prevLogs;
        });
        return next;
      });
    },
    [persist]
  );

  const saveLog = useCallback(
    (dateStr: string, entries: ExerciseLogEntry[]) => {
      setLogs((prev) => {
        const next = { ...prev, [dateStr]: entries };
        setAttendance((prevAttendance) => {
          setGoals((prevGoals) => {
            setNotes((prevNotes) => {
              persist(prevAttendance, next, prevGoals, prevNotes);
              return prevNotes;
            });
            return prevGoals;
          });
          return prevAttendance;
        });
        return next;
      });
    },
    [persist]
  );

  const setGoal = useCallback(
    (exerciseName: string, target1RM: number) => {
      setGoals((prev) => {
        const next = { ...prev, [exerciseName]: { target1RM } };
        setAttendance((prevAttendance) => {
          setLogs((prevLogs) => {
            setNotes((prevNotes) => {
              persist(prevAttendance, prevLogs, next, prevNotes);
              return prevNotes;
            });
            return prevLogs;
          });
          return prevAttendance;
        });
        return next;
      });
    },
    [persist]
  );

  const getNote = useCallback(
    (dateStr: string): string => notes[dateStr] ?? "",
    [notes]
  );

  const saveNote = useCallback(
    (dateStr: string, text: string) => {
      setNotes((prev) => {
        const next = { ...prev, [dateStr]: text };
        setAttendance((prevAttendance) => {
          setLogs((prevLogs) => {
            setGoals((prevGoals) => {
              persist(prevAttendance, prevLogs, prevGoals, next);
              return prevGoals;
            });
            return prevLogs;
          });
          return prevAttendance;
        });
        return next;
      });
    },
    [persist]
  );

  const getAllLogsForExercise = useCallback(
    (exerciseName: string): { date: string; sets: SetEntry[] }[] => {
      const results: { date: string; sets: SetEntry[] }[] = [];
      for (const [date, entries] of Object.entries(logs)) {
        for (const entry of entries) {
          if (entry.exerciseName === exerciseName) {
            results.push({ date, sets: entry.sets });
          }
        }
      }
      return results.sort((a, b) => a.date.localeCompare(b.date));
    },
    [logs]
  );

  const getLog = useCallback(
    (dateStr: string): ExerciseLogEntry[] | undefined => {
      return logs[dateStr];
    },
    [logs]
  );

  // Find the most recent log for the same workout type (skipping today)
  const getPreviousLog = useCallback(
    (todayStr: string): ExerciseLogEntry[] | undefined => {
      const todayDate = new Date(todayStr + "T00:00:00");
      const todayType: WorkoutType = WEEKLY_SCHEDULE[todayDate.getDay()];
      if (todayType === "rest") return undefined;

      // Walk backward up to 60 days to find the last session of the same type
      const cursor = new Date(todayDate);
      for (let i = 0; i < 60; i++) {
        cursor.setDate(cursor.getDate() - 1);
        const ds = toDateStr(cursor);
        const dayType = WEEKLY_SCHEDULE[cursor.getDay()];
        if (dayType === todayType && logs[ds]) {
          return logs[ds];
        }
      }
      return undefined;
    },
    [logs]
  );

  const stats = useMemo(() => computeStats(attendance), [attendance]);

  return {
    hydrated,
    attendance,
    logs,
    goals,
    notes,
    stats,
    toggleAttendance,
    markAttended,
    saveLog,
    getLog,
    getPreviousLog,
    setGoal,
    getAllLogsForExercise,
    getNote,
    saveNote,
  };
}
