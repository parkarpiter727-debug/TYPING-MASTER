import { supabase, isSupabaseConfigured } from './supabase.ts';
import { Profile, Language } from '../types/index.ts';

const LOCAL_STORAGE_KEY_PREFIX = 'typemaster_profile_';

export async function getProfile(userId: string): Promise<Profile | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error && data) return data as Profile;
    } catch {
      // Fallback to local storage
    }
  }

  const stored = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  // Default fallback profile
  const defaultProfile: Profile = {
    id: userId,
    display_name: 'Pro Typist',
    preferred_language: 'english',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(defaultProfile));
  return defaultProfile;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, 'display_name' | 'preferred_language'>>
): Promise<Profile> {
  const current = (await getProfile(userId)) || {
    id: userId,
    display_name: 'Pro Typist',
    preferred_language: 'english' as Language,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const updated: Profile = {
    ...current,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);
    } catch {
      // ignore
    }
  }

  localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(updated));
  return updated;
}
