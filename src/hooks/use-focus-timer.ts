"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UseFocusTimerOptions {
  duration: number; // total seconds
  onComplete: () => void;
}

interface UseFocusTimerReturn {
  elapsed: number;
  remaining: number;
  progress: number; // 0 to 1
  isRunning: boolean;
  isPaused: boolean;
  isComplete: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

export function useFocusTimer({ duration, onComplete }: UseFocusTimerOptions): UseFocusTimerReturn {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    setElapsed(0);
    setIsRunning(true);
    setIsPaused(false);
    setIsComplete(false);
  }, []);

  const pause = useCallback(() => {
    clearTimer();
    setIsPaused(true);
    setIsRunning(false);
  }, [clearTimer]);

  const resume = useCallback(() => {
    setIsPaused(false);
    setIsRunning(true);
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setElapsed(0);
    setIsRunning(false);
    setIsPaused(false);
    setIsComplete(false);
  }, [clearTimer]);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (next >= duration) {
          clearTimer();
          setIsRunning(false);
          setIsComplete(true);
          setTimeout(() => onCompleteRef.current(), 0);
          return duration;
        }
        return next;
      });
    }, 1000);

    return clearTimer;
  }, [isRunning, duration, clearTimer]);

  return {
    elapsed,
    remaining: Math.max(0, duration - elapsed),
    progress: Math.min(1, elapsed / duration),
    isRunning,
    isPaused,
    isComplete,
    start,
    pause,
    resume,
    reset,
  };
}
