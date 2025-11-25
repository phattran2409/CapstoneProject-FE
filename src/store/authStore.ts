import { create } from 'zustand';

interface User {
  email: string;
  name: string;
  token?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  token: null,

  // Login action
  login: (userData: User) => {
    set({
      user: userData,
      isAuthenticated: true,
      token: userData.token || 'mock-token',
    });
  },

  // Logout action
  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
      token: null,
    });
  },

  // Update user profile
  updateUser: (userData: Partial<User>) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null,
    }));
  },

  // Set token
  setToken: (token: string) => {
    set({ token });
  },
}));

