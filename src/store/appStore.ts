import { create } from 'zustand';
import { ThemeMode } from '../theme/types';

type Language = 'en' | 'vi';

interface AppState {
  theme: ThemeMode;
  language: Language;
  loading: boolean;
  setTheme: (theme: ThemeMode) => void;
  setLanguage: (language: Language) => void;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'light',
  language: 'en',
  loading: false,

  // Set theme
  setTheme: (theme: ThemeMode) => set({ theme }),

  // Set language
  setLanguage: (language: Language) => set({ language }),

  // Set loading state
  setLoading: (loading: boolean) => set({ loading }),
}));

