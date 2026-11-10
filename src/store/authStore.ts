import { create } from 'zustand';
import { User, Profile, Language } from '../types/index.ts';
import { getProfile, updateProfile } from '../lib/profileService.ts';

interface AuthState {
  user: User;
  profile: Profile | null;
  loading: boolean;
  isLoggedIn: boolean;
  initAuth: () => Promise<void>;
  updateUserDisplayName: (name: string) => Promise<void>;
  updatePreferredLanguage: (lang: Language) => Promise<void>;
}

const LOCAL_USER_ID = 'local-user';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: {
    id: LOCAL_USER_ID,
    email: '',
    user_metadata: { display_name: 'Pro Typist' },
  },
  profile: null,
  loading: false,
  isLoggedIn: true,

  initAuth: async () => {
    try {
      const profile = await getProfile(LOCAL_USER_ID);
      const displayName = profile?.display_name || 'Pro Typist';
      set({
        user: {
          id: LOCAL_USER_ID,
          email: '',
          user_metadata: { display_name: displayName },
        },
        profile,
        loading: false,
        isLoggedIn: true,
      });
    } catch {
      set({ loading: false, isLoggedIn: true });
    }
  },

  updateUserDisplayName: async (name: string) => {
    const updated = await updateProfile(LOCAL_USER_ID, { display_name: name });
    set({
      user: {
        id: LOCAL_USER_ID,
        email: '',
        user_metadata: { display_name: name },
      },
      profile: updated,
    });
  },

  updatePreferredLanguage: async (lang: Language) => {
    const updated = await updateProfile(LOCAL_USER_ID, { preferred_language: lang });
    set({ profile: updated });
  },
}));
