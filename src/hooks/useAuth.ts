import { useAuthStore } from '../store/authStore.ts';

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const loading = useAuthStore((s) => s.loading);
  const updateUserDisplayName = useAuthStore((s) => s.updateUserDisplayName);
  const updatePreferredLanguage = useAuthStore((s) => s.updatePreferredLanguage);

  return {
    user,
    profile,
    isLoggedIn,
    loading,
    updateUserDisplayName,
    updatePreferredLanguage,
  };
}
