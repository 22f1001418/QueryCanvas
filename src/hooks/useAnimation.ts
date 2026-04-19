import { useState, useCallback, useRef, useEffect } from 'react';

export function useAnimation(maxSteps: number, interval = 800) {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
    clearTimer();
  }, [clearTimer]);

  const reset = useCallback(() => {
    pause();
    setStep(0);
  }, [pause]);

  const next = useCallback(() => {
    setStep((s) => Math.min(s + 1, maxSteps));
  }, [maxSteps]);

  const prev = useCallback(() => {
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setStep((s) => {
          if (s >= maxSteps) {
            setIsPlaying(false);
            return s;
          }
          return s + 1;
        });
      }, interval);
    }
    return clearTimer;
  }, [isPlaying, maxSteps, interval, clearTimer]);

  useEffect(() => {
    if (step >= maxSteps) {
      setIsPlaying(false);
      clearTimer();
    }
  }, [step, maxSteps, clearTimer]);

  return { step, isPlaying, play, pause, reset, next, prev, setStep };
}
