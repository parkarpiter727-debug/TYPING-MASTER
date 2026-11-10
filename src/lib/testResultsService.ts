import { supabase, isSupabaseConfigured } from './supabase.ts';
import { TestResult, Language } from '../types/index.ts';

const LOCAL_STORAGE_KEY = 'typemaster_test_results';

function getLocalResults(): TestResult[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalResults(results: TestResult[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(results));
}

export async function insertTestResult(result: Omit<TestResult, 'id' | 'created_at'>): Promise<TestResult> {
  const fullResult: TestResult = {
    ...result,
    id: `res-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('test_results')
        .insert([fullResult])
        .select()
        .single();
      if (!error && data) return data as TestResult;
    } catch {
      // fallback to local
    }
  }

  const all = getLocalResults();
  all.unshift(fullResult);
  saveLocalResults(all);
  return fullResult;
}

export async function getUserTestHistory(userId: string, limit = 20): Promise<TestResult[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('test_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (!error && data) return data as TestResult[];
    } catch {
      // fallback
    }
  }

  const all = getLocalResults();
  return all
    .filter((r) => r.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}

export async function getUserStats(userId: string): Promise<{
  bestWpm: number;
  avgAccuracy: number;
  totalTests: number;
  englishTests: number;
  urduTests: number;
  history: TestResult[];
}> {
  const history = await getUserTestHistory(userId, 100);
  if (history.length === 0) {
    return {
      bestWpm: 0,
      avgAccuracy: 0,
      totalTests: 0,
      englishTests: 0,
      urduTests: 0,
      history: [],
    };
  }

  const bestWpm = Math.max(...history.map((r) => Number(r.wpm)));
  const totalAcc = history.reduce((sum, r) => sum + Number(r.accuracy), 0);
  const avgAccuracy = Math.round((totalAcc / history.length) * 10) / 10;
  const englishTests = history.filter((r) => r.language === 'english').length;
  const urduTests = history.filter((r) => r.language === 'urdu').length;

  return {
    bestWpm,
    avgAccuracy,
    totalTests: history.length,
    englishTests,
    urduTests,
    history,
  };
}
