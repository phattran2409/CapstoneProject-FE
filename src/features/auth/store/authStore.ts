import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { User } from "../types/auth.types";

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
  /** Set after email/Google login; HomeScreen shows welcome toast then clears (not persisted). */
  pendingLoginSuccessToast: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setPendingLoginSuccessToast: (pending: boolean) => void;
  updateUserAvatar: (avatarUrl: string) => void;
  reset: () => void;
}

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  pendingLoginSuccessToast: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user && user?.isEmailVerified === true,
        }),

      setToken: (token) => set({ token }),

      setPendingLoginSuccessToast: (pending) =>
        set({ pendingLoginSuccessToast: pending }),

      updateUserAvatar: (avatarUrl) =>
        set((state) => ({
          user: state.user ? { ...state.user, avatarUrl } : null,
        })),

      reset: () => set(initialState),
    }),
    {
      name: "auth-storage", // Key trong AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
      // Chỉ persist những field cần thiết
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        // pendingLoginSuccessToast intentionally omitted — session-only UI flag
      }),
    },
  ),
);
