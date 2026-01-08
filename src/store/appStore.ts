import { create } from 'zustand';
import * as Localization from 'expo-localization';
import { ThemeMode } from '../shared/theme';
import { SupportedLanguage } from '../shared/i18n';

const getInitialLanguage = (): SupportedLanguage => {
  const locale = Localization.locale ?? 'en';
  return locale.toLowerCase().startsWith('vi') ? 'vi' : 'en';
};

interface AppState {
  theme: ThemeMode;
  language: SupportedLanguage;
  loading: boolean;
  setTheme: (theme: ThemeMode) => void;
  setLanguage: (language: SupportedLanguage) => void;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'light',
  language: getInitialLanguage(),
  loading: false,

  // Set theme
  setTheme: (theme: ThemeMode) => set({ theme }),

  // Set language
  setLanguage: (language: SupportedLanguage) => set({ language }),

  // Set loading state
  setLoading: (loading: boolean) => set({ loading }),
}));

