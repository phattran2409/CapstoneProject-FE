import { create } from 'zustand';
import type { User } from '../types/auth.types';

/**
 * Auth Store
 * Manages authentication state
 * Note: This is client-side state only
 * Server state (user profile) is managed by React Query
 */
interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  reset: () => void;
}

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,

  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user 
  }),

  setToken: (token) => set({ token }),

  reset: () => set(initialState),
}));

