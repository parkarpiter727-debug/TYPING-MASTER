import { supabase, isSupabaseConfigured } from './supabase.ts';
import { CustomSession } from '../types/index.ts';

const LOCAL_STORAGE_KEY = 'typemaster_custom_sessions';

function getLocalCustomSessions(): CustomSession[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCustomSessions(items: CustomSession[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
}

export async function insertCustomSession(
  session: Omit<CustomSession, 'id' | 'created_at'>
): Promise<CustomSession> {
  const fullSession: CustomSession = {
    ...session,
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('custom_sessions')
        .insert([fullSession])
        .select()
        .single();
      if (!error && data) return data as CustomSession;
    } catch {
      // fallback
    }
  }

  const all = getLocalCustomSessions();
  all.unshift(fullSession);
  saveLocalCustomSessions(all);
  return fullSession;
}
