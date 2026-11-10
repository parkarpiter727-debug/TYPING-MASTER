import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTimerOptions {
  mode: 'countdown' | 'elapsed';
  initialDurationSeconds?: number;
  onTimeUp?: () => void;
}

export function useTimer({
  mode,
  initialDurationSeconds = 60,
  onTimeUp,
}: UseTimerOptions) {
  const [timeLeft, setTimeLeft] = useState(initialDurationSeconds);
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(
    (newDuration?: number) => {
      setIsRunning(false);
      const duration = newDuration ?? initialDurationSeconds;
      setTimeLeft(duration);
      setElapsed(0);
    },
    [initialDurationSeconds]
  );

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      if (mode === 'countdown') {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsRunning(false);
            if (onTimeUpRef.current) {
              onTimeUpRef.current();
            }
            return 0;
          }
          return prev - 1;
        });
        setElapsed((prev) => prev + 1);
      } else {
        setElapsed((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, mode]);

  return {
    timeLeft,
    elapsed,
    isRunning,
    start,
    stop,
    reset,
  };
}
