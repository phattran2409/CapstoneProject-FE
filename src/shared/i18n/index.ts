import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './locales/en';
import vi from './locales/vi';

export type SupportedLanguage = 'en' | 'vi';

export const resources = {
  en: { translation: en },
  vi: { translation: vi },
};

const getDeviceLanguage = (): SupportedLanguage => {
  const locale = Localization.locale ?? 'en';
  return locale.toLowerCase().startsWith('vi') ? 'vi' : 'en';
};

// Default to Vietnamese for new installations
const defaultLanguage: SupportedLanguage = 'vi';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  resources,
  lng: defaultLanguage,
  fallbackLng: 'vi',
  interpolation: {
    escapeValue: false,
  },
});

export const changeLanguage = (language: SupportedLanguage) => {
  i18n.changeLanguage(language);
};

export default i18n;

