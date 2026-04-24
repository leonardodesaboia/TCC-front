import { create } from 'zustand';
import { AUTH_BYPASS_ENABLED } from '@/lib/constants/config';
import type { User } from '@/types/user';
import { UserRole } from '@/types/user';
import { authApi } from '@/lib/api/auth';
import {
  ACCESS_TOKEN_KEY,
  clearStoredTokens,
  getStoredValue,
} from '@/lib/utils/token-storage';

function createBypassUser(): User {
  return {
    id: 'dev-client',
    name: 'Cliente Demo',
    email: 'cliente.demo@allset.local',
    phone: '85999999999',
    role: UserRole.CLIENT,
    birthDate: '1996-04-24',
    isActive: true,
    createdAt: '2026-04-24T00:00:00.000Z',
    updatedAt: '2026-04-24T00:00:00.000Z',
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  setUser: (user: User | null) => void;
  initialize: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  initialize: async () => {
    try {
      const token = await getStoredValue(ACCESS_TOKEN_KEY);
      if (!token) {
        set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });
        return;
      }
      const user = await authApi.getProfile();
      set({ user, isAuthenticated: true, isLoading: false, isInitialized: true });
    } catch {
      await clearStoredTokens();
      set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });
    }
  },

  logout: async () => {
    try {
      if (!AUTH_BYPASS_ENABLED) {
        await authApi.logout();
      }
    } finally {
      await clearStoredTokens();
      set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });
    }
  },

  refreshUser: async () => {
    if (AUTH_BYPASS_ENABLED) {
      const user = createBypassUser();
      set({ user, isAuthenticated: true, isLoading: false, isInitialized: true });
      return;
    }

    const user = await authApi.getProfile();
    set({ user, isAuthenticated: true });
  },
}));

export const selectUser = (s: AuthState) => s.user;
export const selectIsClient = (s: AuthState) => s.user?.role === UserRole.CLIENT;
export const selectIsProfessional = (s: AuthState) => s.user?.role === UserRole.PROFESSIONAL;
export { createBypassUser };
