import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../types/auth.types';

/**
 * Auth Store
 * Manages authentication state with persistence
 * User session survives app restarts
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,

      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user && user?.isEmailVerified === true
      }),

      setToken: (token) => set({ token }),

      reset: () => set(initialState),
    }),
    {
      name: 'auth-storage', // Key trong AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
      // Chỉ persist những field cần thiết
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

