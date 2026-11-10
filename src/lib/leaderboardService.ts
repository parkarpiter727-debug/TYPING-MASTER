import { supabase, isSupabaseConfigured } from './supabase.ts';
import { LeaderboardEntry, Language } from '../types/index.ts';
import { INITIAL_ENGLISH_LEADERBOARD, INITIAL_URDU_LEADERBOARD } from './mockData.ts';
import { getUserTestHistory } from './testResultsService.ts';
import { getProfile } from './profileService.ts';

export async function getLeaderboard(
  language: Language = 'english',
  period: 'all_time' | 'this_week' = 'all_time',
  currentUserId?: string
): Promise<{ entries: LeaderboardEntry[]; userRank?: LeaderboardEntry }> {
  let list: LeaderboardEntry[] = [];

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.rpc('get_leaderboard', {
        lang: language,
        period: period,
      });
      if (!error && data && Array.isArray(data)) {
        list = data.map((d: any, idx: number) => ({
          rank: idx + 1,
          user_id: d.user_id,
          display_name: d.display_name,
          best_wpm: Number(d.best_wpm),
          avg_accuracy: Number(d.avg_accuracy),
          tests_count: Number(d.tests_count),
        }));
      }
    } catch {
      // fallback
    }
  }

  if (list.length === 0) {
    // Combine mock base leaderboard with any local tests taken by current user
    const baseList = language === 'english'
      ? [...INITIAL_ENGLISH_LEADERBOARD]
      : [...INITIAL_URDU_LEADERBOARD];

    list = baseList;

    if (currentUserId) {
      const history = await getUserTestHistory(currentUserId, 50);
      const langTests = history.filter((h) => h.language === language);
      if (langTests.length > 0) {
        const bestWpm = Math.max(...langTests.map((t) => Number(t.wpm)));
        const avgAcc =
          langTests.reduce((s, t) => s + Number(t.accuracy), 0) / langTests.length;
        const profile = await getProfile(currentUserId);
        const userEntry: LeaderboardEntry = {
          rank: 0,
          user_id: currentUserId,
          display_name: profile?.display_name || 'You',
          best_wpm: Math.round(bestWpm * 10) / 10,
          avg_accuracy: Math.round(avgAcc * 10) / 10,
          tests_count: langTests.length,
        };

        const existingIdx = list.findIndex((e) => e.user_id === currentUserId);
        if (existingIdx >= 0) {
          list[existingIdx] = userEntry;
        } else {
          list.push(userEntry);
        }

        // Re-sort and re-rank
        list.sort((a, b) => b.best_wpm - a.best_wpm);
        list = list.map((item, idx) => ({ ...item, rank: idx + 1 }));
      }
    }
  }

  // Filter for weekly if needed (mock variation)
  if (period === 'this_week') {
    list = list.map((item) => ({
      ...item,
      best_wpm: Math.round((item.best_wpm * 0.96) * 10) / 10,
    })).sort((a, b) => b.best_wpm - a.best_wpm).map((e, idx) => ({ ...e, rank: idx + 1 }));
  }

  let userRank: LeaderboardEntry | undefined;
  if (currentUserId) {
    userRank = list.find((e) => e.user_id === currentUserId);
  }

  return { entries: list.slice(0, 100), userRank };
}
