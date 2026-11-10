import { supabase, isSupabaseConfigured } from './supabase.ts';
import { LessonCompletion } from '../types/index.ts';

const LOCAL_STORAGE_KEY = 'typemaster_lesson_completions';

function getLocalCompletions(): LessonCompletion[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCompletions(items: LessonCompletion[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
}

export async function upsertLessonCompletion(
  completion: Omit<LessonCompletion, 'id' | 'completed_at'>
): Promise<LessonCompletion> {
  const fullItem: LessonCompletion = {
    ...completion,
    id: `comp-${completion.user_id}-${completion.lesson_id}`,
    completed_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('lesson_completions')
        .upsert(fullItem, { onConflict: 'user_id,lesson_id' })
        .select()
        .single();
      if (!error && data) return data as LessonCompletion;
    } catch {
      // fallback
    }
  }

  const all = getLocalCompletions();
  const existingIdx = all.findIndex(
    (c) => c.user_id === completion.user_id && c.lesson_id === completion.lesson_id
  );

  if (existingIdx >= 0) {
    // Keep best score
    const existing = all[existingIdx];
    if (fullItem.wpm >= existing.wpm) {
      all[existingIdx] = fullItem;
    }
  } else {
    all.push(fullItem);
  }

  saveLocalCompletions(all);
  return fullItem;
}

export async function getUserCompletions(userId: string): Promise<LessonCompletion[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('lesson_completions')
        .select('*')
        .eq('user_id', userId);
      if (!error && data) return data as LessonCompletion[];
    } catch {
      // fallback
    }
  }

  const all = getLocalCompletions();
  return all.filter((c) => c.user_id === userId);
}
