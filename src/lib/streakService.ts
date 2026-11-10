import { supabase, isSupabaseConfigured } from './supabase.ts';
import { DailyStreak } from '../types/index.ts';

const LOCAL_STORAGE_KEY_PREFIX = 'typemaster_streak_';

function getLocalDateString(d: Date = new Date()): string {
  return d.toISOString().split('T')[0];
}

export async function getStreak(userId: string): Promise<DailyStreak> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('daily_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (!error && data) return data as DailyStreak;
    } catch {
      // fallback
    }
  }

  const stored = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }

  const initialStreak: DailyStreak = {
    user_id: userId,
    current_streak: 1,
    longest_streak: 1,
    last_active_date: getLocalDateString(),
    updated_at: new Date().toISOString(),
  };
  localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(initialStreak));
  return initialStreak;
}

export async function updateStreak(userId: string): Promise<DailyStreak> {
  const current = await getStreak(userId);
  const todayStr = getLocalDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  let newCurrent = current.current_streak;
  if (!current.last_active_date) {
    newCurrent = 1;
  } else if (current.last_active_date === todayStr) {
    // already active today
    newCurrent = current.current_streak;
  } else if (current.last_active_date === yesterdayStr) {
    newCurrent += 1;
  } else {
    // streak broken
    newCurrent = 1;
  }

  const newLongest = Math.max(current.longest_streak, newCurrent);

  const updated: DailyStreak = {
    user_id: userId,
    current_streak: newCurrent,
    longest_streak: newLongest,
    last_active_date: todayStr,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('daily_streaks')
        .upsert(updated, { onConflict: 'user_id' });
    } catch {
      // ignore
    }
  }

  localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(updated));
  return updated;
}
