export type Language = 'english' | 'urdu';
export type Theme = 'dark' | 'light';
export type LessonLevel = 'beginner' | 'intermediate' | 'advanced';

export interface User {
  id: string;
  email: string;
  user_metadata?: {
    display_name?: string;
  };
}

export interface Profile {
  id: string;
  display_name: string;
  preferred_language: Language;
  created_at: string;
  updated_at: string;
}

export interface TestResult {
  id: string;
  user_id: string;
  language: Language;
  duration_seconds: number;
  wpm: number;
  accuracy: number;
  errors: number;
  characters_typed: number;
  correct_characters: number;
  created_at: string;
}

export interface LessonCompletion {
  id: string;
  user_id: string;
  lesson_id: string;
  language: Language;
  level: LessonLevel;
  wpm: number;
  accuracy: number;
  errors: number;
  stars: number; // 1 | 2 | 3
  completed_at: string;
}

export interface CustomSession {
  id: string;
  user_id: string;
  language: Language;
  text_length: number;
  wpm: number;
  accuracy: number;
  errors: number;
  time_taken_seconds: number;
  created_at: string;
}

export interface DailyStreak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_active_date?: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  title: string;
  level: LessonLevel;
  language: Language;
  description: string;
  text: string;
  estimatedMinutes: number;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  display_name: string;
  best_wpm: number;
  avg_accuracy: number;
  tests_count: number;
}

export interface TypingStats {
  wpm: number;
  accuracy: number;
  errors: number;
  correctChars: number;
  totalTyped: number;
  elapsedSeconds: number;
  improvementVsLast?: number;
}

export type CharStatus = 'correct' | 'error' | 'current' | 'upcoming';
