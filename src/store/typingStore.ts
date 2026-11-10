import { create } from 'zustand';
import { TypingStats } from '../types/index.ts';
import { calculateWPM, calculateAccuracy } from '../lib/typingUtils.ts';

interface TypingStoreState {
  originalText: string;
  typedChars: string[];
  currentIndex: number;
  correctChars: number;
  errorsCount: number;
  startTime: number | null;
  isActive: boolean;
  isComplete: boolean;
  elapsedSeconds: number;

  initSession: (text: string) => void;
  handleInput: (inputChar: string) => void;
  handleBackspace: () => void;
  tickTimer: () => void;
  endSession: () => void;
  resetSession: () => void;
  getStats: () => TypingStats;
}

export const useTypingStore = create<TypingStoreState>((set, get) => ({
  originalText: '',
  typedChars: [],
  currentIndex: 0,
  correctChars: 0,
  errorsCount: 0,
  startTime: null,
  isActive: false,
  isComplete: false,
  elapsedSeconds: 0,

  initSession: (text: string) => {
    // Clean string (normalize whitespace/spaces)
    const normalized = text.replace(/[\r\n]+/g, ' ').trim();
    set({
      originalText: normalized,
      typedChars: [],
      currentIndex: 0,
      correctChars: 0,
      errorsCount: 0,
      startTime: null,
      isActive: false,
      isComplete: false,
      elapsedSeconds: 0,
    });
  },

  handleInput: (inputChar: string) => {
    const { originalText, currentIndex, typedChars, isActive, startTime, errorsCount } = get();
    if (currentIndex >= originalText.length || get().isComplete) return;

    const now = Date.now();
    const actualStartTime = startTime ?? now;

    const expectedChar = originalText[currentIndex];
    const isCorrect = inputChar === expectedChar;

    const newTyped = [...typedChars, inputChar];
    const nextIndex = currentIndex + 1;
    const newCorrect = isCorrect ? get().correctChars + 1 : get().correctChars;
    const newErrors = isCorrect ? errorsCount : errorsCount + 1;
    const complete = nextIndex >= originalText.length;

    set({
      typedChars: newTyped,
      currentIndex: nextIndex,
      correctChars: newCorrect,
      errorsCount: newErrors,
      startTime: actualStartTime,
      isActive: !complete,
      isComplete: complete,
    });
  },

  handleBackspace: () => {
    const { currentIndex, typedChars, originalText, correctChars, isComplete } = get();
    if (currentIndex <= 0 || isComplete) return;

    const lastIdx = currentIndex - 1;
    const wasCorrect = typedChars[lastIdx] === originalText[lastIdx];

    set({
      typedChars: typedChars.slice(0, -1),
      currentIndex: lastIdx,
      correctChars: wasCorrect ? Math.max(0, correctChars - 1) : correctChars,
    });
  },

  tickTimer: () => {
    const { startTime, isActive, isComplete } = get();
    if (!isActive || isComplete || !startTime) return;
    const elapsed = Math.max(1, Math.floor((Date.now() - startTime) / 1000));
    set({ elapsedSeconds: elapsed });
  },

  endSession: () => {
    set({ isActive: false, isComplete: true });
  },

  resetSession: () => {
    const { originalText } = get();
    get().initSession(originalText);
  },

  getStats: () => {
    const { correctChars, typedChars, elapsedSeconds, errorsCount } = get();
    const totalTyped = typedChars.length;
    const wpm = calculateWPM(correctChars, elapsedSeconds);
    const accuracy = calculateAccuracy(correctChars, totalTyped);

    return {
      wpm,
      accuracy,
      errors: errorsCount,
      correctChars,
      totalTyped,
      elapsedSeconds,
    };
  },
}));
