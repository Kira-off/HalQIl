import { StateCreator } from 'zustand';
import type { AppState, AuthSlice } from '../useAppStore';
import { User } from '../../types';
import { Role } from '../../types/enums';

const getInitialAuth = () => {
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem('user');
    if (stored) {
      try {
        const u = JSON.parse(stored) as User;
        return { user: u, role: u.role };
      } catch {
        // Fallback
      }
    }
  }
  return { user: null, role: null };
};

const initialAuth = getInitialAuth();

export const createAuthSlice: StateCreator<
  AppState,
  [],
  [],
  AuthSlice
> = (set) => ({
  user: initialAuth.user,
  role: initialAuth.role,
  setUser: (user: User) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('user', JSON.stringify(user));
    }
    set({ user, role: user.role });
  },
  clearUser: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('user');
    }
    set({ user: null, role: null });
  },
  setRole: (role: Role | null) => set({ role }),
});
