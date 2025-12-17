import React from 'react';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from '@/theme/ThemeContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <QueryProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </QueryProvider>
  );
};

export { QueryProvider };
export { ThemeProvider };

